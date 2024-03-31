```ts title="/src/server.ts"
import gofer from '@gofer-engine/engine'

gofer
  .listen('tcp', 'localhost', 5500)
  .name('My First Channel')
  .ack()
  .store({ file: {} })
  .run();
```
