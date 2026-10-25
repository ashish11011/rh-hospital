import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./../db/index";
import { DATABASE_URL } from "@/env";
import { databaseLogger } from "@/lib/logging/resource";

const client = postgres(DATABASE_URL);
const db = drizzle(client, { schema, logger: databaseLogger });
export { db };
