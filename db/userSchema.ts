import {
  boolean,
  index,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const userSchema = pgTable("user", {
  id: uuid("id").defaultRandom().primaryKey(),
  rhId: varchar("rh_id"),
  name: varchar("name").notNull(),
  email: varchar("email").notNull().unique(),
  mobileNumber: varchar("mobile_number").notNull(),
  designation: varchar("designation"),
  instituteName: varchar("institute_name"),
  city: varchar("city"),
  isActive: boolean("is_active").default(true),
  isVarifiedEmail: boolean("is_varified_email").default(false),
  isVarifiedMobileNumber: boolean("is_varified_mobile_number").default(false),
  password: varchar("password"),
  fcmToken: varchar("fcm_token"),
  deviceId: varchar("device_id"),
  lastActive: timestamp("last_active"),
  role: varchar("role").notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const whatsappConversationSchema = pgTable("whatsapp_conversation", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => userSchema.id),
  mobileNumber: text("mobile_number").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const messageRoleEnum = pgEnum("message_role", ["user", "assistant"]);

export const conversationMessageSchema = pgTable("conversation_message", {
  id: uuid("id").defaultRandom().primaryKey(),
  conversationId: uuid("conversation_id").references(
    () => whatsappConversationSchema.id,
  ),
  role: messageRoleEnum("role").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const emailLogsSchema = pgTable(
  "email_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => userSchema.id),
    email: varchar("email").notNull(),
    subject: varchar("subject").notNull(),
    status: varchar("status").notNull().default("pending"),
    failureReason: varchar("failure_reason"),
    sendAttemptId: uuid("send_attempt_id"),
    sesMessageId: varchar("ses_message_id"),
    createdAt: timestamp("created_at").defaultNow(),
    openedAt: timestamp("opened_at"),
  },
  (table) => [
    index("email_logs_send_attempt_idx").on(table.sendAttemptId),
    uniqueIndex("email_logs_ses_message_recipient_idx").on(
      table.sesMessageId,
      table.email,
    ),
  ],
);

export const userIdMemberShipTypeEnum = pgEnum("user_membership_type", [
  "temporary",
]);
export const userProfessionEnum = pgEnum("user_profession", [
  "nursing_student",
  "nursing_officer",
  "nursing_tutor",
  "assistant_professor",
  "associate_professor",
  "professor",
  "principal",
  "hospital_administrator",
  "other",
]);

export const bloodGroupEnum = pgEnum("blood_group", ["A", "B", "AB", "O"]);

export const rhFactorEnum = pgEnum("rh_factor", ["positive", "negative"]);

export const userQualificationEnum = pgEnum("user_qualification", [
  "anm",
  "gnm",
  "bsc_nursing",
  "pbbsc_nursing",
  "msc_nursing",
  "phd",
  "other",
]);

export const userGenderEnum = pgEnum("user_gender", [
  "male",
  "female",
  "other",
]);

export const membershipPurchaseTypeEnum = pgEnum("membership_purchase_type", [
  "free",
  "paid",
  "referred",
  "complimentary",
  "admin",
]);

export const userCardSchema = pgTable("user_card", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => userSchema.id),

  memberShipNumber: serial("member_ship_number").notNull(),
  memberShipId: varchar("member_ship_id"),
  memberShipType: userIdMemberShipTypeEnum("membership_type")
    .default("temporary")
    .notNull(),
  fullName: varchar("full_name").notNull(),
  mobileNumber: varchar("mobile_number").notNull(),
  email: varchar("email").notNull(),
  gender: userGenderEnum("gender").notNull(),
  bloodGroup: bloodGroupEnum("blood_group"),
  rhFactor: rhFactorEnum("rh_factor"),

  dateOfBirth: timestamp("date_of_birth"),

  state: varchar("state").notNull(),
  city: varchar("city").notNull(),

  profession: userProfessionEnum("profession").default("other").notNull(),
  otherProfession: varchar("other_profession", { length: 120 }),
  qualification: userQualificationEnum("qualification")
    .default("other")
    .notNull(),
  organizationName: varchar("organization_name"),

  passportPhoto: varchar("passport_photo"),
  referralCode: varchar("referral_code"),
  hearAboutRh: varchar("hear_about_rh"),

  termsAccepted: boolean("terms_accepted").default(false).notNull(),

  activationDate: timestamp("activation_date"),
  validityDate: timestamp("validity_date"),
  cardType: varchar("card_type").notNull(),

  isActive: boolean("is_active").default(true).notNull(),
  membershipPurchaseType: membershipPurchaseTypeEnum("membership_purchase_type")
    .default("free")
    .notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const contactSchema = pgTable("contact", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name").notNull(),
  email: varchar("email"),
  mobileNumber: varchar("mobile_number"),
  message: varchar("message"),
  createdAt: timestamp("created_at").defaultNow(),
  formSource: varchar("form_source"),
});

export const blogStatusEnumSchema = pgEnum("blog_status_enum", [
  "draft",
  "published",
  "archived",
]);

export const blogSchema = pgTable(
  "blogs",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    // Content
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    shortDescription: varchar("short_description", { length: 500 }),
    content: text("content").notNull(),

    // Author
    authorName: varchar("author_name", { length: 150 }).notNull(),

    // Media
    featuredImage: text("featured_image"),
    bannerImage: text("banner_image"),

    // SEO
    metaTitle: varchar("meta_title", { length: 255 }),
    metaDescription: varchar("meta_description", { length: 300 }),
    metaKeywords: text("meta_keywords"),

    // Classification
    category: varchar("category", { length: 100 }),
    tags: varchar("tags").array(),

    // Status
    status: blogStatusEnumSchema("status").default("published").notNull(),
    isFeatured: boolean("is_featured").default(false).notNull(),

    // Publish
    publishedAt: timestamp("published_at"),

    // Audit
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    statusIdx: index("blogs_status_idx").on(table.status),
    categoryIdx: index("blogs_category_idx").on(table.category),
    publishedIdx: index("blogs_published_at_idx").on(table.publishedAt),
  }),
);
