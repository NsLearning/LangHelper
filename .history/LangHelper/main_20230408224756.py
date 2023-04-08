# -*- encoding:utf-8 -*-
import Assess.SpeechSuper,Assess.IflytekAssessment
import Recognition.IflytekRec
import recoder
import os, json, datetime, time, threading, random, wave, asyncio
import simpleaudio as sa
from TTS.api import TTS
from multiprocessing import Pool
from pydub import AudioSegment
from http.server import BaseHTTPRequestHandler, HTTPServer
from socket import *

subprocess_number = 3
iflytek_rec_appid = ''
iflytek_rec_apikey = ''
iflytek_assess_appid = ''
iflytek_assess_appsecret = ''
iflytek_assess_apikey = ''
ss_assess_appkey = ''
ss_assess_secretkey = ''
complete_init = False

playlist = list()
pendinglist =list()
processlist = list()
TtlSpeaking = False
SkipSpeaking = False
RecWorking  = False
SttText = ""
presentation_voice = {
    "English":[],
    "Indian":[],
    "Irish":[],
    "Scottish":[],
    'American':[],
    'Canadian':[],
    'Australian':[],
    'NorthernIrish':[],
    'NewZealand':[],
    'Welsh':[],
    'SouthAfrican':[],
} 
presentation_sort =["Irish","Indian","Scottish","American","English"]
region_cnt = -1
seaker_cnt = 0

Specify_Speaker = None
Specify_One_message = 0

def Reed_MultiSpeaker(path):
    global presentation_voice
    with open(path, "r") as f:
        lines = f.readlines()
        for i,line in enumerate(lines):
            if i ==0:continue
            if line.strip():
                line = line.strip().split()
                if (len(line) >=4):
                    if presentation_voice.get(line[3]) is not None:
                        presentation_voice[line[3]].append(line[0])
    # print(presentation_voice)

def TextIsSuitable(text):
    cnt = 0
    for i in text:
        if (i.isalpha() or i.isdigit()):
            cnt +=1
    # only have punctuations
    if cnt == 0:
        text = ''
    if text !='' and text[-1].isalpha(): 
            text = text + '.'
    return text

def play_audio(path) :
    wave_obj = sa.WaveObject.from_wave_file(path)
    play_obj = wave_obj.play()
    play_obj.wait_done() 

def generate_voice(text:str, path:str,speaker:str):
    global seaker_cnt,presentation_sort,region_cnt,presentation_voice
    if text.strip() == '': 
        print("invalid text to generate sound.")
    try:
        if speaker == 'ljspeech':
            model_name = TTS.list_models()[7]
            tts = TTS(model_name)
            speaker = None
        # elif ((speaker == "Downey") or (speaker == "Obama")):
        #     tts = TTS(
        #             model_path =os.path.join("",""),
        #             config_path=os.path.join("","")
        #             )
        #     speaker = "VCTK_" + speaker
        else:
            tts = TTS(
                model_path ="./Resource/tts_models--en--vctk--vits/model_file.pth",
                config_path="./Resource/tts_models--en--vctk--vits/config.json",
            )
            #special modes: region_per_passage,accent_per_sentence
            if speaker == 'accent_per_sentence':
                speaker = tts.speakers[ random.randint(0, 109)]
            else:
                speaker = speaker
        print(text,speaker)
        tts.tts_to_file(text=text,speaker=speaker,file_path=path)
    except:
        print("something wrong when generate audio!!!")
    # playlist.append(path)

def serve_forever(server):
    server.serve_forever()

def is_audio_ready(file_path):
    try:
        audio = AudioSegment.from_file(file_path)
        return True
    except Exception as e:
        return False

class RequestHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200, "ok")
        self.send_header('Access-Control-Allow-Credentials', 'true')
        self.send_header('Access-Control-Allow-Origin', 'https://chat.openai.com')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header("Access-Control-Allow-Headers", "X-Requested-With, Content-type")
        self.send_header("Access-Control-Max-Age","86400")
    
    def do_POST(self):
        global playlist,pendinglist,SkipSpeaking,RecWorking,recorder,SttText,client,region_cnt,seaker_cnt,Specify_One_message,Specify_Speaker
        global subprocess_number,iflytek_rec_appid,iflytek_rec_apikey,iflytek_assess_appid,iflytek_assess_appsecret,iflytek_assess_apikey,ss_assess_appkey,ss_assess_secretkey
        global complete_init
        if self.path == "/init":
            content_length = int(self.headers['Content-Length'])
            body = self.rfile.read(content_length)
            data = json.loads(body.decode('utf-8'))
            subprocess_number = int(data['subprocess_number'])
            
            iflytek_rec_appid = data['iflytek_rec_appid']
            iflytek_rec_apikey = data['iflytek_rec_apikey']
            if client: 
                client.app_id = data['iflytek_rec_appid']
                client.api_key= data['iflytek_rec_apikey']

            iflytek_assess_appid = data['iflytek_assess_appid']
            iflytek_assess_appsecret = data['iflytek_assess_appsecret']
            iflytek_assess_apikey = data['iflytek_assess_apikey']
            if assess:
                assess.APPID = data['iflytek_assess_appid']
                assess.APISecret = data['iflytek_assess_appsecret']
                assess.APIKey = data['iflytek_assess_apikey']

            ss_assess_appkey = data['ss_assess_appkey']
            ss_assess_secretkey = data['ss_assess_secretkey']
            if assess2:
                assess2.appKey = data['ss_assess_appkey']
                assess2.secretKey = data['ss_assess_secretkey']

            response = {'message': 'setting init sucessfully',"data":""}
            complete_init = True
        elif self.path == "/play":
            content_length = int(self.headers['Content-Length'])
            body = self.rfile.read(content_length)
            data = json.loads(body.decode('utf-8'))
            text = data['text']
            speaker = data['speaker']
            response = {'message': 'ChatGPT said: '+text,"data":""}
            text = TextIsSuitable(text)

            now = datetime.datetime.now()
            time_str = now.strftime("%H_%M_%S_%f")
            file_path = "./Resource/read/"+ time_str +".wav"

            if (len(playlist)) <=15 and (text.strip() != ''):
                playlist.append([text,file_path,speaker])
            
        elif self.path == "/Skip":
            print("Skip command received")
            SkipSpeaking = True
            response = {'message': 'Skip command received !',"data":""}
            
        elif self.path == "/Rec/Start":
            print("Record start command received ")
            content_length = int(self.headers['Content-Length'])
            body = self.rfile.read(content_length)
            data = json.loads(body.decode('utf-8'))
            lang = data['lang']
            client.set_language(lang)
            SttText = ""
            RecWorking = True
            # recorder.start()
            response = {'message': 'Record start command received !',"data":""}
        elif self.path == "/Rec/Stop":
            # click Start button firstly!!!
            if RecWorking != True:
                response = {'message': 'click Start button firstly!!! or prior stop command has not been finished'}
            else:
                print("Record stop command received")
                RecWorking = False
                while not client.get_finish_state():
                    pass
                # recorder.stop()
                result = client.result
                # iron = result.find('钢铁侠') 
                # obama = result.lower().find('obama')
                # if (iron !=-1) and (result.lower().find('please')!=-1):
                #     result = result[:iron]
                #     Specify_Speaker = "Downey"
                #     Specify_One_message =0 
                # elif (obama !=-1) and (result.lower().find('please')!=-1):
                #     result = result[:obama]
                #     Specify_Speaker = "Obama"
                #     Specify_One_message = 0
                # else:
                #     result = result
                #     Specify_Speaker = None
                response = {'message': 'Record stop command received !',"data":result}
        elif self.path == '/NewMessage':
            SkipSpeaking = False
            pendinglist = []
            playlist = []
            region_cnt = 0 if region_cnt== (len(presentation_sort)-1) else (region_cnt+1)
            seaker_cnt = 0
            # if Specify_Speaker != None:
            #     Specify_One_message +=1
            #     if Specify_One_message ==1:
            #         pass
            #     else:
            #         Specify_Speaker =  None
            #         Specify_One_message = 0
            print("neregion_cnt:",region_cnt,seaker_cnt)
            response = {'message': 'Prepared to play new meaasge',"data":""}
        elif self.path == '/assess':
            content_length = int(self.headers['Content-Length'])
            body = self.rfile.read(content_length)
            data = json.loads(body.decode('utf-8'))
            text = data['text']
            type = data.get('type')
            print("assess speech text:",text)
            scores = "you didn't set up the api key !"
            if type == 'iflytek':
                if assess.APPID != '' and  assess.APIKey !='' and assess.APISecret !='':
                    assess.start_connection(text)
                    while not assess.get_finish_state():
                        pass
                    scores = "accuracy_score: "+assess.scores['accuracy_score']+"fluency_score:"+ assess.scores['fluency_score'] +" standard_score:" +assess.scores['standard_score']+ " total_score: " +assess.scores['total_score']
            else:
                if assess2.appKey != '' and assess2.secretKey !='':
                    asyncio.run(assess2.main_logic(text))
                    for key,value in assess2.scores.items():
                        scores += key + ":"+str(value) +" "
            response = {'message': 'Prepared to request assessment',"data":scores}

        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', 'https://chat.openai.com')
        self.send_header('Access-Control-Allow-Credentials', 'true')
        self.end_headers()
        self.wfile.write(json.dumps(response).encode('utf-8'))


def RealTimeStt(file_path):
    global RecWorking,recorder,client
    last_state = RecWorking
    start_flag = False
    end_flag = False
    
    while True:
        if start_flag and client.check_connection():
            chunk = next(recorder.read_audio())
            recorder.chunks.append(chunk)
            client.send(file_path, chunk)

        if last_state != RecWorking:
            if RecWorking and (last_state ==False):
                recorder.start()
                if client.api_key !='' and client.app_id !='':
                    client.start_connection()
                end_flag = False
                start_flag = True
            if not RecWorking and (last_state ==True):
                recorder.stop()
                time.sleep(5)
                client.close()
                end_flag = True
                start_flag = False
            last_state = RecWorking

if __name__ == '__main__':
    
    Reed_MultiSpeaker("./Resource/speaker-info.txt")
    server = HTTPServer(('localhost', 6868), RequestHandler)
    server_thread = threading.Thread(target=serve_forever, args=[server])
    server_thread.start()
    print('Server started.')
    client =None
    assess =None
    assess2 =None
    while (not complete_init):
          pass
    print("Complete init -> start conversation")
    pool = Pool(subprocess_number)
    file_path = r"./Resource/rec/realtime.pcm"
    goalfile = r"./Resource/rec/realtime.wav"
    recorder = recoder.VoiceRecorder("./Resource/rec")
    client = Recognition.IflytekRec.Recognition(app_id=iflytek_rec_appid,api_key=iflytek_rec_apikey)
    assess = Assess.IflytekAssessment.Assessment(APPID=iflytek_assess_appid, APISecret=iflytek_assess_appsecret,
                       APIKey=iflytek_assess_apikey,
                       AudioFile=file_path)
    assess2 = Assess.SpeechSuper.SpeechSuper(
        appKey = ss_assess_appkey,
        secretKey = ss_assess_secretkey,
        audioPath = goalfile,
        audioType = "wav",
        audioSampleRate = 16000,
    )

    Stt_thread = threading.Thread(target=RealTimeStt, args=(file_path,))
    Stt_thread.start()

    while(1):
        if not RecWorking:
            if SkipSpeaking == False:
                if len(playlist):
                    #special modes: region_per_passage,accent_per_sentence
                    if playlist[0][2] == "region_per_passage":
                        seaker_cnt = 0 if seaker_cnt == (len(presentation_voice[presentation_sort[region_cnt]])-1) else (seaker_cnt+1)
                        playlist[0][2] = presentation_voice[presentation_sort[region_cnt]][seaker_cnt]
                    # if Specify_Speaker != None:
                    #     playlist[0][2] = Specify_Speaker
                    pool.apply_async(func = generate_voice, args=(playlist[0][0],playlist[0][1],playlist[0][2]))
                    pendinglist.append(playlist[0][1])
                    playlist.pop(0)

                if len(pendinglist) and os.path.exists(pendinglist[0]):

                        if is_audio_ready(pendinglist[0]):
                            play_audio(pendinglist[0])
                            os.remove(pendinglist[0])
                            pendinglist.pop(0)
                        else:
                            print("I am waiting to plcaback!")
            else:   
                # to do : stop play_audio instantly
                playlist = []
                pendinglist = []
    pool.close()
    pool.join()