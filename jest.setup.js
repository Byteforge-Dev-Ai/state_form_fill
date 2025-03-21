// Mock browser globals
global.Request = class {
  constructor(input, init = {}) {
    this.url = input;
    this.method = init.method || 'GET';
    this.headers = init.headers || new Headers();
    this._body = init.body || null;
  }
  
  json() {
    if (!this._body) return Promise.resolve({});
    try {
      return Promise.resolve(JSON.parse(this._body));
    } catch (e) {
      return Promise.resolve({});
    }
  }
};

global.Response = class {
  static json(data) {
    return { 
      status: 200, 
      json: async () => data,
      headers: new Headers()
    };
  }
  
  text() {
    return Promise.resolve("{}");
  }
  
  json() {
    return Promise.resolve({});
  }
};

global.Headers = class {
  constructor(init = {}) {
    this._headers = {};
    if (init) {
      Object.entries(init).forEach(([key, value]) => {
        this.set(key, value);
      });
    }
  }
  
  get(name) {
    return this._headers[name.toLowerCase()] || null;
  }
  
  set(name, value) {
    this._headers[name.toLowerCase()] = value;
  }
  
  has(name) {
    return name.toLowerCase() in this._headers;
  }
  
  append(name, value) {
    const key = name.toLowerCase();
    this._headers[key] = this._headers[key] ? `${this._headers[key]}, ${value}` : value;
  }
  
  delete(name) {
    delete this._headers[name.toLowerCase()];
  }
};

global.FormData = class {};

// Mock window fetch
global.fetch = jest.fn();

// Mock NextResponse
jest.mock('next/server', () => {
  const originalModule = jest.requireActual('next/server');
  return {
    ...originalModule,
    NextResponse: {
      json: (body, init) => {
        return {
          status: init?.status || 200,
          headers: new Headers(init?.headers),
          json: async () => body,
          text: async () => JSON.stringify(body)
        };
      },
      next: () => ({
        status: 200,
        headers: new Headers()
      })
    },
    NextRequest: function(request, options = {}) {
      this.request = request;
      this.headers = request.headers;
      this.url = request.url;
      this.method = request.method;
      this._body = request._body;
      this.ip = options.ip || '127.0.0.1';
      this.geo = options.geo || null;
      
      this.json = function() {
        if (!this._body) return Promise.resolve({});
        try {
          return Promise.resolve(JSON.parse(this._body));
        } catch (e) {
          return Promise.resolve({});
        }
      };
    }
  };
});

// Import and setup testing library
require('@testing-library/jest-dom');

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
  usePathname: () => '',
  useSearchParams: () => ({ get: () => null }),
})); 