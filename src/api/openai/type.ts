export interface HeygenTokenResult {
  token: string;
  error: string;
}

export interface HeygengQuotaResult {
  remaining_quota: number;
  // data: {
  //   data: {
  //   };
  // };
  error: string;
}

export interface HeygenSessionListResult {
  // code: number;
  // data: {
  sessions: HeygengSessionItem[];
  // };
  // message: string;
}

export interface HeygengSessionItem {
  session_id: string;
  created_at: string;
  api_key_type: string;
  status: string;
}
