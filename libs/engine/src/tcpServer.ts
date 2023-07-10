import net from 'net'
import handelse from '@gofer-engine/handelse'
import Msg, { IMsg } from '@gofer-engine/ts-hl7'
import { AckFunc, ChannelConfig, IContext, IMessageContext } from './types'
import { queue } from './queue'
import { doAck } from './doAck'
import { isLogging, logger, mapOptions } from './helpers'
import { randomUUID } from 'crypto'
import { setMsgVar, getMsgVar } from './variables'

export const tcpServer = <
  Filt extends 'O' | 'F' | 'B' = 'B',
  Tran extends 'O' | 'F' | 'B' = 'B'
>(
  channel: ChannelConfig<Filt, Tran, 'S'>,
  ingestMessage: (
    msg: IMsg,
    ack: AckFunc | undefined,
    context: IMessageContext
  ) => Promise<boolean>,
  context: IContext,
  direct?: boolean
): net.Server => {
  const {
    host,
    port,
    SoM = '\x0B',
    EoM = '\x1C',
    CR = '\r',
    maxConnections,
  } = channel.source.tcp
  const id = channel.id
  const queueConfig = channel.source.queue
  const server = net.createServer({ allowHalfOpen: false })
  if (maxConnections !== undefined) server.setMaxListeners(maxConnections)
  server.listen(port, host, () => {
    handelse.go(`gofer:${id}.onLog`, {
      log: `Server listening on ${host}:${port}`,
      channel: id,
    }, {
      createIfNotExists: direct
    })
  })
  server.on('connection', (socket) => {
    socket.setEncoding('utf8')

    const clientAddress = `${socket.remoteAddress}:${socket.remotePort}`
    handelse.go(`gofer:${id}.onLog`, {
      log: `New client connection from ${clientAddress}`,
      channel: id,
    }, {
      createIfNotExists: direct
    })

    const data: Record<string, string> = {}

    socket.on('data', (packet) => {
      handelse.go(`gofer:${id}.onLog`, {
        log: `Received Data from Client ${clientAddress}:`,
        channel: id,
      }, {
        createIfNotExists: direct
      })
      let hl7 = packet.toString()
      const f = hl7[0]
      const e = hl7[hl7.length - 1]
      const l = hl7[hl7.length - 2]
      // if beginning of a message and there is an existing partial message, then delete it
      if (f === SoM && data?.[clientAddress] !== undefined) {
        handelse.go(`gofer:${id}.onError`, {
          error: `MESSAGE LOSS: Partial message removed from ${clientAddress}`,
          channel: id,
        }, {
          createIfNotExists: direct
        })
        delete data[clientAddress]
      }
      // if end of a message then see if there is a partial message to append it to.
      if (e === CR && l === EoM) {
        hl7 = hl7.slice(0, -2)
        if (f === SoM) {
          hl7 = hl7.slice(1)
        } else {
          hl7 = (data?.[clientAddress] || '') + hl7.slice(0, -2)
          delete data[clientAddress]
        }
        // else must not be the end of the message, so create/add to the partial message
      } else {
        // if this is the beginning of a message, then slice off the beginning message character
        if (f === SoM) {
          hl7 = hl7.slice(1)
        }
        data[clientAddress] = (data?.[clientAddress] || '') + hl7
        return
      }
      const msg = new Msg(hl7)
      const msgUUID = randomUUID()
      context.setMsgVar = setMsgVar(msgUUID)
      context.getMsgVar = getMsgVar(msgUUID)
      context.messageId = msgUUID
      context.channelId = id
      context.logger = logger({ channelId: id, msg })
      handelse.go(`gofer:${id}.onReceive`, {
        msg,
        channel: id,
      }, {
        createIfNotExists: direct
      })
      if (queueConfig) {
        handelse.go(`gofer:${id}.onLog`, {
          log: `Utilizing queue ${id}.source`,
          channel: id,
        }, {
          createIfNotExists: direct
        })
        const ack = doAck(
          msg,
          { text: 'Queued' },
          {
            channelId: id,
            flowId: 'source',
          },
          context as IMessageContext
        )
        socket.write(SoM + ack.toString() + EoM + CR)
        handelse.go(`gofer:${id}.onAck`, {
          channel: channel.id,
          msg: msg,
          ack: ack,
        }, {
          createIfNotExists: direct
        })
        queue(
          `${id}.source`,
          (msg) => ingestMessage(msg, undefined, context as IMessageContext),
          msg,
          mapOptions({
            ...queueConfig,
            verbose:
              queueConfig !== undefined
                ? queueConfig.verbose
                : isLogging('debug', channel.logLevel),
          })
        )
      } else {
        ingestMessage(
          msg,
          (ack: IMsg) => {
            socket.write(SoM + ack.toString() + EoM + CR)
          },
          context as IMessageContext
        )
      }
    })
    socket.on('close', (data) => {
      if (isLogging('debug', channel.logLevel))
        console.log(
          `Client ${clientAddress} disconnected`,
          `data: ${JSON.stringify(data)}`
        )
    })
  })
  return server
}
