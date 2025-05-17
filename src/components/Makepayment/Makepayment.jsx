import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Makepayment.css';

const MakePayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const formatPhoneNumber = (number) => {
    const cleaned = number.replace(/\D/g, '');
    if (cleaned.startsWith('254')) return cleaned;
    if (cleaned.startsWith('0') && cleaned.length === 10) return `254${cleaned.substring(1)}`;
    if (cleaned.length === 9) return `254${cleaned}`;
    return cleaned;
  };

  const validateMpesaNumber = (number) => {
    const cleaned = number.replace(/\D/g, '');
    return /^(07\d{8}|254\d{9}|7\d{8})$/.test(cleaned);
  };

  const fetchCart = async (token) => {
    try {
      const res = await axios.get('https://prosperv21.pythonanywhere.com/api/cart', {
        headers: {
          'x-access-token': token,
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!res.data?.items || res.data.items.length === 0) {
        setMessage('Your cart is empty');
        navigate('/cart');
        return [];
      }
      
      const items = res.data.items || [];
      setCartItems(items);
      const total = res.data.total || items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
      setTotalAmount(total);
      return items;
    } catch (error) {
      console.error('Error fetching cart:', error);
      setMessage('Failed to load cart. Please try again.');
      navigate('/cart');
      return [];
    }
  };

  const fetchUser = async (token) => {
    try {
      const res = await axios.get('https://prosperv21.pythonanywhere.com/api/profile', {
        headers: {
          'x-access-token': token
        }
      });
      setUser(res.data);
      if (res.data.phone) setPhone(res.data.phone);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/signin');
      return;
    }
    
    const initialize = async () => {
      setIsLoading(true);
      try {
        await fetchUser(token);
        await fetchCart(token);
      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initialize();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateMpesaNumber(phone)) {
      setMessage('Please enter a valid M-Pesa number (0712345678 or 254712345678)');
      return;
    }

    setIsProcessing(true);
    setMessage('Initiating M-Pesa payment...');

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/signin');
      return;
    }

    const formattedPhone = formatPhoneNumber(phone);

    try {
      // First verify cart has items
      const cartRes = await axios.get('https://prosperv21.pythonanywhere.com/api/cart', {
        headers: { 'x-access-token': token }
      });
      
      if (!cartRes.data?.items || cartRes.data.items.length === 0) {
        throw new Error('Your cart is empty. Please add items before payment.');
      }

      // Create order with cart items
      const orderRes = await axios.post(
        'https://prosperv21.pythonanywhere.com/api/checkout',
        {
          shipping_address: 'Nairobi, Kenya',
          payment_method: 'mpesa',
          cart_items: cartItems.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity || 1
          }))
        },
        {
          headers: {
            'x-access-token': token,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!orderRes.data?.order_id) {
        throw new Error('Failed to create order');
      }

      const orderId = orderRes.data.order_id;

      // Initiate M-Pesa payment
      const payRes = await axios.post(
        'https://prosperv21.pythonanywhere.com/api/mpesa/stkpush',
        {
          phone: formattedPhone,
          amount: totalAmount,
          order_id: orderId
        },
        {
          headers: {
            'x-access-token': token,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!payRes.data?.success) {
        throw new Error(payRes.data?.message || 'Payment initiation failed');
      }

      setMessage('Payment request sent. Please check your phone to complete payment...');

      // Poll for payment status
      let attempts = 0;
      const maxAttempts = 10;
      const checkStatus = async () => {
        attempts++;
        try {
          const statusRes = await axios.get(
            `https://prosperv21.pythonanywhere.com/api/orders/${orderId}`,
            { headers: { 'x-access-token': token } }
          );
          
          if (statusRes.data?.order?.payment_status === 'Paid') {
            navigate('/payment-success', {
              state: {
                orderDetails: statusRes.data.order,
                paymentResponse: payRes.data,
                cartItems
              }
            });
            return;
          }

          if (attempts < maxAttempts) {
            setTimeout(checkStatus, 3000);
          } else {
            throw new Error('Payment verification timeout. Please check your order history.');
          }
        } catch (err) {
          console.error('Status check failed:', err);
          setMessage(err.response?.data?.message || err.message || 'Payment verification failed');
          setIsProcessing(false);
        }
      };

      setTimeout(checkStatus, 5000);
    } catch (err) {
      console.error('Payment error:', err);
      setMessage(err.response?.data?.message || err.message || 'Payment processing failed');
      setIsProcessing(false);
      
      if (err.message.includes('cart') || err.message.includes('Cart')) {
        setTimeout(() => navigate('/cart'), 2000);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="payment-container">
        <div className="payment-card">
          <div className="loading-spinner">Loading your payment details...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-container">
      <div className="payment-card">
        <div className="payment-header">
          <h2>Complete Your Payment</h2>
          <p>Secure M-Pesa STK Push Payment</p>
        </div>

        {cartItems.length > 0 ? (
          <>
            <div className="payment-summary">
              <h4>Order Summary ({cartItems.length} items)</h4>
              <div className="order-items">
                {cartItems.map((item, index) => (
                  <div key={index} className="order-item">
                    <div className="item-image">
                      <img 
                        src={item.image_url || 'https://via.placeholder.com/80'} 
                        alt={item.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/80';
                        }}
                      />
                    </div>
                    <div className="item-info">
                      <span className="item-name">{item.name}</span>
                      <div className="item-meta">
                        <span>Qty: {item.quantity || 1}</span>
                        <span>{item.price.toLocaleString()} KSH each</span>
                      </div>
                      <span className="item-price">
                        {(item.price * (item.quantity || 1)).toLocaleString()} KSH
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="order-total">
                <span>Total Amount:</span>
                <span className="total-amount">{totalAmount.toLocaleString()} KSH</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="payment-form">
              <div className="form-group">
                <label htmlFor="phone">M-Pesa Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  placeholder="07XXXXXXXX or 2547XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  pattern="^(07\d{8}|254\d{9}|7\d{8})$"
                />
                <small>We'll send an STK Push to this number</small>
              </div>

              {message && (
                <div className={`payment-message ${
                  isProcessing ? 'processing' :
                  message.toLowerCase().includes('sent') ? 'success' :
                  message.toLowerCase().includes('fail') ? 'error' : 'info'
                }`}>
                  {message}
                </div>
              )}

              <div className="payment-actions">
                <button
                  type="submit"
                  className="pay-button"
                  disabled={isProcessing || cartItems.length === 0}
                >
                  {isProcessing ? (
                    <>
                      <span className="spinner"></span>
                      Processing...
                    </>
                  ) : (
                    `Pay ${totalAmount.toLocaleString()} KSH`
                  )}
                </button>

                <button
                  type="button"
                  className="back-button"
                  onClick={() => navigate('/cart')}
                  disabled={isProcessing}
                >
                  Back to Cart
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="empty-cart-message">
            <p>Your cart is empty</p>
            <button 
              className="back-to-shop"
              onClick={() => navigate('/')}
            >
              Continue Shopping
            </button>
          </div>
        )}

        <div className="payment-security">
          <div className="security-info">
            <span className="security-icon">🔒</span>
            <span>Your payment is secure and encrypted</span>
          </div>
          <div className="support-info">
            <span className="support-icon">📞</span>
            <span>Need help? Call +254 700 000000</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MakePayment;
