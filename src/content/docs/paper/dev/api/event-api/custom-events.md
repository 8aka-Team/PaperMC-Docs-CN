---
title: 自定义事件
description: 一个指南，展示如何为您的插件添加自定义事件。
slug: paper/dev/custom-events
---

创建自定义事件是为你的插件添加功能的好方法。
这将允许其他插件监听你的自定义事件并为你的插件添加功能。

## 创建自定义事件

要创建自定义事件，你需要创建一个继承自[`Event`](jd:paper:org.bukkit.event.Event)的类。
每个事件都需要一个[`HandlerList`](jd:paper:org.bukkit.event.HandlerList)，它将包含所有正在监听该事件的监听器。
唯一例外的情况是，当你有一个事件类不能被触发，而是作为其他事件的父类时。
例如，[`BlockPistonEvent`](jd:paper:org.bukkit.event.block.BlockPistonEvent)不能直接被监听。

当事件被调用时，这个列表用于调用监听器。

:::note[注意]

尽管 `getHandlerList` 并不是从 `Event` 继承的，但你需要添加一个静态的 `getHandlerList()` 方法，
并返回你事件的 `HandlerList`。这两种方法都是你的事件能够正常工作的必要条件。

:::

```java title="PaperIsCoolEvent.java"
public class PaperIsCoolEvent extends Event {

    private static final HandlerList HANDLER_LIST = new HandlerList();

    public static HandlerList getHandlerList() {
        return HANDLER_LIST;
    }

    @Override
    public HandlerList getHandlers() {
        return HANDLER_LIST;
    }
}
```

现在我们已经创建了我们的事件，我们可以给它添加一些功能。
也许这将包含一条消息，当事件被调用时，这条消息将被广播到服务器上。

```java title="PaperIsCoolEvent.java"
public class PaperIsCoolEvent extends Event {

    private static final HandlerList HANDLER_LIST = new HandlerList();
    private Component message;

    public PaperIsCoolEvent(Component message) {
        this.message = message;
    }

    public Component getMessage() {
        return this.message;
    }

    public void setMessage(Component message) {
        this.message = message;
    }

    public static HandlerList getHandlerList() {
        return HANDLER_LIST;
    }

    @Override
    public HandlerList getHandlers() {
        return HANDLER_LIST;
    }
}
```

## 调用事件

现在我们已经创建了我们的事件，我们可以调用它。

```java title="ExamplePlugin.java"
public class ExamplePlugin extends JavaPlugin {

    // ...

    public void callCoolPaperEvent() {
        PaperIsCoolEvent coolEvent = new PaperIsCoolEvent(Component.text("Paper 很酷！"));
        coolEvent.callEvent();
        // 插件可能已经在它们的监听器中更改了消息。因此，我们需要再次获取消息。
        // 这种事件结构允许其他插件根据自己的喜好更改消息。
        // 例如，一个为所有消息添加前缀的插件。
        Bukkit.broadcast(coolEvent.getMessage());
    }
}
```

## 实现取消

如果你想允许你的事件被取消，你可以实现 `Cancellable` 接口。

```java title="PaperIsCoolEvent.java"
public class PaperIsCoolEvent extends Event implements Cancellable {

    private static final HandlerList HANDLER_LIST = new HandlerList();
    private Component message;
    private boolean cancelled;

    // ...

    @Override
    public boolean isCancelled() {
        return this.cancelled;
    }

    @Override
    public void setCancelled(boolean cancelled) {
        this.cancelled = cancelled;
    }
}
```

现在，当事件被调用时，你可以检查它是否被取消，并相应地采取行动。

```java title="ExamplePlugin.java"
public class ExamplePlugin extends JavaPlugin {

    // ...

    public void callCoolPaperEvent() {
        PaperIsCoolEvent coolEvent = new PaperIsCoolEvent(Component.text("Paper 很酷！"));
        coolEvent.callEvent();
        if (!coolEvent.isCancelled()) {
            Bukkit.broadcast(coolEvent.getMessage());
        }
    }
}
```

当一个事件可以被取消时，如果事件被取消，[`Event#callEvent()`](jd:paper:org.bukkit.event.Event#callEvent()) 将返回 `false`。
这允许你直接在 `if` 语句中使用 `callEvent`，
而无需手动检查 [`Cancellable#isCancelled()`](jd:paper:org.bukkit.event.Cancellable#isCancelled())。

```java title="ExamplePlugin.java"
public class ExamplePlugin extends JavaPlugin {

    // ...

    public void callCoolPaperEvent() {
        PaperIsCoolEvent coolEvent = new PaperIsCoolEvent(Component.text("Paper 很酷！"));
        if (coolEvent.callEvent()) { // 直接从 `callEvent` 获取输出
            Bukkit.broadcast(coolEvent.getMessage());
        }
    }
}
```
