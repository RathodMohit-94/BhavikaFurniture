import React from 'react';
import { Link } from 'react-router-dom';

export default function PageUnavailable() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">Page Unavailable</h1>
      <p className="text-lg text-gray-600 max-w-md mx-auto mb-8">
        We're sorry, but the page you are looking for is currently inactive or unavailable. Please check back later.
      </p>
      <Link 
        to="/" 
        className="px-6 py-3 bg-[var(--color-terracotta)] text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors"
      >
        Return to Home
      </Link>
    </div>
  );
}
