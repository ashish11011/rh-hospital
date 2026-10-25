import "server-only";
import {
  CloudWatchLogsClient,
  CreateLogGroupCommand,
  CreateLogStreamCommand,
  PutLogEventsCommand,
} from "@aws-sdk/client-cloudwatch-logs";
import type { LogEntry } from "./shared";

let client: CloudWatchLogsClient | undefined;
let groupReady: Promise<void> | undefined;
const streams = new Map<string, Promise<void>>();

async function ignoreExisting(operation: () => Promise<unknown>) {
  try {
    await operation();
  } catch (error) {
    if (
      !(error instanceof Error) ||
      error.name !== "ResourceAlreadyExistsException"
    )
      throw error;
  }
}

function configuration() {
  const region = process.env.CLOUDWATCH_AWS_REGION;
  const logGroupName = process.env.CLOUDWATCH_LOG_GROUP_NAME;
  const accessKeyId = process.env.ACCESS_KEY;
  const secretAccessKey = process.env.SECRET_KEY;
  if (!region || !logGroupName || !!accessKeyId !== !!secretAccessKey)
    throw new Error("CloudWatch configuration missing or incomplete");
  client ??= new CloudWatchLogsClient({
    region,
    maxAttempts: 2,
    requestHandler: { connectionTimeout: 2000, requestTimeout: 5000 },
    // An IAM role/default credential chain may be used instead of dedicated keys.
    ...(accessKeyId && secretAccessKey
      ? {
          credentials: {
            accessKeyId,
            secretAccessKey,
            sessionToken: process.env.CLOUDWATCH_AWS_SESSION_TOKEN,
          },
        }
      : {}),
  });
  return {
    client,
    logGroupName,
    prefix: (process.env.CLOUDWATCH_LOG_STREAM_PREFIX || "rh-hospital")
      .replace(/[:*]/g, "-")
      .slice(0, 200),
  };
}

/** Split streams by category and severity, then batch below the CloudWatch 1 MiB limit. */
export async function sendToCloudWatch(entries: LogEntry[]) {
  const { client, logGroupName, prefix } = configuration();
  groupReady ??= ignoreExisting(() =>
    client.send(new CreateLogGroupCommand({ logGroupName })),
  ).catch((error) => {
    groupReady = undefined;
    throw error;
  });
  await groupReady;
  const grouped = new Map<string, typeof entries>();
  for (const entry of entries) {
    const stream = `${prefix}/${entry.category}/${entry.level}/${entry.timestamp.slice(0, 10)}`;
    const events = grouped.get(stream) || [];
    events.push(entry);
    grouped.set(stream, events);
  }
  // Sequential delivery bounds concurrent requests; sequence tokens are no longer required.
  for (const [logStreamName, events] of grouped) {
    if (!streams.has(logStreamName)) {
      streams.set(
        logStreamName,
        ignoreExisting(() =>
          client.send(
            new CreateLogStreamCommand({ logGroupName, logStreamName }),
          ),
        ).catch((error) => {
          streams.delete(logStreamName);
          throw error;
        }),
      );
    }
    await streams.get(logStreamName);
    const sorted = events.sort((a, b) =>
      a.timestamp.localeCompare(b.timestamp),
    );
    for (let index = 0; index < sorted.length; index += 40) {
      const response = await client.send(
        new PutLogEventsCommand({
          logGroupName,
          logStreamName,
          logEvents: sorted.slice(index, index + 40).map((entry) => ({
            timestamp: Date.parse(entry.timestamp),
            message: JSON.stringify(entry),
          })),
        }),
      );
      if (response.rejectedLogEventsInfo)
        throw new Error("CloudWatch rejected log events");
    }
  }
}
