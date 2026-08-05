import type { FabricObject } from "fabric";
import type { Command } from "./command";

function readProperty(target: FabricObject, key: string): unknown {
  return (target as unknown as Record<string, unknown>)[key];
}

// Sets a single property on a FabricObject, capturing the prior value for undo.
// Consecutive edits to the same target/key (e.g. dragging a slider) merge into one entry.
export class SetPropertyCommand implements Command {
  private constructor(
    readonly target: FabricObject,
    readonly key: string,
    private readonly nextValue: unknown,
    private readonly previousValue: unknown,
  ) {}

  static capture(target: FabricObject, key: string, nextValue: unknown): SetPropertyCommand {
    return new SetPropertyCommand(target, key, nextValue, readProperty(target, key));
  }

  get label(): string {
    return `Set ${this.key}`;
  }

  do(): void {
    this.target.set(this.key, this.nextValue);
    this.target.setCoords();
  }

  undo(): void {
    this.target.set(this.key, this.previousValue);
    this.target.setCoords();
  }

  merge(next: Command): Command | null {
    if (!(next instanceof SetPropertyCommand)) return null;
    if (next.target !== this.target || next.key !== this.key) return null;
    return new SetPropertyCommand(this.target, this.key, next.nextValue, this.previousValue);
  }
}
