<script setup lang="ts">
import type { GlobalToken } from "antdv-next";
import { FastColor } from "@ant-design/fast-color";
import { computed, onMounted, ref } from "vue";
import { useStyle, TARGET_ATTR } from "./useStyle";

export interface DotInfo {
  key: number;
  startSize: string;
  endSize: string;
  type: "fill" | "outlined";
  color: string;
  startX: string;
  startY: string;
  endX: string;
  endY: string;
}

export interface DotEffectProps {
  target: HTMLElement;
  token: GlobalToken;
  hashId: string;
  onFinish: () => void;
}

const props = defineProps<DotEffectProps>();

const DOT_COUNT = 7;
const DOT_COUNT_LG = 10;

const prefixCls = "happy-wave";
const dotPrefixCls = `${prefixCls}-dot`;

const dots = ref<DotInfo[]>([]);
const left = ref(0);
const top = ref(0);
const showDots = ref(false);

const targetAttrName = `${TARGET_ATTR}-${props.hashId}`;

// Register CSS-in-JS styles (cache deduplicates across instances)
useStyle(
  computed(() => props.token),
  computed(() => props.hashId),
);

// Helper function to check if point is in range
function inRange(x: number, y: number, left: number, top: number, right: number, bottom: number) {
  return x >= left && x <= right && y >= top && y <= bottom;
}

// Helper function to adjust hue using @ant-design/fast-color
function adjustHue(color: string, hueDelta: number): string {
  const colorHsv = new FastColor(color).toHsv();
  colorHsv.h = (colorHsv.h + hueDelta) % 360;
  if (colorHsv.h < 0) colorHsv.h += 360;
  return new FastColor(colorHsv).toHexString();
}

onMounted(() => {
  requestAnimationFrame(() => {
    if (["-dangerous", "-error"].some((skipCls) => props.target.className.includes(skipCls))) {
      props.onFinish();
      return;
    }

    const rect = props.target.getBoundingClientRect();
    const { width, height } = rect;

    left.value = rect.left + width / 2;
    top.value = rect.top + height / 2;

    const minSize = Math.min(width, height);
    const maxSize = Math.max(width, height);
    const halfMinSize = minSize / 2;
    const halfMaxSize = maxSize / 2;
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    const OFFSET_MIN = 15;
    const OFFSET_MAX = 30;
    const halfOffsetMinWidth = halfWidth + OFFSET_MIN;
    const halfOffsetMinHeight = halfHeight + OFFSET_MIN;
    const halfOffsetMaxWidth = halfWidth + OFFSET_MAX;
    const halfOffsetMaxHeight = halfHeight + OFFSET_MAX;

    const dotCount = minSize >= 20 ? DOT_COUNT_LG : DOT_COUNT;

    // Delay to start dot motion
    setTimeout(() => {
      const offsetAngle = Math.random() * 360;

      // Color
      const { colorPrimary } = props.token;
      const colorPrimaryWeak = adjustHue(colorPrimary, -30);

      const newDots: DotInfo[] = Array.from({ length: dotCount }).map((_, index) => {
        const rotate = 360 / dotCount;
        const randomAngle = offsetAngle + rotate * index;

        // Get start XY (Which should align the rect edge)
        let startX = 0;
        let startY = 0;

        for (let startDist = halfMinSize - 1; startDist <= halfMaxSize; startDist += 1) {
          const x = Math.cos((randomAngle * Math.PI) / 180) * startDist;
          const y = Math.sin((randomAngle * Math.PI) / 180) * startDist;

          if (!inRange(x, y, -halfWidth, -halfHeight, halfWidth, halfHeight)) {
            break;
          }

          startX = x;
          startY = y;
        }

        // Get end XY
        let endX = startX;
        let endY = startY;
        let endDist = halfMinSize;

        const endHalfWidth =
          Math.random() * (halfOffsetMaxWidth - halfOffsetMinWidth) + halfOffsetMinWidth;
        const endHalfHeight =
          Math.random() * (halfOffsetMaxHeight - halfOffsetMinHeight) + halfOffsetMinHeight;

        do {
          endX = Math.cos((randomAngle * Math.PI) / 180) * endDist;
          endY = Math.sin((randomAngle * Math.PI) / 180) * endDist;
          endDist += 1;
        } while (inRange(endX, endY, -endHalfWidth, -endHalfHeight, endHalfWidth, endHalfHeight));

        let size = Math.random() * 3 + 3;
        if (height >= 20) {
          size = Math.random() * 4 + 6;
        }

        return {
          key: index + 1,
          startX: `${startX}px`,
          startY: `${startY}px`,
          endX: `${endX}px`,
          endY: `${endY}px`,
          startSize: `${size}px`,
          endSize: `${Math.random() > 0.75 ? size : 0}px`,
          type: Math.random() > 0.6 ? "outlined" : "fill",
          color: Math.random() > 0.5 ? colorPrimary : colorPrimaryWeak,
        };
      });

      dots.value = newDots;
      showDots.value = true;
      props.target.setAttribute(targetAttrName, "true");
    }, 50);

    // Clean up
    setTimeout(() => {
      props.target.removeAttribute(targetAttrName);
      props.onFinish();
    }, 600);
  });
});

const dotStyle = computed(() => (dot: DotInfo) => {
  const style: Record<string, string> = {
    "--start-x": dot.startX,
    "--start-y": dot.startY,
    "--end-x": dot.endX,
    "--end-y": dot.endY,
    "--start-size": dot.startSize,
    "--end-size": dot.endSize,
  };

  if (dot.type === "fill") {
    style["--background"] = dot.color;
    style["--border"] = "none";
  } else {
    style["--background"] = "transparent";
    style["--border"] = `1px solid ${dot.color}`;
  }

  return style;
});

const dotClass = computed(() => {
  return [dotPrefixCls, "happy-in-out-active"];
});
</script>

<template>
  <div v-if="showDots" :class="[prefixCls, hashId]" :style="{ left: `${left}px`, top: `${top}px` }">
    <div v-for="dot in dots" :key="dot.key" :class="dotClass" :style="dotStyle(dot)" />
  </div>
</template>
