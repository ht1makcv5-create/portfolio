import { spawnSync } from 'node:child_process';
import { cpSync, rmSync } from 'node:fs';
const run = args => { const result = spawnSync('corepack', ['pnpm', ...args], { stdio: 'inherit' }); if (result.status !== 0) process.exit(result.status || 1); };
run(['run', 'typecheck:libs']);
run(['--filter', '@workspace/boohx', 'typecheck']);
run(['--filter', '@workspace/boohx', 'exec', 'vite', 'build', '--config', 'vite.config.ghpages.ts']);
rmSync('dist', { recursive: true, force: true });
cpSync('artifacts/boohx/dist/public', 'dist', { recursive: true });
