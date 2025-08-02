/**
 * Script to generate a translation status report
 * 
 * This script:
 * 1. Uses en.json as the reference template
 * 2. Analyzes each language file for completeness
 * 3. Generates a report showing translation status by language
 * 4. Identifies keys that need human review across languages
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

// Analyze a translation file
function analyzeTranslationFile(langCode, referenceData) {
  const filePath = path.join(LOCALES_DIR, `${langCode}.json`);
  
  // Read the target language file
  const targetData = readJsonFile(filePath);
  if (!targetData) return null;
  
  // Get all keys from the reference file
  const referenceKeys = getAllKeys(referenceData);
  const totalKeys = referenceKeys.length;
  
  // Count missing, empty, and identical keys
  let missingCount = 0;
  let emptyCount = 0;
  let identicalCount = 0;
  const missingKeys = [];
  const emptyKeys = [];
  const identicalKeys = [];
  
  for (const key of referenceKeys) {
    const referenceValue = getValueByPath(referenceData, key);
    const targetValue = getValueByPath(targetData, key);
    
    if (targetValue === undefined) {
      missingCount++;
      missingKeys.push(key);
    } else if (targetValue === '') {
      emptyCount++;
      emptyKeys.push(key);
    } else if (targetValue === referenceValue && typeof targetValue === 'string' && targetValue.length > 0) {
      identicalCount++;
      identicalKeys.push(key);
    }
  }
  
  const completedCount = totalKeys - missingCount - emptyCount;
  const completionPercentage = ((completedCount / totalKeys) * 100).toFixed(2);
  
  return {
    langCode,
    totalKeys,
    missingCount,
    emptyCount,
    identicalCount,
    completedCount,
    completionPercentage,
    missingKeys,
    emptyKeys,
    identicalKeys
  };
}

// Generate a human-readable report
function generateReport(results) {
  // Sort languages by completion percentage (descending)
  results.sort((a, b) => parseFloat(b.completionPercentage) - parseFloat(a.completionPercentage));
  
  // Create summary table
  let report = '# Translation Status Report\n\n';
  report += '## Summary\n\n';
  report += '| Language | Completion | Total Keys | Completed | Missing | Empty | Identical to English |\n';
  report += '|----------|------------|------------|-----------|---------|-------|---------------------|\n';
  
  for (const result of results) {
    report += `| ${result.langCode} | ${result.completionPercentage}% | ${result.totalKeys} | ${result.completedCount} | ${result.missingCount} | ${result.emptyCount} | ${result.identicalCount} |\n`;
  }
  
  // Add detailed section for each language
  report += '\n## Details by Language\n\n';
  
  for (const result of results) {
    report += `### ${result.langCode} (${result.completionPercentage}% complete)\n\n`;
    
    if (result.missingKeys.length > 0) {
      report += '#### Missing Keys\n\n';
      report += '```\n' + result.missingKeys.join('\n') + '\n```\n\n';
    }
    
    if (result.emptyKeys.length > 0) {
      report += '#### Empty Keys\n\n';
      report += '```\n' + result.emptyKeys.join('\n') + '\n```\n\n';
    }
    
    if (result.identicalKeys.length > 0) {
      report += '#### Keys Identical to English (Might Need Translation)\n\n';
      report += '```\n' + result.identicalKeys.join('\n') + '\n```\n\n';
    }
  }
  
  return report;
}

// Main function
function main() {
  console.log('Generating translation status report...');
  
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
  
  // Analyze each language file
  const results = [];
  for (const langCode of langCodes) {
    console.log(`Analyzing ${langCode}.json...`);
    const result = analyzeTranslationFile(langCode, referenceData);
    if (result) {
      results.push(result);
    }
  }
  
  // Generate and save the report
  const report = generateReport(results);
  fs.writeFileSync(path.join(__dirname, '../translation-report.md'), report, 'utf8');
  
  console.log('Report generated: translation-report.md');
}

// Run the script
main();