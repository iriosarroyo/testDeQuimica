import { number } from 'mathjs';

type IdealGasProp = 'pres'|'temp'|'nMol' | 'vol'
type IdealGasIn = {
    [k in IdealGasProp]?: number|null
}
const R_IDEAL_GAS = 0.082;
const round = (val:number, pos:number = 2) => parseFloat(val.toPrecision(pos));
// Assuming p in atm, temp in K, n in mol and vol in L
export const idealGas = ({
  pres, temp, nMol, vol,
}:IdealGasIn, precision = 3) => {
  // Check how many are null or undefined
  if ([pres, temp, nMol, vol].filter((x) => x == null).length !== 1) {
    throw new Error('Only can have one property (pressure, temperature, n or volume) undefined');
  }
  // Check if pressure is null or undefined
  if (pres == null) {
    return {
      temp, nMol, vol, pres: round((nMol! * R_IDEAL_GAS * temp!) / vol!, precision),
    };
  }
  if (vol == null) {
    return {
      temp, nMol, pres, vol: round((nMol! * R_IDEAL_GAS * temp!) / pres!, precision),
    };
  }
  if (temp == null) {
    return {
      nMol, pres, vol, temp: round((pres! * vol!) / (nMol! * R_IDEAL_GAS), precision),
    };
  }
  return {
    temp, pres, vol, nMol: round((pres! * vol!) / (temp! * R_IDEAL_GAS), precision),
  };
};

const tempUnits = ['Kelvin', 'Celsius', 'Fahrenheit'] as const;
const tempUnitsSet = new Set(tempUnits);

type TempUnits = typeof tempUnits[number]

const PossibleUnitsToConvert = {
  Kelvin: tempUnitsSet,
  Celsius: tempUnitsSet,
  Fahrenheit: tempUnitsSet,
};
type Units = keyof typeof PossibleUnitsToConvert

const KELVIN_TO_CELSIUS = 273.15;
const FAREN_TO_CELSIUS_SUM = 32;
const FAREN_TO_CELSIUS_FACT = 1.8;
const convertToCelsius = (temp:number, unit:TempUnits) => {
  if (unit === 'Kelvin') return temp - KELVIN_TO_CELSIUS;
  if (unit === 'Fahrenheit') return (temp - FAREN_TO_CELSIUS_SUM) / FAREN_TO_CELSIUS_FACT;
  return temp;
};

const convertFromCelsius = (temp:number, unit: TempUnits) => {
  if (unit === 'Kelvin') return temp + KELVIN_TO_CELSIUS;
  if (unit === 'Fahrenheit') return (temp * FAREN_TO_CELSIUS_FACT) + FAREN_TO_CELSIUS_SUM;
  return temp;
};

const convertTemperature = (temp: number, unit1:TempUnits, unit2: TempUnits) => (
  convertFromCelsius(convertToCelsius(temp, unit1), unit2)
);

export const unitConversion = (val:number, unit1:Units, unit2: Units, precision = 10) => {
  if (!(unit1 in PossibleUnitsToConvert)) throw Error(`Non Valid Unit (${unit1})`);
  if (!PossibleUnitsToConvert[unit1].has(unit2)) throw Error(`Can't convert ${unit1} to ${unit2}`);
  if (tempUnitsSet.has(unit1)) return round(convertTemperature(val, unit1, unit2), precision);
};

export default undefined;
