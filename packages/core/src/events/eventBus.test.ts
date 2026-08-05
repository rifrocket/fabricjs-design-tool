import { describe, expect, it, vi } from "vitest";
import { EventBus } from "./eventBus";

describe("EventBus", () => {
  it("delivers a payload to every subscribed handler", () => {
    const bus = new EventBus();
    const first = vi.fn();
    const second = vi.fn();
    bus.on("object:added", first);
    bus.on("object:added", second);

    bus.emit("object:added", { id: "obj_1" });

    expect(first).toHaveBeenCalledWith({ id: "obj_1" });
    expect(second).toHaveBeenCalledWith({ id: "obj_1" });
  });

  it("stops delivering to a handler after off() or its unsubscribe function", () => {
    const bus = new EventBus();
    const handler = vi.fn();
    const unsubscribe = bus.on("selection:changed", handler);
    unsubscribe();

    bus.emit("selection:changed", ["obj_1"]);

    expect(handler).not.toHaveBeenCalled();
  });

  it("does not notify handlers registered for a different event", () => {
    const bus = new EventBus();
    const handler = vi.fn();
    bus.on("object:added", handler);

    bus.emit("object:removed", { id: "obj_1" });

    expect(handler).not.toHaveBeenCalled();
  });

  it("runs middleware before the handlers and can short-circuit by not calling next", () => {
    const bus = new EventBus();
    const handler = vi.fn();
    const order: string[] = [];
    bus.on("object:added", () => {
      order.push("handler");
      handler();
    });
    bus.use((event, _payload, next) => {
      order.push("middleware");
      if (event === "object:added") next();
    });

    bus.emit("object:added", { id: "obj_1" });

    expect(order).toEqual(["middleware", "handler"]);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("blocks the handler entirely when middleware never calls next", () => {
    const bus = new EventBus();
    const handler = vi.fn();
    bus.on("object:added", handler);
    bus.use((_event, _payload, _next) => {
      // deliberately does not call next()
    });

    bus.emit("object:added", { id: "obj_1" });

    expect(handler).not.toHaveBeenCalled();
  });

  it("chains multiple middleware in registration order", () => {
    const bus = new EventBus();
    const order: string[] = [];
    bus.use((_event, _payload, next) => {
      order.push("first");
      next();
    });
    bus.use((_event, _payload, next) => {
      order.push("second");
      next();
    });
    bus.on("object:added", () => order.push("handler"));

    bus.emit("object:added", {});

    expect(order).toEqual(["first", "second", "handler"]);
  });
});
