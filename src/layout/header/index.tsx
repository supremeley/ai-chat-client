import './index.scss';

import { Breadcrumb, Dropdown, Menu, Message, Tag } from '@arco-design/web-react';
import { matchRoutes } from 'react-router-dom';

import { useAppSelector, useAuth } from '@/hooks';
import type { RouteTagItem } from '@/store/sys/interface';

const LayoutHeader = ({ collapse, onSwitchCollapse }: { collapse: boolean; onSwitchCollapse: () => void }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const sys = useAppSelector((state) => state.sys);
  const breadcrumbRoutes = matchRoutes(sys.routes, location.pathname);

  const [tagList, setTagList] = useState<RouteTagItem[]>(sys.routeTagList);

  useEffect(() => {
    let flag = false;
    const res: RouteTagItem[] = tagList.map((item) => {
      if (!breadcrumbRoutes) return item;
      if (item.name === breadcrumbRoutes[breadcrumbRoutes?.length - 1].route.id) {
        flag = true;
        return {
          ...item,
          active: true,
        };
      }
      return {
        ...item,
        active: false,
      };
    });

    if (!flag && breadcrumbRoutes) {
      const curRoute = breadcrumbRoutes[breadcrumbRoutes?.length - 1];

      res.push({
        name: curRoute.route.id!,
        title: curRoute.route?.title!,
        path: curRoute.pathname,
        active: true,
      });
    }

    setTagList(res);
  }, [location]);

  const handleRoutePage = (r: RouteTagItem) => {
    navigate(r.path);
  };

  const authHook = useAuth();

  const auth = useAppSelector((state) => state.auth);

  const { userinfo } = auth;

  // const jumpToSetting = () => {
  //   navigate(`/user/setting`);
  // };

  const handleLogout = () => {
    authHook.logout();

    Message.success('退出成功');

    navigate(`/login`, { replace: true });
  };

  const dropList = (
    <Menu>
      {/* <Menu.Item key='1' onClick={jumpToSetting}>
        个人中心
      </Menu.Item> */}
      <Menu.Item key='2' onClick={handleLogout}>
        退出登录
      </Menu.Item>
    </Menu>
  );

  return (
    <section className='header'>
      <div className='pt-2 pb-2 pr-4 flex justify-between items-center'>
        <div onClick={onSwitchCollapse} className='cursor-pointer'>
          <div
            className={collapse ? 'i-tabler:layout-sidebar-left-expand' : 'i-tabler:layout-sidebar-left-collapse'}
          ></div>
        </div>

        <Breadcrumb className='flex-1'>
          {breadcrumbRoutes?.map((r) => <Breadcrumb.Item key={r.route.id}>{r.route?.title}</Breadcrumb.Item>)}
        </Breadcrumb>

        <Dropdown droplist={dropList} position='bl'>
          <div className='flex items-center cursor-pointer'>
            {/* <Avatar size={40}>
              <img src={userinfo?.avatar} />
            </Avatar> */}
            <span className='header-user'>欢迎您，{userinfo?.username}</span>
            <div className='i-ic:baseline-expand-more'></div>
          </div>
        </Dropdown>
      </div>

      <div className='pt-2 pb-4'>
        {tagList.map((r) => (
          <Tag
            key={r.name}
            closable={r.name !== 'home'}
            className={['header-tag', r.active && 'header-tag-active'].join(' ')}
            onClick={() => handleRoutePage(r)}
          >
            {r.title}
          </Tag>
        ))}
      </div>
    </section>
  );
};

export default LayoutHeader;
