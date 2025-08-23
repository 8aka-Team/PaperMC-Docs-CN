---
title: 数据组件
description: 关于 ItemStack 数据组件 API 的指南。
slug: paper/dev/data-component-api
sidebar:
  badge:
    text: 实验性
    variant: danger
---

:::danger[实验性]

数据组件 API 当前处于实验阶段，并且在不同版本之间可能会发生变化。

:::

数据组件 API 提供了一个版本特定的接口，用于访问和操作无法通过 `ItemMeta` API 表示的物品数据。
通过这个 API，你可以以稳定且面向对象的方式读取和修改物品的属性，这些属性被称为数据组件。


## 介绍

### 什么是数据组件？
数据组件表示与物品相关联的一段数据。原版物品可以有一些属性，比如自定义模型数据、容器内的战利品内容、旗帜图案，或者药水效果。

### 结构
![组件结构](./assets/data-component-api-tree.png)
关于实现细节，[点击这里](#example-cool-sword)。

#### 原型（默认值）
物品附带了一组初始组件，我们称之为原型。
这些组件定义在 `ItemStack` 的 `ItemType` 上。
它们控制物品的基本行为，代表一个全新的、没有任何修改的物品。

原型赋予物品它们的初始属性，例如它们是否是食物、工具、武器等。

#### 补丁
补丁代表对物品所做的修改。
这可能包括给它一个自定义名称、修改附魔、损坏它，或者添加到物品描述中。
补丁被应用在原型之上，允许我们对物品进行修改。

补丁还允许移除原型中之前存在的组件。
这在红色的 `minecraft:tool` 示例中有所展示。
我们正在移除这个组件，所以这把剑物品将不再更快地破坏蛛网或其他剑可以破坏的方块。

我们也可以添加新的组件，正如从新的 `minecraft:enchantment_glint_override` 组件中看到的那样，
它允许我们让它看起来像是附魔了。


## 与 `ItemMeta` 的差异

`ItemMeta` API 提供了一种层次化的方式来修改 `ItemStack`，例如 `CompassMeta`，它允许你修改 `minecraft:compass` 的组件。
尽管 `ItemMeta` 仍然非常有用，但它并不能很好地表示 Minecraft 物品所使用的原型/补丁关系。

### 关键差异

#### 扩展的数据模型
数据组件 API 暴露了比 `ItemMeta` 更广泛、更详细的物品属性集合。
数据组件允许以一种更接近 Minecraft 修改物品的方式来修改整个物品。

#### 版本特定
数据组件 API 被设计为能够适应版本变化。
随着 Minecraft 对组件进行更改，数据组件 API 可能在版本更新时出现破坏性变化。不保证向后兼容性。

由于 `ItemMeta` 以不同的格式表示，Mojang 对组件所做的破坏性更改可能不会导致 `ItemMeta` 的破坏性更改。

#### 构建器和不可变性
许多复杂的数据组件需要使用构建器方法来进行构建和编辑。所有由API返回的数据类型也是不可变的，因此它们不会直接修改组件。

#### 仅补丁
`ItemMeta` 只表示 `ItemStack` 的补丁。
这意味着你无法获取 `ItemStack` 的原始属性（原型），例如它的默认耐久度或默认属性。

#### 没有快照
目前，`ItemMeta` 表示 `ItemStack` 补丁映射的**快照**。
这是昂贵的，因为它需要读取整个补丁，即使你可能并不使用其中的某些值。

数据组件 API 直接与 `ItemStack` 集成。尽管概念上相似，但数据组件 API 关注的是明确的、强类型的检索和更新，而不带有这种额外的开销。

### 我应该使用 `DataComponents` 还是 `ItemMeta`？

如果你：
- 只对 `ItemStack` 进行简单的更改
- 希望你的插件保持跨版本兼容性，那么你应该使用 `ItemMeta`。

如果你：
- 想要进行更复杂的 `ItemStack` 修改
- 不关心跨版本兼容性
- 想要访问默认（原型）值
- 想要从 `ItemStack` 的原型中移除组件，那么你应该使用数据组件。


## 基本用法
数据组件 API 将根据游戏中看到的行为来获取值。
因此，如果补丁移除了 `minecraft:tool` 组件，尝试获取该组件将返回 `null`。

### 获取原型值

```java
// 获取钻石剑的默认耐久度
int defaultDurability = Material.DIAMOND_SWORD.getDefaultData(DataComponentTypes.MAX_DAMAGE)
```

### 检查数据组件

```java
// 检查这个物品是否有自定义名称数据组件
boolean hasCustomName = stack.hasData(DataComponentTypes.CUSTOM_NAME);
logger.info("是否有自定义名称？ " + hasCustomName);
```

### 读取有值的数据组件

```java
// 物品的伤害值可以是`null`，因此我们需要进行空值检查
Integer damageValue = stack.getData(DataComponentTypes.DAMAGE);
if (damageValue != null) {
    logger.info("当前伤害: " + damageValue);
} else {
    logger.info("这个物品没有设置伤害组件。");
}

// 某些组件，比如最大堆叠数量，总是会出现在一个物品上
Integer maxStackSize = stack.getData(DataComponentTypes.MAX_STACK_SIZE);
```

### 设置有值的数据组件

```java
// 为这个物品设置一个自定义模型数据值
stack.setData(DataComponentTypes.CUSTOM_MODEL_DATA, CustomModelData.customModelData()
    .addFloat(0.5f)
    .addFlag(true)
    .build()
);
```

### 移除或重置数据组件

```java
// 移除一个已存在的组件（例如工具）
stack.unsetData(DataComponentTypes.TOOL);

// 将一个组件重置为其物品类型的默认（原型）值（例如最大堆叠数量）
stack.resetData(DataComponentTypes.MAX_STACK_SIZE);
```

### 无值数据组件

一些组件只是标志，不携带任何值：

```java
// 使物品成为一个滑翔翼，像鞘翅一样使用（结合可装备组件）
stack.setData(DataComponentTypes.GLIDER);

// 移除滑翔翼标志
stack.unsetData(DataComponentTypes.GLIDER);
```

## 使用构建器的高级用法

许多数据组件具有复杂的结构，需要使用构建器。

### 修改原型组件值

```java
ItemStack helmet = ItemStack.of(Material.DIAMOND_HELMET);
// 获取这个物品的可装备组件，并将其转换为构建器。
// 注意：并非所有类型都有`.toBuilder()`方法。
// 这是钻石头盔的原型值。
Equippable.Builder builder = helmet.getData(DataComponentTypes.EQUIPPABLE).toBuilder();

// 让头盔看起来像下界合金头盔。
// 我们从`NETHERITE_HELMET`获取原型可装备值。
builder.assetId(Material.NETHERITE_HELMET.getDefaultData(DataComponentTypes.EQUIPPABLE).assetId());
// 并且在戴上它时发出一种恐怖的声音
builder.equipSound(SoundEventKeys.ENTITY_GHAST_HURT);

// 设置我们的新物品
helmet.setData(DataComponentTypes.EQUIPPABLE, builder);
```
这将创建一个看起来像下界合金头盔的钻石头盔，并且在装备时会发出一种恐怖的恶魂声音。

### 示例：已书写的书

```java
ItemStack book = ItemStack.of(Material.WRITTEN_BOOK);
WrittenBookContent.Builder builder = WrittenBookContent.writtenBookContent("My Book", "AuthorName");

// 添加一页
builder.addPage(Component.text("这是一个新页面！"));

// 添加一页，对于开启了过滤的玩家会显示不同内容。
// 关闭了过滤的玩家会看到“I hate Paper!”，而开启了过滤的玩家会看到“I love Paper!”。
builder.addFilteredPage(
    Filtered.of(Component.text("I hate Paper!"), Component.text("I love Paper!"))
);

// 更改生成
builder.generation(1);

// 应用更改
book.setData(DataComponentTypes.WRITTEN_BOOK_CONTENT, builder.build());
```

### 示例：酷炫的剑

```java
ItemStack sword = ItemStack.of(Material.DIAMOND_SWORD);
sword.setData(DataComponentTypes.LORE, ItemLore.lore().addLine(Component.text("酷炫的剑！")).build());
sword.setData(DataComponentTypes.ENCHANTMENTS, ItemEnchantments.itemEnchantments().add(Enchantment.SHARPNESS, 10).build());
sword.setData(DataComponentTypes.RARITY, ItemRarity.RARE);

sword.unsetData(DataComponentTypes.TOOL); // 移除工具组件

sword.setData(DataComponentTypes.MAX_DAMAGE, 10);
sword.setData(DataComponentTypes.ENCHANTMENT_GLINT_OVERRIDE, true); // 让它发光！
```

## 匹配没有某些数据组件的物品

在比较物品时，
有时你可能希望忽略某些值。
为此，我们可以使用 [`ItemStack#matchesWithoutData`](jd:paper:org.bukkit.inventory.ItemStack#matchesWithoutData(org.bukkit.inventory.ItemStack,java.util.Set)) 方法。

例如，这里我们在比较两把钻石剑时忽略了它们的耐久度：

```java
ItemStack originalSword = ItemStack.of(Material.DIAMOND_SWORD);
ItemStack damagedSword = ItemStack.of(Material.DIAMOND_SWORD);
damagedSword.setData(DataComponentTypes.DAMAGE, 100);

boolean match = damagedSword.matchesWithoutData(originalSword, Set.of(DataComponentTypes.DAMAGE), false);
logger.info("这把剑匹配吗？ " + match); // -> true
```
