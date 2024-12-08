import './index.scss';

import { Button, Card, Form, type FormInstance, Input } from '@arco-design/web-react';
// import WebSocket from 'ws';
// import mic from 'mic';
// import Speaker from 'speaker';
// import { Readable } from 'stream';
import TextArea from '@arco-design/web-react/es/Input/textarea';
import { RealtimeClient } from '@openai/realtime-api-beta';

const DefaultOpenAIKey =
  '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';

const DefaultInstructions = 'You are a great, upbeat friend.';

export interface LoginParams {
  apiKey: string;
  instructions: string;
}

const OpenAI = () => {
  const audioSocket = useRef<RealtimeClient | null>();
  const mediaStack = useRef<MediaStream>();
  // // let audioCtx;
  const scriptNode = useRef<ScriptProcessorNode>();
  const source = useRef<MediaStreamAudioSourceNode>();

  const formRef = useRef<FormInstance<LoginParams>>(null);

  // useEffect(() => {
  //   fetchData();
  //   // startCall();
  // }, []);

  const [isConnect, setIsConnect] = useState(false);

  const initOpenAi = async () => {
    try {
      const res = await formRef.current?.validate();

      if (res) {
        fetchOpenAi(res);
      }
    } catch (e) {}
  };

  const fetchOpenAi = async (conf: LoginParams) => {
    const client = new RealtimeClient({
      dangerouslyAllowAPIKeyInBrowser: true,
      apiKey: conf.apiKey,
    });

    client.updateSession({ instructions: conf.instructions });
    client.updateSession({ voice: 'alloy' });
    client.updateSession({
      turn_detection: { type: 'server_vad' }, // or 'server_vad'
      input_audio_transcription: { model: 'whisper-1' },
    });

    // client.on('realtime.event', (realtimeEvent: RealtimeEvent) => {
    //   setRealtimeEvents((realtimeEvents) => {
    //     const lastEvent = realtimeEvents[realtimeEvents.length - 1];
    //     if (lastEvent?.event.type === realtimeEvent.event.type) {
    //       // if we receive multiple events in a row, aggregate them for display purposes
    //       lastEvent.count = (lastEvent.count || 0) + 1;
    //       return realtimeEvents.slice(0, -1).concat(lastEvent);
    //     } else {
    //       return realtimeEvents.concat(realtimeEvent);
    //     }
    //   });
    // });

    client.on('error', (event) => {
      console.log('error', event);
      // do thing
    });

    client.on('conversation.interrupted', (event) => {
      /* do something */
      console.log('conversation.interrupted', event);
    });

    client.on('conversation.updated', (event) => {
      // Set up event handling
      console.log('conversation.updated', event);
      const { item, delta } = event;
      const items = client.conversation.getItems();
      // console.log('conversation.updated items', items);
      if (item.status === 'completed' && item.formatted.audio?.length) {
        switch (item.type) {
          case 'message':
            playAudio(item.formatted.audio);
            // system, user, or assistant message (item.role)
            break;
          case 'function_call':
            // always a function call from the model
            break;
          case 'function_call_output':
            // always a response from the user / application
            break;
        }
      }

      if (delta) {
        // Only one of the following will be populated for any given event
        // delta.audio = Int16Array, audio added
        // delta.transcript = string, transcript added
        // delta.arguments = string, function arguments added
      }
    });

    // client.on('conversation.item.appended', (event) => {
    //   console.log('Conversation item appended:', event);

    //   // if (item.type === 'message') {
    //   //   console.log('Playing audio response...');
    //   //   // playAudio(item.formatted.audio);
    //   // } else {
    //   //   console.log('No audio content in this item.');
    //   // }
    // });

    // client.on('conversation.item.completed', ({ item }) => {
    //   console.log('Conversation item completed:', item);

    //   if (item.type === 'message') {
    //     console.log('Playing audio response...');
    //     // playAudio(item.formatted.audio);
    //   } else {
    //     console.log('No audio content in this item.');
    //   }
    // });

    await client.connect();

    audioSocket.current = client;

    setIsConnect(true);
  };

  // function startAudioStream() {
  //   try {
  //     micInstance = mic({
  //       rate: '24000',
  //       channels: '1',
  //       debug: false,
  //       exitOnSilence: 6,
  //       fileType: 'raw',
  //       encoding: 'signed-integer',
  //     });

  //     const micInputStream = micInstance.getAudioStream();

  //     micInputStream.on('error', (error) => {
  //       console.error('Microphone error:', error);
  //     });

  //     micInstance.start();
  //     console.log('Microphone started streaming.');

  //     let audioBuffer = Buffer.alloc(0);
  //     const chunkSize = 4800; // 0.2 seconds of audio at 24kHz

  //     micInputStream.on('data', (data) => {
  //       audioBuffer = Buffer.concat([audioBuffer, data]);

  //       while (audioBuffer.length >= chunkSize) {
  //         const chunk = audioBuffer.slice(0, chunkSize);
  //         audioBuffer = audioBuffer.slice(chunkSize);

  //         const int16Array = new Int16Array(chunk.buffer, chunk.byteOffset, chunk.length / 2);

  //         try {
  //           client.appendInputAudio(int16Array);
  //         } catch (error) {
  //           console.error('Error sending audio data:', error);
  //         }
  //       }
  //     });

  //     micInputStream.on('silence', () => {
  //       console.log('Silence detected, creating response...');
  //       try {
  //         client.createResponse();
  //       } catch (error) {
  //         console.error('Error creating response:', error);
  //       }
  //     });
  //   } catch (error) {
  //     console.error('Error starting audio stream:', error);
  //   }
  // }

  // function playAudio(audioData) {
  //   try {
  //     if (!speaker) {
  //       speaker = new Speaker({
  //         channels: 1,
  //         bitDepth: 16,
  //         sampleRate: 24000,
  //       });
  //     }

  //     // Convert Int16Array to Buffer
  //     const buffer = Buffer.from(audioData.buffer);

  //     // Create a readable stream from the buffer
  //     const readableStream = new Readable({
  //       read() {
  //         this.push(buffer);
  //         this.push(null);
  //       },
  //     });

  //     // Pipe the stream to the speaker
  //     readableStream.pipe(speaker);
  //     console.log('Audio sent to speaker for playback. Buffer length:', buffer.length);

  //     // Handle the 'close' event to recreate the speaker for the next playback
  //     speaker.on('close', () => {
  //       console.log('Speaker closed. Recreating for next playback.');
  //       speaker = null;
  //     });
  //   } catch (error) {
  //     console.error('Error playing audio:', error);
  //   }
  // }

  // Connect to Realtime API

  // Send a item and triggers a generation
  // client.sendUserMessageContent([{ type: 'input_text', text: `How are you?` }]);

  // const audioSocket = useRef<WebSocket | null>();
  // const mediaStack = useRef<MediaStream>();
  // // let audioCtx;
  // const scriptNode = useRef<ScriptProcessorNode>();
  // const source = useRef<MediaStreamAudioSourceNode>();
  // // let play;

  // const [isInChannel, setIsInChannel] = useState(false);

  // const connectAudioWebSocket = (audioCtx: AudioContext) => {
  //   const url = 'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01';
  //   const apikey = '';

  //   audioSocket.current = new WebSocket(url, {
  //     headers: {
  //       Authorization: 'Bearer ' + apikey,
  //       'OpenAI-Beta': 'realtime=v1',
  //     },
  //   });

  //   audioSocket.current.onopen = () => {
  //     console.log('audioSocket connected');
  //   };

  //   audioSocket.current.onmessage = (event) => {
  //     // 将接收的数据转换成与传输过来的数据相同的Float32Array
  //     console.log('audioSocket message:', event.data);

  // 使用AudioBufferSourceNode播放音频
  function playAudio(audio: Int16Array) {
    if (audio.length) {
      const audioCtx = new AudioContext();

      const audioBuffer = audioCtx.createBuffer(1, audio.length, 24000);

      const channelData = audioBuffer.getChannelData(0);

      channelData.set(audio);

      const s = audioCtx.createBufferSource();

      s.buffer = audioBuffer;

      // const gainNode = audioCtx.createGain();

      s.connect(audioCtx.destination);

      // gainNode.connect(audioCtx.destination);

      // const muteValue = 1;

      // if (!play) {
      //   // 是否静音
      //   muteValue = 0;
      // }

      // gainNode.gain.setValueAtTime(muteValue, audioCtx.currentTime);

      s.start();
    }
  }

  function sendText() {
    audioSocket.current?.sendUserMessageContent([{ type: 'input_text', text: `How are you?` }]);
  }

  function startCall() {
    // setIsInChannel(true);
    // play = true;
    const audioCtx = new AudioContext();

    // connectAudioWebSocket(audioCtx);

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
        // setIsInChannel(false);
      });

    // 当麦克风有声音输入时，会调用此事件
    // 实际上麦克风始终处于打开状态时，即使不说话，此事件也在一直调用
    scriptNode.current.addEventListener('audioprocess', (audioProcessingEvent) => {
      console.log('audioProcessingEvent', audioProcessingEvent);

      const inputBuffer = audioProcessingEvent.inputBuffer;
      // console.log("inputBuffer",inputBuffer);
      // 由于只创建了一个音轨，这里只取第一个频道的数据
      const inputData = inputBuffer.getChannelData(0);
      // 通过socket传输数据，实际上传输的是Float32Array
      // if (audioSocket.current?.readyState === 1) {
      // console.log("发送的数据",inputData);
      // audioSocket.value.send(inputData);Í
      // const jsonData = JSON.stringify(inputData);

      const intArray = new Int16Array(inputData.map((value) => Math.round(value)));
      console.log('intArray', intArray);

      // audioSocket.current?.sendUserMessageContent({ audio: intArray });

      audioSocket.current?.appendInputAudio(intArray);

      audioSocket.current?.createResponse();
    });
  }

  // // 关闭麦克风
  const stopCall = () => {
    // setIsInChannel(false);
    // play = false;
    mediaStack.current?.getTracks()[0].stop();
    scriptNode.current?.disconnect();

    if (audioSocket.current) {
      // audioSocket.current.cancelResponse();
      audioSocket.current = null;
    }
  };

  const [text, setText] = useState('');

  return (
    <div className='container'>
      <section className='control-container'>
        <Card title='control'>
          <Form ref={formRef} wrapperCol={{ span: 24 }} size='large'>
            <Form.Item field='apiKey' label='openai_key' initialValue={DefaultOpenAIKey} rules={[{ required: true }]}>
              <TextArea></TextArea>
            </Form.Item>
            <Form.Item
              field='instructions'
              label='instructions'
              initialValue={DefaultInstructions}
              rules={[{ required: true }]}
            >
              <TextArea></TextArea>
            </Form.Item>
          </Form>
          <div className='m-b4'>Status: {isConnect ? 'Connect' : 'DisConnect'}</div>

          <Button className='text-white' type='primary' onClick={initOpenAi}>
            Connect
          </Button>
          <Card className='m-t4'>
            <Input value={text} onChange={(e) => setText(e)}></Input>
            <Button disabled={!isConnect} className='text-white mt-2' onClick={sendText}>
              Send
            </Button>
          </Card>
          <Card className='m-t4'>
            <Button disabled={!isConnect} className='text-white' onClick={startCall}>
              StartCall
            </Button>
          </Card>
        </Card>
      </section>
    </div>
  );
};

// const OpenAI = () => {
//   const navigate = useNavigate();
//   // const routerContext = useInRouterContext();
//   // const authHook = useAuth();
//   const [loading, setLoading] = useState(false);
//   const formRef = useRef<FormInstance<LoginParams>>(null);

//   useEffect(() => {
//     console.log('init Login');
//   }, []);

//   const handleLogin = async () => {
//     if (loading) {
//       return;
//     }

//     if (formRef.current) {
//       setLoading(true);

//       try {
//         const res = await formRef.current.validate();

//         const userinfo = await authHook.login(res);

//         await authHook.loadPermission();

//         Message.success({
//           content: '登录成功',
//           duration: 1000,
//           onClose: () => {
//             const hour = new Date().getHours();
//             const thisTime =
//               hour < 8 ? '早上好' : hour <= 11 ? '上午好' : hour <= 13 ? '中午好' : hour < 18 ? '下午好' : '晚上好';

//             Notification.success({
//               title: `${userinfo?.username ?? '您好'},欢迎登录`,
//               content: thisTime,
//             });

//             // const hash = window.location.hash.split('/');

//             // let url = '';

//             // if (hash.length > 1) {
//             //   url = decodeURIComponent(hash.at(-1)!);
//             // }

//             // if (url === 'login' || url === '#login') {
//             const url = '/knowledge/list';
//             // }

//             // TODO: useNavigate 使用到 RouterContext检查， 在Router后代中可使用正常
//             // console.log('url', url);
//             // console.log('routerContext', routerContext);
//             // if (routerContext) {
//             // navigate(url, { replace: true });
//             // } else {
//             window.location.hash = url;
//             // }
//           },
//         });
//       } catch (_) {
//         console.log(formRef.current.getFieldsError());
//         setLoading(false);
//         // Message.error('校验失败，请检查字段！');
//       }
//     }
//   };

//   const jumpToViewList = () => {
//     navigate(`/knowledge/view/ids=82,24,22,21`);
//   };

//   return (
//     <div className='login'>
//       <div className='login-header'>
//         <img src={Logo} className='login-header__logo' />
//         科普也是药
//       </div>

//       <div className='pl-4 pr-4'>
//         <section className='login-container'>
//           {/* <Row justify='end'>
//             <Col xs={24} sm={24} md={18} lg={10} xl={10}> */}
//           <div className='form'>
//             <div className='form-title'>医生登录</div>
//             <Form ref={formRef} wrapperCol={{ span: 24 }} size='large'>
//               <FormItem field='account' rules={[{ required: true, message: '请输入账号' }]}>
//                 <Input
//                   addBefore={<div className='i-bxs:user'></div>}
//                   autoComplete='account'
//                   placeholder='请输入账号'
//                   className='form-input'
//                 />
//               </FormItem>
//               <FormItem field='password' rules={[{ required: true, message: '请输入密码' }]}>
//                 <InputPassword
//                   addBefore={<div className='i-material-symbols:password'></div>}
//                   autoComplete='password'
//                   placeholder='请输入密码'
//                   className='form-input'
//                 />
//               </FormItem>
//               <FormItem field='code' rules={[{ required: true, message: '请输入验证码' }]}>
//                 <Input
//                   addBefore={<div className='i-uiw:verification'></div>}
//                   placeholder='请输入验证码'
//                   className='form-input'
//                   addAfter={<Captcha />}
//                 />
//               </FormItem>
//               <FormItem>
//                 <Button type='primary' shape='square' loading={loading} className='form-button' onClick={handleLogin}>
//                   登录
//                 </Button>
//               </FormItem>
//             </Form>
//           </div>
//           {/* </Col>
//           </Row> */}
//         </section>

//         <div className='my-6'>
//           <Row>
//             <Col span={12} className='text-[20px] font-bold'>
//               专病科普
//             </Col>
//             <Col span={12} className='text-center'>
//               <Input.Search
//                 searchButton='搜索'
//                 placeholder='Search content'
//                 style={{ width: 500, height: 40 }}
//                 size='large'
//               />
//             </Col>
//           </Row>

//           <div className='mt-[20px]'>
//             {[1, 2, 3].map((c) => (
//               <Row key={c} gutter={4} className='mt-[4px]'>
//                 <Col span={4} className='text-center'>
//                   <div className='flex-1 py-[10px] group-container'>学科{c} &gt;</div>
//                 </Col>
//                 {[1, 2, 3, 4, 5].map((s) => (
//                   <Col key={s} span={4} className='text-center'>
//                     <div className='flex-1 py-[10px] bg-[#f2f3f5] item-container' onClick={jumpToViewList}>
//                       疾病{s}
//                     </div>
//                   </Col>
//                 ))}
//               </Row>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

export default OpenAI;
