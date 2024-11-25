export { ExcelTagEnum } from '@/enums';
export interface DownloadFileParams {
  examId?: number;
  userId?: number;
  tag: ExcelTagEnum;
}
