// A single undoable/redoable unit of work. merge() lets an in-progress
// interaction (e.g. a drag) collapse into one history entry instead of one per frame.
export interface Command {
  readonly label?: string;
  do(): void;
  undo(): void;
  merge?(next: Command): Command | null;
}

// Bundles several commands (e.g. a paste of N objects) into a single history entry.
export class CompositeCommand implements Command {
  constructor(
    private readonly commands: Command[],
    readonly label?: string,
  ) {}

  do(): void {
    this.commands.forEach((command) => command.do());
  }

  undo(): void {
    for (let i = this.commands.length - 1; i >= 0; i -= 1) {
      this.commands[i].undo();
    }
  }
}
