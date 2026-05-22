/**
 * 摄影论坛 数据库初始化脚本
 *
 * 此脚本用于初始化论坛系统的测试数据，包括：
 * - 创建管理员和测试用户
 * - 创建摄影分类
 * - 创建示例摄影帖子
 *
 * 使用方法：npm run seed
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// 导入数据模型
const User = require('../src/models/User');
const Category = require('../src/models/Category');
const Post = require('../src/models/Post');
const Friendship = require('../src/models/Friendship');
const PrivateMessage = require('../src/models/PrivateMessage');

/**
 * 种子数据配置
 */
const SEED_CONFIG = {
  // 测试用户数据
  users: [
    {
      username: 'system_official',
      email: 'system@forum.com',
      password: 'system123456',
      role: 'admin',
      bio: '摄影论坛官方助手，为您提供系统更新和维护通知服务。',
      avatar: '',
    },
    {
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
      bio: '摄影论坛管理员，热爱摄影，负责维护社区秩序',
    },
    {
      username: 'light_hunter',
      email: 'test@example.com',
      password: 'test123',
      role: 'user',
      bio: '风光摄影爱好者，喜欢用镜头记录山川湖海',
    },
    {
      username: 'street_shot',
      email: 'street@example.com',
      password: 'street123',
      role: 'user',
      bio: '街头摄影师，捕捉城市中最真实的瞬间',
    },
    {
      username: 'star_traveler',
      email: 'star@example.com',
      password: 'star123',
      role: 'user',
      bio: '星空摄影发烧友，追逐银河和极光的脚步从未停歇',
    },
  ],

  // 摄影分类数据
  categories: [
    {
      name: '风光摄影',
      slug: 'landscape',
      description: '山川大地、日出日落、自然风光作品分享',
      icon: 'mountain',
      order: 1,
    },
    {
      name: '人像摄影',
      slug: 'portrait',
      description: '人物肖像、环境人像、情绪写真',
      icon: 'user',
      order: 2,
    },
    {
      name: '街头摄影',
      slug: 'street',
      description: '城市街拍、纪实影像、生活瞬间',
      icon: 'camera',
      order: 3,
    },
    {
      name: '动物摄影',
      slug: 'wildlife',
      description: '野生动物、宠物、鸟类摄影作品',
      icon: 'paw',
      order: 4,
    },
    {
      name: '美食摄影',
      slug: 'food',
      description: '美食拍摄技巧与作品分享',
      icon: 'utensils',
      order: 5,
    },
    {
      name: '星空摄影',
      slug: 'astrophoto',
      description: '银河、星轨、极光、天文摄影',
      icon: 'star',
      order: 6,
    },
    {
      name: '器材交流',
      slug: 'gear',
      description: '相机、镜头、三脚架等器材讨论与评测',
      icon: 'settings',
      order: 7,
    },
    {
      name: '后期修图',
      slug: 'editing',
      description: 'Lightroom、Photoshop 后期处理技巧分享',
      icon: 'sliders',
      order: 8,
    },
  ],

  // 示例摄影帖子数据
  posts: [
    {
      title: '欢迎来到摄影论坛！',
      content: `<h2>欢迎各位摄影爱好者加入摄影论坛</h2>
<p>这是一个专为摄影爱好者打造的交流平台，我们鼓励作品分享、技巧交流和互助问答。</p>
<h3>论坛功能</h3>
<ul>
<li>发布摄影作品，分享拍摄心得</li>
<li>点赞收藏，发现优秀作品</li>
<li>评论互动，交流拍摄技巧</li>
<li>分类浏览，探索不同摄影风格</li>
</ul>
<h3>社区规则</h3>
<ol>
<li>尊重原创，禁止盗图</li>
<li>友善交流，互相学习</li>
<li>分享技巧，共同进步</li>
<li>遵纪守法，文明发言</li>
</ol>
<p>期待在这里看到你的精彩作品！</p>`,
      tags: ['欢迎', '公告', '新手必读'],
      images: [
        'https://picsum.photos/id/10/800/500',
        'https://picsum.photos/id/15/800/500',
      ],
      status: 'published',
    },
    {
      title: '日出时分的金色梯田 — 元阳哈尼梯田拍摄分享',
      content: `<h2>元阳哈尼梯田 — 光与水的交响</h2>
<p>上周去云南元阳拍摄了哈尼梯田的日出，清晨5点半就到达了多依树观景台等待第一缕阳光。</p>
<h3>拍摄参数</h3>
<ul>
<li><strong>相机</strong>：Sony A7R5</li>
<li><strong>镜头</strong>：24-70mm f/2.8 GM II</li>
<li><strong>光圈</strong>：f/11</li>
<li><strong>快门</strong>：1/125s</li>
<li><strong>ISO</strong>：200</li>
<li><strong>滤镜</strong>：GND 0.9 渐变镜</li>
</ul>
<h3>拍摄心得</h3>
<p>梯田摄影最重要的是光线和天气。日出前半小时到达机位，使用渐变镜平衡天空与地面的曝光差。当阳光照射到水面时，梯田会呈现金色的光泽，这是最佳的拍摄时机。</p>
<p>建议使用三脚架拍摄，焦段在35-70mm之间可以获得最佳构图。后期可以适当提高饱和度和对比度，让梯田的层次感更加突出。</p>
<p>欢迎大家分享你们的风光摄影作品！</p>`,
      tags: ['风光', '日出', '梯田', '云南'],
      images: [
        'https://picsum.photos/id/29/800/500',
        'https://picsum.photos/id/36/800/500',
        'https://picsum.photos/id/37/800/500',
      ],
      status: 'published',
    },
    {
      title: '城市夜景长曝光技巧 — 如何拍出丝滑的车轨光影',
      content: `<h2>城市夜景长曝光完全指南</h2>
<p>夜晚的城市有着独特的魅力，车水马龙的灯光拖曳出绚丽的光轨。本文分享我在城市夜景长曝光方面的一些经验。</p>
<h3>必备器材</h3>
<ul>
<li>稳固的三脚架（必须！）</li>
<li>快门线或遥控器</li>
<li>ND 减光镜（傍晚时段需要）</li>
<li>广角镜头（推荐 16-35mm）</li>
</ul>
<h3>拍摄设置</h3>
<ol>
<li>ISO 设为最低值（100 或 50）</li>
<li>光圈 f/8 - f/16，保证画面锐度</li>
<li>快门速度 10-30 秒，根据车流量调整</li>
<li>使用 2 秒延时或快门线避免机震</li>
</ol>
<h3>构图建议</h3>
<p>寻找有弯道的路口，车轨的曲线会让画面更有动感。天桥是非常好的拍摄位置，可以俯拍形成对称的光轨效果。</p>
<p>蓝调时刻（日落后20-40分钟）是拍摄夜景的黄金时间，天空还保留着深蓝色，与城市灯光形成美妙的对比。</p>
<p>大家有什么夜景拍摄的好机位推荐吗？评论区聊聊！</p>`,
      tags: ['夜景', '长曝光', '车轨', '城市', '技巧'],
      images: [
        'https://picsum.photos/id/65/800/500',
        'https://picsum.photos/id/57/800/500',
      ],
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
  await Friendship.deleteMany({});
  await PrivateMessage.deleteMany({});
  console.log('数据清除完成');
}

/**
 * 创建测试用户
 */
async function createUsers() {
  console.log('正在创建用户...');
  const users = [];

  for (const userData of SEED_CONFIG.users) {
    const user = await User.create({
      ...userData,
    });
    users.push(user);
    console.log(`  ✓ 用户 ${userData.username} 创建成功`);
  }

  console.log(`共创建 ${users.length} 个用户`);
  return users;
}

/**
 * 为用户自动添加官方好友并发送欢迎消息
 */
async function addOfficialFriendToUsers(users) {
  console.log('正在为用户添加官方好友...');
  const systemUser = users.find(u => u.username === 'system_official');
  if (!systemUser) {
    console.log('  未找到官方用户，跳过');
    return;
  }

  for (const user of users) {
    if (user.username === 'system_official') continue;

    // 创建好友关系
    await Friendship.create({
      fromUser: systemUser._id,
      toUser: user._id,
      status: 'accepted',
      isSystem: true,
      message: '欢迎加入摄影论坛！我是系统官方助手，会为您推送系统更新和维护通知。'
    });

    // 发送欢迎消息
    const PrivateMessage = require('../src/models/PrivateMessage');
    const conversationId = PrivateMessage.generateConversationId(systemUser._id, user._id);
    await PrivateMessage.create({
      conversationId,
      sender: systemUser._id,
      receiver: user._id,
      content: `你好 ${user.username}，欢迎加入摄影论坛！\n\n我是系统官方助手，以后如果有系统更新、维护通知或重要公告，我会通过私聊通知你。\n\n如有任何问题，也可以随时给我发消息。祝你在这里玩得开心！`
    });

    console.log(`  ✓ 已为 ${user.username} 添加官方好友并发送欢迎消息`);
  }
}

/**
 * 创建分类
 */
async function createCategories() {
  console.log('正在创建摄影分类...');
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
  const landscapeCategory = categories.find((c) => c.slug === 'landscape');
  const streetCategory = categories.find((c) => c.slug === 'street');

  const postsData = [
    {
      ...SEED_CONFIG.posts[0],
      author: adminUser._id,
      category: landscapeCategory._id,
    },
    {
      ...SEED_CONFIG.posts[1],
      author: users[1]._id,
      category: landscapeCategory._id,
    },
    {
      ...SEED_CONFIG.posts[2],
      author: users[2]._id,
      category: streetCategory._id,
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
    console.log('   摄影论坛 数据库初始化脚本');
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
    await addOfficialFriendToUsers(users);
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
    console.log('  邮箱: test@example.com (light_hunter)');
    console.log('  密码: test123\n');
    console.log('其他测试账号:');
    console.log('  邮箱: street@example.com (street_shot) / 密码: street123');
    console.log('  邮箱: star@example.com (star_traveler) / 密码: star123');
    console.log('========================================\n');

    console.log('数据库初始化完成！');
    console.log('现在可以启动后端服务并访问摄影论坛了。\n');

    process.exit(0);
  } catch (error) {
    console.error('数据库初始化失败:', error.message);
    process.exit(1);
  }
}

// 执行种子脚本
seed();
