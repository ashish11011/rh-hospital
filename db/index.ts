import { courseItemSchema, courseSchema } from "./courseSchema";
import { itemEnumSchema, paymentSchema, paymentStatusEnumSchema } from "./paymentSchema";
import { productCategorySchema, productMediaSchema, productSchema } from "./productSchema";
import { contactSchema, userSchema } from "./userSchema";
import { couponCodeSchema, modeOfAttandaceEnumSchema, registrationSourceEnumSchema, workshopImageSchema, workshopRegistrationSchema, workshopSchema, seminarRegistrationsSchema, seminarSchema, presentationType } from "./workshopSchema";

export const itemEnum = itemEnumSchema;
export const modeOfAttandace = modeOfAttandaceEnumSchema;
export const paymentStatusEnum = paymentStatusEnumSchema;
export const registrationSourceEnum = registrationSourceEnumSchema;
export const presentationTypeEnum = presentationType;

export const user = userSchema

export const workshop = workshopSchema;
export const workshopImage = workshopImageSchema;
export const workshopRegistration = workshopRegistrationSchema;
export const workshopCouponCodeSchema = couponCodeSchema;
export const seminar = seminarSchema;
export const seminarRegistrations = seminarRegistrationsSchema;

export const payment = paymentSchema;
export const course = courseSchema;
export const courseItem = courseItemSchema;


export const productCategory = productCategorySchema
export const product = productSchema
export const productMedia = productMediaSchema

export const contact = contactSchema;