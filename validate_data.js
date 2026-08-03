// Data Validation Script for Marketing Mastery Academy
const fs = require('fs');
const path = require('path');

const dataFiles = [
  'data/chapter_01.js',
  'data/chapter_02.js',
  'data/chapter_07.js'
];

let hasErrors = false;

console.log("=== Initializing Data Validation ===");

dataFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    console.error(`Error: File does not exist at ${filePath}`);
    hasErrors = true;
    return;
  }

  // Create a clean global.window mock
  global.window = {};

  try {
    // Dynamically execute the file.
    // Node.js will execute it and populate global.window.currentChapterData
    require(filePath);
    
    const chaptersMap = global.window.marketingAcademyChapters || {};
    const ids = Object.keys(chaptersMap);
    if (ids.length === 0) {
      throw new Error("window.marketingAcademyChapters was not populated.");
    }
    const data = chaptersMap[ids[0]];
    
    console.log(`\nValidating ${file}:`);
    console.log(`- Title: "${data.title}"`);
    console.log(`- Lessons found: ${data.lessons ? data.lessons.length : 0}`);

    // Required fields check list
    const requiredFields = [
      'id', 'title', 'lessons', 'learningObjectives', 'firstPrinciples',
      'definitions', 'intuition', 'frameworks', 'comparisonTables',
      'crossLinks', 'memoryTechniques', 'visualRoadmapSteps', 'infographics',
      'examples', 'practicalApplications', 'commonMistakes', 'assessments',
      'feynmanReview', 'onePageRevision', 'masteryAssessment', 'knowledgeGraph',
      'mindMaps', 'flowcharts', 'conceptMaps', 'decisionTrees', 'visualDiagrams'
    ];

    requiredFields.forEach(field => {
      if (data[field] === undefined || data[field] === null) {
        console.error(`  [FAIL] Missing required field: "${field}"`);
        hasErrors = true;
      } else {
        console.log(`  [PASS] Field "${field}" exists.`);
      }
    });

    // Check examples subfields
    if (data.examples) {
      ['realWorld', 'industry', 'indianCase', 'globalCase'].forEach(subfield => {
        if (!data.examples[subfield]) {
          console.error(`  [FAIL] Missing examples subfield: "${subfield}"`);
          hasErrors = true;
        }
      });
    }

    // Check assessments subfields
    if (data.assessments) {
      ['interviewQuestions', 'mbaQuestions', 'practiceExercises', 'assignments', 'scenarioQuestions'].forEach(subfield => {
        if (!data.assessments[subfield]) {
          console.error(`  [FAIL] Missing assessments subfield: "${subfield}"`);
          hasErrors = true;
        }
      });
    }

  } catch (err) {
    console.error(`  [CRITICAL ERROR] Failed to parse/execute ${file}: ${err.stack || err.message}`);
    hasErrors = true;
  }
});

console.log("\n=== Validation Results ===");
if (hasErrors) {
  console.log("STATUS: FAIL. Some files have errors.");
  process.exit(1);
} else {
  console.log("STATUS: SUCCESS. All files conform to the curriculum database schema!");
  process.exit(0);
}
