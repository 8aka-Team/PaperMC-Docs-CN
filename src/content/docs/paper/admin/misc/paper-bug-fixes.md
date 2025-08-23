---
title: 漏洞修复
description: 关于我们在 Paper 中修复了哪些原版漏洞的说明
slug: paper/misc/paper-bug-fixes
---

Paper 修复了 Minecraft 中许多游戏玩法和技术问题。最常见的修复是 TNT 复制和基岩破坏。

## 原版漏洞修复

Paper 修复了许多 Mojang 未预期的原版漏洞。
这些漏洞被修复是为了修正行为或防止服务器上的滥用和不稳定。
我们的一些修复是可配置的，因为我们理解有些服务器可能希望保留原版行为。
你可以在[全局配置](/paper/reference/global-configuration)和[世界配置](/paper/reference/world-configuration)中找到这些配置选项。

### 什么是预期行为，什么是漏洞？

当问题被报告给我们时，我们会查看Mojang的问题跟踪器。
如果问题在那里被报告了，那么我们会检查它是否：

1) 已被确认为漏洞
2) 有分配的优先级

如果满足这两个条件，那么我们将接受修复漏洞的更改，因为 Mojang 修复它们可能需要很长时间（有时是几年）。
如果一个问题被 Mojang 拒绝，我们通常不会“修复”它，因为这是预期行为。

## 复制漏洞

由于TNT复制被认为是一种自动挖掘的形式，而不是资源复制，我们提供了一个选项来恢复它。
不幸的是，这也重新启用了地毯和铁轨的复制，通常我们不会为这些提供配置选项，
但因为这是相同的漏洞，所以我们别无选择。然而，配置选项如下：

```yaml title="config/paper-global.yml"
unsupported-settings:
  allow-piston-duplication: true
```

我们还允许你恢复使用末影传送门复制沙子等重力方块的能力。
这并不推荐，因为它可能会导致服务器出现问题，但我们确实提供了一个配置选项来恢复这一功能：
```yaml title="config/paper-global.yml"
unsupported-settings:
  allow-unsafe-end-portal-teleportation: true
```

## 方块破坏

我们还修复了破坏基岩和末影传送门框架的能力。
我们确实提供了一个配置选项来恢复这一功能，但并不推荐：
```yaml title="config/paper-global.yml"
unsupported-settings:
  allow-permanent-block-break-exploits: true
```

## 后记

如果在启用这些设置时出现问题，我们将不会提供支持，因为它们可能会导致意外的副作用。
这些设置在未来也不保证会被支持，它们的行为可能会在任何时候被改变或移除。

有关为何许多复制漏洞没有配置选项的历史原因，请参阅：
[#3724](https://github.com/PaperMC/Paper/issues/3724)
