const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable async transformations for better compatibility
config.transformer.asyncRoutes = true;

// Increase the max workers for faster bundling
config.maxWorkers = 4;

module.exports = config;
