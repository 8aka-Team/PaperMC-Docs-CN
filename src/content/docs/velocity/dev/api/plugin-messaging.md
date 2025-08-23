---
title: 插件消息
description: 如何在 Velocity 上处理和发送插件消息
slug: velocity/dev/plugin-messaging
---

插件消息最早于 [2012](https://web.archive.org/web/20220711204310/https://dinnerbone.com/blog/2012/01/13/minecraft-plugin-channels-messaging/) 年引入，
它是一种让 Velocity 插件与客户端和后端服务器通信的方式。

Velocity 在客户端和后端服务器的两个方向上管理连接。
这意味着 Velocity 插件需要考虑四种主要情况：

```d2
style.fill: transparent
direction: right

玩家 -> Velocity: "1 (传入)"
Velocity -> 后端: "2 (传出)"
后端 -> Velocity: "3 (传入)"
Velocity -> 玩家: "4 (传出)"
```

:::caution[注意]

在监听 `PluginMessageEvent` 时，如果你不希望客户端参与，
请确保结果是
[ `ForwardResult.handled()`](jd:velocity:com.velocitypowered.api.event.connection.PluginMessageEvent$ForwardResult#handled())。

如果结果被转发，玩家可能会伪装成代理向你的后端服务器发送消息。

此外，确保在处理正确的消息后正确设置结果，以防止它们泄露给另一方。

这可以通过在检查标识符和检查来源之间无条件地设置结果来实现，如示例所示。

:::

此外，还包含了对 BungeeCord 通道的兼容性，这在某些情况下可能无需配套的 Velocity 插件。

## 案例 1：从玩家接收插件消息

当需要处理或检查玩家发送的插件消息的内容时使用此功能。
它需要在 `ChannelRegistrar` 中注册才能触发事件。

一个示例用例可能是记录来自报告启用功能的模组的消息。

```d2
style.fill: transparent
direction: right

"由玩家转发" {
  玩家 -> Velocity
  Velocity -> 后端
}

"由玩家处理" {
  玩家 -> Velocity
  Velocity -> 后端 {
    style.stroke: transparent
  }
}
```


```java
public static final MinecraftChannelIdentifier IDENTIFIER = MinecraftChannelIdentifier.from("custom:main");

@Subscribe
public void onProxyInitialization(ProxyInitializeEvent event) {
    proxyServer.getChannelRegistrar().register(IDENTIFIER);
}

@Subscribe
public void onPluginMessageFromPlayer(PluginMessageEvent event) {
    // 无论来源如何，首先检查标识符是否匹配。
    if (!IDENTIFIER.equals(event.getIdentifier())) {
        return;
    }

    // 将插件消息标记为已处理，表明内容不应转发到其原始目的地。
    event.setResult(PluginMessageEvent.ForwardResult.handled());

    // 或者:

    // 将插件消息标记为已转发，表明内容应该被传递，就像 Velocity 不存在一样。
    //event.setResult(PluginMessageEvent.ForwardResult.forward());

    // 只有当来源是玩家时，才尝试解析数据
    if (!(event.getSource() instanceof Player player)) {
        return;
    }

    ByteArrayDataInput in = ByteStreams.newDataInput(event.getData());
    // 处理数据包
}
```

## 案例 2：向后端服务器发送插件消息

当你需要向后端服务器发送插件消息时使用此功能。

根据你的需求，有两种方法可以向后端发送插件消息。

:::caution[注意]

在你的后端服务器上，只有当你确信只有可信的代理才能向你的服务器发送它们时，才监听插件消息。

否则，玩家可能会伪装成你的代理并伪造它们。

:::

```d2
style.fill: transparent
direction: right

"发送到后端" {
  玩家 -> Velocity {
    style.stroke: transparent
  }
  Velocity -> 后端
}
```


### 使用任何已连接的玩家

若你只想传达与整个服务器相关的内容，
或信息本身已能说明问题，这将非常有用。

例如，通知服务器关闭就是一个典型用例。

```java
public boolean sendPluginMessageToBackend(RegisteredServer server, ChannelIdentifier identifier, byte[] data) {
    // 成功时返回 true
    return server.sendPluginMessage(identifier, data);
}
```

### 使用特定玩家的连接

如果你想要向玩家当前所在的后端服务器传达有关该玩家的某些信息，这将非常有用。
你可能需要进行额外的检查，以确保在玩家所在的后端服务器上正确处理这些信息。

一个示例用例可能是告诉后端服务器给玩家一个特定的物品。

```java
public boolean sendPluginMessageToBackendUsingPlayer(Player player, ChannelIdentifier identifier, byte[] data) {
    Optional<ServerConnection> connection = player.getCurrentServer();
    if (connection.isPresent()) {
        // 成功时返回 true
        return connection.get().sendPluginMessage(identifier, data);
    }
    return false;
}
```

## 案例 3：从后端服务器接收插件消息

当需要接收后端服务器的插件消息时使用。
需通过 [`ChannelRegistrar`](jd:velocity:com.velocitypowered.api.proxy.messages.ChannelRegistrar)
注册才能触发该事件。

例如，处理玩家传送到其他服务器的请求就是一个典型用例。

```d2
style.fill: transparent
direction: left

"从后端转发" {
  后端 -> Velocity
  Velocity -> 玩家
}

"由后端处理" {
  后端 -> Velocity
  Velocity -> 玩家 {
    style.stroke: transparent
  }
}
```

```java
public static final MinecraftChannelIdentifier IDENTIFIER = MinecraftChannelIdentifier.from("custom:main");

@Subscribe
public void onProxyInitialization(ProxyInitializeEvent event) {
    proxyServer.getChannelRegistrar().register(IDENTIFIER);
}

@Subscribe
public void onPluginMessageFromBackend(PluginMessageEvent event) {
    // 首先检查标识符是否匹配（无论来源）
    // 这样可将所有消息设为 IDENTIFIER 已处理
    // 阻止转发任何客户端发起的消息
    if (!IDENTIFIER.equals(event.getIdentifier())) {
        return;
    }

    // 标记 PluginMessage 为已处理
    // 内容将不会转发至原定目标
    event.setResult(PluginMessageEvent.ForwardResult.handled());

    // 或者：

    // 将 PluginMessage 标记为已转发，表示内容
    // 应该被传递，就像 Velocity 不存在一样。
    //
    // 这应该非常谨慎使用，
    // 因为任何客户端都可以自由发送任何它想要的内容，假装是代理服务器
    //event.setResult(PluginMessageEvent.ForwardResult.forward());

    // 只有当来源是后端服务器时才尝试解析数据
    if (!(event.getSource() instanceof ServerConnection backend)) {
        return;
    }

    ByteArrayDataInput in = ByteStreams.newDataInput(event.getData());
    // 处理数据包数据
}
```

## 案例 4：向玩家发送插件消息

这是当你需要向玩家发送插件消息时

:::tip[提示]

这只在你正在制作客户端模组时才真正有用。否则，玩家可能只会忽略该消息。

:::

```d2
style.fill: transparent
direction: left

"发送给玩家" {
  后端 -> Velocity {
    style.stroke: transparent
  }
  Velocity -> 玩家
}
```

```java
public boolean sendPluginMessageToPlayer(Player player, ChannelIdentifier identifier, byte[] data) {
    // 成功时返回 true
    return player.sendPluginMessage(identifier, data);
}
```

## BungeeCord 通道兼容性

这允许你的后端服务器以与 BungeeCord 兼容的方式与 Velocity 通信。

默认情况下，如果你在[配置](/velocity/configuration#advanced-section)中启用了 `bungee-plugin-message-channel`，你的 Velocity 服务器将响应 `bungeecord:main` 通道。

:::tip[“bungeecord” 规范]

有关 BungeeCord / Velocity 支持的所有内置插件消息的列表，请参阅[此处](/paper/dev/plugin-messaging#plugin-message-types)。

:::
