import { AuthGuard } from "@/components/common/auth-guard";
import Header from "@/components/layouts/header";
import Sidebar from "@/components/layouts/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto bg-muted/20 p-4">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}