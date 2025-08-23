---
title: 构建工具
description: 一篇关于如何使用 paperweight-userdev Gradle 插件来访问内部代码的指南
slug: paper/dev/userdev
---

**paperweight** 是 Paper 的自定义构建工具的名称。
其中的 **paperweight-userdev** Gradle 插件部分在开发过程中提供了对内部代码（也称为 NMS）的访问。

:::note[注意]

本指南使用 Gradle Kotlin DSL 编写，并假设你对 Gradle 有一些基本的了解。
如果你想查看一个使用 **paperweight-userdev** 的完整功能插件，
请查看这个 [示例插件](https://github.com/PaperMC/paperweight-test-plugin)。

:::

## 为什么这很有用
这是访问服务器内部的唯一支持方式，因为重新分发服务器 JAR 文件违反了 Minecraft 最终用户许可协议（EULA）和通用许可假设。
即使你手动依赖于修改过的服务器，你也会阻碍其他人在你的项目上工作，
并且在你的 IDE 中会缺少部署的 API Java 文档/源码。

除此之外，Spigot 和 1.20.5 之前的 Paper 版本仍然使用 Spigot 映射，这些映射是混淆的字段/方法与已映射以及自定义命名的类的混合。
这使得在开发环境中使用变得困难。
这个插件允许你在开发过程中使用完全未混淆的类型、名称和字段，然后将你的插件重新映射，以便它仍然可以与混淆的服务器一起使用。
然而，这并不适用于反射。
如果你想在反射中支持混淆的服务器，请查看类似 [这个库](https://github.com/jpenilla/reflection-remapper) 的工具，以便在反射中使用未混淆的名称。

:::note[1.20.5 Mojang-mapped 运行时]

从 Minecraft 1.20.5 版本开始，Paper 使用 Mojang 映射的运行时，而不是将服务器重新混淆为 Spigot 映射。
更多详细信息请参见 [这里](#1205-and-beyond)。

:::

## 添加插件
将插件添加到你的 `build.gradle.kts` 文件中。

```kts title="build.gradle.kts" replace
plugins {
  id("io.papermc.paperweight.userdev") version "\{LATEST_USERDEV_RELEASE}"
}
```

:::note[Gradle 版本]

请确保您正在使用 Gradle 的最新稳定版本。
有关升级 Gradle 的更多信息，请查看 [Gradle Wrapper 文档](https://docs.gradle.org/current/userguide/gradle_wrapper.html)。

:::

`paperweight-userdev` 的最新版本支持 Minecraft 1.17.1 及更高版本的开发包，
因此最好保持最新状态！只有 `paperweight-userdev` 的最新版本才得到官方支持，如果你使用旧版本遇到问题，我们会要求你先更新。
此外，如果你在使用 `paperweight-userdev` 时遇到问题，应该在我们的专用 [Discord 服务器](https://discord.gg/PaperMC)
的 [`#build-tooling-help`](https://discord.com/channels/289587909051416579/1078993196924813372) 频道中提问！

:::note[预发布]

**paperweight-userdev** 的 SNAPSHOT（预发布）版本仅通过 Paper 的 Maven 仓库提供。
```kotlin title="settings.gradle.kts"
pluginManagement {
  repositories {
    gradlePluginPortal()
    maven("https://repo.papermc.io/repository/maven-public/")
  }
}
```

:::

## 添加开发包依赖
如果你现在尝试加载你的 Gradle 项目，
你会收到一个错误，提示你需要声明一个开发包依赖。
你可以在你的 `build.gradle.kts` 文件的 `dependencies` 块中添加它。

```kotlin title="build.gradle.kts" replace
dependencies {
  // 其他依赖
  paperweight.paperDevBundle("\{LATEST_PAPER_RELEASE}-R0.1-SNAPSHOT")
}
```

:::tip[提示]

你应该移除对 Paper API 的任何依赖，因为开发包已经包含了它。

:::

## Gradle 任务

### `reobfJar`

这个任务会创建一个插件 JAR 文件，该文件被重新混淆为 Spigot 的运行时映射。
这意味着它可以在标准的 Paper 服务器上运行。

输出文件将位于 `build/libs` 文件夹中。
文件名包含 `-dev` 的 JAR 文件是使用 Mojang 映射的（未重新混淆），因此无法在大多数服务器上运行。

:::note[Shadow]

如果你在构建脚本中应用了 Shadow Gradle 插件，**paperweight-userdev** 会检测到这一点，
并将阴影 JAR 用作 `reobfJar` 任务的输入。

`build/libs` 文件夹中的 `-dev-all.jar` 文件是经过阴影处理但未重新混淆的 JAR 文件。

:::

你可以通过以下方式让 `reobfJar` 任务在默认的 `build` 任务中运行：
```kotlin
tasks.assemble {
  dependsOn(tasks.reobfJar)
}
```

## 1.20.5 及以后

从 1.20.5 开始，Paper 使用 Mojang 映射的运行时，而不是将服务器重新混淆为 Spigot 映射。
此外，CraftBukkit 类不再被重新定位到一个版本化的包中。
这要求在必要时在加载插件之前对其进行反混淆处理。

这个过程的大部分是由 paperweight 自动完成的，但在从现在开始使用服务器内部代码（或“NMS”）时，有一些重要的事情需要了解。

### 默认映射假设
* 默认情况下，如果 Spigot/Bukkit 插件在其清单中未指定映射命名空间，则会被假定为使用 Spigot 映射。
  反过来，如果 Paper 插件在其清单中未指定映射命名空间，则会被假定为使用 Mojang 映射。
* 首次加载时，使用 Spigot 映射的插件需要进行反混淆处理，而使用 Mojang 映射的插件则不需要。

### 编译到 Mojang 映射

:::note[注意]

这是首选选项，因为在服务器启动时会跳过一次性插件重新映射的过程，
并且它可能允许你在较小的更新中保持版本兼容性，而无需进行更改或添加额外模块。
然而，这会使你的插件与 Spigot 服务器不兼容。

:::

如果你希望主输出使用 Mojang 映射，你需要移除所有 `dependsOn(reobfJar)` 行，并在你的构建脚本中添加以下代码：

```kotlin title="build.gradle.kts"
paperweight.reobfArtifactConfiguration = io.papermc.paperweight.userdev.ReobfArtifactConfiguration.MOJANG_PRODUCTION
```

### 编译到 Spigot 映射

如果你希望主输出使用 Spigot 映射，请在你的构建脚本中添加以下代码：

```kotlin title="build.gradle.kts"
paperweight.reobfArtifactConfiguration = io.papermc.paperweight.userdev.ReobfArtifactConfiguration.REOBF_PRODUCTION
```

这对于既有 Spigot 加载器又有 Paper 加载器，并且希望与两者都保持兼容性的插件很有用。

:::note[注意]

如果你使用的是带有 Groovy DSL 的 Gradle，你应该通过静态方法（如 `getMOJANG_PRODUCTION()`）来访问这些字段。

:::
