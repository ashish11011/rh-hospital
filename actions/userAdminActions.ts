"use server";

import { db } from "@/lib/dbConfig";
import { user } from "@/db/index";
import { ilike, desc, count, or } from "drizzle-orm";

export async function getUsers({
  page = 1,
  limit = 20,
  search = ""
}) {
  try {
    const offset = (page - 1) * limit;

    const baseQuery = db.select({
      id: user.id,
      name: user.name,
      email: user.email,
      mobileNumber: user.mobileNumber,
      designation: user.designation,
      instituteName: user.instituteName,
      city: user.city,
      isActive: user.isActive,
      role: user.role,
      createdAt: user.createdAt,
    }).from(user);

    let query = baseQuery;
    let countQ = db.select({ value: count() }).from(user);

    if (search) {
      const searchCondition = or(
        ilike(user.name, `%${search}%`),
        ilike(user.email, `%${search}%`),
        ilike(user.mobileNumber, `%${search}%`)
      );
      query = query.where(searchCondition) as any;
      countQ = countQ.where(searchCondition) as any;
    }

    const data = await query.limit(limit).offset(offset).orderBy(desc(user.createdAt));
    const totalResult = await countQ;
    const total = totalResult[0].value;

    return { data, total };
  } catch (err) {
    console.error(err);
    return { data: [], total: 0 };
  }
}
