# minusROOM

Less Noise, More Room.

访问地址：https://minusroom.pages.dev/auth

minusROOM 是一个面向中文内容场景的 AI 知识蒸馏应用：
把你每天看到的链接、文字、语音、图片、音视频快速采集进来，自动生成结构化知识卡片，并通过每日回顾、标签导航与问答 Agent 让知识真正被再次使用。

## 核心能力

- 多模态采集：链接 / 文字 / 实时语音识别 / 图片 / 音视频
- AI 自动脱水：输出统一结构的「核心观点 + 关键点 + 金句」
- 空间页管理：卡片瀑布流浏览、标签筛选、每日回顾 Daily Digest
- 标签库：按标签聚合卡片，支持标签重命名、删除
- 知识问答 Agent：本地知识库模式 + 联网辅助模式
- 对话历史：自动保存，支持历史回溯，10 分钟内自动续接上次对话
- 卡片详情：可编辑标题/笔记/标签，支持 AI 相关推荐
- Auth 登录页：全屏 WebGL 水波纹背景，鼠标滑过即时触发涟漪

## 技术栈

- 前端：React 18 + Vite
- 路由：React Router v6
- 状态管理：Zustand（persist）
- 样式：Tailwind CSS + 设计令牌（Morandi 主题）
- 动效：CSS 动画 + WebGL（Auth 水波纹）

## 页面与路由

| 路由 | 页面 | 说明 |
| --- | --- | --- |
| `/auth` | 登录页 | WebGL 水面背景，进入应用 |
| `/auth/verify` | 验证页 | 模拟验证流程后自动登录 |
| `/space` | 我的空间 | 卡片主视图、Digest、标签筛选 |
| `/space/card/:id` | 卡片详情 | 查看与编辑卡片、相关推荐 |
| `/tags` | 标签库 | 标签聚合浏览、重命名/删除 |
| `/guide` | 使用说明 | 产品定位、功能、流程说明 |
| `/settings` | 设置 | 账户、通知、危险操作 |
| `/error` | 错误页 | 服务错误反馈 |

说明：除 `/auth` 与 `/auth/verify` 外，其余页面均需登录（前端路由守卫）。

## 关键交互设计

- 顶栏右侧 `+`：打开采集弹窗
- 右下角浮动搜索按钮：打开知识问答抽屉
- `Cmd/Ctrl + K`：快捷打开知识问答抽屉
- 在标签库进入卡片详情时：侧边栏会高亮「标签库」而非「我的空间」
- 面包屑标签名可点击：返回对应标签筛选结果

## 问答 Agent 机制

### 1) 本地知识库搜索

- 对输入问题做中文关键词提取（去停用词 + 标点清理 + bigram）
- 在 `title / coreIdea / keyPoints / note / tags` 上做匹配评分
- 标签精确命中会加权
- 返回相关卡片并合成自然语言回答

### 2) 联网辅助模式

- 先生成本地知识库回答
- 再拼接联网补充信息块（当前为前端模拟）

### 3) 历史对话

- 对话自动保存到本地持久化状态
- 支持历史列表查看、删除、重进
- 10 分钟内再次打开问答抽屉：默认续接上次会话
- 超过 10 分钟：默认新建会话

## 项目结构

```text
src/
  components/ui/
    AppShell.jsx          # 主框架（侧边栏/顶栏/浮动按钮）
    CaptureModal.jsx      # 采集弹窗（5 种模式）
    KnowledgeDrawer.jsx   # 知识问答抽屉 + 历史对话
    SearchOverlay.jsx     # 旧搜索浮层（保留）
    Toast.jsx             # 全局提示
  data/
    mockCards.js          # 演示卡片与 Digest 配置
  pages/
    AuthPage.jsx
    SpacePage.jsx
    CardDetailPage.jsx
    TagsPage.jsx
    GuidePage.jsx
    SettingsPage.jsx
    VerifyPage.jsx
    ErrorPages.jsx
  store/
    useStore.js           # Zustand 全局状态（含 persist）
  utils/
    helpers.js            # 搜索过滤、标签统计、相对时间等
  App.jsx
  main.jsx
```

## 本地开发

### 环境要求

- Node.js 18+
- npm 9+

### 安装与运行

```bash
npm install
npm run dev
```

默认启动后访问：`http://localhost:5173`

### 其他脚本

```bash
npm run build    # 生产构建
npm run preview  # 预览构建产物
npm run lint     # 代码检查
```

## 数据与持久化说明

- 首次数据来自 `src/data/mockCards.js`
- Zustand `persist` 使用 `localStorage` 保存：
  - 用户登录态
  - 主题设置
  - 卡片数据
  - Digest 关闭状态
  - 问答历史会话
- 升级 `STORE_VERSION` 时会触发迁移逻辑（当前会重置卡片为最新 mock 数据）

## 当前实现边界

- 当前 AI 脱水与联网补充为前端模拟逻辑，便于产品体验验证
- 未接入后端数据库与真实模型 API
- 适合作为产品原型、交互演示、前端架构基线

## 未来可扩展方向

- 接入真实 LLM 与 Embedding 检索（向量召回 + rerank）
- 用户体系与云端同步
- 真实网页正文抓取与多平台解析管线
- 细粒度权限、团队知识空间、协作标注

---

如果你正在做中文内容产品、知识管理产品或 AI 工具，欢迎基于 minusROOM 继续迭代。
