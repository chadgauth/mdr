module.exports = {
  // Asset configuration
  assets: ['./src/assets/'],
  
  // Dependency configuration (auto-linking will handle most of this)
  dependencies: {
    // Most dependencies are auto-linked in React Native 0.60+
    // Only add manual configurations if needed
  },
  
  // Project configuration
  project: {
    android: {
      appName: 'MDR',
      packageName: 'com.mdr',
    },
  },
};