import gofer from '@gofer-engine/engine';
// highlight-next-line
import { addPrefix } from './addPrefix';

gofer
  .schedule(
    'HL7v2',
    {
      second: 0,
      minute: 15,
    },
    true,
  )
  .file({
    directory: '//fileshare/your_directory',
    filterOptions: {
      filenameRegex: '*\\.hl7$',
      fileAgeMinMS: 1000,
      ignoreDotFiles: true,
    }
  })
  .routes((route) => [
    route()
      // highlight-next-line
      .transform(addPrefix('PID-18.1', 'H'))
      .send('tcp', 'emr.example.com', 5517),
    route()
      // highlight-next-line
      .transform(addPrefix('PID.18-1', 'L'))
      .send('https', {
        host: 'lab.example.com',
        port: 443,
        path: '/api/adt-feed',
        method: 'POST',
        basicAuth: {
          username: 'gofer-service',
          password: 'gofer-service-password',
        }
      })
  ]);