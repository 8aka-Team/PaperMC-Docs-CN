---
title: 内部机制
description: 简要介绍如何在插件中使用内部机制
slug: paper/dev/internals
---

运行 Minecraft 的代码并不是开源的。Bukkit 是一个允许插件与服务器交互的 API。
它由 CraftBukkit 实现，并与 Minecraft 的代码进行交互。
在讨论 Minecraft 内部机制时，你经常会听到 NMS 和 CraftBukkit 这两个术语。

:::danger[使用 Minecraft 内部机制]

不推荐使用 Minecraft 内部机制。这是因为直接使用内部代码并不能保证其稳定性，并且它经常会发生变化。
这意味着当发布新的 Minecraft 版本时，你的插件可能会出现问题。
只要有可能，你应该使用 API 而不是内部机制。

**PaperMC 不会直接支持针对 Minecraft 内部机制的编程**

:::

## 什么是 NMS？

NMS 是 `net.minecraft.server` 的缩写，指的是一个包含大量 Mojang 代码的 Java 包。
这些代码是专有的，并不是开源的。
当从外部调用时，这些代码并不能保证其稳定性，并且可能会随时发生变化。

## 访问 Minecraft 内部机制

为了使用 Mojang 和 CraftBukkit 的代码，你可以使用 `paperweight-userdev` Gradle 插件或反射。
推荐使用 [`paperweight-userdev`](https://github.com/PaperMC/paperweight-test-plugin) 来访问内部代码，
因为它可以让你在 IDE 中使用重映射后的代码，使用起来更加方便。
你可以通过查看 [paperweight-userdev](/paper/dev/userdev) 部分来了解更多信息。

然而，如果你无法使用 `paperweight-userdev`，你可以使用反射。

### 反射

反射是一种在运行时访问代码的方式。
它允许你访问在编译时可能不可用的代码。
反射通常用于跨多个版本访问内部代码。
然而，如果使用不当，反射确实会对性能产生影响。
例如，如果你多次访问同一个方法或字段，你应该缓存该 [`Field`](jd:java:java.lang.reflect.Field)
或 [`Method`](jd:java:java.lang.reflect.Method)，以避免每次查找字段/方法时的性能开销。

:::caution[1.20.4 及更早版本]

在 1.20.5 之前，内部的 CraftBukkit 代码被重新定位到 `org.bukkit.craftbukkit.<version>`，除非你运行的是经过 Mojang 映射（Mojang-mapped）的 Paper 版本。
在大多数生产环境中，这种情况直到 1.20.5 才变得常见。
这意味着任何反射尝试都必须包含版本号。
例如，`org.bukkit.craftbukkit.v1_20_R2.CraftServer` 是 1.20.2 版本中 CraftServer 类的完整类名和包名。你可以通过一些反射工具轻松访问这些类。

```java
private static final String CRAFTBUKKIT_PACKAGE = Bukkit.getServer().getClass().getPackageName();

public static String cbClass(String clazz) {
  return CRAFTBUKKIT_PACKAGE + "." + clazz;
}

// 然后你可以使用这种方法来获取 CraftBukkit 类：
Class.forName(cbClass("entity.CraftBee"));
```

:::

Minecraft 的代码是经过混淆的。这意味着类和方法的名称被更改，以使其更难理解。
Paper 在开发过程中会反混淆这些标识符，并且从 1.20.5 开始，也会在运行时进行反混淆。

:::caution[1.20.4 及更早版本]

以前，为了与旧版插件保持兼容，Paper 会在运行时重新混淆代码。
你可以使用像 [reflection-remapper](https://github.com/jpenilla/reflection-remapper) 这样的库来自动重新映射反射引用。
这允许你在代码中使用反混淆后的、经过 Mojang 映射的名称。
这被推荐使用，因为它使代码更容易理解。

:::

### Mojang 映射的服务器

运行一个 Mojang 映射（moj-map）服务器是简化你开发流程的绝佳方式，
因为你可以使用在运行时会存在的相同映射来开发。
这消除了在编译过程中重新映射的需要，进而简化了调试，并允许你热插拔插件。

从 1.20.5 开始，Paper 默认使用 Mojang 映射的运行时，而不是将服务器重新混淆为 Spigot 映射。
通过采用 Mojang 映射，你可以确保你的插件在运行时不需要内部重新映射。
有关更多信息，请参阅 [插件重新映射](/paper/dev/project-setup#plugin-remapping)
部分以及涵盖这些变化的 [userdev](/paper/dev/userdev#1205-and-beyond) 文档。

### 获取当前 Minecraft 版本

你可以获取当前的 Minecraft 版本，以便使用特定版本的正确代码。
这可以通过以下方法之一实现：

```java replace
// 示例值: \{LATEST_PAPER_RELEASE}
String minecraftVersion = Bukkit.getServer().getMinecraftVersion();

// 示例值: \{LATEST_PAPER_RELEASE}-R0.1-SNAPSHOT
String bukkitVersion = Bukkit.getServer().getBukkitVersion();

// 1.20.1 的示例值: 3465
int dataVersion = Bukkit.getUnsafe().getDataVersion();
```

:::danger[解析版本]

从 1.20.5 开始，由于 Paper 停止重新定位 CraftBukkit 包，因此无法再通过类的包名解析版本。
有关更多信息，请参阅 [反射](#反射) 部分。

:::
