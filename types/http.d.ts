import type { AxiosRequestConfig } from 'axios';

import { ResultEnum } from '@/enums';

declare global {
  interface CreateAxiosOptions extends AxiosRequestConfig {
    requestOptions?: RequestOptions;
  }

  type RequestOptions = Partial<{
    needToken: boolean;
    needNotify: boolean;
    isEtcAppRequest: boolean;
  }>;

  interface ResponseData {
    message: string;
    code: ResponseCode;
  }

  interface SuccessResponse<T = unknown> extends ResponseData {
    code: Exclude<ResponseCode, ResponseFailCode>;
    result: T;
    data: T;
  }

  interface HeygenResponseData {
    // data: {
    token: string;
    error: string;
    // };
  }

  interface HeygenSuccessResponse<T = unknown> extends HeygenResponseData {
    // error: string;
    data: T;
  }

  interface ListParams {
    page: number;
    limit: number;
  }

  interface UploadFileParams {
    file: File | Blob;
  }

  export interface UploadFileResult {
    path: string;
    name: string;
    id: number;
  }

  interface ListResult<T = unknown> {
    page: number;
    limit: number;
    total: number;
    has_next: boolean;
    list: T[];
  }

  type ResponseFailCode = ResultEnum.FAIL;

  type ResponseSuccessCode = ResultEnum.SUCCESS;

  type ResponseCode = ResultCode;
}
