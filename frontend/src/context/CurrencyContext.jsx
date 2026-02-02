import React, { createContext, useContext, useState } from 'react';

const CurrencyContext = createContext();

// Exchange rate (you can make this dynamic later)
const EXCHANGE_RATE = 83.25; // 1 USD = 83.25 INR

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('INR'); // 'INR' or 'USD'

  const toggleCurrency = () => {
    setCurrency(prev => prev === 'INR' ? 'USD' : 'INR');
  };

  const formatCurrency = (amount, sourceCurrency = 'INR') => {
    // Convert amount to selected display currency
    let displayAmount = amount;
    
    if (sourceCurrency !== currency) {
      if (currency === 'USD' && sourceCurrency === 'INR') {
        displayAmount = amount / EXCHANGE_RATE;
      } else if (currency === 'INR' && sourceCurrency === 'USD') {
        displayAmount = amount * EXCHANGE_RATE;
      }
    }

    // Format with proper symbols and decimals
    const symbol = currency === 'INR' ? '₹' : '$';
    const decimals = currency === 'USD' ? 2 : 2;
    
    return `${symbol}${displayAmount.toLocaleString('en-IN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })}`;
  };

  const convertPrice = (amount, sourceCurrency) => {
    // Convert to display currency and return numeric value
    if (sourceCurrency === currency) {
      return amount;
    }
    
    if (currency === 'USD' && sourceCurrency === 'INR') {
      return amount / EXCHANGE_RATE;
    } else if (currency === 'INR' && sourceCurrency === 'USD') {
      return amount * EXCHANGE_RATE;
    }
    
    return amount;
  };

  const getCurrencySymbol = () => {
    return currency === 'INR' ? '₹' : '$';
  };

  const value = {
    currency,
    setCurrency,
    toggleCurrency,
    formatCurrency,
    convertPrice,
    getCurrencySymbol,
    exchangeRate: EXCHANGE_RATE
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
