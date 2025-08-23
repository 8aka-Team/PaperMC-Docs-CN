---
title: 开始使用
description: 如何开始运行 Waterfall
slug: waterfall/getting-started
banner:
  destructive: true
  content: 我们建议您转向<a href="https://papermc.io/software/velocity">Velocity</a>。更多信息请参见 <a href="https://forums.papermc.io/threads/1088/">Waterfall 终止公告</a>。
---

## 什么是 Waterfall？

Waterfall 是 BungeeCord 的一个分支版本，主要用于在多个 Minecraft 服务端之间传送玩家。

Waterfall 主要关注以下三个领域：

- **稳定**：Waterfall 致力于保持稳定。我们将通过使代码库可测试以及避免导致代理延迟的做法来实现这一目标。
- **功能**：Waterfall 致力于提供比原版 BungeeCord 更多的功能。
- **扩展**：Waterfall 应该能够在合理配置的现代 CPU、内存和良好的网络连接下，处理大量并发玩家。

## 要求

Waterfall 需要 **Java 8** 或更高版本才能运行。Paper 团队建议您使用 Java 11 或更高版本。
一般建议使用 Java 的长期支持（LTS）版本，尽管您也可以尝试使用更新的版本。

## 从 BungeeCord 迁移

Waterfall 是 BungeeCord 的直接替代品，您无需对配置进行任何更改。

## 获取代理 JAR 文件

Paper 直接从我们的 [下载页面](https://papermc.io/downloads/waterfall) 下载提供可运行的代理 JAR 文件。

点击构建编号即可下载文件。

## 运行代理

要运行代理，只需像运行其他 Java 应用程序一样启动它。

打开终端，导航到保存的位置，然后运行

```bash
java -Xms512M -Xmx512M -jar waterfall-###.jar
```

Aikar 为 Waterfall 推荐的启动参数如下：

```bash
java -Xms512M -Xmx512M -XX:+UseG1GC -XX:G1HeapRegionSize=4M -XX:+UnlockExperimentalVMOptions -XX:+ParallelRefProcEnabled -XX:+AlwaysPreTouch -jar waterfall-###.jar
```

可以通过更改 `-Xms` 和 `-Xmx` 参数中的数字来设置内存大小。

要配置您的代理，请参阅 [配置](/waterfall/configuration) 页面。

## Updating the proxy

要更新代理，请首先通过执行 `end` 命令安全停止它。
然后用新的 JAR 文件替换旧的代理 JAR 文件，并启动代理。
