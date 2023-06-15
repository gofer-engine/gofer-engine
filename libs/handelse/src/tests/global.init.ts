import handelse from '..'

export const globalInit = () => {
  // Create a new global accessable event handler
  return handelse.global('global:test1', {
    eventType: 'string',
  })
}
