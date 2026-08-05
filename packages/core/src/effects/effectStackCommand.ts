import type { FabricObject } from "fabric";
import type { Command } from "../history/command";
import { EFFECTS_PROPERTY } from "./types";
import type { EffectStack } from "./types";

// Whether `next` is a pure props tweak of exactly one instance in `previous` (same instances,
// order, and enabled flags) — what a live slider drag looks like tick to tick. Anything else
// changes structure and must NOT merge into a prior entry.
function isSingleInstancePropsEdit(previous: EffectStack, next: EffectStack): boolean {
  if (previous.length !== next.length) return false;
  let changed = false;
  for (let i = 0; i < previous.length; i += 1) {
    const a = previous[i];
    const b = next[i];
    if (a.instanceId !== b.instanceId || a.effectId !== b.effectId || a.enabled !== b.enabled) return false;
    if (JSON.stringify(a.props) !== JSON.stringify(b.props)) {
      if (changed) return false;
      changed = true;
    }
  }
  return changed;
}

// Sets the whole effect stack on a FabricObject, capturing the prior stack for undo. Unlike
// SetPropertyCommand's unconditional merge-on-same-key, this only merges a pure single-instance
// props edit (a slider drag) — every other stack mutation writes to the same "fdtEffects" key
// but must stay its own undo step, or a whole editing session would collapse into one.
export class EffectStackCommand implements Command {
  private constructor(
    readonly target: FabricObject,
    private readonly previousStack: EffectStack,
    private readonly nextStack: EffectStack,
  ) {}

  static capture(target: FabricObject, nextStack: EffectStack): EffectStackCommand {
    const previousStack = (target.get(EFFECTS_PROPERTY) as EffectStack | undefined) ?? [];
    return new EffectStackCommand(target, previousStack, nextStack);
  }

  get label(): string {
    return "Edit effects";
  }

  do(): void {
    this.target.set(EFFECTS_PROPERTY, this.nextStack);
    this.target.setCoords();
  }

  undo(): void {
    this.target.set(EFFECTS_PROPERTY, this.previousStack);
    this.target.setCoords();
  }

  merge(next: Command): Command | null {
    if (!(next instanceof EffectStackCommand)) return null;
    if (next.target !== this.target) return null;
    if (!isSingleInstancePropsEdit(this.nextStack, next.nextStack)) return null;
    return new EffectStackCommand(this.target, this.previousStack, next.nextStack);
  }
}
