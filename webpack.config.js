module.exports = {
  stats: {
    errorDetails: true,
  },
  presets: ['@babel/preset-react'],
  plugins: ['@babel/plugin-syntax-dynamic-import'],
  https: process.env.HTTPS === 'true',
};
