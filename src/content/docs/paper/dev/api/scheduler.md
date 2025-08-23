---
title: 调度器
description: 如何使用 BukkitScheduler 在特定时间运行代码的指南
slug: paper/dev/scheduler
---

[`BukkitScheduler`](jd:paper:org.bukkit.scheduler.BukkitScheduler) 可用于安排代码稍后运行或重复运行。

:::note[Folia]

本指南适用于非 Folia 的 Bukkit 服务器。如果你正在使用 Folia，你应该使用其各自的调度器。

:::

## 什么是刻 Tick?

每个游戏都会运行一个称为游戏循环的程序，它本质上会反复执行游戏的所有逻辑。
在 Minecraft 中，游戏循环的一次执行称为一个“tick”。

在 Minecraft 中，每秒有 20 个 tick，换句话说，
每50毫秒一个 tick。这意味着游戏循环每秒执行 20 次。
如果一个 tick 的执行时间超过50毫秒，那么你的服务器就开始跟不上工作进度，出现延迟。

一个安排在 100 个 tick 后运行的任务将在 5 秒后运行（100 个 tick / 每秒 20 个 tick = 5 秒）。
然而，如果服务器每秒只运行 10 个 tick，
那么一个安排在 100 个 tick 后运行的任务将需要 10 秒。

### 将人类时间单位与 Minecraft 的 tick 进行换算

调度器中所有涉及延迟或周期的方法都以 tick 作为时间单位。

将人类时间单位与 tick 进行换算，以及反过来换算，都很简单，公式如下：
- `ticks = seconds * 20`
- `seconds = ticks / 20`

你可以通过使用
`[TimeUnit](jd:java:java.util.concurrent.TimeUnit)`枚举来使代码更具可读性，
例如将5分钟换算成 tick，以及反过来换算：
- `TimeUnit.MINUTES.toSeconds(5) * 20`
- `TimeUnit.SECONDS.toMinutes(ticks / 20)`

你也可以使用 Paper 中的 `Tick` 类来在人类时间单位和 tick 之间进行换算。
例如，将 5 分钟换算成 tick：`Tick.tick().fromDuration(Duration.ofMinutes(5))` 将得到 `6000` 个 tick。

## 获取调度器

要获取调度器，
你可以使用 `Server` 类中的 `[getScheduler](jd:paper:org.bukkit.Server#getScheduler())` 方法，例如在你的 `onEnable` 方法中：
```java
@Override
public void onEnable() {
    BukkitScheduler scheduler = this.getServer().getScheduler();
}
```

## 安排任务

安排任务需要你传递以下内容：

- 你的插件实例
- 要运行的代码，
  可以使用 `[Runnable](jd:java:java.lang.Runnable)` 或 `[Consumer](jd:java:java.util.function.Consumer)<[BukkitTask](jd:paper:org.bukkit.scheduler.BukkitTask)>`
- 任务首次运行前的延迟 tick 数
- 如果你安排的是重复任务，每次执行之间的周期 tick 数

### 同步任务和异步任务的区别

#### 同步任务（主线程）

同步任务是在主线程上执行的任务。
这个线程也是处理所有游戏逻辑的线程。

在主线程上安排的所有任务都会影响服务器的性能。
如果你的任务涉及网络请求、访问文件、数据库或其他耗时操作，
你应该考虑使用异步任务。

#### 异步任务（非主线程）

异步任务是在单独的线程上执行的任务，
因此不会直接影响服务器的性能。

:::caution[警告]

**Bukkit API 的大部分内容在异步任务中使用是不安全的**。
如果一个方法会更改或访问世界状态，那么从异步任务中使用它是不安全的。

:::

:::note[注意]

尽管任务是在单独的线程上执行的，但它们仍然是从主线程启动的，
如果服务器出现延迟，它们也会受到影响，例如 20 个 tick 并不一定是正好 1 秒。

如果你需要一个独立于服务器运行的调度器，
可以考虑使用你自己的 `[ScheduledExecutorService](jd:java:java.util.concurrent.ScheduledExecutorService)`。
你可以参考[这个指南](https://www.baeldung.com/java-executor-service-tutorial#ScheduledExecutorService)来学习如何使用它。

:::

### 安排任务的不同方法

#### 使用 `Runnable`

`[Runnable](jd:java:java.lang.Runnable)` 接口用于最简单的任务，
这些任务不需要 `[BukkitTask](jd:paper:org.bukkit.scheduler.BukkitTask)` 实例。

你可以选择在一个单独的类中实现它，例如：

```java title="MyRunnableTask.java"
public class MyRunnableTask implements Runnable {

    private final MyPlugin plugin;

    public MyRunnableTask(MyPlugin plugin) {
        this.plugin = plugin;
    }

    @Override
    public void run() {
        this.plugin.getServer().broadcast(Component.text("你好，世界！"));
    }
}
```
```java
scheduler.runTaskLater(plugin, new MyRunnableTask(plugin), 20);
```

或者使用 lambda 表达式，这对于简单且简短的任务非常合适：

```java
scheduler.runTaskLater(plugin, /* Lambda: */ () -> {
    this.plugin.getServer().broadcast(Component.text("你好，世界！"));
}, /* Lambda 表达式的结尾 */ 20);
```

#### 使用 `Consumer<BukkitTask>`

`[Consumer](jd:java:java.util.function.Consumer)`
接口用于需要 `[BukkitTask](jd:paper:org.bukkit.scheduler.BukkitTask)`
实例的任务（通常在重复任务中），例如当你需要从任务内部取消任务时。

你可以选择在一个单独的类中实现它，类似于`Runnable`，例如：

```java title="MyConsumerTask.java"
public class MyConsumerTask implements Consumer<BukkitTask> {

    private final UUID entityId;

    public MyConsumerTask(UUID uuid) {
        this.entityId = uuid;
    }

    @Override
    public void accept(BukkitTask task) {
        Entity entity = Bukkit.getServer().getEntity(this.entityId);

        if (entity instanceof LivingEntity livingEntity) {
            livingEntity.addPotionEffect(new PotionEffect(PotionEffectType.SPEED, 20, 1));
            return;
        }

        task.cancel(); // 该实体已不再有效，继续运行此任务毫无意义。
    }
}
```
```java
scheduler.runTaskTimer(plugin, new MyConsumerTask(someEntityId), 0, 20);
```

或者使用 lambda 表达式，这在处理简短且简单的任务时更加简洁。

```java
scheduler.runTaskTimer(plugin, /* Lambda: */ task -> {
    Entity entity = Bukkit.getServer().getEntity(entityId);

    if (entity instanceof LivingEntity livingEntity) {
        livingEntity.addPotionEffect(new PotionEffect(PotionEffectType.SPEED, 20, 1));
        return;
    }

    task.cancel(); // 该实体已不再有效，继续运行此任务毫无意义。
} /* Lambda 表达式的结尾 */, 0, 20);
```

##### 使用 `BukkitRunnable`

`[BukkitRunnable](jd:paper:org.bukkit.scheduler.BukkitRunnable)` 是一个实现了 `Runnable` 的类，并且持有一个 `BukkitTask` 实例。
这意味着你无需在 `run()` 方法中访问任务，
你可以直接使用 `[this.cancel()](jd:paper:org.bukkit.scheduler.BukkitRunnable#cancel())` 方法：

```java title="CustomRunnable.java"
public class CustomRunnable extends BukkitRunnable {

    private final UUID entityId;

    public CustomRunnable(UUID uuid) {
        this.entityId = uuid;
    }

    @Override
    public void run() {
        Entity entity = Bukkit.getServer().getEntity(this.entityId);

        if (entity instanceof LivingEntity livingEntity) {
            livingEntity.addPotionEffect(new PotionEffect(PotionEffectType.SPEED, 20, 1));
            return;
        }

        this.cancel(); // 该实体已不再有效，继续运行此任务毫无意义。
    }
}
```

这仅仅是为实体添加药水效果，直到实体死亡。

#### 使用 0 个 tick的延迟

0 个 tick 的延迟被视为你希望在下一个 tick 运行任务。
如果你在服务器启动时，或者在服务器启用之前安排了一个延迟为 0 个 tick 的任务，那么这个任务将在服务器启用之前执行。
