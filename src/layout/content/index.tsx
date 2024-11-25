import './index.scss';

import { BackTop } from '@arco-design/web-react';
import { Outlet } from 'react-router-dom';

const LayoutContent = () => {
  return (
    <section className='main flex-top-center p-4' id='custom_backtop0'>
      <Outlet />
      <BackTop
        visibleHeight={30}
        style={{ position: 'fixed' }}
        // target={() => document.getElementById('custom_backtop0')}
      />
    </section>
  );
};

export default LayoutContent;
