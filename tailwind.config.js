/** @type {import('tailwindcss').Config} */
module.exports = {
  // The brand token set: colours, Sarun Pro, radii, the 48px tap target.
  // tokens.css must be imported globally (see pages/_app.tsx) or every class
  // from this preset resolves to a colour with no channels and paints nothing.
  // Nothing is extended here on purpose: a colour that is not a token is not
  // a brand colour. Add it to @ethcali/design-tokens first.
  presets: [require('@ethcali/design-tokens/tailwind-preset')],
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  plugins: [],
}
