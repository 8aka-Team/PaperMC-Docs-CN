---
title: 介绍
slug: paper/dev/component-api/introduction
description: 关于组件如何工作的介绍。
---

:::note[注意]

本文档页面适用于 Paper 和 Velocity 项目。

:::

自 Minecraft 1.7 版本以来，游戏一直使用组件来表示客户端显示的文本。
与纯文本字符串相比，组件具有许多优势，具体如下。
Paper 和 Velocity 原生实现了 Adventure API，尽可能地在各个地方添加了对组件的支持。

## 为什么你应该使用组件

以前，文本是一种线性结构，唯一的格式化选项是一些令人困惑的符号，
比如 `§c` 和 `§k`，用于控制文本的基本颜色和样式。
组件是一种树状结构，可以从其父级继承样式和颜色。

组件有几种类型，它们的功能不仅仅是显示原始文本，
例如可以根据键值将文本翻译成客户端的语言，
或者向玩家显示特定于客户端的按键绑定。

所有这些组件类型都支持更多的样式选项，
例如任意 RGB 颜色、交互事件（点击和悬停）。
其他组件类型以及这些样式选项在旧版字符串格式中的表示要么不完整，要么缺失。

## 使用方法

将文本表示为组件现在是 Paper 和 Velocity 支持的文本表示方式。
它们几乎用于客户端显示文本的所有方面。
例如物品名称、物品描述、Boss 条、团队前缀和后缀、自定义名称等，所有这些文本都在各自的 API 中支持组件。
[据 Mojang 表示](https://bugs-legacy.mojang.com/browse/MC-190605?focusedId=993040&page=com.atlassian.jira.plugin.system.issuetabpanels%3Acomment-tabpanel#comment-993040)，
未来将移除客户端对带有 `§` 的旧版格式的支持。

:::tip[提示]

在 Paper API 中，有许多处理这种旧版格式的方法和类型已经被弃用。
这是为了表明组件中有一个更好的替代方案，并且应该在未来迁移到该方案。

:::

## 创建组件

组件可以作为对象进行交互。
每种类型都有不同的接口，以及适用于所有类型的构建器。
这些对象是不可变的，因此在构建更复杂的组件时，建议使用构建器，以避免在每次更改时都创建新的组件实例。

```java
// 这是一种次优的组件构建方式，
// 因为每次更改都会创建一个新的组件
final Component component = Component.text("Hello")
    .color(TextColor.color(0x13f832))
    .append(Component.text(" 世界！", NamedTextColor.GREEN));

/* 这是使用构建器创建相同组件的最优方式。
  此外，请注意，
  Adventure 组件旨在与静态方法导入结合使用，
  以使代码更加简洁 */
final Component component = text()
    .content("Hello").color(color(0x13f832))
    .append(text(" 世界！", GREEN))
    .build();
```

:::note[深入文档]

有关 Paper 和 Velocity 使用的 Adventure 组件 API 的完整文档，
请参阅 [Adventure 文档](https://docs.advntr.dev)。

:::

## MiniMessage

Paper 和 Velocity 包含 MiniMessage 库，这是组件的字符串表示形式。
如果你更喜欢使用字符串而不是对象，MiniMessage 比旧版字符串格式要优越得多。
它可以利用树结构进行样式继承，并且能够表示更复杂的组件类型，而旧版格式则不能。

```java
final Component component = MiniMessage.miniMessage().deserialize(
    "<#438df2><b>这是父组件；其样式是 " +
    "应用于所有子组件.\n<u><!b>这是第一个子组件, " +
    "它会在父组件之后呈现</!b></u><key:key.inventory></b></#438df2>"
);


// 如果上面的语法对你来说太繁琐了，可以创建一个辅助方法！

public final class Components {
    public static Component mm(String miniMessageString) { // mm，即 MiniMessage 的缩写
        return MiniMessage.miniMessage().deserialize(miniMessageString);
    }
}

// ...

import static io.papermc.docs.util.Components.mm; // 替换为自己的包

final Component component = mm("<blue>你好 <red>世界！");
```

我们建议使用这种格式来处理面向用户的输入，例如命令或配置值。

:::note[深入文档]

MiniMessage 是 Adventure 的一部分，你可以通过 [Adventure 的文档](https://docs.advntr.dev/minimessage/index.html) 来查看它的文档。

:::

:::tip[提示]

MiniMessage 有一个 [网页查看器](https://webui.advntr.dev/)，它对于构建更复杂的组件并实时查看结果非常有用。

:::

## JSON 格式

组件可以从标准的 JSON 格式进行序列化和反序列化。
这种格式在原版游戏中被用于各种接受组件参数的命令中，
例如 `/tellraw`。以下是一个这种格式的简单示例。

```json
{
  "text": "这是父组件；其样式应用于所有子组件。\n",
  "color": "#438df2",
  "bold": true,
  "extra": [
    {
      "text": "这是第一个子组件，它会在父组件之后呈现。",
      "underlined": true,
      // 这会仅为此组件覆盖父组件的“粗体”值
      "bold": false
    },
    {
      // 这是一个按键绑定组件，它将显示客户端的该操作的按键绑定
      "keybind": "key.inventory"
    }
  ]
}
```

:::note[深入文档]

JSON 格式的详细文档可以在 [Minecraft Wiki](https://minecraft.wiki/w/Raw_JSON_text_format) 上找到。

:::

:::tip[提示]

有一些在线工具可以更轻松地生成这种格式，例如 [JSON 文本生成器](https://minecraft.tools/en/json_text.php)。

:::

## 序列化器

Paper 和 Velocity 都内置了不同的序列化器，
用于在 [`Component`](https://jd.advntr.dev/api/latest/net/kyori/adventure/text/Component.html) 和其他形式的序列化文本之间进行转换。

### [`GsonComponentSerializer`](https://jd.advntr.dev/text-serializer-gson/latest)

可以使用便利方法直接处理 Gson 的 [`JsonElement`](https://javadoc.io/doc/com.google.code.gson/gson/latest/com.google.gson/com/google/gson/JsonElement.html)，
在 `Component` 和 JSON 格式的字符串之间进行转换。
这种转换是无损的，
是那些不需要经常由用户编辑的组件的首选序列化形式。

### [`MiniMessage`](https://jd.advntr.dev/text-minimessage/latest)

在 `Component` 和 MiniMessage 格式的字符串之间进行转换。
这种转换是无损的，是那些需要由用户编辑的组件的首选序列化形式。
你还可以为序列化器添加大量的自定义内容，
相关内容已在 [API 文档](https://docs.advntr.dev/minimessage/api.html#getting-started) 中进行了说明。

### [`PlainTextComponentSerializer`](https://jd.advntr.dev/text-serializer-plain/latest)

将 `Component` 序列化为纯文本字符串。
这种转换会丢失大量信息，因为所有样式信息以及大多数其他类型的组件都会丢失。
虽然可能会对 [`TranslatableComponent`](https://jd.advntr.dev/api/latest/net/kyori/adventure/text/TranslatableComponent.html) 进行特殊处理，将其序列化为默认语言，
但通常情况下，这种序列化方式只应在特定情境下使用，例如记录到文本文件中。

### [`LegacyComponentSerializer`](https://jd.advntr.dev/text-serializer-legacy/latest)

:::caution[警告]

不建议使用这种方式，因为旧版格式可能会在未来被移除。

:::

在 `Component` 和旧版字符串格式之间进行转换。
由于组件类型和事件在旧版字符串格式中没有对应的表示，这种转换会丢失大量信息。

一个更有用的用例是在迁移过程中将旧版文本转换为 MiniMessage 格式。
```java
final String legacyString = ChatColor.RED + "这是一个旧版 " + ChatColor.GOLD + "string";

// 通过两个序列化器运行旧版字符串，以将旧版格式转换为 MiniMessage 格式。
final String miniMessageString = MiniMessage.miniMessage().serialize(
    LegacyComponentSerializer.legacySection().deserialize(legacyString)
);
```

:::note[注意]

有两种内置的旧版序列化器，一种用于处理 `§` 符号，
另一种用于处理 `&` 符号。它们分别可以通过以下方法获取实例：
- [LegacyComponentSerializer#legacySection()](https://jd.advntr.dev/text-serializer-legacy/latest/net/kyori/adventure/text/serializer/legacy/LegacyComponentSerializer.html#legacySection)()
- [LegacyComponentSerializer#legacyAmpersand()](https://jd.advntr.dev/text-serializer-legacy/latest/net/kyori/adventure/text/serializer/legacy/LegacyComponentSerializer.html#legacyAmpersand)()

:::
