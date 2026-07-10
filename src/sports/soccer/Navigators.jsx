import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Navigators() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Parse the current path to get route segments
  const fullPath = location.pathname;
  const baseRoute = "/sport/game";
  
  // Extract path segments after the base route
  let pathSegments = [];
  if (fullPath.startsWith(baseRoute)) {
    pathSegments = fullPath.slice(baseRoute.length + 1).split('/').filter(Boolean);
  }
  
  // Create breadcrumb items with proper routes
  const breadcrumbs = pathSegments.map((segment, index) => {
    // Build the route up to this segment
    const route = `${baseRoute}/${pathSegments.slice(0, index + 1).join('/')}`;
    return { name: segment, route };
  });

  const handleGoBack = () => {
    navigate(-1); // Navigate to the previous route
  };
  
  const navigateToRoute = (route) => {
    navigate(route);
  };

  return (
    <div className="p-4 flex items-center gap-3">
      <button 
        onClick={handleGoBack}
        className="flex items-center justify-center bg-[#0f212e] text-white p-2 rounded-[4px] hover:bg-[#1a2f3d] transition-colors"
        aria-label="Go back"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 19l-7-7 7-7" 
          />
        </svg>
      </button>
      
      <div className="flex items-center">
        {breadcrumbs.map((item, index) => (
          <React.Fragment key={item.route}>
            {index > 0 && (
              <div className="mx-2 text-gray-400">/</div>
            )}
            <button 
              onClick={() => navigateToRoute(item.route)}
              className={`bg-[#0f212e] text-white px-3 py-2 rounded-[4px] font-medium capitalize hover:bg-[#1a2f3d] transition-colors ${
                index === breadcrumbs.length - 1 ? 'opacity-75 cursor-default' : ''
              }`}
              disabled={index === breadcrumbs.length - 1}
            >
              {item.name}
            </button>
          </React.Fragment>
        ))}
        
        {/* If no segments, show just "Soccer" */}
        {breadcrumbs.length === 0 && (
          <button 
            onClick={() => navigateToRoute(`${baseRoute}/soccer`)}
            className={`bg-[#0f212e] text-white px-3 py-2 rounded-[4px] font-medium capitalize ${
              fullPath === `${baseRoute}/soccer` ? 'opacity-75 cursor-default' : 'hover:bg-[#1a2f3d]'
            }`}
            disabled={fullPath === `${baseRoute}/soccer`}
          >
            Soccer
          </button>
        )}
      </div>
    </div>
  );
}