import { invoke } from "@tauri-apps/api/core";

// 登录相关
export const loginWithQr = () => {
  return invoke<string>('login_with_qr');
};

export const loginWithCookies = (cookies: string) => {
  return invoke<string>('login_with_cookies', { cookies });
};

// RSS源管理
export const addRssTask = (url: string, noCache: boolean = false) => {
  return invoke<string>('add_rss_task', { url, noCache });
};

export const clearTasks = (taskType: number) => {
  return invoke<string>('clear_tasks', { taskType });
};

// 任务列表
export interface Task {
  id: string;
  name: string;
  status: 'running' | 'completed' | 'failed';
  progress: number;
  createdAt: string;
}

export const getTasks = () => {
  return invoke<Task[]>('get_tasks');
};

// 磁力链接
export const addMagnet = (link: string, cid: string) => {
  return invoke<string>('add_magnet', { link, cid });
};

// 服务模式
export const startServer = (port?: string) => {
  return invoke<string>('start_server', { port });
};

// 配置文件操作
export interface RssSource {
  name: string;
  url: string;
  filter?: string;
  cid?: string;
  site: string;
}

export interface SiteConfig {
  [key: string]: {
    httpsAgent?: string;
    headers?: Record<string, string>;
  };
}

export const readRssConfig = async () => {
  const content = await invoke<string>('read_rss_config');
  return JSON.parse(content) as Record<string, RssSource[]>;
};

export const saveRssConfig = (config: Record<string, RssSource[]>) => {
  return invoke<void>('save_rss_config', { config: JSON.stringify(config) });
};

export const readSiteConfig = async () => {
  const content = await invoke<string>('read_site_config');
  return JSON.parse(content) as SiteConfig;
};

export const saveSiteConfig = (config: SiteConfig) => {
  return invoke<void>('save_site_config', { config: JSON.stringify(config) });
};

// 登录状态检查
export interface LoginStatus {
  success: boolean;
  message?: string;
}

export const checkLoginStatus = () => {
  return invoke<LoginStatus>('check_login_status');
};

// 115网盘文件夹
export interface FolderInfo {
  cid: string;
  name: string;
  parent_id: string;
}

export const getFolderList = () => {
  return invoke<FolderInfo[]>('get_folder_list');
}; 