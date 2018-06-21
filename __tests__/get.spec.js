const mockResponseValue = JSON.stringify({
  key: 'value',
});
const mockRequest = {
  end: jest.fn(),
  write: jest.fn(),
};

const mockResponse = {
  headers: { 'content-length': Buffer.from(mockResponseValue, 'ascii').length },
  addEventListener(event, handler) {
    switch (event) {
      case 'data':
        return handler(Buffer.from(mockResponseValue, 'ascii'));
      case 'end':
        return setImmediate(handler);
    }
  },
  removeEventListener() {},
};

jest.mock('http', () => ({
  request: jest.fn().mockImplementation((_, cb) => {
    setImmediate(() => cb(mockResponse));

    return mockRequest;
  }),
}));

jest.mock('https', () => ({
  request: jest.fn().mockImplementation((_, cb) => {
    setImmediate(() => cb(mockResponse));

    return mockRequest;
  }),
}));

const { Observable } = require('rxjs');
const { last, toArray } = require('rxjs/operators');
const https = require('https');
const http = require('http');
const get = require('../index.js');
const URL = 'http://google.com/?q=banana';

describe('.get', () => {
  beforeEach(() => {
    mockRequest.end.mockClear();
    http.request.mockClear();
    https.request.mockClear();
  });

  it('should return an Observable', () => {
    expect(get(URL)).toBeInstanceOf(Observable);
  });

  it('should call the correct protocol', () => {
    return get('https://google.com')
      .toPromise()
      .then(() => {
        expect(https.request).toHaveBeenCalledTimes(1);
      });
  });

  it('should called request.end', () => {
    return get(URL)
      .toPromise()
      .then(() => {
        expect(mockRequest.end).toHaveBeenCalledTimes(1);
      });
  });

  it('should break appart the url if a string is passed', () => {
    return get(URL)
      .toPromise()
      .then(() => {
        expect(http.request).toHaveBeenCalledTimes(1);
        expect(http.request.mock.calls[0][0]).toEqual({
          protocol: 'http:',
          host: 'google.com',
          hostname: 'google.com',
          port: null,
          path: '/?q=banana',
          headers: {
            'user-agent': 'rx-get/1.0 (+https://github.com/ericadamski/rx-get)',
          },
        });
      });
  });

  it('should override the options if passed', () => {
    return get(URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
    })
      .toPromise()
      .then(() => {
        expect(http.request).toHaveBeenCalledTimes(1);
        expect(http.request.mock.calls[0][0]).toEqual({
          protocol: 'http:',
          method: 'POST',
          host: 'google.com',
          hostname: 'google.com',
          port: null,
          path: '/?q=banana',
          headers: {
            'content-type': 'application/json',
            'user-agent': 'rx-get/1.0 (+https://github.com/ericadamski/rx-get)',
          },
        });
      });
  });

  it('should call .write if body is passed', () => {
    const body = JSON.stringify({ key: 'value' });

    return get(URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body,
    })
      .toPromise()
      .then(() => {
        expect(mockRequest.write).toHaveBeenCalledTimes(1);
        expect(mockRequest.write).toHaveBeenCalledWith(body);
      });
  });

  it('should return an observable of the methods json and text', () => {
    return get(URL)
      .toPromise()
      .then(({ json, text }) => {
        expect(json).toBeInstanceOf(Function);
        expect(text).toBeInstanceOf(Function);
        expect(text()).toBe(mockResponseValue);
        expect(json()).toEqual({ key: 'value' });
      });
  });
});
