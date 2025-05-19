import { createBrowserRouter } from 'react-router-dom';
import { DataPotrait } from './pages/DataPotrait';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <DataPotrait />,
  },
]);
