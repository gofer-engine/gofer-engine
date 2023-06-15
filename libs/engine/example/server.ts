import channels from './channels'
import gofer from '../src'

// start gofer with channel configs
gofer.configs(channels)

// create a new channel use OOP style
gofer.listen('tcp', 'localhost', 5501)
  .filter((msg) => msg.get('MSH-9.2') === 'ADT')
  .transform((msg) => msg)
  .setMsgVar('route', (msg) => msg.get('MSH-5'))
  .ack({ application: 'gofer Engine' })
  .store({ file: {} })
  .routes((route) => 
    [
      route().filter((msg) => msg.get('MSH-9.2') === 'ADT'),
      route().store({ file: {} })
    ]
  )

