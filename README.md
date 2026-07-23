# 简洁新标签页 (Classic Startpage)

一个 Google 风格的 Chrome 新标签页扩展。搜索由 Bing 提供，带搜索建议和历史记录。

## 功能

- **Google 风格界面** — 纯白背景，彩色 Logo，居中搜索框
- **Bing 搜索** — 输入即搜，走 Bing
- **搜索建议** — 实时下拉推荐（由 360 搜索提供，国内可用）
- **搜索历史** — 自动保存最近 10 条搜索记录，下次输入时匹配显示
- **快捷网站** — 搜索框下方显示常用网站快捷入口
- **自定义快捷网站** — 点右上角"设置"或按 Ctrl+Shift+S 自由编辑
- **键盘导航** — 上下键选择建议，回车搜索，Esc 关闭下拉

## 安装方法

### 方式一：加载已解压的扩展（开发者模式）

1. 下载本项目到本地
2. 打开 Chrome，地址栏输入 `chrome://extensions/` 并回车
3. 打开右上角 **开发者模式**
4. 点击 **加载已解压的扩展程序**
5. 选择项目文件夹 `my-startpage`
6. 按 `Ctrl+T` 开新标签页即可使用

## 自定义

### 编辑快捷网站

按 `Ctrl+Shift+S` 或点击页面右上角的 **设置** 链接，在弹出的文本框里按以下格式编辑：

```
网站名称|https://网址.com
```

每行一个，修改后确定即可。

## 文件结构

```
my-startpage/
  manifest.json    # Chrome 扩展清单
  startpage.html   # 主页面
  script.js        # 功能脚本（搜索历史、建议、快捷键）
  background.js    # 后台服务
  icon.png         # 扩展图标
```

## 技术栈

- Chrome Extension Manifest V3
- 原生 JavaScript
- 360 搜索 Suggest API（搜索建议）
- LocalStorage 存储（搜索历史、快捷网站配置）

## 许可证

MIT