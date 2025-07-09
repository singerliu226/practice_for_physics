# 物理刷题网站后端

基于 NestJS + Prisma + PostgreSQL 构建的初中物理刷题网站后端服务。

## 技术栈

- **框架**: NestJS (Node.js + TypeScript)
- **数据库**: PostgreSQL + Prisma ORM
- **认证**: JWT + bcrypt
- **日志**: Winston + 文件轮转
- **验证**: class-validator + class-transformer

## 功能模块

- ✅ **认证模块** (AuthModule): 用户注册、登录、JWT令牌管理
- ✅ **用户模块** (UserModule): 学生、教师信息管理
- ✅ **日志模块** (LoggerModule): 结构化日志记录
- ✅ **数据库模块** (PrismaModule): 数据库连接与ORM
- 🚧 **题库模块** (QuestionBank): 题目管理、导入
- 🚧 **练习模块** (Exercise): 答题记录、统计
- 🚧 **AI规划模块** (AI Planner): 个性化学习建议

## 快速开始

### 1. 安装依赖

\`\`\`bash
npm install
\`\`\`

### 2. 数据库设置

确保已安装 PostgreSQL，然后：

\`\`\`bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，配置数据库连接信息
# DATABASE_URL="postgresql://username:password@localhost:5432/physics_practice?schema=public"
\`\`\`

### 3. 数据库迁移

\`\`\`bash
# 生成 Prisma 客户端
npx prisma generate

# 运行数据库迁移
npx prisma migrate dev --name init

# (可选) 查看数据库
npx prisma studio
\`\`\`

### 4. 启动开发服务器

\`\`\`bash
npm run start:dev
\`\`\`

服务器将在 `http://localhost:3000` 启动。

## API 端点

### 认证相关

\`\`\`
POST /auth/register     # 用户注册
POST /auth/login        # 用户登录  
POST /auth/refresh      # 刷新令牌
\`\`\`

### 用户相关

\`\`\`
GET  /users/profile     # 获取当前用户信息 (需要JWT)
\`\`\`

## 数据模型

- **User**: 用户基础信息 (邮箱、密码、角色)
- **Student**: 学生档案 (姓名、年级、学习进度)
- **Teacher**: 教师档案 (姓名、科目、班级)
- **Class**: 班级信息
- **Question**: 题目库 (内容、选项、答案、章节)
- **ExerciseRecord**: 答题记录
- **WrongQuestion**: 错题本

## 项目结构

\`\`\`
src/
├── auth/                 # 认证模块
│   ├── guards/          # JWT守卫、角色守卫
│   ├── dto/             # 数据传输对象
│   └── auth.service.ts  # 认证服务
├── user/                # 用户模块
├── common/              # 通用模块
│   ├── prisma/         # 数据库服务
│   └── logger/         # 日志服务
├── app.module.ts        # 根模块
└── main.ts             # 应用启动入口
\`\`\`

## 开发命令

\`\`\`bash
npm run start:dev        # 开发模式启动
npm run build            # 构建生产版本
npm run test             # 运行测试
npm run lint             # 代码检查
npm run prisma:generate  # 生成Prisma客户端
npm run prisma:migrate   # 运行数据库迁移
\`\`\`

## 环境变量

请查看 `.env.example` 了解所需的环境变量配置。

## 下一步开发计划

1. **题库模块**: 实现题目CRUD、Word文档解析导入
2. **练习模块**: 答题逻辑、进度统计、错题管理  
3. **AI规划模块**: 集成Deepseek API，智能学习建议
4. **文件上传**: 支持教师上传Word题库文件
5. **实时推送**: WebSocket支持实时消息推送
6. **数据分析**: 学习报表、可视化图表

---

🚀 **开发状态**: 核心认证与用户模块已完成，可进行基础功能测试 