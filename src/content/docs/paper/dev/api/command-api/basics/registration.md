---
title: 注册
description: 注册 Brigadier 指令指南
slug: paper/dev/command-api/basics/registration
---

在前面的章节中，我们已经详细研究了 Brigadier 的工作原理，但从未真正阐述如何注册命令。所以我们将在这里进行说明！

## 生命周期事件管理器
在 Paper 中，Brigadier 命令是通过 `LifecycleEventManager` 注册的。
这是一个特殊的类，允许我们以一种方式注册命令，这样我们就不必担心处理各种服务器重载事件，例如 `/reload`。相反，我们使用 `LifecycleEventManager` 注册的任何内容，每次需要时都会重新注册。

但是，如何获取一个能够注册命令的 `LifecycleEventManager` 呢？
有两种“上下文”可以在其中使用 `LifecycleEventManager`。第一种，也是推荐的方式，是在我们插件的 `PluginBootstrap` 类中。

### 在插件启动器中注册

:::note[注意]

这需要你使用一个 [`paper-plugin.yml` plugin](/paper/dev/getting-started/paper-plugins) 插件。

如果你没有使用`paper-plugin.yml`，你可以[在插件的主类中注册命令](#registering-inside-a-plugin-main-class)。

:::

我们可以通过在启动方法中运行 `context.getLifecycleManager().registerEventHandler(LifecycleEvents.COMMANDS, commands -> {})`
来获取一个能够注册命令的 `LifecycleEventManager`，如下所示：

```java title="CustomPluginBootstrap.java"
public class CustomPluginBootstrap implements PluginBootstrap {

    @Override
    public void bootstrap(BootstrapContext context) {
        context.getLifecycleManager().registerEventHandler(LifecycleEvents.COMMANDS, commands -> {
            // 在这里注册你的命令……
        });
    }
}
```

快速回顾一下所有这些内容的含义：
通过运行 `context.getLifecycleManager()`，我们获得一个 `LifecycleEventManager<BootstrapContext>` 对象。
我们可以在其上调用 `LifecycleEventManager#registerEventHandler(LifecycleEventType, LifecycleEventHandler)` 来获取正确的生命周期事件。
第一个参数声明我们想要注册内容的生命周期事件类型，第二个参数是一个接口，如下所示：

```java
@FunctionalInterface
public interface LifecycleEventHandler<E extends LifecycleEvent> {
    void run(E event);
}
```

由于它是一个函数式接口，我们可以不实现它，而是传递一个只有一个参数 `E` 且没有返回值的 lambda 表达式。
`E` 泛型类型是 `ReloadableRegistrarEvent<Commands>`，因此也是我们 lambda 参数的类型。

`ReloadableRegistrarEvent<Commands>` 类有两个方法：`ReloadableRegistrarEvent.Cause cause()` 和 `Commands registrar()`。
对我们来说更相关的方法是 `registrar` 方法。通过它可以注册我们的命令。


### 在插件主类中注册
在插件的主类中获取用于命令的`LifecycleEventManager`，
与在`PluginBootstrap`类的启动方法中通过提供的`BootstrapContext`获取`LifecycleEventManager`非常相似，
不同之处在于，我们可以直接使用`JavaPlugin#getLifecycleManager`来获取它，而不需要依赖`PluginBootstrap`类中提供的`BootstrapContext`。

```java title="PluginMainClass.java"
public final class PluginMainClass extends JavaPlugin {

    @Override
    public void onEnable() {
        this.getLifecycleManager().registerEventHandler(LifecycleEvents.COMMANDS, commands -> {
            // 在这里注册你的命令……
        });
    }
}
```

这与 `PluginBootstrap` 中的概念相同，只是我们得到的不是 `LifecycleEventManager<BootstrapContext>`，而是 `LifecycleEventManager<Plugin>`。
这对我们用例来说并不重要，但你最好知道这一点。
其余方法的工作方式与 `PluginBootstrap` 参数化的 `LifecycleEventManager` 完全相同。

## 使用` Commands` 类注册命令
现在我们已经通过事件处理器中的 `commands.registrar()` 获得了 `Commands` 类的实例，
我们可以使用 `Commands#register` 方法的几种重载版本。

### 注册 `LiteralCommandNode`
大多数情况下，你会使用 `LiteralArgumentBuilder` 来构建命令树。
为了从该对象中获取 `LiteralCommandNode`，我们需要调用它的 `LiteralArgumentBuilder#build()` 方法：

```java
LiteralArgumentBuilder<CommandSourceStack> command = Commands.literal("testcmd")
    .then(Commands.literal("argument_one"))
    .then(Commands.literal("argument_two"));

LiteralCommandNode<CommandSourceStack> buildCommand = command.build();
```

简而言之：

```java
LiteralCommandNode<CommandSourceStack> buildCommand = Commands.literal("testcmd")
    .then(Commands.literal("argument_one"))
    .then(Commands.literal("argument_two"))
    .build();
```

现在我们已经获取了 `LiteralCommandNode`，我们可以注册它。
为此，我们有多个重载方法，可以选择性地设置别名和/或描述。注册我们的 “testcmd” 可能如下所示：

```java
this.getLifecycleManager().registerEventHandler(LifecycleEvents.COMMANDS, commands -> {
    commands.registrar().register(buildCommand);
});
```

### 注册 `BasicCommand`
`BasicCommand` 是一种类似 Bukkit 的定义命令的方式。我们不是构建命令树，而是允许所有用户输入，并将参数作为简单的字符串数组检索。
这种类型的命令特别适用于非常简单、基于文本的命令，例如 `/broadcast` 命令。
你可以在这里[这里](/paper/dev/command-api/misc/basic-command)了解更多关于基本命令的详细信息。

假设你已经有了你的 `BasicCommand` 对象，我们可以这样注册它：

```java
final BasicCommand basicCommand = ...;

this.getLifecycleManager().registerEventHandler(LifecycleEvents.COMMANDS, commands -> {
    commands.registrar().register("commandname", basicCommand);
});
```

与 `LiteralCommandNode` 类似，我们也有重载方法来设置命令的各种附加信息。

## 进一步参考
* 关于 `LifecycleEventManager` 的快速参考，请点击[这里](/paper/dev/lifecycle)。
