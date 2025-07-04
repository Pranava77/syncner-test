import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import App from './App.tsx';
import './index.css';
import { AliveScope } from 'react-activation';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AliveScope>
      <Provider store={store}>
        <App />
      </Provider>
    </AliveScope>
  </StrictMode>
);