import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./../db/index";
import { DATABASE_URL } from "@/env";

const client = postgres(DATABASE_URL);
const db = drizzle(client, { schema });
export { db };