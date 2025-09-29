import { createFileRoute } from '@tanstack/react-router';
import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useUserStore } from '../../stores/user-store';
import { Database, AlertCircle } from 'lucide-react';

export const Route = createFileRoute('/admin/database')({
  component: DatabaseManagement,
});

function DatabaseManagement() {
  const { user, isLoggedIn } = useUserStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn || user?.user_role !== 'admin') {
      navigate({ to: '/' });
    }
  }, [isLoggedIn, user, navigate]);

  if (!isLoggedIn || user?.user_role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex items-center gap-2 text-red-500">
          <AlertCircle className="h-5 w-5" />
          <span>Unauthorized Access</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Database className="h-8 w-8" />
          <h1 className="text-3xl font-bold">数据库管理</h1>
        </div>

        <div className="bg-card rounded-lg p-6 shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">管理功能</h2>
          <p className="text-muted-foreground mb-6">
            这里是数据库管理界面，仅限管理员访问。
          </p>

          <div className="grid gap-4">
            <div className="p-4 border rounded-md">
              <h3 className="font-medium mb-2">数据库信息</h3>
              <p className="text-sm text-muted-foreground">
                查看和管理数据库配置
              </p>
            </div>

            <div className="p-4 border rounded-md">
              <h3 className="font-medium mb-2">备份与恢复</h3>
              <p className="text-sm text-muted-foreground">
                执行数据库备份和恢复操作
              </p>
            </div>

            <div className="p-4 border rounded-md">
              <h3 className="font-medium mb-2">数据迁移</h3>
              <p className="text-sm text-muted-foreground">
                管理数据库迁移和版本控制
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}