---
title: 持久数据容器（PDC）
description: 关于 PDC API 用于存储数据的指南。
slug: paper/dev/pdc
---

持久数据容器（PDC）是一种在各种对象上存储自定义数据的方式，例如物品、实体和方块实体。
支持 PDC 的完整类列表包括：

- [`Chunk`](#chunk)
- [`World`](#world)
- [`Entity`](#entity)
- [`TileState`](#tilestate)
- [`Structure`](#structure)
- [`ItemMeta`](#itemmeta)
- [`GeneratedStructure`](#generatedstructure)
- [`Raid`](#raid)
- [`OfflinePlayer`](#offlineplayer)
- [`ItemStack`](#itemstack)

## 它用于什么？
在过去，开发者使用了多种方法在对象上存储自定义数据：

- NBT 标签：需要通过反射访问内部结构，并且长期来看不太可靠。
- 物品描述和显示名称：容易出现冲突，并且访问速度较慢。

持久化数据容器（PDC）的好处在于，它允许以一种更可靠且性能更高的方式在对象上存储任意数据。
它不依赖于访问服务器的内部结构，因此在未来版本中不太可能出问题。
此外，它还消除了手动跟踪数据生命周期的需要，例如，当一个实体卸载时，PDC会自动保存。

## 添加数据
要将数据存储到 PDC 中，首先需要准备几样东西。
第一是 [`NamespacedKey`](jd:paper:org.bukkit.NamespacedKey)，它用于标识数据。
第二是 [`PersistentDataContainer`](jd:paper:org.bukkit.persistence.PersistentDataContainer)，它是你想要存储数据的对象。第三是数据本身。

```java
// 创建一个 NamespacedKey
NamespacedKey key = new NamespacedKey(pluginInstance, "example-key");

ItemStack item = ItemStack.of(Material.DIAMOND);
// `ItemMeta` 实现了 `PersistentDataHolder` 接口，因此我们可以从中获取 PDC。
item.editMeta(meta -> {
    meta.getPersistentDataContainer().set(key, PersistentDataType.STRING, "我爱玉米饼！");
});
```

:::note[注意]

重用 `NamespacedKey` 对象是一种良好的实践。它们可以通过以下方式构建：
- 使用一个 [`Plugin`](jd:paper:org.bukkit.plugin.Plugin) 实例和一个 [`String`](jd:java:java.lang.String) 标识符
- 使用一个 [`String`](jd:java:java.lang.String) 命名空间和一个 [`String`](jd:java:java.lang.String) 标识符

第一种方法通常更受青睐，因为它会自动使用插件的命名空间；
然而，如果你想要使用不同的命名空间，或者从另一个插件中访问数据，第二种方法也可以使用。

:::

## 获取数据
要从 PDC 中获取数据，你需要知道数据的 `NamespacedKey` 和 `PersistentDataType`。

```java
// 创建一个 `NamespacedKey`
NamespacedKey key = new NamespacedKey(pluginInstance, "example-key");

ItemStack item = ...; // 从之前获取该物品
// 从 PDC 中获取数据
PersistentDataContainer container = item.getItemMeta().getPersistentDataContainer();
if (container.has(key, PersistentDataType.STRING)) {
    String value = container.get(key, PersistentDataType.STRING);
    // 对获取到的值进行操作
    player.sendMessage(Component.text(value));
}
```

## 数据类型

PDC 支持多种数据类型，例如：
- `Byte`, `字节数组`
- `Double`
- `Float`
- `Integer`, `整型数组`
- `Long`, `长整型数组`
- `Short`
- `String`
- `Boolean`
- `Tag Containers` - 一种将 PDC 嵌套在彼此之中的方法。要创建一个新的 `PersistentDataContainer`，可以使用：
  ```java
  // 获取现有的容器
  PersistentDataContainer container = ...;
  // 创建一个新的容器
  PersistentDataContainer newContainer = container.getAdapterContext().newPersistentDataContainer();
  ```
- `Lists` - 一种可以存储其他持久化数据类型列表的方式。可以通过以下方式创建它们：
  ```java
  // 通过详细地创建一个字符串数据类型的列表数据类型，
  // 将字符串列表存储在容器中
  container.set(
      key,
      PersistentDataType.LIST.listTypeFrom(PersistentDataType.STRING),
      List.of("a", "list", "of", "strings")
  );

  // 使用 API 提供的常用列表类型的预定义，
  // 将字符串列表存储在容器中
  container.set(key, PersistentDataType.LIST.strings(), List.of("a", "list", "of", "strings"));

  // 从容器中检索字符串列表。
  List<String> strings = container.get(key, PersistentDataType.LIST.strings());
  ```

:::note[布尔类型的 `PersistentDataType`]

`Boolean` 类型的 PDC 存在是为了方便使用
- 你无法将更复杂的数据类型简化为布尔值。

:::

### 自定义数据类型

你可以使用原生适配器在 PDC 中存储多种数据类型；
然而，如果你需要更复杂的数据类型，你可以实现自己的 [`PersistentDataType`](jd:paper:org.bukkit.persistence.PersistentDataType) 并使用它。
[`PersistentDataType`](jd:paper:org.bukkit.persistence.PersistentDataType) 的作用是将复杂的数据类型“分解”为原生支持的类型（参见上文），反之亦然。

以下是如何为 UUID 实现自定义 `PersistentDataType` 的示例：

```java title="UUIDDataType.java"
public class UUIDDataType implements PersistentDataType<byte[], UUID> {
    @Override
    public Class<byte[]> getPrimitiveType() {
        return byte[].class;
    }

    @Override
    public Class<UUID> getComplexType() {
        return UUID.class;
    }

    @Override
    public byte[] toPrimitive(UUID complex, PersistentDataAdapterContext context) {
        ByteBuffer bb = ByteBuffer.allocate(Long.BYTES * 2);
        bb.putLong(complex.getMostSignificantBits());
        bb.putLong(complex.getLeastSignificantBits());
        return bb.array();
    }

    @Override
    public UUID fromPrimitive(byte[] primitive, PersistentDataAdapterContext context) {
        ByteBuffer bb = ByteBuffer.wrap(primitive);
        long firstLong = bb.getLong();
        long secondLong = bb.getLong();
        return new UUID(firstLong, secondLong);
    }
}
```

:::note[注意]

为了使用自定义的 `PersistentDataType`，你需要将其实例传递给
[`get`](jd:paper:io.papermc.paper.persistence.PersistentDataContainerView#get(org.bukkit.NamespacedKey,org.bukkit.persistence.PersistentDataType))、
[`set`](jd:paper:org.bukkit.persistence.PersistentDataContainer#set(org.bukkit.NamespacedKey,org.bukkit.persistence.PersistentDataType,C))
或 [`has`](jd:paper:io.papermc.paper.persistence.PersistentDataContainerView#has(org.bukkit.NamespacedKey,org.bukkit.persistence.PersistentDataType)) 方法。
```java
container.set(key, new UUIDDataType(), uuid);
```

:::

## 在不同对象上存储数据

:::caution[警告]

数据 **不会** 自动在持有者之间复制，如果需要在 `PersistentDataHolder` 之间“移动”数据，则需要 **手动** 复制。

例如，将一个 `ItemStack` 放置为方块（带有 `TileState`）**不会** 复制 PDC 数据。

:::

可以拥有 PDC 的对象实现了 [`PersistentDataHolder`](jd:paper:org.bukkit.persistence.PersistentDataHolder) 接口，
其 PDC 可以通过 [`PersistentDataHolder#getPersistentDataContainer()`](jd:paper:org.bukkit.persistence.PersistentDataHolder#getPersistentDataContainer()) 获取。

- ##### [`Chunk`](jd:paper:org.bukkit.Chunk)
    - `Chunk#getPersistentDataContainer()`
- ##### [`World`](jd:paper:org.bukkit.World)
    - `World#getPersistentDataContainer()`
- ##### [`Entity`](jd:paper:org.bukkit.entity.Entity)
    - `Entity#getPersistentDataContainer()`
- ##### [`TileState`](jd:paper:org.bukkit.block.TileState)
    - 这稍微复杂一些，因为需要将方块的状态强制转换为继承自 `TileState` 的类型。
      这并不适用于所有方块，只有那些具有方块实体的方块才支持。
      ```java
      Block block = ...;
      if (block.getState() instanceof Chest chest) {
          chest.getPersistentDataContainer().set(key, PersistentDataType.STRING, "我爱玉米饼！");
          chest.update();
      }
      ```
- ##### [`Structure`](jd:paper:org.bukkit.structure.Structure)
    - `Structure#getPersistentDataContainer()`
- ##### [`ItemMeta`](jd:paper:org.bukkit.inventory.meta.ItemMeta)
    - `ItemMeta#getPersistentDataContainer()`
- ##### [`GeneratedStructure`](jd:paper:org.bukkit.generator.structure.GeneratedStructure)
    - `GeneratedStructure#getPersistentDataContainer()`
- ##### [`Raid`](jd:paper:org.bukkit.Raid)
    - `Raid#getPersistentDataContainer()`
- ##### [`OfflinePlayer`](jd:paper:org.bukkit.OfflinePlayer)
    - `OfflinePlayer` 只提供了一个只读版本的持久化数据容器，
      可以通过 `OfflinePlayer#getPersistentDataContainer()` 访问。
- ##### [`ItemStack`](jd:paper:org.bukkit.inventory.ItemStack)
    - `ItemStack` 的持久化数据容器历来是通过其 `ItemMeta` 访问的。
      然而，这包括了构造整个 `ItemMeta` 的开销，`ItemMeta`
      作为 `ItemStack` 数据的快照，在创建时会捕获其状态。

      为了避免这种开销，`ItemStack`
      在 `ItemStack#getPersistentDataContainer()` 提供了其持久化数据容器的只读视图。
      可以通过 `ItemStack#editPersistentDataContainer(Consumer)` 对持久化数据容器进行编辑。
      在 `Consumer` 中可用的持久化数据容器在 `Consumer` 外部是无效的。
      ```java
      ItemStack itemStack = ...;
      itemStack.editPersistentDataContainer(pdc -> {
          pdc.set(key, PersistentDataType.STRING, "我爱玉米饼！");
      });
      ```
