---
title: 路线图
description: 概述了 Paper 项目的未来意图和计划。
slug: paper/dev/roadmap
---

Paper 提供了一个功能丰富的 API，能够帮助你充分发挥服务器的潜力。
然而，为了给新功能和改进腾出空间，一些较旧的 API 将会逐步淘汰。
本页面旨在记录计划中的未来 API 更改以及可能出现的弃用情况。

## 未来计划

### 接口 `ItemStack`

当你使用构造函数创建 `ItemStack` 时，你创建了一个 `ItemStack` 的 API 表示。
这是一个委托给 NMS 支持的对象的对象，你应该使用 `ItemStack#of` 来直接获取 NMS 支持的对象。

在未来，`ItemStack` 将被转换为一个接口，并且构造函数将被移除。

#### 注意事项

- 避免直接扩展 `ItemStack` 类。
  - 不支持此类的自定义实现，并且**将会**导致损坏。

### `ServerPlayer` 重用
*注意：仅适用于 NMS 的使用，不适用于 API。*

避免直接存储玩家（`ServerPlayer`）实体实例。
目前，玩家实例在切换世界时会被重用，然而，在未来，这种行为将被恢复为符合原版的行为。
API 实体（包装器）将继续工作，并且它们底层的实例将被自动替换。

这是为了帮助减少在原版和 Paper 之间切换世界时可能出现的不一致性。

## 弃用政策

:::caution[警告]

强烈建议你避免使用任何被标记为已弃用的 API。

:::

如果你继续使用已弃用的 API，你的服务器可能会变得不稳定，并且可能无法按预期工作。
你可能会遇到性能问题和其他问题。
为了确保你的插件获得尽可能好的体验和持久性，
重要的是要跟上最新的 API 变更，并避免使用任何被标记为即将弃用的 API。

被标记为 [`@Deprecated`](jd:java:java.lang.Deprecated) 的 API 不应在你的代码库中使用，
因为可能有替代的 API 可以使用。
虽然某些 API 即使被弃用也可能继续工作，但**不能**保证这些 API 在未来不会被标记为即将移除。
```java
@Deprecated
public void exampleMethod(); // 示例弃用方法
```

### 已弃用，将被移除

除了被标记为 `@Deprecated` 外，API 还可能被标记为 `forRemoval`，
并附带一个给定的 [`@ApiStatus.ScheduledForRemoval`](https://javadoc.io/doc/org.jetbrains/annotations/latest/org/jetbrains/annotations/ApiStatus.ScheduledForRemoval.html) 版本。
计划移除的 API 应该只会在 Minecraft 的主要版本更新中出现。
强烈建议你远离计划移除的 API。

应该注意的是，
计划移除的 API 将会有足够的时间让插件开发者从这些 API 中迁移出去。
```java
@ApiStatus.ScheduledForRemoval(inVersion = "1.20")
@Deprecated(forRemoval = true)
public void exampleMethod(); // 在1.20中被标记为移除的示例方法
```

## 弃用原因

API 被弃用的原因可能有很多。
API 被弃用的一些常见原因包括：

### 旧的 API

随着游戏的发展，API 可能代表了在核心游戏中不再存在的概念。

旧的 API 在游戏的新版本中很可能无法正常工作，
或者可能会出现意外的行为，因此它可能会被计划移除。

### 重复的 API

由于 Paper 曾经是 Spigot 的下游分支，它有时会包含与 Paper 已有的 API 冲突的 Spigot 添加的 API。
通常，Paper 会弃用 Spigot 的 API，而倾向于使用自己的 API。

然而，在上游提供更强大的 API 的情况下，Paper 的 API 可能会被弃用。

### 过时的 API
Paper 致力于改进已经包含的 API。
在某些情况下，我们可能会构建新的 API 来替代另一个。

过时的 API 预计在未来很长一段时间内仍然可以使用，
并且可能不会很快被计划移除。
