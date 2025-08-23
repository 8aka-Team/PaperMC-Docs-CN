---
title: 依赖管理
description: 如何在你的 Velocity 插件中处理依赖关系
slug: velocity/dev/dependency-management
---

开发过程中的库依赖关系是常见的。
你可能需要与另一个插件进行交互，或者不想重复编写别人已经解决过的问题。
无论你做什么，都需要一种有效管理依赖关系的方法。

## 插件依赖

在你的主类中，通过使用
[`@Plugin`](jd:velocity:com.velocitypowered.api.plugin.Plugin) 注解来添加对另一个插件的依赖。
让我们简要回顾一下：

```java
@Plugin(
  id = "myfirstplugin",
  name = "My Plugin",
  version = "0.1.0"
)
public class VelocityTest {
  // ...
}
```

假设我们依赖于另一个插件，我们称它为 `wonderplugin`。
要将其作为依赖项添加，请执行以下操作：

```java
@Plugin(
  id = "myfirstplugin",
  name = "My Plugin",
  version = "0.1.0",
  dependencies = {
    @Dependency(id = "wonderplugin")
  }
)
public class VelocityTest {
  // ...
}
```

依赖项的 ID 与另一个插件的 `@Plugin` 注解中的 `id` 相同，
这就是为什么拥有一个稳定的插件 ID 是很重要的。

就是这样！现在，你的插件将需要 `wonderplugin` 才能加载，
并且它会在 `wonderplugin` _之后_ 加载。

要指定多个依赖项，请用逗号分隔它们：
`dependencies = {@Dependency(id = "wonderplugin"), @Dependency(id = "otherplugin")}`

## 可选插件依赖

要使依赖项成为可选的，请添加 `optional = true`，如下所示：

```java
@Plugin(
  id = "myfirstplugin",
  name = "My Plugin",
  version = "0.1.0",
  dependencies = {
    @Dependency(id = "wonderplugin", optional = true)
  }
)
public class VelocityTest {
  // ...
}
```

## 外部依赖

:::caution[注意]

请记住重新定位你打包的任何依赖项。
未能重新定位将导致与其他插件的依赖冲突。

:::

对其他库的依赖不是由 Velocity 处理的。
你需要使用你的构建系统来添加它们。

如果您的插件没有将其依赖项打包，而是从一个目录中附加它们，
您可以使用 [`PluginManager`](jd:velocity:com.velocitypowered.api.plugin.PluginManager) 的
[`addToClasspath`](jd:velocity:com.velocitypowered.api.plugin.PluginManager#addToClasspath(java.lang.Object,java.nio.file.Path)) 方法，
而不是使用反射来访问
[`ClassLoader`](jd:java:java.lang.ClassLoader)。
