export default function deepEqual(elem1:any, elem2:any) {
  if (typeof elem1 !== typeof elem2) return false;
  if (typeof elem1 === 'number' && Number.isNaN(elem1) && Number.isNaN(elem2)) return true;
  if (typeof elem1 === 'number' && (Number.isNaN(elem1) || Number.isNaN(elem2))) return false;
  if (typeof elem1 !== 'object') return elem1 === elem2;
  if (elem1 === elem2) return true;
  if (elem1 === null || elem2 === null) return false;
  if (Array.isArray(elem1)) {
    if (!Array.isArray(elem2)) return false;
    if (elem1.length !== elem2.length) return false;
    for (let i = 0; i < elem1.length; i++) { if (!deepEqual(elem1[i], elem2[i])) return false; }
    return true;
  }
  const keysElem1 = Object.keys(elem1);
  const keysElem2 = Object.keys(elem2);
  if (keysElem1.length !== keysElem2.length) return false;
  for (let i = 0; i < keysElem1.length; i++) {
    if (!(keysElem1[i] in elem2)) return false;
    if (!deepEqual(elem1[keysElem1[i]], elem2[keysElem1[i]])) return false;
  }
  return true;
}
