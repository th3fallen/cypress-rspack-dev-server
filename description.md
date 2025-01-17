# Cypress Rspack Dev Server

## Project Overview

This project implements a development server for Cypress using Rspack as the bundler. Here's a comprehensive breakdown of its architecture and components:

### Core Purpose
- Development server specifically designed for Cypress component testing
- Uses Rspack (Rust-based bundler) as a faster alternative to Webpack

### Key Components

1. **devServer.ts**
   - Main entry point
   - Handles server creation and configuration
   - Supports multiple frameworks
   - Provides flexible configuration system

2. **makeRspackConfig.ts**
   - Manages Rspack configuration generation
   - Handles custom plugin management
   - Merges configurations with user settings
   - Addresses Cypress-specific requirements

3. **CypressCTRspackPlugin.ts**
   - Custom Rspack plugin for Cypress Component Testing

4. **createRspackDevServer.ts**
   - Manages dev server instance creation and setup

### Notable Features
- Framework-agnostic design
- Smart configuration merging
- Built-in optimization
- Debug support through 'debug' library

