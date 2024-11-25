import { Message } from '@arco-design/web-react';
// import { useState } from 'react';
import { useDispatch } from 'react-redux';

import { auth as authApi } from '@/api';
import type { LoginParams } from '@/api/auth/interface';
import type { User } from '@/api/user/interface';
import { ResultEnum } from '@/enums';
import { useAppSelector } from '@/hooks';
import { store } from '@/store';
import { setToken, setUserinfo } from '@/store/auth';
import { setMenu, setRoutes, setRouteTagList } from '@/store/sys';
import { transfrom2Menu, transfrom2Route } from '@/utils';

export const useAuth = (): {
  login: (params: LoginParams) => Promise<User | void>;
  logout: () => void;
  loadPermission: () => Promise<RouteWithMetaObject[]>;
} => {
  // const navigate = useNavigate();
  const dispatch = useDispatch();
  // const [auth, setAuth] = useState<Auth | null>(null);
  // const [loading, setLoading] = useState(false);
  const sys = useAppSelector((state) => state.sys);

  const login = async (params: LoginParams): Promise<User | void> => {
    // setLoading(true);

    try {
      const { code, result, message } = await authApi.login(params);

      if (code === ResultEnum.SUCCESS) {
        const { token, userinfo } = result;
        // setAuth(result);
        dispatch(setUserinfo(userinfo));
        dispatch(setToken(token));
        // await loadPermission();
        // setLoading(false);

        return userinfo;
      } else {
        // setLoading(false);
        Message.error(message);
      }
    } catch (err) {
      // setLoading(false);

      // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
      return Promise.reject(err);
    }
  };

  const logout = () => {
    store.dispatch(setUserinfo(null));
    store.dispatch(setToken(null));
    store.dispatch(setMenu([]));
    store.dispatch(setRoutes([]));
    store.dispatch(setRouteTagList([]));

    // navigate('/login', { replace: true });
  };

  const loadPermission = async () => {
    if (!sys.routes.length) {
      try {
        const { code, result, message } = await authApi.getPermissiom();
        if (code === ResultEnum.SUCCESS) {
          dispatch(setRoutes(transfrom2Route(result)));
          dispatch(setMenu(transfrom2Menu(result)));
        } else {
          Message.error(message);
        }
      } catch (_) {
        // setLoading(false);
      }
    }

    return sys.routes;
  };

  return { login, logout, loadPermission };
};
