import { describe, expect, it, vi } from "vitest";
import { Store } from "./store";

interface EngineStateFixture {
  zoom: number;
  selectedObjectIds: string[];
}

describe("Store", () => {
  it("returns the initial state", () => {
    const store = new Store<EngineStateFixture>({ zoom: 1, selectedObjectIds: [] });
    expect(store.getState()).toEqual({ zoom: 1, selectedObjectIds: [] });
  });

  it("merges a partial patch object into state", () => {
    const store = new Store<EngineStateFixture>({ zoom: 1, selectedObjectIds: [] });
    store.setState({ zoom: 2 });
    expect(store.getState()).toEqual({ zoom: 2, selectedObjectIds: [] });
  });

  it("merges the result of an updater function", () => {
    const store = new Store<EngineStateFixture>({ zoom: 1, selectedObjectIds: [] });
    store.setState((state) => ({ zoom: state.zoom + 1 }));
    expect(store.getState().zoom).toBe(2);
  });

  it("notifies subscribers with the new state on every change", () => {
    const store = new Store<EngineStateFixture>({ zoom: 1, selectedObjectIds: [] });
    const listener = vi.fn();
    store.subscribe(listener);

    store.setState({ zoom: 3 });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({ zoom: 3, selectedObjectIds: [] });
  });

  it("stops notifying a listener once unsubscribed", () => {
    const store = new Store<EngineStateFixture>({ zoom: 1, selectedObjectIds: [] });
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    unsubscribe();

    store.setState({ zoom: 5 });

    expect(listener).not.toHaveBeenCalled();
  });
});
