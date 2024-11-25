import { Menu } from '@/api/system/interface';
import { User } from '@/api/user/interface';

export interface LoginParams {
  username: string;
  password: string;
}

export interface ChangePasswordParams {
  oriPassword: string;
  newPassword: string;
}

export interface Auth {
  token: string;
  userinfo: Userinfo;
}

type Userinfo = User;

export type LoginResponse = Auth;

export interface Premission {
  id: number;
  name: string;
  type: MenuTypeEnum;
  path: string;
  status: StatusEnum.Enable;
  redirect?: string;
  component?: string;
  parent_id?: number;
  title?: string;
  icon?: string;
  hidden?: boolean;
  children?: Menu[];
}

export type PremissionList = Premission[];

export type PremissionResult = PremissionList;
