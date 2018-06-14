# rx-get

[![Size](http://img.badgesize.io/ericadamski/rx-get/master/index.js.svg?compression=gzip)](https://github.com/ngryman/badge-size)
[![CircleCI](https://circleci.com/gh/ericadamski/rx-get.svg?style=shield)](https://circleci.com/gh/ericadamski/rx-get)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=shield)](https://github.com/prettier/prettier)

⛽️ An observable wrapper for nodes http.get

## Install

`yarn add rx-get`

or

`npm install rx-get`

## Usage

```javascript
const get = require('rx-get');

const token = 'your_github_token';

// Simple GET request
get('https://api.github.com/emojis', {
  headers: {
    'user-agent': 'rx-get/1.0 (+https://github.com/ericadamski/rx-get)',
  },
}).subscribe({
  next({ status, json, text }) {
    console.log(status);
    console.log(json());
  },
});

// GraphQL POST request
get('https://api.github.com/graphql', {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    query: /* GraphQL */ `
      {
        user(login: "ericadamski") {
          repositories(last: 5) {
            nodes {
              name
            }
          }
        }
      }
    `,
  }),
}).subscribe({
  next(response) {
    console.log(response.json());
  },
});
```
