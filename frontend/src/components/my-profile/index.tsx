export function MyProfile() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">我的个人信息</h1>
      <div className="space-y-6">
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">用户信息</h2>
          <p className="text-muted-foreground">编辑您的个人资料</p>
        </div>
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">设置</h2>
          <p className="text-muted-foreground">管理您的应用设置</p>
        </div>
      </div>
    </div>
  );
}