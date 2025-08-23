---
title: 迁移指南
description: 如何在不同版本的 Velocity 之间迁移代理
slug: velocity/migration
---

你是 Velocity 的新手，还是正要升级到 Velocity 的新版本？
本页面将简要介绍成功迁移需要注意的事项。

## 从 Velocity 1.0.x 迁移到 Velocity 1.1.0

从 Velocity 1.0.x 迁移到 Velocity 1.1.0 应该只需替换 Velocity JAR 文件并重启代理即可。
你可能需要备份你的 `velocity.toml` 文件，然后删除当前的 `velocity.toml` 文件，
让 Velocity 重新生成它，以添加 Velocity 1.1.0 引入的新设置。
