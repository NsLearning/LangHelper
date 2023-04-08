var RecBtnClickCnt = 0;
const SpeechRecognitionApi_Sart = 'http://localhost:6868/Rec/Start';
const SpeechRecognitionApi_Stop = 'http://localhost:6868/Rec/Stop';
const SkipSpeechApi = 'http://localhost:6868/Skip';
const NewMessageFlagApi = "http://localhost:6868/NewMessage";
const SpeakOutApi = "http://localhost:6868/play";
const SpeakAssessmentApi = "http://localhost:6868/assess";
const SettingInitApi = 'http://localhost:6868/init';
const Helper_Rec_Start_Action = "start";
const Helper_Rec_Stop_Action = "stop";


var Helper_Messages_Count = 0;
var Helper_Current_Message = null;
var Helper_Current_Message_Sentences = [];
var Helper_Current_Message_Sentences_Next_Read = 0;
var Helper_NewMessage_Ending_Cnt = 0
var Helper_NewMessage_Ending_Enable = 0

var Web_Speech_Rec = null;
var New_Words = []; 

var chatConf = {};

async function init() {
  new MutationObserver(function (mutationsList) {
    for (const mutation of mutationsList) {
      // console.log(mutation);
      // if (mutation.target.closest(".text-sm")) {
      //   console.log("create btns");
      //   chatBtns();
      // }
      if (mutation.target.closest("form")) {
        chatBtns();
      }
      if (mutation.target.matches("#__next")) {
        console.log("---CheckNewMessages");
        Helper_Messages_Count = document.querySelectorAll('.text-base').length;
        AddRecognitionBtn();
        Helper_CheckNewMessages();
        // setTimeout(AddRecognitionBtn, 1000);
      }
    }
  }).observe(document.body, {
    childList: true,
    subtree: true,
  });
  document.addEventListener('visibilitychange', () =>
    document.getElementsByTagName('textarea')[0]?.focus()
  );
  window.__helper = Helper_Words
  setTimeout(AddRecognitionBtn, 1000);
  setTimeout(Helper_CheckNewMessages, 1000);
  setTimeout(Get_app_conf,1000);
}
async function Get_app_conf(){
  chatConf = await invoke('get_app_conf') || {};
  if(chatConf == {}){
    setTimeout(Get_app_conf,1000);
  }else{
    invoke("fetch_data",{
      method: 'POST',
      url: SettingInitApi,
      body:JSON.stringify({
        processor:chatConf.processor,
        subprocess_number:chatConf.subprocess_number,
        iflytek_rec_appid:chatConf.iflytek_rec_appid,
        iflytek_rec_apikey: chatConf.iflytek_rec_apikey,
        iflytek_assess_appid: chatConf.iflytek_assess_appid,
        iflytek_assess_appsecret: chatConf.iflytek_assess_appsecret,
        iflytek_assess_apikey: chatConf.iflytek_assess_apikey,
        ss_assess_appkey: chatConf.ss_assess_appkey,
        ss_assess_secretkey: chatConf.ss_assess_secretkey,
      }),
    })
    .then(data => {
      console.log(data); 
    })
    .catch(error => {
      console.log('init : did not get data from tts server ->',error);
    });
  }
}
async function chatBtns() {
  // const chatConf = await invoke('get_app_conf') || {};
  const synth = window.speechSynthesis;
  let currentUtterance = null;
  let currentIndex = -1;
  const list = Array.from(document.querySelectorAll("main >div>div>div>div>div"));
  list.forEach((i, idx) => {
      if (i.querySelector('.chat-item-copy')) return;
      if (!i.querySelector('button.rounded-md')) return;
      if (!i.querySelector('.self-end')) return;
      const cpbtn = i.querySelector('button.rounded-md').cloneNode(true);
      cpbtn.classList.add('chat-item-copy');
      cpbtn.title = 'Copy to clipboard';
      cpbtn.innerHTML = setIcon('copy');
      i.querySelector('.self-end').appendChild(cpbtn);
      cpbtn.onclick = () => {
        copyToClipboard(i?.innerText?.trim() || '', cpbtn);
      }

      const saybtn = i.querySelector('button.rounded-md').cloneNode(true);
      saybtn.classList.add('chat-item-voice');
      saybtn.title = 'Say';
      saybtn.innerHTML = setIcon('voice');
      i.querySelector('.self-end').appendChild(saybtn);
      saybtn.onclick = () => {
        if (currentUtterance && currentIndex !== -1) {
          synth.cancel();
          if (idx === currentIndex) {
            saybtn.innerHTML = setIcon('voice');
            currentUtterance = null;
            currentIndex = -1;
            return;
          } else if (list[currentIndex].querySelector('.chat-item-voice')) {
            list[currentIndex].querySelector('.chat-item-voice').innerHTML = setIcon('voice');
            list[idx].querySelector('.chat-item-voice').innerHTML = setIcon('speaking');
          }
        }
        const txt = i?.innerText?.trim() || '';
        if (!txt) return;
        const utterance = new SpeechSynthesisUtterance(txt);
        const voices = speechSynthesis.getVoices();
        let voice = voices.find(voice => voice.voiceURI === chatConf.speech_lang);
        if (!voice) {
          voice = voices.find(voice => voice.lang === 'en-US');
        }
        utterance.voice = voice;
        currentIndex = idx;
        utterance.lang = voice.lang;
        // utterance.rate = 0.7;
        // utterance.pitch = 1.1;
        // utterance.volume = 1;
        synth.speak(utterance);
        amISpeaking = synth.speaking;
        saybtn.innerHTML = setIcon('speaking');
        currentUtterance = utterance;
        currentIndex = idx;
        utterance.onend = () => {
          saybtn.innerHTML = setIcon('voice');
          currentUtterance = null;
          currentIndex = -1;
        }
      }
      const rebtn = i.querySelector('button.rounded-md').cloneNode(true);
      rebtn.classList.add('chat-item-recoginition');
      rebtn.title = 'speech recognition';
      rebtn.innerHTML = setIcon('recognition');
      i.querySelector('.self-end').appendChild(rebtn);
      rebtn.onclick = () => {
        if(RecBtnClickCnt ===0 ){
          rebtn.innerHTML = setIcon('recognizing');
          SpeechRecognition(rebtn,Helper_Rec_Start_Action);
          RecBtnClickCnt =1;
        }else{
          SpeechRecognition(rebtn,Helper_Rec_Stop_Action);
          RecBtnClickCnt =0;
          rebtn.innerHTML = setIcon('recognition');
        }
      }
       // Skip speech button
      const skipbtn =  i.querySelector('button.rounded-md').cloneNode(true);
      skipbtn.classList.add('chat-item-skip');
      skipbtn.title = 'skip speech';
      skipbtn.innerHTML = setIcon('skip');
      i.querySelector('.self-end').appendChild(skipbtn);
      skipbtn.onclick = () => {
        skipbtn.innerHTML = setIcon('skipping');
        Skip_Speech();
        setTimeout((btn,cmd) => {btn.innerHTML = setIcon(cmd);},200,skipbtn,'skip');
      }
      // sppeech assessment button
      const assessbtn =  i.querySelector('button.rounded-md').cloneNode(true);
      assessbtn.classList.add('chat-item-assessment');
      assessbtn.title = 'speech assessment';
      assessbtn.innerHTML = setIcon('assess');
      i.querySelector('.self-end').appendChild(assessbtn);
      assessbtn.onclick = () => {
        assessbtn.innerHTML = setIcon('assessing');
        Speech_Assessment(assessbtn);
      }

    })
  // AddRecognitionBtn();
}

function AddRecognitionBtn(){
  // console.log("AddRecognitionBtn");
  // const input = document.querySelector("form>div>div");
  // // const input = document.querySelector('textarea').parentNode;
  // if (!input) return;
  // if (input.querySelector('.chat-item-recoginition')) return;
  // if (input.querySelector('.chat-item-skip')) return;
  // // if (!input.querySelector('button.rounded-md')) return;
  // // const button = input.querySelector('button.rounded-md');
  // if (!input.querySelector('button')) return;
  // const button = input.querySelector('button');
  // const rebtn = button.cloneNode(true);
  // rebtn.classList.add('chat-item-recognition');
  // rebtn.id = "recognition-button";
  // // rebtn.classList.remove('md:right-2', 'right-1');

  // rebtn.title = "speech recognition";
  // rebtn.innerHTML = setIcon('recognition');
  // input.appendChild(rebtn);
  // // input.insertBefore(rebtn, button);
  // const head = document.getElementsByTagName('head')[0];
  // const style = document.createElement('style');
  // style.innerHTML = '.rebtn-right-4 { right: 2.5rem; }  .rebtn-right-6 { right: 4.5rem; }';
  // head.appendChild(style);
  // // rebtn.classList.add('rebtn-right-4');
  // rebtn.disabled = false;
  // rebtn.onclick = () => {
  //   if(RecBtnClickCnt ===0 ){
  //     rebtn.innerHTML = setIcon('recognizing');
  //     SpeechRecognition(rebtn,Helper_Rec_Start_Action);
  //     RecBtnClickCnt =1;
  //   }else{
  //     SpeechRecognition(rebtn,Helper_Rec_Stop_Action);
  //     RecBtnClickCnt =0;
  //     rebtn.innerHTML = setIcon('recognition');
  //   }
  // }

  // // Skip speech button
  // // const skipbtn =  button.cloneNode(true);
  // const buttonPosition = button.getBoundingClientRect();

  // const skipbtn =  document.createElement("button");
  // skipbtn.style.position = 'absolute';
	// skipbtn.style.top = buttonPosition.top + 'px';
	// skipbtn.style.left = (buttonPosition.left - skipbtn.offsetWidth - 10) + 'px';
  // skipbtn.classList.add('chat-item-skip');
  // skipbtn.id = "skip-button";
  // // skipbtn.classList.add('chat-item-skip','rebtn-right-6');
  // // skipbtn.classList.remove('md:right-2', 'right-1');
  // // skipbtn.title = 'skip speech';
  // skipbtn.innerHTML = setIcon('skip');
  // // input.appendChild(skipbtn);
  // // input.insertBefore(skipbtn, rebtn);
  // skipbtn.disabled = false;
  // document.body.appendChild(skipbtn);
  // // console.log(skipbtn);
  // skipbtn.onclick = () => {
  //   skipbtn.innerHTML = setIcon('skipping');
  //   Skip_Speech();
  //   setTimeout((btn,cmd) => {btn.innerHTML = setIcon(cmd);},100,skipbtn,'skip');
  // }

}
async function Speech_Assessment(btn){
  // const chatConf = await invoke('get_app_conf') || {};
  var textarea = document.querySelector("textarea");
  var existingText = textarea.value;
  if(existingText.trim()!=''){
    invoke("fetch_data",{
      method: 'POST',
      url: SpeakAssessmentApi,
      body:JSON.stringify({
        text:existingText,
        type:chatConf.assess_type
      }),
    })
    .then(data => {
      console.log(data.message); 
      console.log(data.data);
      Helper_SendMessage("->"+data.data);
      if(btn) btn.innerHTML =setIcon('assess');
    })
    .catch(error => {
      if(btn) btn.innerHTML =setIcon('assess');
      console.log('Speech_Assessment : did not get data from tts server ->',error);
    });
  }else{
    if(btn) btn.innerHTML =setIcon('assess');
  }
  
}
function Skip_Speech(){
  Helper_Current_Message = null;
  // stop speaking
  invoke("fetch_data",{
		method: 'POST',
    url: SkipSpeechApi,
	})
  .then(data => {
    console.log(data.message); 
  })
	.catch(error => {
		console.log('Helper_NewMessageFlag : did not get data from tts server ->',error);
	});
}
async function SpeechRecognition(btn, action){
  // const chatConf = await invoke('get_app_conf') || {};
  
  console.log("btn:", btn);
  if (chatConf.rec_type == "web"){
    if (action == Helper_Rec_Start_Action){
      Web_Speech_Rec = ('webkitSpeechRecognition' in window) ? new webkitSpeechRecognition() : new SpeechRecognition();
      Web_Speech_Rec.continuous = true;
      Web_Speech_Rec.lang = chatConf.rec_lang;
      Web_Speech_Rec.start();
      Web_Speech_Rec.onstart = () =>{
        console.log("I'm listening");
      };
      Web_Speech_Rec.onend = () =>{
        console.log("I've stopped listening");
      };
      Web_Speech_Rec.onerror = () =>{
        console.log("Error while listening");
      };
      Web_Speech_Rec.onresult = (event) =>{
        var final_transcript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal)
            final_transcript += event.results[i][0].transcript;
        }
        console.log("You have said the following words: "+final_transcript);
        Helper_SendMessage(final_transcript);
      };
    } else if (action == Helper_Rec_Stop_Action){
      if (Web_Speech_Rec){
        Web_Speech_Rec.stop();
        Web_Speech_Rec = null;
      }
    }
    
  }else if (chatConf.rec_type == "iflytek"){
    if (action === Helper_Rec_Start_Action){
      invoke("fetch_data",{
        method: 'POST',
        url: SpeechRecognitionApi_Sart,
        body: JSON.stringify({
          lang: chatConf.rec_iflytek_lang
        }) 
      })
      .then(response => {
        console.log(response.message); 
      })
      .catch(error => {
        console.log('Helper_NewMessageFlag : did not get data from tts server ->',error);
      });
    }else if(action === Helper_Rec_Stop_Action){
      invoke("fetch_data",{
        method: 'POST',
        url: SpeechRecognitionApi_Stop,
      })
      .then(response => {
        console.log(response.message); 
        console.log("xunfei recognization result :",response.data);
        Helper_SendMessage(response.data);
      })
      .catch(error => {
        console.log('Helper_NewMessageFlag : did not get data from tts server ->',error);
      });
    }
  }
}
function Helper_SendMessage(text){
  // Put message in textarea
  var textarea = document.querySelector("textarea");
  if (!textarea) return;
  textarea.focus();
  // fix the send message can't be clicked due to recognition input without keybord input.
  textarea.parentNode.querySelector("button").disabled =false;
  var existingText = textarea.value;
  
  // Is there already existing text?
  if (!existingText) textarea.value = text;
  else textarea.value = existingText + " " + text;
  
  // Change height in case
  var fullText = existingText + " " + text;
  var rows = Math.ceil(fullText.length / 88);
  var height = rows * 24;
  textarea.style.height = height + "px";
  
}
// Check for new messages the ChatGPT bot has sent. 
// If a new message is found, it will be read out loud.
function Helper_CheckNewMessages(){
	// Any new messages?
  var messages = document.querySelectorAll('.text-base');
  var currentMessageCount = messages.length;
	if (currentMessageCount > Helper_Messages_Count) {
		// New message!
    console.log("new message!");
		Helper_Messages_Count = currentMessageCount;
    Helper_Current_Message = messages[currentMessageCount - 1];
    console.log("Helper_Current_Message:",Helper_Current_Message);
		Helper_Current_Message_Sentences = []; // Reset list of parts already spoken
		Helper_Current_Message_Sentences_Next_Read = 0;
    Helper_NewMessage_Ending_Enable = 1;
    Helper_NewMessage_Ending_Cnt = 0;
		Helper_NewMessageFlag();
	}

	// Split current message into parts
  var SendDelayCnt = 0;
	if (Helper_Current_Message) {
    // let textLength = CN_CURRENT_MESSAGE.textContent.trim().length;
		var currentText = Helper_Current_Message.textContent+"";
		var newSentences = Helper_SplitIntoSentences(currentText);
    if ((Helper_NewMessage_Ending_Enable === 1) && (currentText !='')) {
      Helper_NewMessage_Ending_Cnt +=1;
      console.log(currentText,Helper_NewMessage_Ending_Cnt)
    }
		if (newSentences != null && newSentences.length != Helper_Current_Message_Sentences.length) {
			// There is a new part of a sentence!
			var nextRead = Helper_Current_Message_Sentences_Next_Read;
			for (i = nextRead; i < newSentences.length; i++) {
				Helper_Current_Message_Sentences_Next_Read = i+1;

				var lastPart = newSentences[i];
        if ((chatConf!={}) && chatConf.talk_mode ===true){
          setTimeout(Helper_SayOutLoud,50*SendDelayCnt,lastPart);
        }
        SendDelayCnt +=1;
				// Helper_SayOutLoud(lastPart);
			}
			Helper_Current_Message_Sentences = newSentences;
      Helper_NewMessage_Ending_Cnt = 0;
      // Helper_TagNewWord(Helper_Current_Message.querySelectorAll('p'));
		}
	}
	setTimeout(Helper_CheckNewMessages, SendDelayCnt==0 ? 100:50*SendDelayCnt);
  if (Helper_NewMessage_Ending_Cnt>=600){
    // regard its the ending of new message
    Helper_NewMessage_Ending_Enable = 0;
    Helper_NewMessage_Ending_Cnt = 0;
    Helper_TagNewWord(Helper_Current_Message.querySelectorAll('p'));
  }
}
// highlight the the new word with custom color
function Helper_TagNewWord(elements){
  // const words = ['weird','strange']
  console.log(elements)
  if(elements && elements.length){
    console.log("come in ");
    for(let i=0; i<elements.length; i++){
      const pnode = elements[i];
      // const text = pnode.textContent;
      const text = (pnode.innerText!='')?pnode.innerText+'':pnode.textContent+'';
      New_Words.forEach(word =>{
        const index = text.indexOf(word);
        console.log(pnode,text);
        // If the word is found, wrap it in a span with a CSS class to highlight it
        if (index !== -1) {
          for(let j=0; j<pnode.childNodes.length;j++){
            const node = pnode.childNodes[i];
            if (node.nodeType === Node.TEXT_NODE) {

              const text = node.textContent;
              const index = text.indexOf(word);
              // If the word is found, wrap it in a span with a CSS class to highlight it
              if (index !== -1) {
                const span = document.createElement('span');
                span.className = 'highlight';
                const highlightedText = document.createTextNode(text.substr(index, word.length));
                span.appendChild(highlightedText);
                const unhighlightedText = document.createTextNode(text.substr(index + word.length));
                node.textContent = text.substr(0, index);
                node.parentNode.insertBefore(span, node.nextSibling);
                node.parentNode.insertBefore(unhighlightedText, span.nextSibling);
              }
            }
          }
        }
      })
      
    }
  }
}

// tell tts server there is a new message
function Helper_NewMessageFlag() {
	invoke("fetch_data",{
		method: 'POST',
    url: NewMessageFlagApi,
	})
  .then(data => {
    console.log(data.message); 
  })
	.catch(error => {
		console.log('Helper_NewMessageFlag : did not get data from tts server ->',error);
	});
}

async function Helper_SayOutLoud(text){
  // const chatConf = await invoke('get_app_conf') || {};
  var speaker = chatConf.speech_ai_lang;
  if (speaker.includes("-")) {
    speaker = speaker.split("-")[0];
  }
  invoke('fetch_data', { 
    method: 'POST',
    url: SpeakOutApi,
    body: JSON.stringify({
      text:text,
      speaker:speaker,
    }) 
  })
  .then(response => {
    console.log(response.message); 
	})
	.catch(error => {
		console.error('did not get data from tts server !',error);
	});

}
function Helper_Words(cmd){
  const selectedText = window.getSelection().toString().trim();
  const isEnglishWord = /^[a-zA-Z]+$/.test(selectedText);
  const indexToRemove = New_Words.indexOf(selectedText);
  if(cmd === "add"){
    
    if (isEnglishWord){
      if (indexToRemove !== -1) {
        console.log("${selectedText} already in !");
      }else{
        New_Words.push(selectedText);
        console.log("add ${selectedText} to new words!");
      }
     
    }else{
      console.log("${selectedText} is now a english word! add failed");
    }
  }else if(cmd === "remove"){
    if (isEnglishWord){
      if (indexToRemove !== -1) {
        New_Words.splice(indexToRemove, 1);
      }
      console.log("remove ${selectedText} from new words sucessfully!");
    }else{
      console.log("${selectedText} is now a english word! remove failed");
    }
  }
}
// Split the text into sentences so the speech synthesis can start speaking as soon as possible
function Helper_SplitIntoSentences(text) {
	var sentences = [];
	var currentSentence = "";
	
	for(var i=0; i<text.length; i++) {
		//
		var currentChar = text[i];
		
		// Add character to current sentence
		currentSentence += currentChar;
		
		// is the current character a delimiter? if so, add current part to array and clear
		if (
			// Latin punctuation
		       currentChar == ',' 
			|| currentChar == ':' 
			|| currentChar == '.' 
			|| currentChar == '!' 
			|| currentChar == '?' 
			|| currentChar == ';'
			|| currentChar == '…'
			// Chinese/japanese punctuation
			|| currentChar == '、' 
			|| currentChar == '，'
			|| currentChar == '。'
			|| currentChar == '．'
			|| currentChar == '！'
			|| currentChar == '？'
			|| currentChar == '；'
			|| currentChar == '：'
			) {
			if (currentSentence.trim() != "") sentences.push(currentSentence.trim());
			currentSentence = "";
		}
	}
	return sentences;
}

function copyToClipboard(text, btn) {
  window.clearTimeout(window.__cpTimeout);
  btn.innerHTML = setIcon('cpok');
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text);
  } else {
    var textarea = document.createElement('textarea');
    document.body.appendChild(textarea);
    textarea.style.position = 'fixed';
    textarea.style.clip = 'rect(0 0 0 0)';
    textarea.style.top = '10px';
    textarea.value = text;
    textarea.select();
    document.execCommand('copy', true);
    document.body.removeChild(textarea);
  }
  window.__cpTimeout = setTimeout(() => {
    btn.innerHTML = setIcon('copy');
  }, 1000);
}

function focusOnInput() {
  // This currently works because there is only a single `<textarea>` element on the ChatGPT UI page.
  document.getElementsByTagName("textarea")[0].focus();
}

function setIcon(type) {
  return {
    copy: `<svg class="chatappico copy" stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>`,
    cpok: `<svg class="chatappico cpok" viewBox="0 0 24 24"><g fill="none" stroke="#10a37f" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M16 4h2a2 2 0 0 1 2 2v4m1 4H11"/><path d="m15 10l-4 4l4 4"/></g></svg>`,
    voice: `<svg class="chatappico voice" viewBox="0 0 1024 1024"><path d="M542.923802 202.113207c-5.110391 0-10.717086 1.186012-16.572444 3.739161L360.043634 312.714188l-83.057671 0c-46.109154 0-83.433224 36.917818-83.433224 83.121116l0 166.646438c0 45.952588 36.950564 83.153862 83.433224 83.153862l83.057671 0 166.307723 106.829074c23.550369 10.218736 41.745776-0.717338 41.745776-23.898293L568.097134 229.687216C568.096111 212.426087 557.753555 202.113207 542.923802 202.113207z" fill="currentColor"></path><path d="M794.154683 314.39548c-16.758686-28.537963-33.771151-48.258097-45.610804-58.882062-3.986801-3.489474-8.972349-5.233188-13.833053-5.233188-5.79396 0-11.464099 2.337231-15.57779 6.91448-7.662517 8.631588-6.976902 21.808702 1.620917 29.410843 1.994424 1.744737 5.856381 5.700839 11.154038 11.777231 9.033747 10.437723 18.006096 22.774703 26.419719 37.072337 24.235984 41.033555 38.755676 89.011266 38.755676 143.688563 0 54.705949-14.519692 102.651938-38.755676 143.810337-8.414647 14.20656-17.448394 26.668383-26.484188 37.07336-5.234211 6.076392-9.096169 10.033517-11.149944 11.778254-8.538467 7.603165-9.224082 20.717857-1.683339 29.40982 7.599072 8.473999 20.807908 9.222035 29.40982 1.650593 11.900028-10.562567 28.910447-30.252001 45.732577-58.850339 27.79095-47.078225 44.490284-102.3122 44.490284-164.872025C838.708412 416.646282 821.946656 361.470635 794.154683 314.39548z" fill="currentColor"></path><path d="M690.846806 377.360534c-8.723685-17.790178-17.698081-30.2827-24.301476-37.260625-4.111644-4.3951-9.595542-6.544043-15.139815-6.544043-5.110391 0-10.159384 1.774413-14.270005 5.54632-8.350179 7.881504-8.847505 20.99722-0.997724 29.471219 3.927449 4.112668 10.468422 13.304004 17.448394 27.199479 11.587919 23.77038 18.567891 51.559283 18.567891 83.370803 0 31.80845-6.978948 59.72322-18.567891 83.400478-6.978948 13.892405-13.520945 23.052019-17.448394 27.259854-7.850805 8.410554-7.353478 21.559015 0.997724 29.440519 8.473999 7.882528 21.559015 7.353478 29.474288-1.025353 6.53995-7.011694 15.513322-19.440771 24.238031-37.356816 14.393825-29.189809 22.992667-63.243393 22.992667-101.781104C713.839473 440.603927 705.241654 406.583089 690.846806 377.360534z" fill="currentColor"></path></svg>`,
    speaking: `<svg class="chatappico voice" viewBox="0 0 1024 1024"><path d="M542.923802 202.113207c-5.110391 0-10.717086 1.186012-16.572444 3.739161L360.043634 312.714188l-83.057671 0c-46.109154 0-83.433224 36.917818-83.433224 83.121116l0 166.646438c0 45.952588 36.950564 83.153862 83.433224 83.153862l83.057671 0 166.307723 106.829074c23.550369 10.218736 41.745776-0.717338 41.745776-23.898293L568.097134 229.687216C568.096111 212.426087 557.753555 202.113207 542.923802 202.113207z" fill="#10a37f"></path><path d="M794.154683 314.39548c-16.758686-28.537963-33.771151-48.258097-45.610804-58.882062-3.986801-3.489474-8.972349-5.233188-13.833053-5.233188-5.79396 0-11.464099 2.337231-15.57779 6.91448-7.662517 8.631588-6.976902 21.808702 1.620917 29.410843 1.994424 1.744737 5.856381 5.700839 11.154038 11.777231 9.033747 10.437723 18.006096 22.774703 26.419719 37.072337 24.235984 41.033555 38.755676 89.011266 38.755676 143.688563 0 54.705949-14.519692 102.651938-38.755676 143.810337-8.414647 14.20656-17.448394 26.668383-26.484188 37.07336-5.234211 6.076392-9.096169 10.033517-11.149944 11.778254-8.538467 7.603165-9.224082 20.717857-1.683339 29.40982 7.599072 8.473999 20.807908 9.222035 29.40982 1.650593 11.900028-10.562567 28.910447-30.252001 45.732577-58.850339 27.79095-47.078225 44.490284-102.3122 44.490284-164.872025C838.708412 416.646282 821.946656 361.470635 794.154683 314.39548z" fill="#10a37f"></path><path d="M690.846806 377.360534c-8.723685-17.790178-17.698081-30.2827-24.301476-37.260625-4.111644-4.3951-9.595542-6.544043-15.139815-6.544043-5.110391 0-10.159384 1.774413-14.270005 5.54632-8.350179 7.881504-8.847505 20.99722-0.997724 29.471219 3.927449 4.112668 10.468422 13.304004 17.448394 27.199479 11.587919 23.77038 18.567891 51.559283 18.567891 83.370803 0 31.80845-6.978948 59.72322-18.567891 83.400478-6.978948 13.892405-13.520945 23.052019-17.448394 27.259854-7.850805 8.410554-7.353478 21.559015 0.997724 29.440519 8.473999 7.882528 21.559015 7.353478 29.474288-1.025353 6.53995-7.011694 15.513322-19.440771 24.238031-37.356816 14.393825-29.189809 22.992667-63.243393 22.992667-101.781104C713.839473 440.603927 705.241654 406.583089 690.846806 377.360534z" fill="#10a37f"></path></svg>`,
    recognition:'<svg class="speech recognition" width="20px" height="16px" viewBox="0 0 24 24"  xmlns="http://www.w3.org/2000/svg"><path d="M12 14.2857C13.4229 14.2857 14.5714 13.1371 14.5714 11.7143V6.57143C14.5714 5.14857 13.4229 4 12 4C10.5771 4 9.42857 5.14857 9.42857 6.57143V11.7143C9.42857 13.1371 10.5771 14.2857 12 14.2857Z" fill="currentColor"/><path d="M16.5429 11.7143H18C18 14.6371 15.6686 17.0543 12.8571 17.4743V20.2857H11.1429V17.4743C8.33143 17.0543 6 14.6371 6 11.7143H7.45714C7.45714 14.2857 9.63429 16.0857 12 16.0857C14.3657 16.0857 16.5429 14.2857 16.5429 11.7143Z" fill="currentColor"/></svg>',
    recognizing:'<svg class="speech recognition" width="20px" height="16px" viewBox="0 0 24 24"  xmlns="http://www.w3.org/2000/svg"><path d="M12 14.2857C13.4229 14.2857 14.5714 13.1371 14.5714 11.7143V6.57143C14.5714 5.14857 13.4229 4 12 4C10.5771 4 9.42857 5.14857 9.42857 6.57143V11.7143C9.42857 13.1371 10.5771 14.2857 12 14.2857Z" fill="#10a37f"/><path d="M16.5429 11.7143H18C18 14.6371 15.6686 17.0543 12.8571 17.4743V20.2857H11.1429V17.4743C8.33143 17.0543 6 14.6371 6 11.7143H7.45714C7.45714 14.2857 9.63429 16.0857 12 16.0857C14.3657 16.0857 16.5429 14.2857 16.5429 11.7143Z" fill="#10a37f"/></svg>',
    skip:'<svg class="speech skip" width="20px" height="16px" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><g id="Media / Skip_Forward"><path id="Vector" d="M17 5V19M6 10.5713V13.4287C6 15.2557 6 16.1693 6.38355 16.6958C6.71806 17.1549 7.23174 17.4496 7.79688 17.5073C8.44484 17.5733 9.23434 17.113 10.8125 16.1924L13.2617 14.7637L13.2701 14.7588C14.8216 13.8537 15.5979 13.4009 15.8595 12.8105C16.0881 12.2946 16.0881 11.7062 15.8595 11.1902C15.5974 10.5988 14.8188 10.1446 13.2617 9.2363L10.8125 7.80762C9.23434 6.88702 8.44484 6.42651 7.79688 6.49256C7.23174 6.55017 6.71806 6.84556 6.38355 7.30469C6 7.83111 6 8.74424 6 10.5713Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></g></svg>',
    skipping:'<svg class="speech skip" width="20px" height="16px" viewBox="0 0 24 24"  xmlns="http://www.w3.org/2000/svg"><g fill="#10a37f" id="Media / Skip_Forward"><path id="Vector" d="M17 5V19M6 10.5713V13.4287C6 15.2557 6 16.1693 6.38355 16.6958C6.71806 17.1549 7.23174 17.4496 7.79688 17.5073C8.44484 17.5733 9.23434 17.113 10.8125 16.1924L13.2617 14.7637L13.2701 14.7588C14.8216 13.8537 15.5979 13.4009 15.8595 12.8105C16.0881 12.2946 16.0881 11.7062 15.8595 11.1902C15.5974 10.5988 14.8188 10.1446 13.2617 9.2363L10.8125 7.80762C9.23434 6.88702 8.44484 6.42651 7.79688 6.49256C7.23174 6.55017 6.71806 6.84556 6.38355 7.30469C6 7.83111 6 8.74424 6 10.5713Z" stroke="#10a37f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></g></svg>',
    assess:'<svg width="20px" height="16px" viewBox="0 0 1024 1024" class="icon"  version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M905.92 237.76a32 32 0 0 0-52.48 36.48A416 416 0 1 1 96 512a418.56 418.56 0 0 1 297.28-398.72 32 32 0 1 0-18.24-61.44A480 480 0 1 0 992 512a477.12 477.12 0 0 0-86.08-274.24z" fill="currentColor" /><path d="M630.72 113.28A413.76 413.76 0 0 1 768 185.28a32 32 0 0 0 39.68-50.24 476.8 476.8 0 0 0-160-83.2 32 32 0 0 0-18.24 61.44zM489.28 86.72a36.8 36.8 0 0 0 10.56 6.72 30.08 30.08 0 0 0 24.32 0 37.12 37.12 0 0 0 10.56-6.72A32 32 0 0 0 544 64a33.6 33.6 0 0 0-9.28-22.72A32 32 0 0 0 505.6 32a20.8 20.8 0 0 0-5.76 1.92 23.68 23.68 0 0 0-5.76 2.88l-4.8 3.84a32 32 0 0 0-6.72 10.56A32 32 0 0 0 480 64a32 32 0 0 0 2.56 12.16 37.12 37.12 0 0 0 6.72 10.56zM355.84 313.6a36.8 36.8 0 0 0-13.12 18.56l-107.52 312.96a37.44 37.44 0 0 0 2.56 35.52 32 32 0 0 0 24.96 10.56 27.84 27.84 0 0 0 17.28-5.76 43.84 43.84 0 0 0 10.56-13.44 100.16 100.16 0 0 0 7.04-15.36l4.8-12.8 17.6-49.92h118.72l24.96 69.76a45.76 45.76 0 0 0 10.88 19.2 28.8 28.8 0 0 0 20.48 8.32h2.24a27.52 27.52 0 0 0 27.84-15.68 41.28 41.28 0 0 0 0-29.44l-107.84-313.6a36.8 36.8 0 0 0-13.44-19.2 44.16 44.16 0 0 0-48 0.32z m24.32 96l41.6 125.44h-83.2zM594.88 544a66.56 66.56 0 0 0 25.6 4.16h62.4v78.72a29.12 29.12 0 0 0 32 32 26.24 26.24 0 0 0 27.2-16.32 73.28 73.28 0 0 0 4.16-26.24v-66.88h73.6a27.84 27.84 0 0 0 29.44-32 26.56 26.56 0 0 0-16-27.2 64 64 0 0 0-23.04-4.16h-64v-75.84a28.16 28.16 0 0 0-32-30.08 26.56 26.56 0 0 0-27.2 15.68 64 64 0 0 0-4.16 24v66.88h-62.72a69.44 69.44 0 0 0-25.6 4.16 26.56 26.56 0 0 0-15.68 27.2 25.92 25.92 0 0 0 16 25.92z" fill="currentColor" /></svg>',
    assessing:'<svg width="20px" height="16px" viewBox="0 0 1024 1024" class="icon"  version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M905.92 237.76a32 32 0 0 0-52.48 36.48A416 416 0 1 1 96 512a418.56 418.56 0 0 1 297.28-398.72 32 32 0 1 0-18.24-61.44A480 480 0 1 0 992 512a477.12 477.12 0 0 0-86.08-274.24z" fill="#10a37f" /><path d="M630.72 113.28A413.76 413.76 0 0 1 768 185.28a32 32 0 0 0 39.68-50.24 476.8 476.8 0 0 0-160-83.2 32 32 0 0 0-18.24 61.44zM489.28 86.72a36.8 36.8 0 0 0 10.56 6.72 30.08 30.08 0 0 0 24.32 0 37.12 37.12 0 0 0 10.56-6.72A32 32 0 0 0 544 64a33.6 33.6 0 0 0-9.28-22.72A32 32 0 0 0 505.6 32a20.8 20.8 0 0 0-5.76 1.92 23.68 23.68 0 0 0-5.76 2.88l-4.8 3.84a32 32 0 0 0-6.72 10.56A32 32 0 0 0 480 64a32 32 0 0 0 2.56 12.16 37.12 37.12 0 0 0 6.72 10.56zM355.84 313.6a36.8 36.8 0 0 0-13.12 18.56l-107.52 312.96a37.44 37.44 0 0 0 2.56 35.52 32 32 0 0 0 24.96 10.56 27.84 27.84 0 0 0 17.28-5.76 43.84 43.84 0 0 0 10.56-13.44 100.16 100.16 0 0 0 7.04-15.36l4.8-12.8 17.6-49.92h118.72l24.96 69.76a45.76 45.76 0 0 0 10.88 19.2 28.8 28.8 0 0 0 20.48 8.32h2.24a27.52 27.52 0 0 0 27.84-15.68 41.28 41.28 0 0 0 0-29.44l-107.84-313.6a36.8 36.8 0 0 0-13.44-19.2 44.16 44.16 0 0 0-48 0.32z m24.32 96l41.6 125.44h-83.2zM594.88 544a66.56 66.56 0 0 0 25.6 4.16h62.4v78.72a29.12 29.12 0 0 0 32 32 26.24 26.24 0 0 0 27.2-16.32 73.28 73.28 0 0 0 4.16-26.24v-66.88h73.6a27.84 27.84 0 0 0 29.44-32 26.56 26.56 0 0 0-16-27.2 64 64 0 0 0-23.04-4.16h-64v-75.84a28.16 28.16 0 0 0-32-30.08 26.56 26.56 0 0 0-27.2 15.68 64 64 0 0 0-4.16 24v66.88h-62.72a69.44 69.44 0 0 0-25.6 4.16 26.56 26.56 0 0 0-15.68 27.2 25.92 25.92 0 0 0 16 25.92z" fill="#10a37f" /></svg>',
  }[type];
}

if (
  document.readyState === "complete" ||
  document.readyState === "interactive"
) {
  init();
} else {
  document.addEventListener("DOMContentLoaded", init);
}