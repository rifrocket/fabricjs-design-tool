import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type PluginItem = {
  name: string;
  description: string;
  href: string;
};

const PLUGINS: PluginItem[] = [
  {name: 'shapes-basic', description: '20 default shape object types', href: '/docs/plugins/shapes-basic'},
  {name: 'qrcode', description: 'QR code generation & styling', href: '/docs/plugins/qrcode'},
  {name: 'svg-import', description: 'Import SVG documents', href: '/docs/plugins/svg-import'},
  {name: 'image', description: 'Image object type', href: '/docs/plugins/image'},
  {name: 'clipboard', description: 'Copy, paste, duplicate, nudge', href: '/docs/plugins/clipboard'},
  {name: 'export-pdf', description: 'PDF export via jsPDF', href: '/docs/plugins/export-pdf'},
  {name: 'import-json', description: 'Restore a saved document', href: '/docs/plugins/import-json'},
  {name: 'effects', description: '22 stackable object effects', href: '/docs/plugins/effects'},
  {name: 'local-storage', description: 'Debounced autosave', href: '/docs/plugins/local-storage'},
  {name: 'alignment', description: 'Align & distribute panel', href: '/docs/plugins/alignment'},
  {name: 'snapping', description: 'Smart-guide toggle', href: '/docs/plugins/snapping'},
  {name: 'devtools', description: 'Event log, history, perf stats', href: '/docs/plugins/devtools'},
  {name: 'pan-zoom', description: 'Wheel-zoom & drag-pan hooks', href: '/docs/plugins/pan-zoom'},
];

export default function PluginShowcase(): ReactNode {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <Heading as="h2">Batteries included, or à la carte</Heading>
          <p className={styles.subtitle}>
            13 official plugins built on the exact same public registry API a third-party plugin uses — no
            special internal access, nothing to fork.
          </p>
        </div>

        <ul className={styles.grid}>
          {PLUGINS.map((plugin) => (
            <li key={plugin.name}>
              <Link to={plugin.href} className={styles.pill}>
                <code className={styles.pillName}>{plugin.name}</code>
                <span className={styles.pillDescription}>{plugin.description}</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className={styles.footer}>
          <Link to="/docs/plugins/overview">See the full plugin reference →</Link>
        </div>
      </div>
    </section>
  );
}
