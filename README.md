# 山水之间 · 东方美学数字展馆

独立的 React + TypeScript + Vite 项目。本仓库只包含“山水之间”数字展馆，不依赖其开发时上级目录中的Vue业务项目。

## 成果入口

- [当前桌面首屏](test-results/refined-desktop-iab.png)与[手机首屏](test-results/refined-hero-mobile-iab.png)
- [细节修复清单](design/FIXES-20261009.md)与[实际验证记录](design/VALIDATION.md)
- [高保真还原提示词](design/REPRODUCTION-PROMPT.md)
- [GitHub交付范围与独立构建验证](design/GITHUB-DELIVERY.md)
- [素材说明](design/ASSETS.md)与[字体授权](public/assets/CHONGXI-LICENSE.txt)
- 原始绘画：`design/original-assets/`；运行素材：`public/assets/`

`test-results/`中的PNG与JSON为交付证据，日志、依赖、缓存和构建目录不入Git；生产构建可由 `npm run build` 重新生成。文档中的 `E:/csr/oriental-gallery` 是原开发位置，不是运行依赖；在本仓库根目录执行下列命令即可。

## 运行

```powershell
npm ci
npm run dev
```

默认本地入口：<http://127.0.0.1:5180/>。

```powershell
npm run build
npm run preview -- --port 5181
```

生产预览入口：<http://127.0.0.1:5181/>。生产静态文件输出到 `dist/`，可放到支持静态文件的托管服务。所有视觉素材均为本地文件，不依赖图片热链。

构建自动生成字体、脚本、样式的 `.br` / `.gz` 传输副本，预览服务按浏览器支持协商编码，并提供版本化缓存；原始文件不修改。正式托管需要配置等效的编码协商、`Content-Encoding`、`Vary: Accept-Encoding` 和缓存头，仅上传压缩副本不会自动启用。当前未重新发布公网站点。

## 项目结构

```text
oriental-gallery/
  src/
    App.tsx                    页面区域与交互状态
    content.ts                 作品、场景、路径与演示数据
    animation.ts               动画时长、节奏、视差幅度、Canvas限制
    components/
      ArtworkImage.tsx          响应式WebP、加载与错误状态、联网恢复
      Modal.tsx                 原生dialog、Escape与焦点返回
      VisitChart.tsx            可键盘操作的演示访问量图
      Handscroll.tsx            三卷切换、收卷展卷、收藏与详情
      Ledger.tsx                线装簿封面、对开页面、墨图与逐月记录
      Seal.tsx                  顶部与收尾共用的四字方印
      Water.tsx                 可暂停、限帧、限制DPR的水纹
    hooks/useMotion.ts         GSAP入场、长卷、墨线、降级与清理
    hooks/usePaperTransition.ts 旧纸页快照、透视翻页、换卷揭示与清理
    hooks/useInkNavigation.ts  墨线导航、渐进滚动、操作中断与焦点交接
    styles/
      tokens.css               配色、字体与布局变量
      main.css                 页面、组件与响应式样式
      classical.css            篆书排版、装裱手卷、线装簿与响应式布局
      interactions.css         笔刷控件、交互过渡与减少动态效果
    typography/                小篆繁体显示、字形标准化、简体无障碍名称
      numbers.ts               年份、数量、序号的中文数字显示
  public/assets/               WebP素材、原始小篆字体与字体授权
  design/original-assets/      原始生成素材
  scripts/prepare-assets.mjs   素材压缩、响应式尺寸、字体子集下载
  scripts/asset-delivery.ts    构建传输压缩、预览协商与版本化缓存
  tests/gallery.spec.mjs       浏览器验证脚本
  tests/interactions.spec.mjs  动画中间帧、快速切换、中断与静态模式验证
  tests/refinements.spec.mjs   七种宽度、表单、空态、异常与印章像素密度
  tests/delivery.spec.mjs      字体压缩还原、缓存、HEAD与缺失资源检查
  test-results/               实际截图与JSON验证报告（不入Git）
```

## 视觉与动效

宋韵山水、宣纸纸色、松石青、墨黑与少量朱砂。主视觉由原创水墨画境和青绿长卷组成。全站中文使用真实小篆「崇羲篆體」，包括正文、导航、图表、表单和弹层。页面文案以繁体正字显示，按钮与链接保留简体无障碍名称。正文放大到约21—26像素。

展品改为可收展的装裱手卷；数据区改为可合簿、启簿、翻页的线装簿；详情为对开册页。图表和逐月表使用同一数据集，不伪装为真实业务成果。

`src/styles/tokens.css` 管理设计变量。`src/animation.ts` 集中管理入场、视差与 `paper` 交互参数：翻页和启簿0.9秒、换卷0.8秒、导航0.75秒、旧卷退墨0.3秒，纸页透视距离为一千八百像素。使用原生滚动，GSAP + ScrollTrigger 负责开卷、墨线与长卷，CSS 负责细微反馈。Canvas 限制为 24 FPS、最高 1.5 DPR，移动端不运行。

交互保留旧纸页的非交互快照，用透视转动呈现翻页，用遮罩推进呈现换卷与收展；快照为 `aria-hidden`、`inert`，去除重复标识与计数钩子。连续操作会取消上一段过渡并立即使用最新内容，暂停或卸载时清理快照与动画。场景、弹层及收藏到详情的切换均有轻缓过渡。锚点导航带墨线反馈，滚轮、触摸和导航按键可随时中断，不锁定滚动。

顶部和收尾共用四字方印，采用传统右列先读与朱砂断墨双框。主要按钮与选卷使用本地原创 `brush-stroke.svg` 作为墨迹遮罩，点击区域保持稳定、键盘焦点保持可见；流程内容改为疏密排列与轻墨线分隔，保留手卷、书页等具有真实物件含义的框架。

动画在效果初始化后才隐藏相应元素，初始化异常会撤销动画样式。系统开启 `prefers-reduced-motion` 时不创建滚动动画、不显示水纹和雾气，内容直接可见；导航中的暂停按钮可主动停止动态效果。

## 功能

- 锚点导航、滚动导航状态、移动菜单及键盘焦点约束。
- 三项册页详情、收藏增删、收藏列表；收藏保存在当前浏览器。
- 三卷切换、手卷收起与展开；收起状态的内容不可聚焦。
- 页面年份、数量、章节序号、图表和播报名称统一采用中文数字；原始数据与坐标保持数值类型。
- 顶部标识与收尾落款均采用四字二乘二方印，按传统右列先读排列，外框使用朱砂双线与断墨缺口。
- 观展簿合上与开启、墨图与逐月表翻页；表格具有标题和列头。
- 导览弹层、作品与授权说明、展馆手记。
- 三种山水场景、上一幅/下一幅、序号切换与移动端触摸滑动。
- 演示统计图，键盘和鼠标均可高亮月份与数值。
- 本地反馈表单，至少5字、最多1000字；不向服务器发送，不伪装为已联系展馆。
- 原生 `dialog` 提供焦点限制，支持 Escape、关闭按钮、外部区域关闭与焦点返回。
- 标题按语义换行，品牌副标手机14px、桌面17px；主要小图标触控区44px，图形尺寸与原轮廓不变。
- 图表只保留一行可键盘操作的月份；错误表单同步朱砂边缘与输入焦点，校正时不挤动提交按钮。
- 图片慢载、加载失败、空收藏、网络断开与恢复、存储失败均有明确状态；图片失败后联网自动重试，不添加新页面。

## 验证

```powershell
npm run test:e2e
node tests/interactions.spec.mjs
node tests/refinements.spec.mjs
node tests/numbers.spec.mjs
node tests/font-source.mjs
python tests/font-coverage.py
# 生产预览运行在5181时，可追加验证
node tests/build.spec.mjs
node tests/delivery.spec.mjs
```

测试使用 Playwright 与本机 Google Chrome 的独立无头会话。需要本机已安装 Chrome。字形检查使用 Python 的 `fonttools`（`python -m pip install fonttools`），覆盖浏览器实际文字与源码中的中文文案，并验证字体未被修改。支持以 `GALLERY_URL` 指定被测地址。

验证范围：1920、1440、1366、768、390像素宽度，横向溢出与文字截断、图片和字体、控制台错误、导览焦点、收藏持久化、场景切换、图表提示、反馈验证、移动菜单、触摸切换、减少动态效果、Canvas非空，以及注入动画初始化异常时的静态降级。

强化版还验证卷轴开合、书簿翻页、封面焦点返回、视口变化后内容保持、准确数字，以及手机手记单栏与详情册页。生产预览检查需先运行 `npm run preview -- --port 5181`。

细节修复版已通过17项基础检查、15项动效检查、14项细节检查，共46项；另通过19项数字断言、三种生产预览尺寸与516个中文字形检查。细节检查额外覆盖375、360像素宽度、显式滚动条、印章一倍与二倍像素密度、图片慢载与失败、浏览器断网恢复、存储失败。

实际结果见 `test-results/report.json`、`interactions-report.json`、`refinements-report.json`、`delivery-report.json` 与 `build-report.json`，截图见同目录的 `hero-*.png`、`full-*.png`、`logo-*.png`、`page-turn-*.png`、`scroll-change-*.png`、`refined-*.png`。动画检查读取多个时间点的实际变换与遮罩，验证运动、快速切换清理、导航中断与焦点、暂停中途恢复可见内容、减少动态效果。修复清单见 `design/FIXES-20261009.md`；测试结果以实际生成的报告为准。

## 素材与数据边界

作品为本项目通过内置图像生成工具原创制作的数字画境；不是历史原作、博物馆藏品或真实业务案例。册页以两幅原画的整体及局部组织为三个主题，视差使用同一画境的背景与透明前景衍生素材。提示词与保存位置见 `design/ASSETS.md`。

崇羲篆體由王心怡书写，谢清俊、庄德明、季旭昇参与，采用 CC-BY-ND-3.0-TW-or-later。出处与归属见 `public/assets/CHONGXI-LICENSE.txt`，原始完整字体未经子集化、重映射或格式修改。Noto Serif SC（SIL OFL 1.1）仅用于字体加载失败时的可读降级和小篆未包含的非中文字形；Lucide 使用 ISC License。

小篆原始字库21,817,868字节，为遵守禁止改作条款未裁剪。生产预览Brotli传输11,742,430字节，减少46.18%；Gzip传输12,062,934字节，减少44.71%，解压后逐字节等于原始字体。版本化URL支持长缓存和304响应，但首次传输仍较重，未宣称弱网秒开。现有文案逐字检查；任意用户输入的罕见字或字库加载失败时可能使用可读后备字体。全篆正文阅读效率低于常规汉字，这是本次强古典风格的明确取舍。

观展足迹使用固定的前端演示数据，明确标注时间范围、单位与来源。未接入真实访问统计、云端收藏、邮件、账户或后台服务。本地收藏与反馈不跨设备同步。

浏览器验证覆盖 Chrome；未声称完成 Safari、Firefox 或真实手机硬件测试。
