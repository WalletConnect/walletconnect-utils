import mixpanel from "mixpanel-browser";
import build from "pino-abstract-transport";

export default async function (options: Record<string, any>) {
  mixpanel.init(options.token);
  return build(async (source) => {
    for await (const obj of source) {
      if (!obj) {
        return;
      }
      mixpanel.track(JSON.stringify(obj));
    }
  });
}
