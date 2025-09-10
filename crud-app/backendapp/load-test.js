// import http from 'k6/http';
// import { sleep } from 'k6';

// export let options = {
//   vus: 1,         // Virtual users
//   duration: '30s',   // Test duration
// };

// export default function () {
//   http.get('http://localhost:5000/api/users');
//   sleep(1);
// }


import http from 'k6/http';
import { check } from 'k6';

export let options = {
  vus: 10,         // Virtual users
  duration: '10s',   // Test duration
};

export default function () {
  const responses = http.batch([
    ['GET', 'http://localhost:5000/api/users', null, { tags: { ctype: 'html' } }],
    ['GET', 'http://localhost:5000/api/posts', null, { tags: { ctype: 'css' } }],
  ]);
  check(responses[0], {
    'main page status was 200': (res) => res.status === 200,
  });
}
