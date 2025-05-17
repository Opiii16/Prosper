import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Makepayment.css';

const MakePayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [cartItems, setCartItems] = useState(location.state?.cartItems || []);
  const [totalAmount, setTotalAmount] = useState(location.state?.totalPrice || 0);
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
      
      if (!res.data?.cart) {
        throw new Error('Cart data not found in response');
      }
      
      const items = res.data.cart || [];
      if (items.length === 0) {
        setMessage('Your cart is empty');
        return items;
      }
      
      setCartItems(items);
      const total = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
      setTotalAmount(total);
      return items;
    } catch (error) {
      console.error('Error fetching cart:', error);
      setMessage('Failed to load cart. Please try again.');
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
        const items = await fetchCart(token);
        if (items.length === 0) {
          navigate('/cart', { state: { fromPayment: true } });
        }
      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initialize();
  }, [navigate]);

  const processPayment = async (token, formattedPhone) => {
    try {
      // 1. Verify cart exists and has items
      const cartVerify = await axios.get('https://prosperv21.pythonanywhere.com/api/cart', {
        headers: { 'x-access-token': token }
      });
      
      if (!cartVerify.data?.cart || cartVerify.data.cart.length === 0) {
        throw new Error('Your cart is empty. Please add items before payment.');
      }

      // 2. Create Order
      const orderRes = await axios.post(
        'https://prosperv21.pythonanywhere.com/api/checkout',
        {
          shipping_address: 'Nairobi, Kenya',
          payment_method: 'mpesa',
          cart_items: cartItems.map(item => ({
            product_id: item.id,
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

      // 3. Initiate Payment
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

      return { orderId, paymentData: payRes.data };
    } catch (error) {
      console.error('Payment processing error:', error);
      throw error;
    }
  };

  const pollPaymentStatus = async (token, orderId) => {
    try {
      const statusRes = await axios.get(
        `https://prosperv21.pythonanywhere.com/api/orders/${orderId}`,
        { headers: { 'x-access-token': token } }
      );
      
      if (!statusRes.data?.order) {
        throw new Error('Order not found');
      }
      
      return statusRes.data.order;
    } catch (error) {
      console.error('Status check error:', error);
      throw error;
    }
  };

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
      // Process payment (create order + initiate STK push)
      const { orderId, paymentData } = await processPayment(token, formattedPhone);
      
      setMessage('Payment request sent. Please check your phone to complete payment...');

      // Poll for payment status
      let attempts = 0;
      const maxAttempts = 10; // 30 seconds total (3s * 10)
      const pollInterval = 3000; // 3 seconds

      const checkStatus = async () => {
        attempts++;
        try {
          const order = await pollPaymentStatus(token, orderId);
          
          if (order.payment_status === 'Paid') {
            navigate('/payment-success', {
              state: {
                orderDetails: order,
                paymentResponse: paymentData,
                cartItems
              }
            });
            return;
          } else if (order.payment_status === 'Failed') {
            throw new Error('Payment failed. Please try again.');
          }

          if (attempts < maxAttempts) {
            setTimeout(checkStatus, pollInterval);
          } else {
            throw new Error('Payment verification timeout. Please check your order history.');
          }
        } catch (error) {
          console.error('Payment verification error:', error);
          setMessage(error.message);
          setIsProcessing(false);
        }
      };

      // Initial status check after 5 seconds
      setTimeout(checkStatus, 5000);
    } catch (error) {
      console.error('Payment processing failed:', error);
      setMessage(error.response?.data?.message || error.message || 'Payment processing failed');
      setIsProcessing(false);
      
      // Only navigate to cart if it's specifically a cart-related error
      if (error.message.includes('cart') || error.message.includes('Cart')) {
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
                  message.toLowerCase().includes('sent') || message.toLowerCase().includes('complete') ? 'success' :
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
