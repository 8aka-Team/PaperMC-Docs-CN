---
title: 易于配置
description: Velocity 被设计为易于配置，本指南将指导你如何进行配置
slug: velocity/configuration
---

Velocity 旨在易于配置和设置。
每个 Velocity 文件都存储在启动代理程序的目录中的 `velocity.toml` 文件中。
Velocity使用 [TOML](https://github.com/toml-lang/toml) 文件格式，因为它易于理解，
并且避免了 YAML 和其他社区中常见的配置格式的陷阱。

最新的默认配置文件可以在 [GitHub](https://github.com/PaperMC/Velocity/blob/dev/3.0.0/proxy/src/main/resources/default-velocity.toml) 上找到

## 数据类型

在 Velocity 配置中有一些“特殊”的数据类型。

### 聊天

聊天消息可以使用 [MiniMessage](https://docs.advntr.dev/minimessage/format.html) 格式提供。

Minecraft 1.16及更高版本支持 RGB 颜色。

### 地址

地址是由 IP 地址或主机名与端口号组成，两者之间用冒号（`:`）分隔。
例如，`127.0.0.1:25577` 和 `server01.example.com:25565` 都是有效的地址。

## 基础配置

这些设置主要涵盖代理的基本且最重要的配置。

| 设置名称                               | 类型  | 描述                                                                                                 |
|------------------------------------|-----|----------------------------------------------------------------------------------------------------|
| `config-version`                   | 字符串 | 这是 Velocity 当前使用的配置版本。你不应该更改此设置。                                                                   |
| `bind`                             | 地址  | 这告诉代理在特定 IP 上接受连接。默认情况下，Velocity 将在计算机上的所有IP地址的 25565 端口上监听连接。                                     |
| `motd`                             | 聊天  | 这允许你更改玩家将服务器添加到服务器列表时显示的消息。你可以使用 [MiniMessage格式](https://docs.advntr.dev/minimessage/format.html)。 |
| `show-max-players`                 | 整数  | 这允许你自定义玩家服务器列表中的“最大”玩家数量。请注意，Velocity 并没有它支持的最大玩家数量限制。                                             |
| `online-mode`                      | 布尔值 | 我们是否应该使用 Mojang 验证玩家？默认情况下，这是开启的。                                                                  |
| `force-key-authentication`         | 布尔值 | 代理是否应该强制执行新的公钥安全标准？默认情况下，这是开启的。                                                                    |
| `player-info-forwarding-mode`      | 枚举  | 有关更多信息，请参阅[配置玩家信息转发](/velocity/player-information-forwarding)。                                     |
| `prevent-client-proxy-connections` | 布尔值 | 如果客户端的 ISP/AS 从这个代理发送的与 Mojang 认证服务器发送的不同，玩家将被踢出。这会阻止一些 VPN 和代理连接，但是一种较弱的保护形式。                     |
| `forwarding-secret-file`           | 字符串 | 存储转发密钥的文件名称。此密钥用于确保 Velocity 转发的玩家信息来自你的代理，而不是来自假装运行 Velocity 的人。有关更多信息，请参阅“玩家信息转发”部分。             |
| `announce-forge`                   | 布尔值 | 此设置决定 Velocity 是否应将自己呈现为一个兼容 Forge/FML 的服务器。默认情况下，这是禁用的。                                           |
| `kick-existing-players`            | 布尔值 | 允许恢复 Vanilla 的行为，即如果玩家尝试重新连接（例如，短暂失去互联网连接），则将代理上的用户踢出。                                             |
| `ping-passthrough`                 | 字符串 | 允许转发“尝试”列表（或强制主机服务器连接顺序）中的内容，包括“无”（默认）、“MODS”（用于Forge）、“DESCRIPTION”或“全部”（`ALL`）。                  |
| `enable-player-address-logging`    | 布尔值 | 如果禁用（默认为 `true`），玩家 IP 地址将在日志中被替换为 `<IP 地址已隐藏>`。                                                   | |

## `servers` 部分

| 设置名称  | 类型 | 描述                                         |
|-------|----|--------------------------------------------|
| 服务器名称 | 地址 | 这使代理知道它可以连接到的服务器。                          |
| `try` | 数组 | 这指定了 Velocity 在玩家登录和玩家被服务器踢出时应该尝试连接到什么服务器。 |

## `forced-hosts` 部分

| 设置名称 | 类型  | 描述                                      |
|------|-----|-----------------------------------------|
| 主机名称 | 主机名 | 此配置使代理为指定的主机名创建一个强制主机。指定主机名的服务器尝试列表是其值。 |

## `advanced` 部分

| 设置名称                                       | 类型  | 描述                                                                         |
|--------------------------------------------|-----|----------------------------------------------------------------------------|
| `compression-threshold`                    | 整数  | 这是代理在压缩数据包之前数据包的最小大小（以字节为单位）。Minecraft 默认使用 256 字节。                        |
| `compression-level`                        | 整数  | 此设置指示代理应使用什么 `zlib` 压缩级别来压缩数据包。默认值使用默认的 `zlib` 级别。                         |
| `login-ratelimit`                          | 整数  | 此设置确定从同一 IP 地址的连接在被代理接受之前必须经过的最短时间（以毫秒为单位）。值为 `0` 时将禁用速率限制。                |
| `connection-timeout`                       | 整数  | 此设置确定代理在尝试连接到服务器时等待的时间。                                                    |
| `read-timeout`                             | 整数  | 此设置确定代理在从服务器接收数据之前等待的时间。                                                   |
| `haproxy-protocol`                         | 布尔值 | 此设置确定 Velocity 是否接收 HAProxy PROXY 消息。如果你不使用 HAProxy，请关闭此设置。                |
| `tcp-fast-open`                            | 布尔值 | 此设置允许你在 Velocity 中启用 TCP Fast Open 支持。你的代理必须运行在 Linux 内核 >=4.14 上，此设置才会生效。 |
| `bungee-plugin-message-channel`            | 布尔值 | 此设置允许你启用或禁用对 BungeeCord 插件消息通道的支持。                                         |
| `show-ping-requests`                       | 布尔值 | 此设置允许你记录客户端发送到代理的 ping 请求。                                                 |
| `announce-proxy-commands`                  | 布尔值 | 此设置允许你启用或禁用显式地向客户端发送代理命令（用于 Minecraft 1.13+ 的 Tab 补全）。                     |
| `failover-on-unexpected-server-disconnect` | 布尔值 | 此设置允许你决定在服务器意外断开连接时，代理是应该切换到其他服务器还是直接断开用户连接。                               |
| `log-command-executions`                   | 布尔值 | 确定代理是否记录用户运行的所有命令。                                                         |
| `log-player-connections`                   | 布尔值 | 启用记录玩家连接到代理、在服务器之间切换以及从代理断开连接的日志。                                          |
| `accepts-transfers`                        | 布尔值 | 确定代理是否接受来自其他服务器的传入转移。如果禁用，代理将断开转移过来的客户端连接。                                 |

## `query` 部分

| 设置名称           | 类型  | 描述                                                |
|----------------|-----|---------------------------------------------------|
| `enabled`      | 布尔值 | 是否让 Velocity 回复 Minecraft 查询协议请求。通常可以保持为 `false`。 |
| `port`         | 数字  | 指定 Velocity 监听 GameSpy 4（Minecraft 查询协议）请求的端口。    |
| `map`          | 字符串 | 指定显示给客户端的地图名称。                                    |
| `show-plugins` | 布尔值 | 是否在查询响应中包含 Velocity 插件。                           |
