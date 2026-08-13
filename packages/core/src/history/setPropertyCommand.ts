import type { FabricObject } from "fabric";
import type { Command } from "./command";

// Strategy for reading/writing/finalizing a property on TNode — lets SetPropertyCommand work
// against a non-Fabric node type (FUTURE_IMPLEMENTATION.md Chunk 3.3). Defaults to
// fabricNodeOps below, reproducing today's exact Fabric behavior, so every existing
// `SetPropertyCommand.capture(target, key, value)` call site (10 in AlignmentManager, which
// stays fabric-typed and out of scope for this refactor) keeps compiling and behaving
// identically with no changes.
export interface NodeOps<TNode = FabricObject> {
  get(node: TNode, key: string): unknown;
  set(node: TNode, key: string, value: unknown): void;
  finalize?(node: TNode): void;
}

const fabricNodeOps: NodeOps<FabricObject> = {
  get: (node, key) => (node as unknown as Record<string, unknown>)[key],
  set: (node, key, value) => {
    node.set(key, value);
  },
  finalize: (node) => node.setCoords(),
};

// Sets a single property on a node, capturing the prior value for undo.
// Consecutive edits to the same target/key (e.g. dragging a slider) merge into one entry.
export class SetPropertyCommand<TNode = FabricObject> implements Command {
  private constructor(
    readonly target: TNode,
    readonly key: string,
    private readonly nextValue: unknown,
    private readonly previousValue: unknown,
    private readonly ops: NodeOps<TNode>,
  ) {}

  static capture<TNode = FabricObject>(
    target: TNode,
    key: string,
    nextValue: unknown,
    ops: NodeOps<TNode> = fabricNodeOps as unknown as NodeOps<TNode>,
  ): SetPropertyCommand<TNode> {
    return new SetPropertyCommand(target, key, nextValue, ops.get(target, key), ops);
  }

  get label(): string {
    return `Set ${this.key}`;
  }

  do(): void {
    this.ops.set(this.target, this.key, this.nextValue);
    this.ops.finalize?.(this.target);
  }

  undo(): void {
    this.ops.set(this.target, this.key, this.previousValue);
    this.ops.finalize?.(this.target);
  }

  merge(next: Command): Command | null {
    if (!(next instanceof SetPropertyCommand)) return null;
    if (next.target !== this.target || next.key !== this.key) return null;
    return new SetPropertyCommand(this.target, this.key, next.nextValue, this.previousValue, this.ops);
  }
}
