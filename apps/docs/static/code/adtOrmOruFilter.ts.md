```ts title="/src/adtOrmOruFilter.ts"
import gofer from '@gofer-engine/engine';
// highlight-next-line
import { filterByCategory } from './filterByCategory';

gofer
  .listen('tcp', 'localhost', 5512)
  // highlight-next-line
  .filter(filterByCategory(['ADT', 'ORM', 'ORU']))
  .ack();
```
