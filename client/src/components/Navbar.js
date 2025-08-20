import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        Agent Management System
      </div>
      
      <ul className="navbar-nav">
        <li>
          <Link to="/" className={isActive('/')}>
            Dashboard
          </Link>
        </li>
        <li>
          <Link to="/agents" className={isActive('/agents')}>
            Agents
          </Link>
        </li>
        <li>
          <Link to="/lists" className={isActive('/lists')}>
            Lists
          </Link>
        </li>
      </ul>
      
      <div className="navbar-user">
        <span>Welcome, {user?.email}</span>
        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;