import React, { useState, useRef, useEffect } from 'react';
import { Button } from 'antd'; // Import Ant Design Button
import { WechatOutlined } from '@ant-design/icons'; // Import Ant Design Wechat Icon

const CalculatorWidget = () => {
  const [originalAmount, setOriginalAmount] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState(null);
  const [isOpen, setIsOpen] = useState(false); // State to toggle visibility
  const calculatorRef = useRef(null); // Ref for the calculator widget

  const calculateDiscount = () => {
    const original = parseFloat(originalAmount);
    const target = parseFloat(targetAmount);

    if (!isNaN(original) && !isNaN(target) && original > 0 && target >= 0) {
      const discount = ((original - target) / original) * 100;
      setDiscountPercentage(discount.toFixed(2));
    } else {
      setDiscountPercentage(null);
    }
  };

  // Function to close the modal and clear inputs
  const closeModal = () => {
    setIsOpen(false);
    setOriginalAmount('');
    setTargetAmount('');
    setDiscountPercentage(null);
  };

  // Handle clicks outside the calculator widget
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calculatorRef.current && !calculatorRef.current.contains(event.target)) {
        closeModal();
      }
    };

    if (isOpen) {
      window.addEventListener('mousedown', handleClickOutside);
    } else {
      window.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)} // Toggle chat visibility
        className="animate-bounce fixed bottom-4 left-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition duration-300 z-50"
        aria-label="Open Chat"
      >
        <WechatOutlined className="text-2xl" />
      </button>

      {/* Calculator Widget */}
      {isOpen && (
        <div
          ref={calculatorRef} // Attach the ref to the calculator widget
          className="fixed bottom-16 left-4 max-w-xs mx-auto p-6 bg-white rounded-lg shadow-lg border border-gray-200 transition-transform transform translate-y-0 opacity-100"
          role="dialog"
          aria-modal="true"
        >
          <h2 className="text-xl font-semibold text-center mb-4 text-gray-800">
            Discount Calculator
          </h2>
          <input
            type="number"
            placeholder="Original Amount"
            value={originalAmount}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '' || /^\d*\.?\d*$/.test(value)) {
                setOriginalAmount(value);
              }
            }}
            min="0" // Ensures input is non-negative
            className="block w-full p-2 border border-gray-300 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <input
            type="number"
            placeholder="Target Amount"
            value={targetAmount}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '' || /^\d*\.?\d*$/.test(value)) {
                setTargetAmount(value);
              }
            }}
            min="0" // Ensures input is non-negative
            className="block w-full p-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <Button
            onClick={calculateDiscount}
            className="w-full bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
          >
            Calculate Discount
          </Button>
          {discountPercentage !== null && (
            <p className="mt-4 text-center text-sm text-gray-800">
              Discount: <span className="font-bold">{discountPercentage}%</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CalculatorWidget;
