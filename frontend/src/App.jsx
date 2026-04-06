import React, { useState, useEffect } from 'react';
import { TrendingUp, Plus, Edit2, Trash2, RefreshCw, DollarSign, IndianRupee, ChevronRight, AlertCircle, CheckCircle, Info } from 'lucide-react';
import StockSearchDropdown from './components/StockSearchDropdown';
import { stocksData } from './data/stocksData';
import { useCurrency } from './context/CurrencyContext';
import * as api from './services/api';// Optimizing app.jsx structure
Shortening and optimizing app.jsx

function App() {
  const { currency, toggleCurrency, getCurrencySymbol } = useCurrency();//Adding a comment to app.jsx
  
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('portfolio');
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // New holding form state
  const [newHolding, setNewHolding] = useState({
    asset_name: '',
    symbol: '',
    asset_type: 'Stock',
    quantity: '',
    buy_price: '',
    current_price: '',
    currency: 'INR',
    market: 'NSE',
    sector: ''
  });

  // Fetch holdings on mount
  useEffect(() => {
    fetchHoldings();
  }, []);

  const fetchHoldings = async () => {
    try {
      setLoading(true);
      const data = await api.getHoldings();
      setHoldings(data);
      setError(null);
    } catch (err) {
      setError('Failed to load portfolio data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStockSelect = (stock) => {
    setNewHolding({
      asset_name: stock.name,
      symbol: stock.symbol,
      asset_type: stock.market === 'Mutual Fund' ? 'Mutual Fund' : 'Stock',
      quantity: '',
      buy_price: stock.price,
      current_price: stock.price,
      currency: stock.currency,
      market: stock.market,
      sector: stock.sector
    });
    setShowAddForm(true);
  };

  const handleAddHolding = async () => {
    if (!newHolding.quantity || !newHolding.buy_price) {
      alert('Please fill in quantity and buy price');
      return;
    }

    try {
      const holdingData = {
        name: newHolding.asset_name,
        symbol: newHolding.symbol,
        type: newHolding.asset_type,
        quantity: parseFloat(newHolding.quantity),
        buyPrice: parseFloat(newHolding.buy_price),
        currentPrice: parseFloat(newHolding.current_price),
        currency: newHolding.currency,
        market: newHolding.market,
        sector: newHolding.sector
      };

      await api.addHolding(holdingData);
      await fetchHoldings();
      
      setNewHolding({
        asset_name: '',
        symbol: '',
        asset_type: 'Stock',
        quantity: '',
        buy_price: '',
        current_price: '',
        currency: 'INR',
        market: 'NSE',
        sector: ''
      });
      setShowAddForm(false);
    } catch (err) {
      alert('Failed to add holding');
      console.error(err);
    }
  };

  const handleDeleteHolding = async (id) => {
    if (!confirm('Are you sure you want to delete this holding?')) return;
    
    try {
      await api.deleteHolding(id);
      await fetchHoldings();
    } catch (err) {
      alert('Failed to delete holding');
      console.error(err);
    }
  };

  const handleUpdateHolding = async (id, updates) => {
    try {
      await api.updateHolding(id, updates);
      await fetchHoldings();
      setEditingId(null);
    } catch (err) {
      alert('Failed to update holding');
      console.error(err);
    }
  };

  // Calculate portfolio metrics
  const calculateMetrics = () => {
    let totalInvestmentINR = 0;
    let currentValueINR = 0;

    holdings.forEach(h => {
      const invested = h.quantity * h.buyPrice;
      const value = h.quantity * h.currentPrice;
      
      // Convert everything to INR first for baseline calculation
      if (h.currency === 'USD') {
        totalInvestmentINR += invested * 83.25;
        currentValueINR += value * 83.25;
      } else {
        totalInvestmentINR += invested;
        currentValueINR += value;
      }
    });

    // Convert to display currency if needed
    let totalInvestment = totalInvestmentINR;
    let currentValue = currentValueINR;
    
    if (currency === 'USD') {
      totalInvestment = totalInvestmentINR / 83.25;
      currentValue = currentValueINR / 83.25;
    }

    const gainLoss = currentValue - totalInvestment;
    const returnPercent = totalInvestment > 0 ? (gainLoss / totalInvestment) * 100 : 0;

    return { totalInvestment, currentValue, gainLoss, returnPercent };
  };

  const metrics = calculateMetrics();

  // Format currency for display
  const formatCurrency = (amount) => {
    const symbol = currency === 'USD' ? '$' : '₹';
    return `${symbol}${amount.toLocaleString('en-IN', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  // Generate AI-style insights
  // Generate Better AI-style insights
  const generateInsights = () => {
    if (!holdings || holdings.length === 0) return [];

    const insights = [];

    // Calculate portfolio metrics for insights
    const sectorMap = {};
    const currencyMap = { INR: 0, USD: 0 };
    let totalValueINR = 0;

    holdings.forEach(h => {
      const sector = h.sector || 'Unknown';
      const valueINR = h.quantity * h.currentPrice * (h.currency === 'USD' ? 83.25 : 1);
      
      sectorMap[sector] = (sectorMap[sector] || 0) + valueINR;
      currencyMap[h.currency] = (currencyMap[h.currency] || 0) + valueINR;
      totalValueINR += valueINR;
    });

    // 1. Tax-Loss Harvesting Opportunity
    const losers = holdings.filter(h => h.currentPrice < h.buyPrice * 0.95); // 5% loss
    if (losers.length > 0) {
      const biggestLoser = losers.sort((a, b) => 
        ((b.buyPrice - b.currentPrice) / b.buyPrice) - ((a.buyPrice - a.currentPrice) / a.buyPrice)
      )[0];
      const lossPercent = (((biggestLoser.buyPrice - biggestLoser.currentPrice) / biggestLoser.buyPrice) * 100).toFixed(1);
      
      insights.push({
        type: 'warning',
        message: `Tax-Loss Harvesting: ${biggestLoser.name} is down ${lossPercent}%. Consider selling for tax deduction and buying a similar ${biggestLoser.sector} stock.`
      });
    }

    // 2. Sector Concentration Risk
    // 2. Sector Concentration Risk
    const sortedSectors = Object.entries(sectorMap)
      .filter(([sector]) => sector !== 'Unknown')
      .sort((a, b) => b[1] - a[1]);

    if (sortedSectors.length === 0) return insights; // Skip if all are unknown

    const topSector = sortedSectors[0];
    const sectorPercent = ((topSector[1] / totalValueINR) * 100).toFixed(0);
    
    if (sectorPercent > 40) {
      insights.push({
        type: 'warning',
        message: `High Risk: ${topSector[0]} represents ${sectorPercent}% of your portfolio. Recommended max: 30%. Consider diversifying into other sectors.`
      });
    }

    // 3. Currency Risk Alert
    const usdPercent = ((currencyMap.USD / totalValueINR) * 100).toFixed(0);
    if (usdPercent > 50) {
      insights.push({
        type: 'info',
        message: `Currency Exposure: ${usdPercent}% in USD assets. INR/USD fluctuations will significantly impact your portfolio. Consider hedging.`
      });
    }

    // 4. Best Performer Recognition
    const performers = holdings.map(h => ({
      name: h.name,
      gain: ((h.currentPrice - h.buyPrice) / h.buyPrice) * 100,
      value: h.quantity * h.currentPrice * (h.currency === 'USD' ? 83.25 : 1)
    })).sort((a, b) => b.gain - a.gain);

    if (performers.length > 0 && performers[0].gain > 10) {
      const valuePercent = ((performers[0].value / totalValueINR) * 100).toFixed(0);
      insights.push({
        type: 'success',
        message: `Top Performer: ${performers[0].name} up ${performers[0].gain.toFixed(1)}% (${valuePercent}% of portfolio). Consider taking partial profits if overweight.`
      });
    }

    // 5. Diversification Score
    const diversificationScore = Math.min(holdings.length, 10);
    if (diversificationScore < 5) {
      insights.push({
        type: 'warning',
        message: `Low Diversification: Only ${holdings.length} holdings. Target: 8-12 stocks across 4+ sectors for optimal risk management.`
      });
    } else if (diversificationScore >= 8) {
      insights.push({
        type: 'success',
        message: `Well Diversified: ${holdings.length} holdings across ${Object.keys(sectorMap).length} sectors. Good risk distribution.`
      });
    }

    // 6. Rebalancing Suggestion
    if (holdings.length > 3 && sectorPercent > 35 && topSector[0] !== 'Unknown') {
      const targetValue = totalValueINR * 0.30;
      const excessINR = topSector[1] - targetValue;
      const excessDisplay = currency === 'USD' ? excessINR / 83.25 : excessINR;
      
      insights.push({
        type: 'info',
        message: `Rebalancing Needed: Reduce ${topSector[0]} by ${currency === 'USD' ? '$' : '₹'}${excessDisplay.toFixed(0)} to reach 30% target allocation.`
      });
    }

    // 7. Cost Basis Analysis (for stocks at/near buy price)
    const flatStocks = holdings.filter(h => 
      Math.abs(h.currentPrice - h.buyPrice) / h.buyPrice < 0.05
    );
    if (flatStocks.length > 0) {
      insights.push({
        type: 'info',
        message: `Opportunity: ${flatStocks[0].name} is near your buy price (${((flatStocks[0].currentPrice - flatStocks[0].buyPrice) / flatStocks[0].buyPrice * 100).toFixed(1)}%). Consider averaging ${flatStocks[0].currentPrice > flatStocks[0].buyPrice ? 'up' : 'down'}.`
      });
    }

    // Return top 4 insights
    return insights.slice(0, 4);
  };

  // Future projections
  // Future projections with Monte Carlo-style scenarios
  const calculateProjections = () => {
    const currentValue = metrics.currentValue;
    
    // Calculate portfolio's historical volatility estimate
    let portfolioVolatility = 0.15; // default 15%
    
    // Adjust based on portfolio composition
    const usdHoldings = holdings.filter(h => h.currency === 'USD').length;
    const techHoldings = holdings.filter(h => h.sector && h.sector.toLowerCase().includes('tech')).length;
    
    if (usdHoldings / holdings.length > 0.5) portfolioVolatility += 0.05; // More USD = more volatility
    if (techHoldings / holdings.length > 0.4) portfolioVolatility += 0.08; // More tech = more volatility
    
    const scenarios = [
      { 
        name: 'Bear Case', 
        rate: 0.03, 
        color: 'text-red-400',
        description: 'Market downturn, recession scenario'
      },
      { 
        name: 'Base Case', 
        rate: 0.10, 
        color: 'text-cyan-400',
        description: 'Historical average returns'
      },
      { 
        name: 'Bull Case', 
        rate: 0.18, 
        color: 'text-emerald-400',
        description: 'Strong growth, favorable markets'
      }
    ];

    const years = [1, 3, 5, 10];

    return scenarios.map(scenario => {
      const projections = years.map(year => {
        // Base compound growth
        const baseValue = currentValue * Math.pow(1 + scenario.rate, year);
        
        // Add volatility range (±1 standard deviation)
        const volatilityImpact = baseValue * portfolioVolatility * Math.sqrt(year);
        
        return {
          year,
          value: baseValue,
          lowRange: baseValue - volatilityImpact,
          highRange: baseValue + volatilityImpact,
          // Calculate inflation-adjusted value (assuming 3% inflation)
          realValue: baseValue / Math.pow(1.03, year)
        };
      });
      
      return {
        ...scenario,
        projections,
        annualReturn: (scenario.rate * 100).toFixed(0),
        volatility: (portfolioVolatility * 100).toFixed(0)
      };
    });
  };

  const projections = calculateProjections();
  const insights = generateInsights();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-cyan-400" />
            <h1 className="text-2xl font-bold">StockOne</h1>
          </div>
          <button className="text-sm text-gray-400 hover:text-white transition-colors">
            Sign in
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent leading-tight pb-2">
            Manage your portfolio.
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Real-time P/L, projections and AI-style insights — built for learning and real use.
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-lg p-6 hover:border-cyan-500/50 transition-all">
            <div className="text-sm text-gray-400 mb-2">Total Investment</div>
            <div className="text-3xl font-bold text-white">
              {formatCurrency(metrics.totalInvestment)}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-6 hover:border-cyan-500/50 transition-all">
            <div className="text-sm text-gray-400 mb-2">Current Value</div>
            <div className="text-3xl font-bold text-white">
              {formatCurrency(metrics.currentValue)}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-6 hover:border-cyan-500/50 transition-all">
            <div className="text-sm text-gray-400 mb-2">Return %</div>
            <div className={`text-3xl font-bold ${metrics.returnPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {metrics.returnPercent >= 0 ? '+' : ''}{metrics.returnPercent.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Currency Toggle */}
        <div className="flex justify-end mb-6">
          <button
            onClick={toggleCurrency}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all"
          >
            {currency === 'INR' ? (
              <>
                <IndianRupee className="h-4 w-4" />
                <span>INR</span>
              </>
            ) : (
              <>
                <DollarSign className="h-4 w-4" />
                <span>USD</span>
              </>
            )}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white/5 border border-white/10 rounded-lg mb-6">
          <div className="flex border-b border-white/10">
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`px-6 py-3 font-medium transition-all ${
                activeTab === 'portfolio'
                  ? 'text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Portfolio
            </button>
            <button
              onClick={() => setActiveTab('projections')}
              className={`px-6 py-3 font-medium transition-all ${
                activeTab === 'projections'
                  ? 'text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Projections
            </button>
            <button
              onClick={() => setActiveTab('insights')}
              className={`px-6 py-3 font-medium transition-all ${
                activeTab === 'insights'
                  ? 'text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Insights
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'portfolio' && (
              <div>
                {/* Search and Add Button */}
                <div className="flex gap-4 mb-6">
                  <div className="flex-1">
                    <StockSearchDropdown
                      stocks={stocksData}
                      onSelect={handleStockSelect}
                      placeholder="Search 120+ stocks, mutual funds..."
                    />
                  </div>
                  <button
                    onClick={() => fetchHoldings()}
                    className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all"
                  >
                    <RefreshCw className="h-5 w-5" />
                  </button>
                </div>

                {/* Add Holding Form */}
                {showAddForm && newHolding.symbol && (
                  <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-bold mb-4 text-cyan-400">
                      Add {newHolding.asset_name}
                    </h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Quantity</label>
                        <input
                          type="number"
                          value={newHolding.quantity}
                          onChange={(e) => setNewHolding({...newHolding, quantity: e.target.value})}
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                          placeholder="Enter quantity"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Buy Price ({newHolding.currency})</label>
                        <input
                          type="number"
                          value={newHolding.buy_price}
                          onChange={(e) => setNewHolding({...newHolding, buy_price: e.target.value})}
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                          placeholder="Enter buy price"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleAddHolding}
                        className="flex-1 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-all font-medium"
                      >
                        Add to Portfolio
                      </button>
                      <button
                        onClick={() => setShowAddForm(false)}
                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Holdings Table */}
                {holdings.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <TrendingUp className="h-16 w-16 mx-auto mb-4 text-gray-600" />
                    <p className="text-lg">No holdings yet</p>
                    <p className="text-sm mt-2">Search and add stocks to get started</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Asset</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Qty</th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Buy</th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Current</th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">P/L</th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {holdings.map((holding) => {
                          // Calculate P/L in native currency
                          const investedAmount = holding.quantity * holding.buyPrice;
                          const currentAmount = holding.quantity * holding.currentPrice;
                          const plAmount = currentAmount - investedAmount;
                          const plPercent = (plAmount / investedAmount) * 100;

                          // Convert everything to display currency
                          let displayBuyPrice, displayCurrentPrice, displayPL, displaySymbol;

                          if (currency === 'USD') {
                            // Display in USD
                            displaySymbol = '$';
                            if (holding.currency === 'USD') {
                              // USD stock, no conversion needed
                              displayBuyPrice = holding.buyPrice;
                              displayCurrentPrice = holding.currentPrice;
                              displayPL = plAmount;
                            } else {
                              // INR stock, convert to USD
                              displayBuyPrice = holding.buyPrice / 83.25;
                              displayCurrentPrice = holding.currentPrice / 83.25;
                              displayPL = plAmount / 83.25;
                            }
                          } else {
                            // Display in INR
                            displaySymbol = '₹';
                            if (holding.currency === 'INR') {
                              // INR stock, no conversion needed
                              displayBuyPrice = holding.buyPrice;
                              displayCurrentPrice = holding.currentPrice;
                              displayPL = plAmount;
                            } else {
                              // USD stock, convert to INR
                              displayBuyPrice = holding.buyPrice * 83.25;
                              displayCurrentPrice = holding.currentPrice * 83.25;
                              displayPL = plAmount * 83.25;
                            }
                          }

                          return (
                            <tr key={holding.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                              <td className="py-4 px-4">
                                <div>
                                  <div className="font-medium text-white">{holding.name}</div>
                                  <div className="text-sm text-gray-400">
                                    {holding.symbol}
                                    <span className="ml-2 px-1.5 py-0.5 text-xs bg-white/5 rounded">
                                      {holding.currency}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4 text-white">{holding.quantity}</td>
                              <td className="py-4 px-4 text-right text-gray-300">
                                {displaySymbol}{displayBuyPrice.toLocaleString('en-IN', { 
                                  minimumFractionDigits: 2, 
                                  maximumFractionDigits: 2 
                                })}
                              </td>
                              <td className="py-4 px-4 text-right text-white">
                                {displaySymbol}{displayCurrentPrice.toLocaleString('en-IN', { 
                                  minimumFractionDigits: 2, 
                                  maximumFractionDigits: 2 
                                })}
                              </td>
                              <td className="py-4 px-4 text-right">
                                <div className={plAmount >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                                  {displaySymbol}{displayPL.toLocaleString('en-IN', { 
                                    minimumFractionDigits: 2, 
                                    maximumFractionDigits: 2 
                                  })}
                                </div>
                                <div className={`text-xs ${plAmount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                  ({plPercent >= 0 ? '+' : ''}{plPercent.toFixed(2)}%)
                                </div>
                              </td>
                              <td className="py-4 px-4 text-right">
                                <button
                                  onClick={() => handleDeleteHolding(holding.id)}
                                  className="p-2 text-red-400 hover:bg-red-500/10 rounded transition-all"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'projections' && (
              <div>
                <div className="mb-6">
                  <p className="text-gray-400 mb-2">
                    Future value projections based on historical market returns and your portfolio composition
                  </p>
                  <p className="text-sm text-gray-500">
                    Ranges shown represent ±1 standard deviation based on estimated portfolio volatility
                  </p>
                </div>
                
                <div className="space-y-6">
                  {projections.map((scenario) => (
                    <div key={scenario.name} className="bg-white/5 border border-white/10 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className={`text-lg font-bold ${scenario.color}`}>
                            {scenario.name}
                          </h3>
                          <p className="text-sm text-gray-400 mt-1">{scenario.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-400">Annual Return</div>
                          <div className={`text-2xl font-bold ${scenario.color}`}>
                            {scenario.annualReturn}%
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4">
                        {scenario.projections.map((proj) => (
                          <div key={proj.year} className="bg-white/5 rounded-lg p-4">
                            <div className="text-sm text-gray-400 mb-2">
                              {proj.year} Year{proj.year > 1 ? 's' : ''}
                            </div>
                            <div className="text-xl font-bold text-white mb-2">
                              {formatCurrency(proj.value)}
                            </div>
                            <div className="text-xs text-gray-500 space-y-1">
                              <div>Range: {formatCurrency(proj.lowRange)} - {formatCurrency(proj.highRange)}</div>
                              <div className="text-amber-400">Real value: {formatCurrency(proj.realValue)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <p className="text-sm text-gray-300">
                    <strong>Note:</strong> Projections are estimates based on historical data. 
                    "Real value" accounts for 3% annual inflation. Actual returns may vary significantly. 
                    Past performance does not guarantee future results.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'insights' && (
              <div className="space-y-4 relative">
                {insights.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Info className="h-16 w-16 mx-auto mb-4 text-gray-600" />
                    <p>Add more holdings to get personalized insights</p>
                  </div>
                ) : (
                  insights.map((insight, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-4 p-4 rounded-lg border ${
                        insight.type === 'warning'
                          ? 'bg-amber-500/10 border-amber-500/30'
                          : insight.type === 'success'
                          ? 'bg-emerald-500/10 border-emerald-500/30'
                          : 'bg-cyan-500/10 border-cyan-500/30'
                      }`}
                    >
                      {insight.type === 'warning' && <AlertCircle className="h-5 w-5 text-amber-400 mt-0.5" />}
                      {insight.type === 'success' && <CheckCircle className="h-5 w-5 text-emerald-400 mt-0.5" />}
                      {insight.type === 'info' && <Info className="h-5 w-5 text-cyan-400 mt-0.5" />}
                      <p className="text-sm text-gray-200 flex-1">{insight.message}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
