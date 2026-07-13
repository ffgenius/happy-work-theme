import { Keyframes, createTheme, useStyleRegister } from "@antdv-next/cssinjs";
import type { GlobalToken } from "antdv-next";
import { computed, type Ref } from "vue";

export const TARGET_ATTR = "data-happy-wave-target";

const antWaveTargetEffect = new Keyframes("antWaveTargetEffect", {
  "0%": { transform: "scale(1)" },
  "10%": { transform: "scale(1.1)" },
  "35%": { transform: "scale(0.94)" },
  "60%": { transform: "scale(1.05)" },
  "85%": { transform: "scale(0.97)" },
  "100%": { transform: "scale(1)" },
});

const antWaveDotEffect = new Keyframes("antWaveDotEffect", {
  "0%": {
    opacity: 0,
    left: "var(--start-x)",
    top: "var(--start-y)",
    width: "var(--start-size)",
    height: "var(--start-size)",
    background: "var(--background)",
    border: "var(--border)",
  },
  "25%": { opacity: 1 },
  "50%": { opacity: 0.8 },
  "100%": {
    opacity: 0,
    left: "var(--end-x)",
    top: "var(--end-y)",
    width: "var(--end-size)",
    height: "var(--end-size)",
    background: "var(--background)",
    border: "var(--border)",
  },
});

const defaultTheme = createTheme((token: any) => token);

export function useStyle(token: Ref<GlobalToken>, hashId: Ref<string>) {
  // Register target element click animation styles
  // No hashId — matching antd-happy's first useStyleRegister call
  useStyleRegister(
    computed(() => ({
      theme: defaultTheme,
      token: token.value,
      path: ["happy-work-theme", "target"],
    })),
    () => ({
      [`[${TARGET_ATTR}-${hashId.value}]`]: {
        animationName: antWaveTargetEffect,
        animationDuration: "0.45s",
        animationTimingFunction: "ease-in-out",
        animationFillMode: "backwards",
      },
    }),
  );

  // Register dot particle animation styles
  useStyleRegister(
    computed(() => ({
      theme: defaultTheme,
      token: token.value,
      hashId: hashId.value,
      path: ["happy-work-theme", "dot"],
    })),
    () => ({
      ".happy-wave": {
        position: "fixed",
        pointerEvents: "none",
        zIndex: 999999,

        "&-dot": {
          boxSizing: "border-box",
          position: "absolute",
          borderRadius: "100%",
          opacity: 0,
          transform: "translate3d(-50%, -50%, 0)",
          zIndex: 999999,

          "&.happy-in-out-active": {
            animationName: antWaveDotEffect,
            animationDuration: token.value.motionDurationSlow,
            animationTimingFunction: "linear",
            animationFillMode: "backwards",
          },
        },
      },
    }),
  );
}
