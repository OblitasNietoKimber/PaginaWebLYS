import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import './styles/tokens.css';
import './styles/global.css';
import './styles/login.css';
import './styles/register.css';
import './styles/home.css';
import './styles/carta.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode><App /></StrictMode>,
);
