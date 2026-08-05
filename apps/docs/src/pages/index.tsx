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

function HomepageHeader() {
  return (
    <header className={styles.heroBanner}>
      <div className={styles.heroGrid} aria-hidden="true" />
      <div className={`container ${styles.heroContainer}`}>
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}>v2.0.0 · Fabric.js-powered</span>
          <Heading as="h1" className={styles.heroTitle}>
            A canvas design-tool engine you can actually extend
          </Heading>
          <p className={styles.heroSubtitle}>
            A framework-agnostic core, a thin React adapter, and a 13-plugin
            ecosystem — split into small, independently installable packages.
            Ship a batteries-included editor in one line, or build something
            entirely your own.
          </p>
          <div className={styles.buttons}>
            <Link className="button button--primary button--lg" to="/docs/getting-started/quick-start">
              Get Started
            </Link>  
            <Link
              className="button button--info button--lg"
              to="https://rifrocket.github.io/fabricjs-design-tool/">
              Live Demo ↗
            </Link>          
            <Link
              className="button button--secondary button--lg"
              to="https://github.com/rifrocket/fabricjs-design-tool">
              GitHub ↗
            </Link>
          </div>
         
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
          <Link className="button button--primary button--lg" to="/docs/getting-started/installation">
            Installation Guide
          </Link>
          <Link className="button button--secondary button--lg" to="/docs/plugins/overview">
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
