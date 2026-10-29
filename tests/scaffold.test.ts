import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Project Scaffolding', () => {
  it('has package.json with astro and react dependencies', () => {
    expect(fs.existsSync('package.json')).toBe(true);
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
    expect(pkg.dependencies.astro).toBeDefined();
    expect(pkg.dependencies['@astrojs/react']).toBeDefined();
    expect(pkg.dependencies['@astrojs/tailwind']).toBeDefined();
    expect(pkg.dependencies['@astrojs/node']).toBeDefined();
    expect(pkg.dependencies['dexie']).toBeDefined();
    expect(pkg.dependencies['better-sqlite3']).toBeDefined();
    expect(pkg.dependencies['lucide-react']).toBeDefined();
    expect(pkg.dependencies['canvas-confetti']).toBeDefined();
    expect(pkg.dependencies['react']).toBeDefined();
    expect(pkg.dependencies['react-dom']).toBeDefined();
    expect(pkg.dependencies['tailwindcss']).toBeDefined();
  });

  it('has required configuration and source files', () => {
    expect(fs.existsSync('astro.config.mjs')).toBe(true);
    expect(fs.existsSync('tsconfig.json')).toBe(true);
    expect(fs.existsSync('tailwind.config.mjs')).toBe(true);
    expect(fs.existsSync(path.join('src', 'layouts', 'Layout.astro'))).toBe(true);
    expect(fs.existsSync(path.join('src', 'pages', 'index.astro'))).toBe(true);
    expect(fs.existsSync(path.join('src', 'styles', 'global.css'))).toBe(true);
  });
});

