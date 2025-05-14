import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Makepayment.css';

const MakePayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems = [], totalPrice = 0, itemCount = 0 } = location.state || {};

  // Calculate total amount (fallback to passed totalPrice if calculation fails)
  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0) || totalPrice;

  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Enhanced M-Pesa number validation
  const validateMpesaNumber = (number) => {
    const cleaned = number.replace(/\D/g, '');
    return /^(07\d{8}|254\d{9}|7\d{8})$/.test(cleaned);
  };

  const formatPhoneNumber = (number) => {
    const cleaned = number.replace(/\D/g, '');
    if (cleaned.startsWith('254')) return cleaned;
    if (cleaned.startsWith('7') && cleaned.length === 9) return `254${cleaned}`;
    if (cleaned.startsWith('07')) return `254${cleaned.substring(1)}`;
    return `254${cleaned}`; // fallback
  };

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

      const paymentData = {
        phone: formattedPhone,
        amount: totalAmount,
        account_reference: "PROSPER_CLOTHING",
        transaction_desc: `Payment for ${itemCount} item(s)`,
        items: cartItems.map(item => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity || 1,
          size: item.selectedSize,
          image: item.image
        }))
      };

      // DEVELOPMENT: Mock payment flow
      if (process.env.NODE_ENV === 'development') {
        console.log('[DEV] Mock payment data:', paymentData);
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const mockOrder = {
          orderId: `MOCK-${Date.now()}`,
          items: cartItems,
          totalAmount,
          phone: formattedPhone,
          status: 'completed',
          transactionCode: 'MOCK' + Math.random().toString(36).substr(2, 8).toUpperCase(),
          date: new Date().toISOString()
        };

        // Save mock order
        const existingOrders = JSON.parse(localStorage.getItem('prosperOrders')) || [];
        localStorage.setItem('prosperOrders', JSON.stringify([...existingOrders, mockOrder]));
        
        // Clear cart
        localStorage.removeItem('prosperCart');
        
        setMessage('Mock payment successful! Redirecting...');
        setTimeout(() => {
          navigate('/payment-success', { state: { orderDetails: mockOrder } });
        }, 2000);
        return;
      }

      // PRODUCTION: Real API call
      const response = await axios.post(
        process.env.REACT_APP_MPESA_API_URL || 'https://your-real-api.com/mpesa/stk-push',
        paymentData,
        {
          headers: {
            'Authorization': `Bearer ${process.env.REACT_APP_MPESA_API_KEY || 'your-api-key'}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000 // 10 second timeout
        }
      );

      if (response.data.success) {
        setMessage('Payment request sent to your phone. Please complete the payment on your M-Pesa menu');

        const order = {
          orderId: `PROSPER-${Date.now()}`,
          items: cartItems,
          totalAmount,
          phone: formattedPhone,
          status: 'pending',
          transactionCode: response.data.transactionCode || 'N/A',
          date: new Date().toISOString()
        };

        // Save order
        const existingOrders = JSON.parse(localStorage.getItem('prosperOrders')) || [];
        localStorage.setItem('prosperOrders', JSON.stringify([...existingOrders, order]));
        
        // Clear cart
        localStorage.removeItem('prosperCart');

        // Redirect to success page
        setTimeout(() => {
          navigate('/payment-success', { 
            state: { 
              orderDetails: order,
              paymentResponse: response.data
            } 
          });
        }, 5000);
      } else {
        setMessage(response.data.message || 'Payment initiation failed. Please try again.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      let errorMessage = 'An error occurred during payment processing';
      
      if (error.response) {
        // Server responded with error status
        errorMessage = error.response.data?.message || 
                      `Server error (${error.response.status})`;
      } else if (error.request) {
        // No response received
        errorMessage = 'Network error - could not reach payment server';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout - please check your connection';
      } else {
        errorMessage = error.message;
      }
      
      setMessage(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0 && !totalPrice) {
      navigate('/cart');
    }
  }, [cartItems, totalPrice, navigate]);

  return (
    <div className="payment-container">
      <div className="payment-card">
        <div className="payment-header">
          <h2>Prosper Clothing Payment</h2>
          <p>Complete your purchase securely</p>
        </div>

        <div className="payment-summary">
          <h4>Order Summary ({itemCount} {itemCount === 1 ? 'item' : 'items'})</h4>
          <div className="order-items">
            {cartItems.map((item, index) => (
              <div key={index} className="order-item">
                <div className="item-image">
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="item-info">
                  <span className="item-name">{item.name}</span>
                  <div className="item-meta">
                    <span>Size: {item.selectedSize}</span>
                    <span>{item.quantity || 1} × {item.price.toLocaleString()} KSH</span>
                  </div>
                  <span className="item-price">{(item.price * (item.quantity || 1)).toLocaleString()} KSH</span>
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
              pattern="[07|254]\d{8,9}"
              maxLength="12"
            />
            <small>Enter your Safaricom number (e.g., 0712345678 or 254712345678)</small>
          </div>

          {message && (
            <div className={`payment-message ${
              isProcessing ? 'processing' : 
              message.toLowerCase().includes('success') ? 'success' : 
              message.toLowerCase().includes('fail') || message.toLowerCase().includes('error') ? 'error' : 'info'
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
                  Processing Payment...
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
            <span>Need help? Call +254745876122</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MakePayment;