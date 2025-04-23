import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../Navbar/Navbar.jsx';
import './Homepage.css';

const carouselImages = [
  {
    src: '/assets/carousel/hoodie-banner.jpg',
    alt: 'Prosper Hood Collection',
    title: 'NEW ARRIVALS',
    subtitle: 'Urban Hoods Collection',
    cta: 'SHOP NOW'
  },
  {
    src: '/assets/carousel/tshirt-banner.jpg',
    alt: 'Prosper T-Shirts',
    title: 'SUMMER SALE',
    subtitle: '50% OFF SELECT T-SHIRTS',
    cta: 'DISCOVER DEALS'
  },
  {
    src: '/assets/carousel/cap-banner.jpg',
    alt: 'Prosper Caps Collection',
    title: 'STREET STYLE',
    subtitle: 'Trendy Caps for Every Occasion',
    cta: 'EXPLORE'
  }
];

const products = {
  hoods: [
    { id: 1, name: 'Urban Hoodie', price: 2500, colors: ['black', 'gray', 'navy'], image: '/assets/products/hoodies/hoodie-1.jpg' },
    { id: 2, name: 'Street Zip Hood', price: 2800, colors: ['red', 'black'], image: '/assets/products/hoodies/hoodie-2.jpg' },
    { id: 3, name: 'Classic Pullover', price: 2200, colors: ['white', 'green'], image: '/assets/products/hoodies/hoodie-3.jpg' }
  ],
  tshirts: [
    { id: 4, name: 'Graphic Tee', price: 1200, colors: ['white', 'black'], image: '/assets/products/tshirts/tshirt-1.jpg' },
    { id: 5, name: 'Pocket Tee', price: 1500, colors: ['gray', 'blue'], image: '/assets/products/tshirts/tshirt-2.jpg' },
    { id: 6, name: 'Oversized Tee', price: 1800, colors: ['black', 'white'], image: '/assets/products/tshirts/tshirt-3.jpg' }
  ],
  caps: [
    { id: 7, name: 'Snapback Cap', price: 800, colors: ['black', 'red'], image: '/assets/products/caps/cap-1.jpg' },
    { id: 8, name: 'Dad Hat', price: 700, colors: ['khaki', 'navy'], image: '/assets/products/caps/cap-2.jpg' },
    { id: 9, name: 'Bucket Hat', price: 900, colors: ['black', 'camo'], image: '/assets/products/caps/cap-3.jpg' }
  ],
  croptops: [
    { id: 10, name: 'Basic Crop', price: 600, colors: ['white', 'pink'], image: '/assets/products/croptops/crop-1.jpg' },
    { id: 11, name: 'Ribbed Crop', price: 800, colors: ['black', 'beige'], image: '/assets/products/croptops/crop-2.jpg' },
    { id: 12, name: 'Sleeveless Crop', price: 700, colors: ['gray', 'green'], image: '/assets/products/croptops/crop-3.jpg' }
  ]
};

const addSizesToProducts = (products) => {
  return Object.entries(products).reduce((acc, [category, items]) => {
    acc[category] = items.map(item => ({
      ...item,
      sizes: ['S', 'M', 'L', 'XL', 'XXL']
    }));
    return acc;
  }, {});
};

const productsWithSizes = addSizesToProducts(products);

const Homepage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [cartNotification, setCartNotification] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === carouselImages.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? carouselImages.length - 1 : prev - 1));
  };

  const addToCart = (product) => {
    setCartNotification(`${product.name} added to cart`);
    setTimeout(() => setCartNotification(null), 3000);
    console.log('Added to cart:', product);
  };

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
  ), []);

  return (
    <div className="homepage">
      <Navbar />

      {cartNotification && (
        <div className="cart-notification">
          {cartNotification}
          <span className="notification-close" onClick={() => setCartNotification(null)}>
            ×
          </span>
        </div>
      )}

      <section className="carousel-section">
        <div className="carousel" role="region" aria-label="Featured products carousel">
          <button 
            onClick={prevSlide} 
            className="carousel-btn prev"
            aria-label="Previous slide"
          >
            ‹
          </button>
          <div className="carousel-slide">
            <img 
              src={carouselImages[currentSlide].src} 
              alt={carouselImages[currentSlide].alt}
              loading="lazy"
              onError={(e) => {
                e.target.src = '/assets/fallback-banner.jpg';
              }}
            />
            <div className="carousel-text">
              <h2>{carouselImages[currentSlide].title}</h2>
              <p>{carouselImages[currentSlide].subtitle}</p>
              <Link to="/shop" className="carousel-cta">
                {carouselImages[currentSlide].cta}
              </Link>
            </div>
          </div>
          <button 
            onClick={nextSlide} 
            className="carousel-btn next"
            aria-label="Next slide"
          >
            ›
          </button>
          <div className="carousel-indicators">
            {carouselImages.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {isLoading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading products...</p>
        </div>
      ) : (
        Object.entries(productsWithSizes).map(([category, items]) => (
          <section key={category} className="product-category">
            <h2 className="section-title">
              <Link to={`/shop/${category}`}>
                {category.toUpperCase()} COLLECTION
              </Link>
            </h2>
            <p className="section-subtitle">
              {category === 'hoods' && 'Premium quality from 2000 KSH'}
              {category === 'tshirts' && 'Stylish designs from 3000 KSH'}
              {category === 'caps' && 'Trendy styles from 700 KSH'}
              {category === 'croptops' && 'Fashionable from 500 KSH'}
            </p>
            <div className="product-grid">
              {items.map(renderProductCard)}
            </div>
          </section>
        ))
      )}
    </div>
  );
};

export default Homepage;