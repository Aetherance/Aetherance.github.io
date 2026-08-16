---
title: "TCP/IP"
description: "TCP/IP协议将网络分为4层"
pubDate: 2025-03-04
updatedDate: 2025-03-09
lang: zh
tags: ["网络编程"]
draft: false
---

## TCP/IP网络模型

TCP/IP协议将网络分为4层

从上到下依次是 应用层 传输层 网络层 数据链路层

TCP/IP 分别为传输层和网络层的协议。

![TCP IP](/legacy-blog/res/TCP-IP.png)

一个应用A向应用B传输信息的大致过程

```text
             封装为 包      封装为 帧               检查 IP 头部 若匹配，剥离 IP 头部，将段交给传输层。
             添加 IP 头部   添加 帧头和帧尾          若不匹配且本机为路由器，则重新路由转发
             |             |                     |
应用A->传输层->网络层->数据链路层->网络介质->数据链路层->网络层->传输层->应用B(接收数据)
       |                       |       |                |
       添加 传输层头部           比特流   剥离帧头和帧尾      检查端口号，确定目标应用    
       封装为 段 或 数据报。              校验帧完整性       剥离传输层头部，将原始数据交给应用层。
高层                        低层      低层                        高层
```

## IP

```text
IP（Internet Protocol，互联网协议）是用于在计算机网络中标识和定位设备的一组规则。
它是互联网通信的基础协议之一，主要作用是为每个连接到网络的设备分配一个唯一的地址（称为IP地址），确保数据能够准确地在设备之间传输。
```

IP协议是一种 **无连接** 和 **不可靠** 的协议。

无连接：IP协议在发送数据之前不会建立连接。

不可靠：IP协议不保证数据按顺序到达，不保证数据不重复，也不保证数据不丢失。

IP协议会通过IP地址标识网络中的设备，在一个网络中，设备的IP地址是唯一的。

IP协议会根据网络最大传输单元(MTU)拆分数据包，并在接收端重组。

IP会将数据包封装成有固定20字节头部的数据包

![ipv4head](/legacy-blog/res/ipv4head.png)

IP协议的两个版本

1. IPv4
2. IPv6

IPv4地址由32位二进制数组成，可表示约43亿地址。为方便阅读，IPv4地址可用点分十进制表示。如`192.168.0.1`

IPv4目前是主流的IP表示方案，但也存在着能够表示的地址不够的问题。

IPv6解决了这一问题。其地址为128位的二进制数，可以表示约`3.4×10³⁸`地址个地址。

IPv6的头部为固定的40字节，每个设备都可以有公网地址。IPv6的地址还可以表示为十六进制冒号分隔的形式 如 `2001:0db8:85a3::8a2e:0370:7334`。

### IP核心机制

#### 1. 分片和重组机制

IP会将数据包分片与重组，当数据包的大小超过MTU，数据包会被拆分成多个分片，到达接收端后，数据包会被根据标志和片位移重组。

#### 2. TTL机制

TTL，即`Time to Live`(生存时间)。没经过一个路由器，TTL值会减1。当一个数据包的TTL值为0时，这个数据包会被路由器丢弃。

设定TTL值并在其为0时丢弃是为了防止数据包在网络中无限循环。

#### 3. 路由机制

每个路由器都有一张路由表，存储目标网络和下一跳的映射。

如果目标IP和路由器在同一个子网，数据包会被直接发给目标设备。

如果目标IP和路由器不在同一个子网，数据包会被发送到默认网关。

```text
判断是否在同一子网——子网掩码

IPv4地址 = 网络地址 + 主机号
如果两个IP的网络地址相同，那么可以确定这两个IP在同一个子网
通过子网掩码便可以确定一个IP地址的网络地址。

网络地址 = IP地址 & 子网掩码
```

## TCP

| 特性 | TCP | UDP |
| --- | --- | --- |
| **连接方式** | 面向连接（三次握手建立，四次挥手释放 ） | 无连接，直接发送数据 |
| **可靠性** | 可靠传输（确认、重传、校验） | 不可靠传输（无确认、无重传） |
| **流量控制** | 通过滑动窗口动态调节发送速率 | 无流量控制 |
| **拥塞控制** | 有（慢启动、拥塞避免等算法） | 无 |
| **数据顺序** | 保证数据按顺序到达 | 不保证顺序 |
| **头部开销** | 较大（20 字节固定 + 可选字段） | 较小（固定 8 字节） |
| **传输方式** | 基于字节流（无明确边界） | 基于数据报（有明确边界） |
| **传输效率** | 低（握手、重传、控制机制） | 高（无额外控制） |
| **延迟** | 较高（可靠性机制引入延迟） | 较低（适合实时应用） |
| **广播/多播支持** | 仅支持单播 | 支持广播和多播 |
| **典型应用场景** | HTTP、FTP、电子邮件、文件传输 | 视频流、在线游戏、DNS、VoIP、实时通信 |

TCP是一种 **面向连接** 的 **可靠** 传输协议。 并且TCP协议支持流量控制和拥塞控制，可以进行全双工通信。

使用TCP协议通信前需要先建立连接，通信结束后也需要断开连接。

#### 可靠传输机制

1. 校验和

每个TCP报文都带校验和字段，通过校验和可以验证数据的完整性。

2. 确认应答机制

接收方在成功接收数据后，会向发送方发送一个带ACK标志位的数据包，该数据包中包含了`确认号`

确认号是成功接收的这个数据包下一个数据包的序列号，表示以确认号为序列号的数据包之前的数据包都收到了。

3. 超时重传机制

在一定时间后，如果还没有收到某个数据包的ACK，发送方会重传该数据包。

- 快速重传：接收方检测到乱序包，会重新发送前一个ACK。当发送方收到三次重复ACK时，会立即重传。

4. 滑动窗口

使用TCP协议的发送方和接收方各维护了一个滑动窗口。 通过这两个滑动窗口TCP可以实现流量控制和拥塞控制。

![tcphead](/legacy-blog/res/tcphead.png)

#### TCP三次握手四次挥手

##### 三次握手

1. 客户端向服务器发送一个带有标志位SYN的数据包，表明自己希望与服务器建立连接。 客户端的TCP状态变为SYN\_SENT
2. 服务器回复一个带有标志位SYN和ACK的数据包，表示同意建立连接。 服务器的TCP状态变为SYN\_RECEIVED
3. 客户端接收到服务器的SYN-ACK包后，回应一个ACK包，表示连接建立。 服务器和客户端的TCP状态都变为ESTABLISHED，连接建立。

```text
三次握手
服务器: LISTEN -> SYN_R可靠传输四大机制、握手/挥手状态转换、滑动窗口原理CVD -> ESTABLISHED
客户端:     CLOSED -> SYN_SENT -> ESTABLISHED
```

![tcp connect](/legacy-blog/res/tcp-connect.png)

##### 四次挥手

1. 主动方向被动方发送一个带标志位FIN的数据包，表示自己想要终止连接。 主动方进入FIN\_WAIT\_1状态。
2. 被动方收到FIN包，回应一个ACK包，表示确认收到关闭请求。 被动关闭方进入CLOSE\_WAIT状态。 主动方接收ACK后进入FIN\_WAIT\_2状态
3. 被动方在数据发送完毕后，向主动方发送一个带FIN标识位的数据包，表示被动方也要终止连接。 被动方进入LAST\_ACK状态。
4. 主动方收到FIN包后，向被动方发送一个ACK包，并进入TIME\_WAIT状态。被动方接收ACK后终止连接，主动方一段时间后终止连接。

```text
                        发送FIN          接收ACK        接收FIN并发送ACK
四次挥手                    |             |             |
主动方:     ESTABLISHED -> FIN_WAIT_1 -> FIN_WAIT_2 -> TIME_WAIT -> CLOSED
被动方:     ESTABLISHED -> CLOSE_WAIT -> LAST_ACK   -> CLOSED
                         |              |           |
                        接收FIN,回应ACK  数据发送完毕   接收ACK
```

![tcp disconnect](/legacy-blog/res/tcp-disconnect.png)

利用TCP/IP协议，我们可以实现服务器和客户端之间的通信。

![socket](/legacy-blog/res/socket.png)

服务器：

```cpp
#include<iostream>
#include<memory.h>
#include<arpa/inet.h>

int main() {
    int lfd = socket(AF_INET,SOCK_STREAM,0);
    sockaddr_in sin;
    memset(&sin,0,sizeof(sockaddr_in));
    sin.sin_family = AF_INET;
    sin.sin_port = htons(1234);
    sin.sin_addr.s_addr = INADDR_ANY;
    
    if(bind(lfd,(sockaddr*)&sin,sizeof(sockaddr_in)) == -1) {
        perror("bind");
    }

    listen(lfd,3);

    sockaddr_in client_sin;
    socklen_t client_sin_len = sizeof(sockaddr_in);
    int sock = accept(lfd,(sockaddr*)&client_sin,&client_sin_len);

    send(sock,"Hello World!",13,0);

    close(sock);
    close(lfd);

    return 0;
}
```

客户端：

```cpp
#include<iostream>
#include<arpa/inet.h>
#include<memory.h>

int main() {
    sockaddr_in sin;
    memset(&sin,0,sizeof(sockaddr_in));
    sin.sin_family = AF_INET;
    sin.sin_port = htons(1234);
    inet_pton(AF_INET,"localhost",&sin.sin_addr);

    int sock = socket(AF_INET,SOCK_STREAM,0);

    connect(sock,(sockaddr*)&sin,sizeof(sockaddr_in));

    char buff[13] = {};

    recv(sock,buff,13,0);
    std::cout<<buff;    

    close(sock);

    return 0;
}
```

通过TCP/IP协议，服务器可以向客户端发送一条消息`Hello World!`。客户端接收`Hello World!`后将其打印在客户端的屏幕上。
