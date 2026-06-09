
# ForumHub - 现代化社区论坛系统
项目链接：http://47.107.143.36
测试账号：admin@example.com
密码：admin123

## 项目简介

ForumHub 是一款基于前后端分离架构的现代化社区论坛系统，采用 React 作为前端框架，Node.js + Express 作为后端服务，MongoDB 作为数据存储。系统支持用户注册登录、发帖回帖、点赞收藏等核心论坛功能，采用 JWT 进行身份认证，提供流畅的用户体验和良好的代码可维护性。

本项目专门为四人团队开发设计，包含完整的项目规范文档和详细的团队任务分配手册，适合作为团队协作开发的实战练习项目。通过本项目，团队成员可以学习到前后端分离开发模式、RESTful API 设计、MongoDB 数据建模、React 组件化开发以及 Git 团队协作等核心技能。

## 核心功能特性

论坛系统提供了丰富的社区交流功能，涵盖用户管理、内容发布、互动交流等各个方面。用户模块支持邮箱注册、手机号绑定（可选）、密码找回等基础功能，采用 JWT 令牌进行身份认证，支持 Token 刷新机制保证用户体验。个人信息管理允许用户自定义头像、昵称、个人简介等资料，支持头像上传和裁剪功能。权限管理区分普通用户和管理员角色，管理员拥有内容审核、用户管理、分类管理等特殊权限。

帖子模块是论坛的核心功能，支持富文本编辑器创建内容，支持 Markdown 语法和代码高亮显示。帖子可以归属不同的分类标签，便于内容组织和检索。帖子列表支持分页浏览、按时间排序和按热度排序等多种展示方式。帖子的浏览量、点赞数、评论数等统计数据实时更新，让用户了解内容的受欢迎程度。

评论模块支持二级嵌套评论，用户可以对帖子进行评论，也可以对已有的评论进行回复。评论采用树形结构展示，清晰呈现对话脉络。评论内容同样支持点赞功能，优质评论可以获得更多曝光。评论管理允许用户编辑和删除自己发表的评论，管理员可以删除违规评论。

收藏模块允许用户收藏感兴趣的帖子，便于日后查阅。收藏列表支持按收藏时间排序，用户可以方便地管理自己的收藏内容。收藏功能与用户账号绑定，换设备登录后数据同步保留。

## 技术架构

### 前端技术栈

前端采用 React 18 作为核心框架，充分利用函数式组件和 Hooks 的优势实现高效的 UI 渲染。React Router 6 负责路由管理，采用声明式路由配置支持嵌套路由和路由守卫功能。Redux Toolkit 作为状态管理解决方案，提供标准化的状态操作模式和开发工具支持。Axios 作为 HTTP 客户端，配置请求拦截器和响应拦截器统一处理认证和错误。Ant Design 5.x 作为 UI 组件库，提供消息提示等交互组件。样式采用原生 CSS 文件按需导入的方式进行样式管理，每个组件和页面对应独立的 CSS 文件，存放在 src/css/ 目录下。

### 后端技术栈

后端采用 Node.js作为运行时环境，充分利用异步非阻塞 I/O 的优势处理高并发请求。Express 4.x 作为 Web 应用框架，提供简洁灵活的路由系统和中间件机制。Mongoose 7.x 作为 MongoDB 对象建模工具，通过 Schema 定义数据结构并提供丰富的查询 API。JSON Web Token（JWT）9.x 实现无状态身份认证，支持令牌签发和验证。bcryptjs 2.x 用于密码加密存储，采用业界标准的 bcrypt 算法保障用户密码安全。Express-Validator 6.x 提供请求参数验证功能，在控制器逻辑执行前进行数据校验。

### 开发工具链

版本控制采用 Git 进行代码管理，遵循 Git Flow 分支策略规范团队协作流程。开发环境使用 VS Code 作为代码编辑器，配置 ESLint 和 Prettier 保证代码风格统一。API 测试使用 Postman 或 Insomnia 等工具进行接口调试和自动化测试。数据库管理使用 MongoDB Compass 提供可视化的数据浏览和操作界面。调试工具使用 Chrome DevTools 和 VS Code Debugger 进行断点调试和性能分析。

## 项目结构

项目采用前后端分离的 monorepo 结构，将前端和后端代码组织在统一的项目根目录下。这种结构便于统一管理和协调开发，同时也支持前后端独立部署。根目录包含项目文档、规范手册以及前后端两个子项目目录。

```
project1/
├── SPEC.md                 # 项目技术规范文档
├── TASK_MANUAL.md          # 团队任务分配手册
├── README.md               # 项目说明文档
├── backend/                # 后端项目目录
│   ├── src/
│   │   ├── config/         # 配置文件
│   │   │   └── database.js
│   │   ├── controllers/    # 控制器
│   │   │   ├── authController.js
│   │   │   ├── userController.js
│   │   │   ├── postController.js
│   │   │   ├── commentController.js
│   │   │   ├── categoryController.js
│   │   │   └── favoriteController.js
│   │   ├── middleware/     # 中间件
│   │   │   ├── auth.js
│   │   │   ├── errorHandler.js
│   │   │   ├── validator.js
│   │   │   └── notFound.js
│   │   ├── models/         # 数据模型
│   │   │   ├── User.js
│   │   │   ├── Post.js
│   │   │   ├── Comment.js
│   │   │   ├── Category.js
│   │   │   ├── Like.js
│   │   │   └── Favorite.js
│   │   ├── routes/         # 路由定义
│   │   │   ├── auth.js
│   │   │   ├── users.js
│   │   │   ├── posts.js
│   │   │   ├── comments.js
│   │   │   ├── categories.js
│   │   │   └── favorites.js
│   │   └── app.js          # 应用入口
│   ├── scripts/
│   │   └── seed.js         # 数据库初始化脚本
│   ├── package.json
│   └── .env.example
└── ui/                     # 前端项目目录
    ├── public/
    │   └── favicon.svg
    ├── src/
    │   ├── api/            # API请求封装
    │   │   ├── axios.js
    │   │   ├── auth.js
    │   │   └── posts.js
    │   ├── components/     # 公共组件
    │   │   ├── AuthLayout.jsx
    │   │   ├── Header.jsx
    │   │   ├── Footer.jsx
    │   │   └── Layout.jsx
    │   ├── css/            # 样式文件
    │   ├── pages/          # 页面组件
    │   │   ├── Home.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Forum.jsx
    │   │   ├── PostDetail.jsx
    │   │   ├── CreatePost.jsx
    │   │   └── Profile.jsx
    │   ├── router/
    │   │   └── index.jsx
    │   ├── store/
    │   │   ├── store.js
    │   │   └── authSlice.js
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── package.json
    └── vite.config.js
```

## 快速开始

### 环境要求

在开始安装之前，请确保本地环境满足以下要求。Node.js 版本需要 18.0.0 或更高版本，推荐使用 LTS 版本以获得更好的稳定性和兼容性。npm 包管理器版本需要 8.0.0 或更高版本，通常随 Node.js 一起安装。MongoDB 数据库需要 5.0 或更高版本，可以选择本地安装或使用云数据库服务。Git 版本控制工具需要 2.0 或更高版本，用于代码管理和团队协作。

### 安装步骤

首先克隆项目代码到本地目录。打开终端，执行以下命令将项目下载到本地。克隆完成后，进入项目根目录可以看到前后端两个子项目。

```bash
git clone <repository-url>
```

然后分别安装后端和前端的依赖包。后端和前端各自独立管理依赖，需要分别执行安装命令。依赖安装过程可能需要几分钟时间，具体取决于网络连接速度和包的大小。如果遇到网络问题，可以考虑配置 npm 镜像源加速下载。

```bash
# 安装后端依赖
cd backend
npm install
cd ..

# 安装前端依赖
cd ui
npm install
cd ..
```

### 环境配置

安装完成后，需要配置必要的环境变量。后端需要配置数据库连接信息和 JWT 密钥，前端需要配置 API 基础地址。项目提供了 .env.example 文件作为配置模板。

在后端目录中，复制环境变量示例文件并编辑配置内容。将 MONGODB_URI 替换为你本地的 MongoDB 连接地址，将 JWT_SECRET 设置为一个足够复杂的随机字符串。

```bash
cd backend
cp .env.example .env
```

编辑 .env 文件内容：

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/forum
JWT_SECRET=your-super-secret-key-at-least-32-characters-long
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

在前端目录中，同样复制环境变量示例文件并配置 API 地址：

```bash
cd ui
cp .env.example .env
```

### 启动服务

配置完成后，按照以下顺序启动各项服务。首先确保 MongoDB 服务正在运行，如果没有启动需要先执行启动命令。MongoDB 默认监听 27017 端口，数据默认存储在 /data/db 目录。

```bash
# 启动 MongoDB（Linux/macOS）
mongod --dbpath /data/db

# 启动 MongoDB（Windows）
mongod --dbpath C:\data\db
```

然后启动后端服务。后端服务默认监听 3000 端口，使用 nodemon 监听文件变化实现热重载。

```bash
cd backend
npm run dev
```

最后启动前端服务。前端使用 Vite 作为开发服务器，默认监听 5173 端口，并自动打开浏览器访问。

```bash
cd ui
npm run dev
```

服务启动成功后，访问 http://localhost:5173 即可看到论坛首页。如果需要初始化测试数据，可以运行数据库种子脚本创建测试用户和分类。

```bash
cd backend
npm run seed
```

种子脚本会创建一个管理员账号（admin@example.com / password123）和几个初始分类，方便快速体验论坛功能。

## API 接口文档

### 基础信息

所有 API 接口遵循 RESTful 设计规范，使用 JSON 格式进行数据交换。认证接口通过 JWT Bearer Token 方式进行身份验证，需要在请求头中携带 Token。接口响应采用统一的 JSON 格式，包含状态码、消息和数据字段。

基础 URL 地址为 http://localhost:3000/api/v1，所有接口路径都基于此地址进行访问。成功响应的状态码为 200-299，错误响应的状态码为 400-500 系列。请求和响应的 Content-Type 均为 application/json。

### 认证接口

认证模块提供用户注册和登录功能，是进入系统的基础模块。注册接口 POST /auth/register 接收用户名、邮箱和密码参数，创建新用户并返回认证令牌。登录接口 POST /auth/login 接收邮箱和密码参数，验证通过后返回 JWT 令牌和用户信息。

```javascript
// 注册请求示例
POST /auth/register
Content-Type: application/json

{
  "username": "newuser",
  "email": "user@example.com",
  "password": "password123"
}

// 登录请求示例
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### 用户接口

用户模块提供用户信息管理和查询功能。获取当前用户信息接口 GET /users/me 需要携带认证令牌，返回登录用户的基本信息和统计数据。更新用户信息接口 PUT /users/me 允许用户修改个人资料，包括头像、昵称和个人简介。修改密码接口 PUT /users/me/password 要求提供原密码和新密码进行验证。

```javascript
// 获取当前用户
GET /users/me
Authorization: Bearer <token>

// 更新用户信息
PUT /users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "updatedname",
  "bio": "这是我的个人简介"
}
```

### 帖子接口

帖子模块是论坛的核心功能，提供帖子的完整 CRUD 操作。创建帖子接口 POST /posts 需要携带认证令牌和帖子内容，创建成功后返回帖子详情。帖子列表接口 GET /posts 支持分页、分类筛选和排序查询，返回帖子列表和分页信息。帖子详情接口 GET /posts/:id 返回帖子的完整内容和统计数据。更新和删除帖子接口需要验证作者身份，非作者无法修改他人帖子。

```javascript
// 创建帖子
POST /posts
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "帖子标题",
  "content": "<p>帖子正文内容</p>",
  "category": "分类ID",
  "tags": ["标签1", "标签2"]
}

// 获取帖子列表
GET /posts?page=1&limit=10&category=xxx&sort=createdAt
```

### 评论接口

评论模块支持帖子的评论功能，包括二级嵌套评论。创建评论接口 POST /comments 需要指定所属帖子和回复对象，支持对帖子评论和对评论回复两种模式。获取评论接口 GET /posts/:postId/comments 返回帖子的所有评论，采用树形结构组织嵌套关系。删除评论接口 DELETE /comments/:id 仅允许删除自己的评论。

```javascript
// 创建评论
POST /comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "评论内容",
  "post": "帖子ID",
  "parent": null  // 或 "父评论ID"
}
```

### 收藏接口

收藏模块允许用户收藏感兴趣的帖子。添加收藏接口 POST /favorites 需要指定要收藏的帖子 ID。获取收藏列表接口 GET /favorites 返回当前用户收藏的所有帖子，支持分页查询。取消收藏接口 DELETE /favorites/:postId 根据帖子 ID 取消收藏。

```javascript
// 添加收藏
POST /favorites
Authorization: Bearer <token>
Content-Type: application/json

{
  "post": "帖子ID"
}
```

## 团队成员与分工

本项目采用四人团队协作开发模式，明确的角色分工和任务边界有助于提高开发效率。以下是团队成员的角色定义和主要职责说明。

| 成员 | 角色 | 主要职责 |
|------|------|----------|
| 成员A | 项目经理 & 后端开发 | 项目协调与进度管理、API 设计与实现、数据库架构设计 |
| 成员B | 前端开发（主） | React 组件开发、页面实现、Redux 状态管理、API 集成 |
| 成员C | 前端开发（辅） | UI 设计、样式开发、响应式适配、组件美化 |
| 成员D | 全栈开发 | 测试用例编写、部署配置、文档编写、CI/CD 维护 |

详细的每日任务分配和开发进度计划请参考 TASK_MANUAL.md 文件。该手册包含完整的功能模块拆解、任务优先级定义和里程碑规划，是团队协作开发的重要参考文档。

## 开发规范

### Git 分支策略

项目采用 Git Flow 分支管理策略，定义明确的分支用途和合并流程。主分支（main）用于存放生产环境代码，仅接受来自发布分支的合并。开发分支（develop）用于集成所有已完成的功能开发，是日常开发的基础分支。功能分支（feature/*）用于开发新功能，从 develop 分支创建，完成后合并回 develop。修复分支（bugfix/*）用于修复生产环境的 Bug，从 main 或 develop 分支创建。热修复分支（hotfix/*）用于紧急修复生产环境问题，从 main 分支创建并直接合并。

### 代码提交规范

代码提交信息应清晰描述所做的更改，采用以下格式开头。feat 表示新增功能，fix 表示修复 Bug，docs 表示文档更新，style 表示代码格式调整（不影响功能），refactor 表示代码重构（不是新功能也不是修复），test 表示添加测试，chore 表示构建或辅助工具更新。

```bash
# 提交示例
git commit -m "feat: 添加用户头像上传功能"
git commit -m "fix: 修复帖子列表分页显示错误"
git commit -m "docs: 更新 API 接口文档"
```

### 代码风格规范

前端代码遵循 ESLint 配置的编码规范，使用 Prettier 进行代码格式化。组件命名采用 PascalCase 风格，如 UserProfile、PostCard 等。Hooks 自定义钩子使用 use 前缀命名，如 useAuth、usePosts 等。常量命名使用大写下划线格式，如 MAX_FILE_SIZE、API_BASE_URL 等。后端代码遵循 Express 最佳实践，控制器、路由和中间件职责分离。变量和函数命名使用 camelCase 风格，类和构造函数使用 PascalCase 风格。

## 常见问题

### MongoDB 连接失败

如果遇到 MongoDB 连接错误，首先确认 MongoDB 服务是否正在运行。可以在终端执行 mongod 命令手动启动服务。其次检查 .env 文件中的 MONGODB_URI 是否正确，本地连接字符串应为 mongodb://localhost:27017/forum。如果使用远程 MongoDB，确保网络可以访问且认证信息正确。

### 端口被占用

如果提示端口 3000 或 5173 被占用，说明该端口已被其他程序使用。可以使用系统命令查找占用端口的进程并结束它，然后重新启动服务。在 Linux/macOS 上使用 lsof -i :端口号 命令，在 Windows 上使用 netstat -ano | findstr :端口号 命令。也可以修改 .env 文件中的 PORT 值使用其他端口。

### 依赖安装失败

如果 npm install 过程中出现错误，首先检查网络连接是否稳定。某些包可能需要从国外服务器下载，可以考虑配置淘宝镜像加速。其次确认 Node.js 和 npm 版本是否符合要求，过旧或过新的版本可能导致兼容性问题。可以使用 nvm 工具管理多个 Node.js 版本。

### 跨域请求错误

如果浏览器控制台出现跨域错误，检查后端是否正确配置了 CORS 中间件。确保 app.js 中包含 cors() 中间件调用。如果使用代理方式解决跨域，确保 vite.config.js 中的代理配置正确指向运行中的后端服务。

## 许可证

本项目仅供学习和交流使用，未经授权不得用于商业目的。如有疑问或建议，请通过项目 Issues 页面联系我们。

## 致谢

感谢所有参与项目开发的团队成员，以及为本项目提供支持和帮助的朋友们。项目的成功离不开大家的共同努力和协作。


