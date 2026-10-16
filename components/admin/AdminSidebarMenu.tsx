"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function AdminSidebarMenu({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {items.map((item) => {
        const isActive =
          pathname === item.url ||
          (item.url !== "/admin" && pathname.startsWith(`${item.url}/`));

        return (
          <SidebarMenuItem key={item.url}>
            <SidebarMenuButton
              asChild
              isActive={isActive}
              className="data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:font-semibold"
            >
              <Link
                href={item.url}
                aria-current={isActive ? "page" : undefined}
              >
                <span>{item.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
