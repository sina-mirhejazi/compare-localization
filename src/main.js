import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import Listr from 'listr';

const access = promisify(fs.access);

function checkForMissingTokens(primary, secondary) {

}

function checkForAdditionalTokens(primary, secondary) {

}

export async function compareFiles({ primary, secondary }) {
 const currentFileUrl = import.meta.url;
 const primaryDir = path.resolve(
   new URL(currentFileUrl).pathname,
   primary,
 );

  const secondaryDir = path.resolve(
      new URL(currentFileUrl).pathname,
      secondary,
  );

 try {
   await access(primaryDir, fs.constants.R_OK);
 } catch (err) {
   console.error('%s Invalid primary file', chalk.red.bold('ERROR'));
   process.exit(1);
 }

  try {
    await access(secondaryDir, fs.constants.R_OK);
  } catch (err) {
    console.error('%s Invalid secondary file', chalk.red.bold('ERROR'));
    process.exit(1);
  }

 console.log('Loading primary file');
 await copyTemplateFiles(options);

 const tasks = new Listr([
    {
      title: 'Copy project files',
      task: () => copyTemplateFiles(options),
    },
  ]);
 
  await tasks.run();

 console.log('%s Project ready', chalk.green.bold('DONE'));
 return true;
}