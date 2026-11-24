import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useIsMobile } from "./use-mobile";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useIsMobile", () => {
  it("updates mobile detection on viewport changes and cleans up its listener", () => {
    let onChange: (() => void) | undefined;
    const removeEventListener = vi.fn();
    vi.stubGlobal("innerWidth", 767);
    vi.stubGlobal("matchMedia", vi.fn(() => ({
      addEventListener: vi.fn((_event: string, listener: () => void) => {
        onChange = listener;
      }),
      removeEventListener,
    })));

    const { result, unmount } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);

    act(() => {
      vi.stubGlobal("innerWidth", 768);
      onChange?.();
    });
    expect(result.current).toBe(false);

    unmount();
    expect(removeEventListener).toHaveBeenCalledWith("change", onChange);
  });
});