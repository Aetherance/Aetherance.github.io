---
title: "C++智能指针"
description: "C++提供了以下几种智能指针"
pubDate: 2025-03-11
lang: zh
tags: ["C++"]
draft: false
---

## 前言

C++提供了以下几种智能指针

1. unique\_ptr
2. shared\_ptr
3. weak\_ptr
4. auto\_ptr

其中`auto_ptr`由于过于抽象已被弃用，所以本文只讨论前三种智能指针。

## unique\_ptr

`unique_ptr`遵循`独占所有权`语义。被`unique_ptr`持有的资源不能同时被其他任何`unique_ptr`持有,也不应被其他任何智能指针持有。

### 初始化

`unique_ptr`大致有以下几种初始化方式。

- 直接使用构造函数
- 使用
  
  make\_unique
- 通过移动语义转移所有权
- 初始化为空

对于动态开辟的数组，`unique_ptr`应当使用`T[]`模板，以便编译器调用`delete[]`作为删除器。或者，也可以自定义一个删除器。

删除器可以是函数指针，对象或lambda表达式。删除器的类型需要函数模板参数传入。

```cpp
auto deleter = [](int * obj){
    delete[] obj;
}；
unique_ptr<int[],decltype(deleter)>ptr(new int[10],deleter); // decltype可推断出deleter的类型。
```

### 独占所有权

`unique_ptr`的拷贝构造函数和赋值运算符被显式删除。因此`unique_ptr`无法被复制而产生一个新的实例。这使`unique_ptr`的所有权不会被分离到两个`unique_ptr`实例。

`unique_ptr`可以通过`移动语义`来转移自身持有的资源。

```cpp
// 将一个unique_ptr的资源转移到另一个unique_ptr

unique_ptr<string>ptr1 = make_unique<string>(str);
unique_ptr<string>ptr2 = move(ptr1);
```

## shared\_ptr

### 初始化

`shared_ptr`的初始化与`unique_ptr`类似，但是也有所不同。

- 与
  
  unique\_ptr
  
  类似，
  
  shared\_ptr
  
  可以使用
  
  make\_shared
  
  初始化，这也是较安全的初始化方式。
- shared\_ptr
  
  允许拷贝操作，这同时也会增加
  
  shared\_ptr
  
  内部的引用计数器。
- 使用移动语义可以将
  
  unique\_ptr
  
  的资源转移至
  
  shared\_ptr
  
  。

### 共享资源机制

多个`shared_ptr`可以指向同一个对象。

`shared_ptr`内部维护了一个线程安全的计数器，其代表了`shared_ptr`指向的对象被不同`shared_ptr`实例引用的次数。

当该计数器归零时，`shared_ptr`指向的对象将被销毁，同时，对象的析构函数也会被调用。

虽然`shared_ptr`的引用计数是线程安全的，然而，对被`shared_ptr`管理的对象的操作却不是线程安全的。在多线程环境下操作`shared_ptr`管理的对象时，需要额外的同步机制。

`shared_ptr`可以指定释放资源的方式，自定义删除方法。

每个`shared_ptr`会创建一个`控制块`，包括引用计数，弱引用计数，删除器和分配器。首次创建`shared_ptr`时，该控制块会被创建。

### 控制块

控制块的内存和对象的内存同时开辟，并且为一次分配。这减少了内存开辟的次数，提高了效率。

内存块的引用计数是原子操作，保证线程安全。

只有在弱引用归0时，控制块的内存才会被释放。所以，对象和控制块的构造一定是同时的，但销毁不一定是同时的

### 风险

`shared_ptr`使用不当会导致`循环引用`，即对象的成员变量`shared_ptr`引用了对象。这导致在对象析构之前，对象的`shared_ptr`成员变量会一直指向`shared_ptr`实例，等待对象析构，然而，对象析构的条件是没有一个`shared_ptr`实例指向该对象。最终对象和`shared_ptr`实例会陷入一种类似死锁的”僵持”，最终内存无法释放，导致内存泄露。

```cpp
// 两个类对象间的循环引用
class B;

class A {
public:
    shared_ptr<B>ptr;
};

class B {
public:
    shared_ptr<A>ptr;
};

int main() {
    shared_ptr<A>ptr2 = make_shared<A>();
    shared_ptr<B>ptr1 = make_shared<B>();
    
    ptr2->ptr = ptr1;
    ptr1->ptr = ptr2;
    
    return 0;
}
```

将其中一个类内的`shared_ptr`改为`weak_ptr`可以解决这个问题。

## weak\_ptr

`weak_ptr`可以观察`shared_ptr`管理的资源，却不会增加引用计数，因此，`weak_ptr`可以解决循环引用的问题。

### 初始化

```cpp
auto shared = std::make_shared<int>(42);
std::weak_ptr<int> weak1(shared);        // 从 shared_ptr 构造
std::weak_ptr<int> weak2(weak1);         // 从另一个 weak_ptr 拷贝构造
```

`weak_ptr`可以从`shared_ptr`构造，也可以从另一个`weak_ptr`拷贝。

### 成员函数

`expired()`: 用于检查资源是否已被释放，如果已释放，返回`true`。

`lock()`: 会返回一个`shared_ptr`，只有通过这个`shared_ptr`，`weak_ptr`才可以操作观察的资源。

`use_count()`: 返回强引用计数。

## 应用

利用C++提供的智能指针，我们可以刚好地管理程序内的各种资源。

例如，线程池可以用`unique_ptr`管理，以确保程序中线程池实例独一无二。

在多线程环境下，使用`shared_ptr`也可以妥善管理那些全局共享的对象，以确保该对象不会在被使用时已经是被销毁的了。
