import { describe, it, expect } from 'vitest';
import {
  parsePrice,
  parseMileage,
  parseMPG,
  parseRating,
  normalizeCondition,
  extractBaseModel,
  detectDateColumn,
  computeValueScore,
  cleanDataset
} from './clean';

describe('Data Cleaning Utility Parsers', () => {
  describe('parsePrice', () => {
    it('parses dollar formatted strings correctly', () => {
      expect(parsePrice('$46,370')).toBe(46370);
      expect(parsePrice('$34,150')).toBe(34150);
      expect(parsePrice('25000')).toBe(25000);
      expect(parsePrice(' $ 19,999.50 ')).toBe(19999.5);
    });

    it('handles invalid or empty prices', () => {
      expect(parsePrice('')).toBeNull();
      expect(parsePrice(null)).toBeNull();
      expect(parsePrice(undefined)).toBeNull();
      expect(parsePrice('N/A')).toBeNull();
      expect(parsePrice('-500')).toBeNull();
    });
  });

  describe('parseMileage', () => {
    it('parses mileage strings with text and commas', () => {
      expect(parseMileage('10')).toBe(10);
      expect(parseMileage('15,400 mi')).toBe(15400);
      expect(parseMileage(' 120000 miles ')).toBe(120000);
    });

    it('handles dashes or invalid mileage', () => {
      expect(parseMileage('â€“')).toBeNull();
      expect(parseMileage('–')).toBeNull();
      expect(parseMileage('')).toBeNull();
      expect(parseMileage(null)).toBeNull();
    });
  });

  describe('parseMPG', () => {
    it('parses range MPG formats', () => {
      expect(parseMPG('19–25')).toEqual({ mpgCity: 19, mpgHighway: 25, mpgAvg: 22 });
      expect(parseMPG('30/38')).toEqual({ mpgCity: 30, mpgHighway: 38, mpgAvg: 34 });
      expect(parseMPG('28 city / 35 hwy')).toEqual({ mpgCity: 28, mpgHighway: 35, mpgAvg: 31.5 });
    });

    it('parses single number MPG', () => {
      expect(parseMPG('25')).toEqual({ mpgCity: 25, mpgHighway: 25, mpgAvg: 25 });
    });

    it('handles missing or hyphenated MPG', () => {
      expect(parseMPG('')).toEqual({ mpgCity: null, mpgHighway: null, mpgAvg: null });
      expect(parseMPG('â€“')).toEqual({ mpgCity: null, mpgHighway: null, mpgAvg: null });
      expect(parseMPG(null)).toEqual({ mpgCity: null, mpgHighway: null, mpgAvg: null });
    });
  });

  describe('normalizeCondition', () => {
    it('normalizes various condition strings', () => {
      expect(normalizeCondition('New')).toBe('New');
      expect(normalizeCondition('used')).toBe('Used');
      expect(normalizeCondition('Certified Pre-Owned')).toBe('Certified');
      expect(normalizeCondition('CERTIFIED')).toBe('Certified');
      expect(normalizeCondition('')).toBe('Used');
    });
  });

  describe('extractBaseModel', () => {
    it('extracts base model from trim level names', () => {
      expect(extractBaseModel('Ridgeline RTL')).toBe('Ridgeline');
      expect(extractBaseModel('CR-V Hybrid Sport')).toBe('CR-V');
      expect(extractBaseModel('Pilot TrailSport')).toBe('Pilot');
      expect(extractBaseModel('Civic LX')).toBe('Civic');
      expect(extractBaseModel('Accord EX-L')).toBe('Accord');
      expect(extractBaseModel('HR-V EX')).toBe('HR-V');
      expect(extractBaseModel('Passport Elite')).toBe('Passport');
    });
  });

  describe('detectDateColumn', () => {
    it('detects date headers case-insensitively', () => {
      expect(detectDateColumn(['Year', 'Make', 'Sale_Date', 'Price'])).toBe('Sale_Date');
      expect(detectDateColumn(['year', 'model', 'sold_date'])).toBe('sold_date');
      expect(detectDateColumn(['Year', 'Make', 'Model', 'Price'])).toBeNull();
    });
  });

  describe('computeValueScore', () => {
    it('calculates score based on ratings and price', () => {
      const score = computeValueScore(4.5, 4.8, 4.7, 24000);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('cleanDataset', () => {
    it('cleans dataset and removes duplicate VINs', () => {
      const rawRows = [
        {
          Year: '2023',
          Make: 'Honda',
          Model: 'Civic LX',
          Condition: 'New',
          Price: '$24,500',
          Consumer_Rating: '4.8',
          VIN: '1HGCR2F83HA000001'
        },
        {
          Year: '2023',
          Make: 'Honda',
          Model: 'Civic LX',
          Condition: 'New',
          Price: '$24,500',
          Consumer_Rating: '4.8',
          VIN: '1HGCR2F83HA000001' // Duplicate VIN
        }
      ];

      const result = cleanDataset(rawRows, ['Year', 'Make', 'Model', 'Condition', 'Price', 'Consumer_Rating', 'VIN']);
      expect(result.data.length).toBe(1);
      expect(result.report.duplicateVinsRemoved).toBe(1);
      expect(result.data[0].price).toBe(24500);
      expect(result.data[0].baseModel).toBe('Civic');
    });
  });
});
