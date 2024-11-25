import './index.scss';

import { Menu } from '@arco-design/web-react';
import { matchRoutes } from 'react-router-dom';

import { useAppSelector } from '@/hooks';
import type { MenuItem } from '@/store/sys/interface';

const { Item, SubMenu } = Menu;

const LayoutMenu = ({ collapse }: { collapse: boolean }) => {
  const location = useLocation();
  const sys = useAppSelector((state) => state.sys);
  const curRoute = matchRoutes(sys.routes, location.pathname);
  const { menu } = sys;
  const [selectKeys, setSelectKeys] = useState<string[]>([]);
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  useEffect(() => {
    const curRouteName = curRoute?.[curRoute?.length - 1].route.id;
    setSelectKeys([curRouteName!]);
    // 注意：目前只支持两层嵌套菜单，如果多层嵌套需要修改这里
    setOpenKeys([curRoute ? curRoute[0].route.id! : '']);
  }, [location]);

  function onClickMenu(key: string) {
    setSelectKeys([key]);
  }

  const LayoutMenuItem = ({ menuItem, collapse = false }: { menuItem: MenuItem[]; collapse?: boolean }) => {
    const handleClick = (menu: MenuItem) => {
      navigate(menu.path!);
    };

    const navigate = useNavigate();

    function handleClickParentMenu(item: MenuItem) {
      setOpenKeys([item.name]);
    }

    return menuItem.map((item) => {
      return item.children?.length ? (
        <SubMenu
          key={item.name}
          title={
            <div className='menu-option'>
              {item.icon && <div className={classNames('font-size-4', item.icon, { 'mr-2': !collapse })} />}
              {!collapse && item.title}
            </div>
          }
          onClick={() => handleClickParentMenu(item)}
        >
          {LayoutMenuItem({ menuItem: item.children, collapse })}
        </SubMenu>
      ) : (
        <Item key={item.name} className='menu-option' onClick={() => handleClick(item)}>
          {item.icon && <div className={classNames('font-size-4', item.icon, { 'mr-2': !collapse })} />}
          {!collapse && item.title}
        </Item>
      );
    });
  };

  return (
    <Menu
      collapse={collapse}
      style={{ borderRadius: 4 }}
      theme='light'
      className='menu'
      levelIndent={16}
      selectedKeys={selectKeys}
      openKeys={openKeys}
      onClickMenuItem={onClickMenu}
      // hasCollapseButton
      // onCollapseChange={onSwitchCollapse}
    >
      {LayoutMenuItem({ menuItem: menu, collapse })}
    </Menu>
  );
};

export default LayoutMenu;
