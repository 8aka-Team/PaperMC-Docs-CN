---
title: 注册表
description: 关于 Paper 上注册表及其修改的指南。
slug: paper/dev/registries
sidebar:
  badge:
    text: 实验性
    variant: danger
---

:::danger[实验性]
注册表 API 及其使用的一切目前都是实验性的，未来可能会发生变化。
:::

## 什么是注册表？

在 Minecraft 的上下文中，注册表用于存储一组相同类型的值，并通过键来标识每个值。
例如， [ItemType registry](jd:paper:org.bukkit.Registry#ITEM) 存储了所有已知的物品类型。
注册表可以通过 [RegistryAccess](jd:paper:io.papermc.paper.registry.RegistryAccess) 类访问。

虽然许多注册表是由服务器和客户端独立定义的，
但越来越多的注册表是由服务器定义并在玩家加入服务器时发送给客户端的。
这使得服务器，以及在一定程度上的插件，
能够为自身和在其上运行的客户端定义自定义内容。
显著的例子包括**附魔**和**生物群系**。

### 从注册表中检索值

要从注册表中检索元素，可以使用它们各自的键。
API 定义了两种类型的键。
- `net.kyori.adventure.key.Key` 表示一个命名空间和一个键。
- [TypedKey](jd:paper:io.papermc.paper.registry.TypedKey) 包装了一个
  Adventure 键，
  同时还包含了 [TypedKey](jd:paper:io.papermc.paper.registry.TypedKey)
  所属的[注册表的键](jd:paper:io.papermc.paper.registry.TypedKey#registryKey())。

使用 [TypedKeys](jd:paper:io.papermc.paper.registry.TypedKey)
检索 `Sharpness` 附魔的示例如下：

```java
// 从注册表访问中获取附魔注册表
final Registry<Enchantment> enchantmentRegistry = RegistryAccess
    .registryAccess()
    .getRegistry(RegistryKey.ENCHANTMENT);

// 使用其键获取锋利附魔。
// 如果注册表可能不包含该值，可以用 `get` 替换 `getOrThrow`
final Enchantment enchantment = enchantmentRegistry.getOrThrow(TypedKey.create(
    RegistryKey.ENCHANTMENT, Key.key("minecraft:sharpness"))
);

// 与上述相同，但使用实例的方法
final Enchantment enchantment = enchantmentRegistry.getOrThrow(
    RegistryKey.ENCHANTMENT.typedKey(Key.key("minecraft:sharpness"))
);

// 与上述相同，但使用生成的 `create` 方法
// 适用于数据驱动的注册表或“可写”的注册表
// （那些绑定到 `RegistryEvents` 生命周期事件的注册表）
final Enchantment enchantment = enchantmentRegistry.getOrThrow(
    EnchantmentKeys.create(Key.key("minecraft:sharpness"))
);

// 与上述相同，但使用生成的类型键
// 只有原版条目有生成的键，对于自定义条目，必须使用上述方法
final Enchantment enchantment = enchantmentRegistry.getOrThrow(EnchantmentKeys.SHARPNESS);
```

### 引用注册表值

引用注册表中的条目说起来容易，做起来难。
在大多数情况下，一个简单的 [Collection](jd:java:java.util.Collection) 值集合可能就足够了，
但 Minecraft 更常使用替代方法，因此你会遇到这些方法。

[`RegistrySet`](jd:paper:io.papermc.paper.registry.set.RegistrySet)
定义了一个与注册表 *相关* 的元素集合。

它最常见的子类型是 [`RegistryKeySet`](jd:paper:io.papermc.paper.registry.set.RegistryKeySet)，
它只是持有 [TypedKey](jd:paper:io.papermc.paper.registry.TypedKey) 实例。
这种数据结构的一个优点是，
即使注册表的值发生变化，
它仍然有效。

可以通过 [`RegistryKeySet`](jd:paper:io.papermc.paper.registry.set.RegistryKeySet)
上的工厂方法创建 [`RegistrySet`](jd:paper:io.papermc.paper.registry.set.RegistrySet)，如下所示：
```java
// 创建一个用于持有附魔集合的新注册表键集合
final RegistryKeySet<Enchantment> bestEnchantments = RegistrySet.keySet(
    RegistryKey.ENCHANTMENT,
    // 要存储在键集合中的附魔的任意键。
    EnchantmentKeys.CHANNELING,
    EnchantmentKeys.create(Key.key("papermc:softspoon"))
);
```

[`Tag`](jd:paper:io.papermc.paper.registry.tag.Tag) 是 [`RegistryKeySet`](jd:paper:io.papermc.paper.registry.set.RegistryKeySet) 的扩展，
它本身具有名称，
因此可以被引用。
可以在 [Minecraft Wiki](https://minecraft.wiki/w/Tag#Java_Edition_2) 上找到原版标签的列表。

## 修改注册表

除了对注册表的普通读取权限外，Paper 还为插件提供了修改注册表的方法。

:::caution[警告]
修改注册表需要在服务器的启动阶段完成。
因此，本节内容仅适用于 [Paper 插件](/paper/dev/getting-started/paper-plugins)。

在这一阶段，插件抛出的 **异常** 会导致服务器在加载之前关闭，
因为注册表中缺少值或对注册表的修改可能会导致数据丢失。
:::

:::note[注意]
修改注册表是通过
[LifecycleEventManager](jd:paper:io.papermc.paper.plugin.lifecycle.event.LifecycleEventManager) 完成的。
更多信息请参阅 [生命周期事件](/paper/dev/lifecycle) 页面。
:::

修改注册表的通用入口是
[RegistryEvents](jd:paper:io.papermc.paper.registry.event.RegistryEvents) 类型，
它为每个可修改的注册表提供了一个入口点。
对注册表的修改可以采取两种不同的形式。

### 创建新条目

通过在相应注册表上使用 [`compose` 生命周期事件](jd:paper:io.papermc.paper.registry.event.RegistryEventProvider#compose())件来创建新条目。
`compose` 事件在注册表的内容从“原版”来源加载之后触发，
例如内置数据包或任何已检测到且启用的数据包。
因此，插件可以在这一点注册自己的条目。
以下示例展示了如何创建一个新的附魔：

```java title="TestPluginBootstrap.java"
public class TestPluginBootstrap implements PluginBootstrap {

    @Override
    public void bootstrap(BootstrapContext context) {
        // 在附魔注册表上为 `compose` 生命周期事件注册一个新的处理器
        context.getLifecycleManager().registerEventHandler(RegistryEvents.ENCHANTMENT.compose().newHandler(event -> {
            event.registry().register(
                // 注册表的键
                // 插件应使用自己的命名空间，而不是使用 `minecraft` 或 `papermc`
                EnchantmentKeys.create(Key.key("papermc:pointy")),
                b -> b.description(Component.text("Pointy"))
                    .supportedItems(event.getOrCreateTag(ItemTypeTagKeys.SWORDS))
                    .anvilCost(1)
                    .maxLevel(25)
                    .weight(10)
                    .minimumCost(EnchantmentRegistryEntry.EnchantmentCost.of(1, 1))
                    .maximumCost(EnchantmentRegistryEntry.EnchantmentCost.of(3, 1))
                    .activeSlots(EquipmentSlotGroup.ANY)
            );
        }));
    }
}
```

### 修改现有条目

修改现有条目对于旨在改变原版条目行为的插件非常有用。
为此，可以使用 [`entryAdd` 生命周期事件](jd:paper:io.papermc.paper.registry.event.RegistryEventProvider#entryAdd())。
该事件会在注册表中添加 *任何* 条目时触发，但 API 提供了一种简单的方法来针对特定条目进行修改。
以下示例展示了如何增加 `Sharpness` 附魔的最大等级。

```java
@Override
public void bootstrap(BootstrapContext context) {
    context.getLifecycleManager().registerEventHandler(RegistryEvents.ENCHANTMENT.entryAdd()
        // 将最大等级提升到 20
        .newHandler(event -> event.builder().maxLevel(20))
        // 配置处理器仅对原版的锋利附魔生效。
        .filter(EnchantmentKeys.SHARPNESS)
    );
}
```
