---
title: "pthread_notes"
description: "与传统函数返回-1代表失败不同的是，所有的Pthreads函数都是返回正值表示失败。"
pubDate: 2025-01-07
updatedDate: 2025-01-14
lang: zh
tags: ["Linux系统编程"]
draft: false
---

## 线程学习笔记

## 为什么要使用线程

1. 线程之间共享全局区和堆内存，这使线程之间的信息共享较进程之间更为方便，代价更小。
2. 创建进程时使用的系统调用
   
   fork()
   
   代价高，创建线程使用的系统调用
   
   clone()
   
   比
   
   fork()
   
   通常快10倍不止。

## 线程共享的属性

1. 全局内存
2. 进程ID 父进程ID
3. 进程组ID与会话ID
4. 控制终端
5. 打开的文件描述符
6. 信号处置
7. 某些时候的栈 (?)
8. …
   
   每个线程都有存放局部变量的私有栈。

## Pthreads函数返回值

与传统函数返回-1代表失败不同的是，所有的Pthreads函数都是返回正值表示失败。

## 创建线程

程序启动时，一个进程中只有一条称为*主线程*的线程。

调用`pthread_create()`将创建一个线程。

`pthread_create()`的第一个参数是一个指向`pthread_t`类型的指针,线程ID将被写入该类型中

第二个参数是一个 const pthread \_attr\_t类型的指针 用于定制不同的线程属性，通常直接设为`NULL`

第三个参数是一个函数指针，指向线程的start函数。线程从此函数开始运行。

第四个函数是一个指向start函数参数的指针。

## 终止线程

- 主线程调用
  
  main
  
  函数中的
  
  return
  
  语句会终止所有线程
- 任意线程调用
  
  exit()
  
  语句会终止所有线程
- 线程执行
  
  start
  
  函数的
  
  return
  
  语句只会终止调用的线程自身
- 线程调用
  
  pthread\_exit()
  
  语句
  
  只
  
  会终止调用的线程自身，不论这个线进程是不是主线程
- 调用
  
  pthread\_cancle()
  
  取消线程

## 线程ID

在pthread函数中,线程ID由`pthread_t`定义。

`pthread_t`是一种*不透明数据类型* 在Linux实现中,pthread\_t是无符号长整形,而在其他实现中有可能是指针或者结构体。

因此，对于pthread\_t的比较，应该使用pthread\_equal函数而不是C语言中的`==`等操作符。

## join线程

函数`pthread_join`会等待一个线程，直至其终止。线程终止时会立即返回。这种操作被称为*连接*

若函数`pthread_join`的第二个参数`retval`为一非空指针，将会保存线程终止时返回值的拷贝。即保存了线程调用`return`或`pthread_exit`时所指定的值

向函数`pthread_join`传入已经join过的线程id的结果未知

调用`pthread_join`的线程会阻塞，直到对应线程执行完毕 相当于对进程使用`wait()`系统调用 不同的是，`wait()`只能由父进程调用

为了防止线程成为`僵尸线程`，一定要对其进行join操作

## 分离线程

线程具有可连接和已分离两个状态。调用`pthread_detach()`可以使线程分离，即使其不可连接。

线程一旦处于分离状态，便不能再调用join来与其连接，也不能再重使其返回可连接状态。`pthread_detach()`的调用是不可逆的。

不论线程是否已分离，调用`exit()`或主进程执行`return`时，所有线程都会立即终止。

## 线程属性

利用`pthread_create()`的第二个参数可以设置线程的属性。

## 互斥量

为了防止两个线程同时对某一共享资源进行修改，或者同时对其进行读写操作，要使用互斥量来确保同时只有一个线程访问共享资源。

例如，对于一个线程AB都可访问的全局变量，线程A在访问时将其‘锁’住，可以防止B访问，减少错误的发生。  
果父线程没有调用 pthread\_join()，该线程的资源仍然不会被完全回收，这可能导致僵

```cpp
pthread_mutex_t mtx;
pthread_mutex_init(&mtx,NULL);  // 动态初始化
```

`pthread_mutex_lock()`会尝试获取一个互斥量，如果该互斥量已被其他线程锁定，本线程会阻塞等待，直到对应线程对互斥量解锁。`pthread_mutex_trylock()`与之类似，不同的是`trylock`在互斥量已被锁定的情况下不会等待，而是返回一个错误码`EBUSY`

`pthread_mutex_unlock()`会对已锁定的互斥量解锁。不要忘记解锁互斥量，也不要对一个没有锁定的互斥量解锁。

静态初始化的互斥量总为`默认属性` 而动态初始化的互斥量可以被定义为其他属性

调用`pthread_mutex_init()`来动态初始化一个互斥量,动态初始化的互斥量应该最终被调用的```pthread_mutex_destroy()``销毁```

应该对所有可能进入临界区的线程使用互斥量，以保证临界区内的线程操作是线程安全的。

同一线程不应对普通互斥量加锁两次。

设定了`PTHREAD_MUTEX_RECURSIVE`属性的互斥量是`递归互斥量`，可以多次加锁。但是也必须解对应次数的锁才能被另一线程获取。否则，将导致“死锁”。

互斥量确保只有一个线程可以进入临界区

## 条件变量

互斥量防止多个线程同时访问同一共享变量。而条件变量可以使线程阻塞(等待)直到某一条件的改变。

条件变量的类型是`pthread_t` 条件变量的初始化与互斥量类似。条件变量要和互斥量一起使用。

### 等待条件变量

`pthread_cond_wait()`函数使调用的线程等待，直到对应条件变量改变。

`pthread_cond_wait()`的调用应处于锁和解锁之间。 `pthread_cond_wait()`传入的互斥量在该函数调用之前一定是已经被锁定的，否则可能会产生错误。

必须由一个循环语句来控制`pthread_cond_wait()`的调用，因为可能存在`假唤醒` 即线程被唤醒的时候条件未改变，所以应该一直检测

### 通知条件变量

`pthread_cond_signal()`和`pthread_cond_broadcast()`都可以通知条件变量使之状态改变。

两者的区别是：前者将随机唤醒至少一条线程，而后者会唤醒所有的线程。

## 线程安全和每线程存储

线程安全函数 即能在多线程调用时保证线程安全的函数。

### 可重入和不可重入函数

由于互斥量的加锁和解锁也具有一定开销，所以使用临界区实现线程安全的效率并不高。所以可重入函数的使用具有一定意义。

可重入函数不访问全局或静态变量，其信息都存在调用者分配的缓冲区里。然而，不是所有函数都可改写为可重入函数。

例如 `malloc()`类函数必须访问全局变量。它的线程安全是由互斥量实现的。

一些函数会返回一个指向静态分配的缓冲区的指针，同样不可改写为可重入函数。

一些不可重入函数具有“可重入的替身”，以后缀`_r`结尾。 例如 `readdir_r()` `rand_r()` `strtok_r()`

### 一次性初始化

对于库函数，不能指望在main函数中初始化一些量，而这些量又必须且只能初始化一次。此时需要一个对任意调用线程，都只进行一次量的初始化的库函数。

`pthread_once()`就有这样的功能。

`pthread_once()`的第一个参数是指向`pthread_once_t`类型的地址`once_control`,通过`once_control`的状态可判断是否是第一次执行。

第二个参数是一个指向自定义的函数的指针。该函数无参无返。初始化的函数应该置于该函数体内。

```text
void func()
{
    // 将初始化函数置于此处
}
```

pthread\_once\_t 的变量应静态初始化。

### 线程特有数据

线程特有数据使得函数为每个调用线程都创建一个特有缓冲区，维护一份线程的副本。这个副本是长期存在的。函数可以向每个调用线程返回各自的缓冲区。

使用线程特有数据的函数会为调用线程分配单独的存储，且只在该线程初次调用时分配一次。

在同一线程的后续调用该函数时，都会获取初次调用所分配的缓冲区地址。

## 线程取消

`pthread_cancel()`会向线程发送一个取消请求，该过程中，发送信号的线程不会等待被发送信号的线程。

### 取消状态及类型

`pthread_setcancelstate()`和`pthread_setcanceltpye()`会设定标志，控制线程对线程取消的响应过程。

`pthread_setcancelstate()`和`pthread_setcanceltpye()`会将线程的取消性状态设置为第一个参数对应的值。  
线程原有的取消类型将返回到第二个参数指向的地方。

使用`fork()`创建新进程时，子进程会继承调用线程的取消性及状态。某线程调用`exec()`会将取消状态和取消类型重置为默认值。

当取消类型为`PTHREAD_CANCEL_DEFERED`时，取消请求将挂起，直到到达取消点。（延迟取消）

`pthread_testcancel()`可以产生一个取消点

线程的默认取消属性是可以取消，默认取消类型是延迟取消。

收到取消信息的启用了取消性状态并延迟取消的线程，应该由其他线程join()，否则可能变为`僵尸线程`

### 清理函数

每个线程拥有一个清理函数栈，栈中存放清理函数指针。当线程取消时，会从栈顶开始执行清理函数，当所有函数都执行完毕时，线程终止。

使用`pthread_cleanup_push()`来向栈中增加清理函数。

使用`pthread_cleanup_pop()`来删除清理函数。 该函数只有一个参数`execute` 如果其非0 那么这个清理函数一定会被执行。

`push()`与`pop()`必须同处于同一代码块({}) 才能正确执行。 **每一个push都得对应一个pop** 并且pop的时候才会执行。

调用`pthread_exit()`终止线程会导致清理函数栈中的所有函数被执行，而执行`return`语句不会。(?)

## 线程和进程

### 线程和`exec()`

任意线程调用了`exec()`函数，除调用线程以外的所有线程都会消失。既不会对线程特有数据执行解构函数，也不会执行清理函数。该线程的互斥量和条件变量都会立即消失。并且最终的线程ID是不确定的。

### 线程和`fork()`

任意线程调用了`fork()`函数，除调用线程以外的所有线程都会消失。既不会对线程特有数据执行解构函数，也不会执行清理函数。调用fork()的线程ID会被复制到新进程中。互斥量和条件变量都得以保留，然而，互斥量和条件变量的状态不会刷新，可能会引起许多问题。

可能会导致子进程的内存泄漏。

如果在fork()后马上调用exec()，可能会解决非主线程调用`fork()`导致的问题。或者，调用`pthread_atfork()`也可以解决。

## 多线程使用笔记

### create

在多线程的使用中，可能会出现主线程先结束使其他线程也终止的情况

```cpp
void* thread_func(void *)
{
    cout<<"func()调用  线程ID -> "<<pthread_self()<<endl;
    return NULL;
}
int main()
{
    thread_func(NULL);
    pthread_t ptd;
    pthread_create(&ptd,NULL,thread_func,NULL);

    return 0;
}
```

只输出了主线程的调用

需要让主线程’等待’其他线程结束。 可以使用 `pthread_join()`或让主线程sleep 使用while()等待也是可行的

```cpp
void* thread_func(void *)
{
    cout<<"func()调用  线程ID -> "<<pthread_self()<<endl;
    return NULL;
}
int main()
{
    thread_func(NULL);
    pthread_t ptd;
    pthread_create(&ptd,NULL,thread_func,NULL);
    
    pthread_join(ptd,NULL);
    //sleep(3);
    //while(1);

    return 0;
}
```

也可以调用`pthread_exit`让主线程退出，其他线程会继续运行。

```cpp
void* thread_func(void *)
{
    cout<<"func()调用  线程ID -> "<<pthread_self()<<endl;
    return NULL;
}
int main()
{
    thread_func(NULL);
    pthread_t ptd;
    pthread_create(&ptd,NULL,thread_func,NULL);   
    
    pthread_exit(0);
}
```

### join和detach

```cpp
void pthread_test()
{
    cout<<"test()调用"<<endl;
}
int main()
{
    pthread_t ptd;
    pthread_create(&ptd,NULL,(void*(*)(void*))pthread_test,NULL);
    pthread_detach(ptd);
    pthread_join(ptd,NULL);

    // pthread_exit(0);
}
```

一个已经detach的线程是无法join的

```cpp
#include<iostream>
#include<pthread.h>
using namespace std;
void pthread_test()
{
    cout<<"test()调用"<<endl;
}
int main()
{
    pthread_t ptd;
    pthread_create(&ptd,NULL,(void*(*)(void*))pthread_test,NULL);
    pthread_detach(ptd);
    pthread_join(ptd,NULL);

    // pthread_exit(0);
}
```
