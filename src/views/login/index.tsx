import './index.scss';

import type { FormInstance } from '@arco-design/web-react';
import { Button, Form, Grid, Input, Message, Notification } from '@arco-design/web-react';

import { getCaptcha } from '@/api/auth';
import type { LoginParams } from '@/api/auth/interface';
import Logo from '@/assets/logo.jpg';
import { ResultEnum } from '@/enums';
import { useAuth } from '@/hooks';

const { Row, Col } = Grid;
const FormItem = Form.Item;
const InputPassword = Input.Password;

const Captcha = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [captcha, setCaptcha] = useState('');

  const fetchCaptcha = () => {
    getCaptcha().then((res) => {
      if (res.code === ResultEnum.SUCCESS) {
        setCaptcha(res.result);
      }
    });
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    // 绘制验证码到 canvas
    ctx?.clearRect(0, 0, canvas!.width, canvas!.height);
    const fonts = ['bold 24px Arial', 'italic 24px Verdana', 'bold 24px Times New Roman'];
    ctx!.font = fonts[Math.floor(Math.random() * fonts.length)];
    ctx!.save(); // 保存当前的状态
    ctx!.translate(50, 30); // 设置旋转的中心点
    ctx!.rotate(Math.random() * 0.3); // 随机旋转角度，范围为 -0.1 到 0.1 弧度
    ctx!.restore(); // 恢复状态

    for (let i = 0; i < 5; i++) {
      ctx!.beginPath();
      ctx!.moveTo(Math.random() * canvas!.width, Math.random() * canvas!.height);
      ctx!.lineTo(Math.random() * canvas!.width, Math.random() * canvas!.height);
      ctx!.strokeStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`;
      ctx!.stroke();
    }

    ctx?.fillText(captcha, 10, 25);
  }, [captcha]);

  return (
    <div onClick={() => fetchCaptcha()}>
      <canvas ref={canvasRef} width='80' height='30' />
    </div>
  );
};

const Login = () => {
  // const navigate = useNavigate();
  // const routerContext = useInRouterContext();
  const authHook = useAuth();
  const [loading, setLoading] = useState(false);
  const formRef = useRef<FormInstance<LoginParams>>(null);

  useEffect(() => {
    console.log('init Login');
  }, []);

  const handleLogin = async () => {
    if (loading) {
      return;
    }

    if (formRef.current) {
      setLoading(true);

      try {
        const res = await formRef.current.validate();

        const userinfo = await authHook.login(res);

        await authHook.loadPermission();

        Message.success({
          content: '登录成功',
          duration: 1000,
          onClose: () => {
            const hour = new Date().getHours();
            const thisTime =
              hour < 8 ? '早上好' : hour <= 11 ? '上午好' : hour <= 13 ? '中午好' : hour < 18 ? '下午好' : '晚上好';

            Notification.success({
              title: `${userinfo?.username ?? '您好'},欢迎登录`,
              content: thisTime,
            });

            // const hash = window.location.hash.split('/');

            // let url = '';

            // if (hash.length > 1) {
            //   url = decodeURIComponent(hash.at(-1)!);
            // }

            // if (url === 'login' || url === '#login') {
            const url = '/knowledge/list';
            // }

            // TODO: useNavigate 使用到 RouterContext检查， 在Router后代中可使用正常
            // console.log('url', url);
            // console.log('routerContext', routerContext);
            // if (routerContext) {
            // navigate(url, { replace: true });
            // } else {
            window.location.hash = url;
            // }
          },
        });
      } catch (_) {
        console.log(formRef.current.getFieldsError());
        setLoading(false);
        // Message.error('校验失败，请检查字段！');
      }
    }
  };

  return (
    <div className='login'>
      <div className='login-header'>
        <img src={Logo} className='login-header__logo' />
        科普也是药
      </div>

      <div className='pl-4 pr-4'>
        <section className='login-container'>
          {/* <Row justify='end'>
            <Col xs={24} sm={24} md={18} lg={10} xl={10}> */}
          <div className='form'>
            <div className='form-title'>医生登录</div>
            <Form ref={formRef} wrapperCol={{ span: 24 }} size='large'>
              <FormItem field='account' rules={[{ required: true, message: '请输入账号' }]}>
                <Input
                  addBefore={<div className='i-bxs:user'></div>}
                  autoComplete='account'
                  placeholder='请输入账号'
                  className='form-input'
                />
              </FormItem>
              <FormItem field='password' rules={[{ required: true, message: '请输入密码' }]}>
                <InputPassword
                  addBefore={<div className='i-material-symbols:password'></div>}
                  autoComplete='password'
                  placeholder='请输入密码'
                  className='form-input'
                />
              </FormItem>
              <FormItem field='code' rules={[{ required: true, message: '请输入验证码' }]}>
                <Input
                  addBefore={<div className='i-uiw:verification'></div>}
                  placeholder='请输入验证码'
                  className='form-input'
                  addAfter={<Captcha />}
                />
              </FormItem>
              <FormItem>
                <Button type='primary' shape='square' loading={loading} className='form-button' onClick={handleLogin}>
                  登录
                </Button>
              </FormItem>
            </Form>
          </div>
          {/* </Col>
          </Row> */}
        </section>

        <div className='my-6'>
          <Row>
            <Col span={12} className='text-[20px] font-bold'>
              专病科普
            </Col>
            <Col span={12} className='text-center'>
              <Input.Search
                searchButton='搜索'
                placeholder='Search content'
                style={{ width: 500, height: 40 }}
                size='large'
              />
            </Col>
          </Row>

          <div className='mt-[20px]'>
            {[1, 2, 3].map((c) => (
              <Row key={c} gutter={4} className='mt-[4px]'>
                <Col span={4} className='text-center'>
                  <div className='flex-1 py-[10px] group-container'>学科{c} &gt;</div>
                </Col>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Col key={s} span={4} className='text-center'>
                    <div className='flex-1 py-[10px] bg-[#f2f3f5] item-container'>疾病{s}</div>
                  </Col>
                ))}
              </Row>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
