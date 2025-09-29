import { createFileRoute } from '@tanstack/react-router';
import { useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useUserStore } from '../../stores/user-store';
import { Database, AlertCircle, Table as TableIcon, Users, Settings, GitBranch, RefreshCw } from 'lucide-react';
import { GetDatabaseTables, GetMigrations, GetAllUsers, GetAllSettings } from '../../../wailsjs/go/main/App';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';

export const Route = createFileRoute('/admin/database')({
  component: DatabaseManagement,
});

interface Migration {
  id: number;
  filename: string;
  applied_at: string;
  success: boolean;
}

interface User {
  id: number;
  username: string;
  email: string;
  user_role: string;
  created_at: string;
  updated_at: string;
}

interface Setting {
  id: number;
  user_id: number | null;
  username: string;
  key: string;
  value: string;
}

function DatabaseManagement() {
  const { user, isLoggedIn } = useUserStore();
  const navigate = useNavigate();

  const [tables, setTables] = useState<string[]>([]);
  const [migrations, setMigrations] = useState<Migration[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn || user?.user_role !== 'admin') {
      navigate({ to: '/' });
    }
  }, [isLoggedIn, user, navigate]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch all data in parallel
      const [tablesRes, migrationsRes, usersRes, settingsRes] = await Promise.all([
        GetDatabaseTables(),
        GetMigrations(),
        GetAllUsers(),
        GetAllSettings()
      ]);

      if (tablesRes.success) {
        setTables(tablesRes.data || []);
      }

      if (migrationsRes.success) {
        setMigrations(migrationsRes.data as Migration[] || []);
      }

      if (usersRes.success) {
        setUsers(usersRes.data as User[] || []);
      }

      if (settingsRes.success) {
        setSettings(settingsRes.data as Setting[] || []);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn && user?.user_role === 'admin') {
      fetchData();
    }
  }, [isLoggedIn, user]);

  if (!isLoggedIn || user?.user_role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-screen">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Unauthorized Access - Admin Only
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-h-screen overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database className="h-8 w-8" />
            <h1 className="text-3xl font-bold">数据库管理</h1>
          </div>
          <Button
            onClick={fetchData}
            disabled={loading}
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Tables Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TableIcon className="h-5 w-5" />
              所有数据表
            </CardTitle>
            <CardDescription>{tables.length} 个表</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
              {tables.map((table) => (
                <Badge
                  key={table}
                  variant="secondary"
                  className="justify-center py-2 font-mono text-xs"
                >
                  {table}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Migrations Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              数据库迁移记录
            </CardTitle>
            <CardDescription>{migrations.length} 条记录</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>文件名</TableHead>
                  <TableHead>应用时间</TableHead>
                  <TableHead className="w-[100px]">状态</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {migrations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      暂无迁移记录
                    </TableCell>
                  </TableRow>
                ) : (
                  migrations.map((migration) => (
                    <TableRow key={migration.id}>
                      <TableCell className="font-medium">{migration.id}</TableCell>
                      <TableCell className="font-mono text-xs">{migration.filename}</TableCell>
                      <TableCell className="text-sm">
                        {new Date(migration.applied_at).toLocaleString('zh-CN')}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={migration.success ? 'default' : 'destructive'}
                          className={migration.success ? 'bg-green-500' : ''}
                        >
                          {migration.success ? '成功' : '失败'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Users Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              所有用户
            </CardTitle>
            <CardDescription>{users.length} 个用户</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">ID</TableHead>
                  <TableHead>用户名</TableHead>
                  <TableHead>邮箱</TableHead>
                  <TableHead className="w-[100px]">角色</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead>更新时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      暂无用户
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.id}</TableCell>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell className="text-sm">{user.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant={user.user_role === 'admin' ? 'destructive' : 'default'}
                        >
                          {user.user_role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(user.created_at).toLocaleString('zh-CN')}
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(user.updated_at).toLocaleString('zh-CN')}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Settings Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              所有设置
            </CardTitle>
            <CardDescription>{settings.length} 条设置</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">ID</TableHead>
                  <TableHead className="w-[150px]">用户</TableHead>
                  <TableHead>键</TableHead>
                  <TableHead>值</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      暂无设置项
                    </TableCell>
                  </TableRow>
                ) : (
                  settings.map((setting) => (
                    <TableRow key={setting.id}>
                      <TableCell className="font-medium">{setting.id}</TableCell>
                      <TableCell>
                        <Badge
                          variant={setting.username === '全局设置' ? 'outline' : 'secondary'}
                          className={setting.username === '全局设置' ? 'border-green-500 text-green-700' : ''}
                        >
                          {setting.username}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{setting.key}</TableCell>
                      <TableCell className="text-sm max-w-xs truncate" title={setting.value}>
                        {setting.value}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}