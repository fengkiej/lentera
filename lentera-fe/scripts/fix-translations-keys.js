/**
 * Script to fix and complete translation files
 * 
 * This script:
 * 1. Uses en.json as the reference template
 * 2. Identifies missing keys in each language file
 * 3. Adds missing keys with placeholder values
 * 4. Preserves existing translations
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to locales directory
const LOCALES_DIR = path.join(__dirname, '../src/i18n/locales');

// Read a JSON file
function readJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return null;
  }
}

// Write a JSON file with pretty formatting
function writeJsonFile(filePath, data) {
  try {
    const content = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  } catch (error) {
    console.error(`Error writing file ${filePath}:`, error);
    return false;
  }
}

// Get all keys from an object (including nested keys)
function getAllKeys(obj, prefix = '') {
  let keys = [];
  
  for (const key in obj) {
    const newPrefix = prefix ? `${prefix}.${key}` : key;
    
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      // Recursive call for nested objects
      keys = keys.concat(getAllKeys(obj[key], newPrefix));
    } else {
      keys.push(newPrefix);
    }
  }
  
  return keys;
}

// Get value from an object using a dot-notation path
function getValueByPath(obj, path) {
  const parts = path.split('.');
  let current = obj;
  
  for (const part of parts) {
    if (current[part] === undefined) {
      return undefined;
    }
    current = current[part];
  }
  
  return current;
}

// Set value in an object using a dot-notation path
function setValueByPath(obj, path, value) {
  const parts = path.split('.');
  let current = obj;
  
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!current[part] || typeof current[part] !== 'object') {
      current[part] = {};
    }
    current = current[part];
  }
  
  current[parts[parts.length - 1]] = value;
}

// Identify missing or empty keys
function identifyMissingOrEmptyKeys(referenceKeys, targetObj) {
  const missingKeys = [];
  const emptyKeys = [];
  
  for (const key of referenceKeys) {
    const value = getValueByPath(targetObj, key);
    
    if (value === undefined) {
      missingKeys.push(key);
    } else if (value === '') {
      emptyKeys.push(key);
    }
  }
  
  return { missingKeys, emptyKeys };
}

// Fix a translation file
function fixTranslationFile(langCode, referenceData) {
  const filePath = path.join(LOCALES_DIR, `${langCode}.json`);
  console.log(`Processing ${langCode}.json...`);
  
  // Read the target language file
  const targetData = readJsonFile(filePath);
  if (!targetData) return false;
  
  // Get all keys from the reference file
  const referenceKeys = getAllKeys(referenceData);
  
  // Identify missing or empty keys
  const { missingKeys, emptyKeys } = identifyMissingOrEmptyKeys(referenceKeys, targetData);
  
  console.log(`  Missing keys: ${missingKeys.length}`);
  console.log(`  Empty keys: ${emptyKeys.length}`);
  
  if (missingKeys.length === 0 && emptyKeys.length === 0) {
    console.log(`  No fixes needed for ${langCode}.json`);
    return true;
  }
  
  // Create a new object with all keys
  const updatedData = JSON.parse(JSON.stringify(targetData));
  
  // Add missing keys with placeholder values
  for (const key of missingKeys) {
    const referenceValue = getValueByPath(referenceData, key);
    // Use the reference value as a placeholder
    // In a real implementation, you might want to use machine translation here
    setValueByPath(updatedData, key, referenceValue);
  }
  
  // Save the updated file
  const success = writeJsonFile(filePath, updatedData);
  if (success) {
    console.log(`  Updated ${langCode}.json successfully`);
  }
  
  return success;
}

// Main function
function main() {
  console.log('Starting translation files fix...');
  
  // Read the reference file (English)
  const referenceData = readJsonFile(path.join(LOCALES_DIR, 'en.json'));
  if (!referenceData) {
    console.error('Failed to read reference file (en.json)');
    return;
  }
  
  // Get all language files
  const files = fs.readdirSync(LOCALES_DIR);
  const langCodes = files
    .filter(file => file.endsWith('.json') && file !== 'en.json')
    .map(file => file.replace('.json', ''));
  
  // Process each language file
  for (const langCode of langCodes) {
    fixTranslationFile(langCode, referenceData);
  }
  
  console.log('Translation files fix completed');
}

// Run the script
main();