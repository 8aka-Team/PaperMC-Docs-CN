---
title: 信息转发
description: 如何在 Velocity 上配置信息转发
slug: velocity/player-information-forwarding
---

Velocity 支持将有关玩家的信息转发到您的服务器，例如 IP 地址、UUID 和皮肤。
Velocity 支持三种转发格式：

- **Velocity modern 转发** 是一种自定义的转发格式（现代转发），它更加安全。
- **BungeeCord 转发**（也称为 _旧版转发_ ），它具有更好的兼容性，但安全性较低。
- **BungeeGuard**，它与 BungeeCord 转发相同，但包含一个密钥。
  它比单独的 BungeeCord 转发更好，但不如 Velocity 现代转发理想。

:::note[注意]

您只能选择其中一种转发格式（如果想要同时是应用多种转发协议请使用 [Velocity-CTD](https://github.com/GemstoneGG/Velocity-CTD) 它允许同时对多个不同的后端使用不同的协议）。
目前无法“混用”转发模式或将所有转发格式一起使用。
一般来说，如果您仅支持使用 Minecraft 1.13 及更新版本的客户端，
请使用 Velocity 现代转发，否则您必须使用 BungeeCord 转发。

:::

## 配置现代转发

`modern` 转发是一种 Velocity 原生格式。
它以高效的二进制格式转发所有玩家信息，并使用消息认证码（MAC）来防止服务器冒充您的 Velocity 代理，从而使其更难被欺骗。
然而，它仅适用于 Minecraft 1.13 或更高版本。

:::caution[注意]

现代转发与 Minecraft 1.13 以下版本以及 ProtocolSupport 插件不兼容。
如果您使用了这些中的任何一个，您将需要使用与旧版 BungeeCord 兼容的转发。

:::

要使用现代转发，请将 `velocity.toml` 中的
`player-info-forwarding-mode` 设置为 `modern`。
然后，您需要确保服务器正确配置为使用 Velocity 转发。

### 为 Paper 配置现代转发

Paper 1.14 及以上版本，以及 Paper 1.13.1/1.13.2 构建 377 及以上版本原生支持 Velocity 现代转发。

首先，您需要在 `server.properties` 文件中禁用 `online-mode` 设置。
这将阻止服务器验证玩家，而由代理来完成这一操作。

如果您之前启用了 BungeeCord 转发，您还需要将其禁用。
请确保在您的 `spigot.yml` 文件中将 `settings.bungeecord` 设置为 `false`。

在 `config/paper-global.yml` 文件中，将 `proxies.velocity.enabled` 设置为 `true`，并将 `proxies.velocity.secret` 设置为与您的 `forwarding.secret` 文件中的密钥匹配。
您还需要将 `proxies.velocity.online-mode` 设置为与您的 `velocity.toml` 文件中的 `online-mode` 设置一致。
完成对 `paper-global.yml` 的编辑后，请重启服务器。

:::note[注意]

如果您使用的是 Paper 1.18.2 或更低版本，您会在 `paper.yml` 文件中找到这些选项，分别为
`settings.velocity-support.enabled`、`settings.velocity-support.secret` 和 `settings.velocity-support.online-mode`。

:::

## 为 Fabric 配置现代转发

一款名为 [FabricProxy-Lite](https://modrinth.com/mod/fabricproxy-lite) 的模组
允许您在使用 Fabric 的修改版服务器上使用 Velocity 现代转发。

## 为 Forge 配置现代转发

一款名为 [ProxyCompatibleForge](https://modrinth.com/mod/proxy-compatible-forge) 的模组允许您在使用 Forge 1.14 或
更高版本的修改版服务器上使用 Velocity 现代转发。

## C配置与旧版 BungeeCord 兼容的转发

:::danger[危险]

旧版转发是**从根本上不安全的**。
如果您必须使用它，您应该了解[如何正确保护您的服务器](/velocity/security)。
该页面回顾了所有可能的选项，以确保除了代理之外没有任何东西可以连接到您的服务器。

:::

`legacy` 转发是 BungeeCord 在启用 BungeeCord 的 IP 转发时使用的玩家信息转发协议。
由于这个原因，它非常普遍，并且得到了大多数服务器实现的良好支持。
它具有出色的兼容性（支持 2013 年发布的 1.7.2 及更早版本），并且如果您在修改版服务器上安装并正确配置了 SpongeForge/BungeeForge，它将与 Forge 一起工作。
然而，它并不安全。

如果您必须使用与 BungeeCord 兼容的转发，
请将 `velocity.toml` 中的 `player-info-forwarding-mode` 设置为 `legacy`。
您还需要确保服务器能够接收 Velocity 发送的转发玩家数据。

为了增加安全性，特别是对于托管在共享主机上的代理，
Velocity 可选地支持 [BungeeGuard](https://www.spigotmc.org/resources/bungeeguard.79601/) 插件。
要使用它，请将 `velocity.toml` 中的 `player-info-forwarding-mode` 设置为 `bungeeguard`，
然后将 `forwarding.secret` 文件中的值添加到 BungeeGuard 配置中的 token 部分。

### 为 Spigot/Paper 配置旧版转发

要让 Spigot 或 Paper 理解来自 Velocity 的转发数据，
请将 `spigot.yml` 中的 `settings.bungeecord` 设置为 `true`，然后重启服务器。

### 为 Sponge 配置旧版转发

要配置 Sponge 以理解来自 Velocity 的转发数据，您需要先停止服务器，
然后将 `config/sponge/global.conf` 文件中的 `modules.bungeecord`
设置为 `true`，并将 `bungeecord.ip-forwarding` 设置为 `true`，最后重新启动您的 Sponge 服务器。

### 为 Forge 配置旧版转发

要配置 Forge 以理解来自 Velocity 的转发数据，您需要先停止服务器，
下载正确的 [BungeeForge](https://github.com/caunt/BungeeForge/releases) 版本，并将该模组放入 `mods` 文件夹中，然后重新启动您的 Forge 服务器。

### 为 Fabric 配置旧版转发

:::caution[注意]

不再有任何支持旧版转发的活跃支持的模组。
请改用 Velocity 现代转发。

:::
