import * as React from "react";
import {
  IconDashboard,
  IconDiscount,
  IconInnerShadowTop,
  IconPackage,
  IconShoppingCart,
  IconGift,
  IconUsers,
  IconTag,
  IconMail,
  IconClock,
  IconFileText,
  IconHome,
  IconAppWindow,
  IconShoppingBag,
  IconInfoCircle,
} from "@tabler/icons-react";

import { NavMain } from "@/shared/components/layout/nav-main";
import { NavUser } from "@/shared/components/layout/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/components/ui/sidebar";
import { useUserStore } from "@/store/use-user-store";
import { NavModules } from "./nav-modules";
// import { useUserStore } from "@/store/use-user-store"

function resolveFeatureIcon(name: string) {
  if (name.includes("discounts")) return IconDiscount;

  // fallback
  return IconDashboard;
}

const navItems = {
  options: [
    {
      title: "Dashboard",
      url: "/app/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Filtros",
      url: "/app/filters",
      icon: IconInnerShadowTop,
    },
    {
      title: "Productos",
      url: "/app/products",
      icon: IconPackage,
    },
    {
      title: "Pedidos",
      url: "/app/orders",
      icon: IconShoppingCart,
    },
    {
      title: "Cupones",
      url: "/app/coupons",
      icon: IconTag,
    },
  ],
  // Agregaremos esto para el modulo cms para el sitio web
  modules: [
    {
      title: "Personalizar Sitio Web",
      url: "/app/cms",
      icon: IconAppWindow,
      isActive: false,
      items: [
        {
          title: "Principal",
          url: "/app/cms/home",
          icon: IconHome,
        },
        {
          title: "Tienda",
          url: "/app/cms/store",
          icon: IconShoppingBag,
        },
        {
          title: "About",
          url: "/app/cms/about",
          icon: IconInfoCircle,
        },
        {
          title: "Contact",
          url: "/app/cms/contact",
          icon: IconMail,
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { features } = useUserStore();

  const dynamicNavItems = features.map((f) => ({
    title: f.display_name,
    url: `/app/${f.name}`, // Ej: /app/products
    icon: resolveFeatureIcon(f.name),
  }));

  // const allNavItems = [...navItems, ...dynamicNavItems];
  // Deduplicar opciones para evitar el error de key "Productos"
  const filteredDynamicItems = dynamicNavItems.filter(
    (d) => !navItems.options.some((s) => s.title.toLowerCase() === d.title.toLowerCase())
  );

  const allNavItems = {
    options: [...navItems.options, ...filteredDynamicItems],
    modules: [...navItems.modules],
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Acme Inc.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={allNavItems.options} />
        <NavModules items={allNavItems.modules} />
        {/* <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
