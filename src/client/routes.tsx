import { createBrowserRouter } from 'react-router-dom';
import { DataPortrait as DataPortrait } from './pages/DataPortrait.js';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <DataPortrait />,
  },
]);
