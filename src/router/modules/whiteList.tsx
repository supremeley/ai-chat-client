import { Navigate } from 'react-router-dom';

import Heygen from '@/views/heygen';
import HeygenConnOpenai from '@/views/heygenConnOpenai';
import Login from '@/views/login';
import Openai from '@/views/openai';

export const WhiteList: RouteWithMetaObject[] = [
  {
    id: 'Home',
    path: '/',
    element: <Navigate to='openai' />,
    title: '首页',
    hidden: true,
  },
  {
    id: 'Login',
    path: 'login/*?',
    element: <Login />,
    title: '登录',
  },
  {
    id: 'Heygen',
    path: '/heygen',
    element: <Heygen />,
    title: 'Heygen',
  },
  {
    id: 'Openai',
    path: '/openai',
    element: <Openai />,
    title: 'Heygen',
  },
  {
    id: 'HeygenConnOpenai',
    path: '/heygenConnOpenai',
    element: <HeygenConnOpenai />,
    title: 'HeygenConnOpenai',
  },
];
