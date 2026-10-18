import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { userSchema } from "./userSchema";
import { paymentStatusEnumSchema } from "./paymentSchema";
import { WORKSHOP_ATTENDANCE_MODES } from "../lib/workshopAttendance";

export const workshopAttendanceModeEnum = pgEnum(
  "workshop_attendance_mode",
  WORKSHOP_ATTENDANCE_MODES,
);

export const workshopSchema = pgTable("workshop", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name").notNull(),
  bannerImage: varchar("banner_image"),
  description: varchar("description").notNull(),
  content: varchar("content").notNull(),
  // UTC values in existing timestamp-without-time-zone columns; UI uses IST.
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  // certificate:
  onlinePrice: integer("online_price").notNull(),
  offlinePrice: integer("offline_price").notNull(),
  attendanceMode: workshopAttendanceModeEnum("attendance_mode")
    .notNull()
    .default("both"),
  isCompleted: boolean("is_completed").default(false),
  whatsappLink: varchar("whatsapp_link"),
});

export const workshopImageSchema = pgTable("workshop_image", {
  id: uuid("id").defaultRandom().primaryKey(),
  workshopId: uuid("workshop_id")
    .notNull()
    .references(() => workshopSchema.id, { onDelete: "cascade" }),
  displayOrder: integer("display_order").notNull().default(0),
  image: varchar("image").notNull(),
});

export const modeOfAttandaceEnumSchema = pgEnum("modeOfAttandace", [
  "online",
  "offline",
]);
export const registrationSourceEnumSchema = pgEnum("registrationSource", [
  "website",
  "whatsapp",
  "facebook",
  "instagram",
]);

export const workshopRegistrationSchema = pgTable(
  "workshop_registration",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workshopId: uuid("workshop_id")
      .notNull()
      .references(() => workshopSchema.id, { onDelete: "set null" }),
    userId: uuid("user_id")
      .references(() => userSchema.id, { onDelete: "set null" })
      .notNull(),
    email: varchar("email").notNull(),
    name: varchar("name").notNull(),
    mobileNumber: varchar("mobile_number").notNull(),
    designation: varchar("designation").notNull(),
    instituteName: varchar("institute_name").notNull(),
    city: varchar("city"),
    modeOfAttandnace: modeOfAttandaceEnumSchema("mode_of_attandnace")
      .notNull()
      .default("online"),
    // add payment status and default as pending
    paymentStatus: paymentStatusEnumSchema("payment_status")
      .notNull()
      .default("pending"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    workshopAmount: integer("workshop_amount").notNull().default(0),
    couponDiscount: integer("coupon_discount").default(0).notNull(),
    payableAmount: integer("payable_amount").notNull().default(0),
    registrationSource: registrationSourceEnumSchema(
      "registration_source",
    ).default("website"),
    utmSource: varchar("utm_source"),
    utmMedium: varchar("utm_medium"),
    utmCampaign: varchar("utm_campaign"),
    utmContent: varchar("utm_content"),
    certificateUrl: varchar("certificate_url"),
  },
  (tables) => [
    index("idx_workshop_id_user_id_created_at").on(
      tables.workshopId,
      tables.userId,
      tables.createdAt,
    ),
  ],
);

export const couponCodeSchema = pgTable("coupon_code", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: varchar("code").notNull(),
  onlineDiscount: integer("online_discount").default(0).notNull(),
  offlineDiscount: integer("offline_discount").default(0).notNull(),
  workshopId: uuid("workshop_id")
    .notNull()
    .references(() => workshopSchema.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const seminarSchema = pgTable("seminar", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name").notNull(),
  bannerImage: varchar("banner_image"),
  description: varchar("description").notNull(),
  content: varchar("content").notNull(),
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  // certificate:
  onlinePrice: integer("online_price"),
  offlinePrice: integer("offline_price"),
  isCompleted: boolean("is_completed").default(false),
  whatsappLink: varchar("whatsapp_link"),
});

export const presentationType = pgEnum("presentation_type", [
  "presentation",
  "poster",
  "paper",
  "online_paper",
  "both_offile",
]);

export const seminarRegistrationsSchema = pgTable("seminar_registrations", {
  id: uuid("id").defaultRandom().primaryKey(),

  seminarId: uuid("seminar_id")
    .notNull()
    .references(() => seminarSchema.id, { onDelete: "set null" }),
  userId: uuid("user_id").references(() => userSchema.id, {
    onDelete: "set null",
  }),

  // Basic Details
  name: varchar("name", { length: 255 }).notNull(),
  gender: varchar("gender", { length: 20 }).notNull(),
  mobileNumber: varchar("mobile_number", { length: 20 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  designation: varchar("designation", { length: 255 }).notNull(),
  qualification: varchar("qualification", { length: 255 }).notNull(),
  instituteName: varchar("institute_name", {
    length: 255,
  }).notNull(),

  // Address
  addressLine1: text("address_line_1"),
  addressLine2: text("address_line_2"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  country: varchar("country", { length: 100 }),
  pincode: varchar("pincode", { length: 20 }),

  // Paper Presentation
  paperPresentation: boolean("paper_presentation"),
  presentationType: presentationType("presentation_type"),
  presentationTitle: text("presentation_title"),
  authorName: varchar("author_name", { length: 255 }),
  paperInstitution: varchar("paper_institution", { length: 255 }),

  // Additional Info
  additionalDetails: text("additional_details"),

  // Reference
  referenceType: varchar("reference_type", { length: 50 }).notNull(),
  referencePersonName: varchar("reference_person_name", { length: 255 }),
  referencePersonMobile: varchar("reference_person_mobile", { length: 20 }),
  socialMediaName: varchar("social_media_name", { length: 255 }),

  // Registration
  registrationMode: varchar("registration_mode", { length: 20 }).notNull(),
  offlineDuration: varchar("offline_duration", { length: 20 }),

  // NAIT
  isNaitMember: boolean("is_nait_member").notNull(),
  naitRegistrationId: varchar("nait_registration_id", { length: 100 }),

  // Payment
  amount: varchar("amount", { length: 20 }).notNull(),
  paymentStatus: varchar("payment_status", { length: 20 })
    .default("pending")
    .notNull(),
  paymentId: varchar("payment_id", { length: 255 }),
  orderId: varchar("order_id", { length: 255 }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),

  utmSource: varchar("utm_source"),
  utmMedium: varchar("utm_medium"),
  utmCampaign: varchar("utm_campaign"),
  utmContent: varchar("utm_content"),
  certificateUrl: varchar("certificate_url"),
  isFirstDayLogged: boolean("is_first_day_logged").default(false),
  isSecondDayLogged: boolean("is_second_day_logged").default(false),
  isFirstDayBreakfast: boolean("is_first_day_breakfast").default(false),
  isFirstDayLunch: boolean("is_first_day_lunch").default(false),
  isSecondDayBreakfast: boolean("is_second_day_breakfast").default(false),
  isSecondDayLunch: boolean("is_second_day_lunch").default(false),
  isBagGiven: boolean("is_bag_given").default(false),
  qrPdfUrl: varchar("qr_pdf_url"),
  qrImgUrl: varchar("qr_img_url"),
  sesMailId: varchar("ses_mail_id"),
  verificationUrl: varchar("verification_url"),
});
