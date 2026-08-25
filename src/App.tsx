import { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { RequireAccount } from '@/components/layout/RequireAccount';
import { FullPageLoader } from '@/ui/Skeleton';

// Every page is a separate chunk, so the first paint ships only the shell plus
// the route being visited. Pages use named exports, hence the `.then` mapping.
const Login = lazy(() => import('@/pages/Login').then((m) => ({ default: m.Login })));
const Dashboard = lazy(() => import('@/pages/Dashboard').then((m) => ({ default: m.Dashboard })));
const NewTest = lazy(() => import('@/pages/NewTest').then((m) => ({ default: m.NewTest })));
const Practice = lazy(() => import('@/pages/Practice').then((m) => ({ default: m.Practice })));
const Lessons = lazy(() => import('@/pages/Lessons').then((m) => ({ default: m.Lessons })));
const Trainer = lazy(() => import('@/pages/Trainer').then((m) => ({ default: m.Trainer })));
const Documents = lazy(() => import('@/pages/Documents').then((m) => ({ default: m.Documents })));
const ExamSetup = lazy(() => import('@/pages/ExamSetup').then((m) => ({ default: m.ExamSetup })));
const TypingExam = lazy(() => import('@/pages/TypingExam').then((m) => ({ default: m.TypingExam })));
const Results = lazy(() => import('@/pages/Results').then((m) => ({ default: m.Results })));
const History = lazy(() => import('@/pages/History').then((m) => ({ default: m.History })));
const Progress = lazy(() => import('@/pages/Progress').then((m) => ({ default: m.Progress })));
const Settings = lazy(() => import('@/pages/Settings').then((m) => ({ default: m.Settings })));

export function App() {
  return (
    <HashRouter>
      <Routes>
        {/* The landing screen has no shell to hold the layout, so it gets a
            centred loader rather than a content-shaped skeleton. */}
        <Route
          path="/"
          element={
            <Suspense fallback={<FullPageLoader label="Loading" />}>
              <Login />
            </Suspense>
          }
        />
        <Route
          path="/app"
          element={
            <RequireAccount>
              <AppShell />
            </RequireAccount>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="new" element={<NewTest />} />
          <Route path="practice" element={<Practice />} />
          <Route path="lessons" element={<Lessons />} />
          <Route path="trainer" element={<Trainer />} />
          <Route path="library" element={<Documents />} />
          <Route path="setup" element={<ExamSetup />} />
          <Route path="exam" element={<TypingExam />} />
          <Route path="result" element={<Results />} />
          <Route path="history" element={<History />} />
          <Route path="progress" element={<Progress />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
