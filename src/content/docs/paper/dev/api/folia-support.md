---
title: 支持 Paper 和 Folia
description: 如何在您的插件中同时支持 Folia 和 Paper。
slug: paper/dev/folia-support
---

![](https://assets.papermc.io/brand/folia.png)

[Folia](https://github.com/PaperMC/Folia) 是 Paper 的一个分支，目前由 PaperMC 团队维护。
它增加了将世界划分为区域的能力，具体细节可以在[这里](/folia/reference/overview)找到。

# 检查 Folia

根据插件运行的平台，你可能需要以不同的方式实现功能。
为此，你可以使用这个实用方法来检查当前服务器是否正在运行 Folia：

```java
private static boolean isFolia() {
    try {
        Class.forName("io.papermc.paper.threadedregions.RegionizedServer");
        return true;
    } catch (ClassNotFoundException e) {
        return false;
    }
}
```

## 调度器

为了同时支持 Paper 和 Folia，你必须使用正确的调度器。
Folia 提供了不同类型的调度器，可用于不同的场景。它们包括：

- [Global](#全局调度器)
- [Region](#区域调度器)
- [Async](#异步调度器)
- [Entity](#实体调度器)

如果你在运行 Paper 时使用这些调度器，
它们会在内部被处理，以提供与运行 Folia 时相同的功能。

### 全局调度器
你在全局调度器上运行的任务将在全局区域执行，更多信息可以查看[这里](/folia/reference/overview#global-region)。
你应该使用这个调度器来处理不属于任何特定区域的任务。可以通过以下方式获取这些任务：
```java
GlobalRegionScheduler globalScheduler = server.getGlobalRegionScheduler();
```

### 区域调度器
区域调度器将负责运行拥有特定位置的区域的任务。
不要使用这个调度器来操作实体，因为这个调度器与区域绑定。
每个实体都有其[自己的调度器](#entity-scheduler)，它会跟随实体跨越区域。例如，假设我想将一个方块设置为蜂箱：
```java
Location locationToChange = ...;
RegionScheduler scheduler = server.getRegionScheduler();

scheduler.execute(plugin, locationToChange, () -> {
    locationToChange.getBlock().setType(Material.BEEHIVE);
});
```

我们将位置作为参数传递给[`RegionScheduler`](jd:paper:io.papermc.paper.threadedregions.scheduler.RegionScheduler)，
因为它需要确定在哪个区域上执行。

### 异步调度器
异步调度器可用于运行与服务器刻更新进程无关的任务。可以通过以下方式获取：
```java
AsyncScheduler asyncScheduler = server.getAsyncScheduler();
```

### 实体调度器
实体调度器用于在实体上执行任务。
这些调度器会跟随实体移动，因此你必须使用它们，而不是区域调度器。
```java
EntityScheduler scheduler = entity.getScheduler();
```
