<p align="center">
  <img width="180" src="./public/logo.png" alt="ChatGPT">
  <h1 align="center">ChatGPT</h1>
  <p align="center">ChatGPT Desktop Application (Mac, Windows and Linux)</p>
</p>

[![English badge](https://img.shields.io/badge/%E8%8B%B1%E6%96%87-English-blue)](./README.md)
[![简体中文 badge](https://img.shields.io/badge/%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87-Simplified%20Chinese-blue)](./README-ZH_CN.md)\
![visitor](https://visitor-badge.glitch.me/badge?page_id=lencx.chatgpt)
[![ChatGPT downloads](https://img.shields.io/github/downloads/lencx/ChatGPT/total.svg?style=flat-square)](https://github.com/lencx/ChatGPT/releases)
[![chat](https://img.shields.io/badge/chat-discord-blue?style=flat&logo=discord)](https://discord.gg/aPhCRf4zZr)
[![lencx](https://img.shields.io/badge/follow-lencx__-blue?style=flat&logo=Twitter)](https://twitter.com/lencx_)

<!-- [![lencx](https://img.shields.io/twitter/follow/lencx_.svg?style=social)](https://twitter.com/lencx_) -->

<!-- [![中文版 badge](https://img.shields.io/badge/%E4%B8%AD%E6%96%87-Traditional%20Chinese-blue)](./README-ZH.md) -->

<a href="https://www.buymeacoffee.com/lencx" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-blue.png" alt="Buy Me A Coffee" style="height: 40px !important;width: 145px !important;" ></a>

**🛑 URGENT NOTICE: A hacker has been found to take advantage of the heat of `lencx/ChatGPT` to plant a Trojan horse after the fork project and rebuild the installer. If you have friends around you who are using this desktop application, please remind them not to download unknown links freely. Now the project will remove other installation ways and only provide this download link https://github.com/lencx/ChatGPT/releases**

**🛑 紧急通知：目前发现有黑客利用 `lencx/ChatGPT` 的热度，在 fork 项目后植入木马，重新构建安装程序。如果你身边有朋友正在使用此桌面应用，请提醒 TA 们不要随意下载不明链接。现在项目将删除其他安装途径，仅提供此下载链接 https://github.com/lencx/ChatGPT/releases**

---

**It is an unofficial project intended for personal learning and research purposes only. During the time that the ChatGPT desktop application was open-sourced, it received a lot of attention, and I would like to thank everyone for their support. However, as things have developed, there are two issues that seriously affect the project's next development plan:**

- **Some people have used it for repackaging and selling for profit.**
- **The name and icon of ChatGPT may be involved in infringement issues.**

**New repository: https://github.com/lencx/nofwl**

---

## 📦 Install

- [📝 Update Log](./UPDATE_LOG.md)
- [🕒 History versions...](https://github.com/lencx/ChatGPT/releases)

<!-- tr-download-start -->

### Windows

- [ChatGPT_0.12.0_windows_x86_64.msi](https://github.com/lencx/ChatGPT/releases/download/v0.12.0/ChatGPT_0.12.0_windows_x86_64.msi): Direct download installer
- Use [winget](https://winstall.app/apps/lencx.ChatGPT):

  ```bash
  # install the latest version
  winget install --id=lencx.ChatGPT -e

  # install the specified version
  winget install --id=lencx.ChatGPT -e --version 0.10.0
  ```

**Note: If the installation path and application name are the same, it will lead to conflict ([#142](https://github.com/lencx/ChatGPT/issues/142#issuecomment-0.12.0))**

### Mac

- [ChatGPT_0.12.0_macos_aarch64.dmg](https://github.com/lencx/ChatGPT/releases/download/v0.12.0/ChatGPT_0.12.0_macos_aarch64.dmg): Direct download installer
- [ChatGPT_0.12.0_macos_x86_64.dmg](https://github.com/lencx/ChatGPT/releases/download/v0.12.0/ChatGPT_0.12.0_macos_x86_64.dmg): Direct download installer
- Homebrew \
  Or you can install with _[Homebrew](https://brew.sh) ([Cask](https://docs.brew.sh/Cask-Cookbook)):_
  ```sh
  brew tap lencx/chatgpt https://github.com/lencx/ChatGPT.git
  brew install --cask chatgpt --no-quarantine
  ```
  Also, if you keep a _[Brewfile](https://github.com/Homebrew/homebrew-bundle#usage)_, you can add something like this:
  ```rb
  repo = "lencx/chatgpt"
  tap repo, "https://github.com/#{repo}.git"
  cask "chatgpt", args: { "no-quarantine": true }
  ```

**If you encounter the error message `"ChatGPT" is damaged and can't be opened. You should move it to the Trash`. while installing software on macOS, it may be due to security settings restrictions in macOS. To solve this problem, please try the following command in Terminal:**

```bash
sudo xattr -r -d com.apple.quarantine /YOUR_PATH/ChatGPT.app
```

### Linux

- [ChatGPT_0.12.0_linux_x86_64.deb](https://github.com/lencx/ChatGPT/releases/download/v0.12.0/ChatGPT_0.12.0_linux_x86_64.deb): Download `.deb` installer, advantage small size, disadvantage poor compatibility
- [ChatGPT_0.12.0_linux_x86_64.AppImage.tar.gz](https://github.com/lencx/ChatGPT/releases/download/v0.12.0/ChatGPT_0.12.0_linux_x86_64.AppImage.tar.gz): Works reliably, you can try it if `.deb` fails to run

<!-- tr-download-end -->

## 📢 Announcement

### ChatGPT Prompts!

This is a major and exciting update. It works like a `Telegram bot command` and helps you quickly populate custom models to make chatgpt work the way you want it to. This project has taken a lot of my spare time, so if it helps you, please help spread the word or star it would be a great encouragement to me. I hope I can keep updating it and adding more interesting features.

### How does it work?

You can look at **[awesome-chatgpt-prompts](https://github.com/f/awesome-chatgpt-prompts)** to find interesting features to import into the app. You can also use `Sync Prompts` to sync all in one click, and if you don't want certain prompts to appear in your slash commands, you can disable them.

![chatgpt cmd](./assets/chatgpt-cmd.png)
![chatgpt sync prompts](./assets/chatgpt-sync-prompts.png)

<!-- After the data import is done, you can restart the app to make the configuration take effect (`Menu -> Preferences -> Restart ChatGPT`). -->

- In the chatgpt text input area, type a character starting with `/` to bring up the command prompt, press the spacebar, and it will fill the input area with the text associated with the command by default (note: if it contains multiple command prompts, it will only select the first one as the fill, you can keep typing until the first prompted command is the one you want, then press the spacebar.
- Or use the mouse to click on one of the multiple commands). When the fill is complete, you simply press the Enter key.
- Under the slash command, use the tab key to modify the contents of the `{q}` tag (only single changes are supported [#54](https://github.com/lencx/ChatGPT/issues/54)). Use the keyboard `⇧` (arrow up) and `⇩` (arrow down) keys to select the slash command.

![chatgpt](assets/chatgpt.gif)
![chatgpt-cmd](assets/chatgpt-cmd.gif)

## ✨ Features

- Multi-platform: `macOS` `Linux` `Windows`
- Text-to-Speech
- Export ChatGPT history (PNG, PDF and Markdown)
- The main window and system tray support custom URLs to wrap any website into a desktop application
- Automatic application upgrade notification
- Common shortcut keys
- System tray hover window
- Powerful menu items
- Support for slash commands and their configuration (can be configured manually or synchronized from a file [#55](https://github.com/lencx/ChatGPT/issues/55))
- Customize global shortcuts ([#108](https://github.com/lencx/ChatGPT/issues/108))
- Pop-up Search ([#122](https://github.com/lencx/ChatGPT/issues/122) mouse selected content, no more than 400 characters): The application is built using Tauri, and due to its security restrictions, some of the action buttons will not work, so we recommend going to your browser.

## #️⃣ MenuItem

- **Preferences**
  - `Theme` - `Light`, `Dark`, `System` (Only macOS and Windows are supported).
  - `Stay On Top`: The window is stay on top of other windows.
  - `Titlebar`: Whether to display the titlebar, supported by macOS only.
  - `Hide Dock Icon` ([#35](https://github.com/lencx/ChatGPT/issues/35)): Hide application icons from the Dock(support macOS only).
    - Right-click on the SystemTray to open the menu, then click `Show Dock Icon` in the menu item to re-display the application icon in the Dock (`SystemTrayMenu -> Show Dock Icon`).
  - `Inject Script`: Using scripts to modify pages.
  - `Control Center`: The control center of ChatGPT application, it will give unlimited imagination to the application.
    - `Theme`, `Stay On Top`, `Titlebar`, ...
    - `User Agent` ([#17](https://github.com/lencx/ChatGPT/issues/17)): Custom `user agent`, which may be required in some scenarios. The default value is the empty string.
    - `Switch Origin` ([#14](https://github.com/lencx/ChatGPT/issues/14)): Switch the site source address, the default is `https://chat.openai.com`, please make sure the mirror site UI is the same as the original address. Otherwise, some functions may not be available.
  - `Go to Config`: Open the configuration file directory (`path: ~/.chatgpt/*`).
  - `Clear Config`: Clear the configuration file (`path: ~/.chatgpt/*`), dangerous operation, please backup the data in advance.
  - `Restart ChatGPT`: Restart the application, for example: the program is stuck or the injection script can take effect by restarting the application after editing.
  - `Awesome ChatGPT`: Recommended Related Resources.
- **Edit** - `Undo`, `Redo`, `Cut`, `Copy`, `SelectAll`, ...
- **View** - `Go Back`, `Go Forward`, `Scroll to Top of Screen`, `Scroll to Bottom of Screen`, `Refresh the Screen`, ...
- **Help**
  - `Update Log`: ChatGPT changelog.
  - `Report Bug`: Report a bug or give feedback.
  - `Toggle Developer Tools`: Developer debugging tools.

## ⚙️ Application Configuration

| Platform | Path                      |
| -------- | ------------------------- |
| Linux    | `/home/lencx/.chatgpt`    |
| macOS    | `/Users/lencx/.chatgpt`   |
| Windows  | `C:\Users\lencx\.chatgpt` |

- `[.chatgpt]` - Application configuration root folder
  - `chat.conf.json` - Preferences configuration
  - `chat.awesome.json` - Custom URL lists, similar to browser bookmarks. Any URL can be used as the main window or tray window (**Control Conter -> Awesome**)
  - `chat.model.json` - prompts configuration，contains three parts:
    - `user_custom` - Requires manual data entry (**Control Conter -> Language Model -> User Custom**)
    - `sync_prompts` - Synchronizing data from [f/awesome-chatgpt-prompts](https://github.com/f/awesome-chatgpt-prompts) (**Control Conter -> Language Model -> Sync Prompts**)
    - `sync_custom` - Synchronize custom json and csv file data, support local and remote (**Control Conter -> Language Model -> Sync Custom**)
  - `chat.model.cmd.json` - Filtered (whether to enable) and sorted slash commands
  - `[cache_model]` - Caching model data
    - `chatgpt_prompts.json` - Cache `sync_prompts` data
    - `user_custom.json` - Cache `user_custom` data
    - `ae6cf32a6f8541b499d6bfe549dbfca3.json` - Randomly generated file names, cache `sync_custom` data
    - `4f695d3cfbf8491e9b1f3fab6d85715c.json` - Randomly generated file names, cache `sync_custom` data
    - `bd1b96f15a1644f7bd647cc53073ff8f.json` - Randomly generated file names, cache `sync_custom` data

### Sync Custom

Currently, only JSON and CSV are supported for synchronizing custom files, and the following formats need to be met, otherwise the application will be abnormal：

`JSON format:`

```json
[
  {
    "cmd": "a",
    "act": "aa",
    "prompt": "aaa aaa aaa"
  },
  {
    "cmd": "b",
    "act": "bb",
    "prompt": "bbb bbb bbb"
  }
]
```

`CSV format`

```csv
"cmd","act","prompt"
"a","aa","aaa aaa aaa"
"b","bb","bbb bbb bbb"
```

## 📌 TODO

<!-- - Web access capability ([#20](https://github.com/lencx/ChatGPT/issues/20)) -->

- `Control Center` enhancement
- `Pop-up Search` enhancement
- ...

## 👀 Preview

<img width="320" src="./assets/install.png" alt="install"> <img width="320" src="./assets/chatgpt-popup-search.png" alt="popup search">
<img width="320" src="./assets/chatgpt-control-center-general.png" alt="control center"> <img width="320" src="./assets/chatgpt-export.png" alt="export">
<img width="320" src="./assets/chatgpt-dalle2-tray.png" alt="dalle2 tray"> <img width="320" src="./assets/auto-update.png" alt="auto update">

## ❓FAQ

### Can't open ChatGPT

If you cannot open the application after the upgrade, please try to clear the configuration file, which is in the `~/.chatgpt/*` directory.

### Out of sync login status between multiple windows

If you have already logged in in the main window, but the system tray window shows that you are not logged in, you can fix it by restarting the application (`Menu -> Preferences -> Restart ChatGPT`).

### Is it safe?

It's safe, just a wrapper for [OpenAI ChatGPT](https://chat.openai.com) website, no other data transfer exists (you can check the source code).

### Developer cannot be verified?

- [Open a Mac app from an unidentified developer](https://support.apple.com/en-sg/guide/mac-help/mh40616/mac)

---

### How do I build it?

#### PreInstall

- [Rust (Required)](https://www.rust-lang.org/)
- [Node.js (Required)](https://nodejs.org/)
- [VS Code (Optional)](https://code.visualstudio.com/)
  - [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
  - [tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode)

#### Start

```bash
# step1:
git clone https://github.com/lencx/ChatGPT.git

# step2:
cd ChatGPT

# step3: install deps
yarn

# step4:
yarn dev

# step5:
# bundle path: src-tauri/target/release/bundle
yarn build
```

- [The distDir configuration is set to "../dist" but this path doesn't exist.](https://github.com/lencx/ChatGPT/discussions/180)
- [Error A public key has been found, but no private key. Make sure to set TAURI_PRIVATE_KEY environment variable.](https://github.com/lencx/ChatGPT/discussions/182)

## ❤️ Thanks

- The core implementation of the share button code was copied from the [@liady](https://github.com/liady) extension with some modifications.
- Thanks to the [Awesome ChatGPT Prompts](https://github.com/f/awesome-chatgpt-prompts) repository for inspiring the custom command function for this application.

---

[![Star History Chart](https://api.star-history.com/svg?repos=lencx/chatgpt&type=Timeline)](https://star-history.com/#lencx/chatgpt&Timeline)

## 中国用户

国内用户如果遇到使用问题或者想交流 ChatGPT 技巧，可以关注公众号“浮之静”，发送 “chat” 进群参与讨论。公众号会更新[《Tauri 系列》](https://mp.weixin.qq.com/mp/appmsgalbum?__biz=MzIzNjE2NTI3NQ==&action=getalbum&album_id=2593843659863752704)文章，技术思考等等，如果对 tauri 开发应用感兴趣可以关注公众号后回复 “tauri” 进技术开发群（想私聊的也可以关注公众号，来添加微信）。开源不易，如果这个项目对你有帮助可以分享给更多人，或者微信扫码打赏。

<img width="180" src="https://user-images.githubusercontent.com/16164244/207228300-ea5c4688-c916-4c55-a8c3-7f862888f351.png"> <img width="200" src="https://user-images.githubusercontent.com/16164244/207228025-117b5f77-c5d2-48c2-a070-774b7a1596f2.png">

<a href="https://t.zsxq.com/0bQikmcVw"><img width="360" src="./assets/zsxq.png"></a>

## License

AGPL-3.0 License
