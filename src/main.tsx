import './index.scss';
import 'virtual:uno.css';

// import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App.tsx';

// console.log('initSDK', initSDK);

ReactDOM.createRoot(document.getElementById('root')!).render(
  // <React.StrictMode>
  <App />,
  // </React.StrictMode>
);
