'use client';

import React, { useEffect } from 'react';
import { Layout, Card, Row, Col, Typography, Statistic, Button, Space, Progress } from 'antd';
import { 
  BookOutlined, 
  TrophyOutlined, 
  ClockCircleOutlined, 
  ExperimentOutlined,
  PlayCircleOutlined,
  HistoryOutlined,
  BulbOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/store';
import { getStatsAsync } from '@/store/slices/exerciseSlice';
import { getChaptersAsync } from '@/store/slices/questionSlice';

const { Header, Content, Sider } = Layout;
const { Title, Paragraph } = Typography;

/**
 * 学生端主页面
 */
export default function StudentDashboard() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { stats } = useAppSelector(state => state.exercise);
  const { chapters } = useAppSelector(state => state.question);

  useEffect(() => {
    // 获取学习统计和章节信息
    dispatch(getStatsAsync());
    dispatch(getChaptersAsync());
  }, [dispatch]);

  // 计算总体学习进度
  const overallProgress = stats ? Math.round((stats.correctAnswered / Math.max(stats.totalAnswered, 1)) * 100) : 0;

  return (
    <Layout className="min-h-screen">
      {/* 左侧导航 */}
      <Sider width={250} className="bg-white border-r border-gray-200">
        <div className="p-6">
          <div className="physics-logo text-center mb-8">
            🧮 物理学习
          </div>
          
          <div className="space-y-2">
            <Link href="/student">
              <Button type="primary" block icon={<BookOutlined />} size="large">
                学习首页
              </Button>
            </Link>
            <Link href="/student/exercise">
              <Button block icon={<PlayCircleOutlined />} size="large">
                开始练习
              </Button>
            </Link>
            <Link href="/student/wrong-questions">
              <Button block icon={<HistoryOutlined />} size="large">
                错题本
              </Button>
            </Link>
            <Link href="/student/ai-plan">
              <Button block icon={<BulbOutlined />} size="large">
                学习规划
              </Button>
            </Link>
          </div>
        </div>
      </Sider>

      <Layout>
        {/* 头部 */}
        <Header className="bg-white border-b border-gray-200 px-6">
          <div className="flex justify-between items-center h-full">
            <Title level={3} className="mb-0">
              欢迎回来，{user?.name}！
            </Title>
            <Space>
              <span className="text-gray-600">学生ID: {user?.studentId || 'N/A'}</span>
            </Space>
          </div>
        </Header>

        {/* 主要内容 */}
        <Content className="p-6">
          {/* 学习统计卡片 */}
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="总答题数"
                  value={stats?.totalAnswered || 0}
                  prefix={<BookOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="正确答题数"
                  value={stats?.correctAnswered || 0}
                  prefix={<TrophyOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="正确率"
                  value={stats?.accuracy || 0}
                  suffix="%"
                  prefix={<ExperimentOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="最近活跃度"
                  value={stats?.recentActivity || 0}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
          </Row>

          {/* 学习进度和快速操作 */}
          <Row gutter={[16, 16]} className="mb-6">
            {/* 学习进度 */}
            <Col xs={24} lg={12}>
              <Card title="学习进度" className="h-full">
                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span>整体进度</span>
                    <span>{overallProgress}%</span>
                  </div>
                  <Progress 
                    percent={overallProgress} 
                    strokeColor={{
                      '0%': '#108ee9',
                      '100%': '#87d068',
                    }}
                  />
                </div>
                
                <div className="space-y-3">
                  {stats?.chapterStats?.slice(0, 3).map((chapter, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">{chapter.chapter}</span>
                        <span className="text-sm">{chapter.accuracy}%</span>
                      </div>
                      <Progress 
                        percent={chapter.accuracy} 
                        size="small"
                        showInfo={false}
                      />
                    </div>
                  ))}
                </div>
              </Card>
            </Col>

            {/* 快速操作 */}
            <Col xs={24} lg={12}>
              <Card title="快速开始" className="h-full">
                <div className="space-y-4">
                  <Link href="/student/exercise?mode=random">
                    <Card 
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      styles={{ body: { padding: '16px' } }}
                    >
                      <div className="flex items-center">
                        <PlayCircleOutlined className="text-2xl text-blue-500 mr-3" />
                        <div>
                          <div className="font-semibold">随机练习</div>
                          <div className="text-gray-500 text-sm">从所有章节随机出题</div>
                        </div>
                      </div>
                    </Card>
                  </Link>

                  <Link href="/student/exercise?mode=wrong">
                    <Card 
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      styles={{ body: { padding: '16px' } }}
                    >
                      <div className="flex items-center">
                        <HistoryOutlined className="text-2xl text-red-500 mr-3" />
                        <div>
                          <div className="font-semibold">错题练习</div>
                          <div className="text-gray-500 text-sm">复习做错的题目</div>
                        </div>
                      </div>
                    </Card>
                  </Link>

                  <Link href="/student/exercise">
                    <Card 
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      styles={{ body: { padding: '16px' } }}
                    >
                      <div className="flex items-center">
                        <BookOutlined className="text-2xl text-green-500 mr-3" />
                        <div>
                          <div className="font-semibold">章节练习</div>
                          <div className="text-gray-500 text-sm">选择特定章节练习</div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </div>
              </Card>
            </Col>
          </Row>

          {/* 章节概览 */}
          <Card title="章节概览" className="mb-6">
            <Row gutter={[16, 16]}>
              {chapters.slice(0, 8).map((chapter, index) => (
                <Col xs={12} sm={8} md={6} lg={4} key={index}>
                  <Link href={`/student/exercise?chapter=${encodeURIComponent(chapter.name)}`}>
                    <Card 
                      className="text-center cursor-pointer hover:shadow-md transition-shadow"
                      styles={{ body: { padding: '12px' } }}
                    >
                      <div className="text-lg mb-2">📚</div>
                      <div className="font-medium text-sm">{chapter.name}</div>
                      <div className="text-xs text-gray-500">
                        {chapter.questionCount} 题
                      </div>
                    </Card>
                  </Link>
                </Col>
              ))}
            </Row>
          </Card>

          {/* AI学习建议 */}
          <Card title="AI学习建议" className="mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start">
                <BulbOutlined className="text-blue-500 text-xl mr-3 mt-1" />
                <div>
                  <Paragraph className="mb-2">
                    <strong>个性化建议：</strong>
                    根据您的答题情况，建议重点练习压强相关题目，您在这个章节的正确率较低。
                  </Paragraph>
                  <Paragraph className="mb-0 text-gray-600">
                    建议每天练习 15-20 道题，保持学习的连续性。可以从基础题开始，逐步提高难度。
                  </Paragraph>
                </div>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <Link href="/student/ai-plan">
                <Button type="primary" icon={<BulbOutlined />}>
                  查看完整学习规划
                </Button>
              </Link>
            </div>
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
} 