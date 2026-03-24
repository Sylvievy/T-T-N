import Navbar from "@/components/Navbar";
import { TaskQProvider } from "@/services/taskQ/TaskQContext";
import { GlobalQuickAdd } from "@/components/shared/GlobalQuickAdd";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TaskQProvider>
      <div className="flex flex-col h-screen w-full bg-slate-50">
        <Navbar />
        <main className="flex-1 w-full overflow-auto relative">
          {children}
          <GlobalQuickAdd />
        </main>
      </div>
    </TaskQProvider>
  );
}
