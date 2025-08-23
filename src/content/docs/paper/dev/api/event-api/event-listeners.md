---
title: 监听器
description: 开发者指南，介绍如何监听广播的事件。
slug: paper/dev/event-listeners
---

事件是一种高效的方式，用于监听游戏中发生的特定行为。它们可以由服务器调用，也可以由插件调用。
当发生某些事情时，例如玩家加入服务器或方块被破坏，服务器或插件会调用这些事件。
插件还可以调用自定义事件，例如玩家完成任务，供其他插件监听。

## 您的 listener 类

要监听事件，你需要创建一个实现了 [`Listener`](jd:paper:org.bukkit.event.Listener) 的类。
这个类可以叫任何名字，但建议命名为与你正在监听的事件相关的名称。

```java title="ExampleListener.java"
public class ExampleListener implements Listener {
    // ...
}
```

## `@EventHandler`

要监听一个事件，你需要创建一个带有 [`@EventHandler`](jd:paper:org.bukkit.event.EventHandler) 注解的方法。
这个方法可以叫任何名字，但建议命名为与它所监听的事件相关的有意义的名称。

## 监听器方法

方法体不需要返回任何数据，因此使用 `void` 作为返回类型。
监听器接收一个参数，即正在监听的事件。

```java title="ExampleListener.java"
public class ExampleListener implements Listener {

    @EventHandler
    public void onPlayerMove(PlayerMoveEvent event) {
        // ...
    }
}
```

:::note[事件]

虽然没有一个专门列出可以监听的事件的列表，
但你可以查看[这里](jd:paper:org.bukkit.event.Event)，
以查看所有继承自 `Event` 的类。

只有当一个事件具有静态的 `getHandlerList` 方法时，它才可以被监听。

:::

## 注册监听器

要注册监听器，你需要调用 `Bukkit.getPluginManager().registerEvents()`，
并传入你的监听器类实例和你的插件实例。

这将注册你的监听器类并允许它监听事件。
这通常在插件的 `onEnable()` 方法中完成，以便在服务器开始运行时注册。

```java title="ExamplePlugin.java"
public class ExamplePlugin extends JavaPlugin {

    @Override
    public void onEnable() {
        getServer().getPluginManager().registerEvents(new ExampleListener(), this);
    }
}
```

## 事件优先级

你也可以指定事件的优先级。

```java title="ExampleListener.java"
public class ExampleListener implements Listener {

    @EventHandler(priority = EventPriority.HIGH)
    public void onPlayerMove(PlayerMoveEvent event) {
        // ...
    }
}
```
你可以使用六种不同的优先级：
- [`EventPriority.LOWEST`](jd:paper:org.bukkit.event.EventPriority#LOWEST)
- [`EventPriority.LOW`](jd:paper:org.bukkit.event.EventPriority#LOW)
- [`EventPriority.NORMAL`](jd:paper:org.bukkit.event.EventPriority#NORMAL)
- [`EventPriority.HIGH`](jd:paper:org.bukkit.event.EventPriority#HIGH)
- [`EventPriority.HIGHEST`](jd:paper:org.bukkit.event.EventPriority#HIGHEST)
- [`EventPriority.MONITOR`](jd:paper:org.bukkit.event.EventPriority#MONITOR)

优先级的顺序有些反直觉。
**优先级越高**，事件被调用得**越晚**。
例如，如果你的插件需要在某个事件中拥有最后的决定权——以避免它被更改——你应该使用 `EventPriority.HIGHEST`。

:::note[注意]

`MONITOR`优先级用于监控事件，但不会更改它。
它会在所有其他优先级调用之后被调用。这意味着你可以获取任何插件交互的结果，例如取消或修改。

:::

## 事件取消

一些事件可以被取消，从而阻止给定的动作完成。
这些事件实现了 [`Cancellable`](jd:paper:org.bukkit.event.Cancellable)。

```java title="ExampleListener.java"
public class ExampleListener implements Listener {

    @EventHandler
    public void onPlayerMove(PlayerMoveEvent event) {
        event.setCancelled(true);
    }
}
```

:::caution[警告]

重要的是要考虑另一个插件可能在你的插件被调用之前已经取消或更改了该事件。
在对该事件进行任何操作之前，始终要检查该事件。

:::

上面的例子将取消该事件，这意味着玩家将无法移动。
一旦事件被取消，它将继续调用该事件的其他监听器，
除非它们在 `@EventHandler` 注解中添加 `ignoreCancelled = true` 以忽略已取消的事件。

```java title="ExampleListener.java"
public class ExampleListener implements Listener {

    @EventHandler(ignoreCancelled = true)
    public void onPlayerMove(PlayerMoveEvent event) {
        // ...
    }
}
```
