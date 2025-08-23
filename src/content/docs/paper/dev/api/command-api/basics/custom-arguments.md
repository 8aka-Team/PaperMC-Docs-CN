---
title: 自定义参数
description: 指南：自定义参数。
slug: paper/dev/command-api/basics/custom-arguments
---

自定义参数不过是对现有参数类型的一种封装，
它允许开发者提供带有建议和可重用解析功能的参数，从而减少代码重复。

## 为什么你会使用自定义参数？
例如，如果你想有一个参数，用于当前在线且是管理员的玩家，你可以使用玩家参数类型， 添加自定义建议，
并在你的 `executes(...)` 方法体中抛出一个 `CommandSyntaxException`。这看起来会是这样的：

```java
Commands.argument("player", ArgumentTypes.player())
    .suggests((ctx, builder) -> {
        Bukkit.getOnlinePlayers().stream()
            .filter(ServerOperator::isOp)
            .map(Player::getName)
            .filter(name -> name.toLowerCase(Locale.ROOT).startsWith(builder.getRemainingLowerCase()))
            .forEach(builder::suggest);
        return builder.buildFuture();
    })
    .executes(ctx -> {
        final Player player = ctx.getArgument("player", PlayerSelectorArgumentResolver.class).resolve(ctx.getSource()).getFirst();
        if (!player.isOp()) {
            final Message message = MessageComponentSerializer.message().serialize(text(player.getName() + " 不是服务器管理员！"));
            throw new SimpleCommandExceptionType(message).create();
        }

        ctx.getSource().getSender().sendRichMessage("玩家 `<player>` 是管理员！",
            Placeholder.component("player", player.displayName())
        );
        return Command.SINGLE_SUCCESS;
    })
```

正如你所见，其中包含大量与命令功能本身无关的逻辑。
如果我们想在另一个节点上使用相同的参数，就需要复制粘贴大量代码。这无疑是极其繁琐的。

解决这个问题的方法就是自定义参数。在详细介绍它们之前，这是将该参数实现为自定义参数后的样子：

```java title="OppedPlayerArgument.java"
@NullMarked
public final class OppedPlayerArgument implements CustomArgumentType<Player, PlayerSelectorArgumentResolver> {

    private static final SimpleCommandExceptionType ERROR_BAD_SOURCE = new SimpleCommandExceptionType(
        MessageComponentSerializer.message().serialize(Component.text("源必须是 `CommandSourceStack`！"))
    );

    private static final DynamicCommandExceptionType ERROR_NOT_OPERATOR = new DynamicCommandExceptionType(name -> {
        return MessageComponentSerializer.message().serialize(Component.text(name + " 不是服务器管理员！"));
    });

    @Override
    public Player parse(StringReader reader) {
        throw new UnsupportedOperationException("这个方法永远不会被调用。");
    }

    @Override
    public <S> Player parse(StringReader reader, S source) throws CommandSyntaxException {
        if (!(source instanceof CommandSourceStack stack)) {
            throw ERROR_BAD_SOURCE.create();
        }

        final Player player = getNativeType().parse(reader).resolve(stack).getFirst();
        if (!player.isOp()) {
            throw ERROR_NOT_OPERATOR.create(player.getName());
        }

        return player;
    }

    @Override
    public ArgumentType<PlayerSelectorArgumentResolver> getNativeType() {
        return ArgumentTypes.player();
    }

    @Override
    public <S> CompletableFuture<Suggestions> listSuggestions(CommandContext<S> ctx, SuggestionsBuilder builder) {
        Bukkit.getOnlinePlayers().stream()
            .filter(ServerOperator::isOp)
            .map(Player::getName)
            .filter(name -> name.toLowerCase(Locale.ROOT).startsWith(builder.getRemainingLowerCase()))
            .forEach(builder::suggest);
        return builder.buildFuture();
    }
}
```

乍一看，这似乎比直接在命令树中实现逻辑所需的代码多得多。
那么，它的优势在哪里呢？当我们看到参数是如何声明的时候，答案就显而易见了：

```java
Commands.argument("player", new OppedPlayerArgument())
    .executes(ctx -> {
        final Player player = ctx.getArgument("player", Player.class);

        ctx.getSource().getSender().sendRichMessage("玩家 `<player>` 是管理员！",
            Placeholder.component("player", player.displayName())
        );
        return Command.SINGLE_SUCCESS;
    })
```

使用自定义参数时，这种方式更易读且易于理解。而且它是可复用的！希望你现在对**为什么**应该使用自定义参数有了基本的了解。

## 检查 `CustomArgumentType` 接口
该接口声明如下：

```java title="CustomArgumentType.java"
package io.papermc.paper.command.brigadier.argument;

@NullMarked
public interface CustomArgumentType<T, N> extends ArgumentType<T> {

    @Override
    T parse(final StringReader reader) throws CommandSyntaxException;

    @Override
    default <S> T parse(final StringReader reader, final S source) throws CommandSyntaxException {
        return ArgumentType.super.parse(reader, source);
    }

    ArgumentType<N> getNativeType();

    @Override
    @ApiStatus.NonExtendable
    default Collection<String> getExamples() {
        return this.getNativeType().getExamples();
    }

    @Override
    default <S> CompletableFuture<Suggestions> listSuggestions(final CommandContext<S> context, final SuggestionsBuilder builder) {
        return ArgumentType.super.listSuggestions(context, builder);
    }
}
```

### 泛型类型
接口中有三种泛型类型：
- `T`：这是调用此参数的 `CommandContext#getArgument` 时返回的类的类型。
- `N`：此自定义参数扩展的类的原生类型。用作“底层”参数。
- `S`：命令源的泛型类型。通常为 `CommandSourceStack`。

### 方法
| 方法声明                                                                                                                            | 描述                                                                                        |
|---------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------|
| `ArgumentType<N> getNativeType()`                                                                                               | 在这里，你声明底层参数类型，它用作客户端参数验证的基础。                                                              |
| `T parse(final StringReader reader) throws CommandSyntaxException`                                                              | 如果没有覆盖 `T parse(StringReader, S)`，则会使用此方法。在这里，你可以运行转换和验证逻辑。                               |
| `default <S> T parse(final StringReader reader, final S source)`                                                                | 如果覆盖了此方法，它将优先于 `T parse(StringReader)`。它具有相同的作用，但允许在解析逻辑中包含源。                             |
| `default Collection<String> getExamples()`                                                                                      | 这个方法**不应该**被覆盖。它在解析时内部用于区分某些参数类型。                                                         |
| `default <S> CompletableFuture<Suggestions> listSuggestions(final CommandContext<S> context, final SuggestionsBuilder builder)` | 这个方法相当于 `RequiredArgumentBuilder#suggests(SuggestionProvider<S>)`。你可以覆盖此方法，以便向客户端发送自己的建议。 |

### 一个非常基础的实现
```java
package io.papermc.commands;

import com.mojang.brigadier.StringReader;
import com.mojang.brigadier.arguments.ArgumentType;
import com.mojang.brigadier.arguments.StringArgumentType;
import io.papermc.paper.command.brigadier.argument.CustomArgumentType;
import org.jspecify.annotations.NullMarked;

@NullMarked
public class BasicImplementation implements CustomArgumentType<String, String> {

    @Override
    public String parse(StringReader reader) {
        return reader.readUnquotedString();
    }

    @Override
    public ArgumentType<String> getNativeType() {
        return StringArgumentType.word();
    }
}
```

注意这里使用了 `reader.readUnquotedString()`。除了允许现有的参数类型解析你的参数外，你还可以手动读取输入。
在这里，我们读取一个未加引号的字符串，就像单词字符串参数类型一样。

## `CustomArgumentType.Converted<T, N>`
如果你需要将原生类型解析为你的新类型，你可以使用 `CustomArgumentType.Converted` 接口。
这个接口是 `CustomArgumentType` 接口的扩展，它新增了两个可覆盖的方法：

```java
T convert(N nativeType) throws CommandSyntaxException;

default <S> T convert(final N nativeType, final S source) throws CommandSyntaxException {
    return this.convert(nativeType);
}
```

这些方法与 `parse` 方法类似，但它们提供的是已解析的原生类型，而不是 `StringReader`。
这减少了手动进行字符串读取器操作的需要，而是直接使用原生类型的解析规则。

## 在建议阶段的错误处理
如果你希望让客户端将当前输入的内容显示为红色以表示无效输入，需要指出的是，这**无法通过自定义参数实现**。
客户端只能验证它已知的参数类型，而且在建议阶段无法抛出 `CommandSyntaxException`。
唯一可以实现这一点的方法是使用**字面量**，但它们在服务器运行时无法动态修改。

![](./assets/ice-cream-invalid.png)

## 示例：冰淇淋参数
一个关于如何利用自定义参数的实用示例可以是一个经典的枚举类型参数。
在我们的例子中，我们使用了这个 `IceCreamFlavor` 枚举：

```java title="IceCreamFlavor.java"
package io.papermc.commands.icecream;

import org.jspecify.annotations.NullMarked;

@NullMarked
public enum IceCreamFlavor {
    VANILLA,
    CHOCOLATE,
    STRAWBERRY;

    @Override
    public String toString() {
        return name().toLowerCase();
    }
}
```

然后，我们可以使用一个转换型自定义参数类型，将单词字符串参数和我们的枚举类型进行转换，如下所示：

```java title="IceCreamArgument.java"
package io.papermc.commands.icecream;

@NullMarked
public class IceCreamArgument implements CustomArgumentType.Converted<IceCreamFlavor, String> {

    private static final DynamicCommandExceptionType ERROR_INVALID_FLAVOR = new DynamicCommandExceptionType(flavor -> {
        return MessageComponentSerializer.message().serialize(Component.text(flavor + " 这不是一个有效的口味！"));
    });

    @Override
    public IceCreamFlavor convert(String nativeType) throws CommandSyntaxException {
        try {
            return IceCreamFlavor.valueOf(nativeType.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ignored) {
            throw ERROR_INVALID_FLAVOR.create(nativeType);
        }
    }

    @Override
    public <S> CompletableFuture<Suggestions> listSuggestions(CommandContext<S> context, SuggestionsBuilder builder) {
        for (IceCreamFlavor flavor : IceCreamFlavor.values()) {
            String name = flavor.toString();

            // 仅当口味名称与用户输入匹配时才提供建议
            if (name.startsWith(builder.getRemainingLowerCase())) {
                builder.suggest(flavor.toString());
            }
        }

        return builder.buildFuture();
    }

    @Override
    public ArgumentType<String> getNativeType() {
        return StringArgumentType.word();
    }
}
```

最后，我们可以像这样声明我们的命令，然后就完成了！
同样，你可以直接在 `executes(...)` 方法中获取参数为 `IceCreamFlavor` 类型，而无需进行任何额外的解析，这使得自定义参数类型非常强大。

```java
Commands.literal("icecream")
    .then(Commands.argument("flavor", new IceCreamArgument())
        .executes(ctx -> {
            final IceCreamFlavor flavor = ctx.getArgument("flavor", IceCreamFlavor.class);

            ctx.getSource().getSender().sendRichMessage("<b><red>Y<green>U<aqua>M<light_purple>!</b> 你刚刚吃了一勺 <flavor>!",
                Placeholder.unparsed("flavor", flavor.toString())
            );
            return Command.SINGLE_SUCCESS;
        })
    )
    .build();
```

![](./assets/ice-cream.png)
