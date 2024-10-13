import React, { useState } from 'react';
import { Button } from 'antd'; // Import Ant Design Button
import { CalculatorOutlined } from '@ant-design/icons'; // Import Ant Design Calculator Icon
// import { motion } from 'framer-motion'; // Import Framer Motion for animations

const CalculatorWidget = () => {
  const [originalAmount, setOriginalAmount] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState(null);
  const [isOpen, setIsOpen] = useState(false); // State to toggle visibility

  const calculateDiscount = () => {
    const original = parseFloat(originalAmount);
    const target = parseFloat(targetAmount);

    if (!isNaN(original) && !isNaN(target) && original > 0) {
      const discount = ((original - target) / original) * 100;
      setDiscountPercentage(discount.toFixed(2));
    } else {
      setDiscountPercentage(null);
    }
  };

  return (
    <div>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)} // Toggle calculator visibility
        className="fixed bottom-4 animate-bounce left-4 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition duration-300"
        aria-label="Open Calculator"
      >
        <CalculatorOutlined className="text-2xl" />
      </button>

      {/* Calculator Widget */}
      {isOpen && (
        <div className="fixed bottom-16 left-4 max-w-xs mx-auto p-6 bg-white rounded-lg shadow-lg mb-4 border border-gray-300">
          <h2 className="text-xl font-bold text-center mb-4">
            Discount Calculator
          </h2>
          <input
            type="number"
            placeholder="Original Amount"
            value={originalAmount}
            onChange={(e) => setOriginalAmount(e.target.value)}
            className="block w-full p-2 border border-gray-300 rounded mb-2"
          />
          <input
            type="number"
            placeholder="Target Amount"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            className="block w-full p-2 border border-gray-300 rounded mb-4"
          />
          <Button
            onClick={calculateDiscount}
            className="w-full bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300"
          >
            Calculate Discount
          </Button>
          {discountPercentage !== null && (
            <p className="mt-4 text-center text-lg">
              Required Discount:{' '}
              <span className="font-bold">{discountPercentage}%</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CalculatorWidget;
