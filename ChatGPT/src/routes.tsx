import { useRoutes } from 'react-router-dom';
import {
  SettingOutlined,
  BulbOutlined,
  SyncOutlined,
  FileSyncOutlined,
  UserOutlined,
  DownloadOutlined,
  FormOutlined,
  GlobalOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';

import Settings from '@/view/settings';
import About from '@/view/about';
import Awesome from '@/view/awesome';
import UserCustom from '@/view/model/UserCustom';
import SyncPrompts from '@/view/model/SyncPrompts';
import SyncCustom from '@/view/model/SyncCustom';
import SyncRecord from '@/view/model/SyncRecord';
import Download from '@/view/download';
import Notes from '@/view/notes';
import Markdown from '@/view/markdown';
import Dashboard from '@/view/dashboard';

export type ChatRouteMetaObject = {
  label: string;
  icon?: React.ReactNode;
};

type ChatRouteObject = {
  path: string;
  element?: JSX.Element;
  hideMenu?: boolean;
  meta?: ChatRouteMetaObject;
  children?: ChatRouteObject[];
};

export const routes: Array<ChatRouteObject> = [
  {
    path: '/settings',
    element: <Settings />,
    meta: {
      label: 'Settings',
      icon: <SettingOutlined />,
    },
  },
  {
    path: '/awesome',
    element: <Awesome />,
    meta: {
      label: 'Awesome',
      icon: <GlobalOutlined />,
    },
  },
  {
    path: '/notes',
    element: <Notes />,
    meta: {
      label: 'Notes',
      icon: <FormOutlined />,
    },
  },
  {
    path: '/md/:id',
    element: <Markdown />,
    hideMenu: true,
  },
  {
    path: '/model',
    meta: {
      label: 'Language Model',
      icon: <BulbOutlined />,
    },
    children: [
      {
        path: 'user-custom',
        element: <UserCustom />,
        meta: {
          label: 'User Custom',
          icon: <UserOutlined />,
        },
      },
      // --- Sync
      {
        path: 'sync-prompts',
        element: <SyncPrompts />,
        meta: {
          label: 'Sync Prompts',
          icon: <SyncOutlined />,
        },
      },
      {
        path: 'sync-custom',
        element: <SyncCustom />,
        meta: {
          label: 'Sync Custom',
          icon: <FileSyncOutlined />,
        },
      },
      {
        path: 'sync-custom/:id',
        element: <SyncRecord />,
        hideMenu: true,
      },
    ],
  },
  {
    path: '/download',
    element: <Download />,
    meta: {
      label: 'Download',
      icon: <DownloadOutlined />,
    },
  },
  {
    path: '/about',
    element: <About />,
    meta: {
      label: 'About',
      icon: <InfoCircleOutlined />,
    },
  },
  {
    path: '/',
    element: <Dashboard />,
    hideMenu: true,
  },
];

type MenuItem = Required<MenuProps>['items'][number];
export const menuItems: MenuItem[] = routes
  .filter((j) => !j.hideMenu)
  .map((i) => ({
    ...i.meta,
    key: i.path || '',
    children: i?.children
      ?.filter((j) => !j.hideMenu)
      ?.map((j) => ({ ...j.meta, key: `${i.path}/${j.path}` || '' })),
  }));

export default () => {
  return useRoutes(routes);
};
