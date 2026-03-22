import React from 'react';

const PaymentStatusBadge = ({ status }) => {
  const getBadgeConfig = () => {
    switch (status?.toUpperCase()) {
      case 'PAID':
      case 'AWAITING_CONFIRMATION':
        return {
          text: status === 'AWAITING_CONFIRMATION' ? 'Awaiting Confirmation' : 'Paid',
          colors: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
        };
      case 'CONFIRMED':
      case 'SETTLED':
        return {
          text: status === 'SETTLED' ? 'Settled' : 'Confirmed',
          colors: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
        };
      case 'REQUESTED':
        return {
          text: 'Requested',
          colors: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800'
        };
      case 'PENDING':
      default:
        return {
          text: 'Pending',
          colors: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.colors}`}>
      {config.text}
    </span>
  );
};

export default PaymentStatusBadge;
