"use client";

import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { MailOutlined, LockOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { authAPI } from '@/lib/api';

const { Title, Paragraph } = Typography;

interface EmailForm {
  email: string;
}

interface ResetForm {
  verificationCode: string;
  newPassword: string;
}

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<0 | 1>(0);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [msgApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();

  /** 发送验证码 */
  const handleSendCode = async (values: EmailForm) => {
    try {
      setLoading(true);
      await authAPI.forgotPassword(values.email);
      setEmail(values.email);
      msgApi.success('验证码已发送，请检查邮箱');
      setStep(1);
    } catch (error: any) {
      msgApi.error(error?.response?.data?.message || '发送失败');
    } finally {
      setLoading(false);
    }
  };

  /** 重置密码 */
  const handleReset = async (values: ResetForm) => {
    try {
      setLoading(true);
      await authAPI.resetPassword(email, values.verificationCode, values.newPassword);
      msgApi.success('密码已重置，请使用新密码登录');
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
    } catch (error: any) {
      msgApi.error(error?.response?.data?.message || '重置失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {contextHolder}
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🔑</div>
          <Title level={2}>{step === 0 ? '找回密码' : '重设密码'}</Title>
          <Paragraph className="text-gray-600">
            {step === 0 ? '请输入您注册时填入的邮箱，我们会向其发送验证码。' : `验证码已发送至 ${email}`}
          </Paragraph>
        </div>

        <Card className="shadow-lg">
          {step === 0 ? (
            <Form form={form} layout="vertical" onFinish={handleSendCode} size="large">
              <Form.Item
                label="邮箱"
                name="email"
                rules={[{ required: true, message: '请输入邮箱' }, { type: 'email', message: '邮箱格式不正确' }]}
              >
                <Input prefix={<MailOutlined className="text-gray-400" />} placeholder="请输入邮箱" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" className="w-full" loading={loading}>
                  发送验证码
                </Button>
              </Form.Item>
            </Form>
          ) : (
            <Form layout="vertical" onFinish={handleReset} size="large">
              <Form.Item label="验证码" name="verificationCode" rules={[{ required: true, message: '请输入验证码' }]}>
                <Input prefix={<SafetyCertificateOutlined className="text-gray-400" />} placeholder="请输入验证码" />
              </Form.Item>
              <Form.Item label="新密码" name="newPassword" rules={[{ required: true, message: '请输入新密码' }, { min:6, message:'密码至少6位'}]}>
                <Input.Password prefix={<LockOutlined className="text-gray-400" />} placeholder="请输入新密码" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" className="w-full" loading={loading}>
                  重设密码
                </Button>
              </Form.Item>
            </Form>
          )}
        </Card>

        <div className="text-center mt-6">
          <Link href="/login" className="text-gray-600 hover:text-gray-800">
            ← 返回登录
          </Link>
        </div>
      </div>
    </div>
  );
} 