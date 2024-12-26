import './index.scss';
import Home from '@/assets/images/mobile/navigation/home.png';
import Explore from '@/assets/images/mobile/navigation/explore.png';
import Syaverse from '@/assets/images/mobile/navigation/syaverse.png';
import Chat from '@/assets/images/mobile/navigation/chat.png';
import Profile from '@/assets/images/mobile/navigation/profile.png';
import ActiveHome from '@/assets/images/mobile/navigation/active-home.png';
import ActiveExplore from '@/assets/images/mobile/navigation/active-explore.png';
// import ActiveSyaverse from '@/assets/images/mobile/navigation/active-syaverse.png';
import ActiveChat from '@/assets/images/mobile/navigation/active-chat.png';
import ActiveProfile from '@/assets/images/mobile/navigation/active-profile.png';
import { setCurPage } from '@/store/sys';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '@/hooks/useStore';

interface Page {
  name: string;
  path: string;
  icon: string;
  activeIcon: string;
}

const Navigation = () => {
  // const [current, setCurrent] = useState('Home');

  const navigationList: Page[] = [
    {
      name: 'Home',
      path: '/mobile/home',
      icon: Home,
      activeIcon: ActiveHome,
    },
    {
      name: 'Explore',
      path: '/mobile/explore',
      icon: Explore,
      activeIcon: ActiveExplore,
    },
    {
      name: 'Syaverse',
      path: '/mobile/syaverse',
      icon: Syaverse,
      activeIcon: Syaverse,
    },
    {
      name: 'Chat',
      path: '/mobile/chat-list',
      icon: Chat,
      activeIcon: ActiveChat,
    },
    {
      name: 'Profile',
      path: '/mobile/profile',
      icon: Profile,
      activeIcon: ActiveProfile,
    },
  ];

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const sys = useAppSelector((state) => state.sys);

  const switchPage = (page: Page) => {
    dispatch(setCurPage(page.name));
    navigate(page.path);
  };

  return (
    <nav className='navigation flex'>
      {navigationList.map((item) => {
        return (
          <div
            key={item.name}
            className={classNames('navigation-item', {
              active: sys.curPage === item.name,
              center: item.name === 'Syaverse',
            })}
            onClick={() => switchPage(item)}
          >
            <img
              src={sys.curPage === item.name ? item.activeIcon : item.icon}
              alt={item.name}
              className='navigation-item-icon'
            />
            {item.name === 'Syaverse' && sys.curPage === item.name && <span className='cover'></span>}
            <span>{item.name}</span>
          </div>
        );
      })}
    </nav>
  );
};

export default Navigation;
