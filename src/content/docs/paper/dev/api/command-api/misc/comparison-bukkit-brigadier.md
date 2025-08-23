---
title: 比较
description: Brigadier 命令和 Bukkit 命令的比较。
slug: paper/dev/command-api/misc/comparison-bukkit-brigadier
---

## 注册命令
### 旧的 Bukkit 方式

为了注册 Bukkit 命令，你需要定义一个继承自 `BukkitCommand` 的类，并实现 `execute(...)` 和 `tabComplete(...)` 方法。
它可能如下所示：
```java title="BukkitPartyCommand.java"
package your.package.name;

import org.bukkit.Bukkit;
import org.bukkit.command.CommandSender;
import org.bukkit.command.defaults.BukkitCommand;
import org.bukkit.entity.Player;
import org.jspecify.annotations.NullMarked;

import java.util.List;

@NullMarked
public class BukkitPartyCommand extends BukkitCommand {
    public BukkitPartyCommand(String name, String description, String usageMessage, List<String> aliases) {
        super(name, description, usageMessage, aliases);
    }

    @Override
    public boolean execute(CommandSender sender, String commandLabel, String[] args) {
        if (args.length == 0) {
            sender.sendPlainMessage("请提供一名玩家！");
            return false;
        }

        final Player targetPlayer = Bukkit.getPlayer(args[0]);
        if (targetPlayer == null) {
            sender.sendPlainMessage("请提供一个有效的玩家！");
            return false;
        }

        targetPlayer.sendPlainMessage(sender.getName() + " started partying with you!");
        sender.sendPlainMessage("您现在正在与 " + targetPlayer.getName() + "!");
        return true;
    }

    @Override
    public List<String> tabComplete(CommandSender sender, String alias, String[] args) throws IllegalArgumentException {
        if (args.length == 1) {
            return Bukkit.getOnlinePlayers().stream().map(Player::getName).toList();
        }

        return List.of();
    }
}
```

之后，你可以这样定义你的命令：

```java title="PluginClass.java"
this.getServer().getCommandMap().register(
    this.getName().toLowerCase(),
    new BukkitPartyCommand("bukkitparty", "举办派对", "/bukkitparty <player>", List.of())
);
```

正如您所看到的，为了注册一个非常简单的命令，
您必须进行大量的手动检查。但 Brigadier API 是怎么做到的？

### Paper 新的方式
首先，我们需要获取一个 `LiteralCommandNode<CommandSourceStack>`。这是 Brigadier 的一个特殊类，用于保存某种 [命令树](/paper/dev/command-api/basics/command-tree)。
在我们的例子中，它是我们的命令的根节点。我们可以通过运行 `Commands.literal(final String literal)` 来实现，
它返回一个 `LiteralArgumentBuilder<CommandSourceStack>`，我们可以在其中定义一些参数和执行器。
完成后，我们可以通过调用 `LiteralArgumentBuilder#build()` 来获取构建好的 `LiteralCommandNode`，然后将其注册。
这听起来一开始很复杂，但一旦你在实践中看到它，它看起来就没那么可怕了：

```java title="PaperPartyCommand.java"
public static LiteralCommandNode<CommandSourceStack> createCommand(final String commandName) {
    return Commands.literal(commandName)
        .then(Commands.argument("target", ArgumentTypes.player())
            .executes(ctx -> {
                final PlayerSelectorArgumentResolver playerSelector = ctx.getArgument("target", PlayerSelectorArgumentResolver.class);
                final Player targetPlayer = playerSelector.resolve(ctx.getSource()).getFirst();
                final CommandSender sender = ctx.getSource().getSender();

                targetPlayer.sendPlainMessage(sender.getName() + " started partying with you!");
                sender.sendPlainMessage("你现在正在参加派对 " + targetPlayer.getName() + "!");

                return Command.SINGLE_SUCCESS;
            }))
        .build();
}
```

每个 `.then(...)` 定义了我们树中的一个新分支，
它可以是一个字面量 (`Commands.literal(String)`) 或一个参数 (`Commands.argument(String, ArgumentType<T>)`)。
每个分支可以定义也可以不定义一个 `.executes(Command)` 执行器。这就是所有逻辑发生的地方。

我们将在不同的页面中更详细地探讨这一点，但目前，
我们该如何注册它呢？Paper 使用了一个 `LifecycleEventManager` 系统。
简而言之，这是一个在服务器每次重新加载资源时都会加载的命令（或标签）的注册方式，就像使用 `/reload` 一样。注册我们的命令看起来是这样的：
```java title="PluginClass.java"
this.getLifecycleManager().registerEventHandler(LifecycleEvents.COMMANDS, commands -> {
    commands.registrar().register(PaperPartyCommand.createCommand("paperparty"), "祝你派对愉快");
});
```

我们已经完成了！正如你在这里看到的，这两个命令做的事情是一样的：

<span style="display: flex;">![](./assets/bukkitparty-command.png) ![](./assets/paperparty-command.png)</span>
