---
title: 调试插件
description: 在编写代码时，调试是很常见的。本指南概述了调试插件的常见方法
slug: paper/dev/debugging
---

调试你的插件对于修复插件中的错误和问题至关重要。本页面将涵盖一些最常见的调试技术。

## 打印到控制台

打印到控制台是最常见的调试技术之一。这可能是一个你以前做过的事情，因为它非常简单。
不过，它也有一些缺点。在控制台中找到打印语句可能很困难，调试完成后删除它们也可能很困难。最重要的是，你需要重新编译插件并重启服务器来添加或移除调试信息。

在调试时，你可以使用 `System.out.println("");` 打印到控制台。不过，建议使用插件的日志记录器，因为这样更容易知道日志来自哪个插件。
这可以通过以下方式简单实现：

```java
plugin.getComponentLogger().debug(Component.text("SuperDuperBad Thing has happened"));
```

:::note[日志级别]

在某些控制台中，使用 `warning` 级别会以不同的颜色打印消息。
这有助于你在控制台中找到你的打印语句。

:::

## 使用远程调试器

调试器是一种工具，它允许你在某个点暂停代码并检查变量的值。
这可以非常有助于找出代码为何没有按预期工作，以及找出代码出错的地方。

### 设置调试器

要使用调试器，你需要设置你的 IDE 来使用它。这在每个 IDE 中都不同，但为了本指南，我们将使用 IntelliJ IDEA。

在 IntelliJ 中设置调试器，你需要创建一个新的运行配置。
你可以通过点击运行按钮旁边的下拉菜单并选择 `Edit Configurations...` 来实现：

![](./assets/config_dropdown.png)

然后，点击左上角的 `+` 按钮并选择 `Remote JVM Debug`。你可以将配置命名为任何你想要的名字，然后点击 `Apply`：

![](./assets/config_add.png)

最后，从窗口中复制命令行参数，并将它们粘贴到服务器的启动脚本中。
这些参数将放在 `java` 命令之后和 `-jar` 之前。完成后，你可以点击 `OK`。例如：

```shell replace
java -agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005 -jar paper-\{LATEST_PAPER_RELEASE}.jar nogui
```

一旦服务器运行，你可以使用右上角的虫子图标将调试器连接到服务器：

![](./assets/debugger_connect.png)

#### 使用调试器

假设我们有以下代码：

```java
@EventHandler
public void onPlayerMove(PlayerMoveEvent event) {
  Player player = event.getPlayer();
  Location location = player.getLocation();

  if (location.getWorld() == null)
    return;

  if (location.getWorld().getEnvironment() == World.Environment.NETHER) {
    player.sendMessage("You are in the nether!");
  }
}
```

你可以通过点击行号来为该行添加断点：

![](./assets/add_breakpoints.png)

当代码执行到这一行时，它会暂停。然后你可以使用调试器来检查变量的值：

![](./assets/debugger_use.png)

你可以检查当前作用域中每个变量的值。
你还可以使用顶部的按钮从一个断点跳到下一个断点。
如果需要，你也可以使用顶部的文本框来评估用于调试的表达式。

### 使用直接调试

直接调试允许你直接从 IDE 运行服务器，并允许你使用断点并逐步执行代码。
我们可以通过使用 [JPenilla 的 Gradle 插件](https://github.com/jpenilla/run-task) 来直接从 IDE 运行服务器。
有关如何设置插件的说明，请查看 [这里](https://github.com/jpenilla/run-task#basic-usage)。
