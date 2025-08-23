---
title: 自动发布
description: 如何在提交时自动将您的插件发布到 Hangar
slug: misc/hangar-publishing
---

如果您希望在提交时自动将您的插件发布到 [Hangar](https://hangar.papermc.io/)，
您可以使用我们的 [Gradle 插件](https://github.com/HangarMC/hangar-publish-plugin)。

在您添加了所需的 `hangarPublish` 配置后，
您可以通过运行 `./gradlew build publishPluginPublicationToHangar` 手动发布它，
或者让 GitHub Actions 在每次提交时自动发布一个版本。

## 先决条件

### Gradle

您的插件项目需要使用 Gradle 作为其构建工具。

:::tip[提示]

如果您正在使用 Maven，[切换到 Gradle 设置非常简单](https://docs.gradle.org/current/userguide/migrating_from_maven.html)，
并且通常由于更高的可配置性和对其他插件的支持（例如在[针对未混淆的 Minecraft 服务器进行编译](/paper/dev/userdev)时）而被推荐。

提供的示例使用了 Kotlin DSL，但您也可以使用 Groovy 来完成相同的操作。
在线转换器（甚至 ChatGPT）能够将示例代码进行转换。

:::

### 创建 `Snapshot` 发布渠道

下面的构建脚本将在 `Snapshot` 渠道下发布非正式版本。
您需要先在您的 Hangar 项目渠道页面中创建这个渠道。

![创建一个 Snapshot 渠道](./assets/hangar-create-snapshot-channel.png)

### 添加 `HANGAR_API_TOKEN` 仓库密钥

首先，您需要创建一个 Hangar API 令牌。在个人资料下拉菜单中进入您的 Hangar 设置，点击左侧的“API 密钥”。
然后，勾选 `create_version` 权限框，给密钥命名并创建它。
**在顶部**，您应该会看到您的密钥 API 令牌。**不要与任何人共享此令牌**；您将在下一步中需要它。

提供的 GitHub Actions 工作流使用仓库密钥来存储您的 Hangar API 密钥。
前往您的 GitHub 项目设置，然后点击安全标签下的“操作”，并点击“新建仓库密钥”按钮。
将密钥命名为 `HANGAR_API_TOKEN`，并将上一步中获得的 Hangar API 令牌粘贴到密钥字段中。

![操作密钥](./assets/github-secrets-actions.png)

## 项目文件

以下文件是简单的示例，需要您进行少量手动更改才能使用，
但您仍然可以根据需要进行调整。
查看注释，尤其是 TODO，以了解您仍需更改的内容。

### `gradle.properties`

如果您的项目根目录中尚未存在 `gradle.properties` 文件，请创建一个。
在其中，您定义插件所兼容的平台版本。
只需删除您不需要的平台，并填入正确的版本号。

Hangar 允许使用版本范围（例如 `1.19-1.20.2`）和通配符（例如 `1.20.x`）。

```properties
# 指定 Paper 和 Velocity 的平台版本。
# Hangar 也允许使用版本范围（例如 1.19-1.20.2）和通配符（例如 1.20.x）。
# TODO：删除您不需要的平台，并填入正确的版本号。
paperVersion=1.12.2, 1.16.5, 1.19-1.20.2
velocityVersion=3.2
waterfallVersion=1.20
```

### `build.gradle.kts`

在您的 `build.gradle.kts` 构建脚本的插件块中，添加发布插件：

```kotlin
plugins {
    id("io.papermc.hangar-publish-plugin") version "0.1.2"
}
```

然后，您只需要添加 `hangarPublish` 配置块，并确保您执行以下操作：

- 如果您的插件不是 Paper 插件，或者也支持 Velocity/Waterfall，请复制带有不同平台的注册块，并将属性更改为 `paperVersion`（在 `gradle.properties` 文件中声明）以外的属性。
- 插入正确的项目命名空间
- 插入您的插件依赖项（如果有）
- 如果您使用下面的 Actions 文件，您需要设置 `HANGAR_API_TOKEN` 仓库密钥，否则以其他方式添加 API 密钥

```kotlin
import io.papermc.hangarpublishplugin.model.Platforms

// ...

hangarPublish {
    publications.register("plugin") {
        version.set(project.version as String)
        channel.set("Snapshot") // 我们正在使用 `Snapshot` 渠道
        // TODO: 将项目名称更改为与您的 Hangar 项目匹配
        id.set("hangar-project")
        apiKey.set(System.getenv("HANGAR_API_TOKEN"))
        platforms {
            // TODO: 使用适合您插件的正确平台
            register(Platforms.PAPER) {
                // TODO: 如果您使用的是 ShadowJar，请替换 jar 行为适当的任务：
                //   jar.set(tasks.shadowJar.flatMap { it.archiveFile })
                // 设置要上传的 JAR 文件
                jar.set(tasks.jar.flatMap { it.archiveFile })

                // 从 gradle.properties 文件中设置平台版本
                val versions: List<String> = (property("paperVersion") as String)
                        .split(",")
                        .map { it.trim() }
                platformVersions.set(versions)

                // TODO: 配置您的插件依赖项（如果有）
                dependencies {
                    // 在 Hangar 上找到的依赖项示例
                    hangar("Maintenance") {
                        required.set(false)
                    }
                    // 外部依赖项示例
                    url("Debuggery", "https://github.com/PaperMC/Debuggery") {
                        required.set(true)
                    }
                }
            }
        }
    }
}
```

### 可选：深入了解

通过以下渠道，任何包含连字符 (`-`) 的版本都将在 Hangar 上您需要创建的 `Snapshot` 渠道下发布。
通过编辑 `channel.set(...)` 行，您可以将其更改为任何您喜欢的渠道。
例如，您可以根据当前所在的分支进一步拆分构建为 `Alpha` 构建。

:::caution[警告]

确保您永远不会将正在进行的开发构建发布到 `Release` 渠道。

:::

```kotlin
import java.io.ByteArrayOutputStream

// ...

// 辅助方法
fun executeGitCommand(vararg command: String): String {
    val byteOut = ByteArrayOutputStream()
    exec {
        commandLine = listOf("git", *command)
        standardOutput = byteOut
    }
    return byteOut.toString(Charsets.UTF_8.name()).trim()
}

fun latestCommitMessage(): String {
    return executeGitCommand("log", "-1", "--pretty=%B")
}

val versionString: String = version as String
val isRelease: Boolean = !versionString.contains('-')

val suffixedVersion: String = if (isRelease) {
    versionString
} else {
    // 通过使用 GitHub Actions 运行编号为版本提供一个唯一名称
    versionString + "+" + System.getenv("GITHUB_RUN_NUMBER")
}

// 使用提交描述作为更新日志
val changelogContent: String = latestCommitMessage()

// 如果您希望手动发布带有正确更新日志的版本，只需在此处添加一个带有 `isRelease` 变量的 if 语句。
hangarPublish {
    publications.register("plugin") {
        version.set(suffixedVersion)
        channel.set(if (isRelease) "Release" else "Snapshot")
        changelog.set(changelogContent)
        // ...（见上文）
    }
}
```

### GitHub Actions 工作流

您不一定需要通过 GitHub Actions 发布，但它是一种简单的方法。
如果您想使用它，请在项目根目录的 `.github/workflows` 文件夹中创建一个 `publish.yml` 文件，
并确保您[添加了仓库密钥](#添加-hangar_api_token-仓库密钥)。

您可以通过编辑 `branches` 部分来添加和删除要发布的分支。

```yaml
name: Publish to Hangar
on:
  push:
    branches:
      # 添加您想要自动发布的任何其他分支
      - main # 假设您的主分支名为 `main`

jobs:
  publish:
    # TODO: 可选：确保该任务仅在推送到您的仓库时运行，且不会在分支仓库中失败。取消以下行的注释，并将仓库所有者填入引号中
    # if: github.repository_owner == '<YOUR USER/ORG NAME>'
    runs-on: ubuntu-22.04
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v3
      - name: Validate Gradle Wrapper
        uses: gradle/wrapper-validation-action@v1
      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with:
          distribution: 'temurin'
          java-version: 17
      - name: Publish
        env:
          # 确保您已在仓库设置中添加了仓库密钥
          HANGAR_API_TOKEN: ${{ secrets.HANGAR_API_TOKEN }}
        run: ./gradlew build publishPluginPublicationToHangar --stacktrace
```
