---
title: 参数和文字
description: 关于命令参数和文字的详细指南。
slug: paper/dev/command-api/basics/arguments-and-literals
---

:::note[注意]

在[命令树文档](/paper/dev/command-api/basics/command-tree)中，我们研究了Brigadier命令的结构以及如何构建命令树。
如果你还没有读完那部分内容，我们强烈建议你在阅读关于参数和文字的内容之前先读完它。

:::

## 介绍

`ArgumentBuilder<CommandSourceStack, ?>` 的每个 `.then(...)` 方法都接受另一个 `ArgumentBuilder<CommandSourceStack, ?>` 对象。
这个抽象的 `ArgumentBuilder` 有两个实现：`RequiredArgumentBuilder` 和 `LiteralArgumentBuilder`。
当使用 Paper 与 Brigadier 时，我们通过运行 `Commands.literal(String)` 来创建 `LiteralArgumentBuilder` 对象，或者通过运行 `Commands.argument(String, ArgumentType<T>)` 来创建 `RequiredArgumentBuilder` 对象。

为了说明它们的区别，你可以这样想象：
* 参数是用户输入的变量。它是半不可预测的，但总会返回它所支持的对象的有效条目。
* 文字是用户输入的非变量。它主要用于定义可预测的输入，因为每个文字都是我们命令树上的一个新分支。

## 文字
在代码中，文字通常无法被访问。然而，由于我们命令树的特性，我们总是可以知道我们当前所在的文字分支：
```java
Commands.literal("plant")
    .then(Commands.literal("tree")
        .executes(ctx -> {
            /* 这里我们处于`/plant tree` */
        })
    )
    .then(Commands.literal("grass")
        .executes(ctx -> {
             /* 这里我们处于`/plant grass` */
        }));
```

:::tip[提示]

你可能会注意到`executes`方法的使用。这个方法为我们的分支声明逻辑。如果一个分支没有定义`executes`方法，它将不可执行。
关于执行逻辑的更多信息，请点击[这里](/paper/dev/command-api/basics/executors)。

:::

## 参数
参数稍微复杂一些。它们也在树中定义了一个新分支，但它们不是直接可预测的。
每个参数都是通过 `Commands.argument(String, ArgumentType<T>)` 创建的。
该方法返回一个 `RequiredArgumentBuilder`。`T` 类型参数声明了参数的返回类型，你可以在你的 `executes` 方法中使用它。
这意味着如果你传入一个 `ArgumentType<Integer>`，你可以将该参数的值检索为整数，无需手动解析！有一些内置的原始参数类型可以用于参数：

| 名称                                | 返回值     | 可能的输入               | 描述                                      |
|-----------------------------------|---------|---------------------|-----------------------------------------|
| BoolArgumentType.bool()           | Boolean | true/false          | 只允许布尔值                                  |
| IntegerArgumentType.integer()     | Integer | 253, -123, 0        | 任何有效的整数                                 |
| LongArgumentType.longArg()        | Long    | 25418263123783      | 任何有效的长整数                                |
| FloatArgumentType.floatArg()      | Float   | 253.2, -25.0        | 任何有效的浮点数                                |
| DoubleArgumentType.doubleArg()    | Double  | 4123.242, -1.1      | 任何有效的双精度浮点数                             |
| StringArgumentType.word()         | String  | letters-and+1234567 | 单个单词。只允许包含字母、数字以及以下字符：`+`、`-`、`_` 和 `.` |
| StringArgumentType.string()       | String  | "with spaces"       | 单个单词，或者如果用引号括起来，则可以是任何包含空格的有效字符串        |
| StringArgumentType.greedyString() | String  | unquoted spaces     | 字面输入的文本。可以包含任何字符。必须是最后一个参数              |

### 布尔参数类型和参数解析
布尔参数用于检索布尔值。
一个示例用法可能是 `/serverflight` 命令，它允许通过 `/serverflight true` 和 `/serverflight false` 启用和禁用服务器飞行：

```java title="ServerFlightCommand.java"
Commands.literal("serverflight")
    .then(Commands.argument("allow", BoolArgumentType.bool())
        .executes(ctx -> {
            boolean allowed = ctx.getArgument("allow", boolean.class);
            /* 切换服务器飞行 */
        })
    );
```

在这里，你可以看到如何在代码中访问参数。`Commands.argument(String, ArgumentType)`方法的第一个参数接受节点名称。
文字不需要这个参数，因为它们的名称与它们的值相同。但在这里我们需要一种方法来访问参数。
`executes` lambda 的参数有一个名为`T getArgument(String, Class<T>)`的方法。第一个参数是我们想要检索的方法的名称。
第二个参数是参数的返回值。由于我们使用的是布尔参数，我们传入`boolean.class`并以这种方式检索参数值。

### 数字参数
所有数字参数（如 `IntegerArgumentType.integer()`）都有三个重载版本：

| 重载版本                                            | 描述                                            |
|-------------------------------------------------|-----------------------------------------------|
| `IntegerArgumentType.integer()`                 | 任何值在`Integer.MIN_VALUE`和`Integer.MAX_VALUE`之间 |
| `IntegerArgumentType.integer(int min)`          | 任何值在`min`和`Integer.MAX_VALUE`之间               |
| `IntegerArgumentType.integer(int min, int max)` | 任何值在`min`和`max`之间                             |

这特别适用于过滤过高或过低的输入。
以定义 `/flyspeed` 命令为例。
由于 `Player#setFlySpeed(float value)` 方法只接受 -1 到 1 之间的浮点数，其中 -1 表示反方向，
因此将值限制在 0 到 1 之间以获得非负的有效速度是有意义的。可以通过以下命令树实现：

```java title="FlightSpeedCommand.java"
Commands.literal("flyspeed")
    .then(Commands.argument("speed", FloatArgumentType.floatArg(0, 1.0f))
        .executes(ctx -> {
            float speed = ctx.getArgument("speed", float.class);
            /* 设置玩家的飞行速度 */
            return Command.SINGLE_SUCCESS;
        })
    );
```

:::tip[提示]

有些参数可以有特殊的检索方式。
最值得注意的是，所有 Brigadier 提供的参数（本页提到的那些）都有一个解析器来获取它们自己的参数值。对于浮点数参数，它看起来像这样：

```java
float speed = FloatArgumentType.getFloat(ctx, "speed");
```

通常使用 `ctx.getArgument` 或 `FloatArgumentType.getFloat` 并不重要，
因为它们经过相同的逻辑，但在未来的文档中，原始值可能会使用它们自己的解析器来检索。

这些 Brigadier 原生参数的解析器确实存在。所有这些都接受 `(CommandContext<?> context, String name)` 作为方法参数：
- `BoolArgumentType.getBool`
- `IntegerArgumentType.getInteger`
- `LongArgumentType.getLong`
- `FloatArgumentType.getFloat`
- `DoubleArgumentType.getDouble`
- `StringArgumentType.getString`

:::

现在，如果我们输入一个 0 到 1 之间的有效浮点数，命令将正确执行：
![](./assets/valid-float.png)

但是，如果我们输入一个太小或太大的浮点数，它会在**客户端**抛出错误：
![](./assets/small-float.png)
![](./assets/big-float.png)

这是原生参数的主要优势：客户端本身对参数进行简单的错误检查，
这使得运行命令时的用户体验更好，因为他们可以在不将命令发送到服务器的情况下看到无效的输入。

### 字符串参数
有三种字符串参数：`word`、`string` 和 `greedyString`。

`word`字符串参数是最简单的。它只接受一个由字母数字字符和以下特殊字符组成的单个单词：`+`、`-`、`_`和`.`。
* ✅ `.this_is_valid_input.`
* ❌ `this is invalid input`
* ❌ `"also_invalid"`
* ✅ `-10_numbers_are_valid`
* ❌ `@_@`

`string` 参数稍微复杂一些。如果未加引号，它遵循与 `word` 参数相同的规则。只允许字母数字字符和提到的特殊字符。
但如果你将字符串用引号括起来，你可以输入任何你想要的 Unicode 字符组合。引号 `"` 可以使用反斜杠 `\` 转义。
* ✅ `this_is-valid-input`
* ✅ `"\"quotes\""`
* ❌ `this is invalid input`
* ✅ `"this is valid input again"`
* ✅ `"also_valid"`
* ✅ `"紙の神"`

`greedyString` 参数是唯一不进行任何解析的参数。由于它的“贪婪”特性，它不允许在其声明之后有任何参数。
这也意味着任何输入都是完全有效的，它不需要引号。实际上，引号被视为文字字符。
* ✅ `this_is_valid_input`
* ✅ `this is valid as well input`
* ✅ `"this is valid input again"`
* ✅ `also_valid`
* ✅ `紙の神`

在这里你可以看到参数的实际应用：
![](./assets/string-arguments.gif)

## 进一步参考
### Minecraft 参数
除了这些内置的 Brigadier 参数外，Paper 还定义了无数自定义参数。这些可以通过 `ArgumentTypes` 类在静态上下文中访问。
你可以在这里[这里](/paper/dev/command-api/arguments/minecraft)了解更多关于这些内容的信息。

### 自定义参数
有时你可能想定义自己的自定义参数。为此，你可以实现 `CustomArgumentType<T, N>` 接口。
你可以在这里[这里](/paper/dev/command-api/basics/custom-arguments)了解更多关于这些内容的信息。
