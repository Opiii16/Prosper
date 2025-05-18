import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './MakePayment.css';

const MakePayment = () => {
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/signin');
          return;
        }

        const res = await axios.get('https://prosperv21.pythonanywhere.com/api/cart', {
          headers: { 'x-access-token': token }
        });

        if (res.data?.items) {
          setCartItems(res.data.items);
          const total = res.data.items.reduce(
            (sum, item) => sum + (item.price * (item.quantity || 1)), 0
          );
          setTotalAmount(total);
        }
      } catch (err) {
        console.error('Failed to fetch cart:', err);
        setMessage(err.response?.data?.message || 'Failed to load cart items');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCart();
  }, [navigate]);

  const validateMpesaNumber = (number) => {
    return /^(07\d{8}|2547\d{8})$/.test(number);
  };

  const formatPhoneNumber = (number) => {
    if (number.startsWith('254')) return number;
    if (number.startsWith('07')) return `254${number.slice(1)}`;
    return number;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate phone number
    if (!phone || !validateMpesaNumber(phone)) {
      setMessage('Please enter a valid M-Pesa number (0712345678 or 254712345678)');
      return;
    }

    // Check cart not empty
    if (cartItems.length === 0) {
      setMessage('Your cart is empty. Please add items before payment.');
      navigate('/cart');
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
      // 1. Create order
      const orderRes = await axios.post(
        'https://prosperv21.pythonanywhere.com/api/checkout',
        {
          shipping_address: 'Nairobi, Kenya',
          payment_method: 'mpesa',
          cart_items: cartItems.map(item => ({
            product_id: item.product_id || item.id,
            quantity: item.quantity || 1,
            price: item.price
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
        throw new Error('Failed to create order. Please try again.');
      }

      const orderId = orderRes.data.order_id;

      // 2. Initiate payment
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
        throw new Error(payRes.data?.message || 'Payment initiation failed. Please try again.');
      }

      setMessage('Payment request sent. Please check your phone to complete payment...');

      // 3. Poll for status
      let attempts = 0;
      const maxAttempts = 10; // 30 seconds total
      const pollInterval = 3000; // 3 seconds
      
      const checkStatus = async () => {
        attempts++;
        try {
          const statusRes = await axios.get(
            `https://prosperv21.pythonanywhere.com/api/orders/${orderId}`,
            { headers: { 'x-access-token': token } }
          );
          
          if (!statusRes.data?.order) {
            throw new Error('Order not found');
          }
          
          const order = statusRes.data.order;
          
          if (order.payment_status === 'Paid') {
            navigate('/payment-success', {
              state: {
                orderDetails: order,
                paymentResponse: payRes.data,
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
            setMessage('Payment verification timeout. Please check your order history for status.');
            setIsProcessing(false);
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
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading your cart details...</p>
            <button 
              className="back-button" 
              onClick={() => navigate('/cart')}
            >
              Back to Cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-container">
      <div className="payment-card">
        <h2>Complete Your Payment</h2>
        
        <div className="payment-summary">
          <h3>Order Summary</h3>
          <div className="cart-items">
            {cartItems.map((item, index) => (
              <div key={index} className="cart-item">
                <div className="item-image">
                  <img 
                    src={item.image_url ? 
                      `https://prosperv21.pythonanywhere.com${item.image_url}` : 
                      'https://via.placeholder.com/80'
                    } 
                    alt={item.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/80';
                    }}
                    style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                  />
                </div>
                <div className="item-details">
                  <h4>{item.name}</h4>
                  <p>Ksh {item.price} x {item.quantity || 1}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="total-amount">
            <h3>Total: Ksh {totalAmount}</h3>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="payment-form">
          <div className="form-group">
            <label htmlFor="phone">M-Pesa Phone Number</label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 0712345678 or 254712345678"
              required
            />
            <small>Enter your M-Pesa registered phone number</small>
          </div>

          {message && (
            <div className={`payment-message ${
              message.includes('failed') ? 'error' : 
              message.includes('success') ? 'success' : 
              'processing'
            }`}>
              {message}
            </div>
          )}

          <button 
            type="submit" 
            className="pay-button"
            disabled={isProcessing || cartItems.length === 0}
          >
            {isProcessing ? 'Processing...' : `Pay Ksh ${totalAmount}`}
          </button>

          <button 
            type="button" 
            className="back-button" 
            onClick={() => navigate('/cart')}
            disabled={isProcessing}
          >
            Back to Cart
          </button>
        </form>
      </div>
    </div>
  );
};

export default MakePayment;
