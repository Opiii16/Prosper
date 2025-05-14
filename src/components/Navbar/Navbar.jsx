import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [cartCount] = useState(3);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
    setActiveDropdown(null);
  };

  const toggleDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <nav className="app-navbar prosper-navbar">
      <div className="navbar-container">
        {/* Brand Logo */}
        <div className="navbar-brand">
          <img 
            src="/assets/images/prosper-logo.png" 
            alt="Prosper Logo" 
            className="navbar-logo-icon" 
            height="50"
          />
          <Link to="/" className="nav-logo-text">PROSPER</Link>
          
          {/* Mobile Toggle */}
          <button 
            className="mobile-toggle" 
            onClick={toggleNav}
            aria-label="Toggle menu"
          >
            <span className={`bar ${isNavOpen ? 'open' : ''}`}></span>
            <span className={`bar ${isNavOpen ? 'open' : ''}`}></span>
            <span className={`bar ${isNavOpen ? 'open' : ''}`}></span>
          </button>
        </div>

        {/* Main Menu */}
        <div className={`navbar-menu ${isNavOpen ? 'open' : ''}`}>
          <div className="navbar-left">
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link to="/new-arrivals" className="nav-link">New Arrivals</Link>
              </li>
              
              <li className="nav-item nav-dropdown">
                <button
                  className={`nav-link ${activeDropdown === 'hoodies' ? 'active' : ''}`}
                  onClick={() => toggleDropdown('hoodies')}
                >
                  Hoodies <span className="dropdown-arrow">&#9660;</span>
                </button>
                {activeDropdown === 'hoodies' && (
                  <div className="dropdown-menu">
                    <div className="dropdown-content">
                      <Link to="/hoodies/black" className="dropdown-item">Black Collection</Link>
                      <Link to="/hoodies/limited" className="dropdown-item">Limited Edition</Link>
                      <Link to="/hoodies/custom" className="dropdown-item">Custom Prints</Link>
                    </div>
                  </div>
                )}
              </li>

              <li className="nav-item nav-dropdown">
                <button
                  className={`nav-link ${activeDropdown === 'tees' ? 'active' : ''}`}
                  onClick={() => toggleDropdown('tees')}
                >
                  T-Shirts <span className="dropdown-arrow">&#9660;</span>
                </button>
                {activeDropdown === 'tees' && (
                  <div className="dropdown-menu">
                    <div className="dropdown-content">
                      <Link to="/tees/graphic" className="dropdown-item">Graphic Tees</Link>
                      <Link to="/tees/plain" className="dropdown-item">Plain Tees</Link>
                      <Link to="/tees/oversized" className="dropdown-item">Oversized</Link>
                    </div>
                  </div>
                )}
              </li>

              <li className="nav-item">
                <Link to="/about-us" className="nav-link" onClick={() => {
                  setIsNavOpen(false);
                  setActiveDropdown(null);
                }}>Our Story</Link>
              </li>
            </ul>
          </div>

          {/* Right Side (Search + Cart + Auth) */}
          <div className="navbar-right">
            {/* Search Bar */}
            <div className="search-container">
              <form onSubmit={handleSearch} className="search-form">
                <input
                  type="text"
                  placeholder="Search hoodies, tees..."
                  className="search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="search-button">
                  <img 
                    src="/assets/images/loupe.png" 
                    alt="Search"
                    width="16"
                    height="16"
                  />
                </button>
              </form>
            </div>
              
            <div className="auth-buttons">
              <Link 
                to="/signin" 
                className="btn btn-outline-light auth-btn" 
                onClick={() => navigate('/signin')}
              >
                Login
              </Link>
              <Link 
                to="/signup" 
                className="btn btn-light auth-btn signup-btn"
                onClick={() => navigate('/signup')}
              >
                Register
              </Link>
              
              {/* Cart */}
              <div className="auth-cart-container">
                <Link to="/cart" className="cart-link">
                  <img 
                    src="/assets/images/shopping-cart.png" 
                    alt="Cart" 
                    className="nav-icon"
                    width="30"
                    height="30"
                  />
                  {cartCount > 0 && (
                    <span className="cart-badge">{cartCount}</span>
                  )}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;