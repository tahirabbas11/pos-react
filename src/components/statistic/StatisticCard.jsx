// StatisticCard.js
import React from 'react';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

const StatisticCard = ({ title, amount, image, percentage }) => {
  // Determine color and icon based on the percentage value
  const percentageColor = percentage > 0 ? 'text-green-500' : percentage < 0 ? 'text-red-500' : 'text-gray-500';

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 flex flex-col items-center text-center">
      <div className={`h-10 w-10 flex items-center justify-center mb-4`}>
        <img src={image} alt={title} className="h-25 w-25 object-contain" />
      </div>
      <p className="text-gray-500 font-medium text-sm">{title}</p>
      <p className="text-gray-800 text-xl font-semibold">{amount}</p>
      {percentage !== undefined && (
        <div className={`flex items-center justify-center mt-2 ${percentageColor}`}>
          {percentage > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
          <span className="ml-1 text-sm font-semibold">{Math.abs(percentage)}%</span>
        </div>
      )}
    </div>
  );
};

export default StatisticCard;
