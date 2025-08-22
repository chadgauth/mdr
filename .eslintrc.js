module.exports = {
  root: true,
  extends: '@react-native',
  plugins: ['unused-imports'],
  rules: {
    // Dead code detection rules
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'error',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
      },
    ],
    
    // Additional strictness for unused code
    'no-unused-vars': 'off', // Replaced by unused-imports/no-unused-vars
    'no-unreachable': 'error',
    'no-unreachable-loop': 'error',
    'no-useless-return': 'error',
    'no-useless-call': 'error',
    'no-useless-concat': 'error',
    'no-useless-escape': 'error',
    'no-useless-rename': 'error',
    'no-useless-computed-key': 'error',
    'no-useless-constructor': 'error',
    
    // Import organization
    'sort-imports': [
      'error',
      {
        ignoreCase: false,
        ignoreDeclarationSort: true,
        ignoreMemberSort: false,
        memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
      },
    ],
  },
};
