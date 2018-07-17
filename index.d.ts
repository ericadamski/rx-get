// Type definitions for rx-get
// Project: https://github.com/ericadamski/rx-get
// Definitions by: Eric Adamski <ericadamski.github.io>

import { Agent } from 'https';
import { Observable } from 'rxjs';

/// <reference types="node" />

type RxGetResponse = {
  status: number;
  statusText: string;
  headers: Object;
  body: Buffer;
  progress: number;
  done: boolean;
  json: () => any;
  text: () => string;
};

export default function get(
  url: string,
  options?: {
    protocol?: string;
    host?: string;
    hostname?: string;
    family?: number;
    port?: number;
    localAddress?: string;
    sockectPath?: string;
    method?: string;
    path?: string;
    headers?: Object;
    auth?: string;
    agent?: Agent | boolean;
    createConnection?: Function;
    timeout?: number;
    body?: string;
  }
): Observable<RxGetResponse>;
