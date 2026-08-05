import path from 'node:path';
import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import codeImport from 'remark-code-import';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

// Lets docs pages embed a real source file's contents at build time via
//   ```tsx file=../../../../packages/react/src/quickstart.example.tsx
// instead of a hand-copied (and driftable) snippet. Paths are resolved relative to each
// .md/.mdx file, so `rootDir` here just bounds which files remark-code-import is allowed to
// read from — the monorepo root, not just apps/docs.
const repoRoot = path.resolve(__dirname, '../..');

// "docusaurus start" sets NODE_ENV=development itself; serving under "/" locally means
// http://localhost:3000/ works directly instead of 404ing until you remember the production
// subpath. "docusaurus build" (production) still targets the real GitHub Pages project-site
// path below. Shared so the headTags favicon link (which Docusaurus doesn't auto-prefix,
// unlike the `favicon` config field) stays in sync with `baseUrl` instead of drifting.
const siteBaseUrl = process.env.NODE_ENV === 'development' ? '/' : '/fabricjs-design-tool/';

const config: Config = {
  title: 'Fabric Design Tool',
  tagline: 'A Fabric.js-based design tool engine, React adapter, theme, and plugin ecosystem',
  favicon: 'img/favicon.ico',

  // Modern browsers prefer an SVG favicon (crisp at every size) over the .ico fallback above,
  // which still serves browsers/contexts that specifically request /favicon.ico.
  headTags: [
    {
      tagName: 'link',
      attributes: {
        rel: 'icon',
        type: 'image/svg+xml',
        href: `${siteBaseUrl}img/favicon.svg`,
      },
    },
  ],

  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  url: 'https://rifrocket.github.io',
  baseUrl: siteBaseUrl,

  organizationName: 'rifrocket',
  projectName: 'fabricjs-design-tool',

  onBrokenLinks: 'throw',

  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },
  themes: ['@docusaurus/theme-mermaid'],

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/rifrocket/fabricjs-design-tool/tree/main/apps/docs/',
          remarkPlugins: [[codeImport, {rootDir: repoRoot}]],
        },
        // No blog — this is a pure reference/documentation site.
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/logo-large.svg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Fabric Design Tool',
      logo: {
        alt: 'Fabric Design Tool Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'html',
          value: '<span class="navbar-version-badge">v2.0.0</span>',
          position: 'left',
        },
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Docs',
        },
        {to: '/docs/category/plugins', label: 'Plugins', position: 'left'},
        {to: '/docs/category/api-reference', label: 'API Reference', position: 'left'},
        {to: '/docs/category/guides', label: 'Guides', position: 'left'},
        {to: '/docs/category/examples', label: 'Examples', position: 'left'},
        {
          href: 'https://github.com/rifrocket/fabricjs-design-tool/releases',
          label: 'Changelog',
          position: 'left',
        },
        {
          href: 'https://github.com/rifrocket/fabricjs-design-tool',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {label: 'Getting Started', to: '/docs/getting-started/installation'},
            {label: 'Architecture', to: '/docs/architecture/overview'},
            {label: 'Plugins', to: '/docs/plugins/overview'},
          ],
        },
        {
          title: 'More',
          items: [
            {label: 'GitHub', href: 'https://github.com/rifrocket/fabricjs-design-tool'},
            {label: 'Report an issue', href: 'https://github.com/rifrocket/fabricjs-design-tool/issues'},
            {label: 'Live Demo', href: 'https://rifrocket.github.io/fabricjs-design-tool/'},
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} FabricJS Design Tool Contributors. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'diff', 'json'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
