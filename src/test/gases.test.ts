/* eslint-disable no-undef */
import { idealGas, unitConversion } from 'services/gases';

test('Ideal Gases', () => {
  expect(() => idealGas({})).toThrowError();
  expect(() => idealGas({ pres: 1 })).toThrowError();
  expect(() => idealGas({ pres: 1, vol: 1 })).toThrowError();
  expect(() => idealGas({ pres: 1, vol: 1, nMol: null })).toThrowError();
  expect(() => idealGas({ pres: null, vol: 1, nMol: null })).toThrowError();
  expect(() => idealGas({
    pres: null, vol: 1, nMol: null, temp: null,
  })).toThrowError();
  const gas1 = { nMol: 0.00831, pres: 1.01, temp: 298 };
  expect(idealGas(gas1)).toStrictEqual({ ...gas1, vol: 0.201 });
  const gas2 = {
    nMol: 0.00801, temp: 311, vol: 0.602, pres: null,
  };
  expect(idealGas(gas2)).toStrictEqual({ ...gas2, pres: 0.339 });
  const gas3 = { nMol: 2.1, pres: 1.25, vol: 25 };
  expect(idealGas(gas3)).toStrictEqual({ ...gas3, temp: 181 });
});

test('Unit Conversion', () => {
  expect(unitConversion(0, 'Kelvin', 'Kelvin')).toBe(0);
  expect(unitConversion(273, 'Kelvin', 'Kelvin')).toBe(273);
  expect(unitConversion(273, 'Kelvin', 'Celsius')).toBe(-0.15);
  expect(unitConversion(0, 'Kelvin', 'Celsius')).toBe(-273.15);
  expect(unitConversion(298.15, 'Kelvin', 'Celsius')).toBe(25);
  expect(unitConversion(-10, 'Celsius', 'Kelvin')).toBe(263.15);
  expect(unitConversion(400, 'Celsius', 'Kelvin')).toBe(673.15);
  expect(unitConversion(400, 'Celsius', 'Celsius')).toBe(400);
  expect(unitConversion(-273.15, 'Celsius', 'Fahrenheit')).toBe(-459.67);
  expect(unitConversion(-17.78, 'Celsius', 'Fahrenheit')).toBeCloseTo(0);
  expect(unitConversion(32, 'Fahrenheit', 'Celsius')).toBe(0);
  expect(unitConversion(98.6, 'Fahrenheit', 'Celsius')).toBe(37);
  expect(unitConversion(212, 'Fahrenheit', 'Celsius')).toBe(100);
  expect(unitConversion(32, 'Fahrenheit', 'Kelvin')).toBe(273.15);
  expect(unitConversion(98.6, 'Fahrenheit', 'Kelvin')).toBe(310.15);
  expect(unitConversion(212, 'Fahrenheit', 'Kelvin')).toBe(373.15);
});
