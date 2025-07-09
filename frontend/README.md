# 物理刷题平台 - 前端项目

基于 Next.js + TypeScript + Ant Design + Tailwind CSS 构建的现代化物理学习平台前端。

## 🚀 技术栈

- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **UI库**: Ant Design + Tailwind CSS  
- **状态管理**: Redux Toolkit + RTK Query
- **HTTP客户端**: Axios
- **认证**: JWT + Cookie
- **样式**: CSS-in-JS + 原子化CSS

## 📁 项目结构

```
src/
├── app/                    # Next.js App Router页面
│   ├── login/             # 登录页面
│   ├── register/          # 注册页面
│   ├── student/           # 学生端页面
│   │   ├── page.tsx       # 学生主页
│   │   └── exercise/      # 练习页面
│   ├── teacher/           # 教师端页面
│   │   └── page.tsx       # 教师主页
│   ├── layout.tsx         # 根布局
│   ├── page.tsx           # 首页
│   └── globals.css        # 全局样式
├── components/            # 可复用组件
├── lib/                   # 工具库
│   └── api.ts            # API客户端配置
└── store/                 # Redux状态管理
    ├── index.ts          # Store配置
    └── slices/           # Redux Slices
        ├── authSlice.ts  # 认证状态
        ├── exerciseSlice.ts # 练习状态
        └── questionSlice.ts # 题库状态
```

## 🎯 核心功能

### 用户认证
- ✅ 用户登录/注册界面
- ✅ JWT令牌管理
- ✅ 自动令牌刷新
- ✅ 角色权限控制 (学生/教师)

### 学生端功能
- ✅ 学习数据统计面板
- ✅ 练习模式选择 (随机/章节/错题/难度)
- ✅ 实时答题界面
- ✅ 答案解析展示
- ✅ 学习进度跟踪
- ✅ AI学习建议

### 教师端功能  
- ✅ 题库管理界面
- ✅ Word文档导入功能
- ✅ 学生学习监控
- ✅ 数据统计分析
- ✅ 章节题目管理

### 响应式设计
- ✅ 移动端适配
- ✅ 多屏幕尺寸支持
- ✅ 现代化UI设计

## 🛠️ 开发命令

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 代码检查
npm run lint
```

## 🔧 环境配置

创建 `.env.local` 文件：

```env
# API配置
NEXT_PUBLIC_API_URL=http://localhost:3001

# 应用配置
NEXT_PUBLIC_APP_NAME=物理刷题平台
NEXT_PUBLIC_DEBUG=true
```

## 🚀 部署

项目支持多种部署方式：

1. **Vercel** (推荐)
2. **Docker容器**
3. **静态部署**
4. **Node.js服务器**

## 📱 页面路由

| 路由 | 说明 | 状态 |
|------|------|------|
| `/` | 首页 | ✅ 完成 |
| `/login` | 登录页 | ✅ 完成 |
| `/register` | 注册页 | ✅ 完成 |
| `/student` | 学生主页 | ✅ 完成 |
| `/student/exercise` | 练习页面 | ✅ 完成 |
| `/teacher` | 教师主页 | ✅ 完成 |

## 🔄 状态管理

使用 Redux Toolkit 管理全局状态：

- **AuthSlice**: 用户认证状态
- **ExerciseSlice**: 练习会话状态  
- **QuestionSlice**: 题库数据状态

## 🎨 UI设计系统

基于 Ant Design 组件库，配合 Tailwind CSS：

- 主色调：蓝色系 (#1890ff)
- 辅助色：绿色、橙色、红色
- 圆角：8px
- 阴影：多层次设计
- 字体：系统字体栈

## 📦 核心依赖

```json
{
  "next": "15.3.5",
  "react": "18.x",
  "antd": "latest",
  "@reduxjs/toolkit": "latest", 
  "axios": "latest",
  "tailwindcss": "latest",
  "typescript": "latest"
}
```

## 🔗 API集成

与后端NestJS服务完全集成：

- 自动JWT认证
- 请求/响应拦截器
- 错误处理
- 令牌自动刷新

## 📈 项目状态

当前开发进度：**75%**

- ✅ 基础架构搭建
- ✅ 用户认证流程
- ✅ 核心页面开发
- ✅ 状态管理完善
- 🔄 子页面完善中
- ⏳ 测试用例编写
- ⏳ 性能优化

## 🤝 开发规范

- 使用 TypeScript 严格模式
- 遵循 ESLint + Prettier 规范
- 组件采用函数式 + Hooks
- 状态管理统一使用 Redux
- CSS 采用 Tailwind 原子化
- 注释使用 JSDoc 格式

---

**技术支持**: Next.js + NestJS + PostgreSQL + Redis  
**开发时间**: 预估 2-3 周完成全部功能  
**预估部署**: 支持 Docker + K8s 生产环境 