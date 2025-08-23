---
title: 配置 Java
description: 如何在 Linux（apt/rpm）、Windows 或 Mac 上安装或更新到 Java 21。
slug: misc/java-install
---

安装 Java 是使用或开发 Paper 和 Velocity 插件的关键第一步。
本指南将指导您完成大多数主要平台的推荐安装步骤。

:::caution[不要使用 Java 的 headless (无头)版本！]

Java 有一些 `headless` 变体，其软件包名称中通常带有 `-headless` 后缀。
这些变体缺少Paper所需的依赖项。 因此，不建议使用它们。

:::

:::tip[提示]

本指南专注于亚马逊的 Corretto OpenJDK 发行版，
因为它在大多数平台上提供了最佳的安装体验。
然而，Corretto 并不是唯一可以选择的 OpenJDK 发行版。
还有许多替代方案，例如 [Eclipse Adoptium](https://adoptium.net/)、[Microsoft Build of OpenJDK](https://www.microsoft.com/openjdk)
和 [Azul Zulu](https://www.azul.com/downloads/?package=jdk)。
需要注意的是，尽管 Oracle 分发的 JDK 在功能上是相同的，
但由于其极不友好的安装程序和之前不友好的许可政策，**不推荐**使用。

:::

## Linux

### Ubuntu/Debian

在基于 Debian 的 Linux 发行版上安装 Java 21 非常简单。
首先，确保您的系统具备成功安装 Java 所需的所有工具。

```bash
sudo apt-get update
sudo apt-get install ca-certificates apt-transport-https gnupg wget
```

其次，导入 Amazon Corretto 公钥和 apt 仓库。

```bash
wget -O - https://apt.corretto.aws/corretto.key | sudo gpg --dearmor -o /usr/share/keyrings/corretto-keyring.gpg && \
echo "deb [signed-by=/usr/share/keyrings/corretto-keyring.gpg] https://apt.corretto.aws stable main" | sudo tee /etc/apt/sources.list.d/corretto.list
```

然后，使用以下命令安装 Java 21 及其他依赖项：

```bash
sudo apt-get update
sudo apt-get install -y java-21-amazon-corretto-jdk libxi6 libxtst6 libxrender1
```

继续[验证您的安装](#验证安装)。

### RPM-based

要在 CentOS、RHEL、Fedora、openSUSE、SLES 或其他基于 RPM 的 Linux 发行版上安装 Java 21，
请根据您的包管理器执行以下命令。
完成后，请继续[验证您的安装](#验证安装)。

#### DNF

DNF 用于 Fedora、CentOS/RHEL 7+ 及相关发行版。

```bash
sudo rpm --import https://yum.corretto.aws/corretto.key
sudo curl -Lo /etc/yum.repos.d/corretto.repo https://yum.corretto.aws/corretto.repo
sudo dnf -y install java-21-amazon-corretto-devel
```

#### Zypper

Zypper 用于 openSUSE、SLES 及相关发行版。

```bash
sudo zypper addrepo https://yum.corretto.aws/corretto.repo
sudo zypper refresh
sudo zypper install java-21-amazon-corretto-devel
```

#### YUM

YUM 用于较旧版本的 CentOS/RHEL 和非常旧版本的 Fedora。

```bash
sudo rpm --import https://yum.corretto.aws/corretto.key
sudo curl -Lo /etc/yum.repos.d/corretto.repo https://yum.corretto.aws/corretto.repo
sudo yum -y install java-21-amazon-corretto-devel
```

## Windows 10 & 11

如果您的系统是 Windows 10 或 11，
安装 Java 就像安装其他任何程序一样简单。
您可以从 [Amazon Corretto 官方网站](https://corretto.aws/downloads/latest/amazon-corretto-21-x64-windows-jdk.msi) 下载 Amazon Corretto 安装程序。

安装程序运行后，您可以安全地点击“下一步”完成整个安装过程。
不会安装任何额外的软件或工具栏，所有必要的功能都已默认启用。

现在，打开命令提示符并继续[验证您的安装](#验证安装)。

## macOS/OS X

如果您使用的是 macOS，管理 Java 安装的最佳方式是使用一个名为 [Homebrew](https://brew.sh) 的工具。
按照其首页上的说明进行安装。
然后，在您的终端中运行以下命令：

```bash
brew install openjdk@21
```

完成此命令后，请继续[验证您的安装](#验证安装)。

## [Pterodactyl](https://pterodactyl.io/)

:::note[注意]

在低于 `1.2.0` 版本的 Pterodactyl 中，需要管理员账户才能更改 Java 版本。
这些说明将不适用。

:::

如果使用错误版本的 Java 启动了 Paper 服务器，
Pterodactyl 会自动提示您更新，如下图所示：

![Pterodactyl Automatic Prompt](./assets/pterodactyl-prompt.png)

如果未显示此提示，可以手动更改 Java 版本。
导航至服务器的“启动”标签页，
从“Docker 镜像”下拉菜单中选择`Java 21`，如下图所示。

![Pterodactyl Manual Java Version Change](./assets/pterodactyl-manual.png)

:::note[注意]

如果在下拉菜单中看不到`Java 21`，则需要管理员账户来更新 Paper egg。

:::

验证安装部分不适用于 Pterodactyl。

## 验证安装

现在您已经安装了 Java 21，
请在终端中运行以下命令以确保安装过程成功。

```bash
java -version
```

输出内容应类似于以下内容。
需要注意的是，它以`openjdk 21`开头，并且最后一行包含`64-Bit`。
如果您得到的输出类似于`java: command not found`，请尝试创建一个新的终端会话。

```
openjdk version "21" 2023-09-19 LTS
OpenJDK Runtime Environment Corretto-21.0.0.35.1 (build 21+35-LTS)
OpenJDK 64-Bit Server VM Corretto-21.0.0.35.1 (build 21+35-LTS, mixed mode, sharing)
```

如果您的安装失败，请不要犹豫，
前往我们的 [Discord](https://discord.gg/papermc) 的 `#paper-help` 频道寻求支持。
