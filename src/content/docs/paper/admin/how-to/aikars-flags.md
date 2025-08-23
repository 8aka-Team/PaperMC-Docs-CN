---
title: 启动参数
description: Aikar 的启动参数是一组用于提升 Paper 服务器性能的 JVM 参数
slug: paper/aikars-flags
---

## 推荐的 JVM 启动参数

:::caution[脚本生成器]

**此页面仅作为解释页面。**
如果您想生成启动脚本，请访问我们的 **[脚本生成器](/misc/tools/start-script-gen)**。

:::

```bash
java -Xms10G -Xmx10G -XX:+UseG1GC -XX:+ParallelRefProcEnabled -XX:MaxGCPauseMillis=200 -XX:+UnlockExperimentalVMOptions -XX:+DisableExplicitGC -XX:+AlwaysPreTouch -XX:G1NewSizePercent=30 -XX:G1MaxNewSizePercent=40 -XX:G1HeapRegionSize=8M -XX:G1ReservePercent=20 -XX:G1HeapWastePercent=5 -XX:G1MixedGCCountTarget=4 -XX:InitiatingHeapOccupancyPercent=15 -XX:G1MixedGCLiveThresholdPercent=90 -XX:G1RSetUpdatingPauseTimePercent=5 -XX:SurvivorRatio=32 -XX:+PerfDisableSharedMem -XX:MaxTenuringThreshold=1 -Dusing.aikars.flags=https://mcflags.emc.gs -Daikars.new.flags=true -jar paper.jar --nogui
```

:::danger[在共享主机上，不要分配所有可用内存！]

在设置 `Xms` 和 `Xmx` 值时，如果您的主机说您有 8GB 内存，**不要使用8GB**！

Minecraft（以及Java）在 `Xmx` 参数之外还需要额外的内存。
建议您 **将 `Xmx` 和 `Xms` 减少约1000-1500MB** ，以避免内存不足或 `OOMKiller` 终止您的服务器。
这也为操作系统留出了使用内存的空间。

您有8GB内存吗？为了安全起见，请使用 6500MB。
_但您也可以询问您的主机提供商，他们是否会为您承担这部分开销，
并为您提供 9500M。**译者注：完全不会。**_

:::

## 推荐内存

**我们建议至少使用6-10GB**，不管玩家数量多少！如果您无法承担10GB的内存，
请尽可能多地分配，但要确保为操作系统留出一些内存。
G1GC 在内存足够多的情况下运行的会更好。

然而，超过一定限度，更多的内存并不意味着更好的性能。
最终您会达到收益递减的点。
为服务器购买 32GB 的内存只会浪费您的金钱，而收益微乎其微。

## Java GC 日志记录

如果您使用这些参数时遇到旧代（old gen）问题，
请根据您的 Java 版本添加以下参数以启用 GC 日志记录：

**Java 8-10**

```bash
-Xloggc:gc.log -verbose:gc -XX:+PrintGCDetails -XX:+PrintGCDateStamps -XX:+PrintGCTimeStamps
-XX:+UseGCLogFileRotation -XX:NumberOfGCLogFiles=5 -XX:GCLogFileSize=1M
```

**Java 11+**

```bash
-Xlog:gc*:logs/gc.log:time,uptime:filecount=5,filesize=1M
```

垃圾回收日志不会损害你的性能，可以一直开启。
这些文件不会占用太多空间（5MB）。

## 技术性解释这些标志的含义。

1.  **-Xms 与 -Xmx 一致的原因：** 你永远不应该在 `Xmx`可能耗尽系统全部内存的情况下运行服务器。
    你的服务器应该始终预期会使用全部的 `Xmx`！你应该确保操作系统在 `Xmx`
    之外还有额外的内存用于非 Minecraft/操作系统级别的事务。
    因此，你永远不应该在无法支持 Java 使用全部 `Xmx` 的情况下运行 Minecraft。
    现在，这意味着 **如果 `Xms` 低于 `Xmx`， 你就会有未使用的内存**！未使用的内存就是浪费的内存。
    G1 在获得更多内存时运行得更好。
    G1 会根据需要动态调整分配给每个区域的内存量，以优化暂停时间。
    如果你的内存比它达到最优暂停时间所需的内存更多，
    G1 会简单地将多余的内存推入老年代（Old Gen），这不会对你造成损害。
    改善垃圾回收行为的基本理念是确保短命对象在年轻时就消亡，永远不要被提升。
    G1 拥有的内存越多，你就能更好地确保对象不会过早地被提升到老年代（Old Gen）。
    G1 与之前的收集器不同，能够更高效地处理更大的堆空间。

    如果它不需要分配给它的内存，它就不会使用。
    整个引擎的运行方式不同，并且不会因堆空间过大而受到影响，
    而在整个行业内，使用 G1 时保持 `Xms` 和 `Xmx` 一致是被广泛接受的做法！

2.  **UnlockExperimentalVMOptions:** 需要用于以下部分选项。

3.  **G1NewSizePercent:** 这些是重要的设置。
    现在你可以指定新生代在整个堆空间中期望范围的百分比。
    通过这些设置，我们告诉 G1 不要使用其默认的 5% 用于新生代，
    而是给它 40%！**Minecraft 的内存分配率极高**，
    在 30 名玩家的服务器上，至少达到每秒 800MB！而这些大多是短命对象（方块位置）。

    现在，这意味着 Minecraft **真的**需要更多地关注新生代，才能支持这样的分配率。
    如果你的新生代太小，你会以每秒 1-2 次甚至更多的频率运行新生代收集，这太糟糕了。
    你会有如此多的暂停，TPS 有下降的风险，服务器将无法跟上垃圾回收的成本。
    再加上对象现在会更快地晋升，导致老年代（Old Gen）增长得更快。
    鉴于有更多的新生代，我们能够减缓年轻代收集的间隔，
    从而为短命对象提供更多时间在年轻时消亡，
    总体上实现更高效的垃圾回收行为。

4.  **G1MixedGCLiveThresholdPercent:** 控制何时将区域包含在混合垃圾回收（Mixed GC）中，
    以在年轻代垃圾回收过程中保持老年代（Old Gen）的整洁，而无需进行正常的全老年代（Old Gen）垃圾回收。
    当内存占用低于这个百分比时，老年代（Old Gen）甚至不会被包含在“混合”收集之中。
    混合收集的负担不如完整的老年代（Old Gen）收集那么重，
    因此进行小幅度的增量清理可以保持内存使用量的轻量。

    默认值根据 Java 版本不同，介于 65 到 85 之间，我们将这个值设置为 90，
    以确保尽可能快速地回收老年代（Old Gen）中的垃圾，从而保留尽可能多的空闲区域。

5.  **G1ReservePercent=20:** 在最新版本中，Minecraft 的内存分配率实在是惊人。
    我们可能会遇到可怕的“目标空间耗尽”问题，即没有足够的空闲内存来移动数据。
    这个设置确保有更多内存可供此操作使用。
    默认值是 10，因此我们又额外分配了 10。

6.  **MaxTenuringThreshold=1:** Minecraft 的内存分配率极高。
    其中大部分内存都在伊甸园（Eden Space）区被回收。
    然而，短暂数据会溢出到幸存者（Survivor Space）区。
    最初尝试完全移除幸存者（Survivor Space）区，结果相当不错，但这也导致短暂数据进入老年代（Old Gen），这是不好的。
    将最大晋升年龄设置为 1 可以确保我们不会将短暂数据提升到老年代（Old Gen），
    但任何在两次垃圾回收中幸存的对象都将被假定为寿命更长的对象。

    这样做可以大大减少年轻代收集的暂停时间，因为对于真正老的内存来说，
    将对象在幸存者（Survivor Space）空间中复制多达15次确实需要很多时间。
    理想情况下，垃圾回收引擎会跟踪对象的平均年龄，
    并更快地将数据提升到老年代（Old Gen），但这并不是它的实际工作方式。

    考虑到平均垃圾回收时间每次年轻代收集在10秒到几分钟不等，
    这并不会导致任何“垃圾”被提升，
    而只是将寿命更长的内存延迟到混合垃圾回收中进行收集。

7.  **SurvivorRatio=32:** 由于我们大幅降低了 `MaxTenuringThreshold`，我们将大幅减少对幸存者（Survivor Space）空间的使用。
    这将释放更多区域供伊甸园（Eden Space）区使用。

8.  **AlwaysPreTouch:** `AlwaysPreTouch` 在进程启动时设置并保留内存，确保其连续性，从而提高其效率。
    这可以提升操作系统的内存访问速度。
    使用透明大页时必须启用此选项。

9.  **+DisableExplicitGC:** 许多插件认为它们知道如何控制内存，并尝试触发垃圾回收。
    执行此操作的插件会触发一次完整的垃圾回收，从而导致巨大的延迟峰值。
    这个标志可以阻止插件尝试进行此类操作，
    从而保护你免受它们糟糕代码的影响。

10. **MaxGCPauseMillis=200:** 这个设置控制在新生代指定的最小和最大范围之间使用的内存量。
    这是一个关于你希望服务器在收集时暂停多长时间的“目标”。
    200 毫秒的目标是最多损失 4 个刻（tick）。
    这将导致短暂的 TPS（每秒事务数）下降，但服务器可以立即弥补这一下降，这意味着它对你的 TPS 没有实际影响。
    200 毫秒低于玩家能够感知的延迟。
    在测试中，将这个值限制得更低会导致 G1 无法足够快地重新收集内存，
    可能会耗尽老年代（Old Gen），从而触发一次完整的收集。
    这个数字设置为 200 并不意味着每次收集都会是 200 毫秒。
    它意味着在真正需要时可以使用多达 200 毫秒，我们需要让它在有内存需要收集时完成其工作。

11. **+ParallelRefProcEnabled:** 优化垃圾回收过程，使用多个线程进行弱引用检查。
    不知道为什么这还不是默认设置……

12. **G1RSetUpdatingPauseTimePercent=5:** 默认情况下，暂停期间用于更新 RSet 的时间占比为 10%，
    将其降低到 5%，以使更多操作并行进行，从而减少暂停时长。

13. **G1MixedGCCountTarget=4:** 默认值是 8。
    因为我们希望收集得更慢，减少老年代（Old Gen）的使用，尝试更快地回收老年代（Old Gen）内存，以避免老年代（Old Gen）耗尽。

14. **G1HeapRegionSize=8M+:** 默认值是自动计算的。
    对于 Minecraft，尤其是 1.15 版本，这非常重要，因为在低内存情况下，自动计算的默认值通常会过低。
    任何大小为该值一半（4MB）的内存分配都会被视为“巨大”对象，
    并直接晋升到老年代（Old Gen），这使得它们更难被回收。
    如果你允许 Java 使用默认值，你的内存中会有很大一部分被当作“巨大”对象处理，从而导致问题。

15. **+PerfDisableSharedMem:** 导致垃圾回收写入文件系统，如果磁盘 I/O 很高，
    可能会导致重大延迟——参见 [JVM统计数据导致垃圾回收暂停（evanjones.ca）](https://www.evanjones.ca/jvm-mmap-pause.html)。

### 透明大页

这是一个有争议的功能，但如果无法为宿主机配置真正的 HugeTLBFS，它可能仍然可用。
尝试添加 `-XX:+UseTransparentHugePages`，但非常重要的是，你还必须设置 `AlwaysPreTouch`。
否则，透明大页（THP）可能会对你造成负面影响。
我们尚未测量过透明大页对 Minecraft 的作用，或者它与 `AlwaysPreTouch` 的影响，因此这一部分是为那些想要进行实验的高级用户准备的。
