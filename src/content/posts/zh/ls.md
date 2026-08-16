---
title: "ls实现"
description: "PLAN"
pubDate: 2024-12-29
updatedDate: 2025-01-08
lang: zh
tags: ["Linux系统编程"]
draft: false
---

### 实现自己的 ls 命令

[PLAN](https://plan.xiyoulinux.com/project/ls/)

#### 任务说明

`ls` 是 GNU/Linux 操作系统中常见的命令。 请使用 C 语言，基于 GNU/Linux 操作系统，编程实现 ls 命令的部分功能。

#### 验收要求

- 实现 ls 的 -a、-l、-R、-t、-r、-i、-s 参数，并允许这些参数任意组合。
- -R 需要对 / 的遍历测试。
- 界面美观（输出对齐、带颜色显示等）。
- 无资源与内存泄漏。
- 开发过程记录、总结并发布在个人博客中。

CODE

```c
#include<stdio.h>
#include<sys/stat.h>
#include<string.h>
#include<dirent.h>
#include<getopt.h>
#include<ctype.h>
#include<stdlib.h>
#include<unistd.h>
#include<sys/ioctl.h>
#include<pwd.h>
#include<grp.h>
#include<time.h>
#include<locale.h>

#define LIST_SIZE 20970
#define PATH_SIZE 4048
#define FILE_PATH_SIZE 2000
#define FILE_COUNT_MAX 25600
#define Rsize 40000000

#define OPT__A 'a'
#define OPT__L 'l'
#define OPT__T 't'
#define OPT__R 'r'
#define OPT_RR 'R'
#define OPT__I 'i'
#define OPT__S 's'

typedef int(*FP)(const void *, const void *);

// ifm
struct ifm
{
    struct dirent rdirent;
    struct stat buf__stat;
};

int opt_count_sum = 0;
int opt;    // temp
char optTable[256] = {};  // 01 table
char **filepath;
int FileNameCount = 1;
int FileNameRead = 0;

// sort
int order = 1;

void R();

int sort_init(const void * ptr1, const void * ptr2);
int sort_by_change_time(const void * ptr1, const void * ptr2);
void PrintList(struct ifm * readifm);
void PrintWithL(struct ifm *readifm);

int main(int argc,char **argv)
{
    filepath = (char **)malloc(80);
    filepath[0] = (char *)malloc(64);
    strcpy(filepath[0],".");

    // getopt
    while((opt = getopt(argc,argv,"alRtris"))!=-1)
    {
        optTable[opt] = 1;
        opt_count_sum += optTable[opt];
    }

    char ** arcu = argv+1;

    while(*arcu!=NULL&&arcu<argv+argc)
    {
        if(**arcu != '-')
        {
            FileNameCount--;
            break;
        }
        arcu ++;
    }

    arcu = argv+1;

    while(*arcu!=NULL&&arcu<argv+argc)
    {
        if(**arcu != '-')
        {
            filepath[FileNameCount] = (char *)realloc(filepath[FileNameCount],(strlen(*arcu)+1)* sizeof(char));
            strcpy(filepath[FileNameCount++],*arcu);
        }
        arcu++;
    }

    order = optTable[OPT__R] ? -1 : 1 ;

    if(optTable[OPT_RR])
    {
        for(int i = 0;i<FileNameCount;i++)
            R(filepath[i]);
        for(int i = 0;i<FileNameCount;i++)
            free(filepath[i]);
        free(filepath);
        return 0;
    }

    while (FileNameRead<FileNameCount)
    {
        // open
        DIR * dir = opendir(filepath[FileNameRead]);
        if(dir!=NULL&&FileNameCount>1||optTable[OPT_RR])
            printf("%s:\n",filepath[FileNameRead]);
        struct dirent * rdirent;
        struct stat buf__stat;    // 静态开辟空间
        struct stat * statbuf = &buf__stat;

        if(dir == NULL)
        {
            if(optTable[OPT_RR])
            {
                FileNameRead ++;
                continue;
            }
            printf("ls: 无法访问 '%s': 没有那个文件或目录\n",filepath[FileNameRead]);
            return 1;
        }
        
        struct ifm * ifmlist = (struct ifm *)malloc(2048*sizeof(struct ifm));
        struct ifm * cur = ifmlist;
        int all_name_count = 0;
        int total_name_len = 0;
        int temp_line_len = 0;
        int max_len = 0;     //最长文件名
        int line_print_now = 0;
        int divide_count = 0;
        size_t blockSum = 0;
        int fileSizeLenMax = 0;

        struct dirent * temp_dirent;
        // 读目录

        while((temp_dirent = readdir(dir))!=NULL)
        {
            cur->rdirent = * temp_dirent;
            // get_max_len
            //printf("Ptr's addr: %p %p\n",(void*)cur, (void*)&ifmlist[testcount]);
            if(strlen(cur->rdirent.d_name)>max_len)
                max_len = strlen(cur->rdirent.d_name)+1;

            //max_len = max_len>7?7:max_len;

            char path[PATH_SIZE];
            sprintf(path,"%s/%s",filepath[FileNameRead],cur->rdirent.d_name);
            stat(path,&cur->buf__stat);

            total_name_len += strlen(cur->rdirent.d_name) + 2; // 确定总长度 判断是否需要切换输出模式
            //total_name_len-=2;  // 减去最后的两个空格
            if(optTable[OPT__S]) total_name_len += 3;
            if(optTable[OPT__I]) total_name_len += 8;

            if(optTable[OPT__A])blockSum += cur->buf__stat.st_blocks/2; // why
            else if((cur->rdirent.d_name)[0]!='.')blockSum += cur->buf__stat.st_blocks/2;

            int temp = cur->buf__stat.st_size;
            int fileSizeLen = 0;
            while(temp)
                temp/=10,fileSizeLen ++;
            if(fileSizeLen>fileSizeLenMax)
                fileSizeLenMax = fileSizeLen;
            
            all_name_count++;
            cur++;

        }
        closedir(dir);

        // get_sort_mode
        FP sort_mode = sort_init;
        if(optTable[OPT__T])sort_mode = sort_by_change_time;
        qsort(ifmlist,all_name_count,sizeof(struct ifm),sort_mode);

        // get_print_format
        static struct winsize win;
        ioctl(STDIN_FILENO,TIOCGWINSZ,&win);
        divide_count = total_name_len / win.ws_col + 1;
            
        // opt_s using
        if(optTable[OPT__L]||optTable[OPT__S])printf("总计 %zu\n",blockSum);

        // read from ifm
        struct ifm * readifm = ifmlist;
        while(readifm!=cur)
        {
            if(!optTable[OPT__A])
            if(!strcmp(readifm->rdirent.d_name,".")||!strcmp(readifm->rdirent.d_name,"..")||*readifm->rdirent.d_name=='.')
            {
                readifm++;
                continue;
            }

            // 输出格式
            if(!optTable[OPT__L]&&line_print_now == ((all_name_count/divide_count-1))/(optTable[OPT_RR]?2:1))
            {
                printf("\b\b");
                printf("\n");
                temp_line_len = 0;
                line_print_now = 0;
            }

            if(optTable[OPT__I])
            {
                printf("%lu ",readifm->rdirent.d_ino);
            }

            if(optTable[OPT__S])
            {
                printf("%2lu ",readifm->buf__stat.st_blocks/2);     // why
            }

            if(optTable[OPT__L])    // -l
            {
                PrintWithL(readifm);
                PrintList(readifm);
                printf("\n");
            }

            else if(!optTable[OPT_RR]&&total_name_len<=win.ws_col)
            {
                PrintList(readifm);
            }

            else
            {
                temp_line_len += strlen(readifm->rdirent.d_name)+2;
                temp_line_len += strlen(readifm->rdirent.d_name)+2;

                if(S_ISREG(readifm->buf__stat.st_mode)
                &&!(readifm->buf__stat.st_mode & S_IXUSR))
                    printf("%-*s",max_len,readifm->rdirent.d_name);
                
                if(S_ISREG(readifm->buf__stat.st_mode)
                &&(readifm->buf__stat.st_mode & S_IXUSR))
                    printf("\033[1;32m%-*s\033[0m",max_len,readifm->rdirent.d_name);   // 可执行文件
                
                if(S_ISDIR(readifm->buf__stat.st_mode))
                    printf("\033[34m\033[1m""%-*s\033[0m",max_len,readifm->rdirent.d_name);
                
                printf(" ");
            }
            
            line_print_now ++;
            readifm ++;
        }
        
        if(!optTable[OPT__L])printf("\n");
        FileNameRead ++;
        if(FileNameCount>1&&FileNameCount!=FileNameRead)printf("\n");
        free(ifmlist);
    }
    for(int i = 0;i<FileNameCount;i++)
        free(filepath[i]);
    free(filepath);
    return  0;
}
void R(char * Rfile)
{
    
    struct ifm * Rlist = (struct ifm *)malloc(sizeof(struct ifm) * Rsize);

    DIR * rdir = opendir(Rfile);
    if(rdir == NULL)
    {
        fprintf(stderr,"\033[0m""ls: 无法打开目录 '%s': 权限不够\n",Rfile);
        return;
    }   
    int count4q = 0;
    struct dirent * trdir;
    for(int i = 0;(trdir = readdir(rdir))!=NULL;i++,count4q++)
    {
        char temp[2000];
        Rlist[i].rdirent = *trdir;
        sprintf(temp,"%s/%s",Rfile,Rlist[i].rdirent.d_name);
        stat(temp,&Rlist[i].buf__stat);
    }
    qsort(Rlist,count4q,sizeof(struct ifm),sort_init);
    printf("%s:\n\n",Rfile);
    for(int i = 0;i<count4q;i++)
    {
        if(!optTable[OPT__A])
        {
            if(*Rlist[i].rdirent.d_name=='.')
                continue;
        }
        if(optTable[OPT__I])
        {
            printf("%lu ",Rlist[i].rdirent.d_ino);
        }
        if(optTable[OPT__S])
        {
            printf("%2lu ",Rlist[i].buf__stat.st_blocks/2);     // why
        }
        if(optTable[OPT__L])
        {
            PrintWithL(&Rlist[i]);
        }
        if(S_ISDIR(Rlist[i].buf__stat.st_mode))
        {
            printf("\033[1;5;34m""%s\n\033[0m",Rlist[i].rdirent.d_name);
        }
        else if(strstr(Rlist[i].rdirent.d_name,".png")!=NULL)
        {
            printf("\033[1;5;35m""%s\n\033[0m",Rlist[i].rdirent.d_name);
        }
        else if(Rlist[i].buf__stat.st_mode&S_IXUSR)
        {
            printf("\033[1;5;32m""%s\n\033[0m",Rlist[i].rdirent.d_name);
        }
        else if(strstr(Rlist[i].rdirent.d_name,".tar")!=NULL||strstr(Rlist[i].rdirent.d_name,".gz")!=NULL||strstr(Rlist[i].rdirent.d_name,".zip")!=NULL)
        {
            printf("\033[1;5;31m""%s\n\033[0m",Rlist[i].rdirent.d_name);
        }
        else 
        {
            printf("%s\n",Rlist[i].rdirent.d_name);
        }
    }

    for(int i = 0;i<count4q;i++)
    {
        if(S_ISDIR(Rlist[i].buf__stat.st_mode)&&strcmp(Rlist[i].rdirent.d_name, ".") != 0 && strcmp(Rlist[i].rdirent.d_name, "..") != 0)
        {
            char go[1000];
            sprintf(go,"%s/%s",Rfile,Rlist[i].rdirent.d_name);
            struct stat ng;
            
            lstat(go,&ng);
            if(ng.st_mode==-1)
                exit(1);

            if(S_ISLNK(ng.st_mode))
            {
                continue;
            }

            if(!optTable[OPT__A])
            {
                if(*Rlist[i].rdirent.d_name=='.')
                    continue;
            }

            R(go);
        }
    }
    closedir(rdir);
    free(Rlist);
}

int sort_init(const void * ptr1, const void * ptr2)
{
    struct ifm * pos  = (struct ifm*)ptr1, * aftpos = (struct ifm*)ptr2;
    setlocale(LC_COLLATE,"");
    return strcoll(pos->rdirent.d_name,aftpos->rdirent.d_name) * order;
}

int sort_by_change_time(const void * ptr1, const void * ptr2)
{
    struct ifm * pos  = (struct ifm*)ptr1, * aftpos = (struct ifm*)ptr2;
    if(pos->buf__stat.st_ctime<aftpos->buf__stat.st_ctime)
        return 1 * order;
    if(pos->buf__stat.st_ctime>aftpos->buf__stat.st_ctime)
        return -1 * order;
    return 0;
}

void PrintList(struct ifm * readifm)
{

    if(S_ISREG(readifm->buf__stat.st_mode)
    &&!(readifm->buf__stat.st_mode & S_IXUSR))
        printf("%s",readifm->rdirent.d_name);
        
    if(S_ISREG(readifm->buf__stat.st_mode)
    &&(readifm->buf__stat.st_mode & S_IXUSR))
        printf("\033[1;32m%s\033[0m",readifm->rdirent.d_name);
        
    if(S_ISDIR(readifm->buf__stat.st_mode))
        printf("\033[1;34m%s\033[0m",readifm->rdirent.d_name);
        
        printf("  ");
}

void PrintWithL(struct ifm *readifm)
{
    // 第一列
    if(S_ISDIR(readifm->buf__stat.st_mode))printf("d");
    else if(S_ISLNK(readifm->buf__stat.st_mode))printf("l");
    else if(S_ISBLK(readifm->buf__stat.st_mode))printf("d");
    else if(S_ISCHR(readifm->buf__stat.st_mode))printf("c");
    else if(S_ISCHR(readifm->buf__stat.st_mode))printf("c");
    else printf("-");

    // 所有者权限
    printf(readifm->buf__stat.st_mode & S_IRUSR?"r":"-");
    printf(readifm->buf__stat.st_mode & S_IWUSR?"w":"-");
    printf(readifm->buf__stat.st_mode & S_IXUSR?"x":"-");
    //所属组权限
    printf(readifm->buf__stat.st_mode & S_IRGRP?"r":"-");
    printf(readifm->buf__stat.st_mode & S_IWGRP?"w":"-");
    printf(readifm->buf__stat.st_mode & S_IXGRP?"x":"-");

    //其他用户权限
    printf(readifm->buf__stat.st_mode & S_IROTH?"r":"-");
    printf(readifm->buf__stat.st_mode & S_IWOTH?"w":"-");
    printf(readifm->buf__stat.st_mode & S_IXOTH?"x":"-");

    printf(" %lu",readifm->buf__stat.st_nlink);
    printf(" %s",getpwuid(readifm->buf__stat.st_uid)->pw_name);
    printf(" %s",getgrgid(readifm->buf__stat.st_gid)->gr_name);
    printf("%lu ",readifm->buf__stat.st_size);
    
    struct tm * time = localtime(&readifm->buf__stat.st_mtime);
    char time_buf[64];
    strftime(time_buf, 64, "%m月 %d %H:%M",time);
    printf("%s ",time_buf);
}
```
