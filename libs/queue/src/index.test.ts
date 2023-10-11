import { queue } from '../src/';
// import { expect, test, beforeAll, afterAll } from './jest'

const tasksA = ['', 'a', 'b', 'c', 'd', -1, 0, 1, 10, 42];
const completedA: typeof tasksA = [];
const tasksB = [-1, 0, 1, 10, 42, '', 'a', 'b', 'c', 'd'];
const completedB: typeof tasksB = [];

const memoryQ_A = queue<(typeof tasksA)[number]>(
  'memory-A',
  async (text) => {
    completedA.push(text);
    return true;
  },
  {
    workerLoopInterval: 10,
  },
);
const fileQ_A = queue<(typeof tasksB)[number]>(
  'file-A',
  async (text) => {
    completedB.push(text);
    return true;
  },
  {
    // verbose: true,
    store: 'file',
    // if set too low the test will fail because of file locking
    workerLoopInterval: 100,
  },
);
const maxIntializeTime = 20000;
beforeAll(async () => {
  const q1 = new Promise((res) => {
    const checking = setInterval(() => check(), 2000);

    const check = () => {
      if (memoryQ_A.workerStatus().every((s) => s.status === 'idle')) {
        res(true);
        clearInterval(checking);
      }
    };

    tasksA.forEach((t, i) => {
      memoryQ_A.push(t, i.toString());
    });
  });
  const q2 = new Promise((res) => {
    const checking = setInterval(() => check(), 15000);

    const check = () => {
      if (fileQ_A.workerStatus().every((s) => s.status === 'idle')) {
        res(true);
        clearInterval(checking);
      } else {
        console.log('still running...');
      }
    };

    tasksB.forEach((t, i) => {
      fileQ_A.push(t, i.toString());
    });
  });
  await Promise.all([q1, q2]);
}, maxIntializeTime);

test('memory-A', () => {
  expect(completedA).toEqual(tasksA);
});

test('file-A', () => {
  expect(completedB).toEqual(completedB);
});

afterAll(() => {
  memoryQ_A.destroy();
  fileQ_A.destroy();
});
