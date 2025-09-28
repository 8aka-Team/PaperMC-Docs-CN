---
title: 持久数据容器（PDC）
description: 关于 PDC API 用于存储数据的指南。
slug: paper/dev/pdc
version: 1.21.8
---

持久数据容器（PDC）是一种在各种对象上存储自定义数据的方式，例如物品、实体和方块实体。
支持 PDC 的完整类列表包括：

- [`ItemStack`](#itemstack)
- [`Chunk`](#chunk)
- [`World`](#world)
- [`Entity`](#entity)
- [`TileState`](#tilestate)
- [`Structure`](#structure)
- [`GeneratedStructure`](#generatedstructure)
- [`Raid`](#raid)
- [`OfflinePlayer`](#offlineplayer)
- [`ItemMeta`](#itemmeta)

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
NamespacedKey key = new NamespacedKey(pluginInstance, "example-key"); // 创建一个命名空间键( `NamespacedKey` )
World world = Bukkit.getServer().getWorlds().getFirst();

PersistentDataContainer pdc = world.getPersistentDataContainer();
pdc.set(key, PersistentDataType.STRING, "我爱玉米卷！");
```

[`ItemStack`](jd:paper:org.bukkit.inventory.ItemStack) 然而，它并没有这个方法，而是要求你使用其构建器风格的消费者。:

```java
NamespacedKey key = ...;

// 对于1.20.4及以下版本，请改用`new ItemStack(Material.DIAMOND)`。
ItemStack item = ItemStack.of(Material.DIAMOND);
item.editPersistentDataContainer(pdc -> {
    pdc.set(key, PersistentDataType.STRING, "我爱玉米卷！");
});
```

:::note[注意]

`ItemStack` 上的 [`ItemStack#editPersistentDataContainer()`](jd:paper:org.bukkit.inventory.ItemStack#editPersistentDataContainer(java.util.function.Consumer)) 方法仅在 1.21.4+ 中可用。对于旧版本，你需要访问并修改 [`ItemMeta`](jd:paper:org.bukkit.inventory.meta.ItemMeta)。
对于 1.16.5+，则有 [`ItemStack#editMeta()`](jd:paper:org.bukkit.inventory.ItemStack#editMeta(java.util.function.Consumer)) 方法。

:::

:::note[注意]

重用 `NamespacedKey` 对象是一种良好的实践。它们可以通过以下方式构建：
- 一个 [`Plugin`](jd:paper:org.bukkit.plugin.Plugin) 实例和一个 [`String`](jd:java:java.lang.String) 标识符
- 一个 [`String`](jd:java:java.lang.String) 命名空间和一个 [`String`](jd:java:java.lang.String) 标识符

第一种方式通常更为推荐，因为它会自动使用插件名称的小写形式作为命名空间；然而，如果你想要使用不同的命名空间，或者从其他插件中访问数据，第二种方式也可以使用。

:::

## 获取数据
要从 PDC 中获取数据，你需要知道数据的`NamespacedKey`和[`PersistentDataType`](jd:paper:org.bukkit.persistence.PersistentDataType)。
某些 API 部分，例如 Adventure 的[`Component.text(String)`](https://jd.advntr.dev/api/latest/net/kyori/adventure/text/Component.html#text(java.lang.String))，要求值不能为 `null`。在这种情况下，应使用 PDC 上的[`getOrDefault`](jd:paper:io.papermc.paper.persistence.PersistentDataContainerView#getOrDefault(org.bukkit.NamespacedKey,org.bukkit.persistence.PersistentDataType,C))，而不是可为空的[`get`](jd:paper:io.papermc.paper.persistence.PersistentDataContainerView#get(org.bukkit.NamespacedKey,org.bukkit.persistence.PersistentDataType))。

```java
NamespacedKey key = ...; // 使用添加数据示例中的相同键
World world = ...; // 使用添加数据示例中的相同世界

PersistentDataContainer pdc = world.getPersistentDataContainer();

// 使用PDC中的数据
String value = pdc.getOrDefault(key, PersistentDataType.STRING, "<null>");

// 对值进行操作
player.sendPlainMessage(value);
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
  // 获取一个已存在的容器
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

  // 使用API提供的常用列表类型的预定义，
  // 将字符串列表存储在容器中。
  container.set(key, PersistentDataType.LIST.strings(), List.of("a", "list", "of", "strings"));

  // 从容器中检索字符串列表。
  List<String> strings = container.get(key, PersistentDataType.LIST.strings());
  ```

:::note[布尔类型的 `PersistentDataType`]

`Boolean` 类型的 PDC 存在是为了方便使用
- 你无法将更复杂的数据类型简化为布尔值。

:::

### 自定义数据类型

你可以通过原生适配器在 PDC 中存储各种数据类型；
然而，如果你需要更复杂的数据类型，你可以实现自己的 `PersistentDataType` 并使用它。
`PersistentDataType` 的作用是将复杂的数据类型“分解”为原生支持的类型（参见上文），反之亦然。

以下是如何为 UUID 实现自定义 `PersistentDataType` 的示例：

```java title="UUIDDataType.java"
@NullMarked
public class UUIDDataType implements PersistentDataType<byte[], UUID> {

    public static final UUIDDataType INSTANCE = new UUIDDataType();

    // 我们只需要一个单例，因此无需允许实例化。
    private UUIDDataType() {}

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
container.set(key, UUIDDataType.INSTANCE, uuid);
```

:::


## 只读容器

某些类，例如 `ItemStack` 或 [`OfflinePlayer`](jd:paper:org.bukkit.OfflinePlayer)，提供了其 PDC 的只读视图。
与 `ItemStack` 不同，`OfflinePlayer` <u>不</u>提供任何修改底层容器的方法。
这是因为 `OfflinePlayer` 是从磁盘直接读取的，需要进行阻塞的文件操作。
可变对象，如 [`PersistentDataHolder#getPersistentDataContainer()`](jd:paper:org.bukkit.persistence.PersistentDataHolder#getPersistentDataContainer())，通常即使没有修改也需要重新保存或进行监控。
这就是为什么对于只读操作，最好使用不可修改的“视图”。

```java
NamespacedKey key = ...;
ItemStack item = ...;

PersistentDataContainerView pdcView = item.getPersistentDataContainer();

// 利用 PDC “视图”中的数据
String value = pdcView.getOrDefault(key, PersistentDataType.STRING, "<null>");

// 对值进行操作
player.sendPlainMessage(value);
```

:::note[注意]

`ItemStack` 的 PDC 视图支持仅在 1.21.1 中引入。对于旧版本，你需要使用 `ItemMeta`。

:::

## 在不同对象上存储数据

:::caution[警告]

数据 **不会** 自动在持有者之间复制，如果需要在 `PersistentDataHolder` 之间“移动”数据，则需要 **手动** 复制。

例如，将一个 `ItemStack` 放置为方块（带有 `TileState`）**不会** 复制 PDC 数据。

:::

可以拥有 PDC 的对象实现了 [`PersistentDataHolder`](jd:paper:org.bukkit.persistence.PersistentDataHolder) 接口，
其 PDC 可以通过 `PersistentDataHolder#getPersistentDataContainer()` 获取。

- ##### [`ItemStack`](jd:paper:org.bukkit.inventory.ItemStack)
    - `ItemStack` 的持久化数据容器历来是通过其 `ItemMeta` 访问的。
      然而，这包括了构建整个 `ItemMeta` 的开销，`ItemMeta` 作为 `ItemStack` 数据在创建时点的快照。

      为了避免这种开销，从 1.21.1+ 开始，`ItemStack` 通过 [`ItemStack#getPersistentDataContainer()`](jd:paper:org.bukkit.inventory.ItemStack#getPersistentDataContainer()) 暴露其持久数据容器的只读视图。
      从 1.21.4+ 开始，还可以使用 `ItemStack#editPersistentDataContainer(java.util.function.Consumer)` 简化对持久数据容器的编辑。
      在消费者中可用的持久数据容器在消费者外部是无效的。
      ```java
      ItemStack itemStack = ...;
      itemStack.editPersistentDataContainer(pdc -> {
          pdc.set(key, PersistentDataType.STRING, "我爱玉米卷！");
      });
      ```
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
          chest.getPersistentDataContainer().set(key, PersistentDataType.STRING, "我爱玉米卷！");
          chest.update();
      }
      ```
- ##### [`Structure`](jd:paper:org.bukkit.structure.Structure)
    - `Structure#getPersistentDataContainer()`
- ##### [`GeneratedStructure`](jd:paper:org.bukkit.generator.structure.GeneratedStructure)
    - `GeneratedStructure#getPersistentDataContainer()`
- ##### [`Raid`](jd:paper:org.bukkit.Raid)
    - `Raid#getPersistentDataContainer()`
- ##### [`OfflinePlayer`](jd:paper:org.bukkit.OfflinePlayer)
    - `OfflinePlayer`仅暴露持久数据容器的只读版本。
      可以通过`OfflinePlayer#getPersistentDataContainer()`访问。
- ##### [`ItemMeta`](jd:paper:org.bukkit.inventory.meta.ItemMeta)
    - `ItemMeta#getPersistentDataContainer()`
