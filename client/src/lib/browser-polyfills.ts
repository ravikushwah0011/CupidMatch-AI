// This file provides necessary browser polyfills for Node.js built-in modules
// that might be used by dependencies

// Extend the Window interface to include our polyfills
declare global {
  interface Window {
    global: typeof globalThis;
    process: any; // Using 'any' to avoid TypeScript errors
    events: { EventEmitter: any };
    util: any; // Using 'any' to allow for more flexible property access
    Buffer: any;
    noopFn: (...args: any[]) => void;
  }
}

// Global object polyfill
if (typeof window !== 'undefined') {
  // Create a no-op function to handle any function calls
  window.noopFn = (...args: any[]) => {
    // No operation, just a placeholder
    return undefined;
  };

  // Set global to window for Node.js compatibility
  window.global = window;
  
  // Process polyfill - create a proxy to handle any property access
  window.process = new Proxy({
    env: {},
    nextTick: (fn: Function, ...args: any[]) => setTimeout(() => fn(...args), 0),
    version: '0.0.0',
    versions: { node: '0.0.0' },
    platform: 'browser'
  }, {
    get: (target, prop) => {
      if (prop in target) {
        return target[prop as keyof typeof target];
      }
      return window.noopFn;
    }
  });
  
  // Events module polyfill with a complete EventEmitter implementation
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

      // Add additional common EventEmitter methods
      once(event: string, listener: Function): this {
        const onceWrapper = (...args: any[]) => {
          listener(...args);
          this.removeListener(event, onceWrapper);
        };
        this.on(event, onceWrapper);
        return this;
      }
      
      removeAllListeners(event?: string): this {
        if (event) {
          delete this.events[event];
        } else {
          this.events = {};
        }
        return this;
      }
    }
  };
  
  // Create a Proxy for the util object to handle any property access
  // This will prevent errors when code tries to access properties that don't exist
  window.util = new Proxy({
    // Define the specific functions we know are needed
    debuglog: () => window.noopFn,
    inspect: (obj: any) => {
      try {
        return typeof obj === 'object' ? JSON.stringify(obj) : String(obj);
      } catch (e) {
        return '[Object]';
      }
    },
    // Add any other util functions you know are needed
    inherits: (ctor: any, superCtor: any) => {
      if (ctor === undefined || ctor === null) return;
      if (superCtor === undefined || superCtor === null) return;
      ctor.super_ = superCtor;
      Object.setPrototypeOf(ctor.prototype, superCtor.prototype);
    },
    // Add the logging functions
    format: (format: string, ...args: any[]) => {
      return format.replace(/%[sdjifoO%]/g, (match) => {
        if (match === '%%') return '%';
        if (args.length === 0) return match;
        const arg = args.shift();
        if (match === '%s') return String(arg);
        if (match === '%d') return Number(arg).toString();
        if (match === '%j') {
          try {
            return JSON.stringify(arg);
          } catch (e) {
            return '[Circular]';
          }
        }
        if (match === '%i') return parseInt(arg).toString();
        if (match === '%f') return parseFloat(arg).toString();
        if (match === '%o' || match === '%O') {
          try {
            return JSON.stringify(arg);
          } catch (e) {
            return '[Object]';
          }
        }
        return match;
      });
    }
  }, {
    get: (target, prop) => {
      // Return the property if it exists
      if (prop in target) {
        return target[prop as keyof typeof target];
      }
      // Otherwise, return a no-op function
      return window.noopFn;
    }
  });
  
  // Buffer polyfill - provide more functionality
  window.Buffer = new Proxy({
    isBuffer: (obj: any) => false,
    from: (data: any, encoding?: string) => {
      // A minimal implementation that returns the original data
      return data;
    },
    alloc: (size: number) => {
      // Return an empty array of the specified size
      return new Uint8Array(size);
    },
    toString: (buffer: any, encoding?: string) => {
      if (typeof buffer === 'string') return buffer;
      if (buffer instanceof Uint8Array) {
        return new TextDecoder().decode(buffer);
      }
      return String(buffer);
    }
  }, {
    get: (target, prop) => {
      if (prop in target) {
        return target[prop as keyof typeof target];
      }
      return window.noopFn;
    }
  });
}

// Empty export to make this a module
export {};