---
title: 执行器
description: Brigadier 命令的执行逻辑指南。
slug: paper/dev/command-api/basics/executors
---

:::tip[提示]

阅读本页面需要了解[命令树](/paper/dev/command-api/basics/command-tree)和[参数与文字](/paper/dev/command-api/basics/arguments-and-literals)。
如果你还没有阅读这些文章，强烈建议你先查看它们！

:::

本页面专门介绍 `ArgumentBuilder` 类中的 `executes(...)` 方法。

## 检查 `executes` 方法
`executes` 方法定义如下：

```java title="ArgumentBuilder.java"
public T executes(Command<S> command);
```

`Command<S>` 接口被声明为 `FunctionalInterface`。这意味着我们可以不传入一个实现了它的类，而是直接传入一个 lambda 表达式。

```java title="Command.java"
@FunctionalInterface
public interface Command<S> {
    int SINGLE_SUCCESS = 1;

    int run(CommandContext<S> ctx) throws CommandSyntaxException;
}
```

我们的 lambda 有一个参数并返回一个整数。这基本上就是该接口中定义的`run`方法。
那个参数`CommandContext<S>`是我们获取执行该命令的发送者以及所有命令参数的所有信息的地方。
它有很多方法，但对我们来说主要用到的是`S getSource()`和`V getArgument(String, Class<V>)`。
我们在[参数与文字](/paper/dev/command-api/basics/arguments-and-literals)章节中简要地了解了`getArgument(...)`，但简而言之，这是我们可以检索参数的方法。后面会有更具体的示例。

你应该主要注意 `getSource()` 方法旁边的泛型参数 `S`。这是命令源的类型。对于 `executes` 方法，这个类型始终是 `CommandSourceStack`。
该类本身有三个方法：`Location getLocation()`、`CommandSender getSender()` 和 `@Nullable Entity getExecutor()`。
其中最常用的方法是 `getSender()`，因为这是实际运行命令的命令发送者。
对于命令的目标，你应该使用 `getExecutor()`，这在命令是通过 `/execute as <entity> run <our_command>` 运行时是相关的。虽然这不是必须的，但被认为是良好的实践。

## 示例：飞行速度命令
在[参数与文字](/paper/dev/command-api/basics/arguments-and-literals)章节中，我们简要地声明了一个 `/flyspeed` 命令的结构，使用了一个范围内的浮点数参数。
但那个命令实际上并没有设置执行玩家的飞行速度。为了做到这一点，我们需要给它添加一个执行器，如下所示：

```java title="FlightSpeedCommand.java" {5-6}
Commands.literal("flyspeed")
    .then(Commands.argument("speed", FloatArgumentType.floatArg(0, 1.0f))
        .executes(ctx -> {
            float speed = FloatArgumentType.getFloat(ctx, "speed"); // 检索速度参数
            CommandSender sender = ctx.getSource().getSender(); // 检索命令发送者
            Entity executor = ctx.getSource().getExecutor(); // 检索命令执行者，它可能与发送者相同，也可能不同

            // 检查执行者是否是玩家，因为只有玩家的飞行速度可以被设置
            if (!(executor instanceof Player player)) {
                // 如果非玩家尝试设置自己的飞行速度
                sender.sendPlainMessage("只有玩家可以飞行！");
                return Command.SINGLE_SUCCESS;
            }

            // 设置玩家的速度
            player.setFlySpeed(speed);

            if (sender == executor) {
                // 如果玩家自己执行了命令
                player.sendPlainMessage("成功将你的飞行速度设置为 " + speed);
                return Command.SINGLE_SUCCESS;
            }

            // 如果速度是由不同的发送者设置的（例如使用 `/execute`）
            sender.sendRichMessage("成功将 `<playername>` 的飞行速度设置为 " + speed, Placeholder.component("playername", player.name()));
            player.sendPlainMessage("你的飞行速度已设置为 " + speed);
            return Command.SINGLE_SUCCESS;
        })
    );
```

### 解释
这里有很多内容需要解释，所以让我们从上到下逐步分析：

前几行定义了一个名为 `/flyspeed` 的命令根，它有一个名为 “speed” 的浮点数参数，只允许 0 到 1 之间的值。
然后我们在参数分支中添加了一个 `executes` 子句，并通过运行 `FloatArgumentType.getFloat` 检索速度参数。

注意高亮的行。我们首先从 `CommandContext<CommandSourceStack>` 中检索 `CommandSourceStack`，然后最终检索到它的发送者和执行者。
`CommandSender` 是一个接口，声明了 `sendMessage(...)`、`getServer()` 和 `getName()` 方法。
它由所有实体实现，包括玩家和 `ConsoleCommandSender`，后者用于控制台执行命令时。

接下来我们检查我们的执行者对象是否也是 `Player` 接口的实例。如果执行者为 `null`，这个表达式将返回 `false`，这就是为什么我们不需要进行空值检查。
如果表达式计算结果为 `true`，我们将得到一个新的 `player` 变量，它代表服务器上实际执行命令的玩家。

接下来，我们使用从玩家提供的浮点数参数中检索到的值设置玩家的飞行速度，并向他们发送一条消息以确认操作。
始终建议发送确认消息，以确认命令是否成功，因为否则玩家可能会对命令“不起作用”感到困惑。
如果执行者不是玩家，我们可以发送一种错误消息。
在我们的例子中，我们假设发送者是控制台，因为实体通常不会尝试发送这样的命令。

最后，我们从 lambda 表达式中返回并提供一个返回值。
由于我们的命令成功了，我们可以返回 `Command.SINGLE_SUCCESS`，其值为 `1`。别忘了关闭所有大括号！

现在运行命令可以正确工作：
![](./assets/flyspeed-player.png)
![](./assets/flyspeed-console.png)

我们甚至可以使用 `/execute as` 以另一个玩家的身份运行它：
![](./assets/flyspeed-proxied.png)

### 逻辑分离
有时，如果命令太大或者由于个人偏好，你可能不想把逻辑代码放在 `executes` 方法中，因为过多的缩进可能会使代码难以阅读。
在这种情况下，我们可以不把逻辑定义在 lambda 表达式中，而是使用方法引用。
为此，我们可以直接将方法引用传递给 `executes` 方法。它可能如下所示：

```java title="FlightSpeedCommand.java"
public class FlightSpeedCommand {

    public static LiteralArgumentBuilder<CommandSourceStack> createCommand() {
        return Commands.literal("flyspeed")
            .then(Commands.argument("speed", FloatArgumentType.floatArg(0, 1.0f))
                .executes(FlightSpeedCommand::runFlySpeedLogic)
            );
    }

    private static int runFlySpeedLogic(CommandContext<CommandSourceStack> ctx) {
        float speed = FloatArgumentType.getFloat(ctx, "speed"); // 检索速度参数
        CommandSender sender = ctx.getSource().getSender(); // 检索命令发送者
        Entity executor = ctx.getSource().getExecutor(); // 检索命令执行者，它可能与发送者相同，也可能不同

        // 检查执行者是否是玩家，因为只有玩家的飞行速度可以被设置
        if (!(executor instanceof Player player)) {
            // 如果非玩家尝试设置自己的飞行速度
            sender.sendPlainMessage("只有玩家可以飞行！");
            return Command.SINGLE_SUCCESS;
        }

        // 设置玩家的速度
        player.setFlySpeed(speed);

        if (sender == executor) {
            // 如果玩家自己执行了命令
            player.sendPlainMessage("成功将你的飞行速度设置为 " + speed);
            return Command.SINGLE_SUCCESS;
        }

        // 如果速度是由不同的发送者设置的（例如使用 `/execute`）
        sender.sendRichMessage("成功将`<playername>`的飞行速度设置为 " + speed, Placeholder.component("playername", player.name()));
        player.sendPlainMessage("你的飞行速度已设置为 " + speed);
        return Command.SINGLE_SUCCESS;
    }
}
```

正如你所见，我们使命令树的可读性大大提高，同时保留了相同的功能。
