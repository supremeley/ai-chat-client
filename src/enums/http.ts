/**
 * @description: Request result set
 */
export enum ResultEnum {
  HEYGEN_SUCCESS = 100,
  SUCCESS = 200,
  FAIL = 500,
  TIMEOUT = 401,
}

export type ResultCode = typeof ResultEnum;

/**
 * @description: request method
 */
export enum RequestEnum {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

/**
 * @description: contentType
 */
export enum ContentTypeEnum {
  // json
  JSON = 'application/json;charset=UTF-8',
  // form-data qs
  FORM_URLENCODED = 'application/x-www-form-urlencoded;charset=UTF-8',
  // form-data  upload
  FORM_DATA = 'multipart/form-data;charset=UTF-8',
}

export enum ResponseType {
  Blob = 'blob',
}
