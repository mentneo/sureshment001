import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="not-found">
      <div className="container">
        <div className="not-found-content">
          <h1>404</h1>
          <h2>Page Not Found</h2>
          <p>Oops! The page you're looking for doesn't exist.</p>
          <div className="teddy-icon">🧸</div>
          <Link to="/" className="home-btn">Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
