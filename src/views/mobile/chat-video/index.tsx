import './index.scss';

import {
  // Button,
  // Card,
  // Form,
  // type FormInstance,
  // Switch,
  // Tag,
  Spin,
  // Space,
  // Layout,
  // Input,
  // InputNumber,
  // Select,
  Message,
} from '@arco-design/web-react';
// import TextArea from '@arco-design/web-react/es/Input/textarea';
import StreamingAvatar, { AvatarQuality } from '@heygen/streaming-avatar';
import { StreamingEvents, TaskMode, TaskType, VoiceEmotion } from '@heygen/streaming-avatar';
import { RealtimeClient } from 'openai-realtime-api';

import { heygen } from '@/api';
import { WavRecorder, WavStreamPlayer } from '@/utils/wavtools/index.js';
import OpenAI from 'openai';
import { RealtimePromptWorklet } from './realtime-prompt';
import { AnalysisPromptWorklet } from './analysis—prompt';
import type { ChatCompletionContentPartImage } from 'openai/resources/index.mjs';
// import dayjs from 'dayjs';
import CallIcon from '@/assets/images/mobile/call.png';
import StopIcon from '@/assets/images/mobile/stop.png';
import VolumeIcon from '@/assets/images/mobile/volume.png';

const DefaultOpenAIKey =
  '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';

const DefaultHeygenKey = 'OGVlOGFlODI2NjQwNDMzNjhmZGYzNDNhYWNjZjc4MzEtMTczNTAxNTIwMw==';

// const QualityOptions = [AvatarQuality.High, AvatarQuality.Medium, AvatarQuality.Low];
// const VoiceEmotionOptions = [
//   VoiceEmotion.BROADCASTER,
//   VoiceEmotion.EXCITED,
//   VoiceEmotion.FRIENDLY,
//   VoiceEmotion.SERIOUS,
//   VoiceEmotion.SOOTHING,
// ];
// const ModelOptions = [
//   'gpt-4o-realtime-preview(10-01)',
//   'gpt-4o-realtime-preview-2024-12-17',
//   'gpt-4o-realtime-preview-2024-10-01',
//   'gpt-4o-mini-realtime-preview(12-17)',
//   'gpt-4o-mini-realtime-preview-2024-12-17',
// ];

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
  // language: string;
}

// type REvent = RealtimeEvent & {
//   // time: string;
//   // source: 'client' | 'server';
//   count?: number;
//   // event: Record<string, any>;
// };

const OpenAIConnHeygen = () => {
  const wavRecorderRef = useRef<WavRecorder>(new WavRecorder({ sampleRate: 24000 }));
  const wavStreamPlayerRef = useRef<WavStreamPlayer>(new WavStreamPlayer({ sampleRate: 24000 }));

  const realtimeClientRef = useRef<RealtimeClient | null>(null);
  const [isRealtimeConnect, setIsRealtimeConnect] = useState(false);
  const [isRealtimeLoading, setIsRealtimeLoading] = useState(false);
  // const [conversationItems, setConversationItems] = useState<FormattedItem[]>([]);
  // const [realtimeEvents, setRealtimeEvents] = useState<REvent[]>([]);
  // const [expandedEvents, setExpandedEvents] = useState<Record<string, boolean>>({});

  const realtimeConifg: Config = {
    openai_key: DefaultOpenAIKey,
    heygen_key: DefaultHeygenKey,
    realtime_model: 'gpt-4o-realtime-preview',
  };

  const heygenConfig: HeygenConfig = {
    quality: AvatarQuality.Low,
    avatarName: 'June_HR_public',
    voice: {
      rate: 1,
      emotion: VoiceEmotion.EXCITED,
    },
    // language: 'zh-CN',
  };

  useEffect(() => {
    connect();
  }, []);

  const initRealtime = async () => {
    // const client = clientRef.current;
    setIsRealtimeLoading(true);
    const wavRecorder = wavRecorderRef.current;
    const wavStreamPlayer = wavStreamPlayerRef.current;

    try {
      const res = realtimeConifg;

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
        console.log(realtimeEvent);
        // setRealtimeEvents((realtimeEvents) => {
        //   const lastEvent = realtimeEvents[0];
        //   if (lastEvent?.event.type === realtimeEvent.event.type) {
        //     // if we receive multiple events in a row, aggregate them for display purposes
        //     lastEvent.count = (lastEvent.count || 0) + 1;
        //     return realtimeEvents.splice(0, 1, lastEvent);
        //   } else {
        //     realtimeEvents.unshift(realtimeEvent);
        //     return realtimeEvents;
        //   }
        // });
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

        // setConversationItems(client.conversation.getItems().reverse());
      });

      // setConversationItems(client.conversation.getItems().reverse());

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
      // setRealtimeEvents([]);
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

  const [isVadmode] = useState(true);

  // const switchRealtimeMode = async (value: boolean) => {
  //   setVadMode(value);

  //   const client = realtimeClientRef.current;
  //   const wavRecorder = wavRecorderRef.current;
  //   if (!value && wavRecorder.getStatus() === 'recording') {
  //     await wavRecorder.pause();
  //   }

  //   client?.updateSession({
  //     turn_detection: !value ? null : { type: 'server_vad' },
  //   });

  //   if (value && client?.isConnected) {
  //     await wavRecorder?.record((data) => client.appendInputAudio(data.mono));
  //   } else {
  //     wavRecorder?.end();
  //   }

  //   // setCanPushToTalk(!value);
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
      const res = realtimeConifg;
      console.log(res);
      const { data } = await heygen.getHeygenToken(res?.heygen_key);

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

      if (!client || isConnect() || !message) {
        // setDebug('Avatar API not initialized');

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
    const conf = heygenConfig;

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
      const res = await client.createStartAvatar({ ...conf });

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

  const [space] = useState(3);
  const [batchNum] = useState(3);

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
    const res = realtimeConifg;

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

  const isConnect = useCallback(() => {
    return isRealtimeConnect && isHeygenConnect;
  }, [isRealtimeConnect, isHeygenConnect]);

  const isLoading = useCallback(() => {
    return isRealtimeLoading || isHeygenLoading;
  }, [isRealtimeLoading, isHeygenLoading]);

  const navigate = useNavigate();

  const stopHandle = () => {
    navigate(-1);
    disconnect();
  };

  return (
    <div className='page-container'>
      <section className='screen-container'>
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
      </section>
      <div className='icon-container'>
        <div className='icon-container-item'>
          <img src={CallIcon} alt='' className='icon-container-item-icon' />
        </div>
        <div className='icon-container-item stop-icon'>
          <img src={StopIcon} alt='' className='icon-container-item-icon' onClick={stopHandle} />
        </div>
        <div className='icon-container-item'>
          <img src={VolumeIcon} alt='' className='icon-container-item-icon' />
        </div>
      </div>
      <canvas id='canvas' ref={canvasRef}></canvas>
    </div>
  );
};

export default OpenAIConnHeygen;
