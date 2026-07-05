import NextAuth from "next-auth"
import Cognito from "next-auth/providers/cognito"
import Credentials from "next-auth/providers/credentials"
import { USER_POOL_CLIENT_ID, USER_POOL_ID, AWS_COGNITO_REGION, USER_POOL_CLIENT_SECRET } from "./env"
import crypto from "crypto";
import { CognitoIdentityProviderClient, InitiateAuthCommand } from "@aws-sdk/client-cognito-identity-provider"

const cognitoClient = new CognitoIdentityProviderClient({
  region: AWS_COGNITO_REGION,
})

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: '/sign-in',
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
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const secretHash = crypto
            .createHmac("sha256", USER_POOL_CLIENT_SECRET)
            .update((credentials.email as string) + USER_POOL_CLIENT_ID)
            .digest("base64");

          const command = new InitiateAuthCommand({
            AuthFlow: "USER_PASSWORD_AUTH",
            ClientId: USER_POOL_CLIENT_ID,
            AuthParameters: {
              USERNAME: credentials.email as string,
              PASSWORD: credentials.password as string,
              SECRET_HASH: secretHash,
            },
          });

          const response = await cognitoClient.send(command);

          if (response.AuthenticationResult) {
            return {
              id: credentials.email as string,
              email: credentials.email as string,
            };
          }
          return null;
        } catch (error: any) {
          console.error("Cognito auth error", error.name);
          if (error.name === "UserNotConfirmedException") {
            throw new Error("UserNotConfirmedException");
          }
          return null;
        }
      }
    })
  ],
})
