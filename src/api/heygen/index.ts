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
  heygenToken = 'https://api.heygen.com/v1/streaming.create_token',
}

export const getHeygenToken = () => {
  return useHeygenAxios.post<HeygenSuccessResponse<HeygenTokenResult>>({
    url: Api.heygenToken,
    headers: { 'x-api-key': 'ZDNjMDhmMGFkZmQ2NDEzZmE3OWIzY2MyYWU3ZjIwZTktMTczMTgyODU1Ng==' },
  });
};
