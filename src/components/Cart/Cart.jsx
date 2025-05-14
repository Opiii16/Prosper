import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './Cart.css';

const Cart = () => {
  const location = useLocation();
  const [cartItems, setCartItems] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load cart from state or localStorage
  useEffect(() => {
    const localCart = JSON.parse(localStorage.getItem('prosperCart')) || [];
    const incomingCart = location.state?.cartItems || [];
    const mergedCart = incomingCart.length ? incomingCart : localCart;
    setCartItems(mergedCart);
  }, [location.state]);

  const updateCart = (items) => {
    setCartItems(items);
    localStorage.setItem('prosperCart', JSON.stringify(items));
  };

  const handleQuantityChange = (index, delta) => {
    const newCart = [...cartItems];
    newCart[index].quantity += delta;
    
    if (newCart[index].quantity <= 0) {
      newCart.splice(index, 1);
    }
    
    updateCart(newCart);
  };

  const handleRemove = (index) => {
    const newCart = [...cartItems];
    newCart.splice(index, 1);
    updateCart(newCart);
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <div className="cart-page">
      <div className="cart-header">
        <h2>Your Shopping Cart</h2>
        {cartItems.length > 0 && (
          <div className="cart-meta">
            <span>{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
            <span className="divider">|</span>
            <span className="total-price">{totalPrice.toLocaleString()} KSH</span>
          </div>
        )}
      </div>

      {cartItems.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="empty-cart"
        >
          <div className="empty-cart-icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Looks like you haven't added anything to your cart yet</p>
          <Link to="/" className="continue-shopping-btn">
            Continue Shopping
          </Link>
        </motion.div>
      ) : (
        <div className="cart-container">
          <div className="cart-items-list">
            <AnimatePresence>
              {cartItems.map((item, index) => (
                <motion.div
                  key={`${item.id}-${item.selectedSize}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  className="cart-item"
                >
                  <div className="cart-item-image">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="cart-item-details">
                    <h4>{item.name}</h4>
                    <div className="item-meta">
                      <span className="item-size">Size: {item.selectedSize}</span>
                      <span className="item-price">{item.price.toLocaleString()} KSH</span>
                    </div>
                    <div className="item-actions">
                      <div className="quantity-controls">
                        <button 
                          onClick={() => handleQuantityChange(index, -1)}
                          disabled={item.quantity <= 1}
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button onClick={() => handleQuantityChange(index, 1)}>+</button>
                      </div>
                      <button 
                        className="remove-btn"
                        onClick={() => handleRemove(index)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="cart-summary"
          >
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Subtotal ({itemCount} items)</span>
              <span>{totalPrice.toLocaleString()} KSH</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>FREE</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>{totalPrice.toLocaleString()} KSH</span>
            </div>
            
            <Link 
              to="/make-payment" 
              className="checkout-btn"
              state={{ 
                cartItems,
                totalPrice,
                itemCount
              }}
            >
              Proceed to Checkout
            </Link>

            <Link to="/" className="continue-shopping-link">
              ← Continue Shopping
            </Link>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Cart;