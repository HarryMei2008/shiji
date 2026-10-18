# 搬到 GitHub Pages · 操作说明

仓库已经准备好了：`D:\shiji\.build\pages\`
8 个文件、2 次提交、主分支 `main`、自动部署配置已内置。

你只需要做下面 5 步，全程约 5 分钟。

---

## 第 1 步：注册/登录 GitHub

打开 https://github.com/signup

有账号就直接登录，没有就注册一个（免费，只需要邮箱）。

---

## 第 2 步：新建仓库

打开 https://github.com/new

- **Repository name** 填：`shiji`
- 选 **Public**（必须公开，免费版 Pages 只支持公开仓库）
- **不要**勾选 "Add a README file"
- 点 **Create repository**

创建完成后，页面会显示仓库地址，形如：
`https://github.com/你的用户名/shiji`

---

## 第 3 步：推送代码

回到我这边，把上一步的仓库地址告诉我，我直接帮你推上去（会弹一次 GitHub 登录窗口，点授权即可）。

或者你自己在命令行执行（把 `你的用户名` 换掉）：

```bash
cd /d/shiji/.build/pages
git remote add origin https://github.com/你的用户名/shiji.git
git push -u origin main
```

推送时会要求登录，推荐用 **Personal Access Token** 当密码：
1. 打开 https://github.com/settings/tokens
2. Generate new token (classic)
3. 勾选 `repo` 权限
4. 生成后复制那串字符，粘贴到密码框

---

## 第 4 步：开启 Pages

推送成功后：

1. 打开你的仓库 → **Settings**（顶部菜单）
2. 左侧找到 **Pages**
3. **Source** 选 **GitHub Actions**（不是 Deploy from a branch）
4. 保存

仓库里已经有 `.github/workflows/deploy.yml`，会自动触发部署。

---

## 第 5 步：等 1-2 分钟，拿到网址

打开仓库的 **Actions** 标签页，能看到一次名为 "Deploy to GitHub Pages" 的运行。
等它变成绿色对勾，网址就是：

```
https://你的用户名.github.io/shiji/
```

---

## 常见问题

**Q：会不会过期？**
不会。GitHub Pages 对公开仓库长期免费，只要仓库还在，网址就一直在。

**Q：以后改了网站内容怎么办？**
把新文件放进 `D:\shiji\.build\pages\`，然后：

```bash
cd /d/shiji/.build/pages
git add -A
git commit -m "更新内容"
git push
```

推送后 GitHub 会自动重新部署，1 分钟左右生效。

**Q：能绑自己的域名吗？**
可以。Settings → Pages → Custom domain，填你的域名，再去域名商加一条 CNAME 记录指向 `你的用户名.github.io`。

**Q：国内访问速度？**
GitHub Pages 在国内访问速度不稳定（有时快有时慢，个别网络下可能打不开）。
如果要保证国内访问流畅，建议同时保留 WorkBuddy 的链接做备用，或者后续换到国内的托管（如腾讯云 COS 静态网站、阿里云 OSS）。

---

## 当前两个链接对比

| | WorkBuddy 沙箱 | GitHub Pages |
|---|---|---|
| 地址 | https://shiji-seasonal.app.workbuddy.host/ | https://你的用户名.github.io/shiji/ |
| 有效期 | 可能被回收 | 长期有效 |
| 国内速度 | 较快 | 不稳定 |
| 费用 | 免费 | 免费 |

**建议：两边都留着。** 交作业用 WorkBuddy 的（国内快），长期留档用 GitHub Pages 的。
