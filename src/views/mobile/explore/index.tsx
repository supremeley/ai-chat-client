import './index.scss';
import HomeForYour from '@/assets/images/mobile/explore-foryou.png';
import HomeFollow from '@/assets/images/mobile/explore-following.png';
import Motification from '@/assets/images/mobile/notification.png';
import Search from '@/assets/images/mobile/search.png';
import Navigation from '../components/navigation';
// import Title from '@/assets/images/mobile/title.png';

const Explore = () => {
  const [current, setCurrent] = useState('For you');

  const pageList = [
    {
      title: 'For you',
      img: HomeForYour,
    },
    {
      title: 'Following',
      img: HomeFollow,
    },
  ];

  const pageBg = (): string => {
    return pageList.find((item) => item.title === current)!.img;
  };

  return (
    <div className='explore'>
      <div className='header'>
        <img src={Motification} alt='' className='header-icon' />
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
        <img src={Search} alt='' className='header-icon' />
      </div>
      {/* <div className='title'>
        <img src={Title} alt='' className='title-bg' />
      </div> */}
      <img src={pageBg()} className='bg' />
      <Navigation />
    </div>
  );
};

export default Explore;
