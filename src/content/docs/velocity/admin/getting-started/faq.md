---
title: 常见问题
description: 常见的 Velocity 管理问题
slug: velocity/faq
---

多年来，我们收到了许多用户提出的相同问题。
此常见问题解答（FAQ）试图从用户的角度回答这些问题。

## Velocity 需要哪个版本的 Java？

Velocity 3.3.x 及以上版本至少需要 Java 17，但使用 21 或更高版本效果最佳。

## 我在哪里可以找到 Velocity 插件？

寻找与 Velocity 兼容的插件的一个好去处是我们的插件仓库 [Hangar](https://hangar.papermc.io/?page=0&platform=VELOCITY)。
[modrinth](https://modrinth.com/plugins?g=categories:velocity)

## Velocity 是否支持为 BungeeCord 或 Waterfall 开发的插件？

不支持。
如果决定支持 BungeeCord 插件，Velocity 将无法实现许多功能

然而，某些插件可能有适用于 Velocity 的版本，或者有替代方案可用。
此外，支持 BungeeCord 但仅需安装在服务器上（无需在代理上安装任何内容）的插件通常使用 BungeeCord 插件消息通道，
而最新版本的 Velocity 原生支持该通道。

## 帮助，我无法连接到我的服务器！

无法连接到服务器的原因通常有以下几种。

### 基本故障排除

首先，您应该验证以下内容：

- 服务器已启动，并且可以响应控制台输入
- 代理已启动
- 服务器和代理已绑定到适当的端口和 IP

### 不正确的玩家信息转发错误

```
Can't connect to server lobby: If you wish to use IP forwarding, please enable it in your Bungeecord config as well!
// 无法连接到服务器大厅：如果您想使用 IP 转发，请在您的 Bungeecord 配置中启用它！
```

```
Can't connect to server lobby: Your server did not send a forwarding request to the proxy. Is it set up correctly?
// 无法连接到服务器大厅：您的服务器未向代理发送转发请求。是否正确设置了服务器？
```

这些错误是由于配置不当导致的。
请参阅[玩家信息转发](/velocity/player-information-forwarding)，了解如何正确设置玩家信息转发。

```
Can't connect to server lobby: This server requires you to connect with Velocity.
// 无法连接到服务器大厅：此服务器要求您使用 Velocity 连接。
```

此错误是由于在后端服务器上启用了 Velocity 现代转发，
但未在 Velocity 中启用。
要解决此错误，请确保您已在代理上设置了正确的玩家信息转发方法。
更多信息请参阅 [玩家信息转发](/velocity/player-information-forwarding)。

### 无效的 `REGISTER` 数据包

```
[server connection] player1 -> hub has connected
[connected player] player1 (/localhost:58943): kicked from server hub: Invalid payload REGISTER!
```

当使用修改版客户端连接时，基于 Spigot 的服务器通常会出现此错误。
如果您使用的是 Paper（或 Paper 的分支）1.12.2 或更高版本，
可以通过在服务器启动标志中添加启动标志 [`-Dpaper.disableChannelLimit=true`](/paper/reference/system-properties#paperdisablechannellimit) 并重启服务器来解决此问题。

### 参数类型标识符未知

```
Argument type identifier <namespace>:<name> unknown.
// 参数类型标识符 `<namespace>:<name>` 未知。
```

如果您收到此消息，有两种可能性。
如果您运行的是修改版服务器并且使用的是 Fabric 1.16 及以上版本，
请更新到至少 Velocity 1.1.2 并安装 [CrossStitch](https://www.curseforge.com/minecraft/mc-mods/crossstitch)。
（如果您运行的是其他类型的修改版服务器并且能够使其与 Velocity 一起工作，请告诉我们！）

如果您收到此消息但运行的是原版服务器，
请向 [Velocity 问题跟踪器](https://github.com/PaperMC/Velocity/issues/new) 报告错误。

### 在切换到 Forge 服务器时读取超时

特别是对于一些非常大的模组包，玩家与代理之间的连接存在更高的断开风险。
我们在代理端无法做太多事情来缓解这一问题。
我们建议您要么减少服务器使用的模组数量，要么在 `velocity.toml` 中提高 `read-timeout` 设置，
并在您的 Forge 服务器启动标志中添加 `-Dfml.readTimeout`，将其设置为您为代理选择的秒数。
例如，如果您确定 120 秒是最佳的读取超时时间，
请使用 `-Dfml.readTimeout=120`，并在 `velocity.toml` 中将 `read-timeout = 120000`。

### 我的强制主机不起作用！

如果你依赖SRV记录将玩家引导到代理服务器，请记住，Velocity使用客户端发送的**主机名**来匹配`forced-hosts`，该主机名在连接之前就已经解析好了——并不一定是玩家输入的地址。

要让`forced-hosts`与非默认端口上的代理服务器（例如`12345`）一起工作，请使用以下设置：

创建DNS记录：
- **CNAME:** `forced1.example.com → actual.server.address.com`
- **SRV:** `_minecraft._tcp.survival → forced1.example.com`（优先级：0，权重：0，端口：12345）

在`velocity.toml`中：
```toml
[forced-hosts]
"forced1.example.com" = ["survival"] # survival.example.com
```

尽管玩家通过`survival.example.com`连接，但SRV记录指向`forced1.example.com`，而这就是客户端发送给Velocity的内容——从而使其能够在`forced-hosts`中正确匹配。

### 插件无法修改消息或命令

```
A plugin tried to cancel a signed chat message. This is no longer possible in 1.19.1 and newer. Disconnecting player <player>
// 一个插件尝试取消已签名的聊天消息。在 1.19.1 及更高版本中，这已不再可能。正在断开玩家 <player> 的连接。
```

从 Minecraft 1.19.1 开始，Mojang 实现了一种新的聊天系统，
该系统使用每个玩家拥有的签名密钥对每条消息进行加密。
Velocity 尚未完全支持取消或修改此类消息和命令，因此您可以安装 [SignedVelocity](https://hangar.papermc.io/4drian3d/SignedVelocity) 插件，
该插件将允许消息或命令传输到您的服务器，服务器在接收到它后，将应用在 Velocity 中计算的结果。
