import { User } from '@/api/user/interface';

export interface AuthState {
  userinfo: Userinfo | null;
  token: string | null;
}

type Userinfo = User;
