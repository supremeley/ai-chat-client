import type { AxiosProgressEvent } from 'axios';

import { ResponseType } from '@/enums';
import { useAxios } from '@/hooks';

import type { DownloadFileParams } from './interface';

enum Api {
  FileUpload = '/file/upload',
  ExportReport = '/file/report',
  ExportExcel = '/file/excel',
}

export const fileUpload = (params: UploadFileParams, onProgress: (progressEvent: AxiosProgressEvent) => void) => {
  return useAxios.uploadFile<SuccessResponse<UploadFileResult>>({ url: Api.FileUpload }, params, onProgress);
};

export const exportReport = (params: DownloadFileParams) => {
  return useAxios.get<Blob>({ url: Api.ExportReport, params, responseType: ResponseType.Blob });
};

export const exportExcel = (params: DownloadFileParams) => {
  return useAxios.get<Blob>({ url: Api.ExportExcel, params, responseType: ResponseType.Blob });
};
