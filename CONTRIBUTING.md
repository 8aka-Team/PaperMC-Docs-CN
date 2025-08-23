# 为 PaperMC 中文翻译文档做贡献

感谢您考虑为 PaperMC 中文翻译文档仓库做贡献！我们感谢您帮助我们改进文档。
为确保贡献过程顺畅且富有协作性，请遵循以下指南。

## 目录

1. [介绍](#介绍)
2. [添加页面](#添加页面)
3. [提交贡献](#提交贡献)
4. [样式指南](#样式指南)
5. [版本标签](#版本标签)
6. [常量替换](#常量替换)
7. [链接到 Javadocs](#链接到-Javadoc)
8. [行为准则](#行为准则)

## 介绍

PaperMC 文档仓库包含了 PaperMC 项目的文档，这些文档为我们的用户、开发者和贡献者提供必要的信息、指导和规范。您对文档的贡献对于提升和维护文档质量有着重要的作用。

我们使用 [Starlight](https://starlight.astro.build/) 构建和部署文档网站。
Starlight 提供了 [丰富的文档](https://starlight.astro.build/guides/authoring-content/)，详细介绍了其功能和使用方法。

PaperMC 的大部分文档是用 Markdown 编写的，Markdown 是一种简单易学的标记语言。您可以查看一些现有的文档，以了解其编写方式。

### 添加页面

要向文档中添加新页面，请在相应的文件夹中创建一个新的 Markdown 文件。

例如，如果您想向 Paper Admin 文档添加一个新页面，请在 `src/content/docs/paper/admin/` 文件夹中创建一个新的 Markdown 文件。
文件名应使用小写字母，并用连字符分隔单词，例如 `my-new-page.md`

页面应以 slug 和标题开头。例如：

```markdown
---
title: Paper 插件
slug: paper/reference/paper-plugins
---

本页面旨在解释 Paper 插件可能引入的所有新语义以及可能产生的困惑。
```

这将使页面位于网站的 `/paper/reference/paper-plugins` URL 上。
Slug 应该是唯一的，并且遵循文档的文件夹结构。标题是将在网站和侧边栏中显示的页面名称。

您还需要将页面添加到侧边栏中。在这种情况下，我们将进入 `astro.config.ts` 文件，并将文件添加到该部分的 `items` 标签中。
您必须使用该文件的 slug，例如 `paper/reference/paper-plugins`。查看现有的侧边栏元素，以了解其结构方式。

## 提交贡献

如果您希望为 PaperMC 文档做出贡献，请按照以下步骤操作：

1. 将仓库 fork 到您的 GitHub 账户。

2. 从 `main` 分支创建一个新的分支。

3. 根据下面提到的样式指南进行更改或添加新的文档。

4. 提交您的更改并将它们推送到您的 fork。

5. 向文档仓库的 `main` 分支提交拉取请求（PR）。Cloudflare Pages 将自动为您的 PR 部署更改的预览。预览的链接将出现在 PR 的评论中。

6. 您的 PR 将被审查，如有必要，可能会提供反馈。

7. 一旦您的贡献符合指南和要求，它将被合并到主仓库中。

## 样式指南

为了保持文档的一致性和可读性，请遵守以下样式指南：

1. **美式英语**：所有文档应使用美式英语撰写。请使用美式拼写、语法和标点符号。可以参考 [这份指南](https://www.oxfordinternationalenglish.com/differences-in-british-and-american-spelling/)，了解美式英语和英式英语的区别。

2. **使用句子大小写**：如果合适，请使用句子大小写而不是标题大小写。句子大小写结合主动语态可以营造更自然、更口语化的语气。

3. **Markdown 格式**：文档应以 Markdown 格式（.md 或 .mdx）撰写，以便在网站上轻松渲染。如果不使用任何 MDX 功能，请使用纯 Markdown 文件（.md），以提高标记的可移植性。

4. **标题结构**：使用 `title` 前置事项属性作为主标题，使用 `h2`（##）作为节标题，并按照此模式为后续子标题进行设置。

5. **代码块**：包含代码片段或终端命令时，请使用带有适当语法高亮的围栏代码块。

6. **提示框**：使用提示框突出显示重要信息。例如，使用 `:::note` 表示一般说明，`:::tip` 表示提示，`:::caution` 表示警告，`:::danger` 表示严重警告。

7. **链接和引用**：引用外部资源或链接到其他页面时，请使用描述性锚点文本并提供完整的 URL。

8. **图片和视频**：如有必要，可插入图片以阐释概念，确保图片清晰且与内容相关，并将其存储在仓库中，而不是外部 CDN（例如 Imgur）。也可以插入视频，但应确保视频简短且经过适当压缩。如果视频不需要交互（例如暂停），则建议使用动画图像（GIF、WebP 等），因为自动播放更能吸引注意力，并且可以通过构建工具进一步优化。

9. **格式化代码**：在完成更改后，别忘了运行格式化脚本 `pnpm run format`。

10. **保持简洁**：撰写清晰简洁的句子，避免不必要的行话和解释。

11. **包容性**：考虑所有读者和贡献者，使用包容且欢迎所有人的语言。

12. **大写“Vanilla”**：提到基础游戏时，请使用大写的“Vanilla”。

## 版本标签

所有可能与软件特定版本相关的文档都应标记有 `version` 前置事项值。这使用户能够看到文档是针对哪个版本的软件编写的。

保持这一信息的更新非常重要，因为它能让用户判断文档是否仍适用于当前版本，但这并不是所有文档的必要要求。例如，关于项目历史的页面就不需要 `version`

```markdown
---
title: 我的超棒页面
description: 我的超棒页面，介绍 1.20 版本的超棒主题。
slug: paper/my-awesome-page
version: "1.20"
---

.....
```

## 常量替换

在页面中，您可能会用到许多常量，例如最新的 Paper、Velocity 或 Minecraft 版本号。

这些常量可以在 MDX 中导入和使用，如下所示：

```mdxjs
import {
  LATEST_MC_RELEASE,
  LATEST_PAPER_RELEASE,
  LATEST_VELOCITY_RELEASE,
  LATEST_FOLIA_RELEASE,
  LATEST_WATERFALL_RELEASE,
  LATEST_USERDEV_RELEASE,
} from "/src/utils/versions";

Latest Paper version is {LATEST_PAPER_RELEASE}.
Latest Velocity version is {LATEST_VELOCITY_RELEASE}.
Latest Minecraft version is {LATEST_MC_RELEASE}.
Latest Folia version is {LATEST_FOLIA_RELEASE}.
Latest Waterfall version is {LATEST_WATERFALL_RELEASE}.
Latest `paperweight-userdev` version is {LATEST_USERDEV_RELEASE}.
```

如果您希望在代码块中执行这些替换，您需要使用特殊的 `replace` 元属性。
它也可以在普通的 `.md` 文件中使用，您无需导入任何内容：

````markdown
```yaml replace
name: Paper-Test-Plugin
version: "1.0"
main: io.papermc.testplugin.TestPlugin
description: Paper Test Plugin
api-version: '\{LATEST_PAPER_RELEASE}'
bootstrapper: io.papermc.testplugin.TestPluginBootstrap
loader: io.papermc.testplugin.TestPluginLoader
```
````

对于行内代码块，例如 `my code block`（在 Markdown 中为 `` `my code block` ``），您无需使用属性，因为所有行内代码块都会自动进行替换。

```markdown
- `api-version: '\{LATEST_PAPER_RELEASE}'`
```

## 链接到 Javadoc

许多 Javadoc 网站支持 `latest` 标签，例如 javadoc.io 或类似网站，这种情况下，只需在普通 Markdown 链接中使用它即可。
然而，您可能还想引用 Paper、Velocity 或 Java 的最新版本的 Javadoc，这些版本并不支持 `latest` 标签。

为此，您可以使用 `jd:project_name[:module_name][:class_or_member_reference]` Markdown 链接快捷方式：

```md
[我的`活动`链接](jd:paper:org.bukkit.event.Event)
[`ProxyInitializeEvent`](jd:velocity:com.velocitypowered.api.event.proxy.ProxyInitializeEvent)
[`repeat(long, TimeUnit)`](jd:velocity:com.velocitypowered.api.scheduler.Scheduler$TaskBuilder#repeat(long,java.util.concurrent.TimeUnit))
[java.base 中的 `List`](jd:java:java.util.List)
[java.sql 中的 `Connection`](jd:java:java.sql:java.sql.Connection)
```

## 行为准则

贡献者应在与本仓库相关的所有互动中遵守 PaperMC 组织的 [社区指南](https://papermc.io/community/guidelines)。

感谢您为 PaperMC 文档做出贡献！您的奉献有助于改善整个社区的文档。
如果您有任何问题或需要进一步的帮助，
请随时在 PaperMC Discord 服务器上联系我们，或在仓库中创建问题。
