#!/usr/bin/env node
import { Command } from 'commander';
import { getCliVersion } from './shared/fsUtils.js';
const program = new Command();
program.version(`varlet-cli ${getCliVersion()}`).usage('<command> [options]');
program
    .command('dev')
    .option('-f --force', 'Force dep pre-optimization regardless of whether deps have changed')
    .description('Run Luckly development environment')
    .action(async (options) => {
    const { dev } = await import('./commands/dev.js');
    return dev(options);
});
program
    .command('build')
    .description('Build Luckly site for production')
    .action(async () => {
    const { build } = await import('./commands/build.js');
    return build();
});
program
    .command('compile')
    .description('Compile Luckly components library code')
    .action(async () => {
    const { compile } = await import('./commands/compile.js');
    return compile();
});
program
    .command('create')
    .description('Create a component directory')
    .option('-n, --name <componentName>', 'Component name')
    .option('-s, --sfc', 'Generate files in sfc format')
    .option('-t, --tsx', 'Generate files in tsx format')
    .action(async (options) => {
    const { create } = await import('./commands/create.js');
    return create(options);
});
program
    .command('jest')
    .description('Run Jest in work directory')
    .option('-w, --watch', 'Watch files for changes and rerun tests related to changed files')
    .option('-wa, --watchAll', 'Watch files for changes and rerun all tests when something changes')
    .option('-c, --component <componentName>', 'Test a specific component')
    .option('-cc --clearCache', 'Clear test cache')
    .action(async (option) => {
    const { jest } = await import('./commands/jest.js');
    return jest(option);
});
program
    .command('gen')
    .description('Generate cli application')
    .option('-n, --name <applicationName>', 'Application name')
    .option('-s, --sfc', 'Generate files in sfc format')
    .option('-t, --tsx', 'Generate files in tsx format')
    .option('-l, --locale', 'Generator internationalized files')
    .action(async (option) => {
    const { gen } = await import('./commands/gen.js');
    return gen(option);
});
program
    .command('release')
    .option('-r --remote <remote>', 'Remote name')
    .description('Release all packages and generate changelogs')
    .action(async (option) => {
    const { release } = await import('./commands/release.js');
    return release(option);
});
program.parse();
