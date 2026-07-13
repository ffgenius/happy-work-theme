<script setup lang="ts">
import { computed, ref } from "vue";
import {
  Button,
  Card,
  Checkbox,
  ConfigProvider,
  Divider,
  Radio,
  RadioGroup,
  Slider,
  Space,
  Switch,
} from "antdv-next";
import { HappyProvider } from "@antdv-next/happy-work-theme";

const enabled = ref(true);
const primaryColor = ref("#1677ff");

const theme = computed(() => ({
  token: {
    colorPrimary: primaryColor.value,
  },
}));

const greenTheme = computed(() => ({
  token: {
    colorPrimary: "#00b96b",
  },
}));
</script>

<template>
  <div class="app">
    <header class="header">
      <h1>🎉 Happy Work Theme Playground</h1>
      <p>
        Click the buttons, switches, and controls below to see the joyful dot
        animation effect
      </p>
    </header>

    <Divider>Controls</Divider>

    <Space align="center" size="large" style="margin-bottom: 24px">
      <span>
        <strong>Enable Happy Mode:</strong>
        <Switch v-model:checked="enabled" style="margin-left: 8px" />
      </span>
      <span>
        <strong>Primary Color:</strong>
        <input
          type="color"
          v-model="primaryColor"
          style="margin-left: 8px; vertical-align: middle"
        />
        <span style="margin-left: 4px; font-size: 13px">{{ primaryColor }}</span>
      </span>
    </Space>

    <!-- Default theme section -->
    <Card title="Default Theme (dynamic colorPrimary)">
      <HappyProvider :enabled="enabled">
        <template #default="{ wave }">
          <ConfigProvider :theme="theme" :wave="wave">
            <Space direction="vertical" size="large" style="width: 100%">
              <Space wrap>
                <Button type="primary">Primary Button</Button>
                <Button type="default">Default Button</Button>
                <Button type="dashed">Dashed Button</Button>
                <Button type="text">Text Button</Button>
                <Button type="link">Link Button</Button>
              </Space>

              <Space wrap>
                <Switch />
                <Switch checked-children="ON" un-checked-children="OFF" />
                <Checkbox>Checkbox</Checkbox>
                <Checkbox checked>Checked</Checkbox>
              </Space>

              <Space wrap>
                <RadioGroup :model-value="1">
                  <Radio :value="1">Option A</Radio>
                  <Radio :value="2">Option B</Radio>
                  <Radio :value="3">Option C</Radio>
                </RadioGroup>
              </Space>

              <Space wrap>
                <Button danger>Danger (no effect)</Button>
                <Button type="primary" danger>Primary Danger (no effect)</Button>
              </Space>

              <div style="width: 200px">
                <Slider />
              </div>
            </Space>
          </ConfigProvider>
        </template>
      </HappyProvider>
    </Card>

    <br />

    <!-- Custom theme section -->
    <Card title="Custom Theme (colorPrimary: #00b96b)">
      <HappyProvider :enabled="enabled">
        <template #default="{ wave }">
          <ConfigProvider :theme="greenTheme" :wave="wave">
            <Space direction="vertical" size="large">
              <Space wrap>
                <Button type="primary">Primary Button</Button>
                <Button type="default">Default Button</Button>
                <Button type="dashed">Dashed Button</Button>
                <Button type="text">Text Button</Button>
                <Button type="link">Link Button</Button>
              </Space>

              <Space wrap>
                <Switch />
                <Checkbox>Checkbox</Checkbox>
              </Space>

              <Space wrap>
                <RadioGroup :model-value="1">
                  <Radio :value="1">Option A</Radio>
                  <Radio :value="2">Option B</Radio>
                </RadioGroup>
              </Space>
            </Space>
          </ConfigProvider>
        </template>
      </HappyProvider>
    </Card>
  </div>
</template>

<style>
body {
  margin: 0;
  font-family:
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    "Helvetica Neue",
    Arial,
    sans-serif;
  background: #f5f5f5;
}

.app {
  max-width: 960px;
  margin: 0 auto;
  padding: 32px 16px;
}

.header {
  text-align: center;
  margin-bottom: 32px;
}

.header h1 {
  margin: 0 0 8px;
  font-size: 28px;
  color: #1a1a1a;
}

.header p {
  margin: 0;
  color: #666;
  font-size: 15px;
}
</style>
