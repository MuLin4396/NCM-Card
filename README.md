### 深色
<div align="center"><img src="card-dark.svg"></div>

### 浅色
<div align="center"><img src="card.svg"></div>

<div align="center">用于在 Github Profile 上展示本周的网易云音乐听歌记录</div>

<div align="center">
  <img src="card.svg">
</div>

<div align="center">
  <h1>NCM-Card</h1>
</div>

<div align="center">在 GitHub Profile 上展示你本周的网易云音乐听歌记录</div>

## 🚀 使用指南

### 🎒 1. `Fork` 此仓库或新建一个仓库

### 2. 获取网易云音乐用户 `ID`
- 修改 [main.yml] 文件中的 `USER_ID` 为你的网易云音乐用户 ID

### 3. 获取网易云音乐用户 `TOKEN`
- 登录[网易云音乐官网](https://music.163.com)
- 打开浏览器控制台，找到 Application 栏下 Cookie 中 `MUSIC_U` 的值
- 在 GitHub 项目设置中的 `Secrets` 创建一个名为 `USER_TOKEN` 的新密钥，将 `MUSIC_U` 的值粘贴进去
- **注意：网易云音乐的 Cookie 可能会掉线，如出现错误请重新获取**

### 4. 修改 `main.yml`
- 将 [main.yml] 中的 `AUTHOR` 修改为你的 GitHub 用户名

### 5. 引用 SVG 图片
- 在你的 GitHub Profile 仓库中添加以下链接来展示卡片：

  `![card](https://github.com/你的 GitHub 用户名/netease-music-card-fixed/blob/main/card.svg)`

- 或使用 [Jsdelivr](https://www.jsdelivr.com/?docs=gh) CDN (国内访问可能不稳定)：

  `![card](https://cdn.jsdelivr.net/gh/你的 GitHub 用户名/netease-music-card-fixed/card.svg)`

- 或使用 [Statically](https://statically.io/) CDN：

  `![card](https://statically.io/gh/你的 GitHub 用户名/netease-music-card-fixed/card.svg)`

- 你也可以将图片部署到你的博客等其他地方使用 😋

## 💨 本地测试

`Fork` 项目或新建一份，然后执行以下命令：

```
npm install
```

```
node index.js
```

- 如果想在 GitHub Actions 中查看详细输出，可以忽略 `.env` 文件。
- 如果想在本地测试网易云 API，可以在 `.env` 文件中填写相应的值

## ❤️ 灵感来源
- [spotify-github-profile](https://github.com/kittinan/spotify-github-profile)
- [netease-music-box](https://github.com/Leecason/netease-music-box)
- [NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi)
- [netease-music-card-fixed](https://github.com/luyanci/netease-music-card-fixed)

## 🤔 工作原理
- 使用 [NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi) 获取听歌记录。
- 使用 GitHub API 将 `index.js` 处理生成的 `SVG` 写入仓库。
- 使用 GitHub Actions 定期更新 `card.svg` 文件。


