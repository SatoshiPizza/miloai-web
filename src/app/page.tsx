import { redirect } from "next/navigation";

export default function RootPage() {
  // No marketing landing yet — kick straight into the product.
  // Once we have onboarding/auth wired, this becomes the landing page and
  // unauthenticated visitors stay here.
  redirect("/dashboard");
}
