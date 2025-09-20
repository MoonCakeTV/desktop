import { useState } from "react";
import { Search, Shield, Settings, User, UserPlus } from "lucide-react";
import { DoubanTags } from "./components/douban/tags";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "./components/ui/sidebar";

// import { Greet } from "../wailsjs/go/main/App";

export default function App() {
  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar collapsible="icon" className="w-50">
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
                  <SidebarMenuButton tooltip="注册" className="cursor-pointer">
                    <UserPlus />
                    <span>注册</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="登录" className="cursor-pointer">
                    <User />
                    <span>登录</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="搜索" className="cursor-pointer">
                    <Search />
                    <span>搜索</span>
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
      <SidebarInset>
        <div className="flex flex-1 bg-gray-200 h-screen overflow-y-auto">
          <DoubanTags />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
