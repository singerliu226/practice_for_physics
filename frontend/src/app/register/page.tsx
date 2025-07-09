'use client';

import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Radio, Space } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store';
import { registerAsync, clearError } from '@/store/slices/authSlice';

const { Title, Paragraph } = Typography;

/**
 * 注册表单数据接口
 */
interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'STUDENT' | 'TEACHER';
}

/**
 * 注册页面组件
 */
export default function RegisterPage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector(state => state.auth);
  const [registerAttempted, setRegisterAttempted] = useState(false);
  const [msgApi, contextHolder] = message.useMessage();

  // 显示错误信息
  React.useEffect(() => {
    if (error && registerAttempted) {
      msgApi.error(error);
      dispatch(clearError());
    }
  }, [error, registerAttempted, dispatch, msgApi]);

  /**
   * 处理表单提交
   */
  const handleSubmit = async (values: RegisterFormData) => {
    setRegisterAttempted(true);
    
    try {
      const { confirmPassword, ...userData } = values;
      await dispatch(registerAsync(userData)).unwrap();
      
      msgApi.success('注册成功！请登录您的账号');
      router.push('/login');
    } catch (error) {
      // 错误处理在 useEffect 中进行
      setRegisterAttempted(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center p-4">
      {contextHolder}
      <div className="w-full max-w-md">
        {/* Logo和标题 */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🧮</div>
          <Title level={2} className="mb-2">
            加入物理刷题平台
          </Title>
          <Paragraph className="text-gray-600">
            创建您的账号开始学习之旅
          </Paragraph>
        </div>

        {/* 注册表单 */}
        <Card className="shadow-lg">
          <Form
            form={form}
            name="register"
            onFinish={handleSubmit}
            layout="vertical"
            size="large"
            initialValues={{ role: 'STUDENT' }}
          >
            <Form.Item
              label="姓名"
              name="name"
              rules={[
                { required: true, message: '请输入您的姓名' },
                { min: 2, message: '姓名至少2个字符' },
                { max: 20, message: '姓名不能超过20个字符' }
              ]}
            >
              <Input
                prefix={<UserOutlined className="text-gray-400" />}
                placeholder="请输入真实姓名"
                autoComplete="name"
              />
            </Form.Item>

            <Form.Item
              label="邮箱"
              name="email"
              rules={[
                { required: true, message: '请输入邮箱地址' },
                { type: 'email', message: '请输入有效的邮箱地址' }
              ]}
            >
              <Input
                prefix={<MailOutlined className="text-gray-400" />}
                placeholder="请输入邮箱"
                autoComplete="email"
              />
            </Form.Item>

            <Form.Item
              label="密码"
              name="password"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少6位' },
                { max: 50, message: '密码不能超过50位' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="请输入密码"
                autoComplete="new-password"
              />
            </Form.Item>

            <Form.Item
              label="确认密码"
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: '请确认密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('两次输入的密码不一致'));
                  },
                })
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="请再次输入密码"
                autoComplete="new-password"
              />
            </Form.Item>

            <Form.Item
              label="身份"
              name="role"
              rules={[{ required: true, message: '请选择您的身份' }]}
            >
              <Radio.Group>
                <Radio value="STUDENT">学生</Radio>
                <Radio value="TEACHER">教师</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item className="mb-4">
              <Button
                type="primary"
                htmlType="submit"
                className="w-full h-12"
                loading={loading}
              >
                注册
              </Button>
            </Form.Item>

            <div className="text-center">
              <Space>
                <span className="text-gray-600">已有账号？</span>
                <Link href="/login" className="text-blue-600 hover:text-blue-800">
                  立即登录
                </Link>
              </Space>
            </div>
          </Form>
        </Card>

        {/* 用户协议 */}
        <div className="text-center mt-4">
          <Paragraph className="text-xs text-gray-500">
            注册即表示您同意我们的
            <Link href="/terms" className="text-blue-600 hover:text-blue-800 mx-1">
              用户协议
            </Link>
            和
            <Link href="/privacy" className="text-blue-600 hover:text-blue-800 mx-1">
              隐私政策
            </Link>
          </Paragraph>
        </div>

        {/* 返回首页 */}
        <div className="text-center mt-4">
          <Link href="/" className="text-gray-600 hover:text-gray-800">
            ← 返回首页
          </Link>
        </div>
      </div>
    </div>
  );
} 