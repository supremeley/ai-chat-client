import { AxiosRequest } from '@/utils';

import type { HeygengQuotaResult } from './type';

export const createOpenAiAxios = (opt?: CreateAxiosOptions) => {
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

export const useHeygenAxios = createOpenAiAxios();

enum Api {
  GetOpenaiQuota = 'https://api.openai.com/v1/account',
  // GetOpenaiQuota = 'https://api.openai.com/dashboard/billing/credit_grants',
}

export const GetOpenaiQuota = (key: string) => {
  return useHeygenAxios.get<HeygenSuccessResponse<HeygengQuotaResult>>(
    {
      url: Api.GetOpenaiQuota,
      // params: { date: dayjs().format('YYYY-MM-DD') },
      headers: { Authorization: `Bearer ${key}` },
    },
    { needToken: false },
  );
};
