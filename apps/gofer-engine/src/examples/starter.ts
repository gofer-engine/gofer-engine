import gofer from '@gofer-engine/engine';

gofer
  .listen('tcp', 'localhost', 5500)
  .ack()
  .route((route) => route.send('tcp', 'hl7.emr.example.com', 5500))
  .run();
