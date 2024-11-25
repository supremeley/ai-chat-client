import { Spin } from '@arco-design/web-react';
import { Suspense } from 'react';

const LazyLoadComponent = (Comp: React.LazyExoticComponent<() => JSX.Element>): React.ReactNode => {
  return (
    <Suspense fallback={<Spin block size={60} tip='加载中' className='w-100vw h-100vh flex-center'></Spin>}>
      <Comp />
    </Suspense>
  );
};

export default LazyLoadComponent;
