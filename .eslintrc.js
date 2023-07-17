module.exports = {
  extends: [
    '@llc1123',
    '@llc1123/eslint-config/react',
    '@llc1123/eslint-config/prettier',
  ],
  rules: {
    '@typescript-eslint/prefer-optional-chain': ['off'],
    'react/self-closing-comp': ['error', { component: true, html: true }],
  },
}
