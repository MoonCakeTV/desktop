# 月饼 TV (MooncakeTV)

一个基于 Wails 构建的跨平台桌面媒体应用。

## 特性

- 🎬 **媒体浏览与管理** - 浏览、搜索和管理媒体内容
- ⭐ **多源评分** - 整合豆瓣、IMDB、TMDB 等多个评分平台
- 🔖 **书签收藏** - 收藏喜爱的影视内容
- 📊 **观看历史** - 自动记录观看历史
- 💬 **评论功能** - 为媒体内容添加个人评论
- 🎥 **视频播放** - 内置 HLS 和 Video.js 支持
- 🌐 **代理支持** - 支持网络代理配置

## 技术栈

### 后端
- **框架**: Wails v2
- **语言**: Go
- **数据库**: SQLite (带迁移支持)
- **架构**: 平台无关的应用数据路径处理 (Windows/macOS/Linux)

### 前端
- **框架**: React 19 + TypeScript
- **路由**: TanStack Router (文件路由)
- **UI组件**: Radix UI + Shadcn UI
- **样式**: Tailwind CSS v4
- **视频播放**: HLS.js + Video.js
- **构建工具**: Vite

## 开发环境设置

### 前置要求

- Go 1.21+
- Node.js 18+
- Wails CLI (`go install github.com/wailsapp/wails/v2/cmd/wails@latest`)

### 安装依赖

```bash
# 安装 Go 依赖
go mod download

# 安装前端依赖
cd frontend
npm install
cd ..
```

### 开发模式

```bash
# 启动开发服务器 (带热重载)
wails dev

# 或使用 Make
make dev
```

开发服务器会在 `http://localhost:34115` 启动，支持前端热重载和 Go 方法调试。

### 构建生产版本

```bash
# 构建应用
wails build

# 构建后的文件在 build/bin/ 目录
```

## 开发命令

### 主要命令

- `wails dev` - 启动开发服务器
- `wails build` - 构建生产应用
- `make dev` - `wails dev` 的快捷方式
- `make mod` - 运行 `go mod tidy` 清理依赖

### 前端命令 (在 frontend/ 目录)

```bash
npm install       # 安装依赖
npm run dev       # 启动 Vite 开发服务器
npm run build     # 构建前端 (TypeScript 编译 + Vite 构建)
npm run preview   # 预览构建结果
```

### Git 操作

```bash
make origin      # 推送到 origin 远程仓库 (带标签)
make tea         # 推送到 tea 远程仓库 (带标签)
```

## 项目结构

```
├── main.go              # Wails 应用入口
├── app.go               # 主应用逻辑和数据库集成
├── wails.json           # Wails 配置
├── Makefile             # 开发快捷命令
├── services/            # 后端服务
│   ├── auth.go          # 认证逻辑
│   ├── database.go      # 数据库操作
│   ├── migration.go     # 迁移工具
│   └── proxy.go         # 代理服务
├── migrations/          # SQL 迁移文件
├── handlers/            # HTTP/API 处理器
├── models/              # 数据模型
├── utils/               # 工具函数
└── frontend/
    ├── src/
    │   ├── components/  # React 组件
    │   │   ├── ui/      # Shadcn UI 组件
    │   │   ├── douban/  # 豆瓣集成组件
    │   │   └── mc-*/    # MooncakeTV 自定义组件
    │   ├── routes/      # 路由文件
    │   ├── hooks/       # 自定义 Hooks
    │   ├── lib/         # 工具库
    │   ├── screens/     # 页面组件
    │   ├── stores/      # 状态管理
    │   └── contexts/    # React 上下文
    └── package.json     # 前端依赖
```

## 数据库架构

应用使用 SQLite，主要包含以下数据表：

- `users` - 用户管理
- `settings` - 用户偏好设置
- `medias` - 媒体内容及多源评分数据
- `bookmarks` - 用户书签
- `history` - 观看历史
- `mc_comments` - 用户媒体评论

## 配置

项目配置可通过编辑 `wails.json` 文件进行修改。更多信息请参考：https://wails.io/docs/reference/project-config

## 平台支持

- ✅ macOS
- ✅ Windows
- ✅ Linux

应用会自动识别平台并使用相应的数据目录：
- **Windows**: `%APPDATA%\MooncakeTV`
- **macOS**: `~/Library/Application Support/MooncakeTV`
- **Linux**: `~/.local/share/MooncakeTV`

## 许可证

请查看 LICENSE 文件了解详情。

## 贡献

欢迎提交 Issue 和 Pull Request！
