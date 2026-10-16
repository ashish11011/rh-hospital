import NextAuth, { CredentialsSignin } from "next-auth";
import Cognito from "next-auth/providers/cognito";
import Credentials from "next-auth/providers/credentials";
import {
  USER_POOL_CLIENT_ID,
  USER_POOL_ID,
  AWS_COGNITO_REGION,
  USER_POOL_CLIENT_SECRET,
} from "./env";
import crypto from "crypto";
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { resolveCognitoLoginError } from "@/lib/login-errors";

const cognitoClient = new CognitoIdentityProviderClient({
  region: AWS_COGNITO_REGION,
});

class CognitoLoginError extends CredentialsSignin {
  constructor(code: string) {
    super();
    this.code = code;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: "/sign-in",
  },
  providers: [
    Cognito({
      clientId: USER_POOL_CLIENT_ID,
      issuer: `https://cognito-idp.${AWS_COGNITO_REGION}.amazonaws.com/${USER_POOL_ID}`,
      clientSecret: process.env.USER_POOL_CLIENT_SECRET || "",
    }),
    Credentials({
      name: "Cognito Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = (credentials.email as string).trim();

        try {
          const secretHash = crypto
            .createHmac("sha256", USER_POOL_CLIENT_SECRET)
            .update(email + USER_POOL_CLIENT_ID)
            .digest("base64");

          const command = new InitiateAuthCommand({
            AuthFlow: "USER_PASSWORD_AUTH",
            ClientId: USER_POOL_CLIENT_ID,
            AuthParameters: {
              USERNAME: email,
              PASSWORD: credentials.password as string,
              SECRET_HASH: secretHash,
            },
          });

          const response = await cognitoClient.send(command);

          if (response.AuthenticationResult) {
            return {
              id: email,
              email,
            };
          }
          return null;
        } catch (error: any) {
          console.error("Cognito auth error", error.name);
          const loginError = await resolveCognitoLoginError(error, email);
          throw new CognitoLoginError(loginError.code);
        }
      },
    }),
  ],
});
