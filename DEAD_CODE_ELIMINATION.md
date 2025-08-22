# Dead Code Elimination for MDR Project

This document describes the dead code elimination system implemented for the MDR React Native project. The system automatically detects and prevents unused code from entering production builds.

## Overview

The dead code elimination system consists of multiple layers:

1. **TypeScript Strict Mode** - Catches unused variables and parameters
2. **ESLint Rules** - Detects unused imports and unreachable code
3. **ts-prune** - Finds unused exports across the codebase
4. **Metro Bundle Analysis** - Analyzes what code actually gets included in builds
5. **Automated Validation** - Fails builds if dead code is detected

## Tools and Configuration

### TypeScript Configuration

The [`tsconfig.json`](tsconfig.json:1) has been configured with strict mode enabled:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true
  }
}
```

### ESLint Configuration

The [`.eslintrc.js`](.eslintrc.js:1) includes rules for dead code detection:

- `unused-imports/no-unused-imports` - Removes unused imports
- `unused-imports/no-unused-vars` - Detects unused variables
- Additional rules for unreachable code and useless constructs

### ts-prune Configuration

The [`.tsprunerc`](.tsprunerc:1) file configures which files to analyze:

- Ignores build directories, tests, and configuration files
- Focuses on source code in the `src/` directory
- Skips default exports (common in React components)

### Metro Configuration

The [`metro.config.js`](metro.config.js:1) has been enhanced with:

- Bundle analysis logging when `ANALYZE_BUNDLE=true`
- Production build filtering to exclude test files
- Path aliases for cleaner imports

## Available Commands

### Quick Commands

```bash
# Check for dead code (fast)
npm run deadcode:find

# Check TypeScript compilation
npm run deadcode:typescript

# Run ESLint with zero warnings
npm run deadcode:lint

# Check for unused exports (fails build if found)
npm run deadcode:check

# Run all dead code checks
npm run deadcode:all
```

### Comprehensive Validation

```bash
# Full validation including tests and bundle analysis
npm run validate

# Validate before building
npm run build:validate

# Build with validation (fails if dead code found)
npm run build:test
```

## Understanding the Output

### TypeScript Errors

```
error TS6133: 'unusedVariable' is declared but its value is never read.
```

**Solution**: Remove the unused variable or prefix with underscore (`_unusedVariable`) if needed for type inference.

### ESLint Errors

```
error: 'ComponentName' is defined but never used (unused-imports/no-unused-vars)
```

**Solution**: Remove the unused import or export.

### ts-prune Output

```
src/utils/helper.ts:15 - unusedFunction
src/types/index.ts:42 - UnusedInterface
```

**Solution**: Remove unused exports or add them to the ignore list if they're intended for future use.

### Bundle Analysis

The validation script will show:

```
📊 Bundle contains 156 unique modules
⚠️  Found 2 potentially unnecessary modules:
  - src/components/TestComponent.story.tsx
  - src/utils/debugHelpers.ts
```

**Solution**: Ensure test files and development utilities aren't imported in production code.

## Integration with Build Process

### Pre-commit Hooks

The system automatically runs validation before commits:

```bash
npm run precommit  # Runs full validation
```

### Continuous Integration

For CI pipelines, use:

```bash
npm run ci  # Validates and builds
```

### Development Workflow

1. **During Development**: Run `npm run deadcode:find` periodically to check for unused code
2. **Before Commit**: The pre-commit hook will automatically validate
3. **Before Release**: Run `npm run validate` for comprehensive checking

## Configuration Options

### Ignoring False Positives

For TypeScript, use underscore prefix:

```typescript
function myFunction(_unusedParam: string, usedParam: number) {
  return usedParam * 2;
}
```

For ESLint, use disable comments:

```typescript
// eslint-disable-next-line unused-imports/no-unused-vars
import { FutureFeature } from './future';
```

For ts-prune, add to [`.tsprunerc`](.tsprunerc:1):

```json
{
  "ignore": ["**/future-features/**"]
}
```

### Adjusting Strictness

To reduce strictness during development, set environment variables:

```bash
# Skip validation (not recommended for CI)
FAIL_FAST=false npm run validate

# Enable bundle analysis
ANALYZE_BUNDLE=true npm start
```

## Performance Impact

The dead code elimination system adds ~10-30 seconds to build time but provides significant benefits:

- **Smaller Bundle Size**: Removes unused code from production builds
- **Better Performance**: Fewer modules to load and parse
- **Cleaner Codebase**: Prevents accumulation of dead code
- **Faster Development**: Less code to search through and maintain

## Troubleshooting

### Common Issues

**Issue**: TypeScript errors about unused parameters in React components

```typescript
// ❌ Error: 'props' is declared but never used
function MyComponent(props: MyProps) {
  return <div>Hello</div>;
}

// ✅ Solution: Use underscore prefix
function MyComponent(_props: MyProps) {
  return <div>Hello</div>;
}

// ✅ Or destructure what you need
function MyComponent({ title }: MyProps) {
  return <div>{title}</div>;
}
```

**Issue**: ts-prune reporting false positives for React components

**Solution**: React components used in JSX are not detected by ts-prune. Add them to the ignore list or ensure they're properly exported and imported.

**Issue**: Metro bundle analysis not working

**Solution**: Ensure `ANALYZE_BUNDLE=true` is set and the build completes successfully.

### Getting Help

1. Check the validation script output for specific error details
2. Run individual commands to isolate issues:
   - `npm run deadcode:typescript` for TypeScript issues
   - `npm run deadcode:lint` for ESLint issues
   - `npm run deadcode:check` for unused exports
3. Review this documentation for configuration options
4. Check tool-specific documentation:
   - [TypeScript Compiler Options](https://www.typescriptlang.org/tsconfig)
   - [ESLint Rules](https://eslint.org/docs/rules/)
   - [ts-prune Documentation](https://github.com/nadeesha/ts-prune)

## Maintenance

### Regular Tasks

1. **Weekly**: Run `npm run deadcode:find` to identify accumulating dead code
2. **Before Releases**: Run full validation to ensure clean builds
3. **Monthly**: Review and update ignore patterns as the codebase evolves

### Updating Tools

```bash
# Update dead code detection tools
npm update ts-prune eslint-plugin-unused-imports

# Update TypeScript and ESLint
npm update typescript eslint @typescript-eslint/eslint-plugin
```

## Benefits

- **Reduced Bundle Size**: Eliminates unused code from production builds
- **Improved Performance**: Faster load times and reduced memory usage
- **Better Code Quality**: Prevents dead code accumulation
- **Developer Experience**: Catches issues early in development
- **Maintainability**: Easier to navigate and understand the codebase

The dead code elimination system ensures that the MDR project maintains a clean, efficient codebase while preventing performance degradation from unused code.