/**
 *
 * @param {string} input
 * @returns {string}
 */
const decodeHTML = (input) => {
  const el = document.createElement('div');
  el.innerHTML = input;
  return el.innerHTML;
};

export default decodeHTML;
