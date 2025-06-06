---
slug: /tuning
description: 如何调优 Velocity 以获得更好的性能。
---

# 调优 Velocity

Velocity 开箱即用就具有良好的性能。我们深入研究，从智能算法选择开始，战略性地使用原生库，
一直到 JVM 级别，优化代理服务器，使 JVM 在优化代码时能做出更好的决策。

## 在 Linux 上托管代理服务器

Velocity 带有高性能、专门调优的压缩和加密原生库，以及来自 Netty 的原生传输。
但是，由于支持限制，编译的原生库仅在 Linux x86_64 和 aarch64 上经过验证可以工作。
虽然 Velocity 不需要原生库也能工作，但你的性能会受到影响。因此，我们强烈建议
所有生产环境的 Velocity 部署都在 x86_64 Linux 上运行。

## 适当分配服务器资源

你应该始终确保为你想要在代理服务器上同时容纳的玩家数量分配正确的堆内存、网络带宽和获取正确的 CPU。
例如，你不太可能在树莓派 Zero 上容纳 1,000 名玩家，但如果你有来自 Intel 或 AMD 的最新高端服务器 CPU，
你就有更好的机会。

没有"一刀切"的硬件推荐，只有针对你可以预期的玩家数量的一般准则：

- 倾向于选择核心数量多但时钟速度较低的 CPU。与 Minecraft 服务器不同，Velocity 实际上可以
  从额外的核心中受益，而单线程性能不那么重要。
- 你应该始终有足够的内存来运行 Velocity，包括 JVM 开销和操作系统的空间。对于粗略的最小推荐内存量，
  将代理服务器堆的大小翻倍，然后再加 2GB。例如，对于一个 2GB 堆的代理服务器，计划至少获取 6GB 内存。
- 磁盘速度不重要。固态硬盘很好但不是严格必需的。同样，磁盘容量也不重要。

### 关于推测执行安全漏洞的特别说明

从 2018 年开始，发现了一些关于现代 CPU 使用的[推测执行](https://en.wikipedia.org/wiki/Speculative_execution)
的安全漏洞。

这些漏洞的缓解措施可能会带来痛苦的性能影响，特别是在容易受到 Meltdown 攻击的处理器上，
如果在虚拟机中运行则会进一步加剧。Velocity 作为一个网络应用程序，对这些缓解措施引入的性能影响特别敏感。

为了最小化这些影响，我们建议在具有针对 Spectre 和 Meltdown 的缓解措施的 CPU 的机器上托管你的代理服务器。
2019 年及以后发布的处理器通常包含针对 Spectre 和 Meltdown 的缓解措施。

如果你使用的是容易受到 Spectre 和/或 Meltdown 攻击的 CPU，并且愿意为了性能而冒安全风险，
也可以根据你使用的操作系统禁用 Spectre/Meltdown 缓解措施。但请注意，你禁用这些安全缓解措施_需要自担风险_。
Velocity 项目不建议你禁用这些缓解措施。

## 分配足够的堆内存

除了有足够的 CPU、内存和网络带宽外，你还必须为代理服务器分配足够的 Java 堆内存。
不这样做可能会导致延迟，在严重的情况下可能会导致代理服务器因为内存不足而被 Java 虚拟机终止。

一般经验法则是每 500 名玩家分配 512MB，再加上一些额外的空间以留出错误余地（通常额外 1GB）。
例如，如果你想在单个代理服务器上处理 1,000 名玩家，计划分配 2GB 的堆内存。

### 关于容器的特别说明

**如果你使用容器化设置（如使用 Kubernetes、Pterodactyl 或直接使用 Docker），
你不应该将全部内存分配给堆！**这样做_很可能_会导致代理服务器被内核的内存不足杀手杀死，
这将导致你的代理服务器在最糟糕的时候宕机。

对堆的安全（尽管保守）设置是将分配给代理服务器容器的总内存的一半分配给堆。
例如，如果你知道代理服务器需要容纳 1,000 名玩家，那么给容器分配 4GB，给代理服务器分配 2GB 的堆。

## 调优你的启动标志

我们还建议调优你的启动标志。当前的建议是：

```
-XX:+UseG1GC -XX:G1HeapRegionSize=4M -XX:+UnlockExperimentalVMOptions -XX:+ParallelRefProcEnabled -XX:+AlwaysPreTouch -XX:MaxInlineLevel=15
```

你将在 `java` 命令之后但在 `-jar` 参数之前添加这些标志。

### 标志说明

这些标志大多集中在调优 G1 垃圾收集器以更适合 Velocity 的工作负载。其中一个标志（`-XX:MaxInlineLevel=15`）
通常可以提高整体性能。

在 Java 9 发布之前，默认的 Java 垃圾收集器是并行 GC。这是一个停止世界的收集器，它并行执行其工作。
问题是它的暂停时间往往很长，不适合 Minecraft（经常表现为看似无法解释的延迟峰值）。

Velocity 推荐的垃圾收集器是基于区域的 G1 收集器。我们推荐 G1 有几个原因：

- 它在吞吐量和暂停时间之间取得了正确的平衡。吞吐量大致是代理服务器可以完成的工作量。
- 它与大多数设置兼容（它在 Java 8 中可用，这是我们支持的最早的 Java 版本）。

使用这些标志的设置通常每隔几分钟就会有很低（少于 10 毫秒）的 GC 暂停，这对 Minecraft 来说非常好。

### 其他配置

:::caution

偏离我们推荐的配置完全由你自己承担风险。

:::

Velocity 是一个倾向于紧密遵循代际假说的应用程序。它也经过调优以尽可能减少垃圾收集器的负载。

#### ZGC

ZGC（Z 垃圾收集器）在 Java 11 中引入并在 Java 15 中稳定，已被证明在一个大规模的 Velocity 部署中成功。

从本质上讲，ZGC 是一个并发的、无代际的垃圾收集器，强调以牺牲吞吐量为代价的低延迟。
考虑到 Velocity 作为网络代理的性质，低吞吐量和高吞吐量都很重要，我们建议谨慎使用 ZGC，
并且仅在使用 Java 15 或更高版本时使用。

ZGC 的主要调优标志是堆大小 - 如果 ZGC 无法以比代理服务器分配垃圾更快的速度收集垃圾，
生成垃圾的线程将暂时暂停，导致代理服务器看起来有延迟。我们的堆大小建议仍然适用，
但要准备在必要时给代理服务器更多内存。

#### Shenandoah

在 Java 11 中引入并在 Java 15 中声明稳定，Shenandoah 类似于 G1，是一个并发的、代际的垃圾收集器，
但它并行执行更多工作。

Velocity 团队不知道在野外有任何成功的 Shenandoah 与 Velocity 的部署。

#### OpenJ9

OpenJ9 是 HotSpot JVM 的一个替代品，源自 IBM 的 J9 JVM，主要关注云工作负载。因此，它的行为与 HotSpot
有很大不同。相应地，它有一套完全不同的垃圾收集器。

默认的 `gencon` 垃圾收集器应该可以与 Velocity 很好地配合使用。
