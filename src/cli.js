import arg from 'arg';
import { compareFiles } from './main';

function parseArgumentsIntoOptions(rawArgs) {
 const args = arg(
   {
   },
   {
     argv: rawArgs.slice(2),
   }
 );
 return {
   primary: args._[0],
   secondary: args._[1],
 };
}

export async function cli(args) {
 let options = parseArgumentsIntoOptions(args);
 await compareFiles(options);
}