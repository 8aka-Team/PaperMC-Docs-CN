---
title: Paper 插件
description: 一篇关于如何编写特定于 Paper 的插件的开发指南
slug: paper/dev/getting-started/paper-plugins
sidebar:
  badge:
    text: 实验性
    variant: danger
---

Paper 插件允许开发者利用 Mojang 引入的更现代的概念，
例如数据包，来扩展 Paper API 能够引入的领域。

:::danger[实验性]

这是实验性的，可能会发生变化。

:::

- [引导程序](#引导程序)
- [加载器](#加载器)
- [差异](#差异)

## 我该如何使用它们？
与 Bukkit 插件类似，你需要在你的 JAR 资源文件夹中引入一个 `paper-plugin.yml` 文件。
这不会作为 `plugin.yml` 的直接替代品，因为如本指南所述，有些内容需要以不同的方式声明。

需要注意的是，你仍然可以在同一个 JAR 中同时包含 `paper-plugin.yml` 和 `plugin.yml`。

以下是一个示例配置：
```yaml replace
name: Paper-Test-Plugin
version: '1.0'
main: io.papermc.testplugin.TestPlugin
description: Paper Test Plugin
api-version: '\{LATEST_PAPER_RELEASE}'
bootstrapper: io.papermc.testplugin.TestPluginBootstrap
loader: io.papermc.testplugin.TestPluginLoader
```

### 依赖声明

Paper 插件改变了你在 `paper-plugin.yml` 中声明依赖的方式：

```yml
dependencies:
  bootstrap:
    # 假设 RegistryPlugin 注册了一些你的插件需要使用的数据
    # 我们在运行时不需要这个，所以它在服务器部分不是必需的。
    # 然而，如果需要，可以同时添加到两者中
    RegistryPlugin:
      load: BEFORE
      required: true
      join-classpath: true # 默认为 `true`
  server:
    # 添加一个必需的 “RequiredPlugin” 依赖项，它将在你的插件之后加载。
    RequiredPlugin:
      load: AFTER
      required: true
      # 这意味着你的插件将无法访问它们的类路径
      join-classpath: false
```

在 Paper 插件中，依赖项被分为两个部分：
- `bootstrap` - 这些是你将在 [引导程序](#引导程序) 中使用的依赖项。
- `server` - 这些是服务器运行时插件核心功能所使用的依赖项。

让我们来看一个依赖项：
```yml
RegistryPlugin:
  load: BEFORE # 默认为 OMIT
  required: true # 默认为  true
  join-classpath: true # 默认为  true
```

- `load` (`BEFORE`|`AFTER`|`OMIT`)：这个插件应该在你的插件之前还是之后加载。注意：`OMIT` 的加载顺序是未定义的。
- `required`：这个插件是否是你的插件加载所必需的。
- `join-classpath`：你的插件是否应该能够访问它们的类路径。这用于需要直接访问其他插件内部的插件。

:::note[循环加载]

请注意，在某些情况下，插件可能会引入循环加载循环，这将阻止服务器启动。
请阅读 [循环加载指南](#循环插件加载) 以获取更多信息。

:::

Here are a couple of examples:
```yml
# 假设我们需要 ProtocolLib 在我们的插件之前加载
ProtocolLib:
  load: BEFORE
  required: true

# 现在，我们将为一个商店插件注册一些细节
# 因此，商店插件应该在我们的插件之后加载
SuperShopsXUnlimited:
  load: AFTER
  required: false

# 现在，我们需要访问一个插件的类路径
# 以便我们能够与之正确交互
SuperDuperTacoParty:
  required: true
  join-classpath: true
```

## 它用于什么？
Paper 插件为未来的 API 奠定了框架。
我们的目标是开放更现代的 API，使其更好地与原版对齐。
Paper 插件通过使用 [引导程序](#引导程序) 在服务器启动之前加载插件资源的新方法，使我们能够做到这一点。

## 引导程序
Paper 插件可以通过实现
[`PluginBootstrap`](jd:paper:io.papermc.paper.plugin.bootstrap.PluginBootstrap)
并将你的实现类添加到 `paper-plugin.yml` 中的引导程序字段来识别自己的引导程序。
```java title="TestPluginBootstrap.java"
public class TestPluginBootstrap implements PluginBootstrap {

  @Override
  public void bootstrap(BootstrapContext context) {

  }

  @Override
  public JavaPlugin createPlugin(PluginProviderContext context) {
    return new TestPlugin("我的自定义参数");
  }

}
```
引导程序还允许你改变插件的初始化方式，允许你将值传递到你的插件构造函数中。
目前，引导程序没有提供太多新的 API，并且是高度实验性的。一旦引入更多 API，这可能会发生变化。

## 加载器
Paper 插件可以通过实现
[`PluginLoader`](jd:paper:io.papermc.paper.plugin.loader.PluginLoader)
并将你的实现类添加到 `paper-plugin.yml` 中的加载器字段来识别自己的插件加载器。

插件加载器的目标是为插件创建一个预期的/动态的加载环境。
目前，这仅适用于为插件创建预期的类路径，例如向插件提供外部库。
```java title="TestPluginLoader.java"
public class TestPluginLoader implements PluginLoader {

  @Override
  public void classloader(PluginClasspathBuilder classpathBuilder) {
    classpathBuilder.addLibrary(new JarLibrary(Path.of("dependency.jar")));

    MavenLibraryResolver resolver = new MavenLibraryResolver();
    resolver.addDependency(new Dependency(new DefaultArtifact("com.example:example:version"), null));
    resolver.addRepository(new RemoteRepository.Builder("paper", "default", "https://repo.papermc.io/repository/maven-public/").build());

    classpathBuilder.addLibrary(resolver);
  }
}
```
目前，你可以添加两种不同类型的库：
[`JarLibrary`](jd:paper:io.papermc.paper.plugin.loader.library.impl.JarLibrary)
和 [`MavenLibraryResolver`](jd:paper:io.papermc.paper.plugin.loader.library.impl.MavenLibraryResolver)。

:::danger[危险]

如果您希望从 Maven Central 解析库，请使用镜像，因为直接将 Maven Central 用作 CDN 是违反 Maven Central 服务条款的，您的插件用户可能会遇到速率限制。

您应该使用 Paper 的默认镜像，该镜像由 [`PAPER_DEFAULT_CENTRAL_REPOSITORY`](/paper/reference/system-properties#paper_default_central_repository) 环境变量和 [`org.bukkit.plugin.java.LibraryLoader.centralURL`](/paper/reference/system-properties#orgbukkitpluginjavalibraryloadercentralurl) 系统属性配置。
```java
resolver.addRepository(new RemoteRepository.Builder("central", "default", MavenLibraryResolver.MAVEN_CENTRAL_DEFAULT_MIRROR).build());
```

使用 Maven Central 仓库（即 `*.maven.org` 或 `*.maven.apache.org`）将在控制台显示警告信息。

:::

## 差异

### Bukkit 序列化系统
Paper 插件仍然支持 Bukkit 使用的序列化系统（`org.bukkit.configuration.serialization`）。
然而，自定义类不会自动注册以进行序列化。
为了使用 [`ConfigurationSection#getObject`](jd:paper:org.bukkit.configuration.ConfigurationSection#getObject(java.lang.String,java.lang.Class))，你 **必须** 在尝试从配置中获取对象之前调用
[`ConfigurationSerialization#registerClass(Class)`](jd:paper:org.bukkit.configuration.serialization.ConfigurationSerialization#registerClass(java.lang.Class))。

### 类加载隔离
Paper 插件无法相互访问，除非通过依赖其他插件等方式获得明确的访问权限。
这有助于防止 Paper 插件意外访问彼此的依赖项，
并且通常有助于确保插件只能访问它们明确依赖的内容。

Paper 插件可以通过在 `paper-plugin.yml` 中添加 `join-classpath` 选项来绕过这一点，能够访问其他插件的类加载器。

```yml
Plugin:
  join-classpath: true # 这意味着你可以访问它们的类路径
```

注意，其他 Paper 插件仍然无法访问你的类加载器。

### 加载顺序逻辑分离
为了更好地利用类加载隔离，Paper 插件 **不** 使用 `dependencies` 字段来确定加载顺序。
这是出于多种原因，主要是为了更好地控制，并允许插件正确地共享类加载器。

有关如何声明插件加载顺序的更多信息，请参阅 [声明依赖](#依赖声明)。

### 命令
Paper 插件不使用 `commands` 字段来注册命令。
这意味着你不需要在 `paper-plugin.yml` 文件中包含所有命令。
相反，你可以使用 [Brigadier 命令 API](/paper/dev/command-api/basics/introduction) 来注册命令。

### 循环插件加载

循环加载描述了当一个插件加载导致一个循环，最终回到原始插件的现象。
与 Bukkit 插件不同，Paper 插件不会尝试解决循环加载问题。

```d2
style.fill: transparent
direction: right

A -> B
B -> C
C -> D
D -> A
```

然而，如果 Paper 检测到无法解决的循环，你会收到类似以下的错误：
```
[ERROR]: [LoadOrderTree] =================================
[ERROR]: [LoadOrderTree] Circular plugin loading detected:
                      // 检测到循环插件加载：
[ERROR]: [LoadOrderTree] 1) Paper-Test-Plugin1 -> Paper-Test-Plugin -> Paper-Test-Plugin1
[ERROR]: [LoadOrderTree]    Paper-Test-Plugin1 loadbefore: [Paper-Test-Plugin]
[ERROR]: [LoadOrderTree]    Paper-Test-Plugin loadbefore: [Paper-Test-Plugin1]
[ERROR]: [LoadOrderTree] Please report this to the plugin authors of the first plugin of each loop or join the PaperMC Discord server for further help.
                      // 请将此问题报告给每个循环中的第一个插件的作者，或者加入 PaperMC Discord 服务器以获取进一步的帮助。
[ERROR]: [LoadOrderTree] =================================
```

解决这些循环加载问题的责任在于你。
