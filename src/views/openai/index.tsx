import './index.scss';

import {
  Button,
  Card,
  Form,
  type FormInstance,
  Switch,
  Tag,
  Spin,
  Space,
  Layout,
  Input,
  InputNumber,
  Select,
  Message,
} from '@arco-design/web-react';
import TextArea from '@arco-design/web-react/es/Input/textarea';
import StreamingAvatar, { AvatarQuality } from '@heygen/streaming-avatar';
import { StreamingEvents, TaskMode, TaskType, VoiceEmotion } from '@heygen/streaming-avatar';
import { RealtimeClient, type FormattedItem, type RealtimeEvent } from 'openai-realtime-api';

import { heygen } from '@/api';
import { WavRecorder, WavStreamPlayer } from '@/utils/wavtools/index.js';
import OpenAI from 'openai';
import { RealtimePromptWorklet } from './realtime-prompt';
import { AnalysisPromptWorklet } from './analysis-prompt';
import type { ChatCompletionContentPartImage } from 'openai/resources/index.mjs';
import dayjs from 'dayjs';

const DefaultOpenAIKey =
  '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';

const DefaultHeygenKey = 'OGVlOGFlODI2NjQwNDMzNjhmZGYzNDNhYWNjZjc4MzEtMTczNTAxNTIwMw==';

const QualityOptions = [AvatarQuality.High, AvatarQuality.Medium, AvatarQuality.Low];
const VoiceEmotionOptions = [
  VoiceEmotion.BROADCASTER,
  VoiceEmotion.EXCITED,
  VoiceEmotion.FRIENDLY,
  VoiceEmotion.SERIOUS,
  VoiceEmotion.SOOTHING,
];
const ModelOptions = [
  'gpt-4o-realtime-preview(10-01)',
  'gpt-4o-realtime-preview-2024-12-17',
  'gpt-4o-realtime-preview-2024-10-01',
  'gpt-4o-mini-realtime-preview(12-17)',
  'gpt-4o-mini-realtime-preview-2024-12-17',
];

export interface Config {
  openai_key: string;
  heygen_key: string;
  realtime_model: string;
}

export interface HeygenConfig {
  quality: AvatarQuality;
  avatarName: string;
  voice: {
    rate: number;
    emotion: VoiceEmotion;
  };
  language: string;
}

type REvent = RealtimeEvent & {
  // time: string;
  // source: 'client' | 'server';
  count?: number;
  // event: Record<string, any>;
};

const OpenAIConnHeygen = () => {
  const wavRecorderRef = useRef<WavRecorder>(new WavRecorder({ sampleRate: 24000 }));
  const wavStreamPlayerRef = useRef<WavStreamPlayer>(new WavStreamPlayer({ sampleRate: 24000 }));

  const realtimeClientRef = useRef<RealtimeClient | null>(null);
  const [isRealtimeConnect, setIsRealtimeConnect] = useState(false);
  const [isRealtimeLoading, setIsRealtimeLoading] = useState(false);
  const [conversationItems, setConversationItems] = useState<FormattedItem[]>([]);
  const [realtimeEvents, setRealtimeEvents] = useState<REvent[]>([]);
  const [expandedEvents, setExpandedEvents] = useState<Record<string, boolean>>({});

  const formRef = useRef<FormInstance<Config>>(null);
  const heygenConfigRef = useRef<FormInstance<HeygenConfig>>(null);

  useEffect(() => {
    heygenConfigRef.current?.setFieldsValue({
      quality: AvatarQuality.Low,
      avatarName: 'June_HR_public',
      voice: {
        rate: 1,
        emotion: VoiceEmotion.EXCITED,
      },
      language: 'zh-CN',
    });

    formRef.current?.setFieldsValue({
      openai_key: DefaultOpenAIKey,
      heygen_key: DefaultHeygenKey,
      realtime_model: 'gpt-4o-realtime-preview',
    });
  }, []);

  const initRealtime = async () => {
    // const client = clientRef.current;
    setIsRealtimeLoading(true);
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
    } catch (error) {
      setIsRealtimeConnect(false);
      console.error('initRealtime error:', error);
      Message.error(JSON.stringify(error));
    } finally {
      setIsRealtimeLoading(false);
    }
  };

  const connectConversation = useCallback(async (conf: Config) => {
    try {
      const wavRecorder = wavRecorderRef.current;
      // const wavStreamPlayer = wavStreamPlayerRef.current;

      const client = new RealtimeClient({
        dangerouslyAllowAPIKeyInBrowser: true,
        apiKey: conf.openai_key,
        model: conf.realtime_model,
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
          const lastEvent = realtimeEvents[0];
          if (lastEvent?.event.type === realtimeEvent.event.type) {
            // if we receive multiple events in a row, aggregate them for displapy purposes
            lastEvent.count = (lastEvent.count || 0) + 1;
            realtimeEvents.splice(0, 1, lastEvent);
          } else {
            realtimeEvents.unshift(realtimeEvent);
          }

          return realtimeEvents;
        });
      });

      client.on('error', (event) => {
        console.log('error', event);
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

      client.on('conversation.updated', ({ item }) => {
        // TODO: text
        if (item.status === 'completed' && item.formatted.transcript?.length && item.role === 'assistant') {
          setMessage(item.formatted.transcript);
        }

        // TODO: audio

        // if (delta?.audio) {
        //   console.log('delta', delta);
        //   // console.log('item.status', JSON.stringify(item.status));
        //   wavStreamPlayer.add16BitPCM(delta.audio, item.id);
        // }

        // if (item.status === 'completed' && item.formatted.audio?.length) {
        //   const wavFile = await WavRecorder.decode(item.formatted.audio, 24000, 24000);
        //   item.formatted.file = wavFile;
        // }

        setConversationItems(client.conversation.getItems().reverse());
      });

      setConversationItems(client.conversation.getItems().reverse());

      await client.connect();

      // TODO: prologue
      client.sendUserMessageContent([
        {
          type: `input_text`,
          text: `Hello!`,
          // text: `For testing purposes, I want you to list ten car brands. Number each item, e.g. "one (or whatever number you are one): the item name".`
        },
      ]);

      if (isVadmode) {
        await wavRecorder.record((data) => client.appendInputAudio(data.mono));
      }

      realtimeClientRef.current = client;
      setIsRealtimeConnect(true);
      setRealtimeEvents([]);
    } catch (error) {
      setIsRealtimeConnect(false);
      console.error('connectConversation error:', error);
      Message.error(JSON.stringify(error));
    }
  }, []);

  const disconnectConversation = useCallback(async () => {
    setIsRealtimeConnect(false);
    // setRealtimeEvents([]);
    // setConversationItems([]);
    // setMemoryKv({});

    const client = realtimeClientRef.current;
    client?.disconnect();

    const wavRecorder = wavRecorderRef.current;
    await wavRecorder?.end();

    const wavStreamPlayer = wavStreamPlayerRef.current;
    await wavStreamPlayer?.interrupt();
  }, []);

  const updateRealtimeSession = (instructions: string) => {
    const client = realtimeClientRef.current;

    const prompt = RealtimePromptWorklet.replace('##SCENE_DESCRIPTION##', JSON.stringify(instructions));

    // console.log('updateRealtimeSession instructions', instructions);
    // console.log('prompt', prompt);

    client?.updateSession({ instructions: prompt });
  };

  // const sendTextToRealtime = () => {
  //   const client = realtimeClientRef.current;

  //   client?.sendUserMessageContent([{ type: 'input_text', text: text }]);
  // };

  // const [isRecording, setIsRecording] = useState(false);
  // const [canPushToTalk, setCanPushToTalk] = useState(true);

  // const startRecording = async () => {
  //   setIsRecording(true);
  //   const client = clientRef.current;
  //   const wavRecorder = wavRecorderRef.current;
  //   const wavStreamPlayer = wavStreamPlayerRef.current;
  //   const trackSampleOffset = await wavStreamPlayer.interrupt();
  //   if (trackSampleOffset?.trackId) {
  //     const { trackId, offset } = trackSampleOffset;
  //     client?.cancelResponse(trackId, offset);
  //   }
  //   await wavRecorder.record((data) => client?.appendInputAudio(data.mono));
  // };

  // const stopRecording = async () => {
  //   setIsRecording(false);
  //   const client = clientRef.current;
  //   const wavRecorder = wavRecorderRef.current;
  //   await wavRecorder.pause();
  //   client?.createResponse();
  // };

  const [isVadmode, setVadMode] = useState(true);

  const switchRealtimeMode = async (value: boolean) => {
    setVadMode(value);

    const client = realtimeClientRef.current;
    const wavRecorder = wavRecorderRef.current;
    if (!value && wavRecorder.getStatus() === 'recording') {
      await wavRecorder.pause();
    }

    client?.updateSession({
      turn_detection: !value ? null : { type: 'server_vad' },
    });

    if (value && client?.isConnected) {
      await wavRecorder?.record((data) => client.appendInputAudio(data.mono));
    } else {
      wavRecorder?.end();
    }

    // setCanPushToTalk(!value);
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

  const heygenClientRef = useRef<StreamingAvatar | null>(null);
  const [heygenStream, setHeygenStream] = useState<MediaStream>();
  const mediaStream = useRef<HTMLVideoElement>(null);
  const [isHeygenConnect, setIsHeygenConnect] = useState(false);
  const [isHeygenLoading, setIsHeygenLoading] = useState(false);
  // const [isLoadingRepeat, setIsLoadingRepeat] = useState(false);
  // const [isUserTalking, setIsUserTalking] = useState(false);
  // const [debug, setDebug] = useState<string>();

  // const [chatMode, setChatMode] = useState('text_mode');
  // const [data, setData] = useState<StartAvatarResponse>();

  const getHeygenToken = async () => {
    try {
      const res = await formRef.current?.validate();

      const { data } = await heygen.getHeygenToken(res?.heygen_key!);

      if (!data.error && data.token) {
        // setHeygenToken(data.token);

        return data.token;
      }
    } catch (error) {
      console.error('getHeygenToken error: ', error);
      Message.error(JSON.stringify(error));
    }
  };

  const handleSpeakMessage = async (message: string) => {
    try {
      // setIsLoadingRepeat(true);
      const client = heygenClientRef.current;

      if (!client || !isConnect() || !message) {
        // setDebug('Avatar API not initialized');
        // console.log(!client || isConnect() || !message, 'handleSpeakMessage');
        // console.log(!client || isConnect() || !message, 'handleSpeakMessage');
        // console.log(!client || isConnect() || !message, 'handleSpeakMessage');
        return;
      }

      // TODO: TaskMode.ASYNC
      await client.speak({ text: message, taskType: TaskType.REPEAT, taskMode: TaskMode.SYNC });

      // setIsLoadingRepeat(false);
    } catch (error) {
      console.error('handleSpeakMessage error: ', error);
      Message.error(JSON.stringify(error));
    }
  };

  const stopHeygen = async () => {
    await heygenClientRef.current?.stopAvatar();
    setHeygenStream(undefined);
    setIsHeygenConnect(false);
  };

  const initHeygen = async () => {
    const conf = await heygenConfigRef.current?.validate();

    setIsHeygenLoading(true);

    const newToken = await getHeygenToken();

    if (!newToken) {
      return;
    }

    heygenClientRef.current = new StreamingAvatar({
      token: newToken,
    });

    const client = heygenClientRef.current;

    client.on(StreamingEvents.AVATAR_START_TALKING, (e) => {
      console.log('Avatar started talking', e);
    });

    client.on(StreamingEvents.AVATAR_STOP_TALKING, (e) => {
      console.log('Avatar stopped talking', e);
    });

    client.on(StreamingEvents.STREAM_DISCONNECTED, () => {
      console.log('Stream disconnected');
      stopHeygen();
    });

    client.on(StreamingEvents.STREAM_READY, (event) => {
      console.log('>>>>> Stream ready:', event.detail);
      setHeygenStream(event.detail);
    });

    client.on(StreamingEvents.USER_START, (event) => {
      console.log('>>>>> User started talking:', event);
      // setIsUserTalking(true);
    });

    client.on(StreamingEvents.USER_STOP, (event) => {
      console.log('>>>>> User stopped talking:', event);
      // setIsUserTalking(false);
    });

    try {
      const res = await client.createStartAvatar({ ...conf! });

      console.log('res', res);

      // await client.startVoiceChat();
      setIsHeygenConnect(true);
    } catch (error) {
      console.error('initHeygen error:', error);
      Message.error(JSON.stringify(error));
    } finally {
      setIsHeygenLoading(false);
    }
  };

  // async function startListening() {
  //   await avatar.current?.startListening();
  // }

  const localStream = useRef<HTMLVideoElement>(null);
  const [isLocalConnect, setIsLocalConnect] = useState(false);

  const timer = useRef<NodeJS.Timeout | null>(null);

  const localPhotoList = useRef<string[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [space, setSpace] = useState(3);
  const [batchNum, setBatchNum] = useState(3);

  const loopUpdateSessionTimer = () => {
    const spaceTime = space * 1000;

    timer.current = setInterval(async () => {
      try {
        if (localPhotoList.current.length === batchNum) {
          const response = await getPromptByAnalysisLocalPhoto(localPhotoList.current);

          response && updateRealtimeSession(response);

          localPhotoList.current = [];
        } else {
          const img = getLocalPhotoPath();

          localPhotoList.current.push(img);
        }
      } catch (error) {
        disconnectConversation();
        timer.current && clearInterval(timer.current);
        timer.current = null;
        console.error('loopUpdateSessionTimer error:', error);
        Message.error(JSON.stringify(error));
      }
    }, spaceTime);
  };

  const stopLocalCamera = () => {
    const stream = localStream.current!.srcObject as MediaStream;
    const tracks = stream.getTracks();
    tracks.forEach((track) => track.stop());
    setIsLocalConnect(false);
    timer.current && clearInterval(timer.current);
    timer.current = null;
  };

  const initLocalCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 300, height: 200 },
        // audio: true,
      });

      localStream.current!.srcObject = stream;

      setIsLocalConnect(true);
      // TODO:
      setTimeout(async () => {
        try {
          const img = getLocalPhotoPath();

          const response = await getPromptByAnalysisLocalPhoto([img]);

          await initRealtime();

          response && updateRealtimeSession(response);

          loopUpdateSessionTimer();
        } catch (error) {
          stopLocalCamera();
          console.error('initLocalCamera error:', error);
          Message.error(JSON.stringify(error));
        }
      }, 1000);
    } catch (error) {
      console.error('initLocalCamera error:', error);
      Message.error(JSON.stringify(error));
    }
  };

  const getLocalPhotoPath = () => {
    const canvas = canvasRef.current!;
    const video = localStream.current!;

    canvas.width = video?.videoWidth;
    canvas.height = video?.videoHeight;

    const canvasCtx = canvas.getContext('2d');

    canvasCtx?.drawImage(video, 0, 0);

    const image = new Image();

    image.src = canvas.toDataURL('image/png');

    return image.src;
  };

  const getPromptByAnalysisLocalPhoto = async (imgs: string[]) => {
    // try {
    const res = await formRef.current?.validate();

    const client = new OpenAI({
      apiKey: res?.openai_key,
      dangerouslyAllowBrowser: true,
    });

    const imgList: ChatCompletionContentPartImage[] = imgs.map((img) => {
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

    if (response.choices[0].message.content) {
      return JSON.stringify(response.choices[0].message.content);
    }

    return response.choices[0].message.content;
    // }
    // catch (error) {
    //   disconnectConversation();
    //   timer.current && clearInterval(timer.current);
    //   timer.current = null;
    //   console.error('getPromptByAnalysisLocalPhoto error:', error);
    //   Message.error(JSON.stringify(error));
    // }
  };

  const connect = async () => {
    await initHeygen();

    await initLocalCamera();

    // initRealtime();
  };

  const disconnect = async () => {
    await stopHeygen();

    await disconnectConversation();

    stopLocalCamera();
  };

  useEffect(() => {
    if (heygenStream && mediaStream.current) {
      mediaStream.current.srcObject = heygenStream;
      mediaStream.current.onloadedmetadata = () => {
        mediaStream.current!.play();
        // setDebug('Playing');
      };
    }
  }, [mediaStream, heygenStream]);

  const [message, setMessage] = useState('');

  useEffect(() => {
    console.log('message', message);

    handleSpeakMessage(message);
  }, [message]);

  useEffect(() => {
    return () => {
      // cleanup; resets to defaults
      realtimeClientRef.current?.reset();
      stopHeygen();
      timer.current && clearInterval(timer.current);
      timer.current = null;
    };
  }, []);

  const [isCollapse, setIsCollapse] = useState(false);

  const switchCollapse = () => {
    setIsCollapse((prev) => !prev);
  };

  const isConnect = useCallback(() => {
    return isRealtimeConnect && isHeygenConnect;
  }, [isRealtimeConnect, isHeygenConnect]);

  const isLoading = useCallback(() => {
    return isRealtimeLoading || isHeygenLoading;
  }, [isRealtimeLoading, isHeygenLoading]);

  return (
    <div className='page-container'>
      <section className={classNames('control-container', { collapse: isCollapse })}>
        <Button
          shape='circle'
          size='large'
          icon={<div className={classNames('i-ic:round-keyboard-arrow-right', { 'flip-icon': !isCollapse })}></div>}
          className='control-btn flex-center'
          onClick={switchCollapse}
        />
        <section className='scroll-container'>
          <Form ref={formRef} labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} size='large'>
            <Form.Item
              field='openai_key'
              label='openai_key'
              initialValue={DefaultOpenAIKey}
              rules={[{ required: true }]}
            >
              <TextArea></TextArea>
            </Form.Item>
            <Form.Item
              field='heygen_key'
              label='heygen_key'
              initialValue={DefaultHeygenKey}
              rules={[{ required: true }]}
            >
              <TextArea></TextArea>
            </Form.Item>
            <Form.Item field='realtime_model' label='realtime_model' rules={[{ required: true }]}>
              <Select allowClear>
                {ModelOptions.map((option) => (
                  <Select.Option key={option} value={option}>
                    {option}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
          <Space>
            <div className='m-b4'>
              Realtime Status:
              {isRealtimeConnect ? <Tag color='green'>Connected</Tag> : <Tag color='gray'>DisConnected</Tag>}
            </div>
            <div className='m-b4'>
              Heygen Status:{' '}
              {isHeygenConnect ? <Tag color='green'>Connected</Tag> : <Tag color='gray'>DisConnected</Tag>}
            </div>
          </Space>
          <div className='m-b4'>
            Mode: <Switch checked={isVadmode} checkedText='vad' uncheckedText='manual' onChange={switchRealtimeMode} />
          </div>
          <Form
            disabled={isConnect()}
            ref={heygenConfigRef}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            size='large'
          >
            <Form.Item field='quality' label='quality' rules={[{ required: true }]}>
              <Select>
                {QualityOptions.map((option) => (
                  <Select.Option key={option} value={option}>
                    {option}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item field='avatarName' label='avatar'>
              <Input />
            </Form.Item>
            <Form.Item field='voice.emotion' label='emotion'>
              <Select allowClear>
                {VoiceEmotionOptions.map((option) => (
                  <Select.Option key={option} value={option}>
                    {option}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item field='voice.rate' label='rate' initialValue={1}>
              <InputNumber min={0} max={1.5} step={0.1}></InputNumber>
            </Form.Item>
            {/* <Form.Item field='language' label='language'>
            <Select></Select>
          </Form.Item> */}
          </Form>
          <Space>
            <div className='m-b4'>
              Batch Analysis Quantity:
              <InputNumber disabled={isConnect()} value={batchNum} onChange={(e) => setBatchNum(e)}></InputNumber>
            </div>
            <div className='m-b4'>
              Interval Time:
              <InputNumber disabled={isConnect()} value={space} onChange={(e) => setSpace(e)}></InputNumber>
            </div>
          </Space>
          <Button
            className='text-white'
            type='primary'
            size='large'
            loading={isLoading()}
            onClick={isConnect() ? disconnect : connect}
          >
            {isConnect() ? 'DisConnect' : 'Connect'}
          </Button>
        </section>
        {/* <Row className='mt-4'>
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
          </Row> */}
      </section>

      <Layout className='main'>
        <Layout.Content className='screen-container'>
          {isLoading() && <Spin loading={isLoading()} size={80} className='loading-status'></Spin>}

          <div className='main-screen'>
            <video ref={mediaStream} autoPlay playsInline className='video-content'>
              {/* <track kind='captions' /> */}
            </video>
          </div>

          <div className={classNames('assistant-screen', { active: isLocalConnect })}>
            <video ref={localStream} autoPlay playsInline className='video-content'>
              {/* <track kind='captions' /> */}
            </video>
          </div>
        </Layout.Content>

        <Layout.Sider resizeDirections={['left']} className='log-container'>
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
                    <div className='event-timestamp'>{dayjs(realtimeEvent.time).format('YYYY-MM-DD HH:mm:ss')}</div>
                    <div className='event-details'>
                      <div
                        className='event-summary'
                        onClick={() => {
                          // toggle event details
                          const id = event.event_id;
                          const expanded = { ...expandedEvents };
                          if (expanded[id!]) {
                            delete expanded[id!];
                          } else {
                            expanded[id!] = true;
                          }
                          setExpandedEvents(expanded);
                        }}
                      >
                        <div className={`event-source ${event.type === 'error' ? 'error' : realtimeEvent.source}`}>
                          {realtimeEvent.source === 'client' ? (
                            <div className='i-ic:round-keyboard-arrow-up'></div>
                          ) : (
                            <div className='i-ic:round-keyboard-arrow-down'></div>
                          )}
                          <span>{event.type === 'error' ? 'error!' : realtimeEvent.source}</span>
                        </div>
                        <div className='event-type'>
                          {event.type}
                          {count && ` (${count})`}
                        </div>
                      </div>
                      {!!expandedEvents[event.event_id!] && (
                        <div className='event-payload'>{JSON.stringify(event, null, 2)}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
          <Card title='conversationItem'>
            <div className='content-block-body'>
              {!conversationItems.length && `awaiting connection...`}
              {conversationItems.map((item) => {
                return (
                  <div className='conversation-item' key={item.id}>
                    <div className={`speaker ${item.role || ''}`}>
                      <div>{item.role.replaceAll('_', ' ')}</div>
                    </div>
                    <div className={`speaker-content`}>
                      {/* tool response */}
                      {item.type === 'function_call_output' && <div>{item.formatted.output}</div>}
                      {/* tool call */}
                      {!!item.formatted.tool && (
                        <div>
                          {item.formatted.tool.name}({item.formatted.tool.arguments})
                        </div>
                      )}
                      {!item.formatted.tool && item.role === 'user' && (
                        <div>
                          {item.formatted.transcript ||
                            (item.formatted.audio?.length
                              ? '(awaiting transcript)'
                              : item.formatted.text || '(item sent)')}
                        </div>
                      )}
                      {!item.formatted.tool && item.role === 'assistant' && (
                        <div>{item.formatted.transcript || item.formatted.text || '(truncated)'}</div>
                      )}
                      {item.formatted.file && <audio src={item.formatted.file.url} controls />}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </Layout.Sider>
      </Layout>

      <canvas id='canvas' ref={canvasRef}></canvas>
    </div>
  );
};

export default OpenAIConnHeygen;
