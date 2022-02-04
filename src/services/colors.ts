const numberToString = (n: number, base:number = 10, digits:number|undefined = undefined) => {
  const value = n.toString(base);
  let digitos = digits ?? value.length;
  if (value.length > digitos) digitos = value.length;
  return Array(digitos - value.length + 1).join('0') + value;
};
export const rgbToHex = (r:number, g:number, b:number) => {
  const red = numberToString(r, 16, 2);
  const green = numberToString(g, 16, 2);
  const blue = numberToString(b, 16, 2);
  return `#${red}${green}${blue}`;
};

export function hslToHex(h:number, s:number, la:number) {
  const l = la / 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n:number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0'); // convert to Hex and prefix "0" if needed
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}
const invertColor = (hex:string) => {
  let hexadecimal = hex.startsWith('#') ? hex.slice(1) : hex;
  if (hexadecimal.length === 3) {
    const [a, b, c] = hexadecimal.split('');
    hexadecimal = a + a + b + b + c + c;
  }
  if (hexadecimal.length !== 6) throw new Error('Invalid HEX color.');
  const [red, green, blue] = hexadecimal.match(/.{2}/g)?.slice() ?? [];
  const r = 255 - parseInt(red, 16);
  const g = 255 - parseInt(green, 16);
  const b = 255 - parseInt(blue, 16);
  return rgbToHex(r, g, b);
};

export default invertColor;
