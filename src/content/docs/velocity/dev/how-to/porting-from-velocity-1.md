---
title: 插件迁移
description: 如何将您的插件从 Velocity 1.x.x 迁移到现代 API
slug: velocity/dev/porting-plugins-from-velocity-1
---

Velocity 3.0.0 对 Velocity 1.x.x 系列进行了重要的 API 更改。
**请仔细阅读本文档**。


## 支持的最低 Java 版本提升

Velocity 3.3.x 及更高版本现在需要 Java 17 及更高版本。

## 移除遗留依赖

我们移除了对旧版 `text` 3 库的所有支持。
对于 `text` 3.x.x（以及所有依赖它的 API），在 [Adventure](https://docs.advntr.dev/) 中有直接的等效替代，
该库自 Velocity 1.1.0 起引入。


`toml4j` 在 Velocity 1.1.0 中已被弃用（因为它不再被维护），
但尚未移除，以便为插件迁移到 Configurate 提供更多时间。
然而，你应该准备切换到 Configurate 或直接将 `toml4j` 打包到你的插件中。

## 新的异步事件系统

Velocity 3.0.0 包含了 Velocity Polymer 事件系统的回溯实现，
该系统在许多方面与 Velocity 1.x.x 的事件系统有所不同。
Velocity 1.x.x 的事件模型强制所有事件都在固定大小的线程池中异步执行，
随着时间的推移，这种模型已被证明存在缺陷。

现有的事件处理器在 Velocity 3.0.0 上将继续正常工作，
无需修改，因为所有事件处理器默认都被视为异步阻塞处理器。
然而，引入了一些新的 API 用于处理延续操作——更多信息请参见 [事件 API 页面](/velocity/dev/event-api)。
不过，建议你将你的事件监听器迁移到新的事件 API 范式中。
