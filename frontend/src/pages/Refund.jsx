import React from "react";

const Refund = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-6">
      <div className="max-w-5xl mx-auto bg-white p-10 rounded-lg shadow">
        <h1 className="text-4xl font-bold text-indigo-600 mb-6">
          Refund Policy
        </h1>

        <p className="text-gray-700 mb-4">
          If you are not satisfied with a course, you can request a refund within
          7 days of purchase.
        </p>

        <p className="text-gray-700">
          Refunds are processed within 3–5 business days.
        </p>
      </div>
    </div>
  );
};

export default Refund;
