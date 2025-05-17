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
    setMessage('Initiating payment...');

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

      // Determine if we should use mock payment
      const shouldUseMock = !process.env.REACT_APP_MPESA_API_URL || 
                          process.env.NODE_ENV === 'development';

      if (shouldUseMock) {
        console.log('Using mock payment flow');
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

        // Save order to localStorage
        const existingOrders = JSON.parse(localStorage.getItem('prosperOrders')) || [];
        localStorage.setItem('prosperOrders', JSON.stringify([...existingOrders, mockOrder]));
        localStorage.removeItem('prosperCart');
        
        setMessage('Mock payment successful! Redirecting...');
        setTimeout(() => {
          navigate('/payment-success', { state: { orderDetails: mockOrder } });
        }, 2000);
        return;
      }

      // PRODUCTION: Real API call
      const response = await axios.post(
        process.env.REACT_APP_MPESA_API_URL,
        paymentData,
        {
          headers: {
            'Authorization': `Bearer ${process.env.REACT_APP_MPESA_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
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

        // Save order to localStorage
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
        setMessage(response.data.message || 'Payment initiation failed. Please try again.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      
      let errorMessage = 'Payment processing failed';
      if (error.message && error.message.includes('API endpoint')) {
        errorMessage = 'Payment system is not properly configured. Using mock payment instead.';
        
        // Automatically fall back to mock payment
        await handleSubmit(e); // Recursively call with mock
        return;
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Network error - please check your internet connection';
      } else if (error.response) {
        errorMessage = error.response.data?.message || 
                      `Payment error (${error.response.status})`;
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
        {/* ... (rest of your JSX remains the same) ... */}
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
              message.toLowerCase().includes('fail') || 
              message.toLowerCase().includes('error') ? 'error' : 'info'
            }`}>
              {message}
              {message.includes('mock') && (
                <div className="mock-notice">
                  (Using mock payment for demonstration)
                </div>
              )}
            </div>
          )}

          {/* ... (rest of your form JSX) ... */}
        </form>
      </div>
    </div>
  );
};

export default MakePayment;
