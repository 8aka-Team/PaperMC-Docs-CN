# 📖 PaperMC 中文文档

[![Discord](https://img.shields.io/discord/289587909051416579.svg?label=&logo=discord&logoColor=ffffff&color=7389D8&labelColor=6A7EC2)](https://discord.gg/papermc) ![License](https://img.shields.io/github/license/PaperMC/docs) [![QQ 群](https://img.shields.io/badge/QQ_群-611076407-blue)](https://qm.qq.com/cgi-bin/qm/qr?k=uZZDEZV_9Ni8dBJPjzGWZUVXK-qKXc7x)

这是 [PaperMC 官方文档](https://docs.papermc.io) 的社区中文翻译版本，由 [千屈](https://github.com/Lythrilla)，[Missing_Love](https://github.com/Q2297045667) 维护。你可以在 [paper.8aka.org](https://paper.8aka.org) 阅读在线文档。

## 🔔 重要说明

- 这是一个**非官方**的社区翻译项目，仅供参考
- 翻译可能不够准确或滞后于官方文档更新
- 在实际使用中遇到问题时，请以[官方文档](https://docs.papermc.io)为准
- 如发现翻译错误或有改进建议，欢迎[提交 Issue](https://github.com/8aka-Team/PaperMC-docs-CN/issues) 或 Pull Request

## 📚 文档内容

本文档包含以下项目的中文翻译：

- **Paper**: 高性能的 Minecraft 服务端
- **Velocity**: 现代化的服务器代理软件
- **Folia**: 支持区域化多线程的服务端
- **Waterfall**: 已停止维护的 BungeeCord 分支
- **个人理解**: 添加一些个人理解和说明
- **其他**: 通用开发文档和 API 说明
-
## 入门

如何让文档在本地计算机上运行以进行开发。

### 前置要求

- [node 22](https://nodejs.org)
- [pnpm](https://pnpm.io/installation)
- [d2](https://d2lang.com/) (可选-用于生成图表)
- [Git](https://git-scm.com/downloads)

### 🚀 本地开发

1. 克隆仓库

```bash
$ git clone https://github.com/8aka-Team/PaperMC-docs-CN
$ cd PaperMC-docs-CN
```

2. 安装所有的依赖

```bash
$ pnpm install
```

3. 启动开发服务器

```bash
$ pnpm run dev
```

服务器启动后会自动打开浏览器。大多数更改都会实时生效，无需重启服务器或刷新页面。

### 构建部署

```bash
$ pnpm run build
```

这会在 `build` 目录下生成可部署的静态文件。

## 📝 参与贡献

我们欢迎任何形式的贡献，无论是修复错别字、改进翻译还是添加新内容。参与贡献前请阅读我们的[贡献指南](CONTRIBUTING.md)。

### 如何贡献

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

## 🔗 相关链接

- [官方文档](https://docs.papermc.io)
- [官方 Discord](https://discord.gg/papermc)
- [官方 GitHub](https://github.com/PaperMC/docs)
- [问题反馈](https://github.com/8aka-Team/PaperMC-docs-CN/issues)
- [QQ 交流群](https://qm.qq.com/cgi-bin/qm/qr?k=uZZDEZV_9Ni8dBJPjzGWZUVXK-qKXc7x): 611076407

### 其他资源

- [PaperMC 官网](https://papermc.io)
- [PaperMC 博客](https://papermc.io/blog)
- [PaperMC 论坛](https://forums.papermc.io)
- [PaperMC API 文档](https://jd.papermc.io)

## 📄 许可协议

- 原文档版权归 PaperMC 团队所有
- 翻译内容采用 [CC-BY-SA-4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.zh) 协议
- 项目代码采用[BSD-2-Clause](https://github.com/PaperMC/docs/blob/main/LICENSE) 许可
- PaperMC 标志受其[自身条款](https://docs.papermc.io/misc/assets)约束
