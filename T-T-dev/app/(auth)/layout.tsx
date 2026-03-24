// app/(auth)/layout.tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid h-full w-full place-items-center bg-slate-50">
      {children}
    </div>
  );
}
