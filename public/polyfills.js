// Polyfill for global in browser environment
if (typeof global === 'undefined') {
  window.global = window;
}

if (typeof Buffer === 'undefined') {
  window.Buffer = { isBuffer: () => false };
}

if (typeof process === 'undefined') {
  window.process = { env: {} };
}
