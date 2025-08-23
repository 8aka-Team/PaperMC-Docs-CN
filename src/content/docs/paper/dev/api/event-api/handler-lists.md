---
title: Handler 列表
description: 对事件的处理器列表（HandlerList）的解释。
slug: paper/dev/handler-lists
---

每一个可以被监听的 [`Event`](jd:paper:org.bukkit.event.Event) 都有一个 [`HandlerList`](jd:paper:org.bukkit.event.HandlerList)，
其中包含了所有正在监听该事件的监听器。
当事件被触发时，这个列表用于调用监听器。

## 获取事件的处理器列表

要获取事件的处理器列表，可以在特定的事件类上调用 `getHandlerList()` 方法。

```java title="ExampleListener.java"
public class ExampleListener implements Listener {

    @EventHandler
    public void onPlayerJoin(PlayerJoinEvent event) {
        HandlerList handlerList = event.getHandlerList();
        // ...
    }

    // 或者:

    public ExampleListener() {
        // 通过静态获取器访问处理器列表
        HandlerList handlerList = PlayerJoinEvent.getHandlerList();
        // ...
    }
}
```

## 注销一个监听器

要注销一个监听器，可以在该监听器注册的 `HandlerList` 上调用 `unregister()` 方法。

```java title="ExampleListener.java"
public class ExampleListener implements Listener {

    @EventHandler
    public void onPlayerJoin(PlayerJoinEvent event) {
        HandlerList handlerList = event.getHandlerList();
        handlerList.unregister(this);
        // ...
    }

    // 或者:

    public ExampleListener() {
        // 通过静态获取器访问处理器列表
        HandlerList handlerList = PlayerJoinEvent.getHandlerList();
        handlerList.unregister(this);
        // 承认这是一个相当愚蠢的例子……
    }
}
```

你可以基于 [`Listener`](jd:paper:org.bukkit.event.Listener) 或者
[`Plugin`](jd:paper:org.bukkit.plugin.Plugin) 来注销，这样会更加方便。
同样，你也可以通过在 `HandlerList` 上调用
[`unregisterAll()`](jd:paper:org.bukkit.event.HandlerList#unregisterAll()) 方法来注销某个特定事件的所有监听器。
