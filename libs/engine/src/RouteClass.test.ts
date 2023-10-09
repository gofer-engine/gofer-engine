import { RouteClass } from "./RouteClass";
import { RequiredProperties, Route } from "./types";

const route = new RouteClass()

const router = (r: RouteClass) => {
  // NOTE: not initializing a tcp server, just testing the config
  // so we don't need an open port nor `localhost` to resolve.
  return r.id('test').send('tcp', 'localhost', 5500)
}

const expectedRouteConfig: RequiredProperties<Route<'F', 'F', 'S'>, 'id' | 'flows'> = {
  flows: [
    {
      flow: {
        kind: 'tcp',
        tcp: {
          host: 'localhost',
          port: 5500,
        }
      },
      id: '500f9f18-a8bb-4171-9e94-22c3b681c505',
      kind: 'flow',
    },
  ],
  id: 'test',
  kind: 'route',
}

test('RouteClass', () => {
  expect(router(route).export()).toStrictEqual(expectedRouteConfig)
})