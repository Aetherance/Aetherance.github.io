# 西邮Linux兴趣小组2023纳新题
* 本题目只作为西邮 Linux 兴趣小组 2023 纳新面试的有限参考。
* 为节省版面，本试题的程序源码省去了 #include 指令。
* 本试题中的程序源码仅用于考察 C 语言基础，不应当作为 C 语言「代码风格」的范例。
* 所有题目编译并运行于 x86_64 GNU/Linux 环境。
## 0. 鼠鼠我啊，要被祸害了
>有1000瓶水，其中有一瓶有毒，小白鼠只要尝一点带毒的水，24小时后就会准时死亡。至少要多少只小白鼠才能在24小时内鉴别出哪瓶水有毒？

`10`只即可
首先给这1000瓶水标上1～1000的二进制序号，**最多需要十位二进制数**就可以将1000瓶水全表示完。然后给十只标上1～10的序号，对应十个二进制位。如果某瓶水的序号中某一二进制位为1,则**让对应序号的小鼠喝下这瓶水**。最终根据24小时后小鼠的死亡情况可以得出一个十位二进制数，其所对应的十进制数就是有毒的水的序号。
## 1. 先预测一下~
>按照函数要求输入自己的姓名试试~

```c
char *welcome() {
    // 请你返回自己的姓名
}
int main(void) {
    char *a = welcome();
    printf("Hi, 我相信 %s 可以面试成功!\n", a);
    return 0;
}
```
三种可行的方法
```c
//1
char *welcome() {
	return "name";
}
```
```c
//2
char *welcome() {
    char * name = "name";//存储在全局区 函数执行完不会释放
    return name;
}
```
```c
//3
char *welcome() {
    static char name[] = "name";//static修饰的变量存储在全局区 函数执行完不会释放
    return name;
}
```


>局部变量离开生命周期后就会被销毁 不能返回局部变量的地址  
>
所以
```c
char *welcome() {
    char name[] = "name";
    return name;
}
```
**不可行**
## 2. 欢迎来到Linux兴趣小组
>有趣的输出，为什么会这样子呢~
```c
int main(void) {
    char *ptr0 = "Welcome to Xiyou Linux!";
    char ptr1[] = "Welcome to Xiyou Linux!";
    if (*ptr0 == *ptr1) {
      printf("%d\n", printf("Hello, Linux Group - 2%d", printf("")));
    }
    int diff = ptr0 - ptr1;
    printf("Pointer Difference: %d\n", diff);
}
```
本题考察了[printf的返回值](https://blog.csdn.net/lrsnt/article/details/130837251?fromshare=blogdetail&sharetype=blogdetail&sharerId=130837251 "printf的返回值是成功打印的字符数")。
`ptr0`指向W，`ptr1`指向的也是W，所以 `*ptr0==*ptr1` 为真，执行if语句。 printf("") 成功打印了 `0` 个字节，返回的 `0` 作为另一个printf函数的参数打印出`Hello, Linux Group - 20`，同时返回成功打印的字符数 `24`。最后一个printf函数打印出 `24`。最终打印的结果为
```c
Hello, Linux Group - 2024
```
## 3. 一切都翻倍了吗
>请尝试解释一下程序的输出。
请谈谈对sizeof()和strlen()的理解吧。
什么是sprintf()，它的参数以及返回值又是什么呢？
```c
int main(void) {
    char arr[] = {'L', 'i', 'n', 'u', 'x', '\0', '!'}, str[20];
    short num = 520;
    int num2 = 1314;
    printf("%zu\t%zu\t%zu\n", sizeof(*&arr), sizeof(arr + 0),
           sizeof(num = num2 + 4));
    printf("%d\n", sprintf(str, "0x%x", num) == num);
    printf("%zu\t%zu\n", strlen(&str[0] + 1), strlen(arr + 0));
}
```
>sizeof() 是一个运算符，而 strlen() 是一个函数。
>sizeof() 计算的是变量所占用的内存字节数，而 strlen() 计算的是字符串中字符的个数。
>strlen() 只能用于以 '\0' 结尾的字符串。
>sizeof() 括号中的语句不执行 而strlen() 括号中的语句会执行
>sizeof() 计算字符串的长度，包含末尾的 '\0'。
>strlen() 计算字符串的长度，不包含字符串末尾的 '\0'。

>sprintf 与printf类似，不同的是printf是打印到stdout中，而sprintf是打印到一个字符串里。
>关于sprintf的返回值：sprintf函数如果成功打印，则返回**写入的字符总数**，不包括字符串追加在字符串末尾的空字符。如果失败，则返回一个负数。

+ 第一个printf里的 `*&arr` 其实就是`arr` &ensp;`sizeof(arr)`求出的就是整个数组的大小
+ `arr+0`表明它是一个右移了 0 个单位的指针 `sizeof(arr+0)` 打印出来的就是(char*)类型指针的大小。
+ **因为sizeof()的结果是在编译时计算的，而strlen()的结果是在运行时计算的，所以sizeof()括号中的语句并不会执行。**`sizeof(num = num2 + 4)`计算出来的就是num的大小。
+ 此处的sprintf将num转换成一个十六进制数打印到str里，并且返回了成功打印的字符数。成功打印的字符的数量不等于num，所以`sprintf(str, "0x%x", num) == num`返回的是0，printf将其打印出来。
+ `strlen(&str[0] + 1)`相当于`strlen(str+1)`计算的是从str+1开始的长度，到'\0'为止。
+ `strlen(arr+0)`打印的是以'\0'终止的整个字符串str的长度。
## 4. 奇怪的输出
>程序的输出结果是什么？解释一下为什么出现该结果吧~
```c
int main(void) {
    char a = 64 & 127;
    char b = 64 ^ 127;
    char c = -64 >> 6;
    char ch = a + b - c;
    printf("a = %d b = %d c = %d\n", a, b, c);
    printf("ch = %d\n", ch);
}
```
```c
01000000		(64)
01111111		(127)		按位与得
01000000		(64) //a		
```
```c
01000000		(64)
01111111		(127)		按位异或得
00111111		(63) //b		
```
```c
11000000		(-64)		(源码)
10111111		(-64)		(反码)
11000000		(-64)		(补码)
11111111		(-1) //c	(算术右移6位后)
```
ch = 64 + 63 - (-1) = 128,但是char类型的大小为1个字节	范围为 -128 ～ 127
`01111111`(127) 再加1时会溢出为 `10000000`(-128)
最终打印的结果为 
							  
```c
a = 64  b = 63  c = -1    ch = -128
```
## 5. 乍一看就不想看的函数
>“人们常说互联网凛冬已至，要提高自己的竞争力，可我怎么卷都卷不过别人，只好用一些奇技淫巧让我的代码变得高深莫测。”
这个func()函数的功能是什么？是如何实现的？
```c
int func(int a, int b) {
    if (!a) return b;
    return func((a & b) << 1, a ^ b);
}
int main(void) {
    int a = 4, b = 9, c = -7;
    printf("%d\n", func(a, func(b, c)));
}
```
`a ^ b`是按位异或运算，相当于不进位的加法。而`(a & b)  << 1 `实现了进位。函数利用递归重复该过程，直到a = 0（停止进位）时返回b。该过程实现的其实就是a和b两个整数的相加，最终返回的就是a+b的值。
>利用该函数求 1+1 的过程中 a和b的变化
```c
a		b
0001    0001
0010    0000
0000    0010
```
`func(b, c)`就是 `b+c`； printf()打印的其实就是 (a+(b+c))&ensp;最终结果为`6`

## 6. 自定义过滤
>请实现filter()函数：过滤满足条件的数组元素。
提示：使用函数指针作为函数参数并且你需要为新数组分配空间。
```c
typedef int (*Predicate)(int);
int *filter(int *array, int length, Predicate predicate,
            int *resultLength); /*补全函数*/
int isPositive(int num) { return num > 0; }
int main(void) {
    int array[] = {-3, -2, -1, 0, 1, 2, 3, 4, 5, 6};
    int length = sizeof(array) / sizeof(array[0]);
    int resultLength;
    int *filteredNumbers = filter(array, length, isPositive,
                                  &resultLength);
    for (int i = 0; i < resultLength; i++) {
      printf("%d ", filteredNumbers[i]);
    }
    printf("\n");
    free(filteredNumbers);
    return 0;
}
```
代码及注释
```c
#include<stdio.h>
#include<stdlib.h>
#include<assert.h>
typedef int (*Predicate)(int);//给指向 参数为int 返回值为int 的函数指针定义一个别名predicate方便使用
int *filter(int *array, int length, Predicate predicate,int *resultLength)
{
    int count = 0;//计数
    int * filteredNumbers = (int*)malloc(sizeof(int)*length);//使用malloc动态开辟内存
    assert(filteredNumbers);//判断是否开辟成功 防止传入空指针
    for(int i = 0;i<length;i++)
    {
        if((*predicate)(array[i]))//通过函数指针调用筛选的函数 如果判断条件为真 将要筛选的数放入array
        {
            filteredNumbers[count] = array[i];
            count++;
        }
    }
    *resultLength = count;      //长度变为count
    return filteredNumbers;//返回筛选后的数组地址
}
int isPositive(int num) { return num > 0; }
int main(void) {
    int array[] = {-3, -2, -1, 0, 1, 2, 3, 4, 5, 6};
    int length = sizeof(array) / sizeof(array[0]);
    int resultLength;
    int *filteredNumbers = filter(array, length, isPositive,
                                  &resultLength);
    for (int i = 0; i < resultLength; i++) {
        printf("%d ", filteredNumbers[i]);
    }
    printf("\n");
    free(filteredNumbers);
    return 0;
}
```
## 7. 静…态…
>如何理解关键字static？
static与变量结合后有什么作用？
static与函数结合后有什么作用？
static与指针结合后有什么作用？
static如何影响内存分配？

`static`意为“静态”。
`static` 修饰的变量具有默认的初始值0。
`static`修饰的**局部变量**的**生命周期**会延长至整个程序。
全局变量和函数被`static`修饰会使其不能被其他文件访问，可以防止命名冲突。
`static`修饰的指针的**生命周期**会延长至整个程序。
`static`修饰的变量会存储在**全局区**。
## 8. 救命！指针！
>数组指针是什么？指针数组是什么？函数指针呢？用自己的话说出来更好哦，下面数据类型的含义都是什么呢？
```c
int (*p)[10];
const int* p[10];
int (*f1(int))(int*, int);
```
数组指针，是一个指向数组的指针。
指针数组，是一个存放指针的数组。
函数指针，是一个指向函数的指针。
`int (*p)[10];`是一个数组指针 指向一个int类型的 包含10个元素的数组。
`const int* p[10];`是一个常量数组指针。它指向一个常量。
`int (*f1(int))(int*, int);`  定义了一个返回值为int(*)(int *,int),参数为int的函数。
## 9. 咋不循环了
>程序直接运行，输出的内容是什么意思？
```c
int main(int argc, char* argv[]) {
    printf("[%d]\n", argc);
    while (argc) {
      ++argc;
    }
    int i = -1, j = argc, k = 1;
    i++ && j++ || k++;
    printf("i = %d, j = %d, k = %d\n", i, j, k);
    return EXIT_SUCCESS;
}
```
[命令行参数相关知识](https://blog.csdn.net/f593256/article/details/131721231?fromshare=blogdetail&sharetype=blogdetail&sharerId=131721231)
`argc`是 **命令行参数** 默认值为1。 while()语句中`argc`递增 ，此过程中`argc`先溢出为-2147483648，再递增到0后退出循环。 `i = -1` ; `j = argc = 0` ; `k = 1`;  
&&的优先级高于|| ， 所以  `i++ && j++` 先进行。后置递增运算符在语句执行完后才进行递增，所以`i++ && j++` 中&&左边部分为真,继续执行&&右边部分，j递增。但是j在递增之前为0,所以`i++ && j++`为假，继续执行||右边的部分,k递增。
`EXIT_SUCCESS`定义于 头文件`<stdlib.h>`，`return EXIT_SUCCESS` 相当于  `return 0`
## 10. 到底是不是TWO
```c
#define CAL(a) a * a * a
#define MAGIC_CAL(a, b) CAL(a) + CAL(b)
int main(void) {
  int nums = 1;
  if(16 / CAL(2) == 2) {
    printf("I'm TWO(ﾉ>ω<)ﾉ\n");
  } else {
    int nums = MAGIC_CAL(++nums, 2);
  }
  printf("%d\n", nums);
}
```
[宏定义相关知识](https://blog.csdn.net/EleganceJiaBao/article/details/141252278?fromshare=blogdetail&sharetype=blogdetail&sharerId=141252278)
#define定义别名是在预处理时直接在文本中替换 所以`if(16 / CAL(2) == 2)`会被直接替换为
```c
if(16 / 2 * 2 * 2 == 2)
```
显然if条件为假 不会打印 `I'm TWO(ﾉ>ω<)ﾉ` 
else{}中定义的nums离开else{}就会被销毁，所以printf打印出来的就是一开始定义的nums的值 `1`
## 11. 克隆困境
>试着运行一下程序，为什么会出现这样的结果？

直接将s2赋值给s1会出现哪些问题，应该如何解决？请写出相应代码。
```c
struct Student {
    char *name;
    int age;
};

void initializeStudent(struct Student *student, const char *name,
                       int age) {
    student->name = (char *)malloc(strlen(name) + 1);
    strcpy(student->name, name);
    student->age = age;
}
int main(void) {
    struct Student s1, s2;
    initializeStudent(&s1, "Tom", 18);
    initializeStudent(&s2, "Jerry", 28);
    s1 = s2;
    printf("s1的姓名: %s 年龄: %d\n", s1.name, s1.age);
    printf("s2的姓名: %s 年龄: %d\n", s2.name, s2.age);
    free(s1.name);
    free(s2.name);
    return 0;
}
```
将`s2`直接赋值给`s1`属于**浅拷贝**。`s2`中的`age`可以成功复制，但是复制使用`malloc`动态开辟的`name`时只能将`s2.name`的地址赋给`s1.name`。在使用`free`释放时，会将`s2.name`地址对应的内存重复释放，造成错误。
解决方法：使用strcpy()将s2.name复制到已经开辟好的s1.name的空间中即可。
代码：
```c
#include<stdio.h>
#include<stdlib.h>
#include<string.h>
struct Student {
    char *name;
    int age;
};
void initializeStudent(struct Student *student, const char *name,
 int age) {
    student->name = (char *)malloc(strlen(name) + 1);
    strcpy(student->name, name);
    student->age = age;
}
void Copy(struct Student * s1,struct Student * s2)
{
    s1->age = s2->age;
    strcpy(s1->name,s2->name);
}
int main(void) {
    struct Student s1, s2;
    initializeStudent(&s1, "Tom", 18);
    initializeStudent(&s2, "Jerry", 28);
    Copy(&s1,&s2);
    printf("s1 的姓名: %s 年龄: %d\n", s1.name, s1.age);
    printf("s2 的姓名: %s 年龄: %d\n", s2.name, s2.age);
    free(s1.name);
    free(s2.name);
    return 0;
}

```
[深拷贝与浅拷贝](https://yx-codec-conductor.blog.csdn.net/article/details/136889144?fromshare=blogdetail&sharetype=blogdetail&sharerId=136889144)
## 12. 你好，我是内存
>作为一名合格的C-Coder，一定对内存很敏感吧~来尝试理解这个程序吧！
```c
struct structure {
    int foo;
    union {
      int integer;
      char string[11];
      void *pointer;
    } node;
    short bar;
    long long baz;
    int array[7];
};
int main(void) {
    int arr[] = {0x590ff23c, 0x2fbc5a4d, 0x636c6557, 0x20656d6f,
                 0x58206f74, 0x20545055, 0x6577202c, 0x6d6f636c,
                 0x6f742065, 0x79695820, 0x4c20756f, 0x78756e69,
                 0x6f724720, 0x5b207075, 0x33323032, 0x7825005d,
                 0x636c6557, 0x64fd6d1d};
    printf("%s\n", ((struct structure *)arr)->node.string);
}
```
[字节序与大小端](https://blog.csdn.net/bhbhhyg/article/details/116888685?fromshare=blogdetail&sharetype=blogdetail&sharerId=116888685)
`(struct structure *)arr` 将arr强转为结构体指针类型访问联合体中的string成员，联合体union内的成员共用一块内存，内存大小至少为8。联合体在结构体内的对齐数为8,又因为前面还有一个int类型，所以联合体存储在结构体中偏移量为8的地址处。arr强转为结构体指针后访问联合体node中的成员string，相当于跳过了数组中的两个int类型元素，指向第三个元素`0x636c6557`。
并且计算机一般采用小端存储，也就是对于arr中的第三个元素`0x636c6557` `57`存在低地址处，printf打印时从`57`开始，将十六进制ascll码转换为字符，逐个打印，直到遇到'\0'。最终打印出来的是：
```c
Welcome to XUPT , welcome to Xiyou Linux Group [2023]
```
## 13. GNU/Linux (选做)
>注：嘿！你或许对Linux命令不是很熟悉，甚至你没听说过Linux。但别担心，这是选做题，了解Linux是加分项，但不了解也不扣分哦！
你知道cd命令的用法与 / . ~ 这些符号的含义吗？
请问你还懂得哪些与 GNU/Linux 相关的知识呢~

>cd：切换工作目录
> / 根目录 &ensp; . 当前目录 &ensp; ~ user目录
