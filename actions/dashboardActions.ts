"use server";
import { runLoggedOperation } from "@/lib/logging/operations";
import { createLogger } from "@/lib/logging/logger";

import { db } from "@/lib/dbConfig";
import {
  user,
  workshopRegistration,
  seminarRegistrations,
  workshop,
} from "@/db/index";
import { sql, eq, desc, and, gte, lte, inArray } from "drizzle-orm";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { cachedRedis } from "@/lib/redisCache";
import { REDIS_CACHE_TTL_SECONDS } from "@/lib/constants";
import { requireAdmin } from "@/lib/adminAuth";

const logger = createLogger("service", "actions/dashboardActions.ts");

export async function getTodayStats() {
  return runLoggedOperation(
    "service",
    "actions/dashboardActions.ts:getTodayStats",
    async () => {
      try {
        await requireAdmin("full");
        return await cachedRedis(
          "admin-stats",
          "getTodayStats",
          REDIS_CACHE_TTL_SECONDS.adminStats,
          async () => {
            const todayStart = startOfDay(new Date());
            const todayEnd = endOfDay(new Date());

            const newUsersToday = await db
              .select({ count: sql<number>`count(*)` })
              .from(user)
              .where(
                and(
                  gte(user.createdAt, todayStart),
                  lte(user.createdAt, todayEnd),
                ),
              );

            const workshopRegsToday = await db
              .select({ count: sql<number>`count(*)` })
              .from(workshopRegistration)
              .where(
                and(
                  gte(workshopRegistration.createdAt, todayStart),
                  lte(workshopRegistration.createdAt, todayEnd),
                  eq(workshopRegistration.paymentStatus, "completed"),
                ),
              );

            const seminarRegsToday = await db
              .select({ count: sql<number>`count(*)` })
              .from(seminarRegistrations)
              .where(
                and(
                  gte(seminarRegistrations.createdAt, todayStart),
                  lte(seminarRegistrations.createdAt, todayEnd),
                  eq(seminarRegistrations.paymentStatus, "completed"),
                ),
              );

            const workshopRevenueToday = await db
              .select({
                total: sql<number>`sum(CAST(${workshopRegistration.payableAmount} AS DECIMAL))`,
              })
              .from(workshopRegistration)
              .where(
                and(
                  gte(workshopRegistration.createdAt, todayStart),
                  lte(workshopRegistration.createdAt, todayEnd),
                  eq(workshopRegistration.paymentStatus, "completed"),
                ),
              );

            const seminarRevenueToday = await db
              .select({
                total: sql<number>`sum(CAST(${seminarRegistrations.amount} AS DECIMAL))`,
              })
              .from(seminarRegistrations)
              .where(
                and(
                  gte(seminarRegistrations.createdAt, todayStart),
                  lte(seminarRegistrations.createdAt, todayEnd),
                  eq(seminarRegistrations.paymentStatus, "completed"),
                ),
              );

            const totalRevenueToday =
              Number(workshopRevenueToday[0]?.total || 0) +
              Number(seminarRevenueToday[0]?.total || 0);

            return {
              newUsers: Number(newUsersToday[0]?.count || 0),
              revenue: totalRevenueToday,
              workshopRegistrations: Number(workshopRegsToday[0]?.count || 0),
              seminarRegistrations: Number(seminarRegsToday[0]?.count || 0),
            };
          },
        );
      } catch (error) {
        logger.error("Error fetching today stats:", { details: [error] });
        return {
          newUsers: 0,
          revenue: 0,
          workshopRegistrations: 0,
          seminarRegistrations: 0,
        };
      }
    },
    true,
  );
}

export async function getUserGrowthData() {
  return runLoggedOperation(
    "service",
    "actions/dashboardActions.ts:getUserGrowthData",
    async () => {
      try {
        await requireAdmin("full");
        return await cachedRedis(
          "admin-stats",
          "getUserGrowthData",
          REDIS_CACHE_TTL_SECONDS.adminStats,
          async () => {
            const thirtyDaysAgo = subDays(new Date(), 30);

            const data = await db
              .select({
                date: sql<string>`DATE(${user.createdAt})`,
                count: sql<number>`count(*)`,
              })
              .from(user)
              .where(gte(user.createdAt, thirtyDaysAgo))
              .groupBy(sql`DATE(${user.createdAt})`)
              .orderBy(sql`DATE(${user.createdAt})`);

            // Format for charts
            const formattedData = data.map((item) => ({
              date: format(new Date(item.date), "MMM dd"),
              users: Number(item.count),
            }));

            return formattedData;
          },
        );
      } catch (error) {
        logger.error("Error fetching user growth data:", { details: [error] });
        return [];
      }
    },
    true,
  );
}

export async function getRevenueData() {
  return runLoggedOperation(
    "service",
    "actions/dashboardActions.ts:getRevenueData",
    async () => {
      try {
        await requireAdmin("full");
        return await cachedRedis(
          "admin-stats",
          "getRevenueData",
          REDIS_CACHE_TTL_SECONDS.adminStats,
          async () => {
            const thirtyDaysAgo = subDays(new Date(), 30);

            const workshopRevenue = await db
              .select({
                date: sql<string>`DATE(${workshopRegistration.createdAt})`,
                total: sql<number>`sum(CAST(${workshopRegistration.payableAmount} AS DECIMAL))`,
              })
              .from(workshopRegistration)
              .where(
                and(
                  gte(workshopRegistration.createdAt, thirtyDaysAgo),
                  eq(workshopRegistration.paymentStatus, "completed"),
                ),
              )
              .groupBy(sql`DATE(${workshopRegistration.createdAt})`);

            const seminarRevenue = await db
              .select({
                date: sql<string>`DATE(${seminarRegistrations.createdAt})`,
                total: sql<number>`sum(CAST(${seminarRegistrations.amount} AS DECIMAL))`,
              })
              .from(seminarRegistrations)
              .where(
                and(
                  gte(seminarRegistrations.createdAt, thirtyDaysAgo),
                  eq(seminarRegistrations.paymentStatus, "completed"),
                ),
              )
              .groupBy(sql`DATE(${seminarRegistrations.createdAt})`);

            // Merge revenues by date
            const revenueMap = new Map<string, number>();

            workshopRevenue.forEach((item) => {
              revenueMap.set(item.date, Number(item.total || 0));
            });

            seminarRevenue.forEach((item) => {
              const current = revenueMap.get(item.date) || 0;
              revenueMap.set(item.date, current + Number(item.total || 0));
            });

            // Sort dates
            const sortedDates = Array.from(revenueMap.keys()).sort();

            const formattedData = sortedDates.map((dateStr) => ({
              date: format(new Date(dateStr), "MMM dd"),
              revenue: revenueMap.get(dateStr) || 0,
            }));

            return formattedData;
          },
        );
      } catch (error) {
        logger.error("Error fetching revenue data:", { details: [error] });
        return [];
      }
    },
    true,
  );
}

export async function getRecentWorkshopAnalytics() {
  return runLoggedOperation(
    "service",
    "actions/dashboardActions.ts:getRecentWorkshopAnalytics",
    async () => {
      try {
        await requireAdmin("full");
        return await cachedRedis(
          "admin-stats",
          "getRecentWorkshopAnalytics",
          REDIS_CACHE_TTL_SECONDS.adminStats,
          async () => {
            // Top 5 recent workshops
            const recentWorkshops = await db
              .select({ id: workshop.id, name: workshop.name })
              .from(workshop)
              .orderBy(desc(workshop.startTime))
              .limit(5);

            if (recentWorkshops.length === 0) return [];

            const workshopIds = recentWorkshops.map((w) => w.id);

            const registrationCounts = await db
              .select({
                workshopId: workshopRegistration.workshopId,
                count: sql<number>`count(*)`,
              })
              .from(workshopRegistration)
              .where(
                and(
                  inArray(workshopRegistration.workshopId, workshopIds),
                  eq(workshopRegistration.paymentStatus, "completed"),
                ),
              )
              .groupBy(workshopRegistration.workshopId);

            const countMap = new Map<string, number>();
            registrationCounts.forEach((r) => {
              if (r.workshopId) countMap.set(r.workshopId, Number(r.count));
            });

            const formattedData = recentWorkshops.map((w) => {
              // Create a short name for the chart (first 15 chars)
              const shortName =
                w.name.length > 15 ? w.name.substring(0, 15) + "..." : w.name;
              return {
                name: shortName,
                registrations: countMap.get(w.id) || 0,
              };
            });

            return formattedData.reverse(); // Reverse to show oldest to newest (left to right)
          },
        );
      } catch (error) {
        logger.error("Error fetching workshop analytics:", {
          details: [error],
        });
        return [];
      }
    },
    true,
  );
}
