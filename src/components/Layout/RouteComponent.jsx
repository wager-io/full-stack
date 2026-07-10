import { Suspense } from 'react';

// Lightweight loading component for routes
const RouteLoader = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
  </div>
);

// Higher-order component to wrap routes with Suspense
export const withSuspense = (Component) => {
  return (props) => (
    <Suspense fallback={<RouteLoader />}>
      <Component {...props} />
    </Suspense>
  );
};

export default RouteLoader;
