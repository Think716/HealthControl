# HealthControl - 智能健康管理系统

> 一套覆盖 Web 管理后台、移动端小程序 / App 与 RESTful 后端服务的全栈健康管理系统，支持健康数据记录、AI 智能分析、社区互动与多渠道访问。

---

## 项目简介

**HealthControl** 是一款面向个人与社区的健康管理全栈应用，致力于帮助用户记录并分析日常健康指标、饮食与运动数据，同时提供健康资讯、食谱推荐与社区交流功能。系统集成了 AI 智能分析（DeepSeek）与语音输入识别，提升用户交互体验。

项目采用主流前后端分离架构，包含三大子系统：

| 子系统 | 技术栈 | 说明 |
| :--- | :--- | :--- |
| `HealthControl.elementui` | Vue 3 + Vite + Element Plus | 管理员后台 & PC 前台 |
| `HealthControl.springboot` | Spring Boot 3 + MyBatis Plus | 核心业务与数据 API 服务 |
| `HealthControl.uniapp` | UniApp + Vue 3 | 微信小程序 / H5 / App 客户端 |

---

## 软件架构

### 整体架构

```
用户端 (UniApp 小程序/App/H5)
        │
        ▼
   Nginx / 网关
        │
        ▼
HealthControl.springboot (RESTful API)
        │
   ┌────┴────┐
   ▼         ▼
MySQL 8   Redis / Caffeine 缓存
```

- **前端（管理后台）**：基于 Vue 3 Composition API 开发，使用 Element Plus 组件库构建交互界面，ECharts 实现数据可视化，Pinia 管理状态，AIEditor 提供富文本编辑能力。
- **后端**：基于 Spring Boot 3.3.1，采用分层架构（Controller / Service / Mapper / Entity），整合 MyBatis Plus 进行数据持久化，JWT 实现无状态认证，Caffeine 提供本地缓存，集成 DeepSeek API 提供 AI 分析能力。
- **移动端**：基于 UniApp 跨端框架，一套代码同时编译到微信小程序、H5 与 App，内置丰富的 CSS 工具类与主题变量，支持语音输入识别食物。

---

## 技术栈详解

### 前端管理后台 (`HealthControl.elementui`)

| 依赖 | 版本 | 用途 |
| :--- | :--- | :--- |
| Vue | 3.5.13 | 渐进式前端框架 |
| Vite | 5.0.0 | 构建工具 |
| Element Plus | 2.5.1 | UI 组件库 |
| Vue Router | 4.2.5 | 路由管理 |
| Pinia | 2.1.7 | 状态管理 |
| Axios | 1.6.2 | HTTP 请求 |
| ECharts | 5.5.1 | 数据图表 |
| AIEditor | 1.3.3 | 富文本编辑器 |
| Crypto-JS | 4.0.0 | 加密处理 |
| QRCode / JSQR | 1.5.4 / 1.4.0 | 二维码生成与识别 |

### 后端服务 (`HealthControl.springboot`)

| 依赖 | 版本 | 用途 |
| :--- | :--- | :--- |
| Spring Boot | 3.3.1 | 核心框架 |
| Java | 17 | 运行环境 |
| MyBatis Plus | 3.5.7 | ORM 增强 |
| MySQL Connector | 8.0.33 | 数据库驱动 |
| JWT (java-jwt) | 3.19.2 | 身份认证 |
| Caffeine | 3.1.8 | 本地缓存 |
| HanLP | portable-1.8.4 | 中文自然语言处理 |
| Apache POI | 4.1.0 | Excel 导入导出 |
| Spring Mail | - | 邮件服务 |
| Java-WebSocket | 1.5.3 | WebSocket 客户端 |
| HTTPClient | 4.5.3 | 网络请求 |

### 移动端 (`HealthControl.uniapp`)

| 技术 | 说明 |
| :--- | :--- |
| UniApp | 跨端应用框架（Vue 3 版本） |
| Pinia | 状态管理 |
| SCSS | 样式预处理，内置完整设计系统 |
| 腾讯地图 SDK | H5 端地图服务 |

---

## 功能模块

### 1. 用户与权限
- 用户注册 / 登录 / 找回密码
- JWT Token 认证机制
- 个人信息维护、密码修改、头像上传
- 微信账号绑定

### 2. 健康指标管理
- 健康指标类型定义（身高、体重、体温、BMI 等）
- 健康指标记录与历史趋势查看
- 批量记录支持
- 数据可视化图表展示

### 3. 饮食管理
- 食物库管理（食物名称、类型、单位、热量）
- 每日饮食记录
- 饮食数据统计分析

### 4. 运动管理
- 运动项目与单位维护
- 运动记录登记
- 运动数据统计与仪表盘

### 5. 健康知识
- 健康文章分类与发布
- 文章详情浏览、收藏、点赞
- 富文本编辑与图片上传

### 6. 食谱推荐
- 食谱发布与浏览
- 收藏与点赞互动
- 食谱详情展示

### 7. 社区互动
- 社区帖子发布与浏览
- 评论互动
- 举报与标签管理
- 社区数据统计

### 8. 健身视频
- 健身视频资源管理
- 视频播放与展示

### 9. 健康通知
- 系统通知推送
- 消息提醒管理

### 10. AI 智能分析
- 基于 DeepSeek API 的健康数据分析
- 个性化健康建议生成
- 讯飞语音输入识别食物信息

---

## 安装与运行

### 环境要求

- JDK 17+
- Node.js 18+
- MySQL 8.0+
- Maven 3.8+
- HBuilderX / VSCode (UniApp 开发)
- 微信开发者工具（小程序调试）

### 1. 后端服务

```bash
cd HealthControl.springboot

# 配置数据库（修改 src/main/resources/application.yml）
# 执行 SQL 脚本（位于 src/main/resources/sql/）

# 编译运行
mvn spring-boot:run
```

默认服务端口：`8081`

### 2. 管理后台前端

```bash
cd HealthControl.elementui

# 安装依赖
npm install

# 开发环境运行
npm run dev

# 生产构建
npm run build:prod
```

默认访问地址：`http://localhost:8080`

### 3. 移动端 UniApp

```bash
cd HealthControl.uniapp

# 使用 HBuilderX 导入项目
# 或使用 CLI 运行
npm install
```

在 HBuilderX 中选择运行到：
- 微信小程序模拟器
- H5 浏览器
- 手机 App 基座

---

## 项目目录结构

```
HealthControl/
├── HealthControl.springboot/          # 后端服务
│   ├── src/main/java/com/example/web/
│   │   ├── config/                    # 配置类（AI、缓存、Jackson）
│   │   ├── controller/                # 控制层（30+ 业务接口）
│   │   ├── dto/                       # 数据传输对象
│   │   ├── entity/                    # 实体类
│   │   ├── mapper/                    # 数据访问层
│   │   ├── service/                   # 业务逻辑层
│   │   └── tools/                     # 工具类（JWT、邮件、DeepSeek、WebSocket）
│   └── src/main/resources/
│       ├── sql/                       # 数据库脚本（按日期迭代）
│       └── application.yml            # 应用配置
│
├── HealthControl.elementui/           # 管理后台前端
│   ├── src/
│   │   ├── api/                       # 接口封装
│   │   ├── components/                # 公共组件（表单、表格、上传）
│   │   ├── router/                    # 路由配置
│   │   ├── store/                     # Pinia 状态管理
│   │   ├── styles/                    # 全局样式与 Element 主题
│   │   ├── utils/                     # 工具函数
│   │   └── views/                     # 页面视图
│   │       ├── Admin/                 # 后台管理页面
│   │       └── Front/                 # 前台用户页面
│   ├── dist/                          # 构建产物
│   └── package.json
│
└── HealthControl.uniapp/              # 移动端
    ├── pages/Front/                   # 业务页面（登录、首页、健康、社区等）
    ├── store/                         # 状态管理
    ├── utils/                         # 请求封装与通用工具
    ├── assets/                        # 图片资源
    ├── manifest.json                  # 应用配置（AppID、权限、SDK）
    └── pages.json                     # 页面路由
```

---

## 核心亮点

- **多端覆盖**：一套后端支撑 PC 管理后台、微信小程序、H5 与 App 多端应用。
- **AI 赋能**：集成 DeepSeek 大模型进行健康数据分析，提供智能建议；支持讯飞语音输入识别食物。
- **完整社区生态**：支持发帖、评论、点赞、收藏、举报等完整社区功能。
- **数据可视化**：ECharts 图表展示健康趋势，直观了解身体变化。
- **模块化设计**：前后端均按业务模块拆分，便于后续扩展与维护。

---

## 参与贡献

1. Fork 本仓库
2. 新建分支 `feat/xxx` 或 `fix/xxx`
3. 提交代码并创建 Pull Request

---

## 开源协议

本项目仅供学习与交流使用。

---

