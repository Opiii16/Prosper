import { useState, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar.jsx';
import Carousel from '../Carousel/Carousel.jsx';
import './Homepage.css';

const Homepage = () => {
  const [cartNotification, setCartNotification] = useState(null);
  const navigate = useNavigate();

  const baseProducts = useMemo(() => ({
    hoods: [
      { id: 1, name: 'Urban Hoodie', price: 2500, colors: ['black', 'gray', 'navy'], image: '/assets/images/hoodie-1.png' },
      { id: 2, name: 'Street Zip Hood', price: 2800, colors: ['red', 'black'], image: '/assets/images/hoodie-2.png' },
      { id: 3, name: 'Classic Pullover', price: 2200, colors: ['white', 'green'], image: '/assets/images/hoodie-3.png' }
    ],
    tshirts: [
      { id: 4, name: 'Graphic Tee', price: 1200, colors: ['white', 'black'], image: '/assets/images/black jeezy.png' },
      { id: 5, name: 'Pocket Tee', price: 1500, colors: ['gray', 'blue'], image: '/assets/images/green jeezy.png' },
      { id: 6, name: 'Oversized Tee', price: 1800, colors: ['black', 'white'], image: '/assets/images/red jeezy.jfif' }
    ],
    caps: [
      { id: 7, name: 'Golf open Cap', price: 800, colors: ['black', 'red'], image: '/assets/images/cap-1.png' },
      { id: 8, name: 'Bucket Hat', price: 700, colors: ['khaki', 'navy'], image: '/assets/images/cap-2.png' },
      { id: 9, name: 'Baseball cap ', price: 900, colors: ['black', 'camo'], image: '/assets/images/cap-3.png' }
    ],
    croptops: [
      { id: 10, name: 'Basic Crop', price: 600, colors: ['white', 'pink'], image: '/assets/images/hoodie-4.png' },
      { id: 11, name: 'Ribbed Crop', price: 800, colors: ['black', 'beige'], image: '/assets/images/white jeezy.jfif' },
      { id: 12, name: 'Sleeveless Crop', price: 700, colors: ['gray', 'green'], image: '/assets/images/cap-4.png' }
    ]
  }), []);

  const addSizesToProducts = useCallback((products) => {
    return Object.entries(products).reduce((acc, [category, items]) => {
      acc[category] = items.map(item => ({
        ...item,
        sizes: ['S', 'M', 'L', 'XL', 'XXL']
      }));
      return acc;
    }, {});
  }, []);

  const productsWithSizes = useMemo(() => addSizesToProducts(baseProducts), [baseProducts, addSizesToProducts]);

  const categorySubtitles = useMemo(() => ({
    hoods: 'Premium quality from 2200 KSH',
    tshirts: 'Stylish designs from 1200 KSH',
    caps: 'Trendy styles from 700 KSH',
    croptops: 'Fashionable from 600 KSH'
  }), []);

  const addToCart = useCallback((product) => {
    const cartItems = JSON.parse(localStorage.getItem('prosperCart')) || [];

    const existingItemIndex = cartItems.findIndex(item => 
      item.id === product.id && 
      JSON.stringify(item.colors) === JSON.stringify(product.colors)
    );

    let updatedCart;
    if (existingItemIndex >= 0) {
      updatedCart = [...cartItems];
      updatedCart[existingItemIndex].quantity += 1;
    } else {
      const cartProduct = {
        ...product,
        quantity: 1,
        selectedSize: product.sizes?.[0] || 'M'
      };
      updatedCart = [...cartItems, cartProduct];
    }

    localStorage.setItem('prosperCart', JSON.stringify(updatedCart));
    setCartNotification(`${product.name} added to cart`);
    setTimeout(() => setCartNotification(null), 3000);

    // Navigate to cart
    navigate('/cart', { state: { cartItems: updatedCart } });
  }, [navigate]);

  const renderProductCard = useCallback((product) => (
    <div key={product.id} className="product-card">
      <div className="product-image">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          onError={(e) => {
            e.target.src = '/assets/fallback-image.jpg';
            console.error(`Failed to load image: ${product.image}`);
          }}
        />
      </div>
      <div className="product-content">
        <h3 className="product-name">{product.name}</h3>
        <div className="product-colors">
          {product.colors.map((color) => (
            <span
              key={color}
              className={`color-dot ${color}`}
              title={color}
            ></span>
          ))}
        </div>
        <div className="product-sizes">
          {product.sizes.map((size) => (
            <span
              key={size}
              className="size-option"
              title={size}
            >{size}</span>
          ))}
        </div>
        <div className="product-price">{product.price.toLocaleString()} KSH</div>
        <button
          className="btn btn-success"
          onClick={() => addToCart(product)}
          aria-label={`Add ${product.name} to cart`}
        >
          ADD TO CART
        </button>
      </div>
    </div>
  ), [addToCart]);

  return (
    <div className="homepage">
      <Navbar />
      <Carousel />

      {cartNotification && (
        <div className="cart-notification">
          {cartNotification}
          <span className="notification-close" onClick={() => setCartNotification(null)}>
            ×
          </span>
        </div>
      )}

      {Object.entries(productsWithSizes).map(([category, items]) => (
        <section key={category} className="product-category">
          <h2 className="section-title">
            <Link to={`/shop/${category}`}>
              {category.toUpperCase()} COLLECTION
            </Link>
          </h2>
          <p className="section-subtitle">
            {categorySubtitles[category]}
          </p>
          <div className="product-grid">
            {items.map(renderProductCard)}
          </div>
        </section>
      ))}

      <footer className="prosper-footer bg-secondary text-dark pt-4 pb-2">
        <div className="container">
          <div className="row text-center text-md-start">
            <div className="col-md-4 mb-3">
              <img src="/assets/images/prosper-logo.png" alt="Prosper Logo" className="img-fluid mb-2" style={{ maxWidth: '100px' }} />
              <p className="mb-1 fw-bold">Prosper Designs</p>
              <p style={{ fontSize: '0.85rem' }}>
                Premium fashion for the bold and stylish. Elevate your wardrobe with our latest collections.
              </p>
            </div>

            <div className="col-md-4 mb-3">
              <h6 className="fw-bold mb-2">Get in Touch</h6>
              <form>
                <input type="email" className="form-control form-control-sm mb-2" placeholder="Your email" />
                <textarea className="form-control form-control-sm mb-2" rows="2" placeholder="Your message"></textarea>
                <button type="submit" className="btn btn-outline-light btn-sm w-100">Submit</button>
              </form>
            </div>

            <div className="col-md-4 mb-3">
              <h6 className="fw-bold mb-2">Contact Us</h6>
              <p style={{ fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                <strong>Phone:</strong> +254745876122 / +254711111111
              </p>
              <p style={{ fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                <strong>Email:</strong> prosper@prosperclothing.com
              </p>
              <div className="d-flex justify-content-center justify-content-md-start gap-2 mt-2">
                <img src="/assets/images/in.png" alt="LinkedIn" height="24" />
                <span className="ms-2">IG@Prosper</span>
                <img src="/assets/images/x.png" alt="Twitter" height="24" />
                <span className="ms-2">X@ProsperDesigns</span>
              </div>
            </div>
          </div>

          <div className="text-center mt-3 border-top pt-2" style={{ fontSize: '0.75rem' }}>
            <img src="/assets/images/prosper-logo.png" alt="Logo" height="24" className="me-2" />
            Developed by Prosper Clothing Brand  © {new Date().getFullYear()} All rights reserved
            <img src="/assets/images/prosper-logo.png" alt="Logo" height="24" className="ms-2" />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;
