const fontSizes = {
  xxs: '.625rem',
  xs: '.75rem',
  sm: '.938rem',
  base: '1rem',
  lg: '1.063rem',
  xl: '1.25rem',
  '2xl': '1.438rem',
  '3xl': '1.688rem',
  '4xl': '2rem',
  '5xl': '2.5rem',
};

module.exports = {
  theme: {
    fontSize: fontSizes,
    extend: {
      spacing: {
        ...fontSizes,
      },
      zIndex: {
        '-1': '-1',
      },
      opacity: {
        20: '0.2',
        40: '0.4',
      },
    },
  },
  variants: {
    transitionProperty: ['responsive', 'hover', 'focus'],
  },
};