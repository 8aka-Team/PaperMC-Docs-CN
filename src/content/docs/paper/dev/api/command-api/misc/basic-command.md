---
title: 基本命令
description: 使用 Brigadier 的 Bukkit 风格命令声明概述。
slug: paper/dev/command-api/misc/basic-command
version: 1.21.1
---

对于非常简单的命令，Paper 提供了一种通过实现 [`BasicCommand`](jd:paper:io.papermc.paper.command.brigadier.BasicCommand) 接口来声明 Bukkit 风格命令的方法。

这个接口有一个方法，你必须重写：
- `void execute(CommandSourceStack source, String[] args)`

还有三个可选方法，你可以重写，但不是必须的：
- `Collection<String> suggest(CommandSourceStack source, String[] args)`
- `boolean canUse(CommandSender sender)`
- `@Nullable String permission()`

## 简单用法
实现 `execute` 方法后，你的类可能如下所示：
```java title="YourCommand.java"
package your.package.name;

import io.papermc.paper.command.brigadier.BasicCommand;
import io.papermc.paper.command.brigadier.CommandSourceStack;
import org.jspecify.annotations.NullMarked;

@NullMarked
public class YourCommand implements BasicCommand {

    @Override
    public void execute(CommandSourceStack source, String[] args) {

    }
}
```

通过 `CommandSourceStack`，你可以获取有关命令发送者的基本信息、命令发送的位置以及命令执行的实体。
你可以在 [我们的命令执行器页面](/paper/dev/command-api/basics/executors) 上找到更多信息。

## 可选方法
你可以自由选择是否实现上述提到的可选方法。以下是对每个方法的简要概述：

### `suggest(CommandSourceStack, String[])`
该方法返回一个 `Collection<String>` 类型的对象，并接收一个 `CommandSourceStack` 和一个 `String[] args` 作为参数。
这类似于 Bukkit 命令中 `TabCompleter` 接口的 `onTabComplete(CommandSender, Command, String, String[])` 方法，用于提供命令的自动补全功能。

返回的集合中的每个条目都将被发送到客户端，以作为建议显示，这与 Bukkit 命令的自动补全功能类似。

### `canUse(CommandSender)`
通过这个方法，你可以为 Brigadier 命令设置一个基本的 `requires` 结构。[你可以在这里了解更多](/paper/dev/command-api/basics/requirements)。
这个方法返回一个 `boolean` 值，只有返回 `true`，命令发送者才能执行该命令。

:::note[注意]

如果你重写了这个方法，那么重写 `permission()` 方法将没有任何作用。
这是因为默认实现使用了 `permission()` 的返回值，而如果你重写了它，这个返回值将不再被使用。

```java title="BasicCommand.java"
default boolean canUse(final CommandSender sender) {
    final String permission = this.permission();
    return permission == null || sender.hasPermission(permission);
}
```

:::

### `permission()`
通过 `permission` 方法，你可以类似于 `canUse` 方法，设置执行和查看此命令所需的权限。

## 注册基础命令
注册一个 `BasicCommand` 非常简单：在你的插件主类中，你可以在 `onEnable` 方法中调用其中一个
[`registerCommand(...)`](jd:paper:org.bukkit.plugin.java.JavaPlugin#registerCommand(java.lang.String,io.papermc.paper.command.brigadier.BasicCommand))
方法。

```java title="YourPlugin.java"
public class YourPlugin extends JavaPlugin {

    @Override
    public void onEnable() {
        BasicCommand yourCommand = ...;
        registerCommand("mycommand", yourCommand);
    }
}
```

### 基础命令是函数式接口
由于你只需要重写一个方法，因此可以直接传递一个 lambda 表达式。
然而，出于风格原因，这种做法并不推荐，因为它会使代码更难阅读。

```java
@Override
public void onEnable() {
    registerCommand(
        "quickcmd",
        (source, args) -> source.getSender().sendRichMessage("<yellow>你好!")
    );
}
```

## 示例：广播命令
以一个简单的广播命令为例，我们首先声明一个实现了 `BasicCommand` 接口并覆盖了 `execute` 和 `permission` 方法的类：

```java title="BroadcastCommand.java"
package your.package.name;

import io.papermc.paper.command.brigadier.BasicCommand;
import io.papermc.paper.command.brigadier.CommandSourceStack;
import org.jspecify.annotations.NullMarked;
import org.jspecify.annotations.Nullable;

@NullMarked
public class BroadcastCommand implements BasicCommand {

    @Override
    public void execute(CommandSourceStack source, String[] args) {

    }

    @Override
    public @Nullable String permission() {
        return "example.broadcast.use";
    }
}
```

我们的权限设置为 `example.broadcast.use`。为了给自己这个权限，建议你使用像 [LuckPerms](https://luckperms.net) 这样的插件，或者直接给自己设置为服务器管理员权限。
你也可以将这个权限默认设置为 `true`。关于如何做到这一点，请查看 [plugin.yml 文档](/paper/dev/plugin-yml)。

现在，在我们的 `execute` 方法中，我们可以获取执行该命令的执行者的名称。如果没有找到，我们可以直接获取命令发送者的名称，如下所示：

```java
final Component name = source.getExecutor() != null
    ? source.getExecutor().name()
    : source.getSender().name();
```

这确保了我们涵盖了所有情况，并且即使在使用 `/execute as` 时，命令也能正确工作。

接下来，我们获取所有参数并将它们拼接成一个字符串。
如果没有定义任何参数（即 `args` 的长度为 0），则提示发送者至少需要一个参数才能发送广播：
```java
if (args.length == 0) {
    source.getSender().sendRichMessage("<red>你不能发送一个空的广播！");
    return;
}

final String message = String.join(" ", args);
```

最后，我们可以构建我们的广播消息并通过 `Bukkit.broadcast(Component)` 发送它：

```java
final Component broadcastMessage = MiniMessage.miniMessage().deserialize(
    "<red><bold>BROADCAST</red> <name> <dark_gray>»</dark_gray> <message>",
    Placeholder.component("name", name),
    Placeholder.unparsed("message", message)
);

Bukkit.broadcast(broadcastMessage);
```

完成了！正如你所见，这是一种定义命令的非常简单的方法。以下是我们的类的最终结果：

```java title="BroadcastCommand.java"
package your.package.name;

import io.papermc.paper.command.brigadier.BasicCommand;
import io.papermc.paper.command.brigadier.CommandSourceStack;
import net.kyori.adventure.text.Component;
import net.kyori.adventure.text.minimessage.MiniMessage;
import net.kyori.adventure.text.minimessage.tag.resolver.Placeholder;
import org.bukkit.Bukkit;
import org.jspecify.annotations.NullMarked;
import org.jspecify.annotations.Nullable;

@NullMarked
public class BroadcastCommand implements BasicCommand {

    @Override
    public void execute(CommandSourceStack source, String[] args) {
        final Component name = source.getExecutor() != null
            ? source.getExecutor().name()
            : source.getSender().name();

        if (args.length == 0) {
            source.getSender().sendRichMessage("<red>不能发送空广播！");
            return;
        }

        final String message = String.join(" ", args);
        final Component broadcastMessage = MiniMessage.miniMessage().deserialize(
            "<red><bold>BROADCAST</red> <name> <dark_gray>»</dark_gray> <message>",
            Placeholder.component("name", name),
            Placeholder.unparsed("message", message)
        );

        Bukkit.broadcast(broadcastMessage);
    }

    @Override
    public @Nullable String permission() {
        return "example.broadcast.use";
    }
}
```

注册命令的代码如下所示：

```java title="PluginMainClass.java"
@Override
public void onEnable() {
    registerCommand("broadcast", new BroadcastCommand());
}
```

这是在游戏中的样子：
![](./assets/broadcast-command.png)


### 添加建议
我们的广播命令运行良好，但缺乏建议功能。对于基于文本的命令，最常见的建议类型是玩家名称。
为了提供玩家名称的建议，我们可以将所有在线玩家映射到他们的名称，如下所示：

```java
@Override
public Collection<String> suggest(CommandSourceStack source, String[] args) {
    return Bukkit.getOnlinePlayers().stream().map(Player::getName).toList();
}
```

这运行得很好，但正如你在这里看到的，它总是会建议所有玩家，而不管用户输入是什么，这有时会显得不太自然：
![](./assets/broadcast-suggestions-unfinished.png)

为了修复这一点，我们需要做一些修改：

首先，如果没有任何参数，我们会提前返回我们已经有的内容，因为那时我们无法根据输入进行筛选：

```java
if (args.length == 0) {
    return Bukkit.getOnlinePlayers().stream().map(Player::getName).toList();
}
```

在这之后，我们可以在流中添加一个 `filter` 子句，通过是否以我们的当前输入（即 `args[args.length - 1]`）开头来筛选所有名称：

```java
return Bukkit.getOnlinePlayers().stream()
    .map(Player::getName)
    .filter(name -> name.toLowerCase().startsWith(args[args.length - 1].toLowerCase()))
    .toList();
```

完成了！正如你所见，建议仍然运行良好：
![](./assets/broadcast-suggestions-finished.png)

但如果没有任何玩家的名称以输入开头，它就什么也不会建议：
![](./assets/broadcast-suggestions-none.png)

### 最终代码
这是我们的整个 `BroadcastCommand` 类的最终代码，包括建议：

```java
package your.package.name;

import io.papermc.paper.command.brigadier.BasicCommand;
import io.papermc.paper.command.brigadier.CommandSourceStack;
import net.kyori.adventure.text.Component;
import net.kyori.adventure.text.minimessage.MiniMessage;
import net.kyori.adventure.text.minimessage.tag.resolver.Placeholder;
import org.bukkit.Bukkit;
import org.bukkit.entity.Player;
import org.jspecify.annotations.NullMarked;
import org.jspecify.annotations.Nullable;

import java.util.Collection;

@NullMarked
public class BroadcastCommand implements BasicCommand {

    @Override
    public void execute(CommandSourceStack source, String[] args) {
        final Component name = source.getExecutor() != null
            ? source.getExecutor().name()
            : source.getSender().name();

        if (args.length == 0) {
            source.getSender().sendRichMessage("<red>你不能发送一个空的广播！");
            return;
        }

        final String message = String.join(" ", args);
        final Component broadcastMessage = MiniMessage.miniMessage().deserialize(
            "<red><bold>BROADCAST</red> <name> <dark_gray>»</dark_gray> <message>",
            Placeholder.component("name", name),
            Placeholder.unparsed("message", message)
        );

        Bukkit.broadcast(broadcastMessage);
    }

    @Override
    public @Nullable String permission() {
        return "example.broadcast.use";
    }

    @Override
    public Collection<String> suggest(CommandSourceStack source, String[] args) {
        if (args.length == 0) {
            return Bukkit.getOnlinePlayers().stream().map(Player::getName).toList();
        }

        return Bukkit.getOnlinePlayers().stream()
            .map(Player::getName)
            .filter(name -> name.toLowerCase().startsWith(args[args.length - 1].toLowerCase()))
            .toList();
    }
}
```
