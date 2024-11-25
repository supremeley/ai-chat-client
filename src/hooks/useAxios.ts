import { AxiosRequest } from '@/utils';

export const createAxios = (opt?: CreateAxiosOptions) => {
  return new AxiosRequest({
    baseURL: import.meta.env.VITE_APP_GLOBAL_API_URL,
    requestOptions: {
      needToken: true,
      needNotify: true,
    },
    ...opt,
  });
};

export const useAxios = createAxios();
