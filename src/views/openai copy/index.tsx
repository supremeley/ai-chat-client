import './index.scss';

import { Button } from '@arco-design/web-react';
import { RealtimeClient } from '@openai/realtime-api-beta';
import WebSocket from 'ws';

const OpenAI = () => {
  const audioSocket = useRef<WebSocket | null>();
  const mediaStack = useRef<MediaStream>();
  // let audioCtx;
  const scriptNode = useRef<ScriptProcessorNode>();
  const source = useRef<MediaStreamAudioSourceNode>();
  // let play;

  const [isInChannel, setIsInChannel] = useState(false);

  const connectAudioWebSocket = (audioCtx: AudioContext) => {
    const url = 'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01';
    const apikey = '';

    audioSocket.current = new WebSocket(url, {
      headers: {
        Authorization: 'Bearer ' + apikey,
        'OpenAI-Beta': 'realtime=v1',
      },
    });

    audioSocket.current.onopen = () => {
      console.log('audioSocket connected');
    };

    audioSocket.current.onmessage = (event) => {
      // 将接收的数据转换成与传输过来的数据相同的Float32Array
      console.log('audioSocket message:', event.data);

      const jsonAudio = JSON.parse(event.data);

      // let buffer = new Float32Array(event.data);
      const buffer = new Float32Array(4096);

      for (let i = 0; i < 4096; i++) {
        // buffer.push(parseFloat(jsonAudio[i]));
        buffer[i] = parseFloat(jsonAudio[i]);
      }

      // 创建一个空白的AudioBuffer对象，这里的4096跟发送方保持一致，48000是采样率
      const myArrayBuffer = audioCtx.createBuffer(1, 4096, 16000);

      // 也是由于只创建了一个音轨，可以直接取到0
      const nowBuffering = myArrayBuffer.getChannelData(0);

      // 通过循环，将接收过来的数据赋值给简单音频对象
      for (let i = 0; i < 4096; i++) {
        nowBuffering[i] = buffer[i];
      }

      // 使用AudioBufferSourceNode播放音频
      const s = audioCtx.createBufferSource();

      s.buffer = myArrayBuffer;

      const gainNode = audioCtx.createGain();

      s.connect(gainNode);

      gainNode.connect(audioCtx.destination);

      const muteValue = 1;

      // if (!play) {
      //   // 是否静音
      //   muteValue = 0;
      // }

      gainNode.gain.setValueAtTime(muteValue, audioCtx.currentTime);

      s.start();
    };

    audioSocket.current.onclose = () => {
      console.log('audioSocket closed');
    };

    audioSocket.current.onerror = (error) => {
      console.error('audioSocket error:', error);
    };
  };

  function startCall() {
    setIsInChannel(true);
    // play = true;
    const audioCtx = new AudioContext();

    connectAudioWebSocket(audioCtx);

    // 该变量存储当前MediaStreamAudioSourceNode的引用
    // 可以通过它关闭麦克风停止音频传输

    // 创建一个ScriptProcessorNode 用于接收当前麦克风的音频
    scriptNode.current = audioCtx.createScriptProcessor(4096, 1, 1);

    navigator.mediaDevices
      .getUserMedia({ audio: true, video: false })
      .then((stream) => {
        mediaStack.current = stream;

        source.current = audioCtx.createMediaStreamSource(stream);

        scriptNode?.current && source.current?.connect(scriptNode.current);

        scriptNode.current?.connect(audioCtx.destination);
      })
      .catch(function (err) {
        /* 处理error */
        console.log('err', err);
        setIsInChannel(false);
      });

    // 当麦克风有声音输入时，会调用此事件
    // 实际上麦克风始终处于打开状态时，即使不说话，此事件也在一直调用
    scriptNode.current.onaudioprocess = (audioProcessingEvent) => {
      const inputBuffer = audioProcessingEvent.inputBuffer;
      // console.log("inputBuffer",inputBuffer);
      // 由于只创建了一个音轨，这里只取第一个频道的数据
      const inputData = inputBuffer.getChannelData(0);
      // 通过socket传输数据，实际上传输的是Float32Array
      if (audioSocket.current?.readyState === 1) {
        // console.log("发送的数据",inputData);
        // audioSocket.value.send(inputData);
        const jsonData = JSON.stringify(inputData);
        audioSocket.current.send(jsonData);

        // stopCall();
      }
    };
  }

  // 关闭麦克风
  const stopCall = () => {
    setIsInChannel(false);
    // play = false;
    mediaStack.current?.getTracks()[0].stop();
    scriptNode.current?.disconnect();

    if (audioSocket.current) {
      audioSocket.current.close();
      audioSocket.current = null;
    }
  };

  return (
    <div className='login'>
      {/* <video
        ref={mediaStream}
        autoPlay
        playsInline
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
      >
        <track kind='captions' />
      </video> */}
      <Button className='bg-gradient-to-tr from-indigo-500 to-indigo-300 w-full text-white' onClick={startCall}>
        Start
      </Button>
      <Button className='bg-gradient-to-tr from-indigo-500 to-indigo-300 w-full text-white' onClick={stopCall}>
        Stop
      </Button>
    </div>
  );
};

export default OpenAI;
