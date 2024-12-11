import './index.scss';

import { Button, Card, Form, type FormInstance, Input, Switch, Tag } from '@arco-design/web-react';
import Row from '@arco-design/web-react/es/Grid/row';
import TextArea from '@arco-design/web-react/es/Input/textarea';
import StreamingAvatar, { AvatarQuality } from '@heygen/streaming-avatar';
import { type StartAvatarResponse, StreamingEvents, TaskMode, TaskType, VoiceEmotion } from '@heygen/streaming-avatar';
import { RealtimeClient } from '@openai/realtime-api-beta';
import type { ItemType } from '@openai/realtime-api-beta/dist/lib/client';

import { getHeygenToken } from '@/api/heygen';
import { WavRecorder, WavStreamPlayer } from '@/utils/wavtools/index.js';

const DefaultOpenAIKey =
  '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';

const DefaultInstructions = 'You are a great, upbeat friend.';

export interface LoginParams {
  apiKey: string;
  instructions: string;
}

interface RealtimeEvent {
  time: string;
  source: 'client' | 'server';
  count?: number;
  event: Record<string, any>;
}

const OpenAI = () => {
  const clientRef = useRef<RealtimeClient | null>(null);

  const wavRecorderRef = useRef<WavRecorder>(new WavRecorder({ sampleRate: 24000 }));

  const wavStreamPlayerRef = useRef<WavStreamPlayer>(new WavStreamPlayer({ sampleRate: 24000 }));

  const [items, setItems] = useState<ItemType[]>([]);
  const [realtimeEvents, setRealtimeEvents] = useState<RealtimeEvent[]>([]);

  const formRef = useRef<FormInstance<LoginParams>>(null);

  useEffect(() => {
    console.log(items.at(-1));
    items.at(-1)?.formatted?.text && handleSpeak(items.at(-1)?.formatted?.text);
  }, [items]);

  useEffect(() => {
    return () => {
      // cleanup; resets to defaults
      clientRef.current?.reset();
    };
  }, []);

  const [isConnect, setIsConnect] = useState(false);

  const initOpenAi = async () => {
    // const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;
    const wavStreamPlayer = wavStreamPlayerRef.current;

    try {
      const res = await formRef.current?.validate();

      await wavRecorder.begin();
      await wavStreamPlayer.connect();

      if (res) {
        connectConversation(res);
      }

      // await wavRecorder.record((data) => client?.appendInputAudio(data.mono));
    } catch (e) {}
  };

  const connectConversation = useCallback(async (conf: LoginParams) => {
    const wavRecorder = wavRecorderRef.current;
    const wavStreamPlayer = wavStreamPlayerRef.current;

    const client = new RealtimeClient({
      dangerouslyAllowAPIKeyInBrowser: true,
      apiKey: conf.apiKey,
    });

    client.updateSession({ instructions: conf.instructions });
    client.updateSession({ voice: 'alloy' });
    client.updateSession({ input_audio_transcription: { model: 'whisper-1' } });

    if (isVadmode) {
      client.updateSession({
        turn_detection: { type: 'server_vad' },
      });
    }

    client.on('realtime.event', (realtimeEvent: RealtimeEvent) => {
      setRealtimeEvents((realtimeEvents) => {
        const lastEvent = realtimeEvents[realtimeEvents.length - 1];
        if (lastEvent?.event.type === realtimeEvent.event.type) {
          // if we receive multiple events in a row, aggregate them for display purposes
          lastEvent.count = (lastEvent.count || 0) + 1;
          return realtimeEvents.slice(0, -1).concat(lastEvent);
        } else {
          return realtimeEvents.concat(realtimeEvent);
        }
      });
    });

    client.on('error', (event) => {
      console.log('error', event);
      // do thing
    });

    client.on('conversation.interrupted', async (event) => {
      /* do something */
      console.log('conversation.interrupted', event);

      const trackSampleOffset = await wavStreamPlayer.interrupt();

      if (trackSampleOffset?.trackId) {
        const { trackId, offset } = trackSampleOffset;
        client.cancelResponse(trackId, offset);
      }
    });

    client.on('conversation.updated', async ({ item, delta }) => {
      console.log('conversation.updated delta', delta);
      console.log('conversation.updated item', item);

      if (delta?.audio) {
        console.log('1');
        wavStreamPlayer.add16BitPCM(delta.audio, item.id);
      }

      if (item.status === 'completed' && item.formatted.audio?.length) {
        console.log('2');
        const wavFile = await WavRecorder.decode(item.formatted.audio, 24000, 24000);
        item.formatted.file = wavFile;
      }

      const items = client.conversation.getItems();

      setItems(items);
    });

    setItems(client.conversation.getItems());

    await client.connect();

    client.sendUserMessageContent([
      {
        type: `input_text`,
        text: `Hello!`,
        // text: `For testing purposes, I want you to list ten car brands. Number each item, e.g. "one (or whatever number you are one): the item name".`
      },
    ]);

    if (isVadmode) {
      await wavRecorder.record((data) => client?.appendInputAudio(data.mono));
    }

    clientRef.current = client;

    setIsConnect(true);
    setRealtimeEvents([]);
    setItems(client.conversation.getItems());
  }, []);

  const disconnectConversation = useCallback(async () => {
    setIsConnect(false);
    setRealtimeEvents([]);
    setItems([]);
    // setMemoryKv({});

    const client = clientRef.current;
    client?.disconnect();

    const wavRecorder = wavRecorderRef.current;
    await wavRecorder.end();

    const wavStreamPlayer = wavStreamPlayerRef.current;
    await wavStreamPlayer.interrupt();
  }, []);

  const [text, setText] = useState('');

  const sendText = () => {
    const client = clientRef.current;

    client?.sendUserMessageContent([{ type: 'input_text', text: text }]);
  };

  const [isRecording, setIsRecording] = useState(false);

  const startRecording = async () => {
    setIsRecording(true);
    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;
    const wavStreamPlayer = wavStreamPlayerRef.current;
    const trackSampleOffset = await wavStreamPlayer.interrupt();
    if (trackSampleOffset?.trackId) {
      const { trackId, offset } = trackSampleOffset;
      client?.cancelResponse(trackId, offset);
    }
    await wavRecorder.record((data) => client?.appendInputAudio(data.mono));
  };

  const stopRecording = async () => {
    setIsRecording(false);
    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;
    await wavRecorder.pause();
    client?.createResponse();
  };

  const [isVadmode, setVadMode] = useState(true);

  const [canPushToTalk, setCanPushToTalk] = useState(true);

  const changeTurnEndType = async (value: boolean) => {
    setVadMode(value);

    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;
    if (!value && wavRecorder.getStatus() === 'recording') {
      await wavRecorder.pause();
    }

    client?.updateSession({
      turn_detection: !value ? null : { type: 'server_vad' },
    });

    if (value && client?.isConnected()) {
      await wavRecorder.record((data) => client.appendInputAudio(data.mono));
    }

    setCanPushToTalk(!value);
  };

  // function startCall() {
  //   // setIsInChannel(true);
  //   // play = true;
  //   const audioCtx = new AudioContext();

  //   // connectAudioWebSocket(audioCtx);

  //   // 该变量存储当前MediaStreamAudioSourceNode的引用
  //   // 可以通过它关闭麦克风停止音频传输

  //   // 创建一个ScriptProcessorNode 用于接收当前麦克风的音频
  //   scriptNode.current = audioCtx.createScriptProcessor(4096, 1, 1);

  //   navigator.mediaDevices
  //     .getUserMedia({ audio: true, video: false })
  //     .then((stream) => {
  //       mediaStack.current = stream;

  //       source.current = audioCtx.createMediaStreamSource(stream);

  //       scriptNode?.current && source.current?.connect(scriptNode.current);

  //       scriptNode.current?.connect(audioCtx.destination);
  //     })
  //     .catch(function (err) {
  //       /* 处理error */
  //       console.log('err', err);
  //       // setIsInChannel(false);
  //     });

  //   // 当麦克风有声音输入时，会调用此事件
  //   // 实际上麦克风始终处于打开状态时，即使不说话，此事件也在一直调用
  //   scriptNode.current.addEventListener('audioprocess', (audioProcessingEvent) => {
  //     console.log('audioProcessingEvent', audioProcessingEvent);

  //     const inputBuffer = audioProcessingEvent.inputBuffer;
  //     // console.log("inputBuffer",inputBuffer);
  //     // 由于只创建了一个音轨，这里只取第一个频道的数据
  //     const inputData = inputBuffer.getChannelData(0);
  //     // 通过socket传输数据，实际上传输的是Float32Array
  //     // if (audioSocket.current?.readyState === 1) {
  //     // console.log("发送的数据",inputData);
  //     // audioSocket.value.send(inputData);Í
  //     // const jsonData = JSON.stringify(inputData);

  //     const intArray = new Int16Array(inputData.map((value) => Math.round(value)));
  //     console.log('intArray', intArray);

  //     // audioSocket.current?.sendUserMessageContent({ audio: intArray });

  //     audioSocket.current?.appendInputAudio(intArray);

  //     // audioSocket.current?.createResponse();
  //   });
  // }

  // // // 关闭麦克风
  // const stopCall = () => {
  //   // setIsInChannel(false);
  //   // play = false;
  //   mediaStack.current?.getTracks()[0].stop();
  //   scriptNode.current?.disconnect();

  //   if (audioSocket.current) {
  //     // audioSocket.current.cancelResponse();
  //     audioSocket.current = null;
  //   }
  // };

  const avatar = useRef<StreamingAvatar | null>(null);
  const [stream, setStream] = useState<MediaStream>();

  const [token, setToken] = useState<string>('');

  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [isLoadingRepeat, setIsLoadingRepeat] = useState(false);
  const [isUserTalking, setIsUserTalking] = useState(false);
  const [debug, setDebug] = useState<string>();

  // const [text, setText] = useState<string>('');
  const mediaStream = useRef<HTMLVideoElement>(null);
  const [chatMode, setChatMode] = useState('text_mode');
  const [data, setData] = useState<StartAvatarResponse>();

  useEffect(() => {
    initHeygen();

    return () => {
      endSession();
    };
  }, []);

  useEffect(() => {
    if (stream && mediaStream.current) {
      mediaStream.current.srcObject = stream;
      mediaStream.current.onloadedmetadata = () => {
        mediaStream.current!.play();
        setDebug('Playing');
      };
    }
  }, [mediaStream, stream]);

  const initHeygen = async () => {
    const { data } = await getHeygenToken();
    console.log('data', data);

    if (!data.error && data.token) {
      setToken(data.token);
    }
  };

  async function handleSpeak(t) {
    setIsLoadingRepeat(true);
    if (!avatar.current) {
      setDebug('Avatar API not initialized');

      return;
    }
    // speak({ text: text, task_type: TaskType.REPEAT })
    await avatar.current.speak({ text: t, taskType: TaskType.REPEAT, taskMode: TaskMode.SYNC }).catch((e) => {
      setDebug(e.message);
    });
    setIsLoadingRepeat(false);
  }

  async function handleInterrupt() {
    if (!avatar.current) {
      setDebug('Avatar API not initialized');

      return;
    }
    await avatar.current.interrupt().catch((e) => {
      setDebug(e.message);
    });
  }

  async function endSession() {
    await avatar.current?.stopAvatar();
    setStream(undefined);
  }

  async function startSession() {
    setIsLoadingSession(true);
    // const newToken = await fetchAccessToken();

    const newToken = token;
    // console.log('newToken', newToken);
    avatar.current = new StreamingAvatar({
      token: newToken,
    });
    console.log('avatar', avatar.current);

    avatar.current.on(StreamingEvents.AVATAR_START_TALKING, (e) => {
      console.log('Avatar started talking', e);
    });

    avatar.current.on(StreamingEvents.AVATAR_STOP_TALKING, (e) => {
      console.log('Avatar stopped talking', e);
    });

    avatar.current.on(StreamingEvents.STREAM_DISCONNECTED, () => {
      console.log('Stream disconnected');
      endSession();
    });

    avatar.current?.on(StreamingEvents.STREAM_READY, (event) => {
      console.log('>>>>> Stream ready:', event.detail);
      setStream(event.detail);
    });

    avatar.current?.on(StreamingEvents.USER_START, (event) => {
      console.log('>>>>> User started talking:', event);
      setIsUserTalking(true);
    });

    avatar.current?.on(StreamingEvents.USER_STOP, (event) => {
      console.log('>>>>> User stopped talking:', event);
      setIsUserTalking(false);
    });

    try {
      const res = await avatar.current.createStartAvatar({
        quality: AvatarQuality.Low,
        avatarName: 'Wayne_20240711',
        // knowledgeId: '', // Or use a custom `knowledgeBase`.
        voice: {
          rate: 1.5, // 0.5 ~ 1.5
          emotion: VoiceEmotion.EXCITED,
        },
        language: 'zh-CN',
      });

      console.log('res', res);

      setData(res);
      // default to voice mode
      await avatar.current?.startVoiceChat();
      // await avatar.current?.startListening();
      setChatMode('voice_mode');
    } catch (error) {
      console.error('Error starting avatar session:', error);
    } finally {
      setIsLoadingSession(false);
    }
  }

  async function startListening() {
    await avatar.current?.startListening();
  }

  return (
    <div className='container flex'>
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
          <div className='m-b4'>
            Status: {isConnect ? <Tag color='green'>Connected</Tag> : <Tag color='gray'>DisConnected</Tag>}
          </div>
          <div className='m-b4'>
            Mode: <Switch checked={isVadmode} checkedText='vad' uncheckedText='manual' onChange={changeTurnEndType} />
          </div>
          <Button className='text-white' type='primary' onClick={isConnect ? disconnectConversation : initOpenAi}>
            {isConnect ? 'DisConnect' : 'Connect'}
          </Button>
          <Row className='mt-4'>
            {isConnect && canPushToTalk && !isVadmode && (
              <Button
                // buttonStyle={isRecording ? 'alert' : 'regular'}
                type='secondary'
                disabled={!isConnect || !canPushToTalk}
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
              >
                {isRecording ? 'release to send' : 'push to talk'}
              </Button>
            )}
          </Row>

          <Card className='m-t4'>
            <Input value={text} onChange={(e) => setText(e)}></Input>
            <Button disabled={!isConnect} className='text-white mt-2' onClick={sendText}>
              Send
            </Button>
          </Card>
          {/* <Card className='m-t4'>
            <Button disabled={!isConnect} className='text-white' onClick={startCall}>
              StartCall
            </Button>
          </Card> */}
        </Card>
      </section>
      <section className='control-container'>
        <Card title='events'>
          <div className='content-block-body'>
            {!realtimeEvents.length && `awaiting connection...`}
            {realtimeEvents.map((realtimeEvent, i) => {
              const count = realtimeEvent.count;
              const event = { ...realtimeEvent.event };
              if (event.type === 'input_audio_buffer.append') {
                event.audio = `[trimmed: ${event.audio.length} bytes]`;
              } else if (event.type === 'response.audio.delta') {
                event.delta = `[trimmed: ${event.delta.length} bytes]`;
              }
              return (
                <div className='event' key={event.event_id}>
                  <div className='event-timestamp'>{realtimeEvent.time}</div>
                  <div className='event-details'>
                    <div
                      className='event-summary'
                      // onClick={() => {
                      //   // toggle event details
                      //   const id = event.event_id;
                      //   const expanded = { ...expandedEvents };
                      //   if (expanded[id]) {
                      //     delete expanded[id];
                      //   } else {
                      //     expanded[id] = true;
                      //   }
                      //   setExpandedEvents(expanded);
                      // }}
                    >
                      <div className={`event-source ${event.type === 'error' ? 'error' : realtimeEvent.source}`}>
                        {realtimeEvent.source === 'client' ? 1 : 2}
                        <span>{event.type === 'error' ? 'error!' : realtimeEvent.source}</span>
                      </div>
                      <div className='event-type'>
                        {event.type}
                        {count && ` (${count})`}
                      </div>
                    </div>
                    {/* {!!expandedEvents[event.event_id] && (
                  <div className='event-payload'>{JSON.stringify(event, null, 2)}</div>
                )} */}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
        <Card title='conversationItem'>
          <div className='content-block-body'>
            {!items.length && `awaiting connection...`}
            {items.map((conversationItem, i) => {
              return (
                <div className='conversation-item' key={conversationItem.id}>
                  <div className={`speaker ${conversationItem.role || ''}`}>
                    <div>{(conversationItem.role || conversationItem.type).replaceAll('_', ' ')}</div>
                    {/* <div className='close' onClick={() => deleteConversationItem(conversationItem.id)}>
                      <X />
                    </div> */}
                  </div>
                  <div className={`speaker-content`}>
                    {/* tool response */}
                    {conversationItem.type === 'function_call_output' && <div>{conversationItem.formatted.output}</div>}
                    {/* tool call */}
                    {!!conversationItem.formatted.tool && (
                      <div>
                        {conversationItem.formatted.tool.name}({conversationItem.formatted.tool.arguments})
                      </div>
                    )}
                    {!conversationItem.formatted.tool && conversationItem.role === 'user' && (
                      <div>
                        {conversationItem.formatted.transcript ||
                          (conversationItem.formatted.audio?.length
                            ? '(awaiting transcript)'
                            : conversationItem.formatted.text || '(item sent)')}
                      </div>
                    )}
                    {!conversationItem.formatted.tool && conversationItem.role === 'assistant' && (
                      <div>
                        {conversationItem.formatted.transcript || conversationItem.formatted.text || '(truncated)'}
                      </div>
                    )}
                    {conversationItem.formatted.file && <audio src={conversationItem.formatted.file.url} controls />}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </section>
      <video
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
      </video>
      <Button className='bg-gradient-to-tr from-indigo-500 to-indigo-300 w-full text-white' onClick={startSession}>
        Start
      </Button>
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
