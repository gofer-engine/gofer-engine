import { vars } from "./vars";

export const clearMsgVars = (messageID: string) => {
  vars.deleteVarBlock('message', messageID);
};