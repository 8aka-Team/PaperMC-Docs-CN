---
title: 配方表
description: 如何创建和管理配方。
slug: paper/dev/recipes
---

配方是一种定义制作特定物品的方式。
它们可以由插件或数据包定义，但在这里我们只讨论插件方面的内容。

## [`ShapedRecipe`](jd:paper:org.bukkit.inventory.ShapedRecipe)

一个形状化配方是一种需要在制作网格中以特定模式排列物品才能制作出物品的配方。
这些配方是通过一个模式字符串和一个字符到物品的映射来创建的。
模式字符串是 3 个 3 字符的字符串，它们代表制作网格的行。它们可以按如下方式创建：

```java title="TestPlugin.java"
public class TestPlugin extends JavaPlugin {

    @Override
    public void onEnable() {
        NamespacedKey key = new NamespacedKey(this, "战士之剑");
        ItemStack item = ItemStack.of(Material.DIAMOND_SWORD);

        ShapedRecipe recipe = new ShapedRecipe(key, item);
        recipe.shape(" A ", "AAA", " B ");
        recipe.setIngredient('A', Material.DIAMOND);
        recipe.setIngredient('B', Material.STICK);

        getServer().addRecipe(recipe);
    }
}
```

这个配方需要一把钻石剑，在制作网格中以特定方式摆放：
顶部一行放钻石，中间一行放木棍，底部一行再放钻石，而钻石剑则位于底部行的中间格子。
在制作网格中看起来会是这样：

```
 A
AAA
 B
```

:::note[注意]

你无需在插件的 `onEnable` 方法中注册配方，
你可以在任何时候注册。
然而，如果在插件启用后且有玩家在线时仍未注册配方，
那么你需要重新将所有配方发送给玩家，
或者使用 [`addRecipe`](jd:paper:org.bukkit.Server#addRecipe(org.bukkit.inventory.Recipe,boolean)) 方法中的布尔参数来更新所有玩家的配方。

:::

:::caution[警告]

你不能在有形状的配方中使用空气作为材料，这会导致错误。

:::


## [`ShapelessRecipe`](jd:paper:org.bukkit.inventory.ShapelessRecipe)

无形状配方是一种需要在制作网格中放置特定数量的物品来制作物品的配方。
这些配方是通过一个物品列表创建的。可以按照以下方式创建：

```java title="TestPlugin.java"
public class TestPlugin extends JavaPlugin {

    @Override
    public void onEnable() {
        NamespacedKey key = new NamespacedKey(this, "战士之剑");
        ItemStack item = ItemStack.of(Material.DIAMOND_SWORD);

        ShapelessRecipe recipe = new ShapelessRecipe(key, item);
        recipe.addIngredient(3, Material.DIAMOND);
        recipe.addIngredient(2, Material.STICK);

        getServer().addRecipe(recipe);
    }
}
```

这个配方声明你只需要 3 颗钻石和 2 根木棍来制作该物品，
而不需要在制作网格中按照任何特定的十字图案排列。以下是可以制作该物品的几种方式：
```
  DSS   |   SDS   |   S D
  D     |   D     |   D
  D     |   D     |   D S
```
以及这 5 件物品的任何其他组合。
