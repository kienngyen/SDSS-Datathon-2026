// using ESM syntax because package.json sets "type": "module"
// ESM syntax, use the new @tailwindcss/postcss wrapper as noted by the warning
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};
