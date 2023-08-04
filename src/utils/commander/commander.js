import { Command } from 'commander';

const commander = new Command();
commander.option('--mode <mode>', 'Set mode', 'development').parse();

export default commander;
