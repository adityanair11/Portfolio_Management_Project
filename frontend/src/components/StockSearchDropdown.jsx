import React, { useState, useRef, useEffect } from 'react';
import { Search, TrendingUp, Building2, ChevronDown } from 'lucide-react';

const StockSearchDropdown = ({ stocks, onSelect, placeholder = "Search stocks..." }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Filter stocks based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredStocks(stocks.slice(0, 50)); // Show first 50 stocks when empty
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = stocks.filter(stock =>
        stock.symbol.toLowerCase().includes(query) ||
        stock.name.toLowerCase().includes(query) ||
        stock.sector.toLowerCase().includes(query)
      );
      setFilteredStocks(filtered.slice(0, 50)); // Limit to 50 results
    }
    setSelectedIndex(-1);
  }, [searchQuery, stocks]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredStocks.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && filteredStocks[selectedIndex]) {
          handleSelect(filteredStocks[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
      default:
        break;
    }
  };

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0) {
      const element = document.getElementById(`stock-item-${selectedIndex}`);
      element?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIndex]);

  const handleSelect = (stock) => {
    onSelect(stock);
    setSearchQuery('');
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const getMarketBadgeColor = (market) => {
    switch (market) {
      case 'NSE':
      case 'BSE':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'NASDAQ':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'NYSE':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      case 'Mutual Fund':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getCurrencySymbol = (currency) => {
    return currency === 'USD' ? '$' : '₹';
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
        />
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
          <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Dropdown Results */}
      {isOpen && filteredStocks.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl max-h-96 overflow-y-auto">
          {/* Results Count */}
          <div className="px-4 py-2 border-b border-white/10 text-sm text-gray-400">
            {filteredStocks.length} {filteredStocks.length === 1 ? 'result' : 'results'}
            {searchQuery && ` for "${searchQuery}"`}
          </div>

          {/* Stock List */}
          <div className="py-2">
            {filteredStocks.map((stock, index) => (
              <div
                key={`${stock.symbol}-${stock.market}`}
                id={`stock-item-${index}`}
                onClick={() => handleSelect(stock)}
                className={`px-4 py-3 cursor-pointer transition-all ${
                  selectedIndex === index
                    ? 'bg-cyan-500/20 border-l-4 border-cyan-500'
                    : 'hover:bg-white/5 border-l-4 border-transparent'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left: Stock Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-white text-lg">
                        {stock.symbol}
                      </span>
                      <span className={`px-2 py-0.5 text-xs rounded border ${getMarketBadgeColor(stock.market)}`}>
                        {stock.market}
                      </span>
                    </div>
                    <div className="text-sm text-gray-300 truncate mb-1">
                      {stock.name}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Building2 className="h-3 w-3" />
                      <span>{stock.sector}</span>
                      {stock.marketCap !== 'Mutual Fund' && (
                        <>
                          <span className="text-gray-600">•</span>
                          <span>{stock.marketCap}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right: Price */}
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1 text-lg font-bold text-cyan-400">
                      <span className="text-sm">{getCurrencySymbol(stock.currency)}</span>
                      <span>{stock.price.toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {stock.currency}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {isOpen && searchQuery && filteredStocks.length === 0 && (
        <div className="absolute z-50 w-full mt-2 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl p-8 text-center">
          <TrendingUp className="h-12 w-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">
            No stocks found for "{searchQuery}"
          </p>
          <p className="text-gray-500 text-xs mt-1">
            Try searching by symbol, company name, or sector
          </p>
        </div>
      )}

      {/* Keyboard Hints */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 px-2">
          <div className="text-xs text-gray-500 flex items-center gap-4">
            <span>↑↓ Navigate</span>
            <span>Enter Select</span>
            <span>Esc Close</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockSearchDropdown;
