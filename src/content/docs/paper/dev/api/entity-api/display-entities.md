---
title: 显示实体
description: 显示实体 API 及其使用方法。
slug: paper/dev/display-entities
version: "1.20"
---

在 1.19.4 版本中新增的 **显示实体** 是一种强大的方式，
用于在世界中展示各种内容，例如方块、物品和文本。

默认情况下，这些实体没有碰撞盒，不会移动、发出声音或受到伤害，
这使它们非常适合各种应用，例如全息图。

## 类型

### 文本

可以通过 `TextDisplay`
实体显示文本。

```java
TextDisplay display = world.spawn(location, TextDisplay.class, entity -> {
    // 自定义该实体！
    entity.text(Component.text("Some awesome content", NamedTextColor.BLACK));
    entity.setBillboard(Display.Billboard.VERTICAL); // 仅围绕垂直轴旋转
    entity.setBackgroundColor(Color.RED); // 将背景设置为红色

    // 查看 `Display` 和 `TextDisplay` 的 Javadoc，还有更多选项可供选择。
});
```

### 方块

可以通过 `BlockDisplay`
实体显示方块。

```java
BlockDisplay display = world.spawn(location, BlockDisplay.class, entity -> {
    // 自定义该实体！
    entity.setBlock(Material.GRASS_BLOCK.createBlockData());
});
```

### 物品

可以通过 `ItemDisplay`
实体显示物品。

尽管名称为“物品”显示，但物品显示也可以显示“方块”，
两者的区别在于模型中的位置——物品显示的位置在中心，
而方块显示的位置在方块的角落（可以通过击中框调试模式——F3+B 来查看）。

```java
ItemDisplay display = world.spawn(location, ItemDisplay.class, entity -> {
    // 自定义该实体！
    entity.setItemStack(ItemStack.of(Material.SKELETON_SKULL));
});
```

## 变换

可以为显示应用任意仿射变换，
从而让你能够在三维空间中按需定位和变形。

变换会按照以下顺序应用于显示：

```d2
style.fill: transparent
direction: right

Translation -> "Left rotation"
"Left rotation" -> Scale
Scale -> "Right rotation"
```

:::tip[可视化变换]

使用 [Transformation Visualizer](https://misode.github.io/transformation/) 网站快速可视化变换，
以便进行快速原型设计！

:::

### 缩放

最基本的变换是缩放，让我们以草方块为例，将其放大：

```java
world.spawn(location, BlockDisplay.class, entity -> {
    entity.setBlock(Material.GRASS_BLOCK.createBlockData());
    entity.setTransformation(
        new Transformation(
                new Vector3f(), // 没有平移
                new AxisAngle4f(), // 没有左旋转
                new Vector3f(2, 2, 2), // 在所有轴上按 2 的比例放大
                new AxisAngle4f() // 没有右旋转
        )
    );
    // 或者从 JOML 设置一个原始变换矩阵
    // entity.setTransformationMatrix(
    //         new Matrix4f()
    //                 .scale(2) // 在所有轴上按 2 的比例放大
    // );
});
```

![缩放示例](./assets/display-scale.png)

### 旋转

你也可以旋转它，让我们将其旋转到角落：

```java {6, 8, 15-19}
world.spawn(location, BlockDisplay.class, entity -> {
    entity.setBlock(Material.GRASS_BLOCK.createBlockData());
    entity.setTransformation(
        new Transformation(
                new Vector3f(), // 没有平移
                new AxisAngle4f((float) -Math.toRadians(45), 1, 0, 0), // 在 X 轴上旋转 -45 度
                new Vector3f(2, 2, 2), // 在所有轴上按 2 的比例放大
                new AxisAngle4f((float) Math.toRadians(45), 0, 0, 1) // 在 Z 轴上旋转 +45 度
        )
    );
    // 或者从 JOML 设置一个原始变换矩阵
    // entity.setTransformationMatrix(
    //         new Matrix4f()
    //                 .scale(2) // 在所有轴上按 2 的比例放大
    //                 .rotateXYZ(
    //                         (float) Math.toRadians(360 - 45), // 在 X 轴上旋转 -45 度
    //                         0,
    //                         (float) Math.toRadians(45) // 在 Z 轴上旋转 +45 度
    //                 )
    // );
});
```

![旋转示例](./assets/display-rotation.png)

### 平移

最后，我们还可以将平移变换（位置偏移）应用于显示，例如：

```java {5, 14}
world.spawn(location, BlockDisplay.class, entity -> {
    entity.setBlock(Material.GRASS_BLOCK.createBlockData());
    entity.setTransformation(
        new Transformation(
                new Vector3f(0.5F, 0.5F, 0.5F), // 在所有轴上偏移半个方块
                new AxisAngle4f((float) -Math.toRadians(45), 1, 0, 0), // 在 X 轴上旋转 -45 度
                new Vector3f(2, 2, 2), // 在所有轴上按 2 的比例放大
                new AxisAngle4f((float) Math.toRadians(45), 0, 0, 1) // 在 Z 轴上旋转 +45 度
        )
    );
    // 或者从 JOML 设置一个原始变换矩阵
    // entity.setTransformationMatrix(
    //         new Matrix4f()
    //                 .translate(0.5F, 0.5F, 0.5F) // 在所有轴上偏移半个方块
    //                 .scale(2) // 在所有轴上按 2 的比例放大
    //                 .rotateXYZ(
    //                         (float) Math.toRadians(360 - 45), // 在 X 轴上旋转 -45 度
    //                         0,
    //                         (float) Math.toRadians(45) // 在 Z 轴上旋转 +45 度
    //                 )
    // );
});
```

![平移示例](./assets/display-trans.png)

## 插值

客户端可以线性插值变换和传送，
以创建平滑的动画，从一个变换/位置过渡到下一个。

### 变换

一个例子是平滑地原地旋转一个方块/物品/文本。
结合 [调度器 API](/paper/dev/scheduler)，
动画可以在完成后重新开始，使显示无限旋转：

```java
ItemDisplay display = location.getWorld().spawn(location, ItemDisplay.class, entity -> {
    entity.setItemStack(ItemStack.of(Material.GOLDEN_SWORD));
});

int duration = 5 * 20; // 半圈旋转的持续时间（5 × 20 帧 = 5 秒）

Matrix4f mat = new Matrix4f().scale(0.5F); // 缩放到 0.5x - 更小的物品
Bukkit.getScheduler().runTaskTimer(plugin, task -> {
    if (!display.isValid()) { // 显示实体已从世界中移除，终止任务
        task.cancel();
        return;
    }

    display.setTransformationMatrix(mat.rotateY(((float) Math.toRadians(180)) + 0.1F /* 防止客户端反向插值 */));
    display.setInterpolationDelay(0); // 没有延迟的插值
    display.setInterpolationDuration(duration); // 设置插值旋转的持续时间
}, 1 /* 将初始变换延迟一帧从显示实体创建 */, duration);
```

<span class="img-inline-center">![Interpolation example](./assets/display-interp.gif)</span>

### 传送

与变换插值类似，
你可能还希望在两个点之间插值整个显示实体的移动。

通过插值平移可以实现类似的效果，但如果你改变变换的其他属性，
这些属性也会被插值，这可能符合你的需求，也可能不符合。

```java
// 新位置将比原来高 10 个方块
Location newLocation = display.getLocation().add(0, 10, 0);

display.setTeleportDuration(20 * 10); // 移动将耗时 10 秒（1 秒 = 20 帧）
display.teleport(newLocation); // 执行移动
```

## 用例

显示实体有多种不同的用例，从静态装饰到复杂动画。

一个流行且简单的用例是创建仅对特定玩家可见的装饰，
这可以通过标准实体 API 实现，
例如 [`Entity#setVisibleByDefault()`](jd:paper:org.bukkit.entity.Entity#setVisibleByDefault(boolean))
和 [`Player#showEntity()`](jd:paper:org.bukkit.entity.Player#showEntity(org.bukkit.plugin.Plugin,org.bukkit.entity.Entity))/[`Player#hideEntity()`](jd:paper:org.bukkit.entity.Player#hideEntity(org.bukkit.plugin.Plugin,org.bukkit.entity.Entity))。

:::caution[警告]

如果显示实体仅临时使用，
可以通过 [`Entity#setPersistent()`](jd:paper:org.bukkit.entity.Entity#setPersistent(boolean)) 禁用其持久性，
这意味着它将在区块卸载时消失。

_但是，如果显示实体位于一个永远不会卸载的区块中，
例如出生区块，它将永远不会被移除，从而导致资源泄漏。
请确保在之后使用 [`Entity#remove()`](jd:paper:org.bukkit.entity.Entity#remove()) 移除该显示实体。_

:::

They can also be added as passengers to entities with the它们还可以通过
[`Entity#addPassenger()`](jd:paper:org.bukkit.entity.Entity#addPassenger(org.bukkit.entity.Entity))
和 [`Entity#removePassenger()`](jd:paper:org.bukkit.entity.Entity#removePassenger(org.bukkit.entity.Entity)) 方法作为乘客添加到其他实体上，
这对于制作带样式的名称标签非常有用！

```java
TextDisplay display = world.spawn(location, TextDisplay.class, entity -> {
    // ...

    entity.setVisibleByDefault(false); // 为所有人隐藏
    entity.setPersistent(false); // 不要保存显示，它是临时的
});

entity.addPassenger(display); // 将其挂载到实体的头顶上
player.showEntity(plugin, display); // 向玩家展示
// ...
display.remove(); // 完成显示器
```
