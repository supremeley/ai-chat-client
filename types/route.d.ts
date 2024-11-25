import { RouteObject } from 'react-router-dom';

declare global {
  interface RouteMetaObject {
    title: string;
    icon: string;
    hidden: boolean;
    needLazyLoad: boolean;
    needLogin: boolean;
    keepAlive: boolean;
  }

  type RouteWithMetaObject = RouteObject & {
    element: RouteObject['element'] | React.LazyExoticComponent<() => JSX.Element>;
    // meta?: Partial<RouteMetaObject>;
    children?: RouteWithMetaObject[];
  } & Partial<RouteMetaObject>;
}
