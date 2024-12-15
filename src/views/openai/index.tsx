import './index.scss';

import { Button, Card, Form, type FormInstance, Input, Switch, Tag } from '@arco-design/web-react';
import Row from '@arco-design/web-react/es/Grid/row';
import TextArea from '@arco-design/web-react/es/Input/textarea';
import StreamingAvatar, { AvatarQuality } from '@heygen/streaming-avatar';
import { StreamingEvents, TaskMode, TaskType, VoiceEmotion } from '@heygen/streaming-avatar';
import { RealtimeClient, type FormattedItem } from 'openai-realtime-api';

import { getHeygenToken } from '@/api/heygen';
import { WavRecorder, WavStreamPlayer } from '@/utils/wavtools/index.js';
import OpenAI from 'openai';
import { RealtimePromptWorklet } from './realtime-prompt';
import { AnalysisPromptWorklet } from './analysis—prompt';

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

const OpenAIConnHeygen = () => {
  const clientRef = useRef<RealtimeClient | null>(null);

  const wavRecorderRef = useRef<WavRecorder>(new WavRecorder({ sampleRate: 24000 }));

  const wavStreamPlayerRef = useRef<WavStreamPlayer>(new WavStreamPlayer({ sampleRate: 24000 }));

  const [items, setItems] = useState<FormattedItem[]>([]);

  const [realtimeEvents, setRealtimeEvents] = useState<RealtimeEvent[]>([]);

  const formRef = useRef<FormInstance<LoginParams>>(null);

  // useEffect(() => {
  //   console.log('items', items);

  //   const transcriptList = items.filter(
  //     (item) => item.role === 'assistant' && item.status === 'completed' && item.formatted.transcript,
  //   );
  //   console.log('transcriptList', transcriptList);

  //   const msg = transcriptList.at(-1)?.formatted?.transcript;

  //   console.log('msg', msg);

  //   // msg && handleSpeak(msg);
  // }, [items]);

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
        await connectConversation(res);
      }

      // await wavRecorder.record((data) => client?.appendInputAudio(data.mono));
    } catch (e) {
      console.log(e);
    }
  };

  const connectConversation = useCallback(async (conf: LoginParams) => {
    const wavRecorder = wavRecorderRef.current;
    // const wavStreamPlayer = wavStreamPlayerRef.current;

    const client = new RealtimeClient({
      dangerouslyAllowAPIKeyInBrowser: true,
      apiKey: conf.apiKey,
    });

    // client.updateSession({ instructions: conf.instructions });
    client.updateSession({ voice: 'alloy' });
    client.updateSession({ input_audio_transcription: { model: 'whisper-1' } });

    if (isVadmode) {
      client.updateSession({
        turn_detection: { type: 'server_vad' },
      });
    }

    client.on('realtime.event', (realtimeEvent) => {
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

    // client.on('conversation.interrupted', async (event) => {
    //   /* do something */

    //   const trackSampleOffset = await wavStreamPlayer.interrupt();

    //   console.log('conversation.interrupted', trackSampleOffset);

    //   if (trackSampleOffset?.trackId) {
    //     const { trackId, offset } = trackSampleOffset;
    //     client.cancelResponse(trackId, offset);
    //   }
    // });

    client.on('conversation.updated', ({ item, delta }) => {
      // if (delta?.audio) {
      //   console.log('delta', delta);
      //   // console.log('item.status', JSON.stringify(item.status));
      //   wavStreamPlayer.add16BitPCM(delta.audio, item.id);
      // }

      if (item.status === 'completed' && item.formatted.transcript?.length && item.role === 'assistant') {
        console.log('delta', delta);
        console.log('item', item);

        setText(item.formatted.transcript);
        // console.log('item.status', JSON.stringify(item.status));
      }

      // if (item.status === 'completed' && item.formatted.audio?.length) {
      // console.log('conversation.updated delta', delta);
      // console.log('conversation.updated item', item);
      //   console.log('2');
      //   const wavFile = await WavRecorder.decode(item.formatted.audio, 24000, 24000);
      //   item.formatted.file = wavFile;
      // }

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

  const updateRealtimeSession = (instructions: string) => {
    const client = clientRef.current;

    const prompt = RealtimePromptWorklet.replace('##SCENE_DESCRIPTION##', JSON.stringify(instructions));

    console.log('updateRealtimeSession instructions', instructions);
    console.log('prompt', prompt);

    client?.updateSession({ instructions: prompt });
  };

  const [text, setText] = useState('');

  const sendText = () => {
    const client = clientRef.current;

    client?.sendUserMessageContent([{ type: 'input_text', text: text }]);
  };

  useEffect(() => {
    console.log(text);

    handleSpeak(text);
  }, [text]);

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

    if (value && client?.isConnected) {
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
  const mediaStream = useRef<HTMLVideoElement>(null);

  const [token, setToken] = useState<string>('');

  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [isLoadingRepeat, setIsLoadingRepeat] = useState(false);
  const [isUserTalking, setIsUserTalking] = useState(false);
  const [debug, setDebug] = useState<string>();

  // const [chatMode, setChatMode] = useState('text_mode');
  // const [data, setData] = useState<StartAvatarResponse>();

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
        // setDebug('Playing');
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

  async function handleSpeak(t: string) {
    setIsLoadingRepeat(true);

    if (!avatar.current) {
      // setDebug('Avatar API not initialized');

      return;
    }
    // speak({ text: text, task_type: TaskType.REPEAT })
    await avatar.current.speak({ text: t, taskType: TaskType.REPEAT, taskMode: TaskMode.SYNC }).catch((e) => {
      setDebug(e.message);
    });

    setIsLoadingRepeat(false);
  }

  // async function handleInterrupt() {
  //   if (!avatar.current) {
  //     setDebug('Avatar API not initialized');

  //     return;
  //   }

  //   await avatar.current.interrupt().catch((e) => {
  //     setDebug(e.message);
  //   });
  // }

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
    // console.log('avatar', avatar.current);

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
        avatarName: 'June_HR_public',
        // avatarName: 'Wayne_20240711',
        // knowledgeId: '', // Or use a custom `knowledgeBase`.
        voice: {
          rate: 1.5, // 0.5 ~ 1.5
          emotion: VoiceEmotion.EXCITED,
        },
        language: 'zh-CN',
      });

      console.log('res', res);

      // setData(res);
      // default to voice mode
      await avatar.current?.startVoiceChat();
      // await avatar.current?.startListening();
      // setChatMode('voice_mode');
    } catch (error) {
      console.error('Error starting avatar session:', error);
    } finally {
      setIsLoadingSession(false);
    }
  }

  // async function startListening() {
  //   await avatar.current?.startListening();
  // }

  const videoStream = useRef<HTMLVideoElement>(null);

  async function startVideo() {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 300, height: 240 },
      // audio: true,
    });

    videoStream.current!.srcObject = stream;

    setTimeout(async () => {
      const img = analyzeImgPath();

      const response = await analysisImg([img]);

      await initOpenAi();

      updateRealtimeSession(response);

      loopSessionTimer();
    }, 1000);
  }

  const timer = useRef<NodeJS.Timer>();

  const imgArr = useRef<string[]>([]);

  const loopSessionTimer = () => {
    timer.current = setInterval(async () => {
      if (imgArr.current.length === 3) {
        const response = await analysisImg(imgArr.current);

        updateRealtimeSession(response);

        imgArr.current = [];
      } else {
        const img = analyzeImgPath();

        imgArr.current.push(img);
      }
    }, 3000);
  };

  const stopVideo = () => {
    const stream = videoStream.current!.srcObject as MediaStream;
    const tracks = stream.getTracks();
    tracks.forEach((track) => track.stop());
  };

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const analyzeImgPath = () => {
    const canvas = canvasRef.current!;

    canvas.width = videoStream.current?.videoWidth!;
    canvas.height = videoStream.current?.videoHeight!;
    // console.log(videoRef.videoWidth)
    // console.log(videoRef.videoHeight)
    const canvasCtx = canvas.getContext('2d');

    canvasCtx?.drawImage(videoStream.current!, 0, 0); // canvas 拍照

    const image = new Image(); //必须使用 Image ，不然 canvas 的 toDataURL 方法会报错，可不是闲着蛋疼

    image.src = canvas.toDataURL('image/png');

    // console.log('image', image);

    return image.src;

    // const params = { file: image.src, directory: 'order/' + props.orderSn };
    // const params = { file: '123' }
  };

  const uploadImg = async () => {
    const img = analyzeImgPath();

    const response = await analysisImg([img]);

    console.log('response', response);
  };

  const analysisImg = async (imgs: string[]) => {
    const client = new OpenAI({
      apiKey: DefaultOpenAIKey,
      dangerouslyAllowBrowser: true,
    });

    const imgList = imgs.map((img) => {
      return {
        type: 'image_url',
        image_url: {
          url: img,
        },
      };
    });

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: AnalysisPromptWorklet,
            },
            ...imgList,
          ],
        },
      ],
      response_format: { type: 'json_object' },
      // temperature: 0.9,
      // top_p: 1,
    });

    console.log('response', response);

    return JSON.parse(response.choices[0].message.content);
  };

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
            {realtimeEvents.map((realtimeEvent) => {
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
            {items.map((conversationItem) => {
              return (
                <div className='conversation-item' key={conversationItem.id}>
                  <div className={`speaker ${conversationItem.role || ''}`}>
                    <div>{conversationItem.role.replaceAll('_', ' ')}</div>
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
      <div>
        {isLoadingSession}
        {isUserTalking}
        {debug}
        {isLoadingRepeat}
      </div>
      <video
        ref={videoStream}
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
      <Button className='bg-gradient-to-tr from-indigo-500 to-indigo-300 w-full text-white' onClick={startVideo}>
        Start Self
      </Button>
      <canvas id='canvas' ref={canvasRef}></canvas>
      <Button className='bg-gradient-to-tr from-indigo-500 to-indigo-300 w-full text-white' onClick={uploadImg}>
        Upload File
      </Button>
    </div>
  );
};

export default OpenAIConnHeygen;
