import { Navigate } from 'react-router-dom';

// import Heygen from '@/views/heygen';
// import Login from '@/views/login';
import Openai from '@/views/openai';
import MobileHome from '@/views/mobile/home';
import MobileExplore from '@/views/mobile/explore';
import MobileChat from '@/views/mobile/chat-list';
import MobileProfile from '@/views/mobile/profile';
import MobileSyaverse from '@/views/mobile/syaverse';
import MobileChatDetail from '@/views/mobile/chat-detail';
import MobileChatVideo from '@/views/mobile/chat-video';
import HeygenSessionList from '@/views/heygen/session-list';

export const WhiteList: RouteWithMetaObject[] = [
  {
    id: 'Home',
    path: '/',
    element: <Navigate to='realtime' />,
    title: '首页',
    hidden: true,
  },
  // {
  //   id: 'Login',
  //   path: 'login/*?',
  //   element: <Login />,
  //   title: '登录',
  // },
  // {
  //   id: 'Heygen',
  //   path: '/heygen',
  //   element: <Heygen />,
  //   title: 'Heygen',
  // },
  {
    id: 'Openai',
    path: '/realtime',
    element: <Openai />,
    title: 'Heygen',
  },
  {
    id: 'MobileHome',
    path: '/mobile/home',
    element: <MobileHome />,
    title: 'MobileHome',
  },
  {
    id: 'MobileExplore',
    path: '/mobile/explore',
    element: <MobileExplore />,
    title: 'MobileExplore',
  },
  {
    id: 'MobileChat',
    path: '/mobile/chat-list',
    element: <MobileChat />,
    title: 'MobileChat',
  },
  {
    id: 'MobileProfile',
    path: '/mobile/profile',
    element: <MobileProfile />,
    title: 'MobileProfile',
  },
  {
    id: 'MobileSyaverse',
    path: '/mobile/syaverse',
    element: <MobileSyaverse />,
    title: 'MobileSyaverse',
  },
  {
    id: 'MobileChatDetail',
    path: '/mobile/chat-detail',
    element: <MobileChatDetail />,
    title: 'MobileChatDetail',
  },
  {
    id: 'MobileChatVideo',
    path: '/mobile/chat-video',
    element: <MobileChatVideo />,
    title: 'MobileChatVideo',
  },
  {
    id: 'HeygenSessionList',
    path: '/heygen/session-list',
    element: <HeygenSessionList />,
    title: 'HeygenSessionList',
  },
];
