import { createHashRouter, Outlet } from 'react-router-dom';

import LazyLoadComponent from '@/components/LazyLoadComponent';

import { ErrorList } from './modules/errorList';
import { WhiteList } from './modules/whiteList';

export const whiteList: RouteWithMetaObject[] = [];
export const errorList: RouteWithMetaObject[] = [];

export const createRouter = (
  dynamicRoutes: RouteWithMetaObject[],
  beforeEachHook?: () => boolean | null | Promise<null | boolean>,
) => {
  const rootRoute: RouteWithMetaObject = {
    id: 'Root',
    path: '',
    element: <Outlet />,
    children: [
      {
        element: LazyLoadComponent(lazy(() => import('@/layout/index'))),
        children: [...dynamicRoutes],
      },
      ...ErrorList,
    ],
    loader: beforeEachHook,
  };

  return createHashRouter([...WhiteList, rootRoute]);
};
