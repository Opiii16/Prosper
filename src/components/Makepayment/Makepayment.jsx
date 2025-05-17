import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Makepayment.css';

const MakePayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems = [], totalPrice = 0, itemCount = 0 } = location.state || {};

  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0) || totalPrice;

  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // M-Pesa number validation
  const validateMpesaNumber = (number) => {
    const cleaned = number.replace(/\D/g, '');
    return /^(07\d{8}|254\d{9}|7\d{8})$/.test(cleaned);
  };

  const formatPhoneNumber = (number) => {
    const cleaned = number.replace(/\D/g, '');
    if (cleaned.startsWith('254')) return cleaned;
    if (cleaned.startsWith('7') && cleaned.length === 9) return `254${cleaned}`;
    if (cleaned.startsWith('07')) return `254${cleaned.substring(1)}`;
    return `254${cleaned}`;
  };

  // Generate Daraja API access token
  const generateAccessToken = async () => {
    try {
      const auth = {
        username: process.env.REACT_APP_MPESA_CONSUMER_KEY,
        password: process.env.REACT_APP_MPESA_CONSUMER_SECRET
      };
      
      const response = await axios.get(
        process.env.REACT_APP_MPESA_AUTH_URL, 
        { auth }
      );
      
      return response.data.access_token;
    } catch (error) {
      console.error('Token generation error:', error);
      throw new Error('Failed to authenticate with M-Pesa API');
    }
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

      // DEVELOPMENT: Mock payment flow
      if (process.env.NODE_ENV === 'development' && !process.env.REACT_APP_MPESA_API_URL) {
        console.log('[DEV] Mock payment initiated');
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

        const existingOrders = JSON.parse(localStorage.getItem('prosperOrders')) || [];
        localStorage.setItem('prosperOrders', JSON.stringify([...existingOrders, mockOrder]));
        localStorage.removeItem('prosperCart');
        
        setMessage('Mock payment successful! Redirecting...');
        setTimeout(() => {
          navigate('/payment-success', { state: { orderDetails: mockOrder } });
        }, 2000);
        return;
      }

      // PRODUCTION: Daraja API integration
      const accessToken = await generateAccessToken();
      
      // Create timestamp (YYYYMMDDHHmmss)
      const timestamp = new Date().toISOString()
        .replace(/[-:T.]/g, '')
        .slice(0, 14);

      // Create password (Base64 encoded shortcode + passkey + timestamp)
      const password = Buffer.from(
        `${process.env.REACT_APP_MPESA_BUSINESS_SHORTCODE}${process.env.REACT_APP_MPESA_PASSKEY}${timestamp}`
      ).toString('base64');

      // STK Push payload
      const paymentData = {
        BusinessShortCode: process.env.REACT_APP_MPESA_BUSINESS_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: Math.round(totalAmount), // Must be integer
        PartyA: formattedPhone,
        PartyB: process.env.REACT_APP_MPESA_BUSINESS_SHORTCODE,
        PhoneNumber: formattedPhone,
        CallBackURL: process.env.REACT_APP_MPESA_CALLBACK_URL,
        AccountReference: "PROSPER_CLOTHING",
        TransactionDesc: `Payment for ${itemCount} item(s)`
      };

      const response = await axios.post(
        process.env.REACT_APP_MPESA_API_URL,
        paymentData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );

      if (response.data.ResponseCode === "0") {
        setMessage('Payment request sent! Please check your phone to complete payment.');

        const order = {
          orderId: `PROSPER-${Date.now()}`,
          items: cartItems,
          totalAmount,
          phone: formattedPhone,
          status: 'pending',
          checkoutRequestID: response.data.CheckoutRequestID,
          merchantRequestID: response.data.MerchantRequestID,
          date: new Date().toISOString()
        };

        const existingOrders = JSON.parse(localStorage.getItem('prosperOrders')) || [];
        localStorage.setItem('prosperOrders', JSON.stringify([...existingOrders, order]));
        localStorage.removeItem('prosperCart');

        setTimeout(() => {
          navigate('/payment-success', { 
            state: { 
              orderDetails: order,
              paymentResponse: response.data
            } 
          });
        }, 5000);

      } else {
        setMessage(response.data.ResponseDescription || 'Payment initiation failed');
      }

    } catch (error) {
      console.error('Payment error:', error);
      
      let errorMessage = 'Payment processing failed';
      if (error.message.includes('API endpoint')) {
        errorMessage = 'Payment system is not configured. Using mock payment instead.';
        
        // Fall back to mock payment
        await handleSubmit(e);
        return;
      } else if (error.response) {
        errorMessage = error.response.data.errorMessage || 
                     error.response.data.ResponseDescription || 
                     `Server error (${error.response.status})`;
      } else if (error.request) {
        errorMessage = 'No response from M-Pesa server';
      } else if (error.message.includes('authenticate')) {
        errorMessage = 'Failed to authenticate with M-Pesa API';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout - please try again';
      }
      
      setMessage(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

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
          <p>Complete your purchase securely via M-Pesa</p>
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
              pattern="^(07\d{8}|254\d{9}|7\d{8})$"
              title="Enter a valid M-Pesa number (0712345678 or 254712345678)"
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
              {message.includes('mock') && (
                <div className="mock-notice">(Using mock payment for demonstration)</div>
              )}
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
