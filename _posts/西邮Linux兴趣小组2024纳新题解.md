---
layout:     post
title:      西邮Linux兴趣小组2024纳新题
subtitle:   
date:       2024-10-26
author:     Otone
header-img: img/post-10-26-1.jpg
catalog: true
tags:
    - 西邮Linux兴趣小组2024纳新题
---
 # 西邮Linux兴趣小组2024纳新题
* 本题目只作为西邮 Linux 兴趣小组 2024 纳新面试的有限参考。
* 为节省版面，本试题的程序源码省去了 #include 指令。
* 本试题中的程序源码仅用于考察 C 语言基础，不应当作为 C 语言「代码风格」的范例。
* 所有题目编译并运行于 x86_64 GNU/Linux 环境。
## 0. 聪明的吗喽
>一个小猴子边上有 100 根香蕉，它要走过 50 米才能到家，每次它最多搬 50 根香蕉，（多了就拿不动了），它每走 1 米就要吃掉一根，请问它最多能把多少根香蕉搬到家里。
>（提示：他可以把香蕉放下往返走，但是必须保证它每走一米都能有香蕉吃。也可以走到 n 米时，放下一些香蕉，拿着 n 根香蕉走回去重新搬 50 根。）

刚开始应该让猴子搬既可能多的香蕉，所以让猴子先把50根香蕉搬1m，再折返回去将另外的50根香蕉搬1m。***该过程将所有的香蕉搬1m会消耗3根香蕉***。按照此过程将所有的香蕉搬16米，香蕉还剩 50 + 2 根 ，距离终点 34 米。此时先让猴子把50根香蕉搬1m（该过程会消耗1根香蕉）。无论是否回去搬运剩下的两根香蕉，最终都只剩下49根香蕉，距离终点33米。
猴子搬运1m消耗1根香蕉，到达终点时剩下49 - 33 = `16`根香蕉。
## 1. 西邮Linux欢迎你啊
>请解释以下代码的运行结果。
```c
int main() {
    unsigned int a = 2024;
    for (; a >= 0; a--)
        printf("%d\n", printf("Hi guys! Join Linux - 2%d", printf("")));
    return 0;
}
```
本题主要考察了unsigned int类型和printf函数
>无符号整型（unsigned int）的取值范围是从0到2^32 - 1，即0到4294967295。

由于[无符号整型](https://blog.csdn.net/m0_64144913/article/details/127133929?fromshare=blogdetail&sharetype=blogdetail&sharerId=127133929&sharerefer=PC&sharesource=weixin_74355874&sharefrom=from_link "unsigned int")变量a只能表示0和正整数，且for循环的判断条件为 ***a>=0*** 所以printf语句会无限循环执行。 

printf函数的返回值为**成功打印的字符数**。
本段代码先执行最内层的printf函数 成功打印了0个字节 因此返回 ***0***。
返回的 0 又作为中间层printf函数的参数，打印出 `Hi guys! Join Linux - 20`
同时返回成功打印的字符数***24***。
最后，最外层的printf打印出`24`。

故代码的运行结果为 
```c
Hi guys! Join Linux - 2024
Hi guys! Join Linux - 2024
...
```
## 2. 眼见不一定为实
>输出为什么和想象中不太一样？
>你了解 sizeof() 和 strlen() 吗？他们的区别是什么？
```c

int main() {
    char p0[] = "I love Linux";
    const char *p1 = "I love Linux\0Group";
    char p2[] = "I love Linux\0";
    printf("%d\n%d\n", strcmp(p0, p1), strcmp(p0, p2));
    printf("%d\n%d\n", sizeof(p0) == sizeof(p1), strlen(p0) == strlen(p1));
    return 0;
}
```
>`sizeof()`所计算出的是变量的大小 以字节为单位
>`strlen()`所计算出的是字符串的长度 遇到'\0'时结束 不包含'\0'
`strcmp()`函数用于比较两个以'\0'结束的字符串 如果相同则返回 ***0***     

p1和p0相同,p1和p2相同,`strcmp()`返回 ***0***,所以第一个printf打印出
```c
0 0
```
sizeof(p0)不等于sizeof(p1) 因此 `sizeof(p0) == sizeof(p1)`为假 返回 ***0***
strlen(p0)等于strlen(p1) 因此 `strlen(p0) == strlen(p1)`为真 返回 ***1***
所以最终的打印结果为
```c
0 0 0 1
```
## 3. 1.1 - 1.0 != 0.1
>为什么会这样，除了下面给出的一种方法，还有什么方法可以避免这个问题？
```c
int main() {
    float a = 1.0, b = 1.1, ex = 0.1;
    printf("b - a == ex is %s\n", (b - a == ex) ? "true" : "false");
    int A = a * 10, B = b * 10, EX = ex * 10;
    printf("B - A == EX is %s\n", (B - A == EX) ? "true" : "false");
}
```
计算机存储浮点数时，会将其转换为**二进制**进行存储，转换一些小数时，会超出float能够存储的位数，造成精度的损失
可以提供误差范围，如果结果在误差范围内则可以判定==左右两边相等
如
```c
int main() {
    float a = 1.0, b = 1.1, ex = 0.1;
    printf("b - a == ex is %s\n", (b - a <= ex + 0.00001) ? "true" : "false");
}
```
## 4. 听说爱用位运算的人技术都不太差
>解释函数的原理，并分析使用位运算求平均值的优缺点。
```c
int average(int nums[], int start, int end) {
    if (start == end)
        return nums[start];
    int mid = (start + end) / 2;
    int leftAvg = average(nums, start, mid);
    int rightAvg = average(nums, mid + 1, end);
    return (leftAvg & rightAvg) + ((leftAvg ^ rightAvg) >> 1);
}
```
`average()`利用递归和位运算求平均值。
如一组数据 1 3 4 7 9 2 1 8 5 `average()`先找到其中间项mid，再将其分为两个部分 
`1 3 4 7 9`  `2 1 8 5 ` if条件为假,继续分割。`1 3 4` `7 9` `2 1` `8 5`
例如对于`79`再次进入`average()`时 leftAvg = 7 rightAvg = 9 函数返回位运算计算的平均值 `79` => `8` 返回的平均值被*leftAvg*或者*rightAvg*接收继续参与到求平均值的运算中。
最终可以求出数组中所有元素的平均值。
 
 使用位运算求平均值的优点是运算速度较快 缺点是可读性较差
## 5. 全局还是局部!!!
>先思考输出是什么，再动动小手运行下代码，看跟自己想得结果一样不一样 >-<
```c
int i = 1;
static int j = 15;
int func() {
    int i = 10;
    if (i > 5) i++;
    printf("i = %d, j = %d\n", i, j);
    return i % j;
}
int main() {
    int a = func();
    printf("a = %d\n", a);
    printf("i = %d, j = %d\n", i, j);
    return 0;
}
```
第一个i是全局变量 第二个i是函数体内的局部变量
在函数体内优先使用函数体内的局部变量,i = 10。
`i>5`成立 执行`i++`
j 是一个 **静态全局变量** 在函数体内 j = 15
printf打印出
```c
i = 11, j = 15
```
`func()`返回`i%j` = `11`  所以 a = 11
main()里的第一个printf()打印出
```c
a = 11
i = 1, j = 15
```
## 6. 指针的修罗场：改还是不改，这是个问题
>指出以下代码中存在的问题，并帮粗心的学长改正问题。
```c
int main(int argc, char **argv) {
    int a = 1, b = 2;
    const int *p = &a;
    int * const q = &b;
    *p = 3, q = &a;
    const int * const r = &a;
    *r = 4, r = &b;
    return 0;
}
```
`const int *p = &a;`p是一个***常量指针*** 它指向的值不可修改
`int * const q = &b;`q是一个***指针常量*** 它的指向不可修改
因此 `*p = 3, q = &a;`错误
可以改为
```c
int temp = 3;
p = & temp;
```
```c
*q = a;
```
 `const int * const r = &a;`定义的r是一个***常量指针常量*** 它的指向和指向的值都不可以修改
 可以改为
```c
temp = 4;
r = &temp;
*r = b;
```
## 7. 物极必反？
>你了解 argc 和 argv 吗，这个程序里的 argc 和 argv 是什么？
程序输出是什么？解释一下为什么。
```c
int main(int argc, char *argv[]) {
    while (argc++ > 0);
    int a = 1, b = argc, c = 0;
    if (--a || b++ && c--)
        for (int i = 0; argv[i] != NULL; i++)
            printf("argv[%d] = %s\n", i, argv[i]);
    printf("a = %d, b = %d, c = %d\n", a, b, c);
    return 0;
}
```
>argv[]是**命令行参数**
>argc是从命令行传给程序的参数个数(至少为1) 
 
 在没有传入参数时 argc = 1
 `while (argc++ > 0);`argc递增直到溢出为`-2147483648`
 `b = argc = -2147483648`
 `--a`先递减 再判断 a = 0为假 故需要判断 `b++ && c--`
 `c--`c先使用后递减 c=0 为假 故 `b++ && c--`为假  不进入if语句
 最终printf打印 
 ```c
 a = 0, b = -2147483647, c = -1
 ```
## 8. 指针？数组？数组指针？指针数组？
>在printf()主函数中定义如下变量：
```c
int main() {
    int a[2] = {4, 8};
    int(*b)[2] = &a;
    int *c[2] = {a, a + 1};
    return 0;
}
```
>说说这些输出分别是什么？
```c
a, a + 1, &a, &a + 1, *(a + 1), sizeof(a), sizeof(&a)
*b, *b + 1, b, b + 1, *(*b + 1), sizeof(*b), sizeof(b)
c, c + 1, &c, &c + 1, **(c + 1), sizeof(c), sizeof(&c)
```
 `int a[2] = {4, 8};`定义了一个数组
`int(*b)[2] = &a;`定义了一个数组指针 步长为2 指向a
`int *c[2] = {a, a + 1};`定义了一个指针数组 其中元素为 a ， a+1
#### 1.
```c
a, a + 1, &a, &a + 1, *(a + 1), sizeof(a), sizeof(&a)
```

输出的是
```c
0x7ffd9e2f1e48
0x7ffd9e2f1e4c
0x7ffd9e2f1e48
0x7ffd9e2f1e50
8
8
8
```
`a`是数组的首地址 打印出来的是第一个元素 4 的地址
`a+1`指向数组的第二个元素 8 打印出来的是 8 的地址
`&a`是整个数组的地址 与数组的首地址相同 **步长是整个数组的长度**
`&a`指向数组的第一个元素 `&a+1` 在此基础上右移了整个数组的长度
`a+1`指向8 所以*(a+1) 等于 8
`sizeof(a)`计算出整个数组的大小 即 8
`sizeof(&a)`计算出的是指针的大小 64位下为 8
#### 2.
```c
*b, *b + 1, b, b + 1, *(*b + 1), sizeof(*b), sizeof(b)
```
输出的是
```c
0x7ffd9e2f1e48
0x7ffd9e2f1e4c
0x7ffd9e2f1e48
0x7ffd9e2f1e50
8
8
8
```
数组指针b指向的是a   => *b等于a => b = &a
所以
```c
*b, *b + 1, b, b + 1, *(*b + 1), sizeof(*b), sizeof(b)
```
等价于
```c
a, a + 1, &a, &a + 1, *(a + 1), sizeof(a), sizeof(&a)
```
#### 3.
```c
c, c + 1, &c, &c + 1, **(c + 1), sizeof(c), sizeof(&c)
```
输出的是
```c
0x7ffd9e2f1e50
0x7ffd9e2f1e58
0x7ffd9e2f1e50
0x7ffd9e2f1e60
8
16
8
```
`c`是指针数组c的首地址 打印出来的是该数组的地址 也是第一个元素a的首地址
`c+1`指向的是第二个元素 a+1 打印出来的是 a+1 的地址
`&c` `&c+1` 与 `&a` `&a+1` 同理
`**(c+1)` 等同于`*(a+1)` 即 8
`sizeof(c)`得到的是数组c的大小 该数组是一个指针数组 共有两个元素 在64位下结果为 16
`sizeof(&c)`得到的是指针的大小 64位下结果为8
## 9. 嘻嘻哈哈，好玩好玩
>在宏的魔法下，数字与文字交织，猜猜结果是什么？
```c
#define SQUARE(x) x *x
#define MAX(a, b) (a > b) ? a : b;
#define PRINT(x) printf("嘻嘻，结果你猜对了吗，包%d滴\n", x);
#define CONCAT(a, b) a##b

int main() {
    int CONCAT(x, 1) = 5;
    int CONCAT(y, 2) = 3;
    int max = MAX(SQUARE(x1 + 1), SQUARE(y2))
    PRINT(max)
    return 0;
}
```
在宏定义中 a##b代表将a和b连在一起
所以前两行为
```c
x1 = 5;
y2 = 3;
```
#define在编译前直接在文本中替换
所以第三行和第四行为
```c
int max = (x1 + 1 * x1 + 1 > y2 * y2)? x1 + 1 * x1 + 1 : y2 * y2;
printf("嘻嘻，结果你猜对了吗，包%d滴\n", max);
```
max = x1 + 1 * x1 + 1 = 11
打印的结果为
```c
嘻嘻，结果你猜对了吗，包11滴
```
## 10. 我写的排序最快
>写一个 your_sort 函数，要求不能改动 main 函数里的代码，对 arr1 和 arr2 两个数组进行升序排序并剔除相同元素，最后将排序结果放入 result 结构体中。
```c
int main() {
    int arr1[] = {2, 3, 1, 3, 2, 4, 6, 7, 9, 2, 10};
    int arr2[] = {2, 1, 4, 3, 9, 6, 8};
    int len1 = sizeof(arr1) / sizeof(arr1[0]);
    int len2 = sizeof(arr2) / sizeof(arr2[0]);

    result result;
    your_sort(arr1, len1, arr2, len2, &result);
    for (int i = 0; i < result.len; i++) {
        printf("%d ", result.arr[i]);
    }
    printf()free(result.arr);
    return 0;
}
```
代码
```c
typedef struct result
{
   int * arr;
   int len;
}result;
//定义一个结构体
void Bubble_Sort(int arr[],int len)
{
   for(int i = 0;i<len;i++)
   {
      for(int j = 0;j<len - i - 1;j++)
      {
         if(arr[j+1]<arr[j])
         {
            int temp = arr[j+1];
            arr[j+1] = arr[j];
            arr[j] = temp;
         }
      }
   }
}
//冒泡排序
void your_sort(int arr1[],int len1,int arr2[],int len2,result * result)
{
   int len_temp = len1 + len2,count = 0;
   result->arr = (int *)malloc(len_temp * sizeof(int));//使用malloc分配空间
   if(result->arr==NULL)exit(-1);//检测是否开辟成功
   for(int i = 0;i<len1;i++)
   {
      result->arr[count] = arr1[i];
      count++;
   }
   for(int i = 0;i<len2;i++)
   {
      result->arr[count] = arr2[i];
      count++;
   }
   //将两个数组合为一个数组
   result->len = count;
   Bubble_Sort(result->arr,result->len);//排序
   int * arr_temp = (int*)malloc(sizeof(int) * count);
   if(arr_temp == NULL)exit(-1);//检测是否开辟成功
   int _count = 0;
   for(int i = 0;i<result->len;i++)
   {
      if(result->arr[i]!=result->arr[i+1])//如果不同存入临时数组
      {
         arr_temp[_count] = result->arr[i];
         _count++;
      }
   }
   result->len = _count;
   for(int i = 0;i<result->len;i++)//将筛选后的元素放回数组
   {
      result->arr[i] = arr_temp[i];
   }
   free(arr_temp);//释放临时使用的空间
}
int main() {
    int arr1[] = {2, 3, 1, 3, 2, 4, 6, 7, 9, 2, 10};
    int arr2[] = {2, 1, 4, 3, 9, 6, 8};
    int len1 = sizeof(arr1) / sizeof(arr1[0]);
    int len2 = sizeof(arr2) / sizeof(arr2[0]);

    result result;
    your_sort(arr1, len1, arr2, len2, &result);
    for (int i = 0; i < result.len; i++) {
        printf("%d ", result.arr[i]);
    }
    free(result.arr);
    return 0;
}
```

## 11. 猜猜我是谁
>在指针的迷宫中，五个数字化身为神秘的符号，等待被逐一揭示。
```c
int main() {
    void *a[] = {(void *)1, (void *)2, (void *)3, (void *)4, (void *)5};
    printf("%d\n", *((char *)a + 1));
    printf("%d\n", *(int *)(char *)a + 1);
    printf("%d\n", *((int *)a + 2));
    printf("%lld\n", *((long long *)a + 3));
    printf("%d\n", *((short *)a + 4));
    return 0;
}
```
`void *a[] = {(void *)1, (void *)2, (void *)3, (void *)4, (void *)5};` 定义了一个void*类型的数组 其中每个元素都是void*类型的值 即每个元素都是一个十六进制的整形
` printf("%d\n", *((char *)a + 1));`将a强转为(char*)类型的指针 a 指向(void*)1 即0000000000000001
一个(void*)类型占8个字节 包括16个十六进制位 所以一个十六进制位占0.5个字节
并且计算机一般采用小段存储 
所以用 ` ` 标记 (char*)a的指向为 00000000000000`01`
(char*)a+1为 000000000000`00`01
所以`printf("%d\n", *((char *)a + 1));`打印
```c
0
```
同理 
```c
printf("%d\n", *((int *)a + 2));
printf("%lld\n", *((long long *)a + 3));
printf("%d\n", *((short *)a + 4));
```
打印
```c
2 4 2
```
第二行的`printf("%d\n", *(int *)(char *)a + 1);`是将a强转为(char*)类型后再强转为(int*)类型后解引用
*(int *)(char *)a = (void *)1  
printf("%d\n", *(int *)(char *)a + 1); 相当于 printf("%d\n", 1 + 1);
打印
```c
2
```
## 12. 结构体变小写奇遇记
>计算出 Node 结构体的大小，并解释以下代码的运行结果。
```c
union data {
    int a;
    double b;
    short c;
};
typedef struct node {
    long long a;
    union data b;
    void (*change)( struct node *n);
    char string[0];
} Node;
void func(Node *node) {
    for (size_t i = 0; node->string[i] != '\0'; i++)
        node->string[i] = tolower(node->string[i]);
}

int main() {
    const char *s = "WELCOME TO XIYOULINUX_GROUP!";
    Node *P = (Node *)malloc(sizeof(Node) + (strlen(s) + 1) * sizeof(char));
    strcpy(P->string, s);
    P->change = func;
    P->change(P);
    printf("%s\n", P->string);
    return 0;
}
```

` Node *P = (Node *)malloc(sizeof(Node) + (strlen(s) + 1) * sizeof(char));`
malloc在堆区为Node和柔性数组开辟空间
` strcpy(P->string, s);`将字符串s复制到柔性数组P->string中
`P->change = func;`改变了函数指针change的指向，使其指向func()
`P->change(P);`调用P->change指向的函数func(),在func()中用tolower将大写转换为小写
最后printf打印:
```c
welcome to xiyoulinux_group!
```
## 13. GNU/Linux (选做)
>注：嘿！你或许对Linux命令不是很熟悉，甚至没听说过Linux。
但别担心，这是选做题，了解Linux是加分项，不了解也不扣分哦！
你知道 ls 命令的用法与 / . ~ 这些符号的含义吗？
你知道 Linux 中权限 rwx 的含义吗？
请问你还懂得哪些与 GNU/Linux 相关的知识呢~

>ls命令用于显示指定工作目录下之内容（列出目前工作目录所含的文件及子目录)。
>Linux系统中`/`表示 **根目录**  ；  `.`表示 **当前目录** ；`~`表示**当前用户的目录**。
例如 `ls /`会显示出根目录下的内容
rwx分别代表 Read Write eXecute (读取 写入 执行)权限。
