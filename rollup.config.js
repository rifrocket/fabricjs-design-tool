import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import replace from '@rollup/plugin-replace';

const isProduction = process.env.NODE_ENV === 'production';

// Create an index file for the library exports
const createLibraryConfig = (name, input, external = []) => ({
  input,
  external: ['fabric', 'react', 'react-dom', ...external],
  output: [
    {
      file: `lib/${name}/index.esm.js`,
      format: 'esm',
      sourcemap: true,
      exports: 'named',
      inlineDynamicImports: true
    },
    {
      file: `lib/${name}/index.cjs.js`,
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
      inlineDynamicImports: true
    }
  ],
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
      preventAssignment: true
    }),
    resolve({
      browser: true,
      preferBuiltins: false
    }),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.lib.json',
      declaration: true,
      declarationDir: `lib/${name}/`,
      exclude: ['**/*.test.ts', '**/*.test.tsx']
    }),
    ...(isProduction ? [terser()] : [])
  ]
});

export default [
  // Core library (hooks + utils)
  createLibraryConfig('core', 'src/index.ts'),
  
  // UI Components (React components)
  createLibraryConfig('ui', 'src/components/index.ts', ['lucide-react'])
];
