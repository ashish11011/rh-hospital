import "server-only";
import { workshop, workshopImage } from "@/db";
import { db } from "@/lib/dbConfig";
import { asc, desc, eq } from "drizzle-orm";
import { cachedRedis } from "@/lib/redisCache";
import { REDIS_CACHE_TTL_SECONDS } from "@/lib/constants";

export async function getPublicWorkshops() {
  return cachedRedis(
    "workshops",
    "list",
    REDIS_CACHE_TTL_SECONDS.workshops,
    async () => db.select().from(workshop).orderBy(desc(workshop.startTime)),
  );
}

export async function getPublicWorkshopById(id: string) {
  return cachedRedis(
    "workshops",
    `detail:${id}`,
    REDIS_CACHE_TTL_SECONDS.workshops,
    async () => {
      const [record] = await db
        .select()
        .from(workshop)
        .where(eq(workshop.id, id))
        .limit(1);
      return record ?? null;
    },
  );
}

export async function getPublicWorkshopImages(workshopId: string) {
  return cachedRedis(
    "workshops",
    `images:${workshopId}`,
    REDIS_CACHE_TTL_SECONDS.workshops,
    async () =>
      db
        .select()
        .from(workshopImage)
        .where(eq(workshopImage.workshopId, workshopId))
        .orderBy(asc(workshopImage.displayOrder)),
  );
}
