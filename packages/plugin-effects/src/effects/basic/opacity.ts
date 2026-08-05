import type { EffectDefinition } from "@rifrocket/fdt-core";

export interface OpacityProps {
  opacity: number;
}

export const opacityEffect: EffectDefinition<OpacityProps> = {
  id: "opacity",
  category: "basic",
  label: "Opacity",
  track: "compositing",
  schema: [{ key: "opacity", kind: "slider", label: "Opacity", min: 0, max: 100, unit: "%" }],
  defaults: { opacity: 50 },
  wrapRender: (_object, ctx, props, next) => {
    ctx.save();
    ctx.globalAlpha = ctx.globalAlpha * (Number(props.opacity ?? 100) / 100);
    next();
    ctx.restore();
  },
};
