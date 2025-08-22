---
title: 处理事件
description: 如何在 Velocity 中监听事件
slug: velocity/dev/event-api
---

使用 Velocity 的 `@Subscribe` 注解监听事件非常简单。
你已经在主类中看到了一个使用
[`ProxyInitializeEvent`](jd:velocity:com.velocitypowered.api.event.proxy.ProxyInitializeEvent) 的监听器。
更多事件可以在 [Javadoc](jd:velocity) 中找到。

## 创建监听器方法

要监听一个事件，请使用 [`@Subscribe`](jd:velocity:com.velocitypowered.api.event.Subscribe) 标记该方法，如下所示。
这与其他你可能熟悉的 API 中的注解驱动事件监听类似；
它相当于 Bukkit/Bungee 的 `@EventHandler` 和 Sponge 的 `@Listener`。

```java
@Subscribe
public void onPlayerChat(PlayerChatEvent event) {
	// 执行操作
}
```

:::tip[提示]

请注意，导入的是 [`com.velocitypowered.api.event.Subscribe`](jd:velocity:com.velocitypowered.api.event.Subscribe)，
而不是 `com.google.common.eventbus`。

:::

## 顺序

每个监听器都有一个 [`priority`](jd:velocity:com.velocitypowered.api.event.Subscribe#priority())。
当触发事件时，监听器被调用的顺序由其 `priority` 决定。
优先级越高，事件处理器将越早被调用。

在 `@Subscribe` 注解中声明所需的顺序：

```java
@Subscribe(priority = 10)
public void onPlayerChatFirst(PlayerChatEvent event) {
    // this method fires first
}

@Subscribe(priority = 5)
public void onPlayerChat(PlayerChatEvent event) {
	// 这种方法是在上述方法之后触发的。
}
```

如果不指定顺序，`0` 是默认值。

## 注册监听器

Velocity 会自动将你的主插件类注册为事件监听器。
这对于初始化和简单的插件很方便，但对于更复杂的插件，
你可能希望将事件处理器与主插件类分开。
为此，你需要将其他监听器注册到 [`EventManager`](jd:velocity:com.velocitypowered.api.event.EventManager)：

事件系统支持将对象注册为监听器（允许你使用 `@Subscribe` 标记事件处理器），
或者注册函数式监听器。

### 将对象注册为监听器

```java
server.getEventManager().register(plugin, listener);
```

两个参数都是[`object`](JD：Java：Java.Lang.Object)。
第一个参数是插件的对象，第二个参数应该是要注册的侦听器。例如：

```java
@Plugin(id = "myfirstplugin", name = "My Plugin", version = "0.1.0", dependencies = {@Dependency(id = "wonderplugin")})
public class VelocityTest {

  private final ProxyServer server;
  private final Logger logger;

  @Inject
  public VelocityTest(ProxyServer server, Logger logger) {
    this.server = server;
    this.logger = logger;
  }

  @Subscribe
  public void onInitialize(ProxyInitializeEvent event) {
    server.getEventManager().register(this, new MyListener());
  }
}

public class MyListener {

  @Subscribe
  public void onPlayerChat(PlayerChatEvent event) {
    // 你可以在这里做点什么
  }

}
```

### 注册函数式侦听器

作为 `@Subscribe` 的替代方案，你也可以使用函数式 `EventHandler` 接口，
并使用 [`register(Object plugin, Class<E> eventClass, EventHandler<E> handler)`](jd:velocity:com.velocitypowered.api.event.EventManager#register(java.lang.Object,java.lang.Class,com.velocitypowered.api.event.EventHandler)) 注册你的处理器：

```java
  server.getEventManager().register(this, PlayerChatEvent.class, event -> {
      // 你可以在这里做点什么
  });
```

## 异步处理事件

在 Velocity 3.0.0 中，事件现在可以异步处理。
事件系统允许插件暂停向每个监听器发送事件，
异步执行一些计算或 I/O 操作，然后继续处理事件。
所有 Velocity 事件都可以异步处理，但只有部分事件会在继续之前明确等待事件完成。

对于基于注解的监听器，要异步处理事件，
只需返回一个 [`EventTask`](jd:velocity:com.velocitypowered.api.event.EventTask)
或添加一个返回的 [`Continuation`](jd:velocity:com.velocitypowered.api.event.Continuation) 参数即可：

```java
  @Subscribe(priority = 100)
  public void onLogin(LoginEvent event, Continuation continuation) {
    doSomeAsyncProcessing().addListener(continuation::resume, continuation::resumeWithException);
  }

  @Subscribe(priority = 100)
  public EventTask onPlayerChat(PlayerChatEvent event) {
    if (mustFurtherProcess(event)) {
      return EventTask.async(() => ...);
    }
    return null;
  }
```

函数式监听器只需实现
[`AwaitingEventExecutor`](jd:velocity:com.velocitypowered.api.event.AwaitingEventExecutor)
并返回一个 [`EventTask`](jd:velocity:com.velocitypowered.api.event.EventTask) 即可：

```java
  server.getEventManager().register(this, PlayerChatEvent.class, (AwaitingEventExecutor) event -> {
    if (mustFurtherProcess(event)) {
      return EventTask.async(() => ...);
    }
    return null;
  });
```

有两种类型的事件任务：

- **异步任务** 简单地异步运行一个执行单元。
  要获取一个基本的事件任务，请使用 [`EventTask.async(Runnable)`](jd:velocity:com.velocitypowered.api.event.EventTask#async(java.lang.Runnable))。
  基本事件任务是 Velocity 1.x.x 事件监听器和 Bukkit API 中异步事件的最接近等价物。
- **延续任务** 为监听器提供了一个回调（称为 `Continuation`），以便在（可能是异步的）工作完成时恢复事件处理。
  要获取一个基于延续的事件任务，请使用 [`EventTask.withContinuation(Consumer<Continuation>)`](jd:velocity:com.velocitypowered.api.event.EventTask#withContinuation(java.util.function.Consumer))。
  基于延续的任务是使用 BungeeCord `AsyncEvent` 意图的监听器的最接近等价物，但它们的编程模型略有不同，因为每个监听器仍然按顺序运行，只是单个监听器可以推迟将控制权传递给下一个监听器，直到它完成为止。

:::caution[注意]

为了与 Velocity 的旧版本保持兼容，Velocity 3.0.0 会异步运行所有事件监听器。
这种行为在 Polymer 中将会改变，并且如果你需要异步执行某些工作，
则需要显式的提供一个事件任务（或者使用延续）。
强烈建议所有开发者现在就开始进行转换。

:::

## 创建事件

在 Velocity 上创建事件与其他平台有所不同，
但大部分情况下非常相似。

### 创建事件类

首先，我们需要为我们的事件创建一个类。
在本教程中，我们假设你正在制作一个私信插件，因此使用`PrivateMessageEvent`。这部分大部分是样板代码。

```java
public class PrivateMessageEvent {

  private final Player sender;
  private final Player recipient;
  private final String message;

  public PrivateMessageEvent(Player sender, Player recipient, String message) {
    this.sender = sender;
    this.recipient = recipient;
    this.message = message;
  }

  public Player sender() {
    return sender;
  }

  public Player recipient() {
    return recipient;
  }

  public String message() {
    return message;
  }

  // 根据需要添加 `toString`、`equals` 和 `hashCode`

}
```

你会注意到，你的事件不需要扩展或实现任何内容。它们可以直接工作。

### 触发事件

要触发事件，你需要获取服务器的事件管理器并使用
[`fire`](jd:velocity:com.velocitypowered.api.event.EventManager#fire(E)) 方法。
需要注意的是，这会返回一个  [`CompletableFuture`](jd:java:java.util.concurrent.CompletableFuture) ，
因此如果你想在所有监听器处理完事件后继续执行逻辑，可以使用回调函数。

```java
server.getEventManager().fire(new PrivateMessageEvent(sender, recipient, message)).thenAccept((event) -> {
  // 事件已触发完毕
  // 执行依赖于结果的某些逻辑
});
```

### 使用 `ResultedEvent`

Velocity 使用泛化的 [`ResultedEvent`](jd:velocity:com.velocitypowered.api.event.ResultedEvent)
来处理具有某种“结果”的事件。
事件的结果类型由其泛型类型定义；例如 `PrivateMessageEvent implements ResultedEvent<ResultType>`。

一些常见的结果类型包括用于简单允许/拒绝结果的 [`GenericResult`](jd:velocity:com.velocitypowered.api.event.ResultedEvent$GenericResult) 和组件结果，
用于事件结果可能被拒绝并附带原因的事件（例如在登录事件中）。

使用通用结果比你可能熟悉的其他平台上的 `isCancelled/setCancelled` 方法要广泛得多，
后者的含义模糊且仅限于一个简单的布尔值。
在本例中，我们将使用 `GenericResult`，因此监听器可以将我们的 `PrivateMessageEvent` 标记为允许或拒绝。

```java
public class PrivateMessageEvent implements ResultedEvent<GenericResult> {

  private final Player sender;
  private final Player recipient;
  private final String message;

  private GenericResult result = GenericResult.allowed(); // Allowed by default

  public PrivateMessageEvent(Player sender, Player recipient, String message) {
    this.sender = sender;
    this.recipient = recipient;
    this.message = message;
  }

  public Player sender() {
    return sender;
  }

  public Player recipient() {
    return recipient;
  }

  public String message() {
    return message;
  }

  @Override
  public GenericResult result() {
    return result;
  }

  @Override
  public void setResult(GenericResult result) {
    this.result = Objects.requireNonNull(result);
  }

}
```

按照惯例，`ResultedEvent` 的结果永远不应该为 null。
在这里，我们使用 [`Objects#requireNonNull(Object)`](jd:java:java.util.Objects#requireNonNull(T))，来确保这一点。

监听器可以通过使用 `event.setResult(GenericResult.denied())` 来"拒绝"事件，
你可以通过 `event.getResult()` 检查结果。
