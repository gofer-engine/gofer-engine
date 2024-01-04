```ts title="/src/eventsExample.ts"
import eventSystemManager from '@gofer-engine/handelse';

eventSystemManager.createGlobal('example-global-event-handler');

const subId_1 = eventSystemManager.sub('example-global-event-handler', (event) => {
  console.log(event);
  return true;
});

eventSystemManager.pub('example-global-event-handler', 'Hello World!');

eventSystemManager.unsub('example-global-event-handler', subId_1);

const exampleGlobalEventHandler = eventSystemManager.get(
  'example-global-event-handler'
);

exampleGlobalEventHandler.sub((event) => {
  console.log(event);
  return true;
});

exampleGlobalEventHandler.pub('Hello World!');

// unsubscribe all subscribers
exampleGlobalEventHandler.removeAll();
eventSystemManager.removeAllSubs('example-global-event-handler');

eventSystemManager.delete('example-global-event-handler');

// Local event handler example
const localHandler = eventSystemManager.createLocal();

const localSubId = localHandler.sub((event) => {
  console.log(event);
  return true;
});

localHandler.pub('Hello World!');

localHandler.unsub(localSubId);

// Typed event handler example
eventSystemManager.global<'foo'|'bar'>('typed-handler', { eventType: 'string' });

const typedHandler = eventSystemManager.get<'foo'|'bar'>('typed-handler');

typedHandler.sub((event) => {
  // @ts-expect-error - event is typed as 'foo'|'bar' and not `string`
  if (event === 'baz') {
    console.log(event);
  }
  return true;
});

// @ts-expect-error - event is typed as 'foo'|'bar' and not `string`
typedHandler.pub('baz');

// add a listener to a future event handler
eventSystemManager.sub(
  'new-handler',
  e => Boolean(console.log(e)),
  { createIfNotExists: true },
);

eventSystemManager.global('new-handler', { getIfAlreadyCreated: true });

eventSystemManager.clear();
```
