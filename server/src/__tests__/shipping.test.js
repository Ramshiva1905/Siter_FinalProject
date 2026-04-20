const { calculateShippingCost, getWeightTierName, isNordicCountry, calculateTotalCost } = require('../utils/shipping');

describe('Shipping Cost Calculation', () => {
  describe('calculateShippingCost', () => {
    test('should calculate correct cost for basic tier (1kg)', () => {
      const cost = calculateShippingCost(1, 5); // Germany multiplier
      expect(cost).toBe(205); // 200 + (1 * 5)
    });

    test('should calculate correct cost for humble tier (2kg)', () => {
      const cost = calculateShippingCost(2, 5);
      expect(cost).toBe(210); // 200 + (2 * 5)
    });

    test('should calculate correct cost for deluxe tier (5kg)', () => {
      const cost = calculateShippingCost(5, 5);
      expect(cost).toBe(225); // 200 + (5 * 5)
    });

    test('should calculate correct cost for premium tier (8kg)', () => {
      const cost = calculateShippingCost(8, 5);
      expect(cost).toBe(240); // 200 + (8 * 5)
    });

    test('should calculate correct cost for Nordic countries (no multiplier)', () => {
      const cost = calculateShippingCost(5, 0);
      expect(cost).toBe(200); // 200 + (5 * 0)
    });

    test('should throw error for invalid weight', () => {
      expect(() => calculateShippingCost(3, 5)).toThrow('Invalid weight');
    });

    test('should throw error for missing parameters', () => {
      expect(() => calculateShippingCost()).toThrow('Weight and multiplier are required');
    });
  });

  describe('getWeightTierName', () => {
    test('should return correct tier names', () => {
      expect(getWeightTierName(1)).toBe('Basic');
      expect(getWeightTierName(2)).toBe('Humble');
      expect(getWeightTierName(5)).toBe('Deluxe');
      expect(getWeightTierName(8)).toBe('Premium');
      expect(getWeightTierName(3)).toBe('Unknown');
    });
  });

  describe('isNordicCountry', () => {
    test('should identify Nordic countries correctly', () => {
      expect(isNordicCountry('Norway')).toBe(true);
      expect(isNordicCountry('sweden')).toBe(true);
      expect(isNordicCountry('DENMARK')).toBe(true);
      expect(isNordicCountry('Germany')).toBe(false);
    });
  });

  describe('calculateTotalCost', () => {
    test('should calculate total cost for multiple shipments', () => {
      const shipments = [
        { totalCost: 225 },
        { totalCost: 240 },
        { totalCost: 200 }
      ];
      expect(calculateTotalCost(shipments)).toBe(665);
    });

    test('should return 0 for empty array', () => {
      expect(calculateTotalCost([])).toBe(0);
    });
  });
});
