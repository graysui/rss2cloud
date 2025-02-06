# RSS2Cloud 桌面客户端开发计划（简化版）

## 项目概述

开发一个简单的桌面客户端，将现有的命令行操作转换为图形界面操作，保持功能不变。

## 技术栈选择

- 框架：Tauri + React
- UI 组件库：Ant Design
- 语言：Rust (后端) + TypeScript (前端)

## 项目结构

```
rss2cloud/
├── 现有项目文件和目录...
└── desktop/                    # 新增的桌面客户端目录
    ├── src-tauri/             # Tauri 后端
    │   ├── src/
    │   │   ├── main.rs        # 主程序入口
    │   │   └── bridge.rs      # 与Go程序的桥接层
    │   └── tauri.conf.json    # Tauri配置
    └── src/                    # 前端代码
        ├── components/        # UI组件
        │   ├── RssForm/      # RSS配置表单
        │   ├── TaskList/     # 任务列表
        │   └── Login/        # 登录组件
        ├── App.tsx           # 主应用
        └── package.json      # 前端依赖配置
```

## 核心功能

### 1. 基础界面 (2天)
- [ ] 登录功能
  - 二维码登录（对应 -q 参数）
  - Cookie登录（对应 --cookies 参数）
  - 登录状态显示

- [ ] RSS配置管理
  - 读取/编辑 rss.json
  - 添加/删除 RSS 源
  - 支持按站点分类显示（mikanani.me, nyaa.si 等）
  - 支持设置过滤规则（filter）
  - 支持设置目标文件夹（cid）

- [ ] 任务管理界面
  - RSS任务列表显示
  - 任务状态和进度显示
  - 支持清理任务（对应 --clear-task-type）
    - 已完成任务
    - 失败任务
    - 运行中任务
    - 所有任务

### 2. 命令封装 (2天)
- [ ] RSS相关命令
  - 执行指定URL的RSS下载（对应 -u 参数）
  - 支持跳过缓存选项（对应 --no-cache）
  - 读取默认配置执行

- [ ] 离线下载命令
  - 支持添加磁力链接（magnet 子命令）
  - 支持批量添加任务（通过文本导入）
  - 支持指定目标文件夹（--cid 参数）

- [ ] 服务模式支持
  - 启动/停止本地服务
  - 显示服务状态
  - 支持通过API添加任务

### 3. 打包发布 (1天)
- [ ] 基本打包配置
- [ ] 生成安装程序
- [ ] 确保配置文件位置正确

## 代码隔离方案

### 1. 简单桥接
```rust
pub struct RssCloud {
    // 封装命令行程序
    pub async fn execute(&self, args: Vec<String>) -> Result<String> {
        Command::new("rss2cloud")
            .args(args)
            .output()
    }

    // 封装常用命令
    pub async fn login_with_qr(&self) -> Result<String> {
        self.execute(vec!["-q".to_string()])
    }

    pub async fn add_magnet(&self, link: String, cid: String) -> Result<String> {
        self.execute(vec!["magnet".to_string(), "--link".to_string(), link, "--cid".to_string(), cid])
    }
}
```

### 2. 配置文件处理
- 直接读写现有的配置文件
- 保持格式完全一致
- 不引入新的配置项

## 时间安排

- 第一周：完成基础界面和命令封装
- 第二周：完成打包和测试

总计预计开发时间：2周

## 简化说明

1. 移除了不必要的功能：
   - 去掉了复杂的状态管理
   - 去掉了主题系统
   - 去掉了多语言支持
   - 去掉了自动更新

2. 保留核心功能：
   - 完整保留命令行工具的所有功能
   - 通过图形界面调用原有命令
   - 保持配置文件格式不变

3. 界面设计原则：
   - 简单直观
   - 功能对应命令行
   - 降低使用门槛 