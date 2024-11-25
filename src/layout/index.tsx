import './index.scss';

import { Layout } from '@arco-design/web-react';

import Logo from '@/assets/logo.jpg';

import AppContent from './content';
import AppHeader from './header';
import AppMenu from './menu';

const { Sider, Header, Content } = Layout;

const AppLayout = () => {
  const [collapse, setCollapse] = useState(false);

  const switchCollapse = () => {
    setCollapse(!collapse);
  };

  return (
    <Layout className='layout'>
      <Sider width={240} collapsed={collapse} className='layout-aside'>
        <div className={classNames('layout-aside__header flex', { 'collapse-header': collapse })}>
          <img src={Logo} className='layout-aside__header-logo' />
          {!collapse && '科普也是药'}
        </div>
        <AppMenu collapse={collapse}></AppMenu>
      </Sider>
      <Layout>
        <Header className='layout-header'>
          <AppHeader collapse={collapse} onSwitchCollapse={switchCollapse}></AppHeader>
        </Header>
        <Content className='layout-content'>
          <AppContent></AppContent>
          {/* TODO:
           <Footer className='layout-footer'></Footer> */}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
