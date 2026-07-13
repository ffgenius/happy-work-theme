// Polyfill requestAnimationFrame / cancelAnimationFrame.
// Use plain function delegation so the mocked setTimeout/clearTimeout
// (from vi.useFakeTimers) handle timer queuing directly.
globalThis.requestAnimationFrame = (cb: FrameRequestCallback) => {
  return setTimeout(cb, 0);
};
globalThis.cancelAnimationFrame = (id: number) => {
  clearTimeout(id);
};

// jsdom does not set offsetParent, which getBoundingClientRect depends on.
// Aligns with antd-happy's usage of spyElementPrototype(HTMLElement, 'offsetParent', { get: () => document.body })
Object.defineProperty(HTMLElement.prototype, "offsetParent", {
  get() {
    return this.parentNode || document.body;
  },
  configurable: true,
});
