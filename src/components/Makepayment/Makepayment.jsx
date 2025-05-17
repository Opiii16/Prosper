import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Makepayment.css';

const MakePayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems = [], totalPrice = 0 } = location.state || {};

  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [user, setUser] = useState(null);

  // Calculate total amount
  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0) || totalPrice;

  // Format phone number for M-Pesa
  const formatPhoneNumber = (number) => {
    const cleaned = number.replace(/\D/g, '');
    if (cleaned.startsWith('254')) return cleaned;
    if (cleaned.startsWith('0') && cleaned.length === 10) return `254${cleaned.substring(1)}`;
    if (cleaned.length === 9) return `254${cleaned}`;
    return cleaned; // fallback
  };

  // Validate M-Pesa number
  const validateMpesaNumber = (number) => {
    const cleaned = number.replace(/\D/g, '');
    return /^(07\d{8}|254\d{9}|7\d{8})$/.test(cleaned);
  };

  // Handle payment submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateMpesaNumber(phone)) {
      setMessage('Please enter a valid M-Pesa number (e.g., 0712345678 or 254712345678)');
      return;
    }

    setIsProcessing(true);
    setMessage('Initiating M-Pesa payment...');

    try {
      const formattedPhone = formatPhoneNumber(phone);
      const token = localStorage.getItem('token');

      // Prepare order data
      const orderData = {
        phone_number: formattedPhone,
        amount: totalAmount,
        items: cartItems,
        shipping_address: "Nairobi, Kenya" // You can make this dynamic
      };

      // First create the order
      const orderResponse = await axios.post(
        'https://prosperv21.pythonanywhere.com/api/checkout',
        {
          shipping_address: orderData.shipping_address,
          payment_method: 'mpesa'
        },
        {
          headers: {
            'x-access-token': token,
            'Content-Type': 'application/json'
          }
        }
      );

      const orderId = orderResponse.data.order_id;

      // Then initiate M-Pesa payment
      const paymentResponse = await axios.post(
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

      if (paymentResponse.data.success) {
        setMessage('Payment request sent to your phone. Please check your M-Pesa menu to complete payment.');

        // Poll for payment status (simplified version)
        const checkPaymentStatus = async () => {
          try {
            const statusResponse = await axios.get(
              `https://prosperv21.pythonanywhere.com/api/orders/${orderId}`,
              {
                headers: {
                  'x-access-token': token
                }
              }
            );

            if (statusResponse.data.order.payment_status === 'Paid') {
              navigate('/payment-success', { 
                state: { 
                  orderDetails: statusResponse.data.order,
                  paymentResponse: paymentResponse.data
                }
              });
            } else {
              setTimeout(checkPaymentStatus, 3000); // Check again after 3 seconds
            }
          } catch (error) {
            console.error('Error checking payment status:', error);
            setMessage('Payment verification failed. Please check your order history.');
            setIsProcessing(false);
          }
        };

        // Start polling
        setTimeout(checkPaymentStatus, 5000);
      } else {
        setMessage(paymentResponse.data.message || 'Payment initiation failed. Please try again.');
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Payment error:', error);
      let errorMessage = 'Payment processing failed';
      
      if (error.response) {
        errorMessage = error.response.data?.message || 
                      `Payment error (${error.response.status})`;
      } else if (error.request) {
        errorMessage = 'No response from payment server';
      }
      
      setMessage(errorMessage);
      setIsProcessing(false);
    }
  };

  // Check for user authentication and cart items
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/signin');
      return;
    }

    // Fetch user data
    const fetchUser = async () => {
      try {
        const response = await axios.get(
          'https://prosperv21.pythonanywhere.com/api/profile',
          {
            headers: {
              'x-access-token': token
            }
          }
        );
        setUser(response.data);
        if (response.data.phone) {
          setPhone(response.data.phone);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();

    // Redirect if cart is empty
    if (cartItems.length === 0 && !totalPrice) {
      navigate('/cart');
    }
  }, [cartItems, totalPrice, navigate]);

  return (
    <div className="payment-container">
      <div className="payment-card">
        <div className="payment-header">
          <h2>Complete Your Payment</h2>
          <p>Secure M-Pesa STK Push Payment</p>
        </div>

        <div className="payment-summary">
          <h4>Order Summary ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})</h4>
          <div className="order-items">
            {cartItems.map((item, index) => (
              <div key={index} className="order-item">
                <div className="item-image">
                  <img src={item.image_url} alt={item.name} />
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
              title="Enter a valid M-Pesa number (0712345678 or 254712345678)"
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
