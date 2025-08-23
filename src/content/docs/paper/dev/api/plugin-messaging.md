---
title: 消息传递
description: 如何与客户端或代理进行通信。
slug: paper/dev/plugin-messaging
---

插件消息最早于 [2012](https://web.archive.org/web/20220711204310/https://dinnerbone.com/blog/2012/01/13/minecraft-plugin-channels-messaging/) 引入，
这是一种让插件与客户端通信的方式。
当服务器位于代理之后时，它允许插件与代理服务器进行通信。

## BungeeCord 通道

BungeeCord 通道用于 Paper 服务器与 BungeeCord（或兼容 BungeeCord 的）代理之间的通信。

最初，BungeeCord 代理支持的通道名为 `BungeeCord`。
在 1.13 及以上版本中，该通道被重命名为 `bungeecord:main`，以创建用于插件消息通道的键结构。

Paper 在内部处理了这一变化，并会自动将通过 `BungeeCord` 通道发送的任何消息更改为 `bungeecord:main` 通道。
这意味着你的插件应继续使用 `BungeeCord` 通道。

## 发送插件消息

首先，我们来看看你的 Paper 服务器。
你的插件需要注册它将在任何给定的插件通道上发送消息。你应该在注册其他事件监听器时一并完成此操作。

```java title="PluginMessagingSample.java"
public final class PluginMessagingSample extends JavaPlugin {

    @Override
    public void onEnable() {
        getServer().getMessenger().registerOutgoingPluginChannel(this, "BungeeCord");
        // 巴拉巴拉巴拉……
    }

}
```

现在我们已经注册了，可以在 `BungeeCord` 通道上发送消息了。

插件消息以字节数组的形式格式化，
可以通过 [`Player`](jd:paper:org.bukkit.entity.Player) 对象上的 [`sendPluginMessage`](jd:paper:org.bukkit.plugin.messaging.PluginMessageRecipient#sendPluginMessage(org.bukkit.plugin.Plugin,java.lang.String,byte[])) 方法发送。
我们来看一个向 `BungeeCord` 通道发送插件消息以将玩家发送到另一个服务器的示例。

```java title="PluginMessagingSample.java"
public final class PluginMessagingSample extends JavaPlugin implements Listener {

    @Override
    public void onEnable() {
        getServer().getPluginManager().registerEvents(this, this);
        getServer().getMessenger().registerOutgoingPluginChannel(this, "BungeeCord");
    }

    @EventHandler
    public void onPlayerJump(PlayerJumpEvent event) {
        Player player = event.getPlayer();

        ByteArrayDataOutput out = ByteStreams.newDataOutput();
        out.writeUTF("Connect");
        out.writeUTF("hub2");
        player.sendPluginMessage(this, "BungeeCord", out.toByteArray());
    }

}
```

:::tip[提示]

这些通道依赖于 Minecraft 协议，
并作为一种称为 [Plugin Message](https://minecraft.wiki/w/Minecraft_Wiki:Projects/wiki.vg_merge/Plugin_channels) 的特殊类型的数据包发送。
它们依赖于玩家连接，因此如果没有玩家连接到服务器，服务器将无法发送或接收插件消息。

:::

### 我们刚刚做了什么？

我们在 `BungeeCord` 通道上发送了一条插件消息！我们发送的消息是一个字节数组，其中包含两个转换为字节的字符串：`Connect` 和 `hub2`。

我们的代理服务器通过触发我们 Java 服务器上的 [`PlayerJumpEvent`](jd:paper:com.destroystokyo.paper.event.player.PlayerJumpEvent) 的玩家接收到了该消息。
随后，它识别出该通道属于自身，并按照 BungeeCord 的协议，将我们的玩家发送到了 `hub2` 服务器。

对于 BungeeCord，我们可以将这条消息视为一个区分大小写的命令及其参数。
在这里，我们的命令是 `Connect`，唯一的参数是 `hub2`，但有些“命令”可能会有多个参数。
对于由客户端模组引入的其他通道，请参阅它们的文档以更好地了解如何格式化消息。

### 插件消息类型

尽管我们向代理发送了 `Connect` 消息，
但 BungeeCord 兼容的代理还会对以下几种情况进行处理：

| 消息类型              | 描述              | 参数                          | 响应                    |
|:------------------|:----------------|:----------------------------|:----------------------|
| `Connect`         | 将玩家连接到指定的服务器。   | `服务器名称`                     | 无                     |
| `ConnectOther`    | 将其他玩家连接到指定的服务器。 | `玩家名称`, `服务器名称`             | 无                     |
| `IP`              | 返回玩家的 IP 地址。    | 无                           | `IP`, `端口`            |
| `IPOther`         | 返回指定玩家的 IP 地址。  | `玩家名称`                      | `玩家名称`, `IP`, `端口`    |
| `PlayerCount`     | 返回指定服务器上的玩家数量。  | `服务器名称`                     | `服务器名称`, `玩家数量`       |
| `PlayerList`      | 返回指定服务器上的玩家列表。  | `服务器名称`                     | `服务器名称`, `玩家列表（逗号分隔）` |
| `GetServers`      | 返回所有服务器的列表。     | 无                           | `服务器列表（逗号分隔）`         |
| `Message`         | 向指定玩家发送消息。      | `玩家名称`, `消息`                | 无                     |
| `MessageRaw`      | 向指定玩家发送原始聊天组件。  | `玩家名称`, `JSON 聊天组件`         | 无                     |
| `GetServer`       | 返回玩家当前连接的服务器。   | 无                           | `服务器名称`               |
| `GetPlayerServer` | 返回指定玩家所在的服务器名称。 | `玩家名称`                      | `玩家名称`, `服务器名称`       |
| `UUID`            | 返回玩家的 UUID。     | 无                           | `UUID`                |
| `UUIDOther`       | 返回指定玩家的 UUID。   | `玩家名称`                      | `玩家名称`, `UUID`        |
| `ServerIp`        | 返回指定服务器的 IP 地址。 | `服务器名称`                     | `服务器名称`, `IP`, `端口`   |
| `KickPlayer`      | 将指定玩家踢出服务器。     | `玩家名称`, `原因`                | 无                     |
| `KickPlayerRaw`   | 将指定玩家踢出服务器。     | `玩家名称`, `JSON 聊天组件`         | 无                     |
| `Forward`         | 将插件消息转发到另一个服务器。 | `服务器`, `子通道`, `消息大小`, `消息`  | `子通道`, `消息大小`, `消息`   |
| `ForwardToPlayer` | 将插件消息转发到另一个玩家。  | `玩家名称`, `子通道`, `消息大小`, `消息` | `子通道`, `消息大小`, `消息`   |

#### `PlayerCount`

```java title="MyPlugin.java"
public class MyPlugin extends JavaPlugin implements PluginMessageListener {

    @Override
    public void onEnable() {
        this.getServer().getMessenger().registerOutgoingPluginChannel(this, "BungeeCord");
        this.getServer().getMessenger().registerIncomingPluginChannel(this, "BungeeCord", this);

        Player player = ...;
        ByteArrayDataOutput out = ByteStreams.newDataOutput();
        out.writeUTF("PlayerCount");
        out.writeUTF("lobby");
        player.sendPluginMessage(this, "BungeeCord", out.toByteArray());
        // 响应将在 `onPluginMessageReceived` 中处理。
    }

    @Override
    public void onPluginMessageReceived(String channel, Player player, byte[] message) {
        if (!channel.equals("BungeeCord")) {
            return;
        }
        ByteArrayDataInput in = ByteStreams.newDataInput(message);
        String subchannel = in.readUTF();
        if (subchannel.equals("PlayerCount")) {
            // 这是对 `PlayerCount` 请求的响应
            String server = in.readUTF();
            int playerCount = in.readInt();
        }
    }
}
```

#### `Forward`

```java title="MyPlugin.java"
public class MyPlugin extends JavaPlugin implements PluginMessageListener {

    @Override
    public void onEnable() {
        this.getServer().getMessenger().registerOutgoingPluginChannel(this, "BungeeCord");
        this.getServer().getMessenger().registerIncomingPluginChannel(this, "BungeeCord", this);

        Player player = ...;
        ByteArrayDataOutput out = ByteStreams.newDataOutput();
        out.writeUTF("Forward");
        out.writeUTF("ALL"); // 这是目标服务器。`"ALL"` 会向除了发送消息的服务器之外的所有服务器发送消息
        out.writeUTF("SecretInternalChannel"); // 这是通道。

        ByteArrayOutputStream msgbytes = new ByteArrayOutputStream();
        DataOutputStream msgout = new DataOutputStream(msgbytes);
        msgout.writeUTF("Paper is the meaning of life"); // 你可以对 `msgout` 进行任何操作
        msgout.writeShort(42); // 写一个随机的短整数

        out.writeShort(msgbytes.toByteArray().length); // 这是长度。
        out.write(msgbytes.toByteArray()); // 这是消息。

        player.sendPluginMessage(this, "BungeeCord", out.toByteArray());
        // 响应将在 `onPluginMessageReceived` 中处理。
    }

    @Override
    public void onPluginMessageReceived(String channel, Player player, byte[] message) {
        if (!channel.equals("BungeeCord")) {
            return;
        }
        ByteArrayDataInput in = ByteStreams.newDataInput(message);
        String subchannel = in.readUTF();
        if (subchannel.equals("SecretInternalChannel")) {
            short len = in.readShort();
            byte[] msgbytes = new byte[len];
            in.readFully(msgbytes);

            DataInputStream msgIn = new DataInputStream(new ByteArrayInputStream(msgbytes));
            String secretMessage = msgIn.readUTF(); // 以你写入数据的相同方式读取数据
            short meaningofLife = msgIn.readShort();
        }
    }
}
```

这条消息用于将插件消息转发到另一个服务器。这在代理网络中的服务器到服务器通信中非常有用。
例如，如果某个玩家在一个服务器上被封禁，你可以将消息转发到所有其他服务器，以便在那里也封禁他们。

:::caution[在所有服务器上封禁玩家的示例]

这不是推荐的封禁玩家的方式，因为目标服务器上可能没有在线玩家，
但它是一个如何使用此功能的示例。

:::

#### `MessageRaw`

`MessageRaw` 消息类型用于向玩家发送原始聊天组件。
目标玩家由第二个参数指定——玩家名称或 `"ALL"` 表示所有玩家。
这也有助于向代理网络中不同服务器上的玩家发送消息。

```java title="MyPlugin.java"
public class MyPlugin extends JavaPlugin {

    @Override
    public void onEnable() {
        this.getServer().getMessenger().registerOutgoingPluginChannel(this, "BungeeCord");

        Player player = ...;
        ByteArrayDataOutput out = ByteStreams.newDataOutput();
        out.writeUTF("MessageRaw");
        out.writeUTF("ALL");
        out.writeUTF(GsonComponentSerializer.gson().serialize(
                Component.text("Click Me!").clickEvent(ClickEvent.openUrl("https://papermc.io"))
        ));
        player.sendPluginMessage(this, "BungeeCord", out.toByteArray());
    }
}
```

这将向玩家发送一条可点击的消息，内容为“点击我！”，点击后会打开 [https://papermc.io](https://papermc.io)。
