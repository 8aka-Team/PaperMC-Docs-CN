---
title: 插件基础
description: 如何开始使用 Velocity API
slug: velocity/dev/api-basics
---

现在我们将为你的第一个插件奠定基础。
我们将介绍如何创建你的第一个 Velocity 插件。

## 创建插件类

创建一个新的类（比如 `com.example.velocityplugin.VelocityTest`），并将以下代码粘贴进去：

```java
package com.example.velocityplugin;

import com.google.inject.Inject;
import com.velocitypowered.api.plugin.Plugin;
import com.velocitypowered.api.proxy.ProxyServer;
import org.slf4j.Logger;

@Plugin(id = "myfirstplugin", name = "My First Plugin", version = "0.1.0-SNAPSHOT",
        url = "https://example.org", description = "I did it!", authors = {"Me"})
public class VelocityTest {

    private final ProxyServer server;
    private final Logger logger;

    @Inject
    public VelocityTest(ProxyServer server, Logger logger) {
        this.server = server;
        this.logger = logger;

        logger.info("你好！我用 Velocity 制作了我的第一个插件。");
    }
}
```

这里有相当多的内容需要解释，
所以让我们专注于与 Velocity 相关的部分：

```java
@Plugin(id = "myfirstplugin", name = "My First Plugin", version = "0.1.0-SNAPSHOT",
        url = "awesome.org", description = "I did it!", authors = {"Me"})
public class VelocityTest {
```

这告诉 Velocity 这个类包含你的插件（`myfirstplugin`），以便在代理启动时加载它。
当你编译你的插件时，Velocity 会检测到插件将驻留在哪里。

继续看，这是什么？

```java
@Inject
public VelocityTest(ProxyServer server, Logger logger) {
    this.server = server;
    this.logger = logger;

    logger.info("你好呀，这是我制作的一个测试插件！");
}
```

这看起来像是魔法！Velocity 是如何做到的呢？
答案在于 [`@Inject`](https://javadoc.io/doc/com.google.inject/guice/latest/com/google/inject/Inject.html)，
它表明 Velocity 应该在构建你的插件时注入一个 [`ProxyServer`](jd:velocity:com.velocitypowered.api.proxy.ProxyServer)
和一个 [`Logger`](https://www.slf4j.org/api/org/slf4j/Logger.html)。
当你开始使用 Velocity 时，这两个接口会对你有很大帮助。
我们不会过多讨论依赖注入：你只需要知道 Velocity 会处理这些。

你只需要构建你的插件，将其放入你的`plugins/`目录，然后尝试运行它！
是不是很方便？在下一节中，你将学习更多关于如何使用 API 的知识。

## 选择 [`@Plugin`](jd:velocity:com.velocitypowered.api.plugin.Plugin)信息

明智地选择你的插件的 ID。
其他插件将使用这个 ID 来依赖你的插件。如果你更改了它，可能会破坏兼容性。

插件名称的重要性稍低。
它将作为插件的显示名称展示给用户，但对其进行调整不会造成灾难性后果。

对于版本，
我们推荐使用语义化版本控制——你可以在 [semver.org](https://semver.org) 了解更多关于这一概念的内容。
基本上，使用三个数字来表示你的版本，例如 1.4.25。
当你进行向后不兼容的破坏性更改时，增加主版本号；当你添加向后兼容的功能时，增加次版本号；当你修复一个错误或进行其他在实现上不易察觉的更改时，增加修订号。

你还可以在你的 `@Plugin` 注解中描述你的插件的网址、作者和描述。
对其他插件的依赖也应该在那里指定，
我们在[依赖管理](/velocity/dev/dependency-management)页面中再详细介绍。

### 一个警告

:::caution[注意]

在 Velocity 中，插件加载分为两个阶段：构造和初始化。
你插件构造函数中的代码属于构造阶段。
在构造期间，你可以安全地做的事情非常有限，尤其是因为 API 并没有指定哪些操作在构造期间是安全的。
值得注意的是，你不能在构造函数中注册事件监听器，因为你需要有一个有效的插件注册，
但 Velocity 在插件构造完成之前无法注册插件，这就导致了一个“先有鸡还是先有蛋”的问题。

为了打破这个恶性循环，你应该始终等待初始化，
这可以通过 Velocity 触发的 [`ProxyInitializeEvent`](jd:velocity:com.velocitypowered.api.event.proxy.ProxyInitializeEvent) 来标识。
我们可以通过为这个事件添加监听器来在初始化时执行操作，如下所示。
请注意，Velocity 会自动将你的插件主类注册为监听器。

```java
@Subscribe
public void onProxyInitialization(ProxyInitializeEvent event) {
    // 在这里执行需要访问 Velocity API 的某些操作。
    // 例如，我们可以注册一个事件：
    server.getEventManager().register(this, new PluginListener());
}
```

:::

## 获取你的插件目录

在某个时候，你可能需要获取你的插件目录。
为此，请在你的插件构造函数参数中添加 `@DataDirectory Path dataDirectory`：

```java
private final Path dataDirectory;

@Inject
public VelocityTest(ProxyServer server, Logger logger, @DataDirectory Path dataDirectory) {
    this.server = server;
    this.logger = logger;
    this.dataDirectory = dataDirectory;
}
```

这将为你提供一个插件目录的 [`Path`](jd:java:java.nio.file.Path)。
如果你绝对需要一个 [`File`](jd:java:java.io.File)，
你可以使用 [`Path#toFile()`](jd:java:java.nio.file.Path#toFile())。
然而，Velocity 通常使用 `Path`。
