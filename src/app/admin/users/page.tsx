import { prisma } from '@/lib/prisma';
import { AdminUserResetButton } from '@/components/admin-user-reset-button';

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      isAdmin: true,
      bonusPoints: true,
      createdAt: true,
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">Пользователи</h1>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="p-4 text-left font-medium">Имя</th>
              <th className="p-4 text-left font-medium">Email</th>
              <th className="p-4 text-left font-medium">Роль</th>
              <th className="p-4 text-left font-medium">Бонусы</th>
              <th className="p-4 text-left font-medium">Дата регистрации</th>
              <th className="p-4 text-right font-medium">Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-border">
                <td className="p-4">{user.name || '—'}</td>
                <td className="p-4">{user.email ?? '—'}</td>
                <td className="p-4">
                  {user.isAdmin ? (
                    <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                      Админ
                    </span>
                  ) : (
                    'Пользователь'
                  )}
                </td>
                <td className="p-4">{user.bonusPoints}</td>
                <td className="p-4 text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                </td>
                <td className="p-4">
                  <AdminUserResetButton
                    user={{
                      ...user,
                      createdAt: user.createdAt.toISOString(),
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
