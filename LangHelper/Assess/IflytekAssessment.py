# -*- coding:utf-8 -*-

from builtins import Exception, str, bytes

import websocket
import datetime
import hashlib
import base64
import hmac
import json
from urllib.parse import urlencode
import time
import ssl
from wsgiref.handlers import format_date_time
from datetime import datetime
from time import mktime
import _thread as thread
import os

STATUS_FIRST_FRAME = 0  # 第一帧的标识
STATUS_CONTINUE_FRAME = 1  # 中间帧标识
STATUS_LAST_FRAME = 2  # 最后一帧的标识

class Ws_Param(object):
    # 初始化
    def __init__(
                self, 
                APPID: str, 
                APIKey: str, 
                APISecret: str, 
                AudioFile: str, 
                Text:str,
                SUB:str = "ise",
                ENT: str= "en_vip",# en_vip ,cn_vip
                CATEGORY: str ="read_sentence",
        ):
        self.APPID = APPID
        self.APIKey = APIKey
        self.APISecret = APISecret
        self.AudioFile = AudioFile
        self.Text = Text
        self.SUB = SUB
        self.ENT = ENT
        self.CATEGORY = CATEGORY

        # 公共参数(common)
        self.CommonArgs = {"app_id": self.APPID}
        # 业务参数(business)，更多个性化参数可在官网查看
        self.BusinessArgs = {"category": self.CATEGORY, "sub": self.SUB, "ent": self.ENT, "cmd": "ssb", "auf": "audio/L16;rate=16000",
                             "aue": "raw", "text": self.Text, "ttp_skip": True, "aus": 1}

    # 生成url
    def create_url(self):
        # wws请求对Python版本有要求，py3.7可以正常访问，如果py版本请求wss不通，可以换成ws请求，或者更换py版本
        url = 'ws://ise-api.xfyun.cn/v2/open-ise'
        # 生成RFC1123格式的时间戳
        now = datetime.now()
        date = format_date_time(mktime(now.timetuple()))

        # 拼接字符串
        signature_origin = "host: " + "ise-api.xfyun.cn" + "\n"
        signature_origin += "date: " + date + "\n"
        signature_origin += "GET " + "/v2/open-ise " + "HTTP/1.1"
        # 进行hmac-sha256进行加密
        signature_sha = hmac.new(self.APISecret.encode('utf-8'), signature_origin.encode('utf-8'),
                                 digestmod=hashlib.sha256).digest()
        signature_sha = base64.b64encode(signature_sha).decode(encoding='utf-8')

        authorization_origin = "api_key=\"%s\", algorithm=\"%s\", headers=\"%s\", signature=\"%s\"" % (
            self.APIKey, "hmac-sha256", "host date request-line", signature_sha)
        authorization = base64.b64encode(authorization_origin.encode('utf-8')).decode(encoding='utf-8')
        # 将请求的鉴权参数组合为字典
        v = {
            "authorization": authorization,
            "date": date,
            "host": "ise-api.xfyun.cn"
        }
        # 拼接鉴权参数，生成url
        url = url + '?' + urlencode(v)

        # 此处打印出建立连接时候的url,参考本demo的时候，比对相同参数时生成的url与自己代码生成的url是否一致
        print("date: ", date)
        print("v: ", v)
        print('websocket url :', url)
        return url

class Assessment:
    def __init__(self,APPID,APISecret,APIKey,AudioFile):
        self.APPID = APPID
        self.APIKey = APIKey
        self.APISecret = APISecret
        self.AudioFile = AudioFile
        self.Text = ""

        self.wsParam =None
        self.ws = None
        self.wsUrl =None 
        self.finished = False
        self.scores ={
            "fluency_score":None,
            "standard_score":None,
            "accuracy_score":None,
            "total_score":None,
        }
        self.fluency_score = 5
        self.standard_score = 5
        self.total_score = 5 
        self.accuracy_score = 5
    def start_connection(self,text):
        if text.strip():
            self.finished = False
            self.Text = text
            self.wsParam = Ws_Param(APPID=self.APPID, APISecret=self.APISecret,APIKey=self.APIKey,AudioFile=self.AudioFile, Text=self.Text)
            websocket.enableTrace(False)
            self.wsUrl = self.wsParam.create_url()
            self.ws = websocket.WebSocketApp(self.wsUrl, on_message=self.on_message, on_error=self.on_error, on_close=self.on_close)
            self.ws.on_open = self.on_open
            self.ws.run_forever(sslopt={"cert_reqs": ssl.CERT_NONE})
        else:
            print("text is not allowed to be None" )
    
    def close_connection(self):
        if self.ws:
            self.ws.close()
        self.finished = True
        print("finished whatever receive!")
    def get_finish_state(self):
        return self.finished
    # 收到websocket消息的处理
    def on_message(self,ws, message):
        try:
            code = json.loads(message)["code"]
            sid = json.loads(message)["sid"]
            if code != 0:
                errMsg = json.loads(message)["message"]
                print("sid:%s call error:%s code is:%s" % (sid, errMsg, code))

            else:
                data = json.loads(message)["data"]
                status = data["status"]
                result = data["data"]
                if (status == 2):
                    xml = base64.b64decode(result)
                    #python在windows上默认用gbk编码，print时需要做编码转换，mac等其他系统自行调整编码
                    print(xml.decode("gbk"))
                    import xml.etree.ElementTree as ET
                    xml_content = xml.decode("gbk")
                    root = ET.fromstring(xml_content)
                    sentence =root.findall('read_sentence/rec_paper/read_chapter/sentence')[0]
                    if sentence:
                        self.scores['fluency_score'] = sentence.get('fluency_score')
                        self.scores['standard_score'] = sentence.get('standard_score')
                        self.scores['total_score'] = sentence.get('total_score')
                        self.scores['accuracy_score'] =sentence.get('accuracy_score')
                        self.close_connection()
                        print(self.scores)
                    self.finished =True

        except Exception as e:
            self.finished =True
            print("receive msg,but parse exception:", e)


    # 收到websocket错误的处理
    def on_error(self,ws, error):
        print("### error:", error)
        self.close_connection()

    # 收到websocket关闭的处理
    def on_close(self,ws):
        print("### closed ###")
        self.close_connection()


    # 收到websocket连接建立的处理
    def on_open(self,ws):
        def run(*args):
            frameSize = 1280  # 每一帧的音频大小
            intervel = 0.04  # 发送音频间隔(单位:s)
            status = STATUS_FIRST_FRAME  # 音频的状态信息，标识音频是第一帧，还是中间帧、最后一帧

            with open(self.wsParam.AudioFile, "rb") as fp:
                while True:
                    buf = fp.read(frameSize)
                    # 文件结束
                    if not buf:
                        status = STATUS_LAST_FRAME
                    # 第一帧处理
                    # 发送第一帧音频，带business 参数
                    # appid 必须带上，只需第一帧发送
                    if status == STATUS_FIRST_FRAME:
                        d = {"common": self.wsParam.CommonArgs,
                            "business": self.wsParam.BusinessArgs,
                            "data": {"status": 0}}
                        d = json.dumps(d)
                        ws.send(d)
                        status = STATUS_CONTINUE_FRAME
                    # 中间帧处理
                    elif status == STATUS_CONTINUE_FRAME:
                        d = {"business": {"cmd": "auw", "aus": 2, "aue": "raw"},
                            "data": {"status": 1, "data": str(base64.b64encode(buf).decode())}}
                        ws.send(json.dumps(d))
                    # 最后一帧处理
                    elif status == STATUS_LAST_FRAME:
                        d = {"business": {"cmd": "auw", "aus": 4, "aue": "raw"},
                            "data": {"status": 2, "data": str(base64.b64encode(buf).decode())}}
                        ws.send(json.dumps(d))
                        time.sleep(1)
                        break
                    # 模拟音频采样间隔
                    time.sleep(intervel)
            ws.close()
            self.finished =True

        thread.start_new_thread(run, ())

# test
if __name__ == "__main__":
    #待评测文本 utf8 编码，需要加utf8bom 头
    # TEXT = '\uFEFF'+ "今天天气怎么样"
    #直接从文件读取的方式
    currentdir = os.path.dirname(os.path.abspath(__file__))
    txtfile = os.path.join(currentdir,"../Resource/en/read_sentence_en.txt")
    audiofile = os.path.join(currentdir,"../Resource/en/read_sentence_en.pcm")
    TEXT = '\uFEFF'+ open(txtfile,"r",encoding='utf-8').read()
    time1 = datetime.now()
    assess = Assessment(APPID='', APISecret='',
                       APIKey='',
                       AudioFile=audiofile)
    assess.start_connection(text=TEXT)
    time2 = datetime.now()
    print(time2 - time1)

