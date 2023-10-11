import handelse from '..';

export const fakeStore: string[] = [];

export const addListeners = () => {
  // Listen for events on the global:test1 event handler and add the event to the fakeStore.
  const test1 = handelse.get<string>('global:test1', { eventType: 'string' });
  return test1.listen((task) => {
    fakeStore.push(task);
    return true;
  });
};
