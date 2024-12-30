import { ConfigProvider } from '@arco-design/web-react';
// import zhCN from '@arco-design/web-react/es/locale/zh-CN';
import enUS from '@arco-design/web-react/es/locale/en-US';
import { Provider } from 'react-redux';
import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';

import AppRouter from '@/router';
import { store } from '@/store';
import { injectStore } from '@/utils/http';

injectStore(store);

const persistor = persistStore(store);

const App = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ConfigProvider locale={enUS}>
          <AppRouter />
        </ConfigProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
