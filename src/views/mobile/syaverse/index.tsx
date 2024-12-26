import './index.scss';
import SyaverseTop from '@/assets/images/mobile/syaverse-top.png';
import SyaverseBottom from '@/assets/images/mobile/syaverse-bottom.png';

import Navigation from '../components/navigation';
import A1 from '@/assets/images/mobile/a1.png';
import A2 from '@/assets/images/mobile/a2.png';
import A3 from '@/assets/images/mobile/a3.png';
import A4 from '@/assets/images/mobile/a6.png';
import A5 from '@/assets/images/mobile/a5.png';
import A6 from '@/assets/images/mobile/a6.png';
import AddIcon from '@/assets/images/mobile/add-icon.png';

const Syaverse = () => {
  const avatarList = [
    {
      avatar: A1,
      disc: 'Sara - Energetic and exciting',
    },
    {
      avatar: A2,
      disc: 'Daisy - Cozy and warm ',
    },
    {
      avatar: A3,
      disc: 'Laya - Hurry and rational',
    },
    {
      avatar: A4,
      disc: 'Sara - Energetic and exciting ',
    },
    {
      avatar: A5,
      disc: 'Daisy - Cozy and warm ',
    },
    {
      avatar: A6,
      disc: 'Laya - Hurry and rational',
    },
  ];

  return (
    <div className='syaverse'>
      <img src={SyaverseTop} alt='' className='content-bg' />
      <div className='content'>
        {avatarList.map((item) => {
          return (
            <div key={item.disc} className='content-item'>
              <img src={item.avatar} alt='' className='content-item-avatar' />
              <span className='content-item-disc'>{item.disc}</span>
              <img src={AddIcon} alt='' className='content-item-icon' />
            </div>
          );
        })}
      </div>
      <img src={SyaverseBottom} alt='' className='content-bg' />

      <Navigation />
    </div>
  );
};

export default Syaverse;
