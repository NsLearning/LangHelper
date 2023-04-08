use log::{error, info};
use serde_json::Value;
use std::{collections::BTreeMap, path::PathBuf};
use tauri::{Manager, Theme};

#[cfg(target_os = "macos")]
use tauri::TitleBarStyle;

use crate::utils::{app_root, create_file, exists};

pub const APP_WEBSITE: &str = "https://lencx.github.io/app/";
pub const ISSUES_URL: &str = "https://github.com/lencx/ChatGPT/issues";
pub const NOFWL_APP: &str = "https://github.com/lencx/nofwl";
pub const UPDATE_LOG_URL: &str = "https://github.com/lencx/ChatGPT/blob/main/UPDATE_LOG.md";
pub const BUY_COFFEE: &str = "https://www.buymeacoffee.com/lencx";
pub const GITHUB_PROMPTS_CSV_URL: &str =
  "https://raw.githubusercontent.com/f/awesome-chatgpt-prompts/main/prompts.csv";

pub const APP_CONF_PATH: &str = "chat.conf.json";
pub const CHATGPT_URL: &str = "https://chat.openai.com";
pub const UA_MOBILE: &str = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1";

macro_rules! pub_struct {
  ($name:ident {$($field:ident: $t:ty,)*}) => {
    #[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
    pub struct $name {
      $(pub $field: $t),*
    }
  }
}

pub_struct!(AppConf {
  titlebar: bool,
  hide_dock_icon: bool,
  // macOS and Windows: light / dark / system
  theme: String,
  // auto update policy: prompt / silent / disable
  auto_update: String,
  stay_on_top: bool,
  save_window_state: bool,
  global_shortcut: Option<String>,
  default_origin: String,

  processor : String,         // gpu ,cpu
  subprocess_number: String,  // 1,2,3
  talk_mode : bool,
  speech_lang: String,       // for web speech api
  speech_ai_lang: String,     // for open source ai speech model
  speech_azure_lang: String,  // for azure speech api
  speech_type: String,       // web, ai, azure, ... need to define the related variable

  rec_lang: String,          // for web recognition api
  rec_ai_lang: String,       // for open source ai recognition api
  rec_iflytek_lang: String,   // for Iflytek recognition api
  rec_type: String,           // web, ai, Iflytek, ...

  assess_type: String,        //iflytek, speechsuper

  iflytek_rec_appid: String,
  iflytek_rec_apikey: String,
  iflytek_assess_appid: String,
  iflytek_assess_appsecret: String,
  iflytek_assess_apikey: String,
  ss_assess_appkey: String,
  ss_assess_secretkey: String,
  // Main Window
  isinit: bool,
  popup_search: bool,
  main_close: bool,
  main_dashboard: bool,
  main_origin: String,
  ua_window: String,
  main_width: f64,
  main_height: f64,

  // Tray Window
  tray_width: f64,
  tray_height: f64,
  tray: bool,
  tray_dashboard: bool,
  tray_origin: String,
  ua_tray: String,
});

impl AppConf {
  pub fn new() -> Self {
    info!("conf_init");
    Self {
      titlebar: !cfg!(target_os = "macos"),
      hide_dock_icon: false,
      save_window_state: false,
      theme: "light".into(),
      auto_update: "prompt".into(),
      #[cfg(target_os = "macos")]
      speech_lang: "com.apple.eloquence.en-US.Rocko".into(),
      #[cfg(not(target_os = "macos"))]
      speech_lang: "".into(),
      processor : "cpu".into(),         // gpu ,cpu
      subprocess_number: "3".into(),    // 1,2,3
      talk_mode: true,
      speech_ai_lang: "accent_per_sentence".into(),
      speech_azure_lang: "".into(),
      speech_type: "web".into(),
      rec_lang: "en-US".into(),
      rec_ai_lang: "".into(),
      rec_iflytek_lang: "en".into(),
      rec_type: "web".into(),  // web ai iflytek
      assess_type: "speechsuper".into(), // speechsuper,iflytek
      iflytek_rec_appid: "".into(),
      iflytek_rec_apikey: "".into(),
      iflytek_assess_appid: "".into(),
      iflytek_assess_appsecret: "".into(),
      iflytek_assess_apikey: "".into(),
      ss_assess_appkey: "".into(),
      ss_assess_secretkey: "".into(),
      tray: false,
      popup_search: false,
      isinit: true,
      main_close: false,
      stay_on_top: false,
      main_dashboard: false,
      tray_dashboard: false,
      main_width: 800.0,
      main_height: 600.0,
      tray_width: 360.0,
      tray_height: 540.0,
      main_origin: CHATGPT_URL.into(),
      tray_origin: CHATGPT_URL.into(),
      default_origin: CHATGPT_URL.into(),
      ua_tray: UA_MOBILE.into(),
      ua_window: "".into(),
      global_shortcut: None,
    }
  }

  pub fn file_path() -> PathBuf {
    app_root().join(APP_CONF_PATH)
  }

  pub fn read() -> Self {
    match std::fs::read_to_string(Self::file_path()) {
      Ok(v) => {
        if let Ok(v2) = serde_json::from_str::<AppConf>(&v) {
          v2
        } else {
          error!("conf_read_parse_error");
          Self::default()
        }
      }
      Err(err) => {
        error!("conf_read_error: {}", err);
        Self::default()
      }
    }
  }

  pub fn write(self) -> Self {
    let path = &Self::file_path();
    if !exists(path) {
      create_file(path).unwrap();
      info!("conf_create");
    }
    if let Ok(v) = serde_json::to_string_pretty(&self) {
      std::fs::write(path, v).unwrap_or_else(|err| {
        error!("conf_write: {}", err);
        Self::default().write();
      });
    } else {
      error!("conf_ser");
    }
    self
  }

  pub fn amend(self, json: Value) -> Self {
    let val = serde_json::to_value(&self).unwrap();
    let mut config: BTreeMap<String, Value> = serde_json::from_value(val).unwrap();
    let new_json: BTreeMap<String, Value> = serde_json::from_value(json).unwrap();

    for (k, v) in new_json {
      config.insert(k, v);
    }

    match serde_json::to_string_pretty(&config) {
      Ok(v) => match serde_json::from_str::<AppConf>(&v) {
        Ok(v) => v,
        Err(err) => {
          error!("conf_amend_parse: {}", err);
          self
        }
      },
      Err(err) => {
        error!("conf_amend_str: {}", err);
        self
      }
    }
  }

  #[cfg(target_os = "macos")]
  pub fn titlebar(self) -> TitleBarStyle {
    if self.titlebar {
      TitleBarStyle::Transparent
    } else {
      TitleBarStyle::Overlay
    }
  }

  pub fn theme_mode() -> Theme {
    match Self::get_theme().as_str() {
      "system" => match dark_light::detect() {
        // Dark mode
        dark_light::Mode::Dark => Theme::Dark,
        // Light mode
        dark_light::Mode::Light => Theme::Light,
        // Unspecified
        dark_light::Mode::Default => Theme::Light,
      },
      "dark" => Theme::Dark,
      _ => Theme::Light,
    }
  }

  pub fn get_theme() -> String {
    Self::read().theme.to_lowercase()
  }

  pub fn get_auto_update(self) -> String {
    self.auto_update.to_lowercase()
  }

  pub fn theme_check(self, mode: &str) -> bool {
    self.theme.to_lowercase() == mode
  }

  pub fn restart(self, app: tauri::AppHandle) {
    tauri::api::process::restart(&app.env());
  }
}

impl Default for AppConf {
  fn default() -> Self {
    Self::new()
  }
}

pub mod cmd {
  use super::AppConf;
  use tauri::{command, AppHandle, Manager};

  #[command]
  pub fn get_app_conf() -> AppConf {
    AppConf::read()
  }

  #[command]
  pub fn reset_app_conf() -> AppConf {
    AppConf::default().write()
  }

  #[command]
  pub fn get_theme() -> String {
    AppConf::get_theme()
  }

  #[command]
  pub fn form_confirm(_app: AppHandle, data: serde_json::Value) {
    AppConf::read().amend(serde_json::json!(data)).write();
  }

  #[command]
  pub fn form_cancel(app: AppHandle, label: &str, title: &str, msg: &str) {
    let win = app.app_handle().get_window(label).unwrap();
    tauri::api::dialog::ask(
      app.app_handle().get_window(label).as_ref(),
      title,
      msg,
      move |is_cancel| {
        if is_cancel {
          win.close().unwrap();
        }
      },
    );
  }

  #[command]
  pub fn form_msg(app: AppHandle, label: &str, title: &str, msg: &str) {
    let win = app.app_handle().get_window(label);
    tauri::api::dialog::message(win.as_ref(), title, msg);
  }
}
