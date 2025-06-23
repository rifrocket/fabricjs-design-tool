# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.3] - 2025-06-24

### 🚀 Added
- **Enhanced Error Handling**: New error handling utilities with custom error classes
  - `CanvasError`, `ShapeCreationError`, `ExportError` classes
  - `safeAsync` and `safeSync` utility functions
  - `createErrorHandler` for React components
- **Automated Deployment**: Integrated npm publishing into GitHub Pages deployment workflow
  - Version-based automatic publishing
  - GitHub releases with tags
  - Smart version change detection

### ✨ Improved
- **TypeScript Quality**: Reduced ESLint warnings from 75 to 61 (19% improvement)
  - Better event handler type definitions
  - Enhanced function parameter typing
  - Proper React hook dependencies
- **Code Organization**: Consolidated alignment guides implementation
  - Removed duplicate `CustomAlignmentGuides`
  - Optimized `SmoothAlignmentGuides` with better performance
- **Performance**: Enhanced monitoring utilities with proper typing

### 🔧 Changed
- **Deployment Process**: Removed separate npm-publish.yml, integrated into deploy.yml
- **Version**: Updated to 1.0.3

### 🐛 Fixed
- React hook dependency warnings
- Memory leak issues in event listeners
- TypeScript compilation warnings

### ⚠️ Breaking Changes
- Removed `CustomAlignmentGuides` class (use `SmoothAlignmentGuides` instead)

## [1.0.2] - Previous Release
- Initial production-ready release
- Framework-agnostic core with React UI components
- Comprehensive documentation and examples

## [1.0.1] - Previous Release
- Early development release

## [1.0.0] - Previous Release
- Initial release
