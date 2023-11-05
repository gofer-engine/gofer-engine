import { genId } from "@gofer-engine/tools";
import { ChannelConfig } from "../types";
import { ingestionObjectify, isLogging, routesObjectify } from "..";
import { publishers } from "@gofer-engine/events";

export const coerceStrictTypedChannels = (
  config: ChannelConfig<'B', 'B', 'L'>[],
): ChannelConfig<'B', 'B', 'S'>[] => {
  return config.map((channel) => {
    if (!channel.id) {
      channel.id = genId();
      if (isLogging('warn', channel.logLevel))
        publishers.onLog(
          `Channel "${channel.name}" config did not define an \`id\`. Assigned: "${channel.id}"`,
        );
    }
    // TODO: implement db source
    if (Object.prototype.hasOwnProperty.call(channel.source, 'db')) {
      publishers.onError(
        new Error(
          `Channel "${channel.name}"(${channel.id}) tried to use a \`db\` in the source. DB sources are not yet supported`,
        ),
      );
    }
    // TODO: implement file reader source
    if (Object.prototype.hasOwnProperty.call(channel.source, 'file')) {
      publishers.onError(
        new Error(
          `Channel "${channel.name}"(${channel.id}) tried to use a \`file\` in the source. File reader sources are not yet supported`,
        ),
      );
    }
    ingestionObjectify(channel);
    routesObjectify(channel);
    const stronglyTypedChannel = channel as ChannelConfig<'B', 'B', 'S'>;
    return stronglyTypedChannel;
  });
};