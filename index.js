const url = require('url');
const https = require('https');
const { merge, fromEvent, Subject } = require('rxjs');
const { concatMap, tap, map, take } = require('rxjs/operators');

module.exports = function(uri, options = {}) {
  const response$ = new Subject();
  const { host, hostname, pathname, port, protocol } = url.parse(uri);
  let b = Buffer.alloc(0);

  const request = https.request(
    Object.assign(
      {
        protocol,
        host,
        hostname,
        port,
        path: pathname,
      },
      options,
      {
        headers: Object.assign(
          {
            'user-agent': 'rx-get/1.0 (+https://github.com/ericadamski/rx-get)',
          },
          options.headers
        ),
      }
    ),
    response$.next.bind(response$)
  );

  options.body && request.write(options.body);
  request.end();

  return response$.pipe(
    tap(r =>
      fromEvent(r, 'data').subscribe(
        c => (b = Buffer.concat([b, c], b.length + c.length))
      )
    ),
    concatMap(r =>
      merge(
        fromEvent(r, 'end').pipe(
          map(() => ({
            status: r.statusCode,
            statusText: r.statusMessage,
            headers: r.headers,
            json() {
              return JSON.parse(b.toString());
            },
            text() {
              return b.toString();
            },
          }))
        ),
        fromEvent(r, 'error').pipe(
          concatMap(e => {
            // istanbul ignore next ⚠️ Very hard to test
            return throwError(e);
          })
        )
      )
    ),
    take(1)
  );
};
