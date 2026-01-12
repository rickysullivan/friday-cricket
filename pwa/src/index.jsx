import React from 'react';
import { createRoot } from 'react-dom/client';
import FridayCricketTracker from './main.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <FridayCricketTracker />
  </React.StrictMode>
);
