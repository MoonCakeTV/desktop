import { Search, Shield, Settings, User, UserPlus, Home, LogOut } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useUserStore } from "../../stores/user-store";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarTrigger,
} from "../ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { ChevronRight } from "lucide-react";
import { useState } from "react";

export const McSidebar = () => {
  const { isLoggedIn, user, logout } = useUserStore();
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate({ to: "/" });
  };

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
              {!isLoggedIn && (
                <>
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
                </>
              )}
              {isLoggedIn && (
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip={user?.username} className="cursor-pointer">
                    <User />
                    <span>{user?.username}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="搜索" asChild>
                  <Link to="/search">
                    <Search />
                    <span>搜索</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip={isLoggedIn ? "18🈲" : "需要登录"}
                  className={`cursor-pointer ${!isLoggedIn ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={!isLoggedIn}
                >
                  <Shield />
                  <span>18🈲</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip="设置" className="cursor-pointer">
                      <Settings />
                      <span>设置</span>
                      <ChevronRight className={`ml-auto h-4 w-4 transition-transform ${settingsOpen ? "rotate-90" : ""}`} />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub className="border-l-0">
                      {isLoggedIn && (
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton className="cursor-pointer" onClick={handleLogout}>
                            <LogOut />
                            <span>登出</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
