import NotFound from '@/views/notFound';

export const ErrorList: RouteWithMetaObject[] = [
  {
    id: 'NotFound',
    path: '/*',
    element: <NotFound />,
    title: 'not found',
  },
];
