// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod bridge;

use bridge::*;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            login_with_qr,
            login_with_cookies,
            check_login_status,
            add_rss_task,
            clear_tasks,
            get_tasks,
            add_magnet,
            start_server,
            read_rss_config,
            save_rss_config,
            read_site_config,
            save_site_config,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
