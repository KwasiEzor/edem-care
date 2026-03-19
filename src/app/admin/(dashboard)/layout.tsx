import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-cream">
      <AdminSidebar />
      <div className="pl-16 lg:pl-64 transition-all duration-300">
        <div className="p-6 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
