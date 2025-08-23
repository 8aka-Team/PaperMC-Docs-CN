---
title: 自定义物品栏持有者
description: 如何使用自定义的 `InventoryHolder` 来识别自定义的物品栏。
slug: paper/dev/custom-inventory-holder
---

`InventoryHolder` 是一种在事件中标识插件的物品栏的方法。

## 为什么要使用 `InventoryHolder`？

`InventoryHolder` 简化了确保物品栏是由你的插件创建的步骤。

使用物品栏名称进行识别是不可靠的，因为其他插件甚至玩家都可以创建与你的名称完全相同的物品栏。
对于组件，你还需要确保名称完全相同，或者将其序列化为其他格式。

自定义 `InventoryHolder` 没有这样的缺点，通过使用它们，你可以确保有方法来处理你的物品栏。

## 创建自定义持有者

第一步是实现[`InventoryHolder`](jd:paper:org.bukkit.inventory.InventoryHolder)接口。
我们可以这样操作：创建一个新类，在构造函数中创建我们的[`Inventory`](jd:paper:org.bukkit.inventory.Inventory)。

:::note[注意]

构造函数以主插件类作为参数来创建`Inventory`。
如果你愿意，可以使用静态方法[`Bukkit#createInventory(InventoryHolder, int)`](jd:paper:org.bukkit.Bukkit#createInventory(org.bukkit.inventory.InventoryHolder,int))，并移除参数。

:::

```java title="MyInventory.java"
public class MyInventory implements InventoryHolder {

    private final Inventory inventory;

    public MyInventory(MyPlugin plugin) {
        // 创建一个有 9 个槽位的物品栏，这里的 `this` 是我们的 `InventoryHolder`。
        this.inventory = plugin.getServer().createInventory(this, 9);
    }

    @Override
    public Inventory getInventory() {
        return this.inventory;
    }

}
```

## 打开物品栏

要打开物品栏，首先我们需要实例化我们的`MyInventory`类，然后为玩家打开物品栏。
你可以在需要的地方进行操作。

:::note[注意]

我们传递了插件主类的一个实例，因为构造函数需要它。
如果你使用了静态方法并移除了构造函数参数，那么你就不需要在这里传递它。

:::

```java
Player player; // 假设我们有一个玩家实例。
               // 这可以是一个命令、另一个事件，或者任何你有玩家的地方。

MyInventory myInventory = new MyInventory(myPlugin);
player.openInventory(myInventory.getInventory());
```

## 监听事件

一旦我们打开了物品栏，我们就可以监听任何我们喜欢的物品栏事件，
并检查 [`Inventory#getHolder()`](jd:paper:org.bukkit.inventory.Inventory#getHolder()) 是否返回了我们 `MyInventory` 的一个实例。

```java
@EventHandler
public void onInventoryClick(InventoryClickEvent event) {
    Inventory inventory = event.getInventory();
    // 检查持有者是否是我们的 `MyInventory`。
    // 如果是，使用 `instanceof` 模式匹配立即将其存储到一个变量中。
    if (!(inventory.getHolder(false) instanceof MyInventory myInventory)) {
        // 这不是我们的物品栏，忽略它。
        return;
    }

    // 在事件中执行我们需要的操作。
}
```

## 在持有者上存储数据

你可以通过在类中添加字段和方法，将额外的数据存储在 `InventoryHolder` 上，用于你的物品栏。

让我们创建一个物品栏，用来统计我们在其中点击石头的次数。
首先，我们稍微修改一下我们的 `MyInventory` 类。

```java title="MyInventory.java"
public class MyInventory implements InventoryHolder {

    private final Inventory inventory;

    private int clicks = 0; // 存储点击次数。

    public MyInventory(MyPlugin plugin) {
        this.inventory = plugin.getServer().createInventory(this, 9);

        // 设置我们将要点击的石头。
        this.inventory.setItem(0, ItemStack.of(Material.STONE));
    }

    // 一个方法，我们将在监听器中调用它，每当玩家点击石头时。
    public void addClick() {
        this.clicks++;
        this.updateCounter();
    }

    // 一个方法，用于更新计数器物品。
    private void updateCounter() {
        this.inventory.setItem(8, ItemStack.of(Material.BEDROCK, this.clicks));
    }

    @Override
    public Inventory getInventory() {
        return this.inventory;
    }

}
```

现在，我们可以修改我们的监听器，以检查玩家是否点击了石头，如果是，则增加一次点击。

```java
@EventHandler
public void onInventoryClick(InventoryClickEvent event) {
    // 我们获取被点击的物品栏，以避免玩家已经在他们的物品栏中有一个石头，并点击了那个石头的情况。
    Inventory inventory = event.getClickedInventory();
    // 添加一个空值检查，以防玩家点击了窗口外的区域。
    if (inventory == null || !(inventory.getHolder(false) instanceof MyInventory myInventory)) {
        return;
    }

    event.setCancelled(true);

    ItemStack clicked = event.getCurrentItem();
    // 检查玩家是否点击了石头。
    if (clicked != null && clicked.getType() == Material.STONE) {
        // 使用我们在 `MyInventory` 中定义的方法来增加字段并更新计数器。
        myInventory.addClick();
    }
}
```

:::note[注意]

你可以将创建的 `MyInventory` 实例存储起来，例如存储在一个 `Map<UUID, MyInventory>` 中用于每个玩家的独立使用，
或者作为一个字段来让所有玩家共享物品栏，这样即使在下一次打开物品栏时，也可以持久化计数器。

:::
