import { PendingCredentialsProvider } from "@/components/auth/pending-credentials";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PendingCredentialsProvider>{children}</PendingCredentialsProvider>;
}
