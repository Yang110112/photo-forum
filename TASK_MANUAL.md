---
AIGC:
    ContentProducer: Minimax Agent AI
    ContentPropagator: Minimax Agent AI
    Label: AIGC
    ProduceID: "00000000000000000000000000000000"
    PropagateID: "00000000000000000000000000000000"
    ReservedCode1: 3046022100d35622985df2d0968643e71adcba3b0bb7c50f34b590170e465c06fed62b8a560221009960bca15e388354998628c12f76cb49a08551b9ace48b9b72691f9a75bec136
    ReservedCode2: 3045022100e0ccbcca83d7239cd1e9debc651b4d13406ddef0db4fe0e23091bfaeed3aea0d02207cb693bfa3d401828e77e87c707cf26f8354750adca2c3e0d7c842ec4306d622
---



# 四人团队任务分配手册

## 论坛项目专属细化任务手册

---

## 一、团队成员角色详情

### 1.1 成员A：项目经理 & 后端开发

**姓名**：（请填写）
**角色**： 后端开发
**核心职责**：项目整体协调、进度管理、API设计与实现、数据库架构

#### Phase 1：项目初始化与环境搭建（第1天）

| 序号   | 任务        | 描述                       | 交付物                    | 完成标准                          |
| ---- | --------- | ------------------------ | ---------------------- | ----------------------------- |
| A1.1 | 创建Git仓库   | 初始化项目仓库，配置.gitignore     | forum-project仓库        | 包含.gitignore（忽略node_modules等） |
| A1.2 | 项目目录结构    | 创建backend和frontend目录结构   | 目录结构文档                 | 符合SPEC.md中的结构                 |
| A1.3 | 后端基础配置    | package.json、Express基础配置 | src/app.js             | 能运行`npm run dev`              |
| A1.4 | MongoDB连接 | 配置Mongoose连接             | src/config/database.js | 能成功连接本地MongoDB                |
| A1.5 | 环境变量配置    | 创建.env文件模板               | .env.example           | 包含所有必需的环境变量                   |
| A1.6 | 进度协调会议    | 组织团队会议，明确分工              | 会议纪要                   | 确认每个人员的任务                     |

#### Phase 2：数据库设计与模型创建（第2天）

| 序号   | 任务         | 描述     | 交付物                    | 完成标准        |
| ---- | ---------- | ------ | ---------------------- | ----------- |
| A2.1 | User模型     | 用户数据模型 | src/models/User.js     | 包含所有字段定义和方法 |
| A2.2 | Post模型     | 帖子数据模型 | src/models/Post.js     | 包含所有字段和索引   |
| A2.3 | Comment模型  | 评论数据模型 | src/models/Comment.js  | 支持嵌套评论      |
| A2.4 | Category模型 | 分类数据模型 | src/models/Category.js | 分类管理功能      |
| A2.5 | Like模型     | 点赞数据模型 | src/models/Like.js     | 唯一索引防止重复点赞  |
| A2.6 | Favorite模型 | 收藏数据模型 | src/models/Favorite.js | 用户收藏关系      |
| A2.7 | 数据库测试      | 种子数据创建 | src/scripts/seed.js    | 可运行插入测试数据   |

#### Phase 3：后端API开发（第3-5天）

##### Day 3：认证模块

| 序号   | 任务     | 描述                  | 交付物                    | 完成标准         |
| ---- | ------ | ------------------- | ---------------------- | ------------ |
| A3.1 | 认证中间件  | JWT验证中间件            | src/middleware/auth.js | 能正确验证token   |
| A3.2 | 注册接口   | POST /auth/register | src/routes/auth.js     | 包含验证、加密、创建用户 |
| A3.3 | 登录接口   | POST /auth/login    | src/routes/auth.js     | 返回JWT token  |
| A3.4 | 用户资料接口 | GET/PUT /users/me   | src/routes/users.js    | 完整的CRUD      |

##### Day 4：核心业务API

| 序号   | 任务    | 描述      | 交付物                     | 完成标准   |
| ---- | ----- | ------- | ----------------------- | ------ |
| A4.1 | 帖子API | 增删改查    | src/routes/posts.js     | 6个接口完整 |
| A4.2 | 评论API | 增删改查    | src/routes/comments.js  | 支持嵌套评论 |
| A4.3 | 点赞API | 点赞/取消点赞 | src/routes/posts.js     | 防止重复点赞 |
| A4.4 | 收藏API | 收藏管理    | src/routes/favorites.js | 用户收藏列表 |

##### Day 5：高级功能与优化

| 序号   | 任务    | 描述     | 交付物                            | 完成标准       |
| ---- | ----- | ------ | ------------------------------ | ---------- |
| A5.1 | 分类API | 分类CRUD | src/routes/categories.js       | 完整的分类管理    |
| A5.2 | 错误处理  | 统一错误处理 | src/middleware/errorHandler.js | 所有错误返回统一格式 |
| A5.3 | 数据验证  | 请求验证   | src/middleware/validator.js    | 所有接口参数验证   |
| A5.4 | 分页功能  | 统一分页   | src/utils/pagination.js        | 所有列表接口支持   |

#### Phase 4：DevOps与文档（第6天）

| 序号   | 任务    | 描述        | 交付物                 | 完成标准     |
| ---- | ----- | --------- | ------------------- | -------- |
| A6.1 | API文档 | 使用JSDoc注释 | 所有路由文件              | 清晰的API文档 |
| A6.2 | 部署脚本  | 生产环境配置    | ecosystem.config.js | PM2配置    |
| A6.3 | 单元测试  | 核心业务测试    | src/__tests__/      | 覆盖主要功能   |

---

### 1.2 成员B：前端开发（主）

**姓名**：（请填写）
**角色**：前端主开发
**核心职责**：React组件开发、页面实现、Redux状态管理、API集成

#### Phase 1：前端初始化（第1天）

| 序号   | 任务        | 描述           | 交付物              | 完成标准                        |
| ---- | --------- | ------------ | ---------------- | --------------------------- |
| B1.1 | React项目创建 | 使用Vite创建项目   | frontend/        | `npm create vite@latest`    |
| B1.2 | 依赖安装      | 核心依赖         | package.json     | React Router、Redux Toolkit等 |
| B1.3 | 目录结构      | 创建项目目录       | 符合SPEC.md结构      | 组件、页面、API分层                 |
| B1.4 | Axios配置   | HTTP客户端配置    | src/api/axios.js | 拦截器配置完成                     |
| B1.5 | 路由配置      | React Router | src/App.jsx      | 路由表配置                       |

#### Phase 2：核心组件开发（第2-3天）

##### Day 2：基础组件

| 序号   | 任务         | 描述   | 交付物                      | 完成标准         |
| ---- | ---------- | ---- | ------------------------ | ------------ |
| B2.1 | Header组件   | 导航栏  | src/components/Header/   | Logo、导航、用户状态 |
| B2.2 | Footer组件   | 页脚   | src/components/Footer/   | 版权信息、链接      |
| B2.3 | PostCard组件 | 帖子卡片 | src/components/PostCard/ | 标题、摘要、作者、点赞数 |
| B2.4 | Loading组件  | 加载状态 | src/components/Loading/  | 全局加载效果       |

##### Day 3：业务组件

| 序号   | 任务            | 描述     | 交付物                         | 完成标准       |
| ---- | ------------- | ------ | --------------------------- | ---------- |
| B3.1 | Editor组件      | 富文本编辑器 | src/components/Editor/      | 支持富文本输入    |
| B3.2 | CommentItem组件 | 评论项    | src/components/CommentItem/ | 支持嵌套显示     |
| B3.3 | Pagination组件  | 分页器    | src/components/Pagination/  | 上一页、下一页、页码 |
| B3.4 | Modal组件       | 弹窗     | src/components/Modal/       | 确认、提示等场景   |

#### Phase 3：页面开发（第4-6天）

##### Day 4：认证与首页

| 序号   | 任务        | 描述           | 交付物                    | 完成标准                  |
| ---- | --------- | ------------ | ---------------------- | --------------------- |
| B4.1 | 登录页面      | Login.jsx    | src/pages/Login/       | 表单验证、错误提示             |
| B4.2 | 注册页面      | Register.jsx | src/pages/Register/    | 验证码、确认密码              |
| B4.3 | 首页        | Home.jsx     | src/pages/Home/        | 帖子列表、分类筛选             |
| B4.4 | AuthSlice | 认证状态管理       | src/store/authSlice.js | login、register、logout |

##### Day 5：内容页面

| 序号   | 任务        | 描述             | 交付物                    | 完成标准           |
| ---- | --------- | -------------- | ---------------------- | -------------- |
| B5.1 | 帖子详情页     | PostDetail.jsx | src/pages/PostDetail/  | 完整内容、评论、点赞     |
| B5.2 | 发帖页面      | CreatePost.jsx | src/pages/CreatePost/  | 分类选择、标签输入      |
| B5.3 | 编辑页面      | EditPost.jsx   | src/pages/EditPost/    | 继承CreatePost逻辑 |
| B5.4 | PostSlice | 帖子状态管理         | src/store/postSlice.js | CRUD操作         |

##### Day 6：用户中心

| 序号   | 任务      | 描述              | 交付物                    | 完成标准   |
| ---- | ------- | --------------- | ---------------------- | ------ |
| B6.1 | 用户资料页   | UserProfile.jsx | src/pages/UserProfile/ | 个人信息展示 |
| B6.2 | 编辑资料页   | EditProfile.jsx | src/pages/EditProfile/ | 头像上传   |
| B6.3 | 我的收藏页   | Favorites.jsx   | src/pages/Favorites/   | 收藏列表   |
| B6.4 | 收藏API集成 | favorites.js    | src/api/favorites.js   | 收藏功能完整 |

#### Phase 4：联调与优化（第7-8天）

| 序号   | 任务    | 描述          | 交付物             | 完成标准    |
| ---- | ----- | ----------- | --------------- | ------- |
| B7.1 | API联调 | 前后端对接       | 所有API           | 数据正确显示  |
| B7.2 | 错误处理  | 统一错误提示      | 全局ErrorBoundary | 友好的错误展示 |
| B7.3 | 性能优化  | React.memo等 | 关键组件            | 减少不必要渲染 |
| B7.4 | 响应式适配 | 移动端适配       | 样式调整            | 移动端体验良好 |

---

### 1.3 成员C：前端开发（辅）

**姓名**：（请填写）
**角色**：前端辅助开发
**核心职责**：UI设计、样式开发、组件美化、响应式适配

#### Phase 1：样式架构（第1-2天）

| 序号   | 任务         | 描述             | 交付物                      | 完成标准    |
| ---- | ---------- | -------------- | ------------------------ | ------- |
| C1.1 | Tailwind配置 | Tailwind CSS配置 | tailwind.config.js       | 自定义主题色  |
| C1.2 | 全局样式       | 全局CSS变量        | src/styles/variables.css | 主题变量定义  |
| C1.3 | 基础样式       | 重置样式           | src/styles/reset.css     | 统一浏览器样式 |
| C1.4 | 组件样式       | 基础组件样式         | src/components/*.css     | 一致的视觉风格 |

#### Phase 2：UI组件开发（第3-4天）

##### Day 3：表单组件

| 序号   | 任务         | 描述  | 交付物                         | 完成标准     |
| ---- | ---------- | --- | --------------------------- | -------- |
| C3.1 | Input组件    | 输入框 | src/components/ui/Input/    | 各种状态样式   |
| C3.2 | Button组件   | 按钮  | src/components/ui/Button/   | 主要、次要、禁用 |
| C3.3 | Select组件   | 下拉框 | src/components/ui/Select/   | 单选、多选    |
| C3.4 | Checkbox组件 | 复选框 | src/components/ui/Checkbox/ | 选中状态     |

##### Day 4：展示组件

| 序号   | 任务       | 描述  | 交付物                       | 完成标准    |
| ---- | -------- | --- | ------------------------- | ------- |
| C4.1 | Avatar组件 | 头像  | src/components/ui/Avatar/ | 不同尺寸、形状 |
| C4.2 | Badge组件  | 徽章  | src/components/ui/Badge/  | 数字徽章    |
| C4.3 | Card组件   | 卡片  | src/components/ui/Card/   | 阴影、边框效果 |
| C4.4 | Tag组件    | 标签  | src/components/ui/Tag/    | 可关闭标签   |

#### Phase 3：页面样式（第5-6天）

##### Day 5：主要页面样式

| 序号   | 任务     | 描述      | 交付物                                 | 完成标准    |
| ---- | ------ | ------- | ----------------------------------- | ------- |
| C5.1 | 登录/注册页 | 页面布局和样式 | src/pages/Login/Login.css           | 美观的表单样式 |
| C5.2 | 首页样式   | 列表布局    | src/pages/Home/Home.css             | 网格布局    |
| C5.3 | 帖子详情页  | 内容样式    | src/pages/PostDetail/PostDetail.css | 阅读体验优化  |

##### Day 6：用户中心与细节

| 序号   | 任务    | 描述    | 交付物                                 | 完成标准    |
| ---- | ----- | ----- | ----------------------------------- | ------- |
| C6.1 | 用户资料页 | 资料页样式 | src/pages/UserProfile/              | 个人信息展示  |
| C6.2 | 发帖页面  | 编辑器样式 | src/pages/CreatePost/CreatePost.css | 舒适的编辑体验 |
| C6.3 | 动画效果  | 过渡动画  | 所有页面                                | 微交互优化   |

#### Phase 4：响应式与优化（第7-8天）

| 序号   | 任务    | 描述         | 交付物                 | 完成标准    |
| ---- | ----- | ---------- | ------------------- | ------- |
| C7.1 | 移动端适配 | 响应式布局      | 所有页面                | 断点测试通过  |
| C7.2 | 暗色模式  | 深色主题（可选）   | src/styles/dark.css | 主题切换    |
| C7.3 | 图标优化  | SVG图标      | 所有页面                | 统一的图标风格 |
| C7.4 | 加载动画  | Skeleton加载 | 列表页                 | 内容加载骨架屏 |

---

### 1.4 成员D：全栈开发

**姓名**：（请填写）
**角色**：全栈开发
**核心职责**：测试、部署、DevOps、文档编写

#### Phase 1：测试准备（第1-2天）

| 序号   | 任务   | 描述      | 交付物                     | 完成标准   |
| ---- | ---- | ------- | ----------------------- | ------ |
| D1.1 | 测试框架 | Jest配置  | jest.config.js          | 可运行测试  |
| D1.2 | 后端测试 | API单元测试 | src/__tests__/backend/  | 覆盖主要接口 |
| D1.3 | 前端测试 | 组件测试    | src/__tests__/frontend/ | 关键组件测试 |
| D1.4 | 集成测试 | E2E测试   | e2e/                    | 关键流程测试 |

#### Phase 2：API测试（第3-4天）

##### Day 3：后端API测试

| 序号   | 任务   | 描述     | 交付物                            | 完成标准   |
| ---- | ---- | ------ | ------------------------------ | ------ |
| D3.1 | 认证测试 | 注册登录   | src/__tests__/auth.test.js     | 所有场景覆盖 |
| D3.2 | 帖子测试 | CRUD操作 | src/__tests__/posts.test.js    | 完整流程   |
| D3.3 | 评论测试 | 评论功能   | src/__tests__/comments.test.js | 嵌套评论   |

##### Day 4：测试用例补充

| 序号   | 任务   | 描述   | 交付物                              | 完成标准   |
| ---- | ---- | ---- | -------------------------------- | ------ |
| D4.1 | 收藏测试 | 收藏功能 | src/__tests__/favorites.test.js  | 收藏列表   |
| D4.2 | 分类测试 | 分类管理 | src/__tests__/categories.test.js | CRUD   |
| D4.3 | 错误测试 | 异常场景 | src/__tests__/errors.test.js     | 错误处理验证 |

#### Phase 3：文档编写（第5-6天）

##### Day 5：项目文档

| 序号   | 任务        | 描述   | 交付物                  | 完成标准    |
| ---- | --------- | ---- | -------------------- | ------- |
| D5.1 | README.md | 项目说明 | README.md            | 完整的项目文档 |
| D5.2 | API文档     | 接口文档 | docs/API.md          | 所有接口说明  |
| D5.3 | 部署文档      | 部署指南 | docs/DEPLOYMENT.md   | 详细的部署步骤 |
| D5.4 | 开发规范      | 代码规范 | docs/CONTRIBUTING.md | 贡献指南    |

##### Day 6：补充文档

| 序号   | 任务    | 描述   | 交付物                | 完成标准    |
| ---- | ----- | ---- | ------------------ | ------- |
| D6.1 | 数据库文档 | 数据字典 | docs/DATABASE.md   | 集合和字段说明 |
| D6.2 | 组件文档  | 组件说明 | docs/COMPONENTS.md | 组件使用说明  |
| D6.3 | FAQ文档 | 常见问题 | docs/FAQ.md        | 开发常见问题  |

#### Phase 4：部署与集成（第7-8天）

| 序号   | 任务       | 描述             | 交付物                            | 完成标准   |
| ---- | -------- | -------------- | ------------------------------ | ------ |
| D7.1 | CI/CD配置  | GitHub Actions | .github/workflows/             | 自动构建   |
| D7.2 | Docker配置 | 容器化            | Dockerfile, docker-compose.yml | 本地容器运行 |
| D7.3 | 环境配置     | 生产环境           | ecosystem.config.js            | PM2配置  |
| D7.4 | 性能监控     | 日志和监控          | 日志配置                           | 错误日志记录 |

---

## 二、每日站会内容

### 2.1 每日站会模板

```
格式：每日9:00，15分钟
参与者：全体成员

1. 昨天完成了什么？
2. 今天计划做什么？
3. 遇到了什么阻碍？

每人发言不超过2分钟
```

### 2.2 进度追踪表

| 日期    | 成员  | 计划任务  | 实际完成                         | 状态  |
| ----- | --- | ----- | ---------------------------- | --- |
| Day 1 | A   | 环境搭建  |                              |     |
|       | B   | 前端初始化 |  |     |
|       | C   | 样式架构  |                              |     |
|       | D   | 测试准备  |                              |     |
| Day 2 | ... |       |                              |     |

---

## 三、沟通机制

### 3.1 即时通讯

- 使用钉钉/企业微信群组
- 技术讨论群：每日问题汇总
- 项目管理群：任务同步

### 3.2 周会

- 时间：每周一、周四 15:00
- 内容：周报、进度回顾、问题解决

### 3.3 代码审查

- 所有PR需要至少1人review
- Review清单：
  - [ ] 代码风格符合规范
  - [ ] 有适当的测试
  - [ ] 文档已更新
  - [ ] 无明显性能问题

---

## 四、质量标准

### 4.1 代码质量

- ESLint检查通过
- 关键函数有注释
- 无console.log遗留
- 变量命名清晰

### 4.2 功能标准

- 所有P0功能必须完成
- P1功能完成率 > 90%
- P2功能尽力完成
- 无已知Bug遗留到下一阶段

### 4.3 文档标准

- README完整可读
- API文档与代码一致
- 部署文档经过验证

---

---

## 五、验收标准

### 5.1 代码验收

- [ ] 所有代码已提交到Git仓库
- [ ] 代码审查通过
- [ ] 测试覆盖率 > 70%
- [ ] ESLint检查无错误

### 5.2 功能验收

- [ ] 所有P0功能正常运行
- [ ] 核心业务流程无Bug
- [ ] 响应时间 < 500ms
- [ ] 移动端适配完成

### 5.3 文档验收

- [ ] README完整
- [ ] API文档完整
- [ ] 部署文档可执行
- [ ] 任务手册已归档

---

## 六、附录

### 6.1 Git命令参考

```bash
# 创建功能分支
git checkout -b feature/posts-api

# 提交代码
git add .
git commit -m "feat: add posts CRUD API"

# 推送分支
git push -u origin feature/posts-api

# 创建PR
# 在GitHub/GitLab创建Pull Request
```

### 6.2 环境启动命令

```bash
# 后端启动
cd backend
npm install
npm run dev

# 前端启动
cd frontend
npm install
npm run dev

# MongoDB（本地）
mongod --dbpath /data/db
```

### 6.3 常用端口

| 服务        | 端口    |
| --------- | ----- |
| 后端API     | 3000  |
| 前端开发      | 5173  |
| MongoDB   | 27017 |
| Redis（可选） | 6379  |

---

**手册版本**：v1.0
**创建日期**：（请填写）
**最后更新**：（请填写）
