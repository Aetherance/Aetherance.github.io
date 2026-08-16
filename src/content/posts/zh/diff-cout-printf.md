---
title: "cout和printf差异"
description: "在并发程序中调用cout和printf()时可以发现它们的微小差异"
pubDate: 2025-02-01
updatedDate: 2025-02-03
lang: zh
tags: []
draft: false
---

在并发程序中调用`cout`和`printf()`时可以发现它们的微小差异

多个线程同时打印时,`cout`的打印通常是混乱的，而`printf()`的打印总是完整的

例如:并发打印以下内容

```text
This is Task A
Here is Task B
```

cout可能会打印成这样

```text
ThiHere is is Ta Task Bsk A
```

而printf()总是完整地打印

```text
This is Task A
Here is Task B
```

**C++cout是基于流(Stream)实现的**

C++最常用的头文件`<iostream>`定义了`ostream`和`istream`两个流,cout是`ostream`流的全局对象

cout内部具有缓冲机制，要输出至标准输出的数据先写入cout对象内部的缓冲区，当缓冲区满时或手动刷新时会输出。

cout默认为行缓冲，`endl`也会使缓冲区清空，这个行为也会消耗一定的性能。

基于其特性，`cout`并不是一次性将所有内容输出完的，所以不适合在并发输出环境使用。并且这个因素也会使cout的性能有所降低。

`printf()`会将处理后的字符串一起打印到屏幕上，不会出现混乱。

在Linux/Unix系统，`cout`和`printf()`都是通过`write()`将数据写入`STDOUT_FILENO`来实现输出效果的。
