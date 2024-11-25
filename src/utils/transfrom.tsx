// import { createElement } from 'react';
import type { PremissionList } from '@/api/auth/interface';
// import LazyLoadComponent from '@/components/LazyLoadComponent';
import type { MenuItem } from '@/store/sys/interface';
import NotFound from '@/views/notFound';

export const transfrom2Menu = (routes: PremissionList, path = ''): MenuItem[] => {
  if (!routes?.length) return [];

  return routes.reduce((list, route) => {
    if (route.hidden) return list;

    const url = path + '/' + route.path;

    // if (route.params) {
    //   url = url + '?' + qs.stringify(route.params);
    // }

    const menuItem: MenuItem = {
      path: url,
      name: route.name ?? route.id,
      title: route.title ?? route.name ?? route.id,
      icon: route.icon,
    };

    if (route.children?.length) {
      const children = transfrom2Menu(route.children, url);
      menuItem.children = children;
    }

    list.push(menuItem);

    return list;
  }, [] as MenuItem[]);
};

export const transfrom2Route = (routes: PremissionList): RouteWithMetaObject[] => {
  if (!routes?.length) return [];

  // const modules = import.meta.glob('@/views/**/*.tsx');

  // const componentModule = (path: string) => modules[`/src/views/${path}.tsx`];
  // const p = `../views/${path}.tsx`

  // const componentModule = (path: string) => () => import(`../views/${path}.tsx`);

  // console.log('componentModule', componentModule);
  return routes.reduce((list, route) => {
    // if (route.hidden) return list;

    const url = route.path;
    // TODO:
    // const c = await componentModule(route.component);
    // console.log('componentModule', componentModule);
    // const element = route.component ? createElement(lazy(componentModule(route.component))) : <Outlet />;
    // const element = route.component ? createElement(lazy(() => import(`@/views/system/user/index.tsx`))) : <Outlet />;

    const element = route.component ? routerMapping(route.component) : <Outlet />;

    const r: RouteWithMetaObject = {
      element,
      path: url,
      icon: route.icon,
      id: route.name ?? route.title ?? route.id,
      title: route.title ?? route.name ?? route.id,
    };

    if (route.children?.length) {
      const children = transfrom2Route(route.children);
      r.children = children;
    }

    list.push(r);

    return list;
  }, [] as RouteWithMetaObject[]);
};

const routerMapping = (path: string): JSX.Element => {
  switch (path) {
    default:
      return <NotFound />;
  }
};
