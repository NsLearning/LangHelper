import pyaudio
import os
import wave

class VoiceRecorder:
    def __init__(self, root_path):

        self.root_path = root_path  # path to save cache recording file
        self.audio = pyaudio.PyAudio()
        self.stream = None
        self.chunks = []  #.pcm data byte chunks
        self.audio_format = pyaudio.paInt16
        self.rate = 16000
        self.channels = 1

    def start(self):
        print("start recording!")
        self.stream = self.audio.open(
            format= self.audio_format,
            channels= self.channels,
            rate=self.rate,
            input=True,
            frames_per_buffer=1280
        )
        self.chunks = []

    def stop(self):
        print("stop recording!")
        if self.stream:
            self.stream.stop_stream()
            self.stream.close()
            self.stream = None
        file_path = os.path.join(self.root_path,"realtime.pcm")
        self.save_to_pcm(file_path,self.chunks)
        file_path = os.path.join(self.root_path,"realtime.wav")
        self.save_to_wav(file_path, self.chunks)

    def read_audio(self):
        if not self.stream:
            raise Exception("Stream not open. Call start() first.")
        while True:
            data = self.stream.read(1280)
            yield data
    
    def save_to_pcm(self, filename, frames):
        with open(filename, "wb") as f:
            f.write(b"".join(frames))

    def save_to_wav(self,filename,frames):
        wf = wave.open(filename, 'wb')
        wf.setnchannels(self.channels)
        sampwidth = self.audio.get_sample_size(self.audio_format)
        print("sampwidth --->", sampwidth)
        wf.setsampwidth(sampwidth)
        wf.setframerate(self.rate)
        wf.writeframes(b''.join(frames))
        wf.close()