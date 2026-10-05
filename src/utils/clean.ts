import type { CleanedCarRecord, CarCondition, DataQualityReport, RawCarRecord } from '../types';

/**
 * Strips currency symbols, commas, spaces and converts to numeric price.
 */
export function parsePrice(val: unknown): number | null {
  if (val === null || val === undefined) return null;
  const rawStr = String(val).trim();
  if (rawStr.startsWith('-') || rawStr.includes('-')) return null;
  const str = rawStr.replace(/[^0-9.]/g, '');
  if (!str) return null;
  const num = parseFloat(str);
  return isNaN(num) || num <= 0 ? null : num;
}

/**
 * Strips "mi", "miles", commas, spaces and converts to numeric mileage.
 */
export function parseMileage(val: unknown): number | null {
  if (val === null || val === undefined) return null;
  const str = String(val).replace(/[^0-9]/g, '').trim();
  if (!str) return null;
  const num = parseInt(str, 10);
  return isNaN(num) || num < 0 ? null : num;
}

/**
 * Parses MPG string representations like "28-35", "30/38", "28 city / 35 hwy", "25".
 */
export function parseMPG(val: unknown): { mpgCity: number | null; mpgHighway: number | null; mpgAvg: number | null } {
  if (!val) return { mpgCity: null, mpgHighway: null, mpgAvg: null };
  const str = String(val).replace(/â€“|–|—/g, '-').trim();
  if (!str || str === '-' || str.includes('–')) return { mpgCity: null, mpgHighway: null, mpgAvg: null };

  const matches = str.match(/\d+(\.\d+)?/g);
  if (!matches || matches.length === 0) {
    return { mpgCity: null, mpgHighway: null, mpgAvg: null };
  }

  const nums = matches.map(m => parseFloat(m)).filter(n => !isNaN(n) && n > 0);
  if (nums.length === 0) {
    return { mpgCity: null, mpgHighway: null, mpgAvg: null };
  }

  if (nums.length >= 2) {
    const mpgCity = nums[0];
    const mpgHighway = nums[1];
    const mpgAvg = parseFloat(((mpgCity + mpgHighway) / 2).toFixed(1));
    return { mpgCity, mpgHighway, mpgAvg };
  } else {
    const mpgSingle = nums[0];
    return { mpgCity: mpgSingle, mpgHighway: mpgSingle, mpgAvg: mpgSingle };
  }
}

/**
 * Parses rating to float, returning null if invalid or out of range.
 */
export function parseRating(val: unknown): number | null {
  if (val === null || val === undefined || val === '') return null;
  const num = parseFloat(String(val));
  if (isNaN(num) || num < 0 || num > 5) return null;
  return parseFloat(num.toFixed(1));
}

/**
 * Normalizes Condition string to 'New', 'Used', or 'Certified'.
 */
export function normalizeCondition(val: unknown): CarCondition {
  if (!val) return 'Used';
  const str = String(val).trim().toLowerCase();
  if (str.includes('new')) return 'New';
  if (str.includes('cert')) return 'Certified';
  return 'Used';
}

/**
 * Known Honda Base Models list for accurate classification.
 */
const KNOWN_HONDA_MODELS = [
  'Accord',
  'Civic',
  'CR-V',
  'Pilot',
  'HR-V',
  'Passport',
  'Odyssey',
  'Ridgeline',
  'Insight',
  'Clarity',
  'Fit',
  'Element',
  'S2000',
  'Prelude',
  'Crosstour',
  'CR-Z'
];

/**
 * Extracts clean base model name from raw model string.
 * e.g., "Ridgeline RTL" -> "Ridgeline", "CR-V Hybrid Sport" -> "CR-V"
 */
export function extractBaseModel(modelStr: unknown): string {
  if (!modelStr) return 'Other Honda';
  const str = String(modelStr).trim();
  
  // Direct matching against known models
  for (const base of KNOWN_HONDA_MODELS) {
    const pattern = new RegExp(`\\b${base.replace('-', '[- ]?')}\\b`, 'i');
    if (pattern.test(str)) {
      return base;
    }
  }

  // Fallback: take first word if no match
  const firstWord = str.split(' ')[0];
  return firstWord || 'Other';
}

/**
 * Detects if a date column exists in CSV headers.
 */
export function detectDateColumn(headers: string[]): string | null {
  const targetNames = ['sale_date', 'saledate', 'date', 'sold_date', 'solddate', 'listing_date', 'listingdate', 'sale date'];
  for (const header of headers) {
    const normalized = header.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (targetNames.includes(normalized)) {
      return header;
    }
  }
  return null;
}

/**
 * Computes Value Score (0 - 100) based on ratings and price tier factor.
 * Formula:
 * WeightedRating = (Value_For_Money_Rating*0.4 + Reliability_Rating*0.3 + Consumer_Rating*0.3) [range 0..5]
 * PriceTierFactor = 1 + log10(max(price, 10000) / 25000) * 0.25
 * ValueScore = (WeightedRating / 5.0) * (100 / PriceTierFactor)
 */
export function computeValueScore(
  valForMoney: number | null,
  reliability: number | null,
  consumerRating: number | null,
  price: number | null
): number | null {
  const rVal = valForMoney ?? 3.5;
  const rRel = reliability ?? 3.5;
  const rCon = consumerRating ?? 3.5;

  const weightedRating = rVal * 0.4 + rRel * 0.3 + rCon * 0.3; // 0 .. 5

  const refPrice = price && price > 0 ? price : 25000;
  const priceRatio = Math.max(refPrice, 5000) / 25000;
  const priceTierFactor = 1 + Math.log10(priceRatio) * 0.25;

  const score = (weightedRating / 5.0) * (100 / Math.max(priceTierFactor, 0.5));
  return parseFloat(Math.min(Math.max(score, 10), 99.9).toFixed(1));
}

/**
 * Main Data Cleaning Engine
 */
export function cleanDataset(rawRows: RawCarRecord[], headers: string[]): {
  data: CleanedCarRecord[];
  report: DataQualityReport;
} {
  const dateCol = detectDateColumn(headers);
  const seenVins = new Set<string>();
  let duplicateVinsRemoved = 0;
  let missingPriceCount = 0;
  let missingRatingCount = 0;

  const data: CleanedCarRecord[] = [];

  rawRows.forEach((row, idx) => {
    // Find column values ignoring case and special chars
    const getVal = (possibleKeys: string[]): unknown => {
      for (const pk of possibleKeys) {
        if (row[pk] !== undefined) return row[pk];
        // Case-insensitive fallback
        const lowerPk = pk.toLowerCase();
        for (const rk of Object.keys(row)) {
          if (rk.toLowerCase() === lowerPk || rk.toLowerCase().replace(/[^a-z0-9]/g, '') === lowerPk.replace(/[^a-z0-9]/g, '')) {
            return row[rk];
          }
        }
      }
      return null;
    };

    const vinRaw = String(getVal(['VIN', 'vin']) || '').trim().toUpperCase();
    if (vinRaw) {
      if (seenVins.has(vinRaw)) {
        duplicateVinsRemoved++;
        return; // Skip duplicate VIN
      }
      seenVins.add(vinRaw);
    }

    const price = parsePrice(getVal(['Price', 'price']));
    if (price === null) missingPriceCount++;

    const consumerRating = parseRating(getVal(['Consumer_Rating', 'Consumer Rating', 'consumer_rating']));
    if (consumerRating === null) missingRatingCount++;

    const rawYear = getVal(['Year', 'year']);
    const year = parseInt(String(rawYear), 10) || 2022;

    const make = String(getVal(['Make', 'make']) || 'Honda').trim();
    const model = String(getVal(['Model', 'model']) || 'Honda').trim();
    const baseModel = extractBaseModel(model);

    const condition = normalizeCondition(getVal(['Condition', 'condition']));
    const mileage = parseMileage(getVal(['Mileage', 'mileage']));
    
    const mpgRaw = getVal(['MPG', 'mpg']);
    const { mpgCity, mpgHighway, mpgAvg } = parseMPG(mpgRaw);

    const comfortRating = parseRating(getVal(['Comfort_Rating', 'Comfort Rating']));
    const interiorDesignRating = parseRating(getVal(['Interior_Design_Rating', 'Interior Design Rating']));
    const performanceRating = parseRating(getVal(['Performance_Rating', 'Performance Rating']));
    const valueForMoneyRating = parseRating(getVal(['Value_For_Money_Rating', 'Value For Money Rating']));
    const exteriorStylingRating = parseRating(getVal(['Exterior_Styling_Rating', 'Exterior Styling Rating']));
    const reliabilityRating = parseRating(getVal(['Reliability_Rating', 'Reliability Rating']));

    const valueScore = computeValueScore(valueForMoneyRating, reliabilityRating, consumerRating, price);

    // Optional date parsing
    let saleDate: string | null = null;
    let saleMonth: string | null = null;
    if (dateCol) {
      const rawDate = getVal([dateCol]);
      if (rawDate) {
        const parsedDate = new Date(String(rawDate));
        if (!isNaN(parsedDate.getTime())) {
          saleDate = parsedDate.toISOString().split('T')[0];
          saleMonth = saleDate.substring(0, 7);
        }
      }
    }

    const record: CleanedCarRecord = {
      id: vinRaw || `car-${idx}-${Date.now()}`,
      year,
      make,
      model,
      baseModel,
      condition,
      price,
      consumerRating,
      consumerReviewCount: parseMileage(getVal(['Consumer_Review_#', 'Consumer Review Count', 'Consumer_Review_Count'])),
      exteriorColor: String(getVal(['Exterior_Color', 'Exterior Color']) || 'N/A').trim(),
      interiorColor: String(getVal(['Interior_Color', 'Interior Color']) || 'N/A').trim(),
      drivetrain: String(getVal(['Drivetrain', 'drivetrain']) || 'FWD').trim(),
      mpg: String(mpgRaw || 'N/A').trim(),
      mpgCity,
      mpgHighway,
      mpgAvg,
      fuelType: String(getVal(['Fuel_Type', 'Fuel Type']) || 'Gasoline').trim(),
      transmission: String(getVal(['Transmission', 'transmission']) || 'Automatic').trim(),
      engine: String(getVal(['Engine', 'engine']) || 'N/A').trim(),
      vin: vinRaw || `UNKNOWN-${idx}`,
      stockNo: String(getVal(['Stock_#', 'Stock Number', 'stock']) || 'N/A').trim(),
      mileage,
      comfortRating,
      interiorDesignRating,
      performanceRating,
      valueForMoneyRating,
      exteriorStylingRating,
      reliabilityRating,
      state: String(getVal(['State', 'state']) || 'CA').trim().toUpperCase(),
      sellerType: String(getVal(['Seller_Type', 'Seller Type']) || 'Dealer').trim(),
      saleDate,
      saleMonth,
      valueScore
    };

    data.push(record);
  });

  const report: DataQualityReport = {
    totalLoadedRows: rawRows.length,
    duplicateVinsRemoved,
    missingPriceCount,
    missingRatingCount,
    dateColumnDetected: Boolean(dateCol),
    dateColumnName: dateCol,
    validRowsCount: data.length
  };

  return { data, report };
}
