import { blank } from "./definitions/blank";
import { poster } from "./definitions/poster";
import { socialPost } from "./definitions/socialPost";
import { businessCard } from "./definitions/businessCard";
import { flyer } from "./definitions/flyer";
import { logo } from "./definitions/logo";
import { certificate } from "./definitions/certificate";
import { productLabel } from "./definitions/productLabel";
import type { TemplateDefinition } from "./types";

export const TEMPLATES: TemplateDefinition[] = [
  blank,
  poster,
  socialPost,
  businessCard,
  flyer,
  logo,
  certificate,
  productLabel,
];

export type { TemplateDefinition, TemplateObjectSpec } from "./types";
