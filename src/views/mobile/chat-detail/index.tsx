import './index.scss';
// import Chatbg from '@/assets/images/mobile/chat.png';

import ChatDetailBg from '@/assets/images/mobile/chat-detail.png';
// import Navigation from '../components/navigation';
// import Title from '@/assets/images/mobile/title.png';

const ChatDetail = () => {
  // const [current, setCurrent] = useState('For you');

  // const pageList = [
  //   {
  //     title: 'For you',
  //     img: HomeForYour,
  //   },
  //   {
  //     title: 'Following',
  //     img: HomeFollow,
  //   },
  // ];

  // const pageBg = (): string => {
  //   return pageList.find((item) => item.title === current)!.img;
  // };

  const navigate = useNavigate();

  const jumpToVideo = () => {
    navigate('/mobile/chat-video');
  };

  const jumpToAudio = () => {
    navigate('/mobile/chat-audio');
  };

  return (
    <div className='detail'>
      <img src={ChatDetailBg} className='bg' />
      <div className='detail-video' onClick={jumpToVideo}></div>
      <div className='detail-audio' onClick={jumpToAudio}></div>
      {/* <Navigation /> */}
    </div>
  );
};

export default ChatDetail;
