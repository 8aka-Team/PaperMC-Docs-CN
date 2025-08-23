---
title: 使用数据库
description: 数据库是存储大量数据的推荐方式。本指南概述了一些关键细节
slug: paper/dev/using-databases
---

当你在插件中存储大量数据时，我们推荐使用数据库。本指南将引导你完成启动过程。

## 什么是数据库？

数据库是存储在计算机系统上的电子信息集合。
有许多不同类型的数据库，主要分为 SQL 和 NoSQL 两大类。

### NoSQL vs SQL

NoSQL（Not Only SQL）数据库是一种与传统关系型数据库模型不同的数据库管理系统。
与传统 SQL 数据库（将数据存储在具有预定义模式的结构化表中）
不同，NoSQL 数据库是无模式的，并提供灵活的数据模型。

它们被设计用来处理大量非结构化或半结构化的数据。
NoSQL 数据库使用各种数据模型，
如键值对、文档、列族或图，具体取决于应用程序的具体需求。

另一方面，SQL 数据库是一种遵循关系型数据库模型的数据库管理系统。
它将数据组织成具有预定义模式的结构化表，每个表代表一个实体，列代表该实体的属性。
SQL（Structured Query Language）用于与数据库交互，
允许用户执行各种操作，如查询、插入、更新和删除数据。

## 基于文件的数据库与独立数据库

在使用数据库时，你有两种选择：基于文件的数据库和独立数据库。
基于文件的数据库存储在磁盘上的一个文件中，通常用于较小的数据库。独立数据库在单独的进程中运行，通常用于较大的数据模型。

### 基于文件的数据库

基于文件的数据库都存储在磁盘上的一个文件中。它们通常用于较小的数据库，因为它们更容易设置和使用。
你可以从插件代码中创建和处理它们，但它们的性能不如独立数据库。
`SQLite` 和 `H2` 是基于文件的数据库的一些例子。

<details>
  <summary>简单的 SQLite 设置</summary>

#### SQLite

要使用 SQLite，你需要一个驱动程序来连接/初始化数据库。

:::note[注意]

JDBC 驱动程序已包含在 Paper 中，因此你无需在插件中包含/重新定位它。

:::

##### 使用方法

你必须调用驱动程序的 [`Class#forName(String)`](jd:java:java.lang.Class#forName(java.lang.String))
来允许它初始化，然后创建与数据库的连接：

```java title="DatabaseManager.java"
public class DatabaseManager {

  public void connect() {
    Class.forName("org.sqlite.JDBC");
    Connection connection = DriverManager.getConnection("jdbc:sqlite:plugins/TestPlugin/database.db");
  }
}
```

然后你可以获取一个 [`Connection`](jd:java:java.sql:java.sql.Connection) 对象，
你可以使用它来创建一个 [`Statement`](jd:java:java.sql:java.sql.Statement) 并执行 SQL 查询。
有关 Java 数据库连接 API 的更多信息，请参阅 [这里](https://www.baeldung.com/java-jdbc)。

</details>

### 独立数据库

如前所述，独立数据库在单独的进程中运行。
它们的设置和使用更复杂，但性能优于基于文件的数据库。
`MySQL`、`MariaDB` 和 `PostgreSQL` 是一些独立数据库的例子。
还有很多其他选择，但这些是比较流行的。每种数据库都有其自身的优缺点，因此需要你自行决定使用哪一种。

这些数据库的连接器通常具有连接池功能。
数据库连接池是指创建一个预先建立且可重复使用的数据库连接池。
应用程序在需要执行数据库操作时，可以从连接池中请求一个连接，
使用该连接完成所需任务，然后将其返回到连接池中以供后续重复使用。
这显著减少了反复创建和关闭连接的开销，从而提高了应用程序的性能和可扩展性。

<details>
  <summary>简单的 MySQL 设置</summary>

#### MySQL

使用 MySQL 需要一些额外的步骤，但它可以为具有许多表和并发访问的大型数据库提供性能优势。
以下是一个简短的指南，介绍如何将 [Hikari](https://github.com/brettwooldridge/HikariCP) 库与 MySQL 一起使用。

:::note[注意]

这需要一个正在运行的 MySQL 数据库来连接。

:::

首先，使用以下依赖项将依赖项添加到你的项目中：

##### Maven
```xml
<dependency>
  <groupId>com.zaxxer</groupId>
  <artifactId>HikariCP</artifactId>
  <version>4.0.3</version>
  <scope>compile</scope>
</dependency>
```

##### Gradle
```kotlin
dependencies {
  implementation("com.zaxxer:HikariCP:4.0.3")
}
```

:::caution[危险]

Hikari库没有与Paper一起打包，因此你需要对其进行遮蔽（shade）或重定位（relocate）。
在Gradle中，你需要使用[Shadow插件](https://gradleup.com/shadow/)。
或者，你可以使用库加载器在运行时加载你的Paper插件中的库。有关如何使用此功能的更多信息，请参阅[这里](/paper/dev/getting-started/paper-plugins#loaders)。

:::

##### 使用方法

添加依赖项后，我们可以在代码中使用连接器：

```java title="DatabaseManager.java"
public class DatabaseManager {

  public void connect() {
    HikariConfig config = new HikariConfig();
    config.setJdbcUrl("jdbc:mysql://localhost:3306/mydatabase"); // 正在运行的 MySQL 数据库的地址
    config.setUsername("username"); // 用户名
    config.setPassword("password"); // 密码
    config.setMaximumPoolSize(10); // 连接池大小默认为 10

    config.addDataSourceProperty("", ""); // 要添加的其他设置
    HikariDataSource dataSource = new HikariDataSource(config);

    try (Connection connection = dataSource.getConnection()) {
      // 使用 try-with-resources 来自动关闭连接。
      PreparedStatement sql = connection.prepareStatement("SQL");
      // 执行语句
    } catch (Exception e) {
      // 处理从获取/处理异常中产生的任何异常。
    }
  }
}
```

</details>

## 安全性

### SQL 注入

SQL 注入是一种恶意技术，攻击者利用不当的输入验证来执行未经授权的 SQL 命令，
可能会导致数据泄露或对数据库造成损害。

例如，考虑以下代码：

```java
public void login(String username, String password) {
    String sql = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'";
    // 执行 SQL
}
```

如果用户输入以下内容作为用户名：

```
' OR 1=1; --
```

SQL 语句将变为：

```sql
SELECT * FROM users WHERE username = '' OR 1=1; -- AND password = '密码'
```

这将返回数据库中的所有用户，而不管他们输入的密码是什么。
这是一个简单的例子，但它可以用来做更恶意的事情，比如删除整个数据库或窃取用户数据。

### 预编译语句

在 Java 中使用带有占位符的预编译语句（`PreparedStatement`）可以有效防止 SQL 注入。
它们通过将 SQL 代码与用户输入分离，降低了执行意外 SQL 命令的风险。
**始终**使用预编译语句，以确保数据的安全性和完整性。
有关 SQL 注入的更多信息，请参阅 [这里](https://www.baeldung.com/sql-injection)。
