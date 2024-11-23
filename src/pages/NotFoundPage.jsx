import React from 'react';
import { Link } from 'react-router-dom'; // assuming you are using react-router-dom for routing

const NotFound = () => {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 text-center">
      <h1 className="text-9xl font-extrabold text-blue-500 mb-4">404</h1>
      <h2 className="text-4xl font-semibold text-gray-700 mb-2">Page Not Found</h2>
      <p className="text-lg text-gray-500 mb-6">
        Oops! The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/">
        <button className="bg-blue-500 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-600 transition duration-300">
          Go Home
        </button>
      </Link>
    </div>
  );
};

export default NotFound;
