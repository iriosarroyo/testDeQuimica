const keys = [
  'm6t3xlqm61ck0rs6rwpjljwyy23zyz0neghtxujisl42v67b',
  '22bvg4vpelbriqc6demhqe0bdz4ekqvbotjmaezorl0wj8ht',
  'vm9m025dy0h77rchkxh4trb7624lyvkjke0c4e7ddvha86aa',
  '91lndf2w1iu75nmc6rx1ldxa61ywt6i61i6jn0t9atw32qg8',
  '0w4twt95wrk35nma6q028at83e7waalqi4b0pyhopx922h2i',
  '23btnimdhepyr0oz0u8il59mnhpldttrqcw1f3for0ioe165',
  '62k45bny6ae3elf9urhe07mirlnojv6p48w5dbd7ov2e77u8',
  'b2lt4bbsfkn487858c1kyknj102eay78u5xbkskte2eoqkfa',
];

if (new Date(2025, 0, 1).getTime() > Date.now()) {
  keys.splice(0, 1);
}

const key = keys[Math.floor(Math.random() * keys.length)];
export default key;
