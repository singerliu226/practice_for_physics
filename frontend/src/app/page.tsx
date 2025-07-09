'use client';

import { useEffect } from 'react';
import { Layout, Typography, Card, Row, Col, Button, Space } from 'antd';
import { BookOutlined, TrophyOutlined, BulbOutlined, UserOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/store';
import { getProfileAsync } from '@/store/slices/authSlice';
import Cookies from 'js-cookie';

const { Header, Content, Footer } = Layout;
const { Title, Paragraph } = Typography;

/**
 * 主页面组件
 */
export default function HomePage() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector(state => state.auth);

  useEffect(() => {
    // 检查是否有存储的token，如果有则尝试获取用户信息
    const token = Cookies.get('access_token');
    if (token && !isAuthenticated) {
      dispatch(getProfileAsync());
    }
  }, [dispatch, isAuthenticated]);

  return (
    <Layout className="min-h-screen">
      {/* 头部导航 */}
      <Header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="physics-container flex justify-between items-center h-full">
          <div className="physics-logo">
            🧮 物理刷题平台
          </div>
          
          <Space>
            {isAuthenticated ? (
              <>
                <span>欢迎, {user?.name}</span>
                <Link href={user?.role === 'STUDENT' ? '/student' : '/teacher'}>
                  <Button type="primary" icon={<UserOutlined />}>
                    进入{user?.role === 'STUDENT' ? '学习' : '管理'}中心
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button>登录</Button>
                </Link>
                <Link href="/register">
                  <Button type="primary">注册</Button>
                </Link>
              </>
            )}
          </Space>
        </div>
      </Header>

      {/* 主要内容 */}
      <Content className="flex-1">
        {/* 英雄区域 */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
          <div className="physics-container text-center">
            <Title level={1} className="text-white mb-4">
              智能物理学习平台
            </Title>
            <Paragraph className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
              结合AI技术的个性化物理题练习平台，为初中生提供科学高效的学习方案。
              支持章节练习、错题复习、智能推荐，让物理学习更轻松！
            </Paragraph>
            
            {!isAuthenticated && (
              <Space size="large">
                <Link href="/register">
                  <Button type="primary" size="large" className="h-12 px-8">
                    开始学习
                  </Button>
                </Link>
                <Link href="/demo">
                  <Button size="large" className="h-12 px-8 text-white border-white hover:bg-white hover:text-blue-600">
                    体验Demo
                  </Button>
                </Link>
              </Space>
            )}
          </div>
        </div>

        {/* 特色功能 */}
        <div className="py-16 bg-gray-50">
          <div className="physics-container">
            <Title level={2} className="text-center mb-12">
              平台特色
            </Title>
            
            <Row gutter={[24, 24]}>
              <Col xs={24} md={8}>
                <Card className="text-center h-full hover:shadow-lg transition-shadow">
                  <BookOutlined className="text-4xl text-blue-500 mb-4" />
                  <Title level={4}>丰富题库</Title>
                  <Paragraph className="text-gray-600">
                    覆盖初中物理全部章节，包含压强、浮力、力学等核心知识点，
                    题目难度分层，适合不同水平的学生练习。
                  </Paragraph>
                </Card>
              </Col>
              
              <Col xs={24} md={8}>
                <Card className="text-center h-full hover:shadow-lg transition-shadow">
                  <BulbOutlined className="text-4xl text-yellow-500 mb-4" />
                  <Title level={4}>AI智能推荐</Title>
                  <Paragraph className="text-gray-600">
                    基于Deepseek AI技术，分析学习数据，提供个性化学习建议，
                    智能识别薄弱知识点，制定最优学习路径。
                  </Paragraph>
                </Card>
              </Col>
              
              <Col xs={24} md={8}>
                <Card className="text-center h-full hover:shadow-lg transition-shadow">
                  <TrophyOutlined className="text-4xl text-green-500 mb-4" />
                  <Title level={4}>学习统计</Title>
                  <Paragraph className="text-gray-600">
                    详细的学习数据分析，包括答题正确率、时间分布、章节掌握情况，
                    帮助学生和老师准确把握学习进度。
                  </Paragraph>
                </Card>
              </Col>
            </Row>
          </div>
        </div>

        {/* 使用流程 */}
        <div className="py-16">
          <div className="physics-container">
            <Title level={2} className="text-center mb-12">
              如何开始学习
            </Title>
            
            <Row gutter={[24, 24]} align="middle">
              <Col xs={24} md={6} className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <Title level={4}>注册账号</Title>
                <Paragraph>选择学生或教师身份注册</Paragraph>
              </Col>
              
              <Col xs={24} md={6} className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">2</span>
                </div>
                <Title level={4}>选择章节</Title>
                <Paragraph>根据学习进度选择对应章节</Paragraph>
              </Col>
              
              <Col xs={24} md={6} className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">3</span>
                </div>
                <Title level={4}>开始练习</Title>
                <Paragraph>进行题目练习并查看解析</Paragraph>
              </Col>
              
              <Col xs={24} md={6} className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">4</span>
                </div>
                <Title level={4}>AI分析</Title>
                <Paragraph>获取个性化学习建议</Paragraph>
              </Col>
            </Row>
          </div>
        </div>
      </Content>

      {/* 页脚 */}
      <Footer className="bg-gray-800 text-white">
        <div className="physics-container text-center">
          <Paragraph className="text-gray-300 mb-2">
            © 2024 智能物理学习平台. 专注于中学物理教育创新
          </Paragraph>
          <Paragraph className="text-gray-400 text-sm">
            技术支持：Next.js + NestJS + AI智能分析
          </Paragraph>
        </div>
      </Footer>
    </Layout>
  );
} 