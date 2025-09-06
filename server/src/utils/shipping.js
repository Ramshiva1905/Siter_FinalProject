// Shipping cost calculation utilities

const FLAT_FEE = 200; // 200 Kr flat fee for all shipments
const NORDIC_COUNTRIES = ['norway', 'sweden', 'denmark'];

/**
 * Calculate shipping cost based on weight and country multiplier
 * Formula: Total cost = Flat fee + (weight * multiplier)
 * 
 * @param {number} weight - Weight in kg (1, 2, 5, or 8)
 * @param {number} multiplier - Country multiplier
 * @returns {number} Total shipping cost in Kr
 */
const calculateShippingCost = (weight, multiplier) => {
  if (!weight || !multiplier) {
    throw new Error('Weight and multiplier are required');
  }

  // Validate weight tiers
  const validWeights = [1, 2, 5, 8];
  if (!validWeights.includes(weight)) {
    throw new Error('Invalid weight. Must be 1, 2, 5, or 8 kg');
  }

  return FLAT_FEE + (weight * multiplier);
};

/**
 * Get weight tier name based on weight
 * @param {number} weight - Weight in kg
 * @returns {string} Tier name
 */
const getWeightTierName = (weight) => {
  switch (weight) {
    case 1: return 'Basic';
    case 2: return 'Humble';
    case 5: return 'Deluxe';
    case 8: return 'Premium';
    default: return 'Unknown';
  }
};

/**
 * Check if country is a Nordic country (flat fee only)
 * @param {string} countryName - Country name
 * @returns {boolean} True if Nordic country
 */
const isNordicCountry = (countryName) => {
  return NORDIC_COUNTRIES.includes(countryName.toLowerCase());
};

/**
 * Calculate total cost for multiple shipments
 * @param {Array} shipments - Array of shipment objects
 * @returns {number} Total cost
 */
const calculateTotalCost = (shipments) => {
  return shipments.reduce((total, shipment) => total + shipment.totalCost, 0);
};

module.exports = {
  calculateShippingCost,
  getWeightTierName,
  isNordicCountry,
  calculateTotalCost,
  FLAT_FEE
};
