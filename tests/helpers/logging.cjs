// Business-logic suites isolate logging. logging.test.cjs exercises the real logger/transport.
const logger = { diagnostic() {}, info() {}, warning() {}, error() {} };
module.exports = {
  "@/lib/logging/logger": {
    createLogger: () => logger,
    flushLogs: async () => {},
  },
  "@/lib/logging/client": { createClientLogger: () => logger },
  "@/lib/logging/api": { withApiLogging: (_route, handler) => handler },
  "@/lib/logging/operations": {
    runLoggedOperation: (_category, _source, operation) => operation(),
  },
  "@/lib/logging/aws": { instrumentAwsClient() {} },
};
