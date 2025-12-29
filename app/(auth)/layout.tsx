/**
 * Auth Layout
 * Full-screen overlay for authentication pages (login, register, etc.)
 * Hides the main navigation
 */

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[100] bg-white">
      {children}
    </div>
  );
}
