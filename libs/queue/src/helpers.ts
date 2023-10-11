import { IEventHandler } from '@gofer-engine/handelse';

export const promisify = async <T>(t: T) => t;

export const lastInArray = <T>(arr: T[]): T | undefined => {
  if (arr.length === 0) return undefined;
  return arr[arr.length - 1];
};

export const shuffle = <T>(arr: T[]): T[] => {
  const array = [...arr];
  let currentIndex = array.length,
    randomIndex;
  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
};

export const timedOut = (start: Date, timeout: number): boolean => {
  const now = new Date().getTime();
  return now - start.getTime() >= timeout;
};

export const eventful = <T>(
  setter: T | ((prev: T) => T),
  prev: T,
  handler: IEventHandler<[T, T]>,
): T => {
  const newVal = setter instanceof Function ? setter(prev) : setter;
  handler.pub([prev, newVal]);
  return newVal;
};
