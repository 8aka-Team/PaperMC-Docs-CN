---
title: 添加插件
description: 插件是扩展 Paper 功能的最强大方式，超越了配置文件的限制
slug: paper/adding-plugins
---

插件是扩展 Paper 功能的最强大方式，超越了配置文件的限制。
通过插件添加的功能可以包括让牛奶恢复饥饿值或让枯死的灌木生长，
甚至可以添加全新的游戏模式或物品。

:::danger[恶意插件]

在安装任何插件之前，请确保您完全信任其插件来源。
插件被授予对服务器以及运行服务器的机器的**完全且不受限制**的访问权限。
因此，必须确保仅从可信来源安装插件。请务必小心！

:::

## 寻找插件

在安装插件之前，您需要找到您想要安装的插件。
寻找插件的最佳去处是 [Hangar](https://hangar.papermc.io) ，这是 Paper 的插件仓库。
不过，您也可以在 [SpigotMC](https://www.spigotmc.org/resources/) 、[BukkitDev](https://dev.bukkit.org/bukkit-plugins) 、
[PaperMC 论坛](https://forums.papermc.io/forums/paper-plugin-releases/) 、 [Modrinth](https://modrinth.com/plugins) 以及 [GitHub](https://github.com) 上找到许多插件。
实际上，寻找插件的最佳方式并非直接浏览这些网站，
而是使用搜索引擎进行搜索。
在搜索时，将您期望实现的功能与 `Minecraft plugin` 一起输入，通常能够得到不错的搜索结果。

:::tip[Spigot 和 Bukkit 插件]

Paper 与 Spigot 和 Bukkit 插件兼容。
即使插件没有明确提到与 Paper 的兼容性，它仍然可以正常工作。

:::

## 安装插件

1. 一旦您找到了想要安装的插件，请下载它。确保您下载的文件以 `.jar` 结尾。
   有些插件也会以 `.zip` 文件的形式分发，在这种情况下，
   您需要解压文件并找到适用于您平台的 `.jar` 文件，
   通常会标记为 `bukkit` 或 `paper`。
2. 下载插件后，
   找到 Paper 服务器根目录下的 `plugins` 文件夹。
3. 将插件文件（.jar）拖放到`plugins`文件夹中。
   如果您使用的是共享托管服务，
   可能需要使用其网页面板或 SFTP 来上传插件，但操作步骤是一样的。
4. 重启服务器。插件应该会加载。
5. 检查工作。服务器加载完成后，在游戏中运行 `/plugins` 命令，或在控制台中输入 `plugins`。
   您应该会看到新安装的插件以绿色显示。
   如果插件未列出或显示为红色，请继续进行[故障排除](#故障排除)。
   插件显示为红色意味着它当前未启用。
   对于新安装的插件，这通常意味着插件未能加载。

## 故障排除

### 检查日志

故障排除安装插件的第一步是检查服务器的日志。
服务器的最新日志将存储在 `logs/latest.log` 文件中。
您可能需要滚动到该文件的开头部分，以查看插件加载的时间。

#### 缺少依赖项

如果您看到类似以下内容：

```log
[00:00:00] [Server thread/WARN] Could not load 'plugins/MyAwesomePlugin-1.0.0.jar' in folder 'plugins'
                                // 无法在“plugins”文件夹中加载“plugins/MyAwesomePlugin-1.0.0.jar”。
[00:00:00] [Server thread/WARN] org.bukkit.plugin.UnknownDependencyException: Unknown/missing dependency plugins: [Vault]. Please download and install these plugins to run 'MyAwesomePlugin'.
```

这意味着您尝试安装的插件缺少一个依赖项。
在这种情况下，依赖项是指您必须安装的另一个插件，才能使第一个插件正常工作。
虽然您会看到一个很大的错误信息，但重要的是查看以下这一行：

```log
[00:00:00] [Server thread/WARN] Unknown/missing dependency plugins: [Vault]. Please download and install these plugins to run 'MyAwesomePlugin'.
                                // 未知/缺失的依赖插件：[Vault]。请下载并安装这些插件以运行“MyAwesomePlugin”。
```

这表明，为了加载 `MyAwesomePlugin`，您必须先安装 `Vault`。

#### 无效的 `plugin.yml`

如果你看到的内容更接近于这个：

```log
[00:00:00] [Server thread/WARN] Could not load 'plugins/MyAwesomePlugin-1.0.0.jar' in folder 'plugins'
[00:00:00] [Server thread/WARN] org.bukkit.plugin.InvalidDescriptionException: Invalid plugin.yml
```

这意味着您下载的内容不是一个有效的 Paper 插件。
这通常是由以下原因之一造成的：

1. 您下载的插件根本不是一个插件，而是为 Forge、Fabric 或类似平台设计的模组。
   这些无法在 Paper 上运行。
2. 插件未能完整下载。
   特别是当使用`curl`或`wget`等工具时，您可能会下载到错误页面，而不是您想要的插件。
   这可能也是由于网络问题造成的。 尝试重新下载插件。
   如果您使用 FTP（而不是 SFTP 或网页面板）将插件上传到共享托管服务，请确保您的 FTP 客户端处于 `binary` 模式，而不是 `ASCII` 模式。
   具体操作请参考您的 FTP 客户端的文档。

#### 插件名称不明确

如果您看到类似以下内容：

```log
[00:00:00] [Server thread/WARN] Ambiguous plugin name `Essentials' for files `plugins/EssentialsX-2.19.4.jar' and `plugins/Essentialsx-2.20.0-dev.jar' in `plugins'
                                // 插件名称`Essentials`存在歧义，因为`plugins`文件夹中存在两个文件：`plugins/EssentialsX-2.19.4.jar`和`plugins/Essentialsx-2.20.0-dev.jar`。
```

这意味着您安装了两个同名的插件，这是不被支持的。
在这个例子中，EssentialsX 的两个版本都被安装了。
一个是发布版本`2.19.4`，另一个是开发版本`2.20.0`。
请确保您一次只安装每个插件的一个版本。删除重复插件的旧版本，然后重新启动服务器。

为了防止在更新时不小心安装了同一插件的两个版本，
您可以使用[更新指南](/paper/updating#step-2-update-plugins)中描述的 `update` 文件夹。

#### 其他问题

如果出现错误，但与上述内容不相似，请尝试自行阅读。
尽管完整的错误信息可能很长且令人困惑，但您可能只需阅读前一两行即可了解问题所在。
如果您不确定，请不要犹豫，在我们的 [Discord](https://discord.gg/papermc)
的 `#paper-help` 频道寻求支持。

### 如果没有记录任何内容

如果没有记录任何内容，您的服务器可能根本就没有尝试加载任何插件。
服务器加载插件所需的条件如下：

1. 文件位于其工作目录下的 `plugins` 文件夹的根目录中。
   这通常是服务器 JAR 文件所在的文件夹。 **`plugins` 文件夹的子文件夹不会被检查。**
   所有插件都必须放在根文件夹中。
2. 文件以 `.jar` 结尾。如果您的插件不以 `.jar` 结尾，您下载的内容可能不是插件。
   请注意，有些插件会将多个 JAR 文件作为 `.zip` 文件分发。
   如果这是这种情况，您必须在安装插件之前先解压它们。

如果上述条件都满足，但您仍然没有看到任何日志，
请在我们的 [Discord](https://discord.gg/papermc) 服务器的 `#paper-help` 频道寻求支持，
我们会很高兴为您提供帮助。
