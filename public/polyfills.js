// Polyfill for Node.js globals in browser environment
(function() {
  'use strict';

  // Global polyfill
  if (typeof global === 'undefined') {
    window.global = window;
  }

  // Process polyfill
  if (typeof process === 'undefined') {
    window.process = {
      env: {},
      version: '',
      versions: {},
      platform: 'browser',
      nextTick: function(callback) {
        setTimeout(callback, 0);
      }
    };
  }

  // Buffer polyfill (minimal implementation)
  if (typeof Buffer === 'undefined') {
    window.Buffer = {
      isBuffer: function() { return false; },
      from: function(data) { return new Uint8Array(data); },
      alloc: function(size) { return new Uint8Array(size); }
    };
  }

  // Ensure TextEncoder and TextDecoder are available
  if (typeof TextEncoder === 'undefined') {
    console.warn('TextEncoder not available');
  }
  if (typeof TextDecoder === 'undefined') {
    console.warn('TextDecoder not available');
  }
})();
