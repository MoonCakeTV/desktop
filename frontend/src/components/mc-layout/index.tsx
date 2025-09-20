import { SidebarInset, SidebarProvider } from "../ui/sidebar";
import { McSidebar } from "../mc-sidebar";

export function McLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true}>
      <McSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
