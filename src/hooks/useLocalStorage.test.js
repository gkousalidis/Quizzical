import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useLocalStorage } from "./useLocalStorage";

describe("useLocalStorage", () => {
  it("returns the initial value when nothing is stored", () => {
    const { result } = renderHook(() => useLocalStorage("key", "initial"));
    expect(result.current[0]).toBe("initial");
  });

  it("reads an existing value", () => {
    localStorage.setItem("key", JSON.stringify({ score: 4 }));
    const { result } = renderHook(() => useLocalStorage("key", null));
    expect(result.current[0]).toEqual({ score: 4 });
  });

  it("persists updates", () => {
    const { result } = renderHook(() => useLocalStorage("key", 0));

    act(() => result.current[1](5));

    expect(result.current[0]).toBe(5);
    expect(localStorage.getItem("key")).toBe("5");
  });

  it("falls back to the initial value on corrupt JSON", () => {
    localStorage.setItem("key", "{oops");
    const { result } = renderHook(() => useLocalStorage("key", "fallback"));
    expect(result.current[0]).toBe("fallback");
  });
});
