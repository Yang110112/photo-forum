---
AIGC:
    ContentProducer: Minimax Agent AI
    ContentPropagator: Minimax Agent AI
    Label: AIGC
    ProduceID: "00000000000000000000000000000000"
    PropagateID: "00000000000000000000000000000000"
    ReservedCode1: 304402201aefc45cda731be6eedc00ed4aaefb44db787b54f0f56bae70b49ce1838e2a86022057cd61ebadf86a99d6e75235e046da72943602d1d9d3271739166970cead3b4f
    ReservedCode2: 3046022100cf6127b486b215edf0fa9827ea6d12d9cdaba85beba6a11649a8b3c983d9358b022100de040d084b1ab106502127036a4385e88faef259533c514c4ed617e9ba822feb
---



# 前后端分离论坛系统 - 项目规范文档

## 一、项目概述

### 1.1 项目名称

**ForumHub** - 现代化社区论坛系统

### 1.2 项目目标

构建一个高性能、易扩展的前后端分离论坛系统，支持用户发帖、回帖、点赞、收藏等核心功能，采用现代化的技术栈确保良好的用户体验和代码可维护性。

### 1.3 项目特点

- 前后端完全分离，API驱动的开发模式
- 基于MongoDB的灵活数据模型
- JWT身份认证与权限管理
- 响应式设计，支持多端访问
- 组件化开发，代码复用率高

### 1.4 团队成员角色分配

| 成员  | 角色      | 主要职责                |
| --- | ------- | ------------------- |
| 成员A | 后端开发    | 项目协调、API开发、数据库设计    |
| 成员B | 前端开发（主） | React组件开发、页面实现、状态管理 |
| 成员C | 前端开发（辅） | UI设计、样式开发、响应式适配     |
| 成员D | 全栈开发    | 测试、部署、DevOps、文档     |

---

## 二、技术栈

### 2.1 前端技术栈

| 技术            | 版本   | 用途      |
| ------------- | ---- | ------- |
| React         | 18.x | UI框架    |
| React Router  | 6.x  | 路由管理    |
| Redux Toolkit | 2.x  | 状态管理    |
| Axios         | 1.x  | HTTP客户端 |
| Tailwind CSS  | 3.x  | CSS框架   |
| Ant Design    | 5.x  | UI组件库   |
| React Query   | 3.x  | 数据请求管理  |

### 2.2 后端技术栈

| 技术                | 版本   | 用途          |
| ----------------- | ---- | ----------- |
| Node.js           | 18.x | 运行时         |
| Express           | 4.x  | Web框架       |
| Mongoose          | 7.x  | MongoDB ORM |
| JWT               | 9.x  | 身份认证        |
| bcryptjs          | 2.x  | 密码加密        |
| Express-Validator | 6.x  | 数据验证        |

### 2.3 开发工具

| 工具              | 用途    |
| --------------- | ----- |
| Git             | 版本控制  |
| VS Code         | 开发IDE |
| Postman         | API测试 |
| MongoDB Compass | 数据库管理 |

---

## 三、功能模块

### 3.1 用户模块

| 功能   | 描述          | 优先级 |
| ---- | ----------- | --- |
| 用户注册 | 邮箱注册、验证码    | P0  |
| 用户登录 | JWT token认证 | P0  |
| 用户信息 | 头像、昵称、个人简介  | P1  |
| 修改密码 | 原密码验证       | P1  |
| 用户列表 | 分页、搜索       | P2  |
| 权限管理 | 管理员、普通用户    | P1  |

### 3.2 帖子模块

| 功能   | 描述       | 优先级 |
| ---- | -------- | --- |
| 创建帖子 | 富文本编辑器   | P0  |
| 帖子列表 | 分页、分类、排序 | P0  |
| 帖子详情 | 内容展示、评论  | P0  |
| 编辑帖子 | 仅作者可编辑   | P1  |
| 删除帖子 | 软删除      | P1  |
| 点赞/踩 | 交互功能     | P1  |

### 3.3 评论模块

| 功能   | 描述   | 优先级 |
| ---- | ---- | --- |
| 评论帖子 | 二级评论 | P0  |
| 评论列表 | 嵌套显示 | P0  |
| 删除评论 | 软删除  | P1  |
| 评论点赞 | 交互功能 | P1  |

### 3.4 分类模块

| 功能   | 描述     | 优先级 |
| ---- | ------ | --- |
| 分类列表 | 展示所有分类 | P1  |
| 分类管理 | 增删改查   | P2  |

### 3.5 收藏模块

| 功能   | 描述      | 优先级 |
| ---- | ------- | --- |
| 收藏帖子 | 收藏/取消收藏 | P1  |
| 收藏列表 | 我的收藏页面  | P2  |

---

## 四、数据库设计（MongoDB）

### 4.1 用户集合（users）

```javascript
{
  _id: ObjectId,
  username: String,          // 唯一，用户名
  email: String,             // 唯一，邮箱
  password: String,          // 加密存储
  avatar: String,            // 头像URL
  bio: String,               // 个人简介
  role: String,              // 'user' | 'admin'
  createdAt: Date,
  updatedAt: Date,
  isDeleted: Boolean         // 软删除标记
}
```

### 4.2 帖子集合（posts）

```javascript
{
  _id: ObjectId,
  title: String,             // 标题
  content: String,           // 正文（富文本HTML）
  author: ObjectId,          // 关联users
  category: ObjectId,        // 关联categories
  tags: [String],           // 标签数组
  viewCount: Number,         // 浏览量
  likeCount: Number,         // 点赞数
  commentCount: Number,      // 评论数
  status: String,            // 'published' | 'draft' | 'deleted'
  createdAt: Date,
  updatedAt: Date,
  isDeleted: Boolean
}
```

### 4.3 评论集合（comments）

```javascript
{
  _id: ObjectId,
  content: String,           // 评论内容
  author: ObjectId,          // 关联users
  post: ObjectId,            // 关联posts
  parent: ObjectId,          // 父评论（null为一级评论）
  likeCount: Number,         // 点赞数
  status: String,            // 'active' | 'deleted'
  createdAt: Date,
  updatedAt: Date
}
```

### 4.4 分类集合（categories）

```javascript
{
  _id: ObjectId,
  name: String,              // 分类名称
  slug: String,              // URL友好slug
  description: String,       // 分类描述
  icon: String,              // 图标
  order: Number,             // 排序
  postCount: Number,         // 该分类下的帖子数
  createdAt: Date,
  updatedAt: Date
}
```

### 4.5 点赞集合（likes）

```javascript
{
  _id: ObjectId,
  user: ObjectId,            // 关联users
  targetType: String,        // 'post' | 'comment'
  targetId: ObjectId,        // 关联目标
  createdAt: Date
}
```

### 4.6 收藏集合（favorites）

```javascript
{
  _id: ObjectId,
  user: ObjectId,            // 关联users
  post: ObjectId,            // 关联posts
  createdAt: Date
}
```

---

## 五、API接口设计

### 5.1 基础信息

- 基础URL：`http://localhost:3000/api/v1`
- 认证方式：JWT Bearer Token
- 数据格式：JSON

### 5.2 用户接口

| 方法   | 路径                 | 描述       | 认证  |
| ---- | ------------------ | -------- | --- |
| POST | /auth/register     | 用户注册     | 否   |
| POST | /auth/login        | 用户登录     | 否   |
| GET  | /users/me          | 获取当前用户   | 是   |
| PUT  | /users/me          | 更新用户信息   | 是   |
| PUT  | /users/me/password | 修改密码     | 是   |
| GET  | /users/:id         | 获取用户详情   | 否   |
| GET  | /users             | 用户列表（分页） | 否   |

### 5.3 帖子接口

| 方法     | 路径              | 描述   | 认证  |
| ------ | --------------- | ---- | --- |
| POST   | /posts          | 创建帖子 | 是   |
| GET    | /posts          | 帖子列表 | 否   |
| GET    | /posts/:id      | 帖子详情 | 否   |
| PUT    | /posts/:id      | 更新帖子 | 是   |
| DELETE | /posts/:id      | 删除帖子 | 是   |
| POST   | /posts/:id/like | 点赞帖子 | 是   |
| DELETE | /posts/:id/like | 取消点赞 | 是   |

### 5.4 评论接口

| 方法     | 路径                  | 描述     | 认证  |
| ------ | ------------------- | ------ | --- |
| POST   | /comments           | 创建评论   | 是   |
| GET    | /posts/:id/comments | 获取帖子评论 | 否   |
| DELETE | /comments/:id       | 删除评论   | 是   |
| POST   | /comments/:id/like  | 点赞评论   | 是   |

### 5.5 分类接口

| 方法     | 路径              | 描述   | 认证  |
| ------ | --------------- | ---- | --- |
| GET    | /categories     | 分类列表 | 否   |
| POST   | /categories     | 创建分类 | 是   |
| PUT    | /categories/:id | 更新分类 | 是   |
| DELETE | /categories/:id | 删除分类 | 是   |

### 5.6 收藏接口

| 方法     | 路径                 | 描述   | 认证  |
| ------ | ------------------ | ---- | --- |
| GET    | /favorites         | 我的收藏 | 是   |
| POST   | /favorites         | 添加收藏 | 是   |
| DELETE | /favorites/:postId | 取消收藏 | 是   |

---

## 六、项目结构

### 6.1 后端结构（backend/）

```
backend/
├── src/
│   ├── config/           # 配置文件
│   │   ├── database.js   # MongoDB连接
│   │   └── env.js       # 环境变量
│   ├── controllers/      # 控制器
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── postController.js
│   │   ├── commentController.js
│   │   ├── categoryController.js
│   │   └── favoriteController.js
│   ├── middleware/        # 中间件
│   │   ├── auth.js      # JWT验证
│   │   ├── errorHandler.js
│   │   └── validator.js
│   ├── models/           # 数据模型
│   │   ├── User.js
│   │   ├── Post.js
│   │   ├── Comment.js
│   │   ├── Category.js
│   │   ├── Like.js
│   │   └── Favorite.js
│   ├── routes/           # 路由
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── posts.js
│   │   ├── comments.js
│   │   ├── categories.js
│   │   └── favorites.js
│   ├── utils/            # 工具函数
│   │   ├── response.js
│   │   └── pagination.js
│   └── app.js            # 应用入口
├── package.json
└── .env
```

### 6.2 前端结构（frontend/）

```
frontend/
├── public/
├── src/
│   ├── api/              # API请求
│   │   ├── axios.js      # Axios配置
│   │   ├── auth.js
│   │   ├── posts.js
│   │   ├── comments.js
│   │   └── users.js
│   ├── components/       # 公共组件
│   │   ├── Header/
│   │   ├── Footer/
│   │   ├── PostCard/
│   │   ├── CommentItem/
│   │   └── Editor/
│   ├── pages/            # 页面组件
│   │   ├── Home/
│   │   ├── Login/
│   │   ├── Register/
│   │   ├── PostDetail/
│   │   ├── CreatePost/
│   │   ├── UserProfile/
│   │   └── Favorites/
│   ├── store/            # 状态管理
│   │   ├── store.js
│   │   ├── authSlice.js
│   │   └── postSlice.js
│   ├── styles/           # 样式文件
│   │   └── index.css
│   ├── utils/            # 工具函数
│   ├── hooks/            # 自定义hooks
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── vite.config.js
```

---

## 七、环境变量

### 7.1 后端 .env

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/forum
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### 7.2 前端 .env

```
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

---

## 八、Git分支策略

| 分支      | 用途    | 命名规则                        |
| ------- | ----- | --------------------------- |
| main    | 生产环境  | main                        |
| develop | 开发分支  | develop                     |
| feature | 功能开发  | feature/auth, feature/posts |
| bugfix  | Bug修复 | bugfix/login-issue          |
| hotfix  | 紧急修复  | hotfix/critical-bug         |

---

## 九、开发规范

### 9.1 Git提交规范

```
feat: 新功能
fix: Bug修复
docs: 文档更新
style: 代码格式
refactor: 重构
test: 测试
chore: 构建/工具
```

### 9.2 代码规范

- 遵循 ESLint 配置
- 使用 Prettier 格式化
- 组件采用 PascalCase 命名
- Hooks 使用 use 前缀
- 常量使用 UPPER_SNAKE_CASE

---

## 十、测试策略

### 10.1 API测试

- 使用 Postman 进行接口测试
- 编写自动化测试脚本（可选）

### 10.2 前后端联调

1. 后端启动：`npm run dev`
2. 前端启动：`npm run dev`
3. 配置代理解决跨域

---

## 十一、部署方案

### 11.1 开发环境

- MongoDB：本地安装
- 后端：localhost:3000
- 前端：localhost:5173

### 11.2 生产环境（可选扩展）

- 服务器：云服务器（阿里云/腾讯云）
- MongoDB：云数据库
- PM2：进程管理
- Nginx：反向代理

---

## 十二、里程碑计划

| 阶段      | 内容          | 预计时间    |
| ------- | ----------- | ------- |
| Phase 1 | 项目初始化、环境搭建  | 1天      |
| Phase 2 | 数据库设计与模型创建  | 1天      |
| Phase 3 | 后端API开发     | 3天      |
| Phase 4 | 前端框架搭建与组件开发 | 3天      |
| Phase 5 | 前后端联调与功能测试  | 2天      |
| Phase 6 | Bug修复与优化    | 1天      |
| **总计**  |             | **11天** |


