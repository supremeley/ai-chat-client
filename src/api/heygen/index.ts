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
  return useHeygenAxios.post<HeygenSuccessResponse<HeygenTokenResult>>(
    {
      url: Api.heygenToken,
      headers: { 'x-api-key': 'MzBjM2I0MThkMTBkNGIyMmE4ZDQ0YjE0YzZkYzU4ZjktMTczMzg4ODcyOQ==' },
    },
    { needToken: false },
  );
};
