---
title: 服务迁移
description: 将服务器迁移到 Paper 或从 Paper 迁移非常简单。本页面将帮助您开始。
slug: paper/migration
---

将服务器迁移到 Paper 或从 Paper 迁移非常简单。以下步骤将帮助您开始。

:::caution[开始之前，请备份您的数据！]

在开始之前，请确保您已经对服务器进行了完整的备份。

更多信息请查看我们的[备份指南](/paper/updating#步骤-1备份)。

:::

## 迁移到 Paper

### 从 CraftBukkit 或 Spigot 迁移

从 CraftBukkit 或 Spigot 迁移到 Paper 非常简单。请按照以下步骤操作。

1. 如果服务器正在运行，请停止它，并创建一个完整的备份。
2. 从我们的[下载页面](https://papermc.io/downloads)下载 Paper。
3. 将下载的文件重命名为与[启动命令](/paper/getting-started#运行服务器)中指定的名称一致。
4. 用新下载的 Paper JAR 文件替换现有的 JAR 文件。
5. 启动您的新服务器。

Paper 与所有 Spigot 插件完全兼容，允许无缝过渡。

:::note[注意]

您的新 Paper 服务器仍将使用[`bukkit.yml`](/paper/reference/bukkit-configuration)
和[`spigot.yml`](/paper/reference/spigot-configuration)。
新的配置选项可以在[`config/paper-global.yml`](/paper/reference/global-configuration)
和[`config/paper-world-defaults.yml`](/paper/reference/world-configuration)中找到。

:::

如果您在从 CraftBukkit 或 Spigot 迁移时遇到任何问题，请不要犹豫，
在我们的 [Discord](https://discord.gg/papermc) 的 `#paper-help` 频道寻求支持。

### 从原版迁移

从原版迁移到 Paper 时，世界的存储方式会自动改变。
如果您日后想要回到原版，
请仔细遵循[回到原版](#回到原版)，因为需要手动进行更改。

1. 如果原版服务器正在运行，请停止它，并创建一个完整的备份。
2. 从我们的[下载页面](https://papermc.io/downloads)下载 Paper，
   并用新下载的 Paper JAR 文件替换原版服务器的 JAR 文件。
3. 将下载的文件重命名为与[启动命令](/paper/getting-started#运行服务器))中指定的名称一致。
4. 启动您的新 Paper 服务器。

您已成功迁移到 Paper。如果您遇到任何问题，请不要犹豫，
在我们的 [Discord](https://discord.gg/papermc) 的 `#paper-help` 频道寻求支持。

### 从 Fabric/Forge 迁移

由于 Fabric 和 Forge 都使用原版的世界目录结构，
因此可以使用[从原版迁移](#从原版迁移)中的相同步骤，但有一个注意事项。
如果您的 Fabric 或 Forge 服务器使用了添加了新方块、物品或其他游戏数据的模组，
Paper 将无法加载这些功能。

此外，请注意 Paper 不支持 Fabric 或 Forge 模组。
您需要寻找插件替代品。
任何试图同时支持模组和插件的混合方案都存在根本性缺陷，不建议使用。

## 从 Paper 迁移

### 回到原版

由于 Paper 存储世界的方式与原版略有不同，因此需要手动操作才能完成迁移。
如果未采取这些步骤，您的下界和末地看起来会像是被重置了。
别担心！即使发生了这种情况，您的数据也不会丢失。
原版服务器只是不知道去哪里找到它们。

以下图表展示了原版和 Paper 存储世界的不同方式。

| 服务器软件 | 主世界      | 下界                    | 末地                    |
|-------|----------|-----------------------|-----------------------|
| 原版    | `/world` | `/world/DIM-1`        | `/world/DIM1`         |
| Paper | `/world` | `/world_nether/DIM-1` | `/world_the_end/DIM1` |

按照以下步骤从 Paper 迁移到原版：

:::note[注意]

这些步骤假设`level-name`（在`server.properties`中设置）为`world`。
如果您的情况并非如此，请在以下所有步骤中将`world`替换为您的`level-name`。

:::

1. 如果 Paper 服务器正在运行，请停止它。
2. 如果您已经用原版启动过服务器，
   请进入 `world` 文件夹并删除 `DIM-1` 和 `DIM1` 这两个文件夹。
   只有在您用原版启动过服务器时，这一步才是必要的。
3. 将 `/world_nether/DIM-1` 文件夹复制到 `/world` 文件夹中。
4. 将 `/world_the_end/DIM1` 文件夹复制到 `/world` 文件夹中。
5. 删除 `/world_nether` 和 `/world_the_end` 这两个文件夹。
6. 用一个原版服务器 JAR 文件替换 Paper JAR 文件。
7. 启动您的原版服务器。

### 迁移到 CraftBukkit 或 Spigot

Paper **不支持**迁移到 CraftBukkit 或 Spigot！
尽管您可能会成功（CraftBukkit 和 Spigot 使用与 Paper 相同的目录结构），
但如果您遇到问题，请**不要**寻求支持，并注意可能会丢失数据。

### 迁移到 Fabric/Forge

由于 Fabric 和 Forge 在世界存储方面使用与原版相同的目录结构，
因此请按照[从原版迁移](#从原版迁移)进行此过程。
请注意，Fabric 和 Forge 都不支持 Paper 插件！您需要寻找替代模组。
