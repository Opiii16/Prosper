import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [cartCount, setCartCount] = useState(3);
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
    // Add your search logic here
  };

  return (
    <nav className="app-navbar prosper-navbar">
      <div className="navbar-brand">
        <img src="/assets/images/prosper-logo.png" alt="Prosper Logo" className="navbar-logo-icon" />
        <Link to="/" className="nav-logo-text">Prosper</Link>
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
            {/* Main Categories with Dropdowns */}
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

            {/* ... (keep your other dropdown items) */}
          </ul>

          {/* Right-aligned icons section */}
          <ul className="navbar-nav navbar-right-group">
            <li className="nav-item search-container">
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
            </li>
            <li className="nav-item cart-icon">
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
            </li>
            <div className="auth-buttons">
                <Link to="/signin" className="btn btn-outline-light auth-btn" onClick={() => navigate('/Signin')}>
                  Sign In
                </Link>
                <Link to="/signup" className="btn btn-light auth-btn signup-btn" onClick={() => navigate('/Signup')}>
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