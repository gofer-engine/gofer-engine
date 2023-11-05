import { TLogLevel } from "@gofer-engine/message-type";

export const isLogging = (logLevel: TLogLevel, logConfigLevel?: TLogLevel) => {
  if (logConfigLevel === undefined) return true;
  const levels = ['error', 'warn', 'info', 'debug'];
  const logLevelIndex = levels.indexOf(logLevel);
  const logConfigLevelIndex = levels.indexOf(logConfigLevel);
  return logLevelIndex <= logConfigLevelIndex;
};
