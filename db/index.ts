import { courseItemSchema, courseSchema } from "./courseSchema";
import { itemEnumSchema, paymentSchema, paymentStatusEnumSchema } from "./paymentSchema";
import { productCategorySchema, productMediaSchema, productSchema } from "./productSchema";
import { userSchema } from "./userSchema";
import { modeOfAttandaceEnumSchema, workshopRegistrationSchema, workshopSchema } from "./workshopSchema";

export const itemEnum = itemEnumSchema;
export const modeOfAttandace = modeOfAttandaceEnumSchema;
export const paymentStatusEnum = paymentStatusEnumSchema;

export const user = userSchema

export const workshop = workshopSchema;
export const workshopRegistration = workshopRegistrationSchema;

export const payment = paymentSchema;
export const course = courseSchema;
export const courseItem = courseItemSchema;


export const productCategory = productCategorySchema
export const product = productSchema
export const productMedia = productMediaSchema