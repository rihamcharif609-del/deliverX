const BASE_PRICE_MAD = 10;
const PRICE_PER_KM_MAD = 2;
const WEIGHT_SURCHARGE_OVER_2KG_MAD = 10;
const WEIGHT_SURCHARGE_OVER_5KG_MAD = 20;
const EXPRESS_SURCHARGE_MAD = 15;

/**
 * Fake distance (km) from pickup and delivery addresses until real geocoding is added.
 */
export function getFakeDistanceKm(pickupAddress, deliveryAddress) {
  const pickup = (pickupAddress || '').trim().toLowerCase();
  const delivery = (deliveryAddress || '').trim().toLowerCase();

  if (!pickup || !delivery) return 0;

  let hash = 0;
  const combined = `${pickup}|${delivery}`;
  for (let i = 0; i < combined.length; i += 1) {
    hash = (hash + combined.charCodeAt(i) * (i + 1)) % 1000;
  }

  return Math.max(3, Math.min(30, 3 + (hash % 28)));
}

function getWeightSurcharge(weightKg) {
  if (weightKg > 5) {
    return WEIGHT_SURCHARGE_OVER_2KG_MAD + WEIGHT_SURCHARGE_OVER_5KG_MAD;
  }
  if (weightKg > 2) {
    return WEIGHT_SURCHARGE_OVER_2KG_MAD;
  }
  return 0;
}

/**
 * @param {{ pickupAddress?: string, deliveryAddress?: string, packageWeight?: string|number, priority?: string }} params
 */
export function calculatePrice({ pickupAddress, deliveryAddress, packageWeight, priority }) {
  const distanceKm = getFakeDistanceKm(pickupAddress, deliveryAddress);
  const weightKg = parseFloat(packageWeight) || 0;
  const distanceFee = distanceKm * PRICE_PER_KM_MAD;
  const weightFee = getWeightSurcharge(weightKg);
  const expressFee = priority === 'express' ? EXPRESS_SURCHARGE_MAD : 0;

  const total = BASE_PRICE_MAD + distanceFee + weightFee + expressFee;

  return {
    total: Math.round(total * 100) / 100,
    distanceKm,
    breakdown: {
      base: BASE_PRICE_MAD,
      distance: distanceFee,
      weight: weightFee,
      express: expressFee,
    },
  };
}
