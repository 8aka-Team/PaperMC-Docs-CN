---
title: 性能分析
description: 如何对你的 Paper 服务器进行性能分析
slug: paper/profiling
---

性能分析是一种诊断服务器性能问题的方法。
性能分析器会测量运行中的服务器的某些特征，
例如一个方法被调用的频率以及它在单个刻中占用的时间，垃圾回收器运行的时长和频率，等等。

:::caution[警告]

_为了使性能分析有效，你正在诊断的问题必须正在发生。_

:::

如果你需要帮助分析性能问题，请将 Spark 报告带到
[PaperMC Discord 服务器](https://discord.gg/PaperMC) 的 #paper-help 频道寻求帮助。

## spark

从 1.21 版本开始，Paper 集成了 [spark](https://spark.lucko.me/) 性能分析器，
这是分析 Paper 性能的首选方式。

要开始分析你的服务器性能，请运行以下命令：
```
/spark profiler start --timeout 600
```

10分钟后，这将返回一个性能分析报告的URL，你可以自行分析，
也可以提供给插件开发者或Paper支持聊天室。

这仅仅是 spark 能够做到的一小部分，因此如果你想了解 spark 的不同功能，
或者学习如何自行分析报告，请查看 spark 的文档[这里](https://spark.lucko.me/docs/)。

:::tip[提示]

如果你想使用比集成版本更新的 spark 版本，
只需将独立的 spark 插件 JAR 文件放入 `plugins` 目录，
并将 [`paper.preferSparkPlugin`](/paper/reference/system-properties#paperprefersparkplugin) 系统属性设置为 `true`。

如果你想使用集成版本的 spark 提供的 PlaceholderAPI[占位符](https://spark.lucko.me/docs/misc/Placeholders)，
你需要从 PAPI 的 eCloud 安装
[spark 扩展](https://api.extendedclip.com/expansions/spark/)（`/papi ecloud download spark` 和 `/papi reload`）。

:::

## Timings

Paper 也集成了 [Timings v2](https://timings.aikar.co/) 性能分析器，
但 Timings 已经多年未维护，其报告对于初学者来说难以阅读。
它已经被废弃，取而代之的是 spark，并且在 1.21 版本中默认关闭，
更多信息请查看 [此讨论](https://github.com/PaperMC/Paper/discussions/10565)。
