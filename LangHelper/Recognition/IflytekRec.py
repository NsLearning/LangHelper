
import hmac
import base64
import websocket
import hashlib
import json, time, threading,os
from urllib.parse import quote

class  Recognition():
    def __init__(self, app_id, api_key):

        self.app_id = app_id
        self.api_key = api_key
        self.base_url = "ws://rtasr.xfyun.cn/v1/ws"
        self.ts = None
        self.signa = None

        self.ws = None
        self.trecv = None
        self.finished = False
        self.lang = 'en'     #中文、中英混合识别：cn；英文：en；
        self.result = ""

    #update request url to adviod this error: illegal access|ts expired
    def update_request_parameter(self):
        self.ts = str(int(time.time()))
        tt = (self.app_id + self.ts).encode('utf-8')
        md5 = hashlib.md5()
        md5.update(tt)
        baseString = md5.hexdigest()
        baseString = bytes(baseString, encoding='utf-8')
        apiKey = self.api_key.encode('utf-8')
        signa = hmac.new(apiKey, baseString, hashlib.sha1).digest()
        signa = base64.b64encode(signa)
        self.signa = str(signa, 'utf-8')
    
    def set_language(self, lang):
        self.lang = 'cn' if (lang == 'cn') else 'en'

    def get_finish_state(self):
        return self.finished
    
    def start_connection(self):
        self.finished = False
        self.result = ""
        if self.ws:
            self.close()
        if self.trecv:
            self.trecv.join()
        self.update_request_parameter()
        Xunfeiurl = self.base_url + "?appid=" + self.app_id + "&ts=" + self.ts + "&signa=" + quote(self.signa) + "&lang=" + self.lang
        self.ws = websocket.create_connection(Xunfeiurl)
        self.trecv = threading.Thread(target=self.recv)
        self.trecv.start()
        print("connected sucessfully!")

    def check_connection(self):
        return self.ws and self.ws.connected

    def send(self, file_path, chunk):
        # two ways to send data, if chunk is not None, send data by chunk
        if chunk: 
            if self.ws and self.ws.connected:
                self.ws.send(chunk)
                time.sleep(0.04)  # 1280bytes /40ms 
            else:
                print("can't send data to xunfei, not connected!")
        else:
            file_object = open(file_path, 'rb')
            try:
                index = 1
                while True:
                    chunk = file_object.read(1280)
                    if not chunk:
                        break
                    self.ws.send(chunk)

                    index += 1
                    time.sleep(0.04)
            finally:
                file_object.close()
        
    def send_endtag(self):
        self.ws.send(bytes(self.end_tag.encode('utf-8')))
        print("send end tag success")
    
    def recv(self):
        try:
            while self.ws.connected:
                result = str(self.ws.recv())
                if len(result) == 0:
                    self.finished = True
                    print("receive result end")
                    break
                result_dict = json.loads(result)
                # 解析结果
                if result_dict["action"] == "started":
                    print("handshake success, result: " + result)

                if result_dict["action"] == "result":
                    #parse data
                    data = json.loads(result_dict["data"])
                    if data["cn"]["st"]["type"] == '0':
                        stt_text =  ""
                        raw_rt = data["cn"]["st"]["rt"]
                        for rt in raw_rt:
                            raw_ws = rt['ws']
                            for ws in raw_ws:
                                raw_cw = ws['cw']
                                for cw in raw_cw:
                                    stt_text += cw['w']
                        print("rtasr result: " + stt_text)
                        self.result += stt_text
                if result_dict["action"] == "error":
                    print("rtasr error: " + result)
                    self.ws.close()
                    self.finished = True
                    return
        except websocket.WebSocketConnectionClosedException:
            print("receive result end")
            self.finished = True

    def close(self):
        if self.ws:
            self.ws.close()
            self.finished = True
            print(" close connection manually")

# test
if __name__ == "__main__":
    rec = Recognition(app_id = "", api_key="")
    currentdir = os.path.dirname(os.path.abspath(__file__))
    pcmfile = os.path.join(currentdir,"../Resource/rec/realtime.pcm")
    # rec.set_language("cn") #中英识别，默认en
    rec.start_connection()
    rec.send(pcmfile,None)
    print(rec.result)