---
title: Audiences
description: 如何使用 Adventure 的 Audiences 功能。
slug: paper/dev/component-api/audiences
---

Audiences 封装了一组可以接收消息的接收者。
它们可以用于向单个玩家、玩家组，甚至是整个服务器（包括控制台）发送消息。

## 谁是 `Audience`？

所有`CommandSender`都是单一受众。
这包括玩家、控制台和命令方块。`Server`、`Team`和`World`都是转发受众。
这意味着它们由多个受众组成。例如，服务器由所有在线玩家和控制台组成。

这意味着所有 [`Audience`](https://jd.advntr.dev/api/latest/net/kyori/adventure/audience/Audience.html)
的方法都可以在
[`CommandSender`](jd:paper:org.bukkit.command.CommandSender)、[`Server`](jd:paper:org.bukkit.Server)、[`Team`](jd:paper:org.bukkit.scoreboard.Team)
和 [`World`](jd:paper:org.bukkit.World) 上使用。

## `ForwardingAudience`

[`ForwardingAudience`](https://jd.advntr.dev/api/latest/net/kyori/adventure/audience/ForwardingAudience.html)
包装了一个 [`Audience`](https://jd.advntr.dev/api/latest/net/kyori/adventure/audience/Audience.html) 实例的集合，并将消息转发给它们中的每一个。
这对于一次性向多个受众（玩家）发送消息非常有用。

```java
// 服务器是一个`转发受众`，包括所有在线玩家和控制台。
ForwardingAudience audience = Bukkit.getServer();

// 要从玩家集合中构建一个受众，可以使用以下代码：
Audience audience = Audience.audience(Audience...);
// 如果你传入一个单一的 `Audience`，它将原样返回。
// 如果你传入一个 `Audience` 的集合，它们将被包装在一个 `ForwardingAudience` 中。
```

## `Audience` 会做些什么呢？

观众（Audiences）用于与玩家进行交互。
它们可以用来发送消息、播放声音、显示Boss条等。
它们主要用于将API的其他部分发送给玩家。例如，你可以使用 [`Audience#sendMessage(Component)`](https://jd.advntr.dev/api/latest/net/kyori/adventure/audience/Audience.html#sendMessage(net.kyori.adventure.text.Component)) 将一个 [`Component`](https://jd.advntr.dev/api/latest/net/kyori/adventure/text/Component.html) 发送给玩家。

## 指针

观众也可以提供任意信息，例如显示名称或 UUID。这是通过指针系统完成的。

```java
// 从观众成员中获取 UUID，返回一个`Optional<UUID>`。
Optional<UUID> uuid = audience.get(Identity.UUID);

// 获取显示名称，返回一个默认值。
Component name = audience.getOrDefault(Identity.DISPLAY_NAME, Component.text("没有显示名称！"));
```
