import { Search, Shield, Settings, User, UserPlus, Home } from "lucide-react";
import { Link } from "@tanstack/react-router";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "../ui/sidebar";

export const McSidebar = () => {
  return (
    <Sidebar collapsible="icon" className="">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2">
          <SidebarTrigger />
          <span className="font-semibold text-sm group-data-[collapsible=icon]:hidden">
            月饼TV
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="首页" asChild>
                  <Link to="/">
                    <Home />
                    <span>首页</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="注册" asChild>
                  <Link to="/signup">
                    <UserPlus />
                    <span>注册</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="登录" asChild>
                  <Link to="/login">
                    <User />
                    <span>登录</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="搜索" asChild>
                  <Link to="/search">
                    <Search />
                    <span>搜索</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="18🈲" className="cursor-pointer">
                  <Shield />
                  <span>18🈲</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="设置" className="cursor-pointer">
                  <Settings />
                  <span>设置</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
