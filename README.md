## Crucial

- 大家要是觉得这个应用实用，麻烦点个star支持一下，谢谢！


## ✨ Features / 功能
1. talk to ChatGPT / 口语对话

    - support different speech types, web, AI with hundreds accents (VCTK corpus), will support azure, iflytek. 目前支持web发音（和知名插件一样的机械音），100多种更加自然的AI口音，将支持azure及科大讯飞双语发音，可根据喜好自由选择。[100多种口音演示](https://www.bilibili.com/video/BV1Q84y1P7nK/?spm_id_from=333.999.0.0&vd_source=21f2f45d40a5b4fec0f1ea075e50b356)

    - support two recognition tech, web and iflytek. 支持原声web识别（如果仅识别英文足够了），科大讯飞支持同时双语识别。[双语识别演示](https://www.bilibili.com/video/BV11L411C7G2/?spm_id_from=333.999.0.0&vd_source=21f2f45d40a5b4fec0f1ea075e50b356)
    
    - talk to any celebrities, such as Obama, Taylor, Downey...[奥巴马、霉霉、小罗伯特唐尼实时语音演示](https://www.bilibili.com/video/BV1Am4y127rp/)
    
    - will offer interface for loading your TTS model. 将支持加载自训练的任意口音模型（将出个通用的软件及教程去训练定制口音模型）。
    
2. Speaking Assessment / 发音评分

     integrate two Assessment API, speechsuper and iflytek now, open to get better algorithms to perfect the feature for IELTS/TOEFL test. 目前集成了两种评分接口，可结合ChatGPT进行雅思托福口语测试，期待有更好的算法去完善这个功能。[口语评分演示](https://www.bilibili.com/video/BV1Ch41137en/?spm_id_from=333.999.0.0&vd_source=21f2f45d40a5b4fec0f1ea075e50b356) + [IELTS spoken test prompts](#ielts)
     
3. Memorize Words with context / 语境记词

   Add new words to your own dictionary, when you talk with the ChatGPT meeting the new words, web will mark it with highlight color for reminding you unless you mark it as known.  可以把生词加入生词本，之后和chatGPT对话再遇到这个生词，网页会标注明显的颜色，熟悉之后把它标熟便不会再出现生词提示。[语境记词演示，03:45开始](https://www.bilibili.com/video/BV1nj411c7zi/?spm_id_from=333.999.0.0&vd_source=21f2f45d40a5b4fec0f1ea075e50b356)
   
4. Listening test(to do) / 听力测试（待做）

5. open to receive more ideas to perfect the language helper. / 期待有更多的建议去完善这个语言助手。

## 📦 Install
### windows

  [ChatGPT and LangHelper](https://github.com/NsLearning/LangHelper/releases/tag/V0.01.2) + [espeak-ng 装x86版的](https://github.com/espeak-ng/espeak-ng/releases/tag/1.51). ChatGPT and LangHelper 都是免安装的，espeak-ng 一路默认安装即可。[视频教程](https://www.bilibili.com/video/BV1f24y1c7qm/?vd_source=21f2f45d40a5b4fec0f1ea075e50b356) + [文字教程及注意事项](#instructions)
  
  目前要使用AI发音得装ChatGPT desktop for Langhelper + LangHelper + espeak-ng，因为跑AI用到pytorch一些库比较大，放弃了把python程序打包成bin文件集成到ChatGPT desktop for Langhelper， espeak-ng是语音合成的必须依赖。
- ChatGPT desktop for Langhelper(改版后的chatgpt桌面应用)， windows 4月初更新那版好像会查杀，允许就好（可以查源代码, 没有任何其他有害脚本注入）。
- LangHelper（AI发音及其他辅助程序, LangHelper文件下的python程序)
- espeak-ng (开源的文本转语音库)

### Mac
- on test, need help!!!


## Time
1. Need more time to let users apply it easily and fix bugs, thanks for your patience.
2. Follow my channel to know the latest update.https://space.bilibili.com/33672855/video
3. Welcome all developers who interested in this project join me.

## Issues
1. could't find ffmpeg or avconv - defaulting to ffmpeg, but may not work. 可能些许win版本需要依赖ffmpeg, 安装即可，记得配置环境变量，下一个版本会尝试解决这个问题。

2. somthing wrong when generate audio. 进入cmd 输入指令 espeak-ng -h 看是否安装espeak-ng 成功，大部分使用x86版成功的，也有使用64版成功的，这一点我也很疑惑。

3. espeak-ng -h 成功还出现somthing wrong when generate audio. 等我下一版打印具体出错信息方便定位问题。

## instructions

1. 解压压缩包，一个Langhelper文件夹（内含langhelper.exe），一个chatgpt.exe, 分别打开。langhelper 会等待chatgpt配置完成后才能工作，chatgpt在-> preferences -> control center ->
setting -> LangHelper 下设置语音相关功能， 没有配置API，就不要选其他的speech type 和recognition，设置完成后点击submit后, 有个restart提示点击yes. 这是langhelper窗口会出现Complete init -> start conversation，表示初始化完成。

2. 对话不能正常AI发音，先在setting -> LangHelper->Audition text 同行点击try测试是否能发音，文本为空则会默认合成"you are  gorgeous, i love you". 看langhlper界面是什么提示，error:Obama, 就是表示Obama口音不能用，其他就是可能环境没配置好。入群发问请给出详细的错误截图信息。以下为合成How can I assist you today? 正常信息提示：
     > Text splitted to sentences.
    ['How can I assist you today?']
    Hello! p241
     > Text splitted to sentences.
    ['Hello!']
     > Processing time: 0.8514664173126221
     > Real-time factor: 0.5273829916220033
     > Processing time: 0.6864285469055176
     > Real-time factor: 0.6285610240559246

3. 语音识别，需先点一次speech recognition, 待不再需要识别后再点一次结束识别。

## ielts
How to set up prompts? Preferences -> control center ->Language Model -> User Custom ->Add model, add your custom prompts, here is my presetting ITELTS prompt for reference:
 > I want you to ask me some questions for simulating IELTS speaking test, non offical but give score of reference,when you ask me a question,  I'll respond you my spoken text and  prounciation scores which come from speech recognition and assessment tech, please remeber that you should ask me question one by one  it means that you should offer another question after I give you response text which including prouncation scores, do not give questions one time because I do not want to respond it by one time, after all questions finished , you can combine the score to assess my answer, please give me the final score of IELTS speaking test.so  let's start first question.

## 交流群
![image](https://github.com/NsLearning/LangHelper/blob/main/langhelper.jpg)
