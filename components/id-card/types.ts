import type { userCardSchema } from "@/db/userSchema";

type StoredCard = typeof userCardSchema.$inferSelect;
type DateField =
  "dateOfBirth" | "activationDate" | "validityDate" | "createdAt" | "updatedAt";

export type UserCardRecord = Omit<StoredCard, DateField> & {
  [K in DateField]: string | null;
} & { passportPhotoUrl?: string | null };

export type IdCardFormValues = {
  fullName: string;
  email: string;
  mobileNumber: string;
  gender: StoredCard["gender"] | "";
  bloodGroup: NonNullable<StoredCard["bloodGroup"]> | "";
  rhFactor: NonNullable<StoredCard["rhFactor"]> | "";
  dateOfBirth: string;
  state: string;
  city: string;
  profession: StoredCard["profession"] | "";
  otherProfession: string;
  qualification: StoredCard["qualification"] | "";
  organizationName: string;
  passportPhoto: string;
  passportPhotoUrl: string;
  referralCode: string;
  hearAboutRh: string;
  termsAccepted: boolean;
};

export type IdCardApiResponse = {
  success?: boolean;
  card?: UserCardRecord | null;
  defaults?: Partial<IdCardFormValues>;
  error?: string;
  purchase?: { amount: number; currency: string };
  pendingPurchase?: CardCheckout | null;
  paymentRequired?: boolean;
  data?: CardCheckout | null;
};

export type CardCheckout = {
  orderId: string;
  amount: number;
  currency: string;
  status: string;
  paymentUrl: string | null;
  expiresAt: string;
};
