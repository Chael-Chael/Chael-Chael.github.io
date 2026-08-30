# 内容编辑指南

日常内容修改只需要编辑这个目录，不需要改 `src/`：

- `config.toml`：站点标题、姓名、身份、学校、邮箱和社交账号。
- `home.toml`：首页介绍、个人简介、研究方向、首页展示数量、精选博客和右侧固定卡片。
- `open-source.toml`：开源项目名称、链接、图片、语言和简介；星标数量会在浏览器中从 GitHub 动态更新。
- `publications.bib`：论文信息及 Paper、Code、Project 链接。
- `publications.toml`：论文列表页标题、简介和 BibTeX 数据源。
- `blog.toml`：博客列表页标题和简介。
- `blog/<slug>.toml`：单篇博客的标题、日期、摘要、封面和标签。
- `blog/<slug>.md`：对应博客正文；文件名必须与 TOML 一致。
- `news.toml`：动态消息。
- `awards.toml`、`services.toml`、`cv.toml`、`cv.md`：其他独立页面。

图片放在 `public/`，配置中使用从 `/` 开始的路径，例如 `/images/blog/cover.png`。
