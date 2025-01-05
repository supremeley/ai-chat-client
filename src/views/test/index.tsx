import './index.scss';

import { decrypt, encrypt } from '@/utils';

import { useLocalStorageState } from 'ahooks';

interface TestUser {
  username: string;
  isUsed: boolean;
}

const Test = () => {
  const [usedUserList = [], setUsedUserList] = useLocalStorageState<TestUser[]>('test-user', {
    defaultValue: [],
  });

  const location = useLocation();

  useEffect(() => {
    const userData = {
      username: 'user3',
      createTime: '2025-01-01 00:00:00',
    };

    const text = encrypt(userData);

    console.log(text);

    checkUser();
  }, []);

  const checkUser = () => {
    const decryptedText = location.search;

    if (!decryptedText || decryptedText.length < 4) {
      // TODO:
      return;
    }

    const decryptedData = decrypt(decryptedText.slice(3));

    console.log('decryptedData', decryptedData);
    console.log('value', usedUserList);

    if (decryptedData?.username === 'admin') {
      return;
    }

    if (!decryptedData?.username) {
      // 超时
      // TODO:
      console.log(211);
    } else {
      const res = usedUserList?.find((item) => item.username === decryptedData.username);

      if (res?.isUsed) {
        // TODO:
      } else {
        const userList = usedUserList;

        userList?.push({
          username: decryptedData.username,
          isUsed: true,
        });

        setUsedUserList(userList);
      }
    }
  };

  return (
    <div className='page-container'>
      <div>
        {/* {value?.map((item) => {
          return <div>{item.username}</div>;
        })} */}
      </div>
      {/* <div className='welcome-container'></div> */}
    </div>
  );
};

export default Test;
