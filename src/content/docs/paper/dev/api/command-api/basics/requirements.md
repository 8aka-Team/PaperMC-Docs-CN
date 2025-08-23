---
title: 要求
description: 一份关于设置命令要求的指南。
slug: paper/dev/command-api/basics/requirements
version: 1.21.6
---

有时你希望限制玩家使用和/或查看某些命令或子命令的能力。
为此，`ArgumentBuilder<S>` 类有一个 `requires(Predicate<S>)` 方法，用于定义使用特定命令树分支的要求。
和往常一样，泛型参数 `S` 只是一个 `CommandSourceStack`，它为我们提供了执行实体、命令发送者和命令的位置。

## 定义权限
权限是要求的最常见用例之一。
通常，这些权限是在**命令发送者**上进行检查的，因为这是实际运行命令的实体/控制台/对象，即使它是以其他人的身份运行的（执行者）。一个带有权限的简单命令可能如下所示：

```java
Commands.literal("testcmd")
    .requires(sender -> sender.getSender().hasPermission("permission.test"))
    .executes(ctx -> {
        ctx.getSource().getSender().sendRichMessage("<gold>你有权限运行这个命令！");
        return Command.SINGLE_SUCCESS;
    });
```

这个命令需要命令发送者拥有 `permission.test` 权限。
但你不仅可以定义权限，你还可以要求命令发送者是服务器管理员，如下所示：

```java
Commands.literal("testcmd")
    .requires(sender -> sender.getSender().isOp())
    .executes(ctx -> {
        ctx.getSource().getSender().sendRichMessage("<gold>你是一名服务器管理员！");
        return Command.SINGLE_SUCCESS;
    });
```

## 定义更高级的 predicates
你不必只局限于检查权限——因为这是一个 predicates，任何布尔值都可以返回。
例如，你可以检查玩家的背包中是否有钻石剑：

```java
Commands.literal("givesword")
    .requires(sender -> sender.getExecutor() instanceof Player player && !player.getInventory().contains(Material.DIAMOND_SWORD))
    .executes(ctx -> {
        if (ctx.getSource().getExecutor() instanceof Player player) {
            player.getInventory().addItem(ItemType.DIAMOND_SWORD.createItemStack());
        }

        return Command.SINGLE_SUCCESS;
    });
```

乍一看，这似乎没有问题。
但它有一个很大的缺陷——由于玩家的客户端并不知道这个要求，即使要求未通过，它仍然显示该命令可以执行。
但如果客户端尝试运行该命令，服务器会报告该命令不存在（意味着要求未通过）：

![](./assets/client-server-mismatch.png)

我们该如何解决这个问题？`Player` 接口有一个名为 [`#updateCommands()`](jd:paper:org.bukkit.entity.Player#updateCommands()) 的方法，专门用于这种用例。
它会重新将当前已注册的命令发送回客户端，以尝试重新加载命令。目前，我们可以创建一个新的命令，让玩家可以更新自己的命令，以重新同步其命令状态：

```java
Commands.literal("reloadcommands")
    .executes(ctx -> {
        if (ctx.getSource().getExecutor() instanceof Player player) {
            player.updateCommands();
            player.sendRichMessage("<gold>成功更新了你的命令！");
        }

        return Command.SINGLE_SUCCESS;
    });
```

### 自动重新加载命令
强迫玩家重新加载自己的命令并不是一种可行的用户体验方案。因此，你可以**自动化**这种行为。
根据需要频繁调用更新命令的方法是安全的，但通常应尽量避免，因为这可能会耗费大量的带宽。
如果可能，你应该将这些方法放在非常特定的位置。此外，这种方法是完全线程安全的，这意味着你可以自由地从异步上下文中调用它。

## 受限制的命令
从 1.21.6 开始，命令现在可以被限制。
这个功能被原版用来让玩家确认他们是否真的想从点击事件中运行一个命令。
这包括文本组件或对话框按钮上的命令。所有默认需要管理员权限的原版命令都被限制了：

![](./assets/vanilla-restriction.png)

### 限制你的命令
你可以通过在 `.requires` 中将 requires 包装在 `Commands.restricted(...)` 中，将相同的行为应用到你的命令中。
一个简单的实现可能如下所示：

```java
Commands.literal("test-req")
    .requires(Commands.restricted(source -> true))
    .executes(ctx -> {
        ctx.getSource().getSender().sendRichMessage("你通过了！");
        return Command.SINGLE_SUCCESS;
    });
```

![](./assets/custom-restriction.png)

<br />

在 `.restricted` 方法中，你可以放入任何原本放在 `.requires` 方法里的逻辑。
它实际上只是对常规 `.requires` 谓词的一个简单包装：

```java
Commands.literal("mycommand")
    .requires(Commands.restricted(source -> source.getSender().hasPermission("my.custom.permission")
                                            && source.getExecutor() instanceof Player player
                                            && player.getGameMode() == GameMode.ADVENTURE))
    .executes(ctx -> {
        // 命令逻辑
    });
```
