const API_BASE_URL = 'http://localhost:5001/api';

// Get all holdings
export const getHoldings = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/holdings`);
    if (!response.ok) {
      throw new Error('Failed to fetch holdings');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching holdings:', error);
    throw error;
  }
};

// Add new holding
export const addHolding = async (holding) => {
  try {
    const response = await fetch(`${API_BASE_URL}/holdings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(holding),
    });
    if (!response.ok) {
      throw new Error('Failed to add holding');
    }
    return await response.json();
  } catch (error) {
    console.error('Error adding holding:', error);
    throw error;
  }
};

// Update holding
export const updateHolding = async (id, updates) => {
  try {
    const response = await fetch(`${API_BASE_URL}/holdings/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      throw new Error('Failed to update holding');
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating holding:', error);
    throw error;
  }
};

// Delete holding
export const deleteHolding = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/holdings/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete holding');
    }
    return await response.json();
  } catch (error) {
    console.error('Error deleting holding:', error);
    throw error;
  }
};

// Get portfolio metrics
export const getPortfolioMetrics = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/portfolio/metrics`);
    if (!response.ok) {
      throw new Error('Failed to fetch metrics');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching metrics:', error);
    throw error;
  }
};