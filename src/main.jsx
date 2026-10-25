import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import Scenery from './Scenery.jsx';
import './styles.css';
import './theme.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Scenery />
    <App />
  </StrictMode>
);
