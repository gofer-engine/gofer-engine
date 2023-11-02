import {
  MsgTypes,
  RequiredProperties,
  RouteFlowNamed,
  isConnectionFlow,
  isHTTPConnection,
  isHTTPSConnection,
  isTCPConnection,
} from './types';

export const getMsgTypeFromFlows = (
  flows: RequiredProperties<RouteFlowNamed<'F', 'F'>, 'id'>[],
): MsgTypes => {
  let msgType: MsgTypes | undefined;
  flows.some((namedFlow) => {
    const flow = namedFlow.flow;
    if (isConnectionFlow(flow)) {
      if (isTCPConnection(flow)) {
        msgType = flow.tcp.msgType;
      } else if (isHTTPConnection(flow)) {
        msgType = flow.http.msgType;
      } else if (isHTTPSConnection(flow)) {
        msgType = flow.https.msgType;
      } else {
        throw new Error('New connection type not implemented');
      }
    }
    return false;
  });
  return msgType ?? 'HL7v2';
};
