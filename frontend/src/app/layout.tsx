'use client';

import { Inter } from 'next/font/google';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { ConfigProvider, App as AntdApp } from 'antd';
import { StyleProvider } from '@ant-design/cssinjs';
import zhCN from 'antd/locale/zh_CN';
import './globals.css';
import 'antd/dist/reset.css';

const inter = Inter({ subsets: ['latin'] });

/**
 * 物理学习平台根布局
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <Provider store={store}>
          <StyleProvider hashPriority="high">
            <ConfigProvider 
              locale={zhCN}
              theme={{
                token: {
                  colorPrimary: '#1890ff',
                  colorSuccess: '#52c41a',
                  colorWarning: '#faad14',
                  colorError: '#f5222d',
                  borderRadius: 8,
                },
              }}
            >
              {/* Ant Design App 组件为 message / notification / modal 等静态方法提供上下文 */}
              <AntdApp>
                {children}
              </AntdApp>
            </ConfigProvider>
          </StyleProvider>
        </Provider>
      </body>
    </html>
  );
} 