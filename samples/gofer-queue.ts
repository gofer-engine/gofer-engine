import { queue } from '@gofer-engine/queue';

// const q1 = queue(
//   'foo',
//   async (msg: string) => {
//     console.log(`<foo> ${msg}`)
//     return true
//   },
//   {
//     verbose: true,
//   }
// )

const q2 = queue(
  'bar',
  async (msg: string) => {
    console.log(`<bar> ${msg}`);
    // test as if every task fails...
    return false;
  },
  {
    verbose: true,
    // store: 'file',
    max_retries: 5,
  },
);

// q1.push('Hello World!')
q2.push('Good Morning.');
