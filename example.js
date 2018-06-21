const get = require('./index.js');

get('https://api.github.com/emojis').subscribe({
  next({ progress, done, json }) {
    if (!done) return console.log(`Progress: ${progress}`);

    console.log(json());
  },
});

get('https://api.github.com/graphql', {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
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
    response.done && console.log(response.json());
  },
});
