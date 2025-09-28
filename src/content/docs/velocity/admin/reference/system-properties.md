---
title: 系统属性
description: 关于 Velocity 可能会检查的系统属性和环境变量的文档
slug: velocity/reference/system-properties
---

在启动服务器时可以设置这些系统属性和环境变量，从而配置各种设置。

:::danger[危险]

为 JVM 设置 flags 可以改变其运行方式，同样适用于 Velocity 服务器。
如果你不确定某个 flags 的作用，建议你**不要使用它**。

:::

## 它们是如何工作的

系统属性是在启动服务器时设置的。
例如，如果你使用 `.bat` 或 `.sh` 文件来启动服务器，你可以将系统属性添加到该文件中。例如：

```bash
java -Dvelocity.packet-decode-logging=true -jar velocity.jar
```

:::note[注意]

Velocity 的一些系统属性名称中包含 `.` 字符。在使用 PowerShell 时，这些需要使用引号包裹。
例如：`"-Dvelocity.packet-decode-logging=true"`

:::

`-D` 用于设置系统属性，而系统属性是 `velocity.packet-decode-logging`，其值为 `true`。
否则，只需将它们添加到启动命令中。

:::note[注意]

显示的默认值可能未明确设置为该属性，但仅在未明确设置时才会被 Velocity 使用。

:::

## 系统属性列表

#### auth.forceSecureProfiles

- **默认**: `true`
- **描述**: 覆盖配置中的 `force-key-authentication`。如果未设置，则会自动设置为当前配置的值。

#### mojang.sessionserver

- **默认**: `https://sessionserver.mojang.com/session/minecraft/hasJoined`
- **描述**: 用于身份验证的会话服务器上`hasJoined`端点的完整URL。

#### velocity.natives-tmpdir

- **默认**: `unset`
- **描述**: Velocity 本地文件的临时目录。（如果设置，它还将定义 `io.netty.native.workdir`）

#### velocity.max-known-packs

- **默认**: `64`
- **描述**: 限制已知的资源包仅使用默认的原版资源包，以防止 Velocity 崩溃。

#### velocity.max-clientside-plugin-channels

- **默认**: `1024`
- **描述**: 限制客户端注册的插件消息通道，因为 Velocity 和后端服务器都需要跟踪它们。

#### velocity.max-packets-per-flush

- **默认**: `8192`
- **描述**: 队列自动刷新前的最大数据包数量。

#### velocity.log-server-backpressure

- **默认**: `false`
- **描述**: Velocity 是否应该记录服务器连接是否可写，从而判断玩家连接是否自动读取。

#### velocity.packet-decode-logging

- **默认**: `false`
- **描述**: 是否应该详细记录数据包解码错误。

#### velocity.skip-uncompressed-packet-size-validation

- **默认**: `false`
- **描述**: 是否跳过未压缩数据包大小的验证，这对于允许修改过的设置发送超过阈值的未压缩数据包很有用。

#### velocity.increased-compression-cap

- **默认**: `false`
- **描述**: 是否将最大未压缩数据包的大小设置为其支持的最大限制（128 MiB），而不是原版的限制（8 MiB）。

#### velocity.disable-native-transport

- **默认**: `false`
- **描述**: 是否禁用 Netty 的本地传输方法，如 `io_uring` 支持和 Epoll。如果设置为 `true`，Velocity 将使用 Java 的 NIO 传输。

#### velocity.enable-iouring-transport

- **默认**: `false`
- **描述**: 当设置为`true`时，启用 Netty 的 `io_uring` 传输。默认情况下，Velocity 仅使用 Epoll（在 Linux 上）和 kqueue（在 macOS 上）原生传输。此属性不会覆盖 `velocity.disable-native-transport` 属性。

#### velocity.natives-disabled

- **默认**: `false`
- **描述**: 是否禁用特定操作系统的本地功能。

#### velocity.strictErrorHandling

- **默认**: `true`
- **描述**: 客户端是否应在数据包错误时断开连接。在 MC 1.20.5 中临时添加，并在 1.21.2 中移除，以帮助修改版服务器过渡到这一变化。

## 环境变量列表

#### VELOCITY_FORWARDING_SECRET

- **默认**: `unset`
- **描述**: 覆盖配置文件中 [`forwarding-secret-file`](/velocity/configuration#root-section) 的转发密钥。
