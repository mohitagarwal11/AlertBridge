import { Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import { LoadingState } from "./components/ui/PageStates";
import AuthorityPage from "./pages/AuthorityPage";
import CitizenPage from "./pages/CitizenPage";
import LandingPage from "./pages/LandingPage";

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Suspense fallback={<LoadingState />}>
          <Routes>
            <Route element={<AppLayout />}>
              <Route index element={<LandingPage />} />
              <Route path="citizen" element={<CitizenPage />} />
              <Route path="authority" element={<AuthorityPage />} />
              <Route path="*" element={<Navigate replace to="/" />} />
            </Route>
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
