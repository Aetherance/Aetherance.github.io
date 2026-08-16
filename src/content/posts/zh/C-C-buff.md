---
title: "小发现"
description: "这个程序居然会先sleep再打印。"
pubDate: 2025-02-11
updatedDate: 2025-03-12
lang: zh
tags: []
draft: false
---

```cpp
#include<iostream>
#include<unistd>
using namespace std;

int main() {
    cout<<"Hello World!";
    sleep(5);

    return 0;
}
```

这个程序居然会先sleep再打印。

其实是缓冲区刷新之后才会打印到屏幕上。
