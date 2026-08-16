---
title: "多线程归并排序与clock()"
description: "PLAN"
pubDate: 2025-01-08
updatedDate: 2025-01-14
lang: zh
tags: ["线程"]
draft: false
---

## 多线程排序

[PLAN](https://plan.xiyoulinux.com/project/thread/#_2)

因为归并排序本身具有“分而治之”的思想，很适合用多线程优化，因此选择归并排序。

首先定义一个vector容器`arr`来存储要排序的数据。

```cpp
vector<int>arr;
```

然后写一个最基础的归并排序

```cpp
void Merge(vector<int>&arr,int begin,int mid,int end) {
    vector<int>left(arr.begin()+begin,arr.begin()+mid+1);
    vector<int>right(arr.begin()+mid+1,arr.begin()+end+1);
    left.push_back(INT_MIN),right.push_back(INT_MIN);
    int Lindex = 0,Rindex = 0;
    for(int i = begin;i<=end;i++)    
        arr[i] = (left[Lindex]>right[Rindex]?left[Lindex++]:right[Rindex++]);
}

void MergeSort(int begin,int end) {
    if(begin==end)
        return;
    int mid = (begin + end)/2;
    MergeSort(begin,mid);
    MergeSort(mid+1,end);
    Merge(arr,begin,mid,end);
}
```

定义结构体Args用于传参

```cpp
struct Args
{
    int begin;
    int end;
};
```

将函数MergeSort改为多线程

```cpp
void MergeSort(Args* args) {
    int begin = args->begin,end = args->end;
    if(begin==end)
        return;
    int mid = (begin + end)/2;
    pthread_t ptd1,ptd2;

    Args Largs = {begin,mid},Rargs = {mid+1,end};
    pthread_create(&ptd1,NULL,(void*(*)(void*))MergeSort,&Largs);
    pthread_create(&ptd2,NULL,(void*(*)(void*))MergeSort,&Rargs);

    pthread_join(ptd1,NULL);
    pthread_join(ptd2,NULL);
    Merge(arr,begin,mid,end);
}
```

`DataGenerate()`函数负责随机数的生成。

```cpp
void DataGenerate()
{
    srand((size_t)time(NULL));
    for(int i = 0;i<1000000;i++)
        arr.push_back(rand());
}
```

并不是线程越多排序速度越快，并且创建过多线程会导致段错误，所以需要对线程的数目加以限制。  
只有数据量大的时候需要创建新线程。当数据量已经较小，采用普通递归。

```cpp
if (end - begin <= DataSize/1000) {
        Args Larg = Args{begin, mid};
        Args Rarg = Args{mid + 1, end};

        MergeSort(&Larg);
        MergeSort(&Rarg);
        Merge(arr, begin, mid, end);

        return;
    }
```

使用C++`chrono`库验证

结果(数据量1千万)

```text
单4.19649s
多0.568866s
```

多线程排序显著快于单线程排序。

注：`clock()`不能准确记录多线程排序的耗时。

```cpp
单线程->4070385<-
多线程->5175620<-   // clock_t 记录的时间
```

## clock()的本质

clock()是`the CPU time used so far`即占用的CPU时间

而多线程程序中多个线程同时运行时，每个线程占用的CPU时间都会被记录。并且线程的创建等也会占用CPU时间，因此clock()返回的时间多线程必定大于单线程。
