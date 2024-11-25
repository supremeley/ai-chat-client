import { useAxios } from '@/hooks';

import type { ChangePasswordParams, LoginParams, LoginResponse, PremissionResult } from './interface';

enum Api {
  Login = '/auth/login',
  Permission = '/auth/permission',
  ChangePassword = '/auth/changePassword',
  Captcha = '/auth/captcha',
}

export const login = (params: LoginParams) => {
  return useAxios.post<SuccessResponse<LoginResponse>>({ url: Api.Login, data: params }, { needToken: false });
};

export const getPermissiom = () => {
  return useAxios.get<SuccessResponse<PremissionResult>>({ url: Api.Permission });
};

export const changePassword = (params: ChangePasswordParams) => {
  return useAxios.post<SuccessResponse>({ url: Api.ChangePassword, data: params });
};

export const getCaptcha = () => {
  return useAxios.get<SuccessResponse<string>>({ url: Api.Captcha });
};
