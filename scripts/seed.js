/**
 * ForumHub 数据库初始化脚本
 *
 * 此脚本用于初始化论坛系统的测试数据，包括：
 * - 创建管理员和测试用户
 * - 创建初始分类
 * - 创建示例帖子
 *
 * 使用方法：npm run seed
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// 导入数据模型
const User = require('../models/User');
const Category = require('../models/Category');
const Post = require('../models/Post');

/**
 * 种子数据配置
 */
const SEED_CONFIG = {
  // 测试用户数据
  users: [
    {
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
      bio: '论坛管理员，负责维护社区秩序',
    },
    {
      username: 'testuser',
      email: 'test@example.com',
      password: 'test123',
      role: 'user',
      bio: '这是测试用户的个人简介',
    },
    {
      username: 'john_doe',
      email: 'john@example.com',
      password: 'john123',
      role: 'user',
      bio: '热爱技术，关注前端开发',
    },
    {
      username: 'jane_smith',
      email: 'jane@example.com',
      password: 'jane123',
      role: 'user',
      bio: '全栈开发者，擅长 Node.js 和 React',
    },
  ],

  // 初始分类数据
  categories: [
    {
      name: '技术讨论',
      slug: 'tech',
      description: '分享技术心得，讨论开发问题',
      icon: 'code',
      order: 1,
    },
    {
      name: '前端开发',
      slug: 'frontend',
      description: 'HTML、CSS、JavaScript、React、Vue 等前端技术',
      icon: 'layout',
      order: 2,
    },
    {
      name: '后端开发',
      slug: 'backend',
      description: 'Node.js、Python、Java 等后端技术',
      icon: 'server',
      order: 3,
    },
    {
      name: '数据库',
      slug: 'database',
      description: 'MongoDB、MySQL、PostgreSQL 等数据库相关',
      icon: 'database',
      order: 4,
    },
    {
      name: 'DevOps',
      slug: 'devops',
      description: 'Docker、Kubernetes、CI/CD 等运维相关',
      icon: 'cloud',
      order: 5,
    },
    {
      name: '职场交流',
      slug: 'career',
      description: '职业发展、面试经验、工作心得',
      icon: 'briefcase',
      order: 6,
    },
    {
      name: '资源分享',
      slug: 'resources',
      description: '优质教程、开源项目、开发工具推荐',
      icon: 'gift',
      order: 7,
    },
    {
      name: '站务公告',
      slug: 'announcement',
      description: '论坛公告、活动通知、系统更新',
      icon: 'megaphone',
      order: 8,
    },
  ],

  // 示例帖子数据
  posts: [
    {
      title: '欢迎来到 ForumHub 论坛！',
      content: `<h2>欢迎各位开发者加入 ForumHub 社区</h2>
<p>这是一个专为开发者打造的交流平台，我们鼓励技术分享、经验交流和互助问答。</p>
<h3>论坛功能</h3>
<ul>
<li>发帖回帖，支持 Markdown 语法</li>
<li>点赞收藏，便捷管理感兴趣的内容</li>
<li>用户关注，构建自己的技术圈</li>
<li>分类浏览，快速找到感兴趣的话题</li>
</ul>
<h3>社区规则</h3>
<ol>
<li>尊重他人，友善交流</li>
<li>技术为先，质量优先</li>
<li>资源共享，互惠互利</li>
<li>遵纪守法，文明发言</li>
</ol>
<p>期待在这里与大家共同成长！</p>`,
      tags: ['欢迎', '公告', '新手必读'],
      status: 'published',
    },
    {
      title: 'React 18 新特性深度解析',
      content: `<h2>React 18 带来了哪些新变化？</h2>
<p>React 18 是近年来最重要的版本更新，引入了多项革命性的新特性。本文将深入解析这些新特性和它们背后的设计理念。</p>
<h3>1. 并发渲染（Concurrent Rendering）</h3>
<p>并发渲染是 React 18 的核心特性，它允许 React 同时准备多个版本的 UI。这意味着高优先级的更新（如用户输入）可以打断低优先级的更新（如数据加载）。</p>
<pre><code>import { startTransition } from 'react';</code></pre>
<h3>2. 自动批处理（Automatic Batching）</h3>
<p>React 18 默认将所有状态更新（包括 Promise、setTimeout 等）进行批处理，减少不必要的渲染次数。</p>
<h3>3. Suspense for Data Fetching</h3>
<p> Suspense 不再仅限于代码分割，现在也支持数据获取场景，提供更优雅的加载状态处理方式。</p>
<h3>4. 新的 Hooks</h3>
<ul>
<li><strong>useId</strong>：生成稳定的唯一 ID</li>
<li><strong>useTransition</strong>：标记非紧急更新</li>
<li><strong>useDeferredValue</strong>：延迟更新值</li>
<li><strong>useSyncExternalStore</strong>：外部状态订阅</li>
</ul>
<p>你开始使用 React 18 了吗？欢迎在评论区分享你的使用体验！</p>`,
      tags: ['React', '前端', '新特性', '深度解析'],
      status: 'published',
    },
    {
      title: 'Node.js + Express + MongoDB 实战项目搭建指南',
      content: `<h2>从零构建一个 RESTful API 项目</h2>
<p>本文将手把手教你搭建一个完整的 Node.js 后端项目，包含用户认证、帖子管理、评论功能等核心模块。</p>
<h3>项目结构</h3>
<pre><code>project/
├── src/
│   ├── config/         # 配置文件
│   ├── controllers/    # 控制器
│   ├── middleware/     # 中间件
│   ├── models/         # 数据模型
│   ├── routes/         # 路由
│   └── app.js          # 入口文件
└── package.json</code></pre>
<h3>核心依赖</h3>
<ul>
<li>express：Web 框架</li>
<li>mongoose：MongoDB ORM</li>
<li>jsonwebtoken：JWT 认证</li>
<li>bcryptjs：密码加密</li>
<li>express-validator：参数验证</li>
</ul>
<h3>数据库设计要点</h3>
<p>使用 Mongoose Schema 定义数据结构时，需要注意以下几点：</p>
<ol>
<li>合理设置索引，提升查询性能</li>
<li>使用 Ref 建立模型间关联</li>
<li>添加软删除字段，便于数据恢复</li>
<li>设置 Timestamps 自动管理时间戳</li>
</ol>
<p>完整代码已上传到 GitHub，欢迎 Star 和 Fork！</p>`,
      tags: ['Node.js', 'Express', 'MongoDB', '后端', '教程'],
      status: 'published',
    },
  ],
};

/**
 * 清除现有数据
 */
async function clearData() {
  console.log('正在清除现有数据...');
  await User.deleteMany({});
  await Category.deleteMany({});
  await Post.deleteMany({});
  console.log('数据清除完成');
}

/**
 * 创建测试用户
 */
async function createUsers() {
  console.log('正在创建用户...');
  const users = [];

  for (const userData of SEED_CONFIG.users) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = await User.create({
      ...userData,
      password: hashedPassword,
    });
    users.push(user);
    console.log(`  ✓ 用户 ${userData.username} 创建成功`);
  }

  console.log(`共创建 ${users.length} 个用户`);
  return users;
}

/**
 * 创建分类
 */
async function createCategories() {
  console.log('正在创建分类...');
  const categories = await Category.create(SEED_CONFIG.categories);
  console.log(`共创建 ${categories.length} 个分类`);
  return categories;
}

/**
 * 创建示例帖子
 */
async function createPosts(users, categories) {
  console.log('正在创建示例帖子...');
  const adminUser = users.find((u) => u.role === 'admin');
  const techCategory = categories.find((c) => c.slug === 'tech');
  const frontendCategory = categories.find((c) => c.slug === 'frontend');
  const backendCategory = categories.find((c) => c.slug === 'backend');

  const postsData = [
    {
      ...SEED_CONFIG.posts[0],
      author: adminUser._id,
      category: techCategory._id,
    },
    {
      ...SEED_CONFIG.posts[1],
      author: users[2]._id,
      category: frontendCategory._id,
    },
    {
      ...SEED_CONFIG.posts[2],
      author: users[3]._id,
      category: backendCategory._id,
    },
  ];

  const posts = await Post.create(postsData);
  console.log(`共创建 ${posts.length} 篇示例帖子`);
  return posts;
}

/**
 * 更新分类的帖子数量
 */
async function updateCategoryCounts() {
  console.log('正在更新分类帖子数量...');
  const categories = await Category.find({});

  for (const category of categories) {
    const count = await Post.countDocuments({
      category: category._id,
      status: 'published',
    });
    category.postCount = count;
    await category.save();
  }
  console.log('分类帖子数量更新完成');
}

/**
 * 主函数
 */
async function seed() {
  try {
    console.log('========================================');
    console.log('   ForumHub 数据库初始化脚本');
    console.log('========================================\n');

    // 连接数据库
    console.log('正在连接数据库...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`数据库连接成功: ${process.env.MONGODB_URI}\n`);

    // 执行种子操作
    await clearData();
    const users = await createUsers();
    const categories = await createCategories();
    await createPosts(users, categories);
    await updateCategoryCounts();

    // 输出测试账号信息
    console.log('\n========================================');
    console.log('   测试账号信息');
    console.log('========================================');
    console.log('管理员账号:');
    console.log('  邮箱: admin@example.com');
    console.log('  密码: admin123\n');
    console.log('测试用户账号:');
    console.log('  邮箱: test@example.com');
    console.log('  密码: test123\n');
    console.log('其他测试账号:');
    console.log('  邮箱: john@example.com / 密码: john123');
    console.log('  邮箱: jane@example.com / 密码: jane123');
    console.log('========================================\n');

    console.log('数据库初始化完成！');
    console.log('现在可以启动后端服务并访问论坛了。\n');

    process.exit(0);
  } catch (error) {
    console.error('数据库初始化失败:', error.message);
    process.exit(1);
  }
}

// 执行种子脚本
seed();
