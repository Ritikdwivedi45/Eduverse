import React from "react";

const Contact = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-6">
      <div className="max-w-5xl mx-auto bg-white p-10 rounded-lg shadow">
        <h1 className="text-4xl font-bold text-indigo-600 mb-6">
          Contact Us
        </h1>

        <p className="text-gray-700 mb-6">
          Have questions or need help? We are always here for you.
        </p>

        <div className="space-y-4 text-gray-700">
          <p>📧 support@eduverse.com</p>
          <p>📞 +1 (555) 123-4567</p>
          <p>📍 123 Education Street, Learn City</p>
        </div>
      </div>
    </div>
  );
};

export default Contact;
