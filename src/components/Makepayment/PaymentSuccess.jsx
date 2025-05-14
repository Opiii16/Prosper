import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './PaymentSuccess.css'; // create and style this accordingly

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderDetails = {} } = location.state || {};

  if (!orderDetails || Object.keys(orderDetails).length === 0) {
    return (
      <div className="payment-success-container">
        <h2>Payment Not Found</h2>
        <p>We couldn't find any payment details. Please return to the shop.</p>
        <button onClick={() => navigate('/')}>Go to Homepage</button>
      </div>
    );
  }

  return (
    <div className="payment-success-container">
      <div className="success-card">
        <div className="success-header">
          <h2>🎉 Payment Successful!</h2>
          <p>Thank you for your purchase from Prosper Clothing</p>
        </div>

        <div className="success-summary">
          <h4>Order Details</h4>
          <p><strong>Order ID:</strong> {orderDetails.orderId}</p>
          <p><strong>Phone:</strong> {orderDetails.phone}</p>
          <p><strong>Status:</strong> {orderDetails.status}</p>
          <p><strong>Transaction Code:</strong> {orderDetails.transactionCode}</p>
          <p><strong>Date:</strong> {new Date(orderDetails.date).toLocaleString()}</p>
          <p><strong>Total Paid:</strong> {orderDetails.totalAmount.toLocaleString()} KSH</p>
        </div>

        <div className="success-items">
          <h4>Purchased Items</h4>
          {orderDetails.items.map((item, idx) => (
            <div key={idx} className="success-item">
              <img src={item.image} alt={item.name} className="item-img" />
              <div className="item-details">
                <p><strong>{item.name}</strong></p>
                <p>Size: {item.size}</p>
                <p>Qty: {item.quantity}</p>
                <p>Price: {item.price.toLocaleString()} KSH</p>
              </div>
            </div>
          ))}
        </div>

        <div className="success-actions">
          <button onClick={() => navigate('/')}>Continue Shopping</button>
          <button onClick={() => navigate('/orders')}>View My Orders</button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
