import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';

const HomePage = lazy(() => import('../pages/HomePage.jsx'));
const HeatmapPage = lazy(() => import('../pages/HeatmapPage.jsx'));
const SolverPage = lazy(() => import('../pages/SolverPage.jsx'));
const PracticePage = lazy(() => import('../pages/PracticePage.jsx'));
const HistoryPage = lazy(() => import('../pages/HistoryPage.jsx'));
const DataInspectorPage = lazy(() => import('../pages/DataInspectorPage.jsx'));

export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/heatmap', element: <HeatmapPage /> },
  { path: '/solver', element: <SolverPage /> },
  { path: '/practice', element: <PracticePage /> },
  { path: '/history', element: <HistoryPage /> },
  { path: '/data', element: <DataInspectorPage /> },
]);
