---
title: 开始使用
description: 如何安装并设置 Velocity 的最小配置
slug: velocity/getting-started
---

本页面介绍了如何安装和设置 Velocity 的最小配置。

## 安装 Java

Velocity 是用 Java 编写的，因此如果您尚未安装 Java，则需要在继续之前安装它。
Velocity 至少需要 Java 17，但使用 21 或更高版本效果最佳。
请参阅我们的 [Java 安装指南](/misc/java-install) 以获取详细说明。

## 下载 Velocity

前往[下载](https://papermc.io/downloads/velocity)页面获取最新版本的 Velocity。
我们建议下载最新的稳定版本。
下载 Velocity 后，将 JAR 文件移动到专门用于代理的文件夹中，或者将其上传到您的服务器。

## 首次启动 Velocity

下载 Velocity 后，我们将首次启动它以生成配置文件 `velocity.toml`。
完成 Velocity 的配置后，
您可以使用创建的启动脚本来启动 Velocity。

### 在 Windows 下启动 Velocity

在您打算放置代理文件的同一目录中创建一个 `start.bat` 文件，
并填入以下内容。

```batch title="start.bat"
@echo off
java -Xms1G -Xmx1G -XX:+UseG1GC -XX:G1HeapRegionSize=4M -XX:+UnlockExperimentalVMOptions -XX:+ParallelRefProcEnabled -XX:+AlwaysPreTouch -XX:MaxInlineLevel=15 -jar velocity.jar
pause
```

:::tip[提示]

请确保将 `velocity.jar` 替换为您下载的 Velocity JAR 文件的名称，
或者将 Velocity JAR 文件重命名为 `velocity.jar`。

:::

保存后，双击 `start.bat` 文件。如果一切正常，
您现在应该会看到一个与下一部分中的输出类似的控制台。

### 在 macOS 或 Linux 下启动 Velocity

在您打算放置代理文件的同一目录中创建一个 `start.sh` 文件。
您可以使用文件传输客户端，或者使用主机上运行的文本编辑器来完成此操作。

```bash title="start.sh"
#!/bin/sh

java -Xms1G -Xmx1G -XX:+UseG1GC -XX:G1HeapRegionSize=4M -XX:+UnlockExperimentalVMOptions -XX:+ParallelRefProcEnabled -XX:+AlwaysPreTouch -XX:MaxInlineLevel=15 -jar velocity*.jar
```

保存文件后，如果你还没有打开终端（或登录到机器），请打开一个终端（或登录到机器）。
导航到你放置 Velocity JAR 文件和 `start.sh` 文件的目录。
然后，你需要准备 `start.sh` 脚本，使其可执行并运行它。

1. 运行 `chmod u+x start.sh`。 此命令修改文件的权限，授予文件所有者（即你）执行（`x`）脚本的权限。
   如果没有这一步，系统可能无法识别该脚本是可以运行的。
2. 现在文件已经可以执行，运行 `./start.sh` 来运行脚本。

## 启动后

以下是启动代理后您将看到的示例输出：

```log replace
[05:41:13 INFO]: Booting up Velocity \{LATEST_VELOCITY_RELEASE} (git-74c932e5-b363)...
[05:41:13 INFO]: Loading localizations...
[05:41:13 INFO]: Connections will use epoll channels, libdeflate (Linux aarch64) compression, OpenSSL (Linux aarch64) ciphers
[05:41:13 INFO]: Loading plugins...
[05:41:13 INFO]: Loaded 0 plugins
[05:41:13 INFO]: Listening on /[0:0:0:0:0:0:0:0%0]:25565
[05:41:13 INFO]: Done (0.36s)!
```

Velocity 已启动，您现在可以完全配置代理。
请在控制台中输入 `end` 并按回车键。代理将关闭：

```log
> end
[05:42:10 INFO]: Shutting down the proxy...
[05:42:10 INFO]: Closing endpoint /0.0.0.0:25565
```

如果您使用了前面的 Windows 批处理脚本，窗口会提示您按任意键。
您可以按任意键，或者直接关闭命令窗口。

### 配置您的服务器

现在我们需要配置每个服务器以接受来自代理的连接。

Velocity 是一个高度可配置的代理。
虽然大多数用户不需要更改配置中的所有内容，
但[配置参考页面](/velocity/configuration)涵盖了大量选项，并解释了每个选项的工作原理。
然而，在本节中，我们将只进行最基本的配置，以使代理能够运行。

在文本编辑器中打开 `velocity.toml` 文件，并查找 `[servers]` 部分。
该部分指定了 Velocity 可以连接到的服务器。
以下是 `[servers]` 部分的初始内容：

```toml title="velocity.toml"
[servers]
# 在这里配置您的服务器。
# 每个键代表服务器的名称，而值代表要连接的服务器的 IP 地址。
lobby = "127.0.0.1:30066"
factions = "127.0.0.1:30067"
minigames = "127.0.0.1:30068"

# 当玩家登录或被踢出服务器时，我们应尝试连接服务器的顺序。
try = [
  "lobby",
  "factions"
]
```

在左侧，您需要为服务器指定一个名称（例如 `lobby`），而在右侧是一个表示服务器 IP 地址和端口的字符串。
现在您需要将您的服务器添加到列表中。
您可以根据需要更改服务器列表。

`try` 设置比较特殊。
它是一个服务器列表，当玩家首次登录代理或被踢出服务器时，Velocity 会尝试将玩家连接到这些服务器。
如果您决定更改 `lobby` 服务器的名称，
那么您应该将此列表中的 `lobby` 替换为您选择的玩家首次登录的服务器名称。

:::caution[注意]

以下设置是通用的，
适用于任何 Minecraft 服务器。
这种设置不仅不实用（玩家将缺少皮肤、正确的 UUID，所有连接都将显示为来自代理），而且**极其不安全**。
在将服务器置于离线模式后，
您**必须**按照“玩家信息转发”和“保护您的服务器”部分的内容完成设置。

:::

打开每个服务器的 `server.properties` 文件，并将 `online-mode` 设置为 `false`
。这允许 Velocity 连接到您的服务器。
完成后，请重启服务器。
虽然 Velocity 现在已经可以使用，
但您几乎肯定需要[保护您的服务器](/velocity/security)并[配置玩家信息转发](/velocity/player-information-forwarding)。
