# FilmFrame 交接文档

## 1. 定位
FilmFrame 是面向摄影用户的浏览器端 135 胶片画框编辑器，为数码照片添加真实胶片载体与片边信息。
产品不重绘原图、不使用 AI 或滤镜，照片仅在当前浏览器本地处理（`src/App.jsx:124`、`AGENTS.md:17`）。

## 2. 技术栈
| 层 | 选型 | 理由 |
|---|---|---|
| 前端 | React 19、Vite 6、纯 JavaScript | 单页主页与编辑工作台，构建脚本见 `package.json:6`。 |
| UI/导出 | Phosphor Icons、html-to-image、JSZip、Noto Sans/Serif SC | 支持界面图标、PNG/ZIP 导出及内置中文字体，见 `package.json:12`。 |

## 3. 结构速览
`filmframe/` → `src/` 页面与编辑器；`public/assets/` 模板资源；`worker/` 托管入口；`scripts/` 构建整理；`tests/` Sites 测试。
产品约束集中在 `AGENTS.md`，主页和编辑器主体集中在 `src/App.jsx`，视觉样式集中在 `src/styles.css`。

## 4. 数据模型
项目会话 1:N 照片项；每张照片独立拥有模板、缩放、位置和旋转状态（`src/App.jsx:69`、`src/App.jsx:207`）。
卷号、地点、日期、胶卷型号和片边编号是项目共享元数据（`src/App.jsx:209`）。
状态仅存在 React 内存中，没有数据库或持久化层。

## 5. 关键决策
- 每张照片独立选择 A/B/C，避免切换模板影响其他照片（`AGENTS.md:14`、`src/App.jsx:352`）。
- 可见画布与导出共用 `FilmSurface`，保证编辑结果与导出一致（`AGENTS.md:18`、`src/App.jsx:432`）。
- 帧号按照片顺序自动生成且不可编辑，以便删除或排序后保持连续（`AGENTS.md:15`、`src/App.jsx:400`）。
- 使用无文字模板和动态片边元数据，避免文字像硬贴层并保持原图真实性（`AGENTS.md:20`、`AGENTS.md:21`）。

## 6. 启动 & 验证
启动：`npm run dev -- --host 0.0.0.0 --port 4173 --strictPort`。
构建：`npm run build`；托管产物测试：`npm run test:sites`（`package.json:6`）。
跑通标志：能上传照片、编辑片边信息并成功导出图片。
本地入口：`http://127.0.0.1:4173/`。

## 7. 陷阱清单
- 不要用 `style-*.png` 参与编辑或导出，因为其中包含烘焙文字；应使用 `style-*-clean.png`（`AGENTS.md:21`）。
- 不要让帧号可编辑，因为它必须跟随照片顺序连续更新（`AGENTS.md:15`）。
- 不要增加调色或滤镜，因为编辑器只允许构图、缩放、位移和 90° 旋转（`AGENTS.md:17`）。
- 不要假设状态会跨刷新保留，因为当前没有数据库或浏览器持久化；当前目录也没有 Git 仓库。

## 用户备注(skill 永不自动覆盖)
<!-- handoff:manual-zone -->
<!-- /handoff:manual-zone -->
