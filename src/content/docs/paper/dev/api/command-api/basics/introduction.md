---
title: 介绍
description: 一份关于 Paper 的 Brigadier 命令 API 的指南。
slug: paper/dev/command-api/basics/introduction
---

Paper 的命令系统是基于 Minecraft 的 Brigadier 命令系统构建的。该系统提供了一种强大且灵活的方式来定义命令和参数。
与之前广泛使用的 Bukkit 命令系统相比，它具有许多优势：
- 开发者需要对参数进行的解析或错误检查更少。
- 客户端错误检查提供更好的用户体验。
- 与重载事件集成，允许在数据包中定义可用的命令。
- 更容易创建子命令。

:::note[注意]

要查看新的 Brigadier 系统与旧的 Bukkit 系统之间的比较，[点击这里](/paper/dev/command-api/misc/comparison-bukkit-brigadier)。

:::

## 指南

:::tip[提示]

如果 Brigadier API 看起来太复杂，
你可以从 [基础命令](/paper/dev/command-api/misc/basic-command) 开始。
它们提供了一种简单的方式来创建命令，学习曲线较短。

:::

在学习 Brigadier 时，以下网站值得一读：
- [命令树](/paper/dev/command-api/basics/command-tree)
- [参数和字面量](/paper/dev/command-api/basics/arguments-and-literals)
- [命令执行器](/paper/dev/command-api/basics/executors)
- [命令注册](/paper/dev/command-api/basics/registration)
- [命令要求](/paper/dev/command-api/basics/requirements)
- [参数建议](/paper/dev/command-api/basics/argument-suggestions)
- [自定义参数](/paper/dev/command-api/basics/custom-arguments)

对于更高级的参数参考，请查看这里：
- [Minecraft 参数](/paper/dev/command-api/arguments/minecraft)

:::danger[未来页面]

以下页面将在未来添加到文档中：

- **教程：创建实用命令**
- **命令调度器**
- **分支和重定向**
- **教程：扩展原版的 execute 命令**

:::

## 额外支持
关于命令 API 的支持，
您可以在我们的 [Discord 服务器](https://discord.gg/PaperMC) 中的 [`#paper-dev`](https://discord.com/channels/289587909051416579/555462289851940864   ) 频道提问！
