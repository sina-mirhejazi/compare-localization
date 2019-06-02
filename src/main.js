import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import Listr from 'listr';

const access = promisify(fs.access);

let primaryFileContent = {};
let secondaryFileContent = {};

const missingTokens = [];
const additionalTokens = [];

function checkForMissingTokens(primaryContent, secondaryContent, path = '') {
  Object.keys(primaryContent)
      .forEach((key) => {
        const currentPath = `${path}.${key}`;
        if(!secondaryContent.hasOwnProperty(key)) {
          missingTokens.push(currentPath);
        } else if(typeof primaryContent[key] === 'object') {
          checkForMissingTokens(primaryContent[key], secondaryContent[key], currentPath);
        }
      });
}

function checkForAdditionalTokens(primaryContent, secondaryContent, path = '') {
  Object.keys(primaryContent)
  .forEach((key) => {
    const currentPath = `${path}.${key}`;
    if(!secondaryContent.hasOwnProperty(key)) {
      additionalTokens.push(currentPath);
    } else if(typeof primaryContent[key] === 'object') {
      checkForAdditionalTokens(primaryContent[key], secondaryContent[key], currentPath);
    }
  });
}

function printArray(array) {
  if(!array.length) {
    console.log(chalk.bgWhite.black('Nothing to show'));
    return;
  }

  array.forEach((item, index) => {
    console.log(`${index+1}. %s`, chalk.bgWhite.black(item.substr(1)));
  });
}

function loadFile(dir) {
  return require(dir).default;
}

async function loadPrimaryFile(dir) {
  primaryFileContent = loadFile(dir);
}

async function loadSecondaryFile(dir) {
  secondaryFileContent = loadFile(dir);
}

async function testFiles({ primary, secondary }) {
  const currentFileUrl = process.cwd();

  const primaryDir = path.resolve(
      currentFileUrl,
      primary,
  );

  const secondaryDir = path.resolve(
      currentFileUrl,
      secondary,
  );

  try {
    await access(primaryDir, fs.constants.R_OK);
  } catch (err) {
    console.log(err);
    console.error('%s Invalid primary file', chalk.red.bold('ERROR'));
    process.exit(1);
  }

  try {
    await access(secondaryDir, fs.constants.R_OK);
  } catch (err) {
    console.error('%s Invalid secondary file', chalk.red.bold('ERROR'));
    process.exit(1);
  }

  return [ primaryDir, secondaryDir ];
}

export async function compareFiles({ primary, secondary }) {
 const [ primaryDir, secondaryDir ] = await testFiles({ primary, secondary });

 const tasks = new Listr([
    {
      title: 'Loading primary file',
      task: () => loadPrimaryFile(primaryDir),
    },
   {
      title: 'Loading secondary file',
      task: () => loadSecondaryFile(secondaryDir),
    },
   {
     title: 'Looking for missing tokens',
     task: async () => checkForMissingTokens(primaryFileContent, secondaryFileContent),
   },
   {
     title: 'Looking for additional tokens',
     task: async () => checkForAdditionalTokens(secondaryFileContent, primaryFileContent),
   },
  ]);
 
  await tasks.run();

  console.log('%s Project ready', chalk.green.bold('DONE'));

  console.log('%s', chalk.red.bold('Missing Tokens:'));
  printArray(missingTokens);

  console.log('%s', chalk.green.bold('Additional Tokens:'));
  printArray(additionalTokens);

 return true;
}