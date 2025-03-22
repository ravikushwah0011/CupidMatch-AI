// This file provides necessary browser polyfills for Node.js built-in modules
// that might be used by dependencies

// Extend the Window interface to include our polyfills
declare global {
  interface Window {
    global: typeof globalThis;
    process: { env: Record<string, string> };
    events: { EventEmitter: any };
    util: { 
      debuglog: () => (message?: any) => void;
      inspect: (obj: any) => string;
    };
    Buffer: { isBuffer: (obj: any) => boolean };
  }
}

// Global object polyfill
if (typeof window !== 'undefined') {
  // Set global to window for Node.js compatibility
  window.global = window;
  
  // Process polyfill
  window.process = window.process || { env: {} };
  
  // Events module polyfill
  window.events = {
    EventEmitter: class EventEmitter {
      private events: Record<string, Function[]>;
      
      constructor() {
        this.events = {};
      }
      
      on(event: string, listener: Function): this {
        if (!this.events[event]) {
          this.events[event] = [];
        }
        this.events[event].push(listener);
        return this;
      }
      
      emit(event: string, ...args: any[]): boolean {
        if (!this.events[event]) {
          return false;
        }
        this.events[event].forEach(listener => listener(...args));
        return true;
      }
      
      removeListener(event: string, listener: Function): this {
        if (!this.events[event]) {
          return this;
        }
        this.events[event] = this.events[event].filter(l => l !== listener);
        return this;
      }
    }
  };
  
  // Util module polyfill
  window.util = {
    debuglog: () => () => {},
    inspect: (obj: any) => JSON.stringify(obj)
  };
  
  // Buffer polyfill (minimal)
  window.Buffer = window.Buffer || {
    isBuffer: () => false
  };
}

// Empty export to make this a module
export {};