---
title: 使用调度器
description: 关于如何在 Velocity 中使用调度器 API 以运行任务的指南
slug: velocity/dev/scheduler-api
---

Velocity 调度器允许你决定你的插件任务何时以及如何运行，从而实现对执行的精细控制。
在 Velocity 中，没有主线程。
所有通过 Velocity 调度器运行的任务都是异步运行的。

## 运行延迟任务

所有调度都是通过使用从 [`Scheduler`](jd:velocity:com.velocitypowered.api.scheduler.Scheduler)
返回的 [`TaskBuilder`](jd:velocity:com.velocitypowered.api.scheduler.Scheduler$TaskBuilder) 来完成的。
这个流畅的构建器可以链式调用来配置调度的详细信息。

```java
server.getScheduler()
  .buildTask(plugin, () -> {
    // 在这里执行操作
  })
  .delay(2L, TimeUnit.SECONDS)
  .schedule();
```

在这里，我们安排了一个任务，将在 2 秒后运行。
Velocity 需要你的插件实例，上面的 `plugin`。
如果你是从你的主插件类中安排任务， 你可以直接使用 `this`。

时间参数是通过一个 `long` 类型和一个 [`TimeUnit`](jd:java:java.util.concurrent.TimeUnit) 来指定的。
使用时间单位可以使安排延迟任务更加易读，并且能够提供更高的精度。
`2L, TimeUnit.SECONDS` 比模糊的 `2000L` 更容易理解。

你也可以使用一个 [`Duration`](jd:java:java.time.Duration) 来指定时间参数，
例如：`Duration.ofSeconds(5L)`。

## 运行重复任务

创建一个重复任务与创建延迟任务类似，
但你还需要指定 [`repeat(long, TimeUnit)`](jd:velocity:com.velocitypowered.api.scheduler.Scheduler$TaskBuilder#repeat(long,java.util.concurrent.TimeUnit))。
这个例子将每 5 分钟重复一次。

```java
server.getScheduler()
  .buildTask(plugin, () -> {
    // 在这里执行操作
  })
  .repeat(5L, TimeUnit.MINUTES)
  .schedule();
```

## 立即运行任务

任务使用调度器的缓存线程池来执行所有操作，该线程池会重用线程。
为了利用这个线程池来运行立即执行的异步任务，
只需省略 `TaskBuilder` 的 _delay_ 和 _repeat_ 方法即可。

## 取消任务

[`schedule()`](jd:velocity:com.velocitypowered.api.scheduler.Scheduler$TaskBuilder#schedule()) 方法返回一个
[`ScheduledTask`](jd:velocity:com.velocitypowered.api.scheduler.ScheduledTask)，
然后可以通过 [`cancel()`](jd:velocity:com.velocitypowered.api.scheduler.ScheduledTask#cancel()) 方法取消相关任务。
任务一旦取消，无法恢复。

此外，[`task.status()`](jd:velocity:com.velocitypowered.api.scheduler.ScheduledTask#status())
将返回任务的当前状态。

```java
ScheduledTask task = server.getScheduler()
  .buildTask(plugin, () -> {
    // 在这里执行操作
  })
  .repeat(5L, TimeUnit.MINUTES)
  .schedule();
// ...
task.cancel();
// ...
System.out.println(task.status());
```

你也可以使用 `Consumer<ScheduledTask>` 来安排 _self-cancelling（自我取消）_ 任务。

```java
AtomicInteger integer = new AtomicInteger(0);

ScheduledTask task = server.getScheduler()
  .buildTask(plugin, (selfTask) -> {
    // 在这里执行操作，例如...
    if (integer.addAndGet(1) > 10) {
      selfTask.cancel();
    }
  })
  .repeat(Duration.ofSeconds(4L))
  .schedule();
```

## 从插件中获取任务

你可以使用 [`tasksByPlugin(Object)`](jd:velocity:com.velocitypowered.api.scheduler.Scheduler#tasksByPlugin(java.lang.Object))
获取一个插件安排的所有任务。

```java
Collection<ScheduledTask> tasks = server.getScheduler().tasksByPlugin(plugin);
// 然后你可以控制它们，例如，取消一个插件安排的所有任务。
for (ScheduledTask task : tasks) {
  task.cancel();
}
```
