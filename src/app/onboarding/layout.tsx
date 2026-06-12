/**
 * /onboarding layout — full-screen, no sidebar.
 *
 * The dashboard layout wraps every other route with `<Sidebar/>`; onboarding
 * deliberately drops it so the user is funnelled through the steps without
 * the distraction of every other nav item.
 */
export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="h-screen w-screen">{children}</div>;
}
