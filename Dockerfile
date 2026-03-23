# 多阶段构建 - 构建阶段
FROM docker.m.daocloud.io/library/node:20-alpine AS builder

WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 设置 npm 镜像源
RUN npm config set registry https://registry.npmmirror.com

# Docker 构建无需下载 Electron 二进制（避免外网失败）
ENV ELECTRON_SKIP_BINARY_DOWNLOAD=1

# 安装依赖（使用 npm install 以自动生成 lock 文件）
RUN npm install

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 生产阶段
FROM docker.m.daocloud.io/library/node:20-alpine

WORKDIR /app

# 安装 wget 用于健康检查
RUN apk add --no-cache wget

# 设置 npm 镜像源
RUN npm config set registry https://registry.npmmirror.com

# 复制 package 文件并安装生产依赖（忽略脚本）
COPY package*.json ./
RUN npm install --omit=dev --ignore-scripts

# 复制构建好的应用
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./

# 暴露端口
EXPOSE 3001

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3001

# 启动应用
CMD ["npm", "start"]
