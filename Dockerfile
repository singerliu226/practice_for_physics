# -------- Stage 1：依赖安装 & 构建 --------
FROM node:20-bullseye-slim AS builder

# 设置工作目录
WORKDIR /app

# 复制根 package.json / lock 文件
COPY package*.json ./

# 复制 workspace manifest，避免提前复制全部源码以提升缓存命中率
COPY backend/package*.json backend/
COPY frontend/package*.json frontend/

# 安装工作区依赖（使用 npm workspaces）
RUN npm ci --ignore-scripts --no-audit --no-fund

# 复制全部源码
COPY . .

# 运行统一构建，frontend -> .next、backend -> dist
RUN npm run build

# -------- Stage 2：生成运行时镜像 --------
FROM node:20-bullseye-slim AS runtime

# 创建非 root 用户，增强安全性
RUN useradd --system --create-home --shell /usr/sbin/nologin app

WORKDIR /app

# 仅拷贝生产依赖 & 构建产物，减小镜像体积
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend ./backend
COPY --from=builder /app/frontend ./frontend
COPY --from=builder /app/package*.json ./

# 暴露端口：3000 (Next.js) & 3001 (NestJS)
EXPOSE 3000 3001

USER app

# 默认启动脚本：同时启动前后端
CMD ["npm", "start"] 