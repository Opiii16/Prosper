import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [cartCount] = useState(3);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
    setActiveDropdown(null);
  };

  const toggleDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  return (
    <nav className="app-navbar prosper-navbar">
      <div className="navbar-brand">
        <img src="/assets/images/prosper-logo.png" alt="Prosper Logo" className="navbar-logo-icon" />
        <Link to="/" className="navbar-logo-text">Prosper</Link>
        <button 
          className="mobile-menu-button"
          onClick={toggleNav}
          aria-label="Toggle navigation"
        >
          <span className={`menu-icon ${isNavOpen ? 'open' : ''}`}></span>
        </button>
      </div>

      <div className={`navbar-menu ${isNavOpen ? 'open' : ''}`}>
        <div className="navbar-container">
          <ul className="navbar-nav">
            <li className="nav-item nav-dropdown">
              <button 
                className="nav-link" 
                onClick={() => toggleDropdown('hoods')}
                aria-expanded={activeDropdown === 'hoods'}
              >
                Hoods <span className="dropdown-arrow">&#9660;</span>
              </button>
              {activeDropdown === 'hoods' && (
                <div className="dropdown-menu">
                  <ul className="dropdown-list">
                    <li><button className="dropdown-item black">Black</button></li>
                    <li><button className="dropdown-item white">White</button></li>
                    <li><button className="dropdown-item red">Red</button></li>
                    <li><button className="dropdown-item gray">Gray</button></li>
                  </ul>
                </div>
              )}
            </li>
            {/* Add more nav-items here */}
          </ul>

          <div className="navbar-right-group">
            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                placeholder="Search products..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="search-button">
                <img 
                  src="/assets/icons/search.svg" 
                  alt="Search" 
                  className="search-icon"
                  width="16"
                  height="16"
                />
              </button>
            </form>

            <Link to="/cart" className="nav-link cart-link">
              <img 
                src="/assets/icons/shopping-cart.svg" 
                alt="Shopping Cart" 
                className="nav-icon"
                width="20"
                height="20"
              />
              {cartCount > 0 && (
                <span className="cart-badge">{cartCount}</span>
              )}
            </Link>

            <div className="auth-buttons">
              <Link to="/signin" className="btn btn-outline-light auth-btn">
                Sign In
              </Link>
              <Link to="/signup" className="btn btn-light auth-btn signup-btn">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;