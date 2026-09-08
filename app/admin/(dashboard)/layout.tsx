import { getServerSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import AdminSidebar from "../AdminSidebar";
import "../admin.css";

export default async function AdminPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="admin-layout">
      <AdminSidebar
        user={{
          name: session.user.name,
          email: session.user.email,
          role: (session.user as any).role || "editor",
        }}
      />
      <main className="admin-content">{children}</main>
    </div>
  );
}
