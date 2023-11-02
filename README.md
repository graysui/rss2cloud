# rss2cloud

将 RSS 订阅离线下载到 115 网盘。

## 关于

基于 [deadblue/elevengo](https://github.com/deadblue/elevengo)

支持 RSS 源: nyaa, dmhy, mikanni

Rust 版本 [rss2pan](https://github.com/zhifengle/rss2pan) 使用的 Web API 添加离线任务，容易触发验证码

TODO

- [ ] 二维码登录

## 用法

在同一目录下面，配置好 `rss.json` 和 `node-site-config.json`

在命令行运行 `rss2cloud`

```bash
# 查看帮助
rss2cloud -h
# 直接运行。读取 rss.json，依次添加离线任务
rss2cloud

# 指定 rss URL 离线下载
# 如果 rss.json 存在这条url 的配置，会读取配置。没有配置，默认离线到 115 的默认目录
rss2cloud -u "https://mikanani.me/RSS/Bangumi?bangumiId=2739&subgroupid=12"

# 查看 magnet 子命令帮助
rss2cloud magnet -h
rss2cloud magnet --link "magnet:?xt=urn:btih:12345" --cid "12345"
# 离线包含 magnet 的 txt 文件; 按行分割
rss2cloud magnet --txt magnet.txt --cid "12345"
```

## 配置

### 配置文件 rss.json

```json
{
  "mikanani.me": [
    {
      "name": "test",
      "filter": "/简体|1080p/",
      "url": "https://mikanani.me/RSS/Bangumi?bangumiId=2739&subgroupid=12"
    }
  ],
  "nyaa.si": [
    {
      "name": "VCB-Studio",
      "cid": "2479224057885794455",
      "url": "https://nyaa.si/?page=rss&u=VCB-Studio"
    }
  ],
  "sukebei.nyaa.si": [
    {
      "name": "name",
      "cid": "2479224057885794455",
      "url": "https://sukebei.nyaa.si/?page=rss"
    }
  ],
  "share.dmhy.org": [
    {
      "name": "水星的魔女",
      "filter": "简日双语",
      "cid": "2479224057885794455",
      "url": "https://share.dmhy.org/topics/rss/rss.xml?keyword=%E6%B0%B4%E6%98%9F%E7%9A%84%E9%AD%94%E5%A5%B3&sort_id=2&team_id=0&order=date-desc"
    }
  ]
}
```

配置了 `filter` 后，标题包含该文字的会被离线。不设置 `filter` 默认离线全部

`/简体|\\d{3-4}[pP]/` 使用斜线包裹的正则规则。注意转义规则

cid 是离线到指定的文件夹的 id 。

获取方法: 浏览器打开 115 的文件，地址栏像 `https://115.com/?cid=2479224057885794455&offset=0&tab=&mode=wangpan`

> 其中 2479224057885794455 就是 cid

### node-site-config.json 配置

配置示例。 设置 【httpsAgent】 表示使用代理连接对应网站。不想使用代理删除对应的配置。

```json
{
  "share.dmhy.org": {
    "httpsAgent": "httpsAgent"
  },
  "nyaa.si": {
    "httpsAgent": "httpsAgent"
  },
  "sukebei.nyaa.si": {
    "httpsAgent": "httpsAgent"
  },
  "mikanime.tv": {
    "headers": {
      "Referer": "https://mikanime.tv/"
    }
  },
  "mikanani.me": {
    "httpsAgent": "httpsAgent",
    "headers": {
      "Referer": "https://mikanani.me/"
    }
  }
}
```

#### cookie 配置

```bash
# 查看帮助
rss2cloud --cookies "yourcookies"
```

```json
{
  "115.com": {
    "headers": {
      "cookie": "yourcookie"
    }
  }
}
```

### proxy 配置

设置【httpsAgent】会使用代理。默认使用的地址 `http://127.0.0.1:10809`。

> 【httpsAgent】沿用的 node 版的配置。

需要自定义代理时，在命令行设置 Windows: set ALL_PROXY=http://youraddr:port

> Linux: export ALL_PROXY=http://youraddr:port

```batch
@ECHO off
SETLOCAL
CALL :find_dp0
REM set ALL_PROXY=http://youraddr:port
rss2cloud.exe  %*
ENDLOCAL
EXIT /b %errorlevel%
:find_dp0
SET dp0=%~dp0
EXIT /b
```

把上面的 batch 例子改成自己的代理地址。另存为 rss2cloud.cmd 和 rss2cloud.exe 放在一个目录下面。

在命令行运行 rss2cloud.cmd 就能够使用自己的代理的了。

### 日志的环境变量

不想看日志时，Windows: set RUST_LOG=error
