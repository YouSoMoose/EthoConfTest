/*
  formulas.js
  ----------------
  EPA-based formulas (translated from the provided data).
  Exports:
    - computeTotalsFromResponses(resp): returns detailed emission totals (lbs and kg/year)
    - computeTotalPoints(resp): returns a compact points score (lower is better)

  Notes:
  - All emissions are calculated on an annual basis unless otherwise noted.
  - Tweak `POINT_KG_SCALE` to change points sensitivity (kg -> 1 point per N kg).
*/

// Conversion helpers
const LB_TO_KG = 0.45359237;

// Constants from the data you provided
export const GASOLINE_LBS_PER_GALLON = 19.37; // lbs CO2 / gallon
export const NON_CO2_MULTIPLIER = 1.013685;
export const DEFAULT_MPG = 24.8;
export const DEFAULT_MILES_PER_WEEK = 208.6;
export const PRICE_PER_GALLON_GAS = 3.685; // $

export const NATGAS_LBS_PER_1000CF = 121.08; // lbs CO2 / 1,000 cf
export const NATGAS_LBS_PER_THERM = 11.66; // lbs CO2 / therm
export const NATGAS_PRICE_PER_1000CF = 15.23; // $

export const ELECTRICITY_PRICE_PER_KWH = 0.1609; // $
export const NATIONAL_EGRID_LBS_PER_MWH = 827.52; // lbs CO2e / MWh
export const NATIONAL_EGRID_LBS_PER_KWH = NATIONAL_EGRID_LBS_PER_MWH / 1000; // lbs/kWh (0.82752)

export const FUEL_OIL_LBS_PER_GALLON = 22.457; // lbs CO2 / gallon
export const PROPANE_LBS_PER_GALLON = 12.677; // lbs CO2 / gallon

export const BASELINE_WASTE_LBS_PER_PERSON = 822.3; // lbs CO2e / person / yr

// Recycling per-person savings (lbs/person/yr)
export const RECYCLING_SAVINGS_PER_PERSON = {
  metal: -120.6,
  plastic: -72.9,
  glass: -19.2,
  newspaper: -119.0,
  magazines: -85.0
};

// Reduction action defaults
export const AC_SHARE_ELECTRICITY = 0.1945; // 19.45%

// Point scaling: 1 point per N kg CO2 (lower is better). Tune for gameplay.
export const POINT_KG_SCALE = 100; // 100 kg CO2 -> 1 point

// Vehicle emissions (annual lbs CO2e)
export function vehicleEmissions({ milesPerWeek = DEFAULT_MILES_PER_WEEK, mpg = DEFAULT_MPG, maintenance = true } = {}) {
  const milesPerYear = (milesPerWeek || 0) * 52;
  const gallons = mpg > 0 ? milesPerYear / mpg : 0;
  const baseLbs = gallons * GASOLINE_LBS_PER_GALLON * NON_CO2_MULTIPLIER;
  // If maintenance=false, apply efficiency penalty of +1.6% (i.e., multiply by 1.016)
  const adjusted = maintenance === false ? baseLbs * 1.016 : baseLbs;
  return { milesPerYear, gallons, lbsPerYear: adjusted };
}

// Natural gas (annual lbs CO2e) — supports either dollars-per-month, monthly_cf, or monthly_therms
export function naturalGasEmissions({ monthlyBill, monthlyCf, monthlyTherms } = {}) {
  let annualLbs = 0;
  if (monthlyBill != null) {
    const monthly1000cf = monthlyBill / NATGAS_PRICE_PER_1000CF; // thousands of cf
    annualLbs = monthly1000cf * NATGAS_LBS_PER_1000CF * 12;
  } else if (monthlyCf != null) {
    annualLbs = (monthlyCf / 1000) * NATGAS_LBS_PER_1000CF * 12;
  } else if (monthlyTherms != null) {
    annualLbs = monthlyTherms * NATGAS_LBS_PER_THERM * 12;
  }
  return { lbsPerYear: annualLbs };
}

// Electricity (annual lbs CO2e) — supports monthly bill or monthly kWh; accepts egridLbsPerKwh override
export function electricityEmissions({ monthlyBill, monthlyKwh, egridLbsPerKwh = NATIONAL_EGRID_LBS_PER_KWH, percentGreen = 0 } = {}) {
  let annualLbs = 0;
  if (monthlyBill != null) {
    const monthlyK = monthlyBill / ELECTRICITY_PRICE_PER_KWH;
    annualLbs = monthlyK * egridLbsPerKwh * 12;
  } else if (monthlyKwh != null) {
    annualLbs = monthlyKwh * egridLbsPerKwh * 12;
  }
  // adjust for green power share
  const adjusted = annualLbs * (1 - (percentGreen || 0));
  return { lbsPerYear: adjusted };
}

// Fuel oil
export function fuelOilEmissions({ monthlyGallons } = {}) {
  const annualLbs = (monthlyGallons || 0) * FUEL_OIL_LBS_PER_GALLON * 12;
  return { lbsPerYear: annualLbs };
}

// Propane
export function propaneEmissions({ monthlyGallons } = {}) {
  const annualLbs = (monthlyGallons || 0) * PROPANE_LBS_PER_GALLON * 12;
  return { lbsPerYear: annualLbs };
}

// Waste & recycling
export function wasteEmissions({ householdSize = 1, recycling = {} } = {}) {
  const baseline = BASELINE_WASTE_LBS_PER_PERSON * (householdSize || 1);
  let savings = 0;
  for (const [k, v] of Object.entries(RECYCLING_SAVINGS_PER_PERSON)) {
    if (recycling[k]) savings += v * (householdSize || 1);
  }
  const net = baseline + savings; // savings are negative numbers
  return { lbsPerYear: net, baseline, savings };
}

// Reduction actions helpers (returns lbs saved per year)
export function maintenanceSavings({ milesPerWeek = DEFAULT_MILES_PER_WEEK, mpg = DEFAULT_MPG } = {}) {
  const veh = vehicleEmissions({ milesPerWeek, mpg, maintenance: true });
  const savings = veh.lbsPerYear * 0.016; // 1.6% efficiency gain
  const costSavings = ((milesPerWeek * 52) / mpg) * PRICE_PER_GALLON_GAS * 0.016;
  return { lbsSavedPerYear: savings, costSavedPerYear: costSavings };
}

export function thermostatHeatingSavings({ currentHeatingLbs = 0, degreesSetback = 1 } = {}) {
  // 3% per degree
  const frac = 0.03 * (degreesSetback || 0);
  return { lbsSavedPerYear: currentHeatingLbs * frac };
}

export function thermostatCoolingSavings({ currentElectricityLbs = 0, degreesSetback = 1 } = {}) {
  // AC share times 6% per degree
  const frac = AC_SHARE_ELECTRICITY * 0.06 * (degreesSetback || 0);
  return { lbsSavedPerYear: currentElectricityLbs * frac };
}

export function computerSleepSavings({ egridLbsPerKwh = NATIONAL_EGRID_LBS_PER_KWH } = {}) {
  const kwh = 43;
  return { lbsSavedPerYear: kwh * egridLbsPerKwh };
}

export function ledBulbSavings({ bulbs = 1, egridLbsPerKwh = NATIONAL_EGRID_LBS_PER_KWH } = {}) {
  const kwhPerBulb = 37;
  const lbsSaved = bulbs * kwhPerBulb * egridLbsPerKwh;
  const costSaved = bulbs * 5; // $5/bulb/yr approximation
  return { lbsSavedPerYear: lbsSaved, costSavedPerYear: costSaved };
}

export function energyStarFridgeSavings({ egridLbsPerKwh = NATIONAL_EGRID_LBS_PER_KWH } = {}) {
  const kwhSaved = 617.4 - 488; // 129.4 kWh/yr
  return { lbsSavedPerYear: kwhSaved * egridLbsPerKwh, kwhSaved };
}

// Aggregate compute function
export function computeTotalsFromResponses(resp = {}) {
  // resp is expected to contain keys for the question fields used in the UI.
  // Example fields handled: milesPerWeek, mpg, maintenance, monthlyElectricityKwh,
  // monthlyElectricityBill, monthlyGasCf, monthlyGasTherms, monthlyGasBill,
  // monthlyFuelOilGallons, monthlyPropaneGallons, householdSize, recycling (object), percentGreen

  const householdSize = resp.householdSize || 1;

  const vehicle = vehicleEmissions({ milesPerWeek: resp.milesPerWeek, mpg: resp.mpg, maintenance: resp.maintenance });
  const natgas = naturalGasEmissions({ monthlyBill: resp.natgasMonthlyBill, monthlyCf: resp.natgasMonthlyCf, monthlyTherms: resp.natgasMonthlyTherms });
  const electricity = electricityEmissions({ monthlyBill: resp.electricityMonthlyBill, monthlyKwh: resp.monthlyElectricityKwh, egridLbsPerKwh: resp.egridLbsPerKwh ?? NATIONAL_EGRID_LBS_PER_KWH, percentGreen: resp.percentGreen || 0 });
  const fuelOil = fuelOilEmissions({ monthlyGallons: resp.fuelOilMonthlyGallons });
  const propane = propaneEmissions({ monthlyGallons: resp.propaneMonthlyGallons });
  const waste = wasteEmissions({ householdSize, recycling: resp.recycling || {} });

  // Sum household-level lbs/year
  let householdLbs = (vehicle.lbsPerYear || 0) + (natgas.lbsPerYear || 0) + (electricity.lbsPerYear || 0) + (fuelOil.lbsPerYear || 0) + (propane.lbsPerYear || 0) + (waste.lbsPerYear || 0);

  // allow callers to supply small additional lbs (e.g., diet/takeout approximations)
  if (resp.additionalLbs) {
    householdLbs += resp.additionalLbs;
  }

  const householdKg = householdLbs * LB_TO_KG;
  const perPersonKg = householdKg / (householdSize || 1);

  return {
    household: {
      lbsPerYear: householdLbs,
      kgPerYear: householdKg
    },
    perPerson: {
      kgPerYear: perPersonKg,
      lbsPerYear: householdLbs / (householdSize || 1)
    },
    breakdown: { vehicle, natgas, electricity, fuelOil, propane, waste }
  };
}

// Map kg CO2/year to points (lower is better). Returns an object with points and metadata.
export function computeTotalPoints(resp = {}) {
  const totals = computeTotalsFromResponses(resp);
  const perPersonKg = totals.perPerson.kgPerYear;
  const points = Math.max(0, Math.round(perPersonKg / POINT_KG_SCALE));
  return { points, perPersonKg, householdKg: totals.household.kgPerYear };
}
