---
title: 聊天事件
description: 关于 `AsyncChatEvent` 及其处理方式的概述。
slug: paper/dev/chat-events
---

聊天事件在过去的几年里经历了几次演变。
本指南将解释如何正确使用新的 [`AsyncChatEvent`](jd:paper:io.papermc.paper.event.player.AsyncChatEvent) 及其 [`ChatRenderer`](jd:paper:io.papermc.paper.chat.ChatRenderer)。
[`AsyncChatEvent`](jd:paper:io.papermc.paper.event.player.AsyncChatEvent)
是旧版 [`AsyncPlayerChatEvent`](jd:paper:org.bukkit.event.player.AsyncPlayerChatEvent) 的改进版本，
它允许你为每个玩家单独渲染聊天消息。

:::note[`AsyncChatEvent` vs `ChatEvent`]

[AsyncChatEvent](jd:paper:io.papermc.paper.event.player.AsyncChatEvent)
 和 [ChatEvent](jd:paper:io.papermc.paper.event.player.ChatEvent)
之间的关键区别在于 [AsyncChatEvent](jd:paper:io.papermc.paper.event.player.AsyncChatEvent) 是异步触发的。

这意味着它不会阻塞主线程，并且会在监听器完成时发送聊天消息。
请注意，在异步上下文中（即事件处理器中）使用Bukkit API是不安全的，可能会抛出异常。
如果你需要使用Bukkit API，你可以使用 [ChatEvent](jd:paper:io.papermc.paper.event.player.ChatEvent) 。
然而，我们推荐使用 [BukkitScheduler](/paper/dev/scheduler)。

:::

## 理解渲染器

在我们开始使用新的聊天事件之前，我们需要理解新的渲染器是如何工作的。
渲染器是Paper允许插件在聊天消息发送给玩家之前修改聊天消息的方式。
这是通过使用 [ChatRenderer](jd:paper:io.papermc.paper.chat.ChatRenderer)
接口及其 [render](jd:paper:io.papermc.paper.chat.ChatRenderer#render(org.bukkit.entity.Player,net.kyori.adventure.text.Component,net.kyori.adventure.text.Component,net.kyori.adventure.audience.Audience)) 方法来实现的。
以前，这是通过使用 [AsyncPlayerChatEvent](jd:paper:org.bukkit.event.player.AsyncPlayerChatEvent)
及其 [setFormat](jd:paper:org.bukkit.event.player.AsyncPlayerChatEvent#setFormat(java.lang.String)) 方法来完成的。

```java title="ChatRenderer#render"
public Component render(Player source, Component sourceDisplayName, Component message, Audience viewer) {
    // ...
}
```

- `[render](jd:paper:io.papermc.paper.chat.ChatRenderer#render(org.bukkit.entity.Player,net.kyori.adventure.text.Component,net.kyori.adventure.text.Component,net.kyori.adventure.audience.Audience))` 方法在聊天消息发送给玩家时被调用。
- `source` 参数是发送消息的玩家。
- `sourceDisplayName` 参数是发送消息的玩家的显示名称。
- `message` 参数是发送的消息。
- `viewer` 参数是接收消息的玩家。

:::tip[`ChatRenderer.ViewerUnaware`]

如果你的渲染器不需要知道查看者的信息，
你可以使用 [ChatRenderer.ViewerUnaware](jd:paper:io.papermc.paper.chat.ChatRenderer$ViewerUnaware) 接口，
而不是 [ChatRenderer](jd:paper:io.papermc.paper.chat.ChatRenderer) 接口。
这将有助于提升性能，因为消息只会被渲染一次，而不是针对每个单独的玩家。

:::

## 使用渲染器

使用渲染器有两种方式：
1. 在一个类中实现 [ChatRenderer](jd:paper:io.papermc.paper.chat.ChatRenderer) 接口。
2. 使用 lambda 表达式。

根据你的渲染器的复杂程度，你可以选择其中一种方式。

### 实现 `ChatRenderer` 接口

使用渲染器的第一种方法是在一个类中实现 [ChatRenderer](jd:paper:io.papermc.paper.chat.ChatRenderer) 接口。
在这个例子中，我们将使用我们的`ChatListener`类。

接下来，
我们需要通过使用 [renderer](jd:paper:io.papermc.paper.event.player.AbstractChatEvent#renderer()) 方法告诉事件使用渲染器。

```java title="ChatListener.java"
public class ChatListener implements Listener, ChatRenderer { // 实现`ChatRenderer`和`Listener`接口

    // 监听`AsyncChatEvent`事件
    @EventHandler
    public void onChat(AsyncChatEvent event) {
        event.renderer(this); // 告诉事件使用我们的渲染器
    }

    // 覆盖`render`方法
    @Override
    public Component render(Player source, Component sourceDisplayName, Component message, Audience viewer) {
        // ...
    }
}
```

:::note[注意]

如果你决定为你的渲染器创建一个单独的类，那么需要知道的是，你无需在每次事件被触发时都实例化这个类。
在这种情况下，你可以使用[单例模式](https://en.wikipedia.org/wiki/Singleton_pattern)来创建该类的单个实例。

:::

### 使用 lambda 表达式

使用渲染器的另一种方法是通过 lambda 表达式。

```java title="ChatListener.java"
public class ChatListener implements Listener {

    @EventHandler
    public void onChat(AsyncChatEvent event) {
        event.renderer((source, sourceDisplayName, message, viewer) -> {
            // ...
        });
    }
}
```

## 渲染消息

现在我们有了渲染器，就可以开始渲染消息了。

假设我们希望渲染的聊天消息看起来像这样：

![](./assets/plain-message-rendering.png)

为了实现这一点，我们需要返回一个新的`[Component](https://jd.advntr.dev/api/latest/net/kyori/adventure/text/Component.html)`，其中包含我们想要发送的消息。

```java title="ChatListener.java"
public class ChatListener implements Listener, ChatRenderer {

    // 监听器逻辑

    @Override
    public Component render(Player source, Component sourceDisplayName, Component message, Audience viewer) {
        return sourceDisplayName
                .append(Component.text(": "))
                .append(message);
    }
}
```

现在你可以看到，消息已按照我们期望的方式渲染。

## 总结

关于新的聊天事件及其渲染器，你所需要了解的就这些了。
当然，组件本身还有很多其他用途。
如果你想了解更多关于组件的内容，可以阅读[组件文档](https://docs.advntr.dev/text.html)。
