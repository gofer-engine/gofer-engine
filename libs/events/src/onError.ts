import handelse from '@gofer-engine/handelse';

export const onError = handelse.global<Error>('gofer:error');
onError.do((error) => {
  console.error(`${new Date().toISOString()}: [ERROR]`, error);
  return true;
});

export const throwError = onError.pub;
