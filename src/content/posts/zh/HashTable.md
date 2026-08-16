---
title: "哈希表原理及实现"
description: "哈希表通过键值(key)来查找数据(value) 通常可以以极低的时间复杂度查找数据。"
pubDate: 2025-01-25
updatedDate: 2025-01-26
lang: zh
tags: ["数据结构"]
draft: false
---

## 简介

哈希表通过键值(`key`)来查找数据(`value`) 通常可以以极低的时间复杂度查找数据。

哈希表的底层通常是支持随机访问的容器。由于键值和数据值一一对应，哈希表支持以`table[key]`的形式访问数据。

为了减少空白位置造成的空间浪费，哈希表通过哈希函数将键映射到表中的一个索引位置。 [哈希函数](https://blog.csdn.net/qq_20853741/article/details/112464621)

当两个不同的键通过哈希函数映射到相同的数组索引位置时，就会发生哈希冲突。

解决哈希冲突的常用方法：

1. 链式地址法
2. 开放定址法

链式法在哈希表的每个位置存储一个链表，冲突的元素会被插入链表。

开放定址法会在数组中找一个空位存放冲突的元素。

本文实现的哈希表使用除留余数法映射键值，使用链式地址法处理哈希冲突。

## 哈希表类的使用

通过哈希表的构造函数创建一个哈希表对象

```cpp
hashtable h1(12); // 创建一个大小为传入参数Size的哈希表
```

调用哈希表对象的成员函数`Insert`向哈希表内插入一个节点

```cpp
h1.Insert(10,25);
```

如果键值已经存在，将替换原来的值。

`GetValue()`会返回哈希表中键值(key)对应的值(value) 如果键值不存在，则返回-1

`GetKeyNode()`会返回对应键值的节点(Hnode) 如果键值不存在，返回`nullptr`

哈希表类重载了`[]`操作符，可以通过`h1[key]`的形式访问数据

哈希表类的析构函数会在对象销毁时自动释放对象开辟的内存。

## 实现

哈希表类定义

```cpp
class hashtable
{
public:
    hashtable(int);
    ~hashtable();
    Hnode* GetKeyNode(int);
    int GetValue(int);
    void Insert(int,int);
    int operator[](int);
private:
    Hnode**data;
    int HashNum;
    int Size;
    int hash(int);
};
```

哈希表构造函数实现

```cpp
hashtable::hashtable(int Size) {
    data = new Hnode*[Size]();
    HashNum = Size;
    this->Size = Size;
}
```

创建一个哈希表对象时，构造函数会根据传入的参数Size开辟底层数组data，并初始化成员变量HashNum和Size

本实现使用除留余数法实现哈希函数

```cpp
int hashtable::hash(int key) {
    return key % HashNum;
}
```

`GetKeyNode()`函数在key对应的序列中查找并返回对应key值的节点。如果没有找到，返回`nullptr`

```cpp
Hnode*hashtable::GetKeyNode(int key) {
    Hnode * target = data[hash(key)];
    if(target == nullptr) {
        return nullptr;
    }
    while (target->next!=nullptr&&target->key!=key) {
        target = target->next;
    }
    return target->key == key ? target : nullptr;
}
```

`Insert()`

```cpp
void hashtable::Insert(int key,int val) {
    Hnode * key_node;
    if(key_node = GetKeyNode(key)) {
        key_node->key = key;
        key_node->val = val;
        return;
    }
    key_node = data[hash(key)];
    Hnode * newnode = BuyNewnode(key,val);
    if(key_node==nullptr) {
        data[hash(key)] = newnode;
        return;
    }
    while (key_node->next) {
        key_node = key_node->next;
    }
    key_node->next = newnode;
}
```
