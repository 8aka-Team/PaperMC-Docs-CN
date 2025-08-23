---
title: Paper 插件
description: 一篇关于 Paper 插件的详细指南。
slug: paper/reference/paper-plugins
---

本文档页面旨在解释 Paper 插件可能引入的所有新语义和可能存在的混淆之处。

:::note[注意]

开发者可以在 [这里](/paper/dev/getting-started/paper-plugins) 获取更多关于 Paper 插件的信息。

:::

## 它们是什么？

Paper 插件是由 Paper 的新插件加载框架加载的插件。
开发者使用 Paper 插件是为了利用 Mojang 提供的现代系统，例如数据包。

![Plugin 列表](./assets/plugin-list.png)

## 它们有什么区别？

启用后，Paper 插件与 Bukkit 插件**完全相同**。
这使得插件之间仍然可以完全通信并支持彼此，也就是说，无论是 Bukkit 插件还是 Paper 插件，它们都可以很好地相互依赖。

Paper 插件仅支持由 Paper 的插件加载器加载，并且可以使用对 Bukkit 插件不可用的新 API。

### 如何添加 Paper 插件？

添加 Paper 插件的方式与添加 Bukkit 插件相同，因此您可以参考 [此指南](/paper/adding-plugins)。

### 循环插件加载

随着 Paper 插件的引入，Paper 引入了一个新的插件加载器，解决了某些奇怪的问题。
然而，作为结果，这导致插件之间的 [循环加载](/paper/dev/getting-started/paper-plugins#cyclic-plugin-loading) 不再被支持。

如果 Paper 检测到一个循环，你的服务器将因错误而关闭。

:::danger[遗留]

如果您的服务器**需要**这种循环加载，您可以通过添加 [`-Dpaper.useLegacyPluginLoading=true`](/paper/reference/system-properties#paperuselegacypluginloading) 启动标志来启用它。
请注意，这在未来可能不会被支持。

:::
