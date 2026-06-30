"use server";

import { signIn } from "@/auth";
import { CognitoIdentityProviderClient, SignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
import { USER_POOL_CLIENT_ID, AWS_COGNITO_REGION } from "@/env";
import { AuthError } from "next-auth";

const cognitoClient = new CognitoIdentityProviderClient({
  region: AWS_COGNITO_REGION,
});

export async function loginWithCredentials(data: any) {
  try {
    await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: error.cause?.err?.message || "Authentication failed" };
    }
    throw error;
  }
}

export async function signupWithCognito(data: any) {
  try {
    const command = new SignUpCommand({
      ClientId: USER_POOL_CLIENT_ID,
      Username: data.email,
      Password: data.password,
      UserAttributes: [
        { Name: "email", Value: data.email },
        { Name: "name", Value: data.name },
        { Name: "phone_number", Value: data.phone },
      ],
    });
    
    await cognitoClient.send(command);
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to sign up" };
  }
}
