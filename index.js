const url = require('url');
const https = require('https');
const http = require('http');
const { merge, fromEvent, Subject } = require('rxjs');
const {
  concatMap,
  tap,
  map,
  takeUntil,
  take,
  switchMap,
} = require('rxjs/operators');

module.exports = function(uri, options = {}) {
  const response$ = new Subject();
  const { host, hostname, path, port, protocol } = url.parse(uri);
  let contentLength = 1;
  let b = Buffer.alloc(0);

  const request = (protocol === 'https:' ? https : http).request(
    Object.assign(
      {
        protocol,
        host,
        hostname,
        port,
        path,
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
    take(1),
    tap(
      r =>
        r.headers['content-length'] &&
        (contentLength = +r.headers['content-length'])
    ),
    switchMap(r =>
      fromEvent(r, 'data').pipe(
        takeUntil(
          merge(
            fromEvent(r, 'end'),
            fromEvent(r, 'error').pipe(
              concatMap(e => {
                // istanbul ignore next ⚠️ Very hard to test
                return throwError(e);
              })
            )
          )
        ),
        map(c => {
          b = Buffer.concat([b, c], b.length + c.length);
          const progress = (b.length / contentLength) * 100;
          const done = progress >= 100;

          // istanbul ignore next ⚠️ Relatively hard to test
          return done
            ? {
                status: r.statusCode,
                statusText: r.statusMessage,
                headers: r.headers,
                body: b,
                progress,
                done,
                json() {
                  return JSON.parse(b.toString());
                },
                text() {
                  return b.toString();
                },
              }
            : { progress, done };
        })
      )
    )
  );
};
