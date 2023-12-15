```ts title="/src/filterByCategory.ts"
import { FilterFunc } from '@gofer-engine/engine';

export const filterByCategory = (categories: string[]): FilterFunc => {
  return (msg, { kind }) => {
    if (kind !== 'HL7v2') return false;
    return categories.includes(msg.get('MSH-9.1'));
  };
};
```
