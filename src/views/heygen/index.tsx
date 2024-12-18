import './index.scss';

import { Button } from '@arco-design/web-react';
import StreamingAvatar, {
  AvatarQuality,
  StreamingEvents,
  // TaskMode,
  // TaskType,
  VoiceEmotion,
} from '@heygen/streaming-avatar';

// import type { LoginParams } from '@/api/auth/interface';
import { getHeygenToken } from '@/api/heygen';
// import Logo from '@/assets/logo.jpg';
// import { ResultEnum } from '@/enums';
// import { useAuth } from '@/hooks';

// const { Row, Col } = Grid;
// const FormItem = Form.Item;
// const InputPassword = Input.Password;

const Heygen = () => {
  // const navigate = useNavigate();
  // const routerContext = useInRouterContext();
  // const authHook = useAuth();
  // const [loading, setLoading] = useState(false);
  // const formRef = useRef<FormInstance<LoginParams>>(null);

  const avatar = useRef<StreamingAvatar | null>(null);
  const [stream, setStream] = useState<MediaStream>();

  const [token, setToken] = useState<string>('');

  const [isLoadingSession, setIsLoadingSession] = useState(false);
  // const [isLoadingRepeat, setIsLoadingRepeat] = useState(false);
  const [isUserTalking, setIsUserTalking] = useState(false);
  const [debug, setDebug] = useState<string>();

  // const [text, setText] = useState<string>('');
  const mediaStream = useRef<HTMLVideoElement>(null);
  const [chatMode, setChatMode] = useState('text_mode');
  // const [data, setData] = useState<StartAvatarResponse>();

  useEffect(() => {
    fetchData();

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

  const fetchData = async () => {
    const res = 'NzA4NTFhMmEzODU4NDYzN2E4NWNhYTdmYmNlYjY2MTktMTczMzg5MDU3MA==';

    const { data } = await getHeygenToken(res);
    console.log('data', data);

    if (!data.error && data.token) {
      setToken(data.token);
    }
  };

  // async function handleSpeak() {
  //   setIsLoadingRepeat(true);
  //   if (!avatar.current) {
  //     setDebug('Avatar API not initialized');

  //     return;
  //   }
  //   // speak({ text: text, task_type: TaskType.REPEAT })
  //   await avatar.current.speak({ text: text, taskType: TaskType.REPEAT, taskMode: TaskMode.SYNC }).catch((e) => {
  //     setDebug(e.message);
  //   });

  //   setIsLoadingRepeat(false);
  // }

  // async function handleInterrupt() {
  //   if (!avatar.current) {
  //     setDebug('Avatar API not initialized');

  //     return;
  //   }
  //   await avatar.current.interrupt().catch((e) => {
  //     setDebug(e.message);
  //   });
  // }

  // async function fetchAccessToken() {
  //   try {
  //     const response = await fetch('/api/get-access-token', {
  //       method: 'POST',
  //     });
  //     const token = await response.text();

  //     console.log('Access Token:', token); // Log the token to verify

  //     return token;
  //   } catch (error) {
  //     console.error('Error fetching access token:', error);
  //   }

  //   return '';
  // }

  async function endSession() {
    await avatar.current?.stopAvatar();
    setStream(undefined);
  }

  async function startSession() {
    setIsLoadingSession(true);
    // const newToken = await fetchAccessToken();

    const newToken = token;
    console.log('newToken', newToken);
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
        quality: AvatarQuality.High,
        avatarName: 'Wayne_20240711',
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
    <div className='login'>
      {isLoadingSession}
      {isUserTalking}
      {debug}
      {chatMode}
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
      <Button className='bg-gradient-to-tr from-indigo-500 to-indigo-300 w-full text-white' onClick={startListening}>
        Listening
      </Button>
    </div>
  );
};

export default Heygen;
