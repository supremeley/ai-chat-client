import { redirect, RouterProvider } from 'react-router-dom';

import { useAppSelector, useAuth } from '@/hooks';

import { createRouter } from './helper';
// import { WhiteList } from './modules/whiteList';

// const whiteList = WhiteList.map((item) => item.path);

const AppRouter = () => {
  const auth = useAppSelector((state) => state.auth);
  const sys = useAppSelector((state) => state.sys);
  const [permissionRouter, setPermissionRouter] = useState(createRouter(sys.routes));

  useEffect(() => {
    // console.log('Router sys.routes', sys.routes);

    // if (sys.routes.length) {
    // @ts-expect-error TODO:
    const routes = createRouter(sys.routes, beforeEachHook);

    setPermissionRouter(routes);
    // }
  }, [sys.routes]);

  // useEffect(() => {
  //   console.log('Router permissionRouter111', permissionRouter);
  //   // redirect('/system/user/list');
  //   // navigate('/system/user/list', { replace: true });
  // }, [permissionRouter]);

  const authHook = useAuth();

  const beforeEachHook = async () => {
    // console.log('Router beforeEachHook');

    // TODO: 白名单不需要获取权限
    // console.log('Router beforeEachHook sys.routes', sys.routes);

    if (!window.location.href.includes('login') && !sys.routes.length) {
      await authHook.loadPermission();
    }

    // console.log('Router beforeEachHook auth', auth);

    if (!auth.token) {
      return redirect('/login');
    }

    return null;
  };

  console.log('Router permissionRouter', permissionRouter);

  return <RouterProvider router={permissionRouter} />;
};

export default AppRouter;
