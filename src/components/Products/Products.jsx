import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar.jsx';
import './Product.css';

const Product = () => {
  const { category_slug } = useParams();
  const [products, setProducts] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartNotification, setCartNotification] = useState(null);
  const navigate = useNavigate();

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // First get the category name
      const categoriesResponse = await fetch('/api/products/categories');
      if (!categoriesResponse.ok) throw new Error('Failed to fetch categories');
      const categories = await categoriesResponse.json();
      
      const currentCategory = categories.find(cat => cat.slug === category_slug);
      if (!currentCategory) throw new Error('Category not found');
      setCategoryName(currentCategory.name);
      
      // Then get products for this category
      const productsResponse = await fetch(`/api/products/category/${category_slug}`);
      if (!productsResponse.ok) throw new Error('Failed to fetch products');
      const productsData = await productsResponse.json();
      
      // Format products to match your homepage structure
      const formattedProducts = productsData.map(product => ({
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        colors: product.colors || ['black', 'white', 'gray'],
        sizes: product.sizes || ['S', 'M', 'L', 'XL', 'XXL'],
        image: product.main_image ? `/uploads/${product.main_image}` : '/assets/fallback-image.jpg',
        description: product.description,
        category_id: product.category_id
      }));
      
      setProducts(formattedProducts);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching products:', err);
    } finally {
      setIsLoading(false);
    }
  }, [category_slug]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts, category_slug]);

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

  if (isLoading) {
    return (
      <div className="product-page">
        <Navbar />
        <div className="loading-spinner">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-page">
        <Navbar />
        <div className="error-message">
          <h2>Error loading products</h2>
          <p>{error}</p>
          <button onClick={fetchProducts} className="btn btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="product-page">
      <Navbar />
      
      {cartNotification && (
        <div className="cart-notification">
          {cartNotification}
          <span className="notification-close" onClick={() => setCartNotification(null)}>
            ×
          </span>
        </div>
      )}

      <section className="product-category">
        <h2 className="section-title">
          {categoryName.toUpperCase()} COLLECTION
        </h2>
        <p className="section-subtitle">
          Premium quality from {products.length > 0 ? 
            Math.min(...products.map(p => p.price)).toLocaleString() : '0'} KSH
        </p>
        
        {products.length === 0 ? (
          <div className="no-products">
            <p>No products found in this category.</p>
            <Link to="/shop" className="btn btn-primary">
              Back to Shop
            </Link>
          </div>
        ) : (
          <div className="product-grid">
            {products.map(renderProductCard)}
          </div>
        )}
      </section>

     
    </div>
  );
};

export default Product;
