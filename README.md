# 健康管理系统（HealthControl）

这是一个包含双端前端工程的健康管理项目仓库：

- `HealthControl.uniapp`：基于 UniApp 的移动端/小程序端项目（当前主要面向微信小程序）。
- `HealthControl.elementui`：基于 Vue3 + Vite + Element Plus 的网页端项目。

项目核心能力覆盖：

- 用户注册、登录、个人信息维护
- 健康指标管理与记录
- 饮食记录与食物管理
- 健康文章与食谱相关功能
- AI 健康分析展示

---

## 仓库目录说明

```text
.
├── HealthControl.uniapp/      # 小程序/移动端（UniApp）
└── HealthControl.elementui/   # 网页端（Vue3 + Element Plus）
```

---

## 技术栈

### 小程序端（`HealthControl.uniapp`）

- UniApp
- Vue 组合式写法（部分页面使用 `script setup`）
- 基于 `uni.request` 的请求封装（`utils/http.js`）

### 网页端（`HealthControl.elementui`）

- Vue 3
- Vite
- Element Plus
- Pinia
- Axios

---

## 运行前准备

- Node.js（建议 18 及以上）
- npm
- 小程序端开发工具：
  - HBuilderX（推荐）
  - 微信开发者工具（微信小程序调试/发布）

---

## 快速开始

### 1）启动网页端

```bash
cd HealthControl.elementui
npm install
npm run dev
```

常用命令：

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

### 2）启动小程序端

使用 HBuilderX 打开 `HealthControl.uniapp`，可选择：

- 运行到浏览器（用于快速联调）
- 运行/发行到微信小程序

如需在微信开发者工具中调试，请将小程序工程导入微信开发者工具。

---

## 环境配置

项目依赖后端接口地址配置。

- 小程序端在 `HealthControl.uniapp/utils/http.js` 中通过 `import.meta.env.VITE_API_BASE_URL` 读取接口根地址。
- 网页端同样使用环境变量方式管理接口地址。

建议在各子项目按需创建环境文件（如 `.env.development`），示例：

```env
VITE_API_BASE_URL=https://你的接口地址
```

---

## 主要功能模块

- 用户认证与个人中心
- 健康指标与历史记录
- 食物库与饮食记录
- 健康文章与食谱
- AI 健康分析页面

---

## 开发说明

- 小程序页面路由统一配置在 `HealthControl.uniapp/pages.json`。
- 前后端交互建议保持统一返回结构（如 `Success`、`Data`、`Msg`）。
- 涉及通用业务规则调整时，建议同步检查两个前端子项目，避免行为不一致。

---

## 参与贡献

1. 新建功能分支
2. 在对应子项目中完成开发
3. 执行构建或代码检查
4. 提交合并请求，并补充变更说明与验证结果


当前仓库尚未提供明确开源许可证。
如需对外发布或开源，建议补充 `LICENSE` 文件。
