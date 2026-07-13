import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick } from "vue";
import type { GlobalToken } from "antdv-next";
import DotEffect from "../src/DotEffect/index.vue";
import HappyProvider from "../src/HappyProvider/index.vue";
import { useHappyMode } from "../src/composables/useHappyMode";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockToken = {
  colorPrimary: "#1890ff",
  motionDurationSlow: "0.6s",
} as GlobalToken;

function createMockTarget(overrides: Partial<DOMRect> = {}) {
  const target = document.createElement("button");
  target.getBoundingClientRect = vi.fn(() => ({
    x: 0,
    y: 0,
    width: 100,
    height: 40,
    top: 100,
    right: 100,
    bottom: 140,
    left: 0,
    toJSON: () => {},
    ...overrides,
  }));
  document.body.appendChild(target);
  return target;
}

/**
 * Advance fake timers to the point where dots become visible.
 *
 * Vitest's vi.useFakeTimers() mocks requestAnimationFrame to fire every
 * ~16 ms (simulating 60 fps), overriding the setup.ts polyfill. The chain is:
 *   onMounted → requestAnimationFrame(cb)   [~16 ms]
 *     → setTimeout(50ms)  → dots computed, showDots = true
 */
async function advanceToDotsVisible() {
  // Advance past the next animation frame (~16 ms)
  vi.advanceTimersByTime(20);
  await nextTick();
  // Advance past the 50 ms inner delay (scheduled relative to rAF fire)
  vi.advanceTimersByTime(60);
  await nextTick();
}

// ---------------------------------------------------------------------------
// Tests – aligned with antd-happy/tests/index.test.tsx
// ---------------------------------------------------------------------------

describe("HappyWork", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  // -------------------------------------------------------------------
  // DotEffect (unit – replaces the integration Button-click pattern)
  // -------------------------------------------------------------------

  describe("DotEffect", () => {
    it("should render happy-wave dots", async () => {
      const target = createMockTarget();
      const onFinish = vi.fn();

      const holder = document.createElement("div");
      document.body.appendChild(holder);

      const { createApp } = await import("vue");
      const app = createApp({
        render() {
          return h(DotEffect, { target, token: mockToken, hashId: "test-hash", onFinish });
        },
      });
      app.mount(holder);

      await advanceToDotsVisible();

      const wave = document.body.querySelector(".happy-wave");
      expect(wave).toBeTruthy();
      expect(wave!.querySelectorAll(".happy-wave-dot").length).toBeGreaterThan(0);

      // Cleanup after 600 ms
      vi.advanceTimersByTime(600);
      await nextTick();
      expect(onFinish).toHaveBeenCalled();
    });

    it("should skip dangerous / error elements", async () => {
      const target = createMockTarget();
      target.className = "ant-btn-dangerous";
      const onFinish = vi.fn();

      mount(DotEffect, {
        props: {
          target,
          token: mockToken,
          hashId: "test-hash",
          onFinish,
        },
      });

      // Advance past the next rAF frame (~16 ms with vitest fake timers)
      vi.advanceTimersByTime(20);
      await nextTick();

      expect(onFinish).toHaveBeenCalled();
      expect(document.body.querySelector(".happy-wave")).toBeFalsy();
    });
  });

  // -------------------------------------------------------------------
  // HappyProvider – aligned with antd-happy's provider tests
  // -------------------------------------------------------------------

  describe("HappyProvider", () => {
    it("should work (showEffect creates dots)", async () => {
      const wrapper = mount(HappyProvider, {
        props: { enabled: true },
        slots: { default: "<div />" },
      });

      expect(wrapper.vm.wave).toBeDefined();
      expect(wrapper.vm.wave!.showEffect).toBeTypeOf("function");

      const target = createMockTarget();

      wrapper.vm.showEffect!(target, {
        token: mockToken,
        hashId: "test-hash",
        className: "",
        component: "Button",
        event: new MouseEvent("click"),
      });

      await advanceToDotsVisible();

      expect(document.body.querySelector(".happy-wave")).toBeTruthy();
    });

    it("should be disabled (wave is undefined)", () => {
      const wrapper = mount(HappyProvider, {
        props: { enabled: false },
        slots: { default: "<div />" },
      });

      expect(wrapper.vm.wave).toBeUndefined();
    });

    it("should provide wave as slot prop", () => {
      const SlotPrinter = defineComponent({
        props: ["wave"],
        setup(props) {
          return () =>
            h(
              "div",
              { "data-testid": "child" },
              props.wave ? "has-wave" : "no-wave",
            );
        },
      });

      const wrapper = mount(HappyProvider, {
        props: { enabled: true },
        slots: {
          default: ({ wave }: { wave: unknown }) => h(SlotPrinter, { wave }),
        },
      });

      expect(wrapper.find('[data-testid="child"]').text()).toBe("has-wave");
    });

    it("showEffect should cleanup after animation", async () => {
      const wrapper = mount(HappyProvider, {
        props: { enabled: true },
        slots: { default: "<div />" },
      });

      const target = createMockTarget();

      wrapper.vm.showEffect!(target, {
        token: mockToken,
        hashId: "test-hash",
        className: "",
        component: "Button",
        event: new MouseEvent("click"),
      });

      await advanceToDotsVisible();
      expect(document.body.querySelector(".happy-wave")).toBeTruthy();

      // Advance past the 600 ms cleanup timer
      vi.advanceTimersByTime(600);
      await nextTick();
      expect(document.body.querySelector(".happy-wave")).toBeFalsy();
    });
  });

  // -------------------------------------------------------------------
  // useHappyMode composable
  // -------------------------------------------------------------------

  describe("useHappyMode", () => {
    it("should return true when HappyProvider is enabled", () => {
      const Consumer = defineComponent({
        setup() {
          const getHappyMode = useHappyMode();
          return () => h("div", getHappyMode() ? "happy" : "sad");
        },
      });

      const wrapper = mount(HappyProvider, {
        props: { enabled: true },
        slots: { default: () => h(Consumer) },
      });

      expect(wrapper.text()).toBe("happy");
    });

    it("should return false when HappyProvider is disabled", () => {
      const Consumer = defineComponent({
        setup() {
          const getHappyMode = useHappyMode();
          return () => h("div", getHappyMode() ? "happy" : "sad");
        },
      });

      const wrapper = mount(HappyProvider, {
        props: { enabled: false },
        slots: { default: () => h(Consumer) },
      });

      expect(wrapper.text()).toBe("sad");
    });
  });
});
