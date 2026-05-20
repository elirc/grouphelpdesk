// Author: Sam Rivera
// Issue: #6 â€” Configure React Router routes

import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { AppLayout } from './components/layout/AppLayout';
import CreateTicketPage from './pages/CreateTicketPage';
import DashboardPage from './pages/DashboardPage';
import KnowledgeBasePage from './pages/KnowledgeBasePage';
import TicketDetailPage from './pages/TicketDetailPage';
import TicketsPage from './pages/TicketsPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'tickets', element: <TicketsPage /> },
      { path: 'tickets/new', element: <CreateTicketPage /> },
      { path: 'tickets/:id', element: <TicketDetailPage /> },
      { path: 'knowledge-base', element: <KnowledgeBasePage /> },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
