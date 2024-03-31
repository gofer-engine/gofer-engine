import gofer from '@gofer-engine/engine';

gofer
  .listen('tcp', 'localhost', 7001)
  .store({ file: {} })
  .filter((msg) => msg.get('MSH-9.1') === 'ADT')
  .transform((msg) => msg.set('MSH-5', 'EHR'))
  .store({
    mongo: {
      uri: 'mongodb://127.0.0.1:27017',
      database: 'HL7',
      collection: 'ADT',
      id: '$MSH-10.1',
      normalized: true,
    },
  })
  .ack()
  .route((r) =>
    r
      .send('tcp', 'ehr.example.com', 7002)
      .store({ file: { path: ['tmp', 'ack'] } }),
  )
  .run();
