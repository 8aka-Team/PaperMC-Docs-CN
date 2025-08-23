---
title: 系统属性
description: 关于 Paper 可能会检查的系统属性和环境变量的文档
slug: paper/reference/system-properties
---

在启动服务器时可以设置这些系统属性和环境变量，从而配置各种设置。

:::danger[前方危险]

为 JVM 设置标志可以改变其运行方式，Paper 服务器也是如此。
如果你不确定某个标志的作用，建议你**不要使用它**。

:::

## 它们的工作原理

系统属性在启动服务器时设置。例如，如果你使用 `.bat` 或 `.sh` 文件启动服务器，可以将系统属性添加到该文件中。例如：

```bash
java -Dpaper.log-level=FINE -jar paper.jar
```

:::note[注意]

Paper 的一些系统属性名称中包含 `.` 字符。在使用 PowerShell 时，这些需要使用引号包裹，
例如 `"-Dpaper.log-level=FINE"`。

:::

其中 `-D` 用于设置系统属性，系统属性是 `paper.log-level`，值为 `FINE`。否则，只需将它们添加到启动命令中。

:::note[注意]

如果系统属性被标记为 `未设置`，可以将其设置为 `true` 启用它。

:::

[环境变量](https://en.wikipedia.org/wiki/Environment_variable)是传递值给 Paper 的另一种方式。
根据您的操作系统以及启动 Paper 的方式，它们可以以多种方式设置。

在大多数情况下，您不需要使用这些，除非您在（Docker）容器中运行 Paper 或类似情况。

## 系统属性列表

#### paper.playerconnection.keepalive

- **默认**: `30`
- **描述**: 控制玩家连接在未收到任何心跳包时等待关闭的时间，单位为秒。

#### timings.bypassMax

- **默认**: `未设置`
- **描述**: 允许绕过发送到 Aikar 的 Timings API 的最大数据量限制。除非 API 配置允许，否则设置此选项不会允许绕过限制。

#### LetMeReload

- **默认**: `未设置`
- **描述**: 使用 `/reload` 命令时，此选项会禁用重新加载确认消息。

#### paper.disableChannelLimit

- **默认**: `未设置`
- **描述**: 禁用服务器的插件通道限制。这将禁用每个玩家最多 128 个插件通道的限制。

#### net.kyori.adventure.text.warnWhenLegacyFormattingDetected

- **默认**: `false`
- **描述**: 启用或禁用在聊天组件中检测到旧版格式化时的警告。

#### Paper.DisableClassPrioritization

- **默认**: `未设置`
- **描述**: 禁用类优先级系统——这通常是在未能正确重定位或遮蔽时的一个问题。

#### Paper.disableFlushConsolidate

- **默认**: `未设置`
- **描述**: 禁用 Netty 冲刷整合系统.

#### Paper.debugDynamicMissingKeys

- **默认**: `未设置`
- **描述**: 启用对 NBT 对象中缺失键的调试日志记录。

#### disable.watchdog

- **默认**: `未设置`
- **描述**: 禁用看门狗（watchdog）警告系统。

#### paper.explicit-flush

- **默认**: `未设置`
- **描述**: 启用网络通道的显式刷新。

#### Paper.enable-sync-chunk-writes

- **默认**: `未设置`
- **描述**: 在每次写入调用时同步写入。这会对性能产生影响，尤其是在硬盘驱动器上。

#### paper.debug-sync-loads

- **默认**: `未设置`
- **描述**: 启用同步区块加载的调试日志记录。

#### Paper.ignoreWorldDataVersion

- **默认**: `未设置`
- **描述**: 加载世界时忽略世界数据版本。不建议这样做，可能会导致问题。

#### Paper.bypassHostCheck

- **默认**: `未设置`
- **描述**: 在客户端连接到服务器时绕过主机模式匹配尝试。

#### paper.ticklist-warn-on-excessive-delay

- **默认**: `未设置`
- **描述**: 启用当刻列表被安排了过长的延迟时的警告。

#### debug.rewriteForIde

- **默认**: `未设置`
- **描述**: 从堆栈跟踪中移除 NMS 修订版本，以便在 IDE 中更容易进行调试。它还重新映射插件的 CB 调用以移除版本信息。

#### convertLegacySigns

- **默认**: `未设置`
- **描述**: 将旧版告示牌转换为新格式。

#### paper.maxCustomChannelName

- **默认**: `64`
- **描述**: 设置插件通道名称可以接受的最大长度。

#### Paper.maxSignLength

- **默认**: `80`
- **描述**: 设置告示牌的最大行长度。

#### Paper.minPrecachedDatafixVersion

- **默认**: `Minecraft 世界版本 +1`
- **描述**: 如果你预计需要转换大量的区块，你可能需要将此设置为仅从某个点开始转换。

#### Paper.WorkerThreadCount

- **默认**: 可用物理（**非逻辑**）核心数量的一半，或者如果可用核心数量为 3 个或更少，则为 `1`
- **描述**: 设置用于区块加载的工作线程数量。更多信息请参阅[这里](/paper/reference/global-configuration#chunk_system_worker_threads)。

#### Paper.excessiveTELimit

- **默认**: `750`
- **描述**: 如果方块实体的数量超过此值，将它们拆分为多个数据包。

#### io.papermc.paper.suppress.sout.nags

- **默认**: `未设置`
- **描述**: 抑制关于在插件中使用 `System.out`/`System.err` 的提醒消息。

#### paper.strict-thread-checks

- **默认**: `未设置`
- **描述**: 此设置使 AsyncCatcher 的状态始终记录错误，如果代码未在主线程上运行。

#### Paper.skipServerPropertiesComments

- **默认**: `未设置`
- **描述**: 跳过 `server.properties` 文件中的注释。

#### Paper.debugInvalidSkullProfiles

- **默认**: `未设置`
- **描述**: 启用对无效头颅配置文件的调试日志记录。这将记录世界中任何无效的头颅及其相应的位置信息。

#### paper.alwaysPrintWarningState

- **默认**: `未设置`
- **描述**: 始终打印特定级别的警告状态。

#### Paper.parseYamlCommentsByDefault

- **默认**: `true`
- **描述**: 设置是否默认解析 YAML 文件中的注释。

#### paperclip.patchonly:

- **默认**: `false`
- **描述**: 如果服务器是通过 Paperclip 补丁工具启动的（下载页面上的默认分发版本），则此设置决定是否仅对原版服务器进行补丁处理并下载库，而不启动服务器。

#### Paper.IgnoreJavaVersion

- **默认**: `false`
- **描述**: 允许你绕过 Java 版本检查。更多信息请参阅[这里](/paper/faq#检测到不支持的-java-版本我该怎么办)。

#### paper.useLegacyPluginLoading

- **默认**: `false`
- **描述**: 允许循环加载插件。更多信息请参阅[这里](/paper/reference/paper-plugins#循环插件加载)。

#### Paper.DisableCommandConverter

- **默认**: `false`
- **描述**: 禁用 Paper 自动将命令（包括命令方块中定义的自定义数据的物品以及其他可能包含命令的地方）升级到 1.20.5 版本引入的新组件格式。

#### paper.disableOldApiSupport

- **默认**: `false`
- **描述**: 禁用可能导致类加载显著延迟的插件兼容性措施（也称为 “Commodore” 插件重写）。这通常要求你的所有插件都针对最新 API 版本进行编译。

#### paper.disablePluginRemapping

- **默认**: `false`
- **描述**: 禁用1.20.5引入的插件重映射。更多信息请查看[userdev](/paper/dev/userdev#1205-and-beyond)文档和官方[公告](https://discord.com/channels/289587909051416579/976631292747735080/1232740079097876570)。

#### paper.preferSparkPlugin

- **默认**: `false`
- **描述**: 是否禁用集成的 spark 性能分析器，以使用独立插件。如果未找到 spark 插件，无论设置如何，都将加载集成版本，除非它被[明确禁用](/paper/reference/global-configuration#spark_enabled)。

#### paper.disableWorldSymlinkValidation

- **默认**: `false`
- **描述**: 禁用加载世界时的文件夹遍历和符号链接验证。在超大世界（>1TB）中显著提高世界加载速度。这不会禁用数据包的符号链接验证。

#### paper.disableGameRuleLimits

- **默认**: `false`
- **描述**: 禁用对某些游戏规则值的限制，例如 `minecartMaxSpeed` 和 `spawnChunkRadius`。

#### minecraft.api.session.host

- **默认**: `https://sessionserver.mojang.com`
- **描述**: 允许指定自定义会话服务器 URL，例如用于缓存。要使此设置生效，还需要设置 [`minecraft.api.services.host`](#minecraftapiserviceshost)。

#### minecraft.api.services.host

- **默认**: `https://api.minecraftservices.com`
- **描述**: 允许指定自定义服务 API URL，例如用于缓存。要使此设置生效，还需要设置 [`minecraft.api.session.host`](#minecraftapisessionhost)。

#### com.mojang.eula.agree

- **默认**: `false`
- **描述**: 将此设置为 true 表示你已同意 [Mojang 的 EULA](https://aka.ms/MinecraftEULA)，跳过 `eula.txt` 检查。

#### org.bukkit.plugin.java.LibraryLoader.centralURL

- **默认**: `https://maven-central.storage-download.googleapis.com/maven2`
- **描述**: 设置默认中央仓库的URL，插件的依赖项通过`plugin.yml`文件中的 [`libraries`](/paper/dev/plugin-yml#libraries) 字段声明，将从该URL解析。如果设置了 [`PAPER_DEFAULT_CENTRAL_REPOSITORY`](#paper_default_central_repository) 环境变量，则会覆盖此设置。

:::caution[警告]

如果您希望使用 Maven Central 配置此功能，请使用镜像，因为直接将 Maven Central 用作 CDN 是违反 Maven Central 服务条款的，您可能会遇到速率限制。

默认情况下，它使用了 Maven Central 的 Google 北美镜像。您也可以使用[此处](https://storage-download.googleapis.com/maven-central/index.html)列出的区域特定镜像。

:::

## 环境变量列表

#### PAPER_VELOCITY_SECRET

- **默认**: `未设置`
- **描述**: 覆盖全局配置选项 [`proxies.velocity.secret`](/paper/reference/global-configuration#proxies_velocity_secret)。

#### PAPER_DEFAULT_CENTRAL_REPOSITORY

- **默认**: `https://maven-central.storage-download.googleapis.com/maven2`
- **描述**: 设置默认中央仓库的URL，插件通过`plugin.yml`文件中的 [`libraries`](/paper/dev/plugin-yml#libraries) 字段声明的依赖项将从该URL解析。如果设置了 [`org.bukkit.plugin.java.LibraryLoader.centralURL`](#orgbukkitpluginjavalibraryloadercentralurl) 系统属性，则此环境变量将覆盖该系统属性。

:::caution[警告]

如果您希望使用 Maven Central 配置此功能，请使用镜像，因为直接将 Maven Central 用作 CDN 是违反 Maven Central 服务条款的，您可能会遇到速率限制。

默认情况下，它使用了 Maven Central 的 Google 北美镜像。您也可以使用[此处](https://storage-download.googleapis.com/maven-central/index.html)列出的区域特定镜像。

:::
