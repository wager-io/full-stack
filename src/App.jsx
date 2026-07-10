import "./styles/global.css"
import { lazy, Suspense } from "react";
import { useLocation } from "react-router-dom";

// Casino (frontend) and Admin are two self-contained apps, each with its own
// internal <Routes>. We pick one by URL prefix instead of nesting them under a
// parent <Route path="/*">, which would invalidate their absolute child paths.
const Layout = lazy(() => import('./components/Layout/Layout'));
const AdminApp = lazy(() => import('./admin/AdminApp'));
const RequireAdmin = lazy(() => import('./admin/RequireAdmin'));

function App() {
  const { pathname } = useLocation();
  const isAdmin = pathname === '/admin' || pathname.startsWith('/admin/');

  if (isAdmin) {
    return (
      <Suspense fallback={null}>
        <RequireAdmin>
          <AdminApp />
        </RequireAdmin>
      </Suspense>
    );
  }

  return (
    <Suspense fallback={null}>
      <Layout />
    </Suspense>
  );
}

export default App
