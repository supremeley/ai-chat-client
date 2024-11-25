export interface MenuItem {
  title: string;
  name: string;
  path?: string;
  icon?: string;
  hidden?: boolean;
  children?: MenuItem[];
}

export interface RouteTagItem {
  title: string;
  path: string;
  name: string;
  active?: boolean;
}

export interface SySState {
  menu: MenuItem[] | [];
  routes: RouteWithMetaObject[] | [];
  routeTagList: RouteTagItem[];
}
