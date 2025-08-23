---
title: 传送
description: 实体传送 API 及其使用方法。
slug: paper/dev/entity-teleport
---

实体可以瞬间传送到特定位置，
同步和异步传送分别通过 [teleport](jd:paper:org.bukkit.entity.Entity#teleport(org.bukkit.Location))
和 [teleportAsync](jd:paper:org.bukkit.entity.Entity#teleportAsync(org.bukkit.Location)) API 实现。

:::tip[性能]

如果你预计会传送到未加载的区块，
建议使用`teleportAsync` API，因为它避免了进行同步区块加载，
这会对服务器的主线程造成很大压力，从而影响整体性能。

:::

```java
entity.teleport(location); // 同步加载区块并传送实体

entity.teleportAsync(location).thenAccept(success -> { // 异步加载区块并传送实体
    // 这段代码在传送完成时运行
    // `Future`在主线程上完成，因此在这里使用API是安全的

    if (success) {
        // 实体传送成功！
    }
});
```

:::danger[危险]

你**绝对不能**在主线程上对`teleportAsync`的`Future`调用`.get()`或`.join()`，因为如果目标区块未加载，
这将**必然**导致服务器死锁。

:::

## 查看

[lookAt](jd:paper:org.bukkit.entity.Player#lookAt(org.bukkit.entity.Entity,io.papermc.paper.entity.LookAnchor,io.papermc.paper.entity.LookAnchor))
API允许你让玩家看向某个位置或实体。

```java
player.lookAt(
    position,
    LookAnchor.EYES // 玩家的眼睛将面向该位置
);

player.lookAt(
    entity,
    LookAnchor.EYES // 玩家的眼睛将面向该实体
    LookAnchor.FEET // 玩家将面向实体的脚部
);
```

## 传送标志

传送标志提供了一种传送实体的同时自定义行为的方法。
这允许你做诸如使用相对标志传送玩家并保留乘客之类的事情。

所有可用的传送标志都可以在 [TeleportFlag](jd:paper:io.papermc.paper.entity.TeleportFlag) 类中找到。

### 相对传送

相对传送玩家，防止在X、Y和Z轴上重置速度。

```java
player.teleport(
    location,
    TeleportFlag.Relative.VELOCITY_X,
    TeleportFlag.Relative.VELOCITY_Y,
    TeleportFlag.Relative.VELOCITY_Z
);
```

### 保留乘客

使用 [RETAIN_PASSENGERS](jd:paper:io.papermc.paper.entity.TeleportFlag$EntityState#RETAIN_PASSENGERS) 标志传送一个实体，
允许其乘客与实体一起传送。

```java
entity.teleport(location, TeleportFlag.EntityState.RETAIN_PASSENGERS);
```
