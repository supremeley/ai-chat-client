import './index.scss';
import Chatbg from '@/assets/images/mobile/chat.png';

// import Motification from '@/assets/images/mobile/notification.png';
// import Search from '@/assets/images/mobile/search.png';
import Navigation from '../components/navigation';
// import Title from '@/assets/images/mobile/title.png';

const ChatList = () => {
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

  return (
    <div className='container'>
      <img src={Chatbg} className='bg' />
      <Navigation />
    </div>
  );
};

export default ChatList;
