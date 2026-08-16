---
title: "简单线程池(pthread实现)"
description: "每次创建和销毁线程都会消耗一定的系统资源，且线程创建过程也有一定的开销。"
pubDate: 2025-01-18
updatedDate: 2025-02-01
lang: zh
tags: ["pthread线程 C++"]
draft: false
---

每次创建和销毁线程都会消耗一定的系统资源，且线程创建过程也有一定的开销。

线程池可以**复用**线程，提高程序的性能和效率，并且节省系统资源。

以下是一个基于`POSIX线程`,用`C++`编写的线程池实现。

[XiyouLinuxGroup Threadpool Plan](https://plan.xiyoulinux.com/plan/simple-thread-pool-challenge/)

## 线程池类定义

```cpp
class threadpool
{
public:
    threadpool(int);
    ~threadpool();
    static void * worker(void *);
    void submit(function<void()>);
    void stop();
private:
    bool Stop;
    vector<pthread_t>threads;
    queue<function<void()>>TaskQueue;

    pthread_mutex_t mutex;
    pthread_cond_t task_cond;

    pthread_mutex_t mutex_wait_all;
    pthread_cond_t cond_wait_all;
    int threadsActive;
};
```

## 线程池工作过程

`threadpool(int);`是线程池类的构造函数。当创建一个`threadpool`对象时，根据传入的参数`Size`创建指定数目的线程。并完成线程池条件变量和互斥量的初始化以及一些变量的初值设置。

`static void * Woker(void *);`定义了线程池的核心工作函数。由构造函数创建的线程阻塞在Worker中等待任务队列的更新，若有新任务通过`TaskSubmit()`提交，阻塞的线程会获得消息，从任务队列`front()`位置抽取任务开始工作。

所有的任务都由`TaskSubmit()`提交，提交一个任务后，该函数内部将任务放入任务队列队尾并通知没有任务的线程执行。

调用线程池析构函数或`Stop`成员函数时，线程池会先唤醒所有线程，并等待所有正在工作的线程结束，最后进行锁和条件变量的销毁。

## Worker

```cpp
void * threadpool::worker(void * this_ptr) {
    threadpool * pthis = static_cast<threadpool*>(this_ptr);
    while(true) {
        pthread_mutex_lock(&pthis->mutex);
        while(pthis->TaskQueue.empty()&&!pthis->Stop) {
            pthread_cond_wait(&pthis->task_cond,&pthis->mutex);
        }

        if(pthis->Stop&&pthis->TaskQueue.empty()) {
            printf("Thread %ld exited\n",pthread_self());
            pthread_mutex_unlock(&pthis->mutex);
            return nullptr;
        }
        function<void()>task = pthis->TaskQueue.front();
        pthis->TaskQueue.pop();
        pthis->threadsActive ++;
        pthread_mutex_unlock(&pthis->mutex);
        task();
        pthread_mutex_lock(&pthis->mutex);
        pthis->threadsActive --;

        if(pthis->TaskQueue.empty()&&!pthis->threadsActive)
            pthread_cond_broadcast(&pthis->cond_wait_all);
        
        pthread_mutex_unlock(&pthis->mutex);
    }
    return nullptr;
}
```

`static_cast`将`void *`类型的指针转化为`threadpool*`类型的指针并用`thispool`来接收，便于调用线程池对象中的成员函数。

最外层的`while()`循环保证了线程在执行完一个任务后继续回到`pthread_cond_wait`处等待下一个任务。

线程在`pthread_cond_wait`语句处释放互斥量并等待条件变量的改变。

如果任务队列里有任务，Worker会从任务队列里取出一个任务并用一个函数对象接收，然后执行这个函数对象

`ThreadsActive`是实现线程池等待所有线程结束的关键。每次任务结束Worker会检查是否满足线程池关闭条件(任务是否都执行完了)，如果满足则通知主线程可以Stop。

## 测试

```cpp
#include<iostream>
#include"threadpool.h"
using namespace std;

int main()
{
    threadpool pool(4);

    pool.TaskSubmit([](){
        cout<<"TASK A"<<endl;
    });

    pool.TaskSubmit([](){
        cout<<"TASK B"<<endl;
    });

    pool.TaskSubmit([](){
        cout<<"TASK C"<<endl;
    });

    pool.TaskSubmit([](){
        cout<<"TASK D"<<endl;
    });

    pool.TaskSubmit([](){
        cout<<"TASK E"<<endl;
    });

    pool.Stop();

    return 0;
}
```

结果

```sh
TASK A
TASK B
TASK C
TASK D
TASK E
```

用线程池处理阶乘计算任务

```cpp
#include<iostream>
#include"threadpool"
#include<sstream>
#include<chrono>
#include <boost/multiprecision/cpp_int.hpp> // 采用boost库处理大数
using namespace std;
using namespace boost::multiprecision;
using namespace chrono;

// 祖传代码
cpp_int c(int n)
{
    if (n == 1)
    {
        return 1;
    }
    return n * c(n - 1);
}

void Task(int n) {
    ostringstream oss;
    oss<<c(n);  // 将计算结果输入流oss
    char * result = new char[204800]; 
    strcpy(result,oss.str().c_str()); //转换成C形式 便于用printf打印
    // 为什么要用printf打印 
    // printf打印时会将格式化后的整体一起打印
    // 而cout会将要打印的内容放入缓冲区 如果缓冲区满了 会先打印一部分
    // 所以多线程使用cout打印会出现打印混乱的情况

    printf("%d 的阶乘是 \n %s\n\n",n,result);
    delete[] result;
}

int main()
{
    auto start = high_resolution_clock::now();
    threadpool pool(24);

    
    for(int i = 1;i<=1000;i++) {
        pool.submit([i]() {
            Task(i);
        });
    }

    pool.stop();
    auto end = high_resolution_clock::now();
    auto mstime = duration_cast<microseconds>(end - start);
    auto stime = duration_cast<seconds>(end - start);
    cout<<"共用时 "<<mstime.count()<<" ms"<<endl;
    cout<<"约 "<<stime.count()<<" s"<<endl;
    
    return 0;
}
```

[GITHUB](https://github.com/Aetherance/Thread/tree/master/pthread_pool/TaskA)

## 补充

`Stop()`中等待条件变量的`while()`退出条件一定同时要满足**任务队列为空**和**当前无任务进行**，否则有可能漏掉一些任务。

2月1日再编:

2月1日重构了线程池，改进了线程池的结构，修复了偶尔会触发的死锁
