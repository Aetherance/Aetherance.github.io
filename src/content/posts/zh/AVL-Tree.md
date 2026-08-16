---
title: "AVL-Tree"
description: "链表较低的查找效率推动了二叉搜索树的诞生。二叉搜索树可以以对数级别的时间复杂度进行查找。"
pubDate: 2025-01-29
lang: zh
tags: ["数据结构"]
draft: false
---

## 简介

链表较低的查找效率推动了二叉搜索树的诞生。二叉搜索树可以以对数级别的时间复杂度进行查找。

然而二叉搜索树在某些特定情况时(数据有序插入)会退化成类似于链表的结构，导致其搜索时的时间复杂度变为O(n)。

AVL树可以解决二叉树搜索树退化的问题。 它通过判断二叉树**是否失衡**，并在失衡时通过**旋转**将失衡的二叉树置为平衡状态，以防止其变为链表。

## 原理

AVL树的旋转方式有两种 —— 左旋和右旋

左旋使失衡节点(左右子树高度差的绝对值大于1的节点)围绕将成为新根的节点向左(逆时针)旋转，成为新根节点的左孩子，如果新根节点已经有了左孩子，则将其插到失衡节点的右边。

右旋使失衡节点(左右子树高度差的绝对值大于1的节点)围绕将成为新根的节点向右(顺时针)旋转，成为新根节点的右孩子，如果新根节点已经有了右孩子，则将其插到失衡节点的左边。

AVL树引入平衡因子的概念描述树的平衡状态。平衡因子是左边的节点高度减右边的节点高度。

AVL树有四种失衡状态

1. LL型
   
   失衡节点的平衡因子是2 其
   
   左
   
   孩子的平衡因子是1 需要右旋
2. RR型
   
   失衡节点的平衡因子是-2 其
   
   右
   
   孩子的平衡因子是-1 需要左旋
3. LR型
   
   失衡节点的平衡因子是2 其
   
   左
   
   孩子的平衡因子是-1 需要先左旋左孩子再右旋失衡节点
4. RL型
   
   失衡节点的平衡因子是-2 其
   
   右
   
   孩子的平衡因子是1 需要先右旋右孩子再左旋失衡节点

## 实现

```cpp
// AVL树节点实现
struct Node
{
    int val;
    int height;
    Node * left;
    Node * right;
    Node(int);
};

Node::Node(int val) {
    this->height = 1;
    this->left = nullptr;
    this->right = nullptr;
    this->val = val;
}
```

```cpp
int getHeight(Node * target) {
    // 获取树的高度 (处理nullptr)
    if(target == nullptr) {
        return 0;
    }
    return target->height;
}

void updateHeight(Node * target) {
    // 更新高度
    target->height = max(getHeight(target->left),getHeight(target->right)) + 1;
}

int getBalance(Node * target) {
    // 获取平衡因子
    return getHeight(target->left) - getHeight(target->right);
}
```

*遍历*

```cpp
// 使用中序遍历以验证二叉搜索树的性质没有被破坏
void InOrder(Node * root) {
    if(root == nullptr) {
        return ;
    }

    InOrder(root->left);
    cout<<root->val<<endl;
    InOrder(root->right);
}
```

*旋转*

```cpp
// 左旋
void LeftRotate(Node ** root) {
    Node * new_root = (*root)->right;   // 新根节点
    Node * T = new_root->left;  // 冲突子树

    new_root->left = *root;
    (*root)->right = T;

    updateHeight(*root);    // 更新高度
    updateHeight(new_root);

    *root = new_root;    // 改变根节点
}

// 右旋
void RightRotate(Node ** root) {
    Node * new_root = (*root)->left;
    Node * T = new_root->right;

    new_root->right = (*root);
    (*root)->left = T;

    updateHeight(*root);
    updateHeight(new_root);

    *root = new_root;
}
```

*插入*

```cpp
void Insert(Node ** root,int val) {
    // 找到合适空位置后插入
    if(*root == nullptr) {
        *root = new Node(val);
        return ;
    }

    // 防止重复插入
    if(val == (*root)->val) {
        return;
    }

    // 判断大小，递归寻找
    if(val<(*root)->val) {
        Insert(&(*root)->left,val);
    }
    else if(val>(*root)->val) {
        Insert(&(*root)->right,val);
    }
    
    // 更新高度
    updateHeight(*root);

    // 获取平衡因子
    int balance = getBalance(*root);

    // 判断是否失衡并旋转
    if(balance == 2) {
        if(getBalance((*root)->left) == 1) {
            RightRotate(root);
        } 
        else if(getBalance((*root)->left) == -1) {
            LeftRotate(&(*root)->left);
            RightRotate(&(*root));
        }
    }
    else if(balance == -2) {
        if(getBalance((*root)->right) == 1) {
            RightRotate(&(*root)->right);
            LeftRotate(root);
        }
        else if(getBalance((*root)->right) == -1) {
            LeftRotate(root);
        }
    }
}
```

*删除*

```cpp
// 删除左右都不为空时的节点时需要获取左子树最大值节点 (或右子树最小节点)
Node * findLeftMax(Node * root) {
    Node * max = root->left;
    while (max && max->right) {
        max = max->right;
    }
    return max;
}

void remove(Node ** root,int val) {
    // 防止空指针解引用
    if(*root == nullptr) {
        return;
    }

    // 寻找
    if(val<(*root)->val) {
        remove(&(*root)->left,val); 
    }
    else if(val > (*root)->val) {
        remove(&(*root)->right,val);
    }
    else {
        // 如果找到对应值，开始删除
        // 删除有三种情况
        // 1.左右都是空 直接删除即可
        // 2.左右有一个是空 和链表删除类似
        // 3.左右都不是空 要找到子树中刚好比该节点大或小的节点 即左子树的最大节点或者右子树的最小节点
        // 此处用 findLeftMax找到左子树的最大节点，然后用其值替换删除节点，最后删除左子树的最大节点
        Node * temp = *root;
        if(!(*root)->left && !(*root)->right) {
            delete *root;
            *root = nullptr;
        }
        else if((*root)->left && !(*root)->right) {
            *root = (*root)->left;
            delete temp;
        }
        else if((*root)->right && !(*root)->left) {
            *root = (*root)->right;
            delete temp;
        }
        else {
            Node * leftMax = findLeftMax(*root);
            (*root)->val = leftMax->val;
            remove(&(*root)->left,leftMax->val);
        }
    }
    
    if(*root == nullptr ) {
        return;
    } // 删除后可能出现空指针

    updateHeight(*root);

    // 与插入类似的失衡判断
    int balance = getBalance(*root);

    if(balance == 2) {
        int lb = getBalance((*root)->left);
        if(lb == 1) {
            RightRotate(root);
        }
        else if(lb == -1) {
            LeftRotate(&(*root)->left);
            RightRotate(root);
        }
    }
    else if(balance == -2) {
        int rb = getBalance((*root)->right);
        if(rb == -1) {
            LeftRotate(root);
        }
        else if(rb == 1) {
            RightRotate(&(*root)->right);
            LeftRotate(root);
        }
    }
}
```

[完整代码](https://github.com/Aetherance/DataStruct/blob/master/Tree/MyAVL.cpp)
