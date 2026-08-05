import type {ReactNode} from 'react';
import Heading from '@theme/Heading';
import {LayersIcon, PluginIcon, AdapterIcon} from './icons';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Icon: (props: {className?: string}) => ReactNode;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Framework-agnostic core',
    Icon: LayersIcon,
    description: (
      <>
        <code>@rifrocket/fdt-core</code> owns a single Fabric.js canvas and
        composes independently-testable managers — viewport, selection,
        layers, alignment, snapping, and command-pattern history — with zero
        React dependency.
      </>
    ),
  },
  {
    title: 'A real plugin system',
    Icon: PluginIcon,
    description: (
      <>
        Object types, tools, panels, property fields, and export/import
        pipelines are all registry extension points. Ship your own plugin
        the same way the 13 built-in <code>@rifrocket/fdt-plugin-*</code>{' '}
        packages do.
      </>
    ),
  },
  {
    title: 'A thin React adapter',
    Icon: AdapterIcon,
    description: (
      <>
        <code>&lt;DesignEditor preset="default" /&gt;</code> gets you a
        batteries-included editor in one line, or drop down to{' '}
        <code>&lt;Editor&gt;</code> and <code>useEditor()</code> for full
        control over plugins, panels, and theme.
      </>
    ),
  },
];

function Feature({title, Icon, description}: FeatureItem) {
  return (
    <div className="col col--4">
      <div className={styles.card}>
        <div className={styles.iconBadge}>
          <Icon className={styles.icon} />
        </div>
        <Heading as="h3" className={styles.cardTitle}>
          {title}
        </Heading>
        <p className={styles.cardDescription}>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
