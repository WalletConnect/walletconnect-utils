export const PINO_LOGGER_DEFAULTS = {
  level: 'info',
  prettyPrint: {
    colorize: true,
    translateTime: 'SYS:standard',
    ignore: 'pid,hostname',
  },
};

export const PINO_CUSTOM_CONTEXT_KEY = 'custom_context';
