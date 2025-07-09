'use client';

import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Space } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store';
import { loginAsync, clearError } from '@/store/slices/authSlice';

const { Title, Paragraph } = Typography;

/**
 * 登录表单数据接口
 */
interface LoginFormData {
  email: string;
  password: string;
}

/**
 * 登录页面组件
 */
export default function LoginPage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error, isAuthenticated, user } = useAppSelector(state => state.auth);
  const [loginAttempted, setLoginAttempted] = useState(false);
  const [msgApi, contextHolder] = message.useMessage();

  // 监听登录状态变化，成功后跳转
  React.useEffect(() => {
    if (isAuthenticated && loginAttempted && user) {
      msgApi.success('登录成功！');
      
      // 根据用户角色跳转到不同页面
      const redirectPath = user.role === 'STUDENT' ? '/student' : '/teacher';
      router.push(redirectPath);
    }
  }, [isAuthenticated, loginAttempted, user, router]);

  // 显示错误信息
  React.useEffect(() => {
    if (error && loginAttempted) {
      msgApi.error(error);
      dispatch(clearError());
    }
  }, [error, loginAttempted, dispatch]);

  /**
   * 处理表单提交
   */
  const handleSubmit = async (values: LoginFormData) => {
    setLoginAttempted(true);
    
    try {
      await dispatch(loginAsync(values)).unwrap();
      // 成功处理在 useEffect 中进行
    } catch (error) {
      // 错误处理在 useEffect 中进行
      setLoginAttempted(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {contextHolder}
      <div className="w-full max-w-md">
        {/* Logo和标题 */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🧮</div>
          <Title level={2} className="mb-2">
            物理刷题平台
          </Title>
          <Paragraph className="text-gray-600">
            登录您的账号开始学习
          </Paragraph>
        </div>

        {/* 登录表单 */}
        <Card className="shadow-lg">
          <Form
            form={form}
            name="login"
            onFinish={handleSubmit}
            layout="vertical"
            size="large"
          >
            <Form.Item
              label="邮箱"
              name="email"
              rules={[
                { required: true, message: '请输入邮箱地址' },
                { type: 'email', message: '请输入有效的邮箱地址' }
              ]}
            >
              <Input
                prefix={<UserOutlined className="text-gray-400" />}
                placeholder="请输入邮箱"
                autoComplete="email"
              />
            </Form.Item>

            <Form.Item
              label="密码"
              name="password"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少6位' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="请输入密码"
                autoComplete="current-password"
              />
            </Form.Item>

            <Form.Item className="mb-4">
              <Button
                type="primary"
                htmlType="submit"
                className="w-full h-12"
                loading={loading}
              >
                登录
              </Button>
            </Form.Item>

            <div className="text-center">
              <Space split={<span className="text-gray-300">|</span>}>
                <Link href="/register" className="text-blue-600 hover:text-blue-800">
                  注册新账号
                </Link>
                <Link href="/forgot-password" className="text-blue-600 hover:text-blue-800">
                  忘记密码
                </Link>
              </Space>
            </div>
          </Form>
        </Card>

        {/* 返回首页 */}
        <div className="text-center mt-6">
          <Link href="/" className="text-gray-600 hover:text-gray-800">
            ← 返回首页
          </Link>
        </div>
      </div>
    </div>
  );
} 