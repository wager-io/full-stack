import React from 'react';

export default function Preloader() {
  return (
    <div className="flex items-center w-full justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-opacity-75"></div>
    </div>
  );
}