const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const fs = require('fs');
const path = require('path');

/**
 * Metro configuration for MDR development with dead code analysis
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  serializer: {
    createModuleIdFactory: function() {
      const moduleMap = new Map();
      let nextId = 0;
      
      return function(modulePath) {
        if (!moduleMap.has(modulePath)) {
          moduleMap.set(modulePath, nextId++);
          
          // Log module usage for dead code analysis
          if (process.env.ANALYZE_BUNDLE) {
            const logPath = path.join(__dirname, 'bundle-analysis.json');
            let bundleLog = [];
            
            try {
              if (fs.existsSync(logPath)) {
                bundleLog = JSON.parse(fs.readFileSync(logPath, 'utf8'));
              }
            } catch (error) {
              bundleLog = [];
            }
            
            const moduleInfo = {
              path: modulePath,
              id: moduleMap.get(modulePath),
              timestamp: Date.now(),
              relativePath: path.relative(__dirname, modulePath)
            };
            
            bundleLog.push(moduleInfo);
            
            try {
              fs.writeFileSync(logPath, JSON.stringify(bundleLog, null, 2));
            } catch (error) {
              console.warn('Failed to write bundle analysis:', error.message);
            }
          }
        }
        
        return moduleMap.get(modulePath);
      };
    },
    
    processModuleFilter: function(module) {
      // Filter out test files and development-only modules from production builds
      if (process.env.NODE_ENV === 'production') {
        const modulePath = module.path;
        
        // Exclude test files
        if (modulePath.includes('__tests__') ||
            modulePath.includes('.test.') ||
            modulePath.includes('.spec.')) {
          return false;
        }
        
        // Exclude development tools
        if (modulePath.includes('react-devtools') ||
            modulePath.includes('flipper') ||
            modulePath.includes('@react-native-community/cli')) {
          return false;
        }
      }
      
      return true;
    }
  },
  
  resolver: {
    // Add source extensions for better tree shaking
    sourceExts: ['ts', 'tsx', 'js', 'jsx', 'json'],
    
    // Resolve aliases to help with import analysis
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@stores': path.resolve(__dirname, 'src/stores'),
      '@systems': path.resolve(__dirname, 'src/systems'),
      '@types': path.resolve(__dirname, 'src/types'),
      '@utils': path.resolve(__dirname, 'src/utils'),
    }
  }
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
