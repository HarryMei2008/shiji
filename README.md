# 拾季 SHIJI

当季食材订阅品牌官网 · 交互式单页站点

## 线上地址

https://harrymei2008.github.io/shiji/

## 技术说明

纯静态站点，无框架、无构建步骤、无外部 CDN 依赖。

- HTML / CSS / 原生 JavaScript
- Three.js r149（已本地化至 `vendor/`）
- 首屏视频：H.264 / 720p / 763KB / 5 秒循环 / 无音轨

## 目录结构

```
index.html           单页入口（8 个区块）
css/site.css         设计系统与全部组件样式
js/site.js           滚动动效、配齐计算器、菜单、账号系统
js/orbit.js          3D「当季十二味」（拖拽阻尼 + Raycaster 拾取）
vendor/three.min.js  Three.js r149
assets/hero-loop.mp4 首屏氛围视频
refs/                视觉参考图与设计变量
```

## 本地预览

```bash
python -m http.server 8000
```

然后打开 http://127.0.0.1:8000

不要直接双击 `index.html` —— `file://` 协议下浏览器会限制 localStorage，账号功能无法保存。

## 更新内容

修改文件后推送即可，GitHub Actions 会自动重新部署：

```bash
git add -A
git commit -m "更新说明"
git push
```

约 1 分钟后生效。
