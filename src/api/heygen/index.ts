import { AxiosRequest } from '@/utils';

import type { HeygenTokenResult } from './type';

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
