---
title: 内置命令
description: 内置命令的列表及说明
slug: velocity/built-in-commands
---

Velocity 默认在其代理核心中包含了一些命令。
这些命令的选择是基于它们对大多数用户的一般实用性。

当然，如果你愿意，你随时可以安装插件来增加更多命令。

## `/velocity`

`/velocity` 命令包含许多子命令，用于管理代理。

### `/velocity plugins`

如果用户拥有 `velocity.command.plugins` 权限，
他们可以使用 `/velocity plugins` 查看当前在代理上激活的所有插件，包括名称、作者和版本。

### `/velocity info`

如果用户拥有 `velocity.command.info` 权限，
他们可以查看有关 Velocity 实例的信息，例如在代理上运行的 Velocity 版本。

### `/velocity reload`

如果用户拥有 `velocity.command.reload` 权限，代理将从磁盘上的 `velocity.toml` 文件中读取并重新配置自身。
如果解析文件时出现问题，将不会应用任何更改。

### `/velocity dump`

如果用户拥有 `velocity.command.dump` 权限，他们可以使用此命令获取代理的匿名化详细信息转储。
这些信息可以发送到 PaperMC Discord，以便我们提供支持。

### `/velocity heap`

:::caution[注意]

此命令生成一个堆转储，其中包含有关你的 Velocity 实例的详细信息，
这些信息可能非常敏感，请谨慎选择与谁共享生成的堆转储。

:::

如果用户拥有 `velocity.command.heap` 权限，他们将能够从运行中的 Velocity 实例生成一个堆转储，
这将允许对内存使用情况进行详细分析。

生成的堆转储将位于 `dumps` 文件夹中。

## `/server`

如果用户拥有 `velocity.command.server` 权限（默认情况下，此权限授予所有用户），
玩家可以使用此命令查看并切换到另一台服务器。

仅执行 `/server` 命令会向用户发送他们当前所在的服务器名称，
以及代理上配置的其他服务器的切换选项。

如果提供了服务器名称，Velocity 将尝试连接到该服务器。

## `/shutdown`

:::note[注意]

此命令只能从控制台执行。

:::

运行此命令将优雅地关闭 Velocity 代理。
所有玩家将从代理中断开连接，并且在代理关闭之前，插件将有机会完成其操作。
可以提供一个可选的原因，既可以使用 JSON 格式，也可以使用 [MiniMessage 格式](https://docs.advntr.dev/minimessage/format.html)。

如果提供的消息以 `"`、`[` 或 `{` 开头，则会尝试将其解析为 JSON。
如果解析失败，或者消息以其他内容开头，则会将其解析为 MiniMessage。


## `/glist`

如果用户拥有 `velocity.command.glist` 权限（默认情况下，此权限不授予任何人），
玩家可以使用此命令查看当前在代理上的玩家数量，并使用 `/glist all` 获取按服务器划分的玩家列表。

## `/send`

如果用户拥有 `velocity.command.send` 权限，
他们可以将其他玩家（或代理上的所有玩家）发送到另一台服务器。
