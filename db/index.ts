import {
  itemEnumSchema,
  paymentSchema,
  paymentStatusEnumSchema,
} from "./paymentSchema";
import { invoiceSchema } from "./invoiceSchema";
import {
  blogSchema,
  blogStatusEnumSchema,
  contactSchema,
  conversationMessageSchema,
  emailLogsSchema,
  messageRoleEnum,
  userCardSchema,
  userSchema,
  whatsappConversationSchema,
} from "./userSchema";
import {
  courseEnrolmentSchema,
  courseEnrolmentStatusEnumSchema,
  courseItemSchema,
  courseReview,
  courseSchema,
  lessonProgressSchema,
} from "./courseSchema";
import {
  couponCodeSchema,
  modeOfAttandaceEnumSchema,
  registrationSourceEnumSchema,
  workshopImageSchema,
  workshopRegistrationSchema,
  workshopSchema,
  seminarRegistrationsSchema,
  seminarSchema,
  presentationType,
} from "./workshopSchema";

export * from "./userSchema";
export * from "./courseSchema";

export const itemEnum = itemEnumSchema;
export const modeOfAttandace = modeOfAttandaceEnumSchema;
export const paymentStatusEnum = paymentStatusEnumSchema;
export const registrationSourceEnum = registrationSourceEnumSchema;
export const presentationTypeEnum = presentationType;

export const user = userSchema;
export const userCard = userCardSchema;
export const blogStatusEnum = blogStatusEnumSchema;
export const blog = blogSchema;
export const contact = contactSchema;

export const course = courseSchema;
export const courseItem = courseItemSchema;
export const courseEnrolment = courseEnrolmentSchema;
export const courseEnrolmentStatusEnum = courseEnrolmentStatusEnumSchema;
export const lessonProgress = lessonProgressSchema;
export const courseReviews = courseReview;

export const workshop = workshopSchema;
export const workshopImage = workshopImageSchema;
export const workshopRegistration = workshopRegistrationSchema;
export const workshopCouponCodeSchema = couponCodeSchema;
export const seminar = seminarSchema;
export const seminarRegistrations = seminarRegistrationsSchema;

export const payment = paymentSchema;
export const invoice = invoiceSchema;

export const whatsappConversation = whatsappConversationSchema;
export const conversationMessage = conversationMessageSchema;
export const messageRole = messageRoleEnum;
export const emailLog = emailLogsSchema;
