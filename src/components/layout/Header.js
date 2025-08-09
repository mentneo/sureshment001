import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currentUser, logout, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">
          <span className="logo-text">Teddy Bear Shop</span>
          <span className="logo-icon">🧸</span>
        </Link>
        
        <div className="mobile-toggle" onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>
        
        <nav className={`nav ${isMenuOpen ? 'active' : ''}`}>
          <ul>
            <li>
              <Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
            </li>
            <li>
              <Link to="/videos" onClick={() => setIsMenuOpen(false)}>Videos</Link>
            </li>
            
            {isAdmin() && (
              <li className="admin-menu">
                <Link to="/admin" onClick={() => setIsMenuOpen(false)}>Admin</Link>
                <div className="dropdown">
                  <Link to="/admin/products" onClick={() => setIsMenuOpen(false)}>Products</Link>
                  <Link to="/admin/add-product" onClick={() => setIsMenuOpen(false)}>Add Product</Link>
                  <Link to="/admin/orders" onClick={() => setIsMenuOpen(false)}>Orders</Link>
                  <Link to="/admin/videos" onClick={() => setIsMenuOpen(false)}>Videos</Link>
                </div>
              </li>
            )}
            
            {currentUser ? (
              <>
                <li>
                  <Link to="/orders" onClick={() => setIsMenuOpen(false)}>My Orders</Link>
                </li>
                <li>
                  <button className="logout-btn" onClick={handleLogout}>Logout</button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>Login</Link>
                </li>
                <li>
                  <Link to="/signup" onClick={() => setIsMenuOpen(false)}>Sign Up</Link>
                </li>
              </>
            )}
            
            <li className="cart-link">
              <Link to="/cart" onClick={() => setIsMenuOpen(false)}>
                <span>Cart</span>
                <div className="cart-icon">
                  🛒
                  {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
                </div>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
