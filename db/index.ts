import {
  courseEnrolmentStatusEnumSchema,
  courseEnrolmentSchema,
  lessonProgressSchema,
  courseItemSchema,
  courseSchema,
} from "./courseSchema";
import {
  itemEnumSchema,
  paymentSchema,
  paymentStatusEnumSchema,
} from "./paymentSchema";
import {
  blogSchema,
  blogStatusEnumSchema,
  contactSchema,
  userCardSchema,
  userSchema,
} from "./userSchema";
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

export const workshop = workshopSchema;
export const workshopImage = workshopImageSchema;
export const workshopRegistration = workshopRegistrationSchema;
export const workshopCouponCodeSchema = couponCodeSchema;
export const seminar = seminarSchema;
export const seminarRegistrations = seminarRegistrationsSchema;

export const payment = paymentSchema;
export const course = courseSchema;
export const courseItem = courseItemSchema;
export const courseEnrolment = courseEnrolmentSchema;
export const lessonProgress = lessonProgressSchema;
export const courseEnrolmentStatusEnum = courseEnrolmentStatusEnumSchema;
