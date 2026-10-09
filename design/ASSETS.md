# 原创画境素材

本项目通过内置 `imagegen` 生成工具制作素材，没有使用来源不明的图片或图片热链。网页标题与说明由HTML呈现，没有烘焙到绘画图片中。

## 主画境

- 原画：`design/original-assets/hero-original.png`
- 消费资源：`public/assets/hero-768.webp`、`hero-1536.webp`
- 提示词主规格：原创宋式水墨山水，暖白宣纸，左侧留白用于网页文字，右侧远山、中景水岸与亭台、前景松树与岩石，底部平静湖面与小舟。墨黑、远山灰、少量松石青与赭石。无文字、印章、署名、边框与霓虹。

## 青绿长卷

- 原画：`design/original-assets/scroll-original.png`
- 消费资源：`public/assets/scroll-768.webp`、`scroll-1536.webp`
- 提示词主规格：3:1横向原创宋韵青绿山水长卷，层叠山峰、细墨线、低饱和石绿与松石青、曲折河道、小亭与远桥，留白水面连接远近。纸质肌理细腻，整体连贯，无文字、署名、边框或幻想元素。

## 首屏视差衍生素材

使用图像生成工具编辑主画境，分别制作：保持原构图、移除近景松树和岩石的背景；以及只保留近景松树和岩石的透明前景。两层采用独立滚动幅度，避免移动重复整幅图片造成的重影。原始衍生文件保留在 `design/original-assets/`，网页使用压缩后的WebP。

## 响应式与授权

### 本地控件墨迹

`public/assets/brush-stroke.svg` 为本项目原创绘制的矢量墨迹遮罩，用于按钮、选卷与短墨线反馈。通过曲线边缘、散锋与细笔线表现干湿笔意，不作为山水主画面，也没有外部素材请求。顶部与收尾方印由 `src/components/Seal.tsx` 中的原创断墨双框及真实小篆文字组成，不把文字烘焙成图片。

细节修复中保留墨迹轮廓，仅将细笔线透明度降低15%。`public/assets/favicon-54.png` 是当前顶部朱砂篆印实际渲染的54像素截图，用作浏览器图标；页面Logo本身仍为可访问的SVG边框与四字排版，不改字形或阅读顺序。默认小印取消旋转以保持像素对齐，悬停仅轻转一度。

原始OTF未改动。构建生成的Brotli/Gzip文件只是HTTP传输副本，实际解压后逐字节校验与原始字体相同；未进行子集化、转码、字形重映射。当前生产预览已验证压缩与缓存；其他正式托管环境需独立配置并重新核验。

图片提供768和1536像素宽度版本，首屏优先加载，其他资源懒加载。全站中文采用「崇羲篆體」原始字体，下载自 https://xiaoxue.iis.sinica.edu.tw/chongxi/download.htm ，按 CC-BY-ND-3.0-TW-or-later 使用。书写王心怡，谢清俊、庄德明、季旭昇参与。原始文件保存在 `design/chongxi-font/chongxi_seal.otf`，网页使用内容完全相同的 `public/assets/chongxi-seal.otf`，未修改字形、子集化或改变格式。授权与署名位于 `public/assets/CHONGXI-LICENSE.txt`。

网页中文通过 OpenCC 转为繁体，少数字库未收异体字规范为字库已有的同义正体字；转换只作用于网页文字，不改字体。Noto Serif SC 中文子集仅作加载失败降级，许可证保留。没有需要部署后继续连接第三方的字体或图片请求。

## 原始提示词

### 水墨画境

> Use case: stylized-concept. Create one exquisite original Chinese Song-dynasty inspired ink landscape painting for the full-bleed hero of a sophisticated digital art museum. Landscape 3:2 or wider. No words, letters, seals, signatures or borders. Light warm ivory xuan paper ground #F3EFE6. Composition: the LEFT 42 percent of the upper and middle image is quiet pale paper with extremely faint distant mountains, meant for dark HTML headline. RIGHT half: majestic finely detailed jagged pale gray mountains, wisps of white mist, layered middle distance forested shoreline, one tiny elegant traditional waterside pavilion. Strong dark ink pine tree with angular branches rises from the lower RIGHT edge, soft gray rocks and muted moss green, NOT decorative abstract blobs. Bottom third includes peaceful silvery lake, minute wooden boat, fine ripples, tiny human figure. Restricted palette ivory, ink charcoal, soft stone gray, mineral sage green #496D64, tiny warm ochre accents. Museum-grade brushwork, meticulous credible rocks and pine needles, airy composition with near/far depth, realistic hand-painted paper grain, sophisticated Song landscape aesthetic. Clean daylight; not dark, not fantasy, not 3d, not photo, no neon, no gradients, no tiled texture. Continuous painted scene edge to edge, particularly natural mountain mass occupies right 60% and only faint landscape in left upper negative space.

### 青绿长卷

> Use case: stylized-concept. One original museum-quality Chinese landscape handscroll inspired by Song dynasty mineral green landscapes, extreme panoramic framing (3:1). No text, no stamp, no signature, no margin. Entire image is coherent painting, not an interface. Pale warm xuan paper and lightly painted jade-grey sky above, imposing rhythm of layered green mountain peaks across the top two thirds, fine ink outlines, richly detailed brushwork, carefully observed trees and stone, minute traditional pavilions tucked among cliffs, tranquil winding blue gray river in bottom third, tiny distant footbridge, pale mist separating planes. Mineral malachite green and desaturated teal, darkest wooded slopes near lower right, soft light mid distance, generous river negative space lower left. Accent muted ochre only on rocks. Sophisticated lucid daylight, historical painting sensibility, delicate paper grain, no glowing colors, no fantasy, no 3d, no vector. Make the actual mountains, footpaths and water very legible and exquisite. A quiet restrained chromatic crescendo in an Oriental digital museum, not an imitation of any particular known artwork.

### 远景编辑

> Edit the referenced landscape painting for parallax background. Preserve EXACT original composition, dimensions, paper texture, coloration, all the mountain ridges, lake, boat, pavilion and every midground feature. ONLY REMOVE the dark foreground pine tree on the right and the dark closest foreground boulders at the bottom right (the foreground area below/around the pine trunk), reconstruct credible pale distant landscape, lake reflections and mist where the pine and foreground rocks were. Preserve midground lakeshore with the pavilion and mountain forests unchanged. Do not add text, do not create different art, do not alter negative space upper left. Deliver full opaque painting with that foreground removed, so the original foreground can be composited over it.

### 前景提取

> Extract ONLY the foreground dark pine tree and attached nearest boulders on the lower right of this original landscape painting onto TRUE TRANSPARENT background. Preserve exact original canvas dimensions 1536 x 1024, scale, position, brushwork, colors of the tree and foreground rocks. Everything else should be transparent: all sky, distant mountains, lake, boat, pavilion, and midground shore. The output should be a compositing layer that overlays the original at identical size, so the pine branch remains in the right half at exactly its original location and the rock mass remains bottom right. Preserve detailed pine needles natural cutout edges. No added borders no repositioning no text no new elements. Genuine transparency including spaces between branches. This is a faithful extraction for webpage parallax, not a redraw of the scene.
