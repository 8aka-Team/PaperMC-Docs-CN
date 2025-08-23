---
title: 命令 API
description: 如何在 Velocity 中创建命令
slug: velocity/dev/command-api
---

命令 API 允许你创建可以由连接到代理服务器的玩家或控制台执行的命令。

## 创建命令

每个命令类都需要实现一个 [`Command`](jd:velocity:com.velocitypowered.api.command.Command) 子接口。
选择哪个接口取决于参数的类型和提供给客户端的建议的粒度。这些接口包括：

### [`BrigadierCommand`](jd:velocity:com.velocitypowered.api.command.BrigadierCommand)

在内部，Velocity 使用 [Brigadier](https://github.com/Mojang/brigadier) 库来注册和分发命令操作。
你可以通过将你的 `CommandNode` 包装在 `BrigadierCommand` 中来注册它们。
让我们看一个例子，
这个命令会用浅蓝色文字向执行命令的人显示 `Hello World`。

```java
package com.example.velocityplugin;

import com.mojang.brigadier.arguments.StringArgumentType;
import com.mojang.brigadier.Command;
import com.mojang.brigadier.tree.LiteralCommandNode;
import com.velocitypowered.api.command.BrigadierCommand;
import com.velocitypowered.api.command.CommandSource;
import com.velocitypowered.api.command.VelocityBrigadierMessage;
import com.velocitypowered.api.proxy.ProxyServer;
import net.kyori.adventure.text.Component;
import net.kyori.adventure.text.format.NamedTextColor;

public final class TestBrigadierCommand {

    public static BrigadierCommand createBrigadierCommand(final ProxyServer proxy) {
        LiteralCommandNode<CommandSource> helloNode = BrigadierCommand.literalArgumentBuilder("test")
            // 在这里你可以筛选可以执行命令的主体。
            // 这是进行"hasPermission"检查的理想位置
            .requires(source -> source.hasPermission("test.permission"))
            // 在这里你可以添加在执行"/test"命令时使用的逻辑
            // 不带任何参数
            .executes(context -> {
                // 在这里你获取执行命令的主体
                CommandSource source = context.getSource();

                Component message = Component.text("Hello World", NamedTextColor.AQUA);
                source.sendMessage(message);

                // 返回 Command.SINGLE_SUCCESS 表示执行成功
                // 返回 BrigadierCommand.FORWARD 将命令发送到服务器
                return Command.SINGLE_SUCCESS;
            })
            // 使用"then"方法，你可以为命令添加子参数。
            // 例如，这个子命令将在使用命令"/test <某个参数>"时执行
            // RequiredArgumentBuilder 是一种参数类型，你可以在其中输入某种未定义的数据。
            // 例如，这个例子使用 StringArgumentType.word() 要求输入一个单词，
            // 但你也可以使用 Brigadier 提供的不同 ArgumentType，
            // 它们返回 Boolean、Integer、Float、其他 String 类型等数据
            .then(BrigadierCommand.requiredArgumentBuilder("argument", StringArgumentType.word())
                // 在这里你可以定义在 ArgumentType 不提供提示时要提供的提示。
                // 在这个例子中，提供了所有已连接玩家的名称
                .suggests((ctx, builder) -> {
                    // 在这里我们提供玩家的名字以及一个工具提示，
                    // 它可以用作特定参数的解释或简单的装饰
                    proxy.getAllPlayers().forEach(player -> builder.suggest(
                            player.getUsername(),
                            // VelocityBrigadierMessage 接受一个组件。
                            // 在这种情况下，使用 MiniMessage 创建的彩虹渐变
                            // 提供玩家的名字
                            VelocityBrigadierMessage.tooltip(
                                    MiniMessage.miniMessage().deserialize("<rainbow>" + player.getUsername())
                            )
                    ));
                    // 如果你不需要为提示添加工具提示
                    // 或者你的命令仅针对 Minecraft 1.13 以下版本，
                    // 你可以省略添加工具提示，因为对于较旧的客户端，
                    // 工具提示不会显示。
                    builder.suggest("all");
                    return builder.buildFuture();
                })
                // 在这里执行命令"/test <某个参数>"的逻辑
                .executes(context -> {
                    // 在这里你获取 CommandSource 输入的参数。
                    // 你必须输入与你命名参数时完全相同的名称
                    // 并且必须提供你期望的参数类，在这种情况下是 String
                    String argumentProvided = context.getArgument("argument", String.class);
                    // 这个方法将检查给定的字符串是否对应于
                    // 玩家的名字，如果是，它将向该玩家发送消息
                    proxy.getPlayer(argumentProvided).ifPresent(player ->
                        player.sendMessage(Component.text("Hello!"))
                    );
                    // 返回 Command.SINGLE_SUCCESS 表示执行成功
                    // 返回 BrigadierCommand.FORWARD 将命令发送到服务器
                    return Command.SINGLE_SUCCESS;
                })
            )
            .build();

        // BrigadierCommand 实现了 Command
        return new BrigadierCommand(helloNode);
    }
}
```

Brigadier 命令与 1.12.2 及以下版本完全兼容。

Velocity 不支持自定义插件命令参数类型，因为这需要客户端也支持它们。
我们建议使用 Brigadier 提供的预定义类型。

### [`SimpleCommand`](jd:velocity:com.velocitypowered.api.command.SimpleCommand)

按照 Bukkit 和 BungeeCord 普及的惯例，`SimpleCommand` 有三个方法：
一个用于命令执行时，一个用于提供 tab 补全建议，
一个用于检查 [`CommandSource`](jd:velocity:com.velocitypowered.api.command.CommandSource) 是否有权限使用该命令。
所有方法都接收一个 [`SimpleCommand.Invocation`](jd:velocity:com.velocitypowered.api.command.SimpleCommand$Invocation) 对象，
其中包含执行命令的 `CommandSource` 和作为字符串数组的参数。
前面的例子也可以使用这个接口实现：

```java
package com.example.velocityplugin;

import com.velocitypowered.api.command.CommandSource;
import com.velocitypowered.api.command.SimpleCommand;
import java.util.concurrent.CompletableFuture;
import java.util.List;
import net.kyori.adventure.text.Component;
import net.kyori.adventure.text.format.NamedTextColor;

public final class TestCommand implements SimpleCommand {

    @Override
    public void execute(final Invocation invocation) {
        CommandSource source = invocation.source();
        // 获取命令别名后的参数
        String[] args = invocation.arguments();

        source.sendMessage(Component.text("你好，世界！", NamedTextColor.AQUA));
    }

    // 这个方法允许你控制谁可以执行命令。
    // 如果执行者没有所需的权限，
    // 命令的执行和其自动补全的控制
    // 将直接发送到发送者所在的服务器
    @Override
    public boolean hasPermission(final Invocation invocation) {
        return invocation.source().hasPermission("command.test");
    }

    // 通过这个方法你可以根据 CommandSource 已经写入的参数
    // 或其他你需要的要求来控制要发送的建议
    @Override
    public List<String> suggest(final Invocation invocation) {
        return List.of();
    }

    // 在这里你可以以与前一个方法相同的方式提供参数建议，
    // 但是异步地。建议使用这个方法而不是前一个方法，
    // 特别是在你为提供建议而进行更广泛的逻辑处理的情况下
    @Override
    public CompletableFuture<List<String>> suggestAsync(final Invocation invocation) {
        return CompletableFuture.completedFuture(List.of());
    }
}
```

需要指出的是， [`invocation.arguments()`](jd:velocity:com.velocitypowered.api.command.CommandInvocation#arguments())
不包含命令别名（例如`/teleport foo bar`中的`teleport`）。
如果没有指定任何参数，将传递一个空数组，而不是`null`数组。

如果玩家或控制台执行了以下命令：`/stats Player2 kills`，第一个参数将是`Player2`，
我们可以通过`invocation.arguments()[0]`来访问它，
第二个参数将是`kills`。

### [`RawCommand`](jd:velocity:com.velocitypowered.api.command.RawCommand)

有些情况下你不需要处理参数。这些情况可能包括：

- 类似`/say`的命令，参数包含作为字符串的消息；或者
- 你正在使用外部命令框架来处理你的命令。

原生命令表示代理将直接传递命令别名及其参数，而无需进一步处理。
让我们来看一个回显收到的输入的命令示例：

```java
package com.example.velocityplugin;

import com.velocitypowered.api.command.RawCommand;
import net.kyori.adventure.text.Component;

public final class EchoCommand implements RawCommand {

    @Override
    public void execute(final Invocation invocation) {
        invocation.source().sendMessage(Component.text(invocation.arguments()));
    }

    @Override
    public boolean hasPermission(final Invocation invocation) {
        return invocation.source().hasPermission("command.echo");
    }
}
```

## 注册命令

现在我们已经创建了一个命令，我们需要将其注册，以便它能够正常工作。
为了注册命令，你需要使用 [`CommandManager`](jd:velocity:com.velocitypowered.api.command.CommandManager)。
你可以通过调用 [`proxyServer.getCommandManager()`](jd:velocity:com.velocitypowered.api.proxy.ProxyServer#getCommandManager()) （使用代理实例）
或者在主类中通过 [`@Inject`](https://javadoc.io/doc/com.google.inject/guice/latest/com/google/inject/Inject.html) 注解来注入它，从而获取命令管理器。
注册方法需要两个参数：命令元数据和命令对象。

[`CommandMeta`](jd:velocity:com.velocitypowered.api.command.CommandMeta) 包含不区分大小写的别名和更多高级功能。
`CommandManager` 通过
[`#metaBuilder(String alias)`](jd:velocity:com.velocitypowered.api.command.CommandManager#metaBuilder(java.lang.String)) 方法提供元数据构建器。

```java
package com.example.velocityplugin;

import com.google.inject.Inject;
import com.velocitypowered.api.command.BrigadierCommand;
import com.velocitypowered.api.event.Subscribe;
import com.velocitypowered.api.event.proxy.ProxyInitializeEvent;
import com.velocitypowered.api.plugin.Plugin;
import com.velocitypowered.api.proxy.ProxyServer;

@Plugin(id = "helloworld")
public final class HelloWorldPlugin {
    private final ProxyServer proxy;

    @Inject
    public HelloWorldPlugin(ProxyServer proxy) {
        this.proxy = proxy;
    }

    @Subscribe
    public void onProxyInitialize(ProxyInitializeEvent event) {
        CommandManager commandManager = proxy.getCommandManager();
        // 在这里你可以为命令添加元数据，如别名和它所属的插件（推荐）
        CommandMeta commandMeta = commandManager.metaBuilder("test")
            // 这将为命令"/test"创建一个新的别名
            // 具有相同的参数和功能
            .aliases("otherAlias", "anotherAlias")
            .plugin(this)
            .build();

        // 你可以用"new EchoCommand()"或"new TestCommand()"替换这个
        // SimpleCommand simpleCommand = new TestCommand();
        // RawCommand rawCommand = new EchoCommand();
        // 注册方式相同，因为所有 3 个接口都实现了"Command"
        BrigadierCommand commandToRegister = TestBrigadierCommand.createBrigadierCommand(proxy);

        // 最后，你可以注册命令
        commandManager.register(commandMeta, commandToRegister);
    }
}
```

如果你正在注册一个 `BrigadierCommand`，
你可能更倾向于使用 [`#register(BrigadierCommand)`](jd:velocity:com.velocitypowered.api.command.CommandManager#register(com.velocitypowered.api.command.BrigadierCommand))
方法或 [`#metaBuilder(BrigadierCommand)`](jd:velocity:com.velocitypowered.api.command.CommandManager#metaBuilder(com.velocitypowered.api.command.BrigadierCommand))
来指定额外的别名。
