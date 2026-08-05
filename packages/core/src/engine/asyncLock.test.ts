import { describe, expect, it } from "vitest";
import { AsyncLock } from "./asyncLock";

function deferred<T>(): { promise: Promise<T>; resolve: (value: T) => void; reject: (reason?: unknown) => void } {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe("AsyncLock", () => {
  it("runs a single task and resolves with its result", async () => {
    const lock = new AsyncLock();
    await expect(lock.run(async () => "done")).resolves.toBe("done");
  });

  it("serializes overlapping calls: the second task doesn't start until the first settles", async () => {
    const lock = new AsyncLock();
    const order: string[] = [];
    const first = deferred<void>();

    const firstRun = lock.run(async () => {
      order.push("first:start");
      await first.promise;
      order.push("first:end");
    });
    const secondRun = lock.run(async () => {
      order.push("second:start");
    });

    // second task must not have started yet — first hasn't resolved its deferred.
    await Promise.resolve();
    await Promise.resolve();
    expect(order).toEqual(["first:start"]);

    first.resolve();
    await firstRun;
    await secondRun;

    expect(order).toEqual(["first:start", "first:end", "second:start"]);
  });

  it("a rejected task doesn't wedge the queue for subsequent calls", async () => {
    const lock = new AsyncLock();

    await expect(
      lock.run(async () => {
        throw new Error("boom");
      }),
    ).rejects.toThrow("boom");

    await expect(lock.run(async () => "still works")).resolves.toBe("still works");
  });
});
