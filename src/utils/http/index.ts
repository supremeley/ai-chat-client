import { Message } from '@arco-design/web-react';
import type {
  AxiosError,
  AxiosInstance,
  AxiosProgressEvent,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import axios from 'axios';
import qs from 'qs';

import { ContentTypeEnum, RequestEnum, ResponseType, ResultEnum } from '@/enums';
import type { RootStore } from '@/store';
import { cleanUser } from '@/store/auth';

let store: unknown;

export const injectStore = (_store: unknown) => {
  store = _store;
};

export class AxiosRequest {
  private axiosInstance: AxiosInstance;
  private readonly options: CreateAxiosOptions;

  constructor(options: CreateAxiosOptions) {
    this.options = options;
    this.axiosInstance = axios.create(options);
    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.axiosInstance.interceptors.request.use(
      (config) => {
        config = this.requestInterceptors(config, this.options);

        return config;
      },
      (error) => {
        // TODO: Add request error hook

        return Promise.reject(error);
      },
    );

    this.axiosInstance.interceptors.response.use(
      (res: AxiosResponse<SuccessResponse>) => {
        console.log('response success', res);
        const { data, config } = res;
        const { code, message, data: result } = data;

        const isSuccess = code === ResultEnum.SUCCESS || result;
        // const isEtcAppRequest = this.options.requestOptions?.isEtcAppRequest;

        if (config.responseType === ResponseType.Blob) {
          return res;
        }

        if (isSuccess) {
          return res;
        } else {
          if (message) {
            return Promise.reject({ code, message });
          }

          return Promise.reject({
            message: '请求异常:' + JSON.stringify({ url: config.url, code, message }) || 'Error',
          });
        }
      },
      (error: AxiosError<ResponseData, SuccessResponse>) => {
        console.log('response error', error);
        const { config, response } = error;

        const { data, status } = response as AxiosResponse<ResponseData>;

        let msg;
        let statusCode;

        if (data && status) {
          const { code, message } = data;

          msg = message || '请求异常:' + JSON.stringify({ url: config?.url, code, message });
          statusCode = config!.responseType === ResponseType.Blob ? status : code;
        } else {
          msg = error.message || '请求异常:' + JSON.stringify(error);
          statusCode = error.code;
        }

        // TODO: Add response error hook

        // const statusCode = config!.responseType === ResponseType.Blob ? status : code;

        return Promise.reject({
          code: statusCode,
          message: msg,
        });
      },
    );
  }

  supportFormData(config: CreateAxiosOptions) {
    const headers = config.headers ?? this.options.headers;
    const contentType = (headers?.['Content-Type'] ?? headers?.['content-type']) as ContentTypeEnum;

    if (
      contentType !== ContentTypeEnum.FORM_URLENCODED ||
      !Reflect.has(config, 'data') ||
      config.method?.toUpperCase() === RequestEnum.GET
    ) {
      return config;
    }

    return {
      ...config,
      data: qs.stringify(config.data, { arrayFormat: 'brackets' }),
    };
  }

  requestInterceptors(config: InternalAxiosRequestConfig, options: CreateAxiosOptions) {
    const nHeaders = config.headers;

    const needToken = (config as CreateAxiosOptions).requestOptions!.needToken ?? options.requestOptions;

    if (needToken) {
      const auth = (store as RootStore).getState().auth;

      nHeaders.Authorization = auth.token;
    }

    const params = config.params || {};
    const data = config.data || {};

    Object.assign({}, config.params, config.data);

    if (config.method?.toUpperCase() === RequestEnum.GET) {
      config.data = undefined;
    }

    if (config.method?.toUpperCase() === RequestEnum.POST || config.method?.toUpperCase() === RequestEnum.PUT) {
      config.data = Object.assign(data, params);
      config.params = params;
    }

    config.headers = nHeaders;

    return config;
  }

  handleNotify = ({ code, message }: { code: number; message: string }) => {
    // TODO:
    console.log('handleNotify', code, message);

    switch (code) {
      case 401:
      case 511:
      case 512:
        Message.error({
          content: '登录信息失效，请重新登录',
          duration: 500,
          onClose: () => {
            (store as RootStore).dispatch(cleanUser());

            // TODO:
            const hash = encodeURIComponent(window.location.hash);

            window.location.href = `#/login/${hash}`;
          },
        });
        break;
      default:
        Message.error({
          content: message,
        });
        break;
    }
  };

  get<T = unknown>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T> {
    return this.request(
      {
        ...config,
        method: 'GET',
        paramsSerializer: (params) => {
          return qs.stringify(params, { arrayFormat: 'repeat' });
        },
      },
      options,
    );
  }

  post<T = unknown>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T> {
    return this.request({ ...config, method: 'POST' }, options);
  }

  put<T = unknown>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T> {
    return this.request({ ...config, method: 'PUT' }, options);
  }

  delete<T = unknown>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T> {
    return this.request({ ...config, method: 'DELETE' }, options);
  }

  request<T = unknown>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T> {
    let conf: CreateAxiosOptions = config;

    const { requestOptions } = this.options;

    const opt: RequestOptions = Object.assign({}, requestOptions, options);

    conf.requestOptions = opt;

    conf = this.supportFormData(conf);

    return new Promise((resolve, reject) => {
      this.axiosInstance
        .request<unknown, AxiosResponse<SuccessResponse>>(conf)
        .then((res: AxiosResponse<SuccessResponse>) => {
          const { data } = res;

          resolve(data as unknown as Promise<T>);
        })
        .catch((error: ResponseData) => {
          console.log(error);

          const needNotify = opt.needNotify!;

          if (needNotify) {
            this.handleNotify(error);
          }

          reject(error);
        });
    });
  }

  uploadFile<T = unknown>(
    config: AxiosRequestConfig,
    params: UploadFileParams,
    onProgress?: (progressEvent: AxiosProgressEvent) => void,
  ): Promise<T> {
    const formData = new FormData();

    formData.append('file', params.file);

    return this.request({
      ...config,
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': ContentTypeEnum.FORM_DATA,
      },
      onUploadProgress: onProgress,
    });
  }
}
