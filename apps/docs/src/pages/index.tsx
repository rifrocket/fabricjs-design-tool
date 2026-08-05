import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import CodeBlock from '@theme/CodeBlock';
import Heading from '@theme/Heading';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import PluginShowcase from '@site/src/components/PluginShowcase';

import styles from './index.module.css';

const QUICK_START_CODE = `import { DesignEditor } from "@rifrocket/fdt-react";

function App() {
  return (
    <DesignEditor preset="default" theme="system" width={800} height={600} />
  );
}`;

// Small trait-row glyphs — same hand-drawn, currentColor line-icon style as
// HomepageFeatures/icons.tsx and PluginShowcase/icons.tsx, just smaller.
function TypeScriptTraitIcon({className}: {className?: string}) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" role="img" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7.5 9h5M10 9v7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M15 12.8c0-.8.7-1.3 1.6-1.3s1.6.5 1.6 1.2c0 1.7-3.2 1.1-3.2 2.9 0 .8.8 1.3 1.7 1.3s1.6-.4 1.7-1.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function TreeShakeTraitIcon({className}: {className?: string}) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" role="img" aria-hidden="true">
      <path d="M13 2 5 13.5h5.5L10.5 22l8.5-12.5H13.5L13 2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function ZeroDepTraitIcon({className}: {className?: string}) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" role="img" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M6.5 6.5l11 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function HomepageHeader() {
  return (
    <header className={styles.heroBanner}>
      <div className={styles.heroGrid} aria-hidden="true" />
      <div className={`container ${styles.heroContainer}`}>
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}>
            Fabric.js powered <span className={styles.eyebrowDot}>•</span> Framework agnostic{' '}
            <span className={styles.eyebrowDot}>•</span> Extensible
          </span>
          <Heading as="h1" className={styles.heroTitle}>
            A canvas design tool engine you can{' '}
            <span className={styles.heroTitleGradient}>actually extend</span>
          </Heading>
          <p className={styles.heroSubtitle}>
            A framework-agnostic core, a thin React adapter, and a 13-plugin
            ecosystem — split into small, independently installable packages.
            Ship a batteries-included editor in one line, or build something
            entirely your own.
          </p>
          <div className={styles.buttons}>
            <Link className={`button button--lg ${styles.primaryButton}`} to="/docs/getting-started/quick-start">
              Get Started →
            </Link>
            <Link className={`button button--lg ${styles.outlineButton}`} to="https://rifrocket.github.io/fabricjs-design-tool/demo/">
              Live Demo ↗
            </Link>
            <Link
              className={`button button--lg ${styles.outlineButton}`}
              to="https://github.com/rifrocket/fabricjs-design-tool">
              View on GitHub ↗
            </Link>
          </div>

          <dl className={styles.traitRow}>
            <div className={styles.trait}>
              <TypeScriptTraitIcon className={styles.traitIcon} />
              <dt>TypeScript First</dt>
            </div>
            <div className={styles.trait}>
              <TreeShakeTraitIcon className={styles.traitIcon} />
              <dt>Tree-shakeable</dt>
            </div>
            <div className={styles.trait}>
              <ZeroDepTraitIcon className={styles.traitIcon} />
              <dt>Zero React Dependency</dt>
            </div>
          </dl>
        </div>

        <div className={styles.heroPreview}>
          <div className={styles.codeWindow}>
            <div className={styles.codeWindowTitlebar}>
              <span className={styles.dot} data-color="red" />
              <span className={styles.dot} data-color="yellow" />
              <span className={styles.dot} data-color="green" />
              <span className={styles.codeWindowLabel}>App.tsx</span>
            </div>
            <CodeBlock language="tsx" className={styles.codeWindowBody}>
              {QUICK_START_CODE}
            </CodeBlock>
          </div>
        </div>
      </div>
    </header>
  );
}

function CallToActionBand() {
  return (
    <section className={styles.ctaBand}>
      <div className={`container ${styles.ctaBandInner}`}>
        <div>
          <Heading as="h2" className={styles.ctaBandTitle}>
            Ready to build?
          </Heading>
          <p className={styles.ctaBandSubtitle}>
            Install what you need, skip what you don't — every package is independently installable.
          </p>
        </div>
        <div className={styles.buttons}>
          <Link className={`button button--lg ${styles.ctaPrimaryButton}`} to="/docs/getting-started/installation">
            Installation Guide →
          </Link>
          <Link className={`button button--lg ${styles.ctaSecondaryButton}`} to="/docs/plugins/overview">
            Browse Plugins
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description="Developer documentation for @rifrocket/fdt-* — a Fabric.js-based design tool engine, React adapter, theme, and plugin ecosystem.">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <PluginShowcase />
        <CallToActionBand />
      </main>
    </Layout>
  );
}
