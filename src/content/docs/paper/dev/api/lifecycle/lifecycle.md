---
title: 生命周期 API
description: Paper 生命周期 API 的介绍。
slug: paper/dev/lifecycle
sidebar:
  label: Introduction
---

生命周期 API 可用于与生命周期相关的注册。
目前，它被 Brigadier 命令 API 使用。
计划也用于注册修改 API。
一般来说，启动过程中非常早初始化的系统可以利用这个事件系统。

## 生命周期事件管理器

[LifecycleEventManager](jd:paper:io.papermc.paper.plugin.lifecycle.event.LifecycleEventManager) 要么与一个
[Plugin](jd:paper:org.bukkit.plugin.Plugin) 实例绑定，要么与一个
[BootstrapContext](jd:paper:io.papermc.paper.plugin.bootstrap.BootstrapContext) 绑定，这取决于你从哪里访问它。 例如，在你的插件主类中：

```java title="TestPlugin.java"
@Override
public void onEnable() {
    final LifecycleEventManager<Plugin> lifecycleManager = this.getLifecycleManager();
}
```

或者，使用 bootstrapper：

```java title="TestPluginBootstrap.java"
@Override
public void bootstrap(BootstrapContext context) {
    final LifecycleEventManager<BootstrapContext> lifecycleManager = context.getLifecycleManager();
}
```

## 生命周期事件

在获取正确的 `LifecycleEventManager` 后，通过从
[LifecycleEvents](jd:paper:io.papermc.paper.plugin.lifecycle.event.types.LifecycleEvents) 中选择一个事件类型来创建一个事件处理器：
```java title="TestPlugin.java"
@Override
public void onEnable() {
    final LifecycleEventManager<Plugin> lifecycleManager = this.getLifecycleManager();
    PrioritizedLifecycleEventHandlerConfiguration<LifecycleEventOwner> config = LifecycleEvents.SOME_EVENT.newHandler((event) -> {
        // 事件的处理器
    });
}
```

### 配置

每个创建的处理器可以通过多种方式进行配置。
可用的配置选项取决于事件类型本身，并且会因事件类型而异。

#### 优先级

设置处理器的优先级可以决定它相对于同一事件类型的其他处理器的运行顺序。
数字越低，它越早运行。
默认优先级为 0。

#### 监视器

将处理器标记为监视器将使其在所有其他非监视器处理器被调用后被调用。
仅使用此功能来检查事件中的某些状态。
不要在处理器中修改任何状态。

优先级和监视器状态是互斥选项，设置其中一个将重置另一个。

```java title="TestPlugin.java"
@Override
public void onEnable() {
    final LifecycleEventManager<Plugin> lifecycleManager = this.getLifecycleManager();
    PrioritizedLifecycleEventHandlerConfiguration<LifecycleEventOwner> config = LifecycleEvents.SOME_EVENT.newHandler((event) -> {
        // 事件的处理器
    });
    config.priority(10); // 设置优先级为 10
    // 或者
    config.monitor(); // 将处理器标记为监视器
}
```

### 注册

一旦处理器配置完成，就可以将其注册到生命周期管理器中：

```java title="TestPlugin.java"
@Override
public void onEnable() {
    final LifecycleEventManager<Plugin> lifecycleManager = this.getLifecycleManager();
    PrioritizedLifecycleEventHandlerConfiguration<LifecycleEventOwner> config = LifecycleEvents.SOME_EVENT.newHandler((event) -> {
        // 事件的处理器
    }).priority(10);
    lifecycleManager.registerEventHandler(config);
}
```
还有一种简写方法，可以直接注册处理器而无需进行任何配置：

```java title="TestPlugin.java"
@Override
public void onEnable() {
    final LifecycleEventManager<Plugin> lifecycleManager = this.getLifecycleManager();
    lifecycleManager.registerEventHandler(LifecycleEvents.COMMANDS, (event) -> {
        // 事件的处理器
    });
}
```

:::note[注意]

某些事件类型具有特殊行为，限制了某些机制。
如果插件在某些情况下注册处理器，
则禁用重新加载插件的功能（通过 `/bukkit:reload` 或 `Server#reload()`）。
这是因为插件重新加载需要完全卸载插件及其类，如果事件需要在插件卸载时运行，这将是一个问题。

:::

## 为什么会有这个存在？

我们已经有一个事件系统，为什么还需要另一个？这是一个合理的问题。
答案是，其中一些事件在 `JavaPlugin`
实例创建之前、在 `MinecraftServer` 实例创建之前、在服务器启动的非常早期就会触发。
这些事件可能发生在所有注册表初始化之前，这是在原版服务器上最早发生的事情之一。
现有的 Bukkit 事件系统并不设计用于在这个时间点存在，
修改它以支持这种环境比为这些特定事件创建一个单独的系统要麻烦得多，
这些事件可以在这个早期初始化期间触发。

:::note[技术解释]

以下是一个不断扩大的具体原因列表，
说明为什么我们不能仅仅修改现有的事件系统来支持这种新的事件需求：

- 你不能在 Bukkit 事件上使用泛型，
  因为它们是通过反射注册的，没有任何编译时检查。
  这是一个问题，因为这些事件大多会遵循非常相似的模式，特别是注册表修改事件。
  如果我们不能使用泛型，就会有很多无用的类。

- 另一个原因是现有的系统有优先级，但总是有优先级。
  对于生命周期事件，
  有些事件我们可能不希望支持优先级（它将完全基于插件加载顺序）。

- 存在时间太晚。`HandlerList` 和事件注册都使用 `Plugin` 实例，
  而在启动器阶段，`Plugin` 实例并不存在，也不应该存在。
  改变这一点将需要对现有系统进行大量重写，并且可能会让 API 用户感到困惑，
  他们期望所有 `RegisteredListeners` 都有一个关联的 `Plugin`。

- 一个新系统可以让我们使用接口和服务器实现来处理事件，这大大简化了事件的处理。
  在 Bukkit 系统中，
  你可以通过让服务器实现事件扩展 API 事件来实现类似的功能，但接口更加灵活。

- 一个新系统允许我们在编译时强制执行基于注册上下文的事件注册位置。
  因此，你甚至不能在错误的位置注册一个事件的处理器，
  这将是一个编译器错误，多亏了我们使用泛型的实现。

:::
