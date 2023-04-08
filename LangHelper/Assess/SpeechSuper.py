#_*_encoding:utf-8_*_
import time
import json
import asyncio
import hashlib
import websockets

#In order to try it out for free, you should email them. 
#API price: https://www.speechsuper.com/index.html#Pricing

class SpeechSuper:
    def __init__(
            self,
            appKey: str,
            secretKey: str,
            audioPath: str,
            audioType: str = "wav",
            audioSampleRate: int = 16000,
            coreType: str = "sent.eval",
            baseUrl: str = "wss://api.speechsuper.com/"
    ) -> None:
        self.appKey = appKey
        self.secretKey = secretKey
        self.audioPath = audioPath
        self.audioType = audioType
        self.coreType = coreType
        self.audioSampleRate = audioSampleRate
        self.baseUrl = baseUrl
        self.scores = {
             "fluency":None,
             "rhythm":None,
             "overall":None,
             "pronunciation": None,
             "speed": None
        }
    # Send authentication
    async def initConnnct(self,websocket):
            t = time.time()
            timestamp = '%d' % int(round(t * 1000))
            connectStr = (self.appKey + timestamp + self.secretKey).encode("utf-8")
            connectSig = hashlib.sha1(connectStr).hexdigest()

            jconnect = {
                "cmd" : "connect",
                "param" : {
                    "sdk": {
                        "version": 16777472,
                        "source": 4,
                        "protocol": 1
                    },
                    "app": {
                        "applicationId": self.appKey,
                        "sig": connectSig,
                        "timestamp": timestamp
                    }
                }
            }

            param = json.dumps(jconnect)
            await websocket.send(param)
            return True

    # Send evaluation request
    async def startScore(self, websocket, request):
            # Send start request
            userId ="userId"
            timestamp = '%d' % int(round(time.time() * 1000))
            startStr = (self.appKey + timestamp + userId + self.secretKey).encode("utf-8")
            startSig = hashlib.sha1(startStr).hexdigest()

            startObj = {
                "cmd": "start",
                "param": {
                    "app": {
                        "userId": userId,
                        "applicationId": self.appKey,
                        "timestamp": timestamp,
                        "sig": startSig
                    },
                    "audio": {
                        "audioType": self.audioType,
                        "channel": 1,
                        "sampleBytes": 2,
                        "sampleRate": self.audioSampleRate
                    },
                    "request": request
                }
            }

            startObj["param"]["request"]["tokenId"] = "tokenId"

            startStr = json.dumps(startObj)
            await websocket.send(startStr)

            # Send audio data
            f = open(self.audioPath, "rb")
            while True:
                data = f.read(1024)
                if not data:
                    break
                await websocket.send(data)
            f.close()

            # Send stop request
            empty_arry = {
                "cmd": "stop",
            }
            empty_arry2 = json.dumps(empty_arry)
            await websocket.send(empty_arry2)
        
            return True



    async def main_logic(self,refText):
        #Establish connection
        async with websockets.connect(str(self.baseUrl) + str(self.coreType), ping_timeout = None) as websocket:
            
            await self.initConnnct(websocket)
        
            await self.startScore(websocket,{"coreType":self.coreType,"refText":refText})

            # Return result
            try:
                async for message in websocket:
                    print('message===>' + message)
                    message = json.loads(message)
                    if message.get('errId'):
                         print("error:", message['error'])
                    else:
                        self.scores["fluency"] = message["result"]["fluency"]
                        self.scores["rhythm"] = message["result"]["rhythm"]
                        self.scores["pronunciation"] = message["result"]["pronunciation"]
                        self.scores["speed"] = message["result"]["speed"]
                        self.scores["overall"] = message["result"]["overall"]
                        print(self.scores)
                    if websocket and websocket.open:
                         await websocket.close()
            except websockets.exceptions.ConnectionClosedError:
                print('Close connection to websocket')
    