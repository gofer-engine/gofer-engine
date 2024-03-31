import gofer from '@gofer-engine/engine';

gofer
  .listen('tcp', 'localhost', 5500)
  .id('sample-adt-channel')
  .filter((msg) => msg.get('MSH-9.1') === 'ADT')
  .ack()
  .transform((msg) => msg
    .copy('PID-18.1', 'PV1-19.1')
    .delete('NTE')
  )
  .routes(route => [
    route()
      .id('route-to-archives')
      .store({
        file: {
          filename: '$MSH-10',
          path: [
            '//fileshare.example.com',
            'archives',
            'hl7',
          ],
          extension: 'hl7',
          format: 'string',
        }
      }),
    route()
      .id('route-to-emr')
      .transform((msg, context) => {
        context.setRouteVar(
          'location', 
          msg.get('PV1.3-1')
        )
        return msg
      })
      .send('tcp', 'emr.example.com', 5501)
      .store({
        postgres: {
          host: 'localhost',
          table: 'adt_emr_ack_audit',
          database: 'gofer_engine',
        }
      })
  ])
  .run();
