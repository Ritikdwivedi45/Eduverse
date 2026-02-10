import React, { useState, useEffect } from "react";
import { paymentAPI, paymentHelpers } from "../../api/payment.api";

const Dashboard = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  const fetchPaymentHistory = async () => {
    try {
      const data = await paymentAPI.getPaymentHistory();
      setPayments(data.payments || []);
    } catch (error) {
      console.error("Error fetching payment history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCoursePurchase = async (courseId) => {
    try {
      // Create order
      const orderData = await paymentAPI.createOrder(courseId);
      
      // Initialize Razorpay checkout
      await paymentHelpers.initializeRazorpay(orderData, {
        name: 'EduVerse LMS',
        description: 'Course Enrollment',
        prefill: {
          name: user?.name || '',
          email: user?.email || ''
        }
      });
      
      // Payment successful - handle in the Razorpay handler
    } catch (error) {
      console.error("Payment error:", error);
    }
  };

  // Format amount display
  const formatAmount = (amount) => {
    return paymentHelpers.formatAmount(amount);
  };

  return (
    <div>
      {/* Payment history display */}
      {payments.map(payment => (
        <div key={payment._id}>
          <p>Amount: {formatAmount(payment.amount)}</p>
          <p>Status: {payment.status}</p>
          <p>Date: {new Date(payment.createdAt).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;