## ✨ Features / 功能
1. talk to ChatGPT / 口语对话

    - support different speech types, web, AI with hundreds accents (VCTK corpus), will support azure, iflytek. 目前支持web发音（和知名插件一样的机械音），100多种更加自然的AI口音，将支持azure及科大讯飞双语发音，可根据喜好自由选择。[100多种口音演示](https://www.bilibili.com/video/BV1Q84y1P7nK/?spm_id_from=333.999.0.0&vd_source=21f2f45d40a5b4fec0f1ea075e50b356)

    - support two recognition tech, web and iflytek. 支持原声web识别（如果仅识别英文足够了），科大讯飞支持同时双语识别。[双语识别演示](https://www.bilibili.com/video/BV11L411C7G2/?spm_id_from=333.999.0.0&vd_source=21f2f45d40a5b4fec0f1ea075e50b356)
2. Speaking Assessment / 发音评分

     integrate two Assessment API, speechsuper and iflytek now, open to get better algorithms to perfect the feature for IELTS/TOEFL test. 目前集成了两种评分接口，可结合ChatGPT进行雅思托福口语测试，期待有更好的算法去完善这个功能。[口语评分演示](https://www.bilibili.com/video/BV1Ch41137en/?spm_id_from=333.999.0.0&vd_source=21f2f45d40a5b4fec0f1ea075e50b356)
3. Memorize Words with context / 语境记词

   Add new words to your own dictionary, when you talk with the ChatGPT meeting the new words, web will mark it with highlight color for reminding you unless you mark it as known.  可以把生词加入生词本，之后和chatGPT对话再遇到这个生词，网页会标注明显的颜色，熟悉之后把它标熟便不会再出现生词提示。[语境记词演示，03:45开始](https://www.bilibili.com/video/BV1nj411c7zi/?spm_id_from=333.999.0.0&vd_source=21f2f45d40a5b4fec0f1ea075e50b356)
4. Listening test(to do) / 听力测试（待做）
5. open to receive more ideas to perfect the language helper. / 期待有更多的建议去完善这个语言助手。

## 📦 Install
### windows

  目前要使用AI发音得装ChatGPT desktop for Langhelper + LangHelper + espeak-ng，因为跑AI用到pytorch一些库比较大，放弃了把python程序打包成bin文件集成到ChatGPT desktop for Langhelper， espeak-ng是语音合成的必须依赖。
- ChatGPT desktop for Langhelper(改版后的chatgpt桌面应用，ChatGPT文件下是改过的源码，但是那些文档的链接并不适用，可以自己编译也可以用主目录下的chatgpt.exe)， windows 4月初更新那版好像会查杀，允许就好（可以查源代码, 没有任何其他有害脚本注入）。
- LangHelper（AI发音及其他辅助程序, LangHelper文件下的python程序，还没有打包成应用)
- espeak-ng (开源的文本转语音库)

### mac
- need help (有没有开发者帮忙在mac上测试一下)


# Time
1. Need more time to let users apply it easily and fix bugs, thanks for your patience.
2. Follow my channel to know the latest update.https://space.bilibili.com/33672855/video
3. Welcome all developers who interested in this project join me.
