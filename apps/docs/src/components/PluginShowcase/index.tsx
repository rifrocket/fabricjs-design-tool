import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import {
  ShapesIcon,
  QrCodeIcon,
  SvgImportIcon,
  ImageIcon,
  ClipboardIcon,
  ExportPdfIcon,
  ImportJsonIcon,
  EffectsIcon,
  LocalStorageIcon,
  AlignmentIcon,
  SnappingIcon,
  DevtoolsIcon,
  PanZoomIcon,
} from './icons';
import styles from './styles.module.css';

type Accent = 'violet' | 'blue' | 'cyan';

type PluginItem = {
  name: string;
  description: string;
  href: string;
  Icon: (props: {className?: string}) => ReactNode;
  accent: Accent;
};

const PLUGINS: PluginItem[] = [
  {name: 'shapes-basic', description: '20 shape object types', href: '/docs/plugins/shapes-basic', Icon: ShapesIcon, accent: 'violet'},
  {name: 'qrcode', description: 'QR code generation', href: '/docs/plugins/qrcode', Icon: QrCodeIcon, accent: 'blue'},
  {name: 'svg-import', description: 'Import SVG documents', href: '/docs/plugins/svg-import', Icon: SvgImportIcon, accent: 'cyan'},
  {name: 'image', description: 'Image object type', href: '/docs/plugins/image', Icon: ImageIcon, accent: 'violet'},
  {name: 'clipboard', description: 'Copy, paste, duplicate', href: '/docs/plugins/clipboard', Icon: ClipboardIcon, accent: 'blue'},
  {name: 'export-pdf', description: 'Export via jsPDF', href: '/docs/plugins/export-pdf', Icon: ExportPdfIcon, accent: 'cyan'},
  {name: 'import-json', description: 'Restore a document', href: '/docs/plugins/import-json', Icon: ImportJsonIcon, accent: 'violet'},
  {name: 'effects', description: '22 stackable effects', href: '/docs/plugins/effects', Icon: EffectsIcon, accent: 'blue'},
  {name: 'local-storage', description: 'Debounced autosave', href: '/docs/plugins/local-storage', Icon: LocalStorageIcon, accent: 'cyan'},
  {name: 'alignment', description: 'Align & distribute', href: '/docs/plugins/alignment', Icon: AlignmentIcon, accent: 'violet'},
  {name: 'snapping', description: 'Smart-guide toggle', href: '/docs/plugins/snapping', Icon: SnappingIcon, accent: 'blue'},
  {name: 'devtools', description: 'Event log & perf stats', href: '/docs/plugins/devtools', Icon: DevtoolsIcon, accent: 'cyan'},
  {name: 'pan-zoom', description: 'Wheel-zoom & drag-pan', href: '/docs/plugins/pan-zoom', Icon: PanZoomIcon, accent: 'violet'},
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
          {PLUGINS.map(({name, description, href, Icon, accent}) => (
            <li key={name}>
              <Link to={href} className={styles.pill}>
                <span className={styles.pillIcon} data-accent={accent}>
                  <Icon className={styles.pillIconGlyph} />
                </span>
                <span className={styles.pillBody}>
                  <code className={styles.pillName}>{name}</code>
                  <span className={styles.pillDescription}>{description}</span>
                </span>
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
