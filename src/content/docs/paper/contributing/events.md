---
title: 事件
description: 一篇关于如何向 Paper 添加新事件的指南
slug: paper/contributing/events
---

Paper API 中的事件有几项要求

:::note[注意]

请注意，虽然并非所有现有事件都遵循这些指南，
但所有新事件和修改后的事件都应遵守它们。

:::

所有新事件都应位于 `io.papermc.paper.event` 包（或其子包）中。

### 构造函数

所有新增的构造函数都应标注为
[`@ApiStatus.Internal`](https://javadoc.io/doc/org.jetbrains/annotations/latest/org/jetbrains/annotations/ApiStatus.Internal.html)，
以表明它们不属于 API，并且可以在没有任何警告的情况下随时更改。

如果要替换的构造函数并未被移除，
应标记为[`@Deprecated`](jd:java:java.lang.Deprecated) 和 [`@DoNotUse`](jd:paper:io.papermc.paper.annotation.DoNotUse)。

### 可变性
某些 API 类型是“可变的”，这可能导致事件中的意外行为。
因此，像 [`Location`](jd:paper:org.bukkit.Location) 和 [`Vector`](jd:paper:org.bukkit.util.Vector)
这样的可变类型在从事件的“getter”方法返回时应该进行克隆。

### `HandlerList`
为了让事件类或其任何子类能够被监听，必须存在一个 [`HandlerList`](jd:paper:org.bukkit.event.HandlerList) 字段，
并且有一个静态方法可以获取其实例。
具体细节请参阅 [`Event`](jd:paper:org.bukkit.event.Event) 的文档。
这个字段应该是静态的、最终的，并且命名为 `HANDLER_LIST`。

同时考虑不要在每个事件上都放置一个 `HandlerList`，而是在一个“共同父级”事件上放置，
这样插件就可以监听父级事件并捕获任何子事件，同时也可以单独监听子事件。

### 其他

大多数情况下，类型为  [`ItemStack`](jd:paper:org.bukkit.inventory.ItemStack) 的新参数或方法返回值不应该使用
[`@Nullable`](https://javadoc.io/doc/org.jspecify/jspecify/latest/org/jspecify/annotations/Nullable.html) 注解，
而应该接受一个空的 ItemStack。
