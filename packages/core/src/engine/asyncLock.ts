// Serializes async operations that mutate shared canvas state (e.g. importFile()) so a second
// call can't start before the first finishes — without this, two overlapping loadFromJSON()
// calls could interleave and leave the canvas in a mixed state. A rejected task doesn't wedge
// the queue: subsequent run() calls still proceed once the failing task settles.
export class AsyncLock {
  private queue: Promise<unknown> = Promise.resolve();

  run<T>(fn: () => Promise<T>): Promise<T> {
    const result = this.queue.then(fn, fn);
    this.queue = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  }
}
