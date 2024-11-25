import './index.scss';

const Home = () => {
  const [textA, setText] = useState('test');

  return (
    <div className='home'>
      home
      <div>{textA}</div>
      <button onClick={() => setText('ttttt')}>submit</button>
    </div>
  );
};

export default Home;
