---
title: 堆栈跟踪
description: 当发生异常时，JVM 会生成堆栈跟踪（Stacktraces）。本指南将讨论如何阅读堆栈跟踪的基础知识
slug: paper/dev/reading-stacktraces
---

## 什么是堆栈跟踪？
在 Java 中，堆栈跟踪显示了一个线程的调用栈。调用栈是导致程序当前执行点的路径。
通常，当异常没有被正确处理时，堆栈跟踪会打印到控制台。

堆栈跟踪是调试代码的有用工具。它显示了导致错误的确切代码行，以及调用该代码行的代码行，依此类推。
这很有用，因为它使您能够看到导致错误的确切执行路径。

### 示例

以下是一个由于 `NullPointerException` 引起的堆栈跟踪示例：

```
[15:20:42 ERROR]: Could not pass event PluginEnableEvent to TestPlugin v1.0
java.lang.NullPointerException: Cannot invoke "Object.toString()" because "player" is null
        at io.papermc.testplugin.TestPlugin.onPluginEnable(TestPlugin.java:23) ~[TestPlugin-1.0-SNAPSHOT.jar:?]
        at com.destroystokyo.paper.event.executor.asm.generated.GeneratedEventExecutor1.execute(Unknown Source) ~[?:?]
        at org.bukkit.plugin.EventExecutor$2.execute(EventExecutor.java:77) ~[paper-api-1.20.2-R0.1-SNAPSHOT.jar:?]
        at co.aikar.timings.TimedEventExecutor.execute(TimedEventExecutor.java:81) ~[paper-api-1.20.2-R0.1-SNAPSHOT.jar:git-Paper-49]
        at org.bukkit.plugin.RegisteredListener.callEvent(RegisteredListener.java:70) ~[paper-api-1.20.2-R0.1-SNAPSHOT.jar:?]
        at io.papermc.paper.plugin.manager.PaperEventManager.callEvent(PaperEventManager.java:54) ~[paper-1.20.2.jar:git-Paper-49]
        at io.papermc.paper.plugin.manager.PaperPluginManagerImpl.callEvent(PaperPluginManagerImpl.java:126) ~[paper-1.20.2.jar:git-Paper-49]
        at org.bukkit.plugin.SimplePluginManager.callEvent(SimplePluginManager.java:615) ~[paper-api-1.20.2-R0.1-SNAPSHOT.jar:?]
        at io.papermc.paper.plugin.manager.PaperPluginInstanceManager.enablePlugin(PaperPluginInstanceManager.java:200) ~[paper-1.20.2.jar:git-Paper-49]
        at io.papermc.paper.plugin.manager.PaperPluginManagerImpl.enablePlugin(PaperPluginManagerImpl.java:104) ~[paper-1.20.2.jar:git-Paper-49]
        at org.bukkit.plugin.SimplePluginManager.enablePlugin(SimplePluginManager.java:507) ~[paper-api-1.20.2-R0.1-SNAPSHOT.jar:?]
        at org.bukkit.craftbukkit.v1_20_R2.CraftServer.enablePlugin(CraftServer.java:636) ~[paper-1.20.2.jar:git-Paper-49]
        at org.bukkit.craftbukkit.v1_20_R2.CraftServer.enablePlugins(CraftServer.java:547) ~[paper-1.20.2.jar:git-Paper-49]
        at net.minecraft.server.MinecraftServer.loadWorld0(MinecraftServer.java:636) ~[paper-1.20.2.jar:git-Paper-49]
        at net.minecraft.server.MinecraftServer.loadLevel(MinecraftServer.java:435) ~[paper-1.20.2.jar:git-Paper-49]
        at net.minecraft.server.dedicated.DedicatedServer.initServer(DedicatedServer.java:308) ~[paper-1.20.2.jar:git-Paper-49]
        at net.minecraft.server.MinecraftServer.runServer(MinecraftServer.java:1101) ~[paper-1.20.2.jar:git-Paper-49]
        at net.minecraft.server.MinecraftServer.lambda$spin$0(MinecraftServer.java:318) ~[paper-1.20.2.jar:git-Paper-49]
        at java.lang.Thread.run(Thread.java:833) ~[?:?]
```

-   首先，我们可以看到这个特定的错误是在 `TestPlugin`
-   处理 [`PluginEnableEvent`](jd:paper:org.bukkit.event.server.PluginEnableEvent) 时发生的。

-   然后在第二行，我们可以看到异常的原因：
    > `java.lang.NullPointerException: Cannot invoke "Object.toString()" because "player" is null`

    这告诉我们异常是由一个 [`NullPointerException`](jd:java:java.lang.NullPointerException) 引起的，原因是尝试对一个为 null 的“player”对象调用 `toString()` 方法。

-   从这里开始，随着我们沿着堆栈跟踪向下查看，我们可以看到导致错误的确切执行路径。
    在这个例子中，堆栈跟踪的下一行是：
    > `at io.papermc.testplugin.TestPlugin.onPluginEnable(TestPlugin.java:23) ~[TestPlugin-1.0-SNAPSHOT.jar:?]`

    这告诉我们错误是在 `TestPlugin.java` 的第 23 行抛出的。

-   你可以继续沿着堆栈跟踪向下查看，看到导致错误的确切执行路径。
    在这个例子中，后续内容是服务器内部的调用，因此我们通常可以忽略它。

## 省略的堆栈跟踪

从 JDK 5 开始，JVM 开始省略某些异常的堆栈跟踪。
当 JVM 对代码进行优化时，这种情况很常见，你可能会遇到没有堆栈跟踪的 `NullPointerException`。
为了修复这个问题，你可以向 JVM 传递 `-XX:-OmitStackTraceInFastThrow` 参数：

```bash
java -XX:-OmitStackTraceInFastThrow -jar paper.jar
```
