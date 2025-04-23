import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [cartCount] = useState(3);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const hoodColors = ['Black', 'White', 'Red', 'Gray'];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
    setActiveDropdown(null);
  };

  const closeMobileMenu = () => {
    setIsNavOpen(false);
    setActiveDropdown(null);
  };

  const toggleDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const handleKeyDown = (e, dropdown) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleDropdown(dropdown);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      closeMobileMenu();
    }
  };

  return (
    <nav className="app-navbar prosper-navbar">
      <div className="navbar-brand">
        <img 
          src="/assets/images/prosper-logo.png" 
          alt="Prosper Logo" 
          className="navbar-logo-icon"
          loading="lazy"
        />
        <Link to="/" className="nav-logo-text" onClick={closeMobileMenu}>Prosper</Link>
        <button 
          className="mobile-menu-button" 
          onClick={toggleNav} 
          aria-label="Toggle navigation"
          aria-expanded={isNavOpen}
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
                onKeyDown={(e) => handleKeyDown(e, 'hoods')}
                aria-expanded={activeDropdown === 'hoods'}
                aria-haspopup="true"
              >
                Hoods <span className="dropdown-arrow">&#9660;</span>
              </button>
              {activeDropdown === 'hoods' && (
                <div className="dropdown-menu show" ref={dropdownRef}>
                  <ul className="dropdown-list">
                    {hoodColors.map(color => (
                      <li key={color}>
                        <button 
                          className={`dropdown-item ${color.toLowerCase()}`}
                          onClick={closeMobileMenu}
                        >
                          {color}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          </ul>

          <ul className="navbar-nav navbar-right-group">
            <li className="nav-item search-container">
              <form onSubmit={handleSearch} className="search-form">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search products"
                />
                <button type="submit" className="search-button" aria-label="Submit search">
                  <img 
                    src="/assets/icons/search.svg" 
                    alt="" 
                    className="search-icon"
                    width="16"
                    height="16"
                    aria-hidden="true"
                  />
                </button>
              </form>
            </li>
            <li className="nav-item cart-icon">
              <Link to="/cart" className="nav-link cart-link" onClick={closeMobileMenu}>
                <img 
                  src="/assets/icons/shopping-cart.svg" 
                  alt="Shopping Cart" 
                  className="nav-icon"
                  width="20"
                  height="20"
                />
                {cartCount > 0 && (
                  <span className="cart-badge" aria-label={`${cartCount} items in cart`}>
                    {cartCount}
                  </span>
                )}
              </Link>
            </li>
            <div className="auth-buttons">
              <Link to="/signin" className="btn btn-outline-light auth-btn" onClick={closeMobileMenu}>
                Sign In
              </Link>
              <Link to="/signup" className="btn btn-light auth-btn signup-btn" onClick={closeMobileMenu}>
                Sign Up
              </Link>
            </div>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;