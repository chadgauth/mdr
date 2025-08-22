import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: [
    'index.js',
    'App.tsx',
    'src/App.tsx',
    'scripts/**/*.js',
    '**/*.test.{ts,tsx,js,jsx}',
    '**/*.spec.{ts,tsx,js,jsx}',
  ],
  project: [
    'src/**/*.{ts,tsx,js,jsx}',
    'scripts/**/*.{ts,tsx,js,jsx}',
    '!src/**/*.test.{ts,tsx,js,jsx}',
    '!src/**/*.spec.{ts,tsx,js,jsx}',
  ],
  ignore: [
    // React Native specific files
    'metro.config.js',
    'babel.config.js',
    'react-native.config.js',
    'jest.config.js',
    
    // Build directories
    'android/**',
    'ios/**',
    'node_modules/**',
    '.bundle/**',
    
    // Config files
    '.eslintrc.js',
    '.prettierrc.js',
    'app.json',
    
    // Documentation
    '*.md',
    
    // Development files that may not be directly imported
    'scripts/validate-build.js',
    'scripts/analyze-unused-files.js',
  ],
  ignoreExportsUsedInFile: true,
  ignoreDependencies: [
    // React Native core dependencies that are used implicitly
    'react-native',
    '@react-native/metro-config',
    '@react-native/babel-preset',
    '@react-native/typescript-config',
    '@react-native/eslint-config',
    
    // Build and development tools
    'metro-react-native-babel-preset',
    'react-test-renderer',
    '@babel/core',
    '@babel/preset-env',
    '@babel/runtime',
    
    // Testing dependencies
    'jest',
    '@types/jest',
    
    // TypeScript and linting
    'typescript',
    'eslint',
    'prettier',
    
    // Tools that are used via CLI
    'ts-prune',
    'knip',
  ],
  workspaces: {
    '.': {
      entry: [
        'index.js',
        'App.tsx',
        'src/App.tsx',
      ],
      project: [
        'src/**/*.{ts,tsx,js,jsx}',
      ],
    },
  },
  rules: {
    files: 'error',
    dependencies: 'error',
    unlisted: 'error',
    exports: 'error',
    nsExports: 'error',
    classMembers: 'warn',
    types: 'error',
    nsTypes: 'error',
    enumMembers: 'warn',
    duplicates: 'error',
  },
  exclude: [
    'unlisted', // React Native projects often have implicit dependencies
  ],
};

export default config;