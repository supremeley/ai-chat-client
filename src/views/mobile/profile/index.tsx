import './index.scss';
import HomeForYour from '@/assets/images/mobile/profile-posts.png';
import HomeFollow from '@/assets/images/mobile/profile-agents.png';
import HomeLikes from '@/assets/images/mobile/profile-likes.png';
import HomeHeader from '@/assets/images/mobile/profile-header.png';
// import Motification from '@/assets/images/mobile/notification.png';
// import Search from '@/assets/images/mobile/search.png';
import Navigation from '../components/navigation';
// import Title from '@/assets/images/mobile/title.png';

const Profile = () => {
  const [current, setCurrent] = useState('Posts');

  const pageList = [
    {
      title: 'Posts',
      img: HomeForYour,
    },
    {
      title: 'Agents',
      img: HomeFollow,
    },
    {
      title: 'Likes',
      img: HomeLikes,
    },
  ];

  const navigate = useNavigate();

  const jumpToDetail = () => {
    navigate('/mobile/chat-detail');
  };

  const pageBg = (): string => {
    return pageList.find((item) => item.title === current)!.img;
  };

  return (
    <div className='profile'>
      <div className='header'>
        <img src={HomeHeader} alt='' className='header-bg' />

        <nav className='header-nav'>
          {pageList.map((item) => {
            return (
              <span
                key={item.title}
                className={classNames('header-nav-item', { active: current === item.title })}
                onClick={() => setCurrent(item.title)}
              >
                {item.title}
              </span>
            );
          })}

          {/* <span className='header-nav-item'>Following</span> */}
        </nav>
        {/* <img src={Search} alt='' className='header-icon' /> */}
      </div>
      {/* <div className='title'>
        <img src={Title} alt='' className='title-bg' />
      </div> */}
      <img src={pageBg()} className='bg' />
      <span className='bg-cover' onClick={jumpToDetail}></span>
      <Navigation />
    </div>
  );
};

export default Profile;
