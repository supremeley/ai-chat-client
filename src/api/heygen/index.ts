import { AxiosRequest } from '@/utils';

import type { HeygengQuotaResult, HeygenSessionListResult, HeygenTokenResult } from './type';

export const createHeygenAxios = (opt?: CreateAxiosOptions) => {
  return new AxiosRequest({
    baseURL: '',
    requestOptions: {
      needToken: false,
      needNotify: false,
      isEtcAppRequest: true,
    },
    ...opt,
  });
};

export const useHeygenAxios = createHeygenAxios();

enum Api {
  GetHeygenSessionToken = 'https://api.heygen.com/v1/streaming.create_token',
  GetHeygenRemainingQuota = 'https://api.heygen.com/v2/user/remaining_quota',
  GetHeygenSessionList = 'https://api.heygen.com/v1/streaming.list',
  CloseHeygenSession = 'https://api.heygen.com/v1/streaming.stop',
}

export const getHeygenToken = (key: string) => {
  return useHeygenAxios.post<HeygenSuccessResponse<HeygenTokenResult>>(
    {
      url: Api.GetHeygenSessionToken,
      headers: { 'x-api-key': key },
    },
    { needToken: false },
  );
};

export const getHeygenRemainingQuota = (key: string) => {
  return useHeygenAxios.get<HeygenSuccessResponse<HeygengQuotaResult>>(
    {
      url: Api.GetHeygenRemainingQuota,
      headers: { 'x-api-key': key },
    },
    { needToken: false },
  );
};

export const getHeygenSessionList = (key: string) => {
  return useHeygenAxios.get<HeygenSuccessResponse<HeygenSessionListResult>>(
    {
      url: Api.GetHeygenSessionList,
      headers: { 'x-api-key': key },
    },
    { needToken: false },
  );
};

export const closeHeygenSession = (key: string, data: { session_id: string }) => {
  return useHeygenAxios.post<HeygenSuccessResponse<HeygenTokenResult>>(
    {
      url: Api.CloseHeygenSession,
      headers: { 'x-api-key': key },
      data,
    },
    { needToken: false },
  );
};
