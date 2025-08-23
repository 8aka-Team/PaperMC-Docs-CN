---
title: 对比竞品
description: Velocity 与其他代理的比较
slug: velocity/comparisons-to-other-proxies
---

想必你已经了解了 Velocity 能为你做些什么。
但它与其他解决方案相比如何呢？
毕竟，我们是在试图说服你使用 Velocity，所以这份文档可能会有些偏向于我们。

## 概述

:::danger[危险]

**PaperMC 团队强烈推荐使用 Velocity 而不是 Waterfall 和 BungeeCord**。
Waterfall 已经结束生命周期。
PaperMC 的所有未来开发工作都在 Velocity 上进行。
更多信息请参阅[公告](https://forums.papermc.io/threads/1088/)。

:::

这是一个关于 Velocity 与其他流行的代理软件之间差异的快速概述。更多详细信息请参阅下方内容。

| 功能                     | BungeeCord | Waterfall | Velocity |
|------------------------|------------|-----------|----------|
| 资源高效                   | ❌          | ✅         | ✅✅       |
| Velocity 插件            | ❌          | ❌         | ✅        |
| BungeeCord 插件          | ✅          | ✅         | 🟨\*     |
| 安全的玩家信息转发              | ❌          | ❌         | ✅        |
| 支持现代 Minecraft 特性的 API | ❌          | ❌         | ✅        |
| 持续开发                   | ❓          | ❌         | ✅        |
| 改进的模组支持                | ❌          | ❌         | ✅\*\*    |

\* _Velocity API 不支持为 BungeeCord/Waterfall 制作的插件，但可以安装 [Snap](https://hangar.papermc.io/Phoenix616/Snap) 以提供实验性支持。
Snap 并非由 Velocity 项目维护，也与 Velocity 项目无关。_

\** _1.7 至 1.12.2 以及 1.20.2 或更高版本的完整 Forge 支持。_

## BungeeCord 及其衍生产品

我们无法深入讨论 Minecraft 代理软件的完整历史 ——
我们推荐 [Me4502 的优秀文章](https://madelinemiller.dev/blog/decade-of-minecraft-multiplayer/)，
该文章详细涵盖了 Minecraft 多人游戏世界的各个方面。

### BungeeCord

Velocity 的原作者在启动该项目时，
已经拥有超过5年使用 BungeeCord 的经验，并且对它的各种特性了如指掌。

改进 BungeeCord 是一项徒劳无功的任务，原因有以下几点：

- BungeeCord 在 API 变更方面非常保守。
  如果某个5年前由不活跃开发者编写的插件被破坏了，那就别指望修复了
- 那些确实改变了 API 的变更，通常是相当特定且小众的用例，
  而对 API 进行重大变更则不被看好（例如对 `ChatColor` 中 RGB 颜色的支持）。
- 该项目本质上是像教堂（参考 某华和某米）一样运作的。
  在 BungeeCord（及其姊妹项目 Spigot）中，md_5 的话就是王道。
  为 BungeeCord 贡献一个简单的安全修复，让Velocity 的主要开发者至少从 md_5 那里得到了两次斥责。
- BungeeCord 积极抵制对 _Minecraft_ 模组的持续支持。
- 自 2012 年 BungeeCord 首次发布以来，我们已经看到了 _Minecraft_ 的新模组 API。
  是时候推出一个全新且改进的 API 了，这个 API 不会犯 BungeeCord API 所犯的错误，
  并从 Minecraft 现在所拥有的新模组 API 中汲取灵感。

### Waterfall

部分由于作者自己使用 BungeeCord 的经验，他在 2016 年创立了 Waterfall 项目，
作为 BungeeCord 的一个分支，以 Paper 为蓝本，明确目标是改进 BungeeCord。
_我们尝试了显而易见的下一代反代理服务端。_

了解一下 [海勒姆定律](https://www.hyrumslaw.com/)：

> 只要 API 的用户足够多，合同中承诺的内容并不重要：
> 系统的所有可观察行为都会被某人依赖。

以下是用漫画形式呈现的 Hyrum 定律，或许有助于更好地理解这个观点：

> <span class="img-inline">[![xkcd #1172](https://imgs.xkcd.com/comics/workflow.png)](https://xkcd.com/1172/)</span>
>
> 比如 [xkcd](https://xkcd.com/) 网站上的漫画 “Workflow” （[链接](https://xkcd.com/1172/)），它以幽默的方式展现了类似的现象。 网站由 Randal Munroe 创建，
> [授权许可](https://xkcd.com/license.html) 其内容在
> [CC BY-NC 2.5](https://creativecommons.org/licenses/by-nc/2.5/) 许可下授权使用。

大多数 BungeeCord 插件都严重依赖于 BungeeCord 暴露出来的特定行为和特性，
而这些是 Velocity 无法完美模拟的。
因此，可以对 BungeeCord 进行的更改数量非常有限，否则插件将无法保持相同的行为。

假设你玩过一家名为 A 公司发行的电子游戏。
该游戏运行在 B 公司开发的操作系统上。
有一天，B 公司发布了其操作系统的最新版本，而你进行了升级，结果却发现那个电子游戏无法再运行了。
更糟糕的是，A 公司可能已经倒闭了，因此无法提供补丁。
在这种情况下，你会责怪谁呢？是责怪 A 公司生产了有缺陷的产品，还是责怪 B 公司破坏了游戏？[这并非假设](https://devblogs.microsoft.com/oldnewthing/20110131-00/?p=11633)。

我们可以指出一个例子，
其中[一次尝试](https://github.com/PaperMC/Waterfall/commit/c8eb6aec7bac82fd309fa6d6113b8a0418317b01)改进 1.13 及以上版本的记分板处理方式[被撤销](https://github.com/PaperMC/Waterfall/issues/255) 了，
原因是插件依赖于 BungeeCord 的错误行为。
到了这个地步，很明显为什么彻底的改变是更好的选择。
鉴于这发生在 Velocity 项目生命周期的早期，这可能是一个相当强大的动力，尽管它肯定不是唯一的原因。

### 假设基于 BungeeCord API 的 Velocity

我们不得不简要提及这一点，因为这是项目早期就提到的一个话题。
我们本可以基于 BungeeCord API（或其衍生产品，例如 Waterfall API）来构建 Velocity。

这与 Waterfall 面临同样的问题，或许问题更多，因为我们需要独立模拟 BungeeCord API 的 _所有_ 行为。
Wine 项目已经花了 30 多年的时间，试图提供一个兼容层，让 Windows 程序能够在 Linux 和其他操作系统上运行。
直到今天，他们的工作仍在继续。
模拟另一个操作系统的环境行为是很难的。
[ReactOS](https://reactos.org/) 的开发者们处境更糟，他们试图模拟 Windows 的所有特性，包括它的内核，而且他们选择的基准是 20 年前发布的 Windows 版本。
他们的工作完成度甚至不如 Wine。

我们将不得不花费大量时间伪装 Velocity 与 BungeeCord 一模一样的行为。
我们有意拒绝了这种方法。
