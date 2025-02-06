use std::process::Command;
use serde::{Deserialize, Serialize};
use tauri::command;

#[derive(Debug, Serialize, Deserialize)]
pub struct RssSource {
    name: String,
    url: String,
    filter: Option<String>,
    cid: Option<String>,
    site: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Settings {
    http_proxy: Option<String>,
    https_proxy: Option<String>,
    server_mode: bool,
    server_port: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Task {
    id: String,
    name: String,
    status: String,
    progress: i32,
    created_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LoginStatus {
    success: bool,
    message: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FolderInfo {
    cid: String,
    name: String,
    parent_id: String,
}

// 登录相关命令
#[command]
pub async fn login_with_qr() -> Result<String, String> {
    let output = Command::new("rss2cloud")
        .arg("-q")
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[command]
pub async fn login_with_cookies(cookies: String) -> Result<String, String> {
    let output = Command::new("rss2cloud")
        .arg("--cookies")
        .arg(cookies)
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

// RSS源管理命令
#[command]
pub async fn add_rss_task(url: String, no_cache: bool) -> Result<String, String> {
    let mut cmd = Command::new("rss2cloud");
    cmd.arg("-u").arg(url);
    
    if no_cache {
        cmd.arg("--no-cache");
    }

    let output = cmd.output().map_err(|e| e.to_string())?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[command]
pub async fn clear_tasks(task_type: i32) -> Result<String, String> {
    let output = Command::new("rss2cloud")
        .arg("--clear-task-type")
        .arg(task_type.to_string())
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

// 任务列表命令
#[command]
pub async fn get_tasks() -> Result<Vec<Task>, String> {
    let output = Command::new("rss2cloud")
        .arg("--list-tasks")
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        let content = String::from_utf8_lossy(&output.stdout).to_string();
        serde_json::from_str(&content).map_err(|e| e.to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

// 磁力链接相关命令
#[command]
pub async fn add_magnet(link: String, cid: String) -> Result<String, String> {
    let output = Command::new("rss2cloud")
        .arg("magnet")
        .arg("--link")
        .arg(link)
        .arg("--cid")
        .arg(cid)
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

// 服务模式命令
#[command]
pub async fn start_server(port: Option<String>) -> Result<String, String> {
    let mut cmd = Command::new("rss2cloud");
    cmd.arg("server");
    
    if let Some(p) = port {
        cmd.arg("--port").arg(p);
    }

    let output = cmd.output().map_err(|e| e.to_string())?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

// 配置文件操作
#[command]
pub async fn read_rss_config() -> Result<String, String> {
    std::fs::read_to_string("rss.json")
        .map_err(|e| e.to_string())
}

#[command]
pub async fn save_rss_config(config: String) -> Result<(), String> {
    std::fs::write("rss.json", config)
        .map_err(|e| e.to_string())
}

#[command]
pub async fn read_site_config() -> Result<String, String> {
    std::fs::read_to_string("node-site-config.json")
        .map_err(|e| e.to_string())
}

#[command]
pub async fn save_site_config(config: String) -> Result<(), String> {
    std::fs::write("node-site-config.json", config)
        .map_err(|e| e.to_string())
}

#[command]
pub async fn check_login_status() -> Result<LoginStatus, String> {
    let output = Command::new("rss2cloud")
        .arg("--check-login")
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        Ok(LoginStatus {
            success: true,
            message: Some(String::from_utf8_lossy(&output.stdout).to_string()),
        })
    } else {
        Ok(LoginStatus {
            success: false,
            message: Some(String::from_utf8_lossy(&output.stderr).to_string()),
        })
    }
}

#[command]
pub async fn get_folder_list() -> Result<Vec<FolderInfo>, String> {
    let output = Command::new("rss2cloud")
        .arg("--list-folders")
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        let content = String::from_utf8_lossy(&output.stdout).to_string();
        serde_json::from_str(&content).map_err(|e| e.to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
} 