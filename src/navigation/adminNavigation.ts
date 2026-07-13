interface AdminRouteConfig {
  id: string;
  path: string;
  sidebar?: {
    label: string;
  };
  dashboard?: {
    title: string;
    description: string;
  };
}

export const adminRoutes = [
  {
    id: 'dashboard',
    path: '/',
    sidebar: { label: 'Главная' },
  },
  {
    id: 'charts',
    path: '/charts',
    sidebar: { label: 'Графики' },
  },
  {
    id: 'users',
    path: '/users',
    sidebar: { label: 'Пользователь' },
  },
  {
    id: 'userProfile',
    path: '/users/:usersId',
  },
  {
    id: 'storePrizes',
    path: '/store/prizes',
    sidebar: { label: 'Призы магазина' },
    dashboard: {
      title: 'Призы магазина',
      description: 'Добавить призы и одноразовые коды в каталог',
    },
  },
  {
    id: 'quizCreate',
    path: '/quiz/create',
    sidebar: { label: 'Создать квиз' },
    dashboard: {
      title: 'Создать квиз',
      description: 'Новое задание типа «Викторина» с вопросами и вариантами ответов',
    },
  },
  {
    id: 'taskPromoCodes',
    path: '/tasks/promo-codes',
    sidebar: { label: 'Партнёрское задание' },
  },
  {
    id: 'wallPost',
    path: '/wall/post',
    sidebar: { label: 'Создать пост' },
    dashboard: {
      title: 'Пост на стене',
      description: 'Опубликовать запись от имени сообщества ВКонтакте',
    },
  },
  {
    id: 'broadcast',
    path: '/broadcast',
    sidebar: { label: 'VK-рассылка' },
  },
  {
    id: 'messageTemplates',
    path: '/message-templates',
    sidebar: { label: 'Шаблоны' },
  },
] as const satisfies readonly AdminRouteConfig[];

export type AdminRouteId = (typeof adminRoutes)[number]['id'];

const adminRouteConfigs: readonly AdminRouteConfig[] = adminRoutes;

export interface AdminSidebarItem {
  to: string;
  label: string;
}

export interface AdminDashboardLink {
  to: string;
  title: string;
  description: string;
}

export const adminSidebarItems: AdminSidebarItem[] = adminRouteConfigs.flatMap((route) =>
  route.sidebar
    ? [
        {
          to: route.path,
          label: route.sidebar.label,
        },
      ]
    : [],
);

export const adminDashboardLinks: AdminDashboardLink[] = adminRouteConfigs.flatMap((route) =>
  route.dashboard
    ? [
        {
          to: route.path,
          title: route.dashboard.title,
          description: route.dashboard.description,
        },
      ]
    : [],
);
