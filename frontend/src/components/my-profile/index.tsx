import { useEffect, useState } from "react";
import {
  GetCurrentUser,
  GetUserSettings,
  UpdateSetting,
} from "../../../wailsjs/go/main/App";
import { useUserStore } from "../../stores/user-store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { User, Settings, Edit2, Trash2 } from "lucide-react";

interface UserData {
  id: number;
  username: string;
  email: string;
  user_role: string;
  meta_data?: string | null;
  created_at: string;
  updated_at: string;
}

interface UserSetting {
  id: number;
  key: string;
  value: string;
  type: "personal" | "global";
  user_id: number | null;
  created_at: string;
  updated_at: string;
}

export function MyProfile() {
  const { user } = useUserStore();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userSettings, setUserSettings] = useState<UserSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<UserSetting | null>(
    null
  );
  const [editValue, setEditValue] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) {
        setError("请先登录");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch user data
        const userResponse = await GetCurrentUser(user.id);
        if (userResponse.success && userResponse.data) {
          setUserData(userResponse.data as UserData);
        } else {
          setError(userResponse.error || "获取用户信息失败");
        }

        // Fetch user settings
        const settingsResponse = await GetUserSettings(user.id);
        if (settingsResponse.success && settingsResponse.data) {
          setUserSettings(settingsResponse.data as UserSetting[]);
        } else {
          console.error("获取用户设置失败:", settingsResponse.error);
        }
      } catch (err) {
        setError("加载数据时出错");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">我的个人信息</h1>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">我的个人信息</h1>
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleEditSetting = (setting: UserSetting) => {
    setEditingSetting(setting);
    setEditValue(setting.value);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingSetting || !user) return;

    setEditLoading(true);
    try {
      const response = await UpdateSetting(
        editingSetting.id,
        editValue,
        user.id,
        userData?.user_role === "admin"
      );

      if (response.success) {
        // Update the local state with new value
        setUserSettings((prev) =>
          prev.map((s) =>
            s.id === editingSetting.id
              ? { ...s, value: editValue, updated_at: new Date().toISOString() }
              : s
          )
        );
        setEditDialogOpen(false);
        setEditingSetting(null);
        setEditValue("");
      } else {
        alert(`更新失败: ${response.error}`);
      }
    } catch (err) {
      console.error("Failed to update setting:", err);
      alert("更新设置时出错");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteSetting = (setting: UserSetting) => {
    // TODO: Implement delete functionality
    console.log("Delete setting:", setting);
    // You can add a confirmation dialog and call the delete API
  };

  return (
    <div className="flex flex-col gap-4 mx-auto p-6 w-full">
      <h1 className="text-2xl font-bold text-black">我的个人信息</h1>
      <div className="space-y-6">
        {/* User Information Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <CardTitle>用户信息</CardTitle>
            </div>
            <CardDescription>您的账户详细信息</CardDescription>
          </CardHeader>
          <CardContent>
            {userData && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground min-w-20">
                      用户名:
                    </span>
                    <span className="font-medium">{userData.username}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground min-w-20">
                      邮箱:
                    </span>
                    <span className="font-medium">{userData.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground min-w-20">
                      用户角色:
                    </span>
                    <Badge
                      variant={
                        userData.user_role === "admin" ? "default" : "secondary"
                      }
                    >
                      {userData.user_role === "admin" ? "管理员" : "普通用户"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground min-w-20">
                      用户ID:
                    </span>
                    <span className="font-medium">#{userData.id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground min-w-20">
                      注册时间:
                    </span>
                    <span className="font-medium">
                      {formatDate(userData.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground min-w-20">
                      更新时间:
                    </span>
                    <span className="font-medium">
                      {formatDate(userData.updated_at)}
                    </span>
                  </div>
                </div>
                {userData.meta_data && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground min-w-20">
                      附加信息:
                    </span>
                    <span className="font-medium">{userData.meta_data}</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Settings Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              <CardTitle>设置</CardTitle>
            </div>
            <CardDescription>应用配置和个人偏好</CardDescription>
          </CardHeader>
          <CardContent>
            {userSettings.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>键名</TableHead>
                    <TableHead>值</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>更新时间</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userSettings.map((setting) => {
                    // Check if user can edit this setting
                    const canEdit =
                      setting.type === "personal" ||
                      userData?.user_role === "admin";
                    const canDelete =
                      setting.type === "personal" ||
                      userData?.user_role === "admin";

                    return (
                      <TableRow key={setting.id}>
                        <TableCell className="font-medium">
                          {setting.key}
                        </TableCell>
                        <TableCell>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="max-w-50 truncate cursor-help">
                                  {setting.value}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-md">
                                <p className="break-words">{setting.value}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              setting.type === "personal"
                                ? "outline"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {setting.type === "personal" ? "个人" : "全局"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(setting.updated_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={!canEdit}
                              onClick={() => handleEditSetting(setting)}
                              title={canEdit ? "编辑" : "需要管理员权限"}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={!canDelete}
                              onClick={() => handleDeleteSetting(setting)}
                              title={canDelete ? "删除" : "需要管理员权限"}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                暂无设置数据
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Setting Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>编辑设置</DialogTitle>
            <DialogDescription>修改设置值。键名不可编辑。</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="key" className="text-right">
                键名
              </Label>
              <Input
                id="key"
                value={editingSetting?.key || ""}
                className="col-span-3"
                disabled
                readOnly
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="value" className="text-right">
                值
              </Label>
              <Input
                id="value"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="col-span-3"
                placeholder="输入新的值"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">类型</Label>
              <div className="col-span-3">
                <Badge
                  variant={
                    editingSetting?.type === "personal"
                      ? "outline"
                      : "secondary"
                  }
                >
                  {editingSetting?.type === "personal"
                    ? "个人设置"
                    : "全局设置"}
                </Badge>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={editLoading}
            >
              取消
            </Button>
            <Button onClick={handleSaveEdit} disabled={editLoading}>
              {editLoading ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
