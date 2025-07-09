'use client';

import React, { useEffect, useState } from 'react';
import { 
  Layout, 
  Card, 
  Row, 
  Col, 
  Typography, 
  Statistic, 
  Button, 
  Space, 
  Table, 
  Upload,
  message,
  Select,
  Progress
} from 'antd';
import { 
  BookOutlined, 
  UserOutlined, 
  TrophyOutlined, 
  UploadOutlined,
  DownloadOutlined,
  EyeOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/store';
import { getChaptersAsync } from '@/store/slices/questionSlice';
import { questionAPI } from '@/lib/api';

const { Header, Content, Sider } = Layout;
const { Title, Paragraph } = Typography;
const { Option } = Select;

/**
 * 教师端主页面
 */
export default function TeacherDashboard() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { chapters } = useAppSelector(state => state.question);
  
  const [uploading, setUploading] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<number>(1);

  useEffect(() => {
    // 获取章节信息
    dispatch(getChaptersAsync());
  }, [dispatch]);

  /**
   * 处理文件上传
   */
  const handleFileUpload = async (file: any) => {
    if (!selectedChapter) {
      message.error('请选择章节');
      return false;
    }

    setUploading(true);
    
    try {
      await questionAPI.importQuestions(file, selectedChapter, selectedDifficulty);
      message.success('题目导入成功！');
      // 重新获取章节数据
      dispatch(getChaptersAsync());
    } catch (error) {
      message.error('题目导入失败，请检查文件格式');
    } finally {
      setUploading(false);
    }
    
    return false; // 阻止默认上传行为
  };

  // 模拟学生数据
  const studentData = [
    {
      key: '1',
      name: '张三',
      studentId: 'S001',
      totalAnswered: 125,
      correctRate: 85,
      recentActivity: '2024-01-15',
      weakChapter: '压强'
    },
    {
      key: '2',
      name: '李四',
      studentId: 'S002',
      totalAnswered: 98,
      correctRate: 78,
      recentActivity: '2024-01-14',
      weakChapter: '浮力'
    },
    {
      key: '3',
      name: '王五',
      studentId: 'S003',
      totalAnswered: 156,
      correctRate: 92,
      recentActivity: '2024-01-15',
      weakChapter: '力学'
    }
  ];

  const studentColumns = [
    {
      title: '学生姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '学号',
      dataIndex: 'studentId',
      key: 'studentId',
    },
    {
      title: '总答题数',
      dataIndex: 'totalAnswered',
      key: 'totalAnswered',
    },
    {
      title: '正确率',
      dataIndex: 'correctRate',
      key: 'correctRate',
      render: (rate: number) => `${rate}%`,
    },
    {
      title: '薄弱章节',
      dataIndex: 'weakChapter',
      key: 'weakChapter',
    },
    {
      title: '最近活跃',
      dataIndex: 'recentActivity',
      key: 'recentActivity',
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Space>
          <Button size="small" icon={<EyeOutlined />}>查看详情</Button>
        </Space>
      ),
    },
  ];

  return (
    <Layout className="min-h-screen">
      {/* 左侧导航 */}
      <Sider width={250} className="bg-white border-r border-gray-200">
        <div className="p-6">
          <div className="physics-logo text-center mb-8">
            🧮 教师管理
          </div>
          
          <div className="space-y-2">
            <Link href="/teacher">
              <Button type="primary" block icon={<BookOutlined />} size="large">
                管理首页
              </Button>
            </Link>
            <Link href="/teacher/questions">
              <Button block icon={<FileTextOutlined />} size="large">
                题库管理
              </Button>
            </Link>
            <Link href="/teacher/students">
              <Button block icon={<UserOutlined />} size="large">
                学生监控
              </Button>
            </Link>
            <Link href="/teacher/analytics">
              <Button block icon={<TrophyOutlined />} size="large">
                数据分析
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
              欢迎，{user?.name} 老师！
            </Title>
            <Space>
              <span className="text-gray-600">教师ID: {user?.teacherId || 'N/A'}</span>
            </Space>
          </div>
        </Header>

        {/* 主要内容 */}
        <Content className="p-6">
          {/* 统计概览 */}
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="题库总数"
                  value={chapters.reduce((total, chapter) => total + chapter.questionCount, 0)}
                  prefix={<BookOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="章节数量"
                  value={chapters.length}
                  prefix={<FileTextOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="学生总数"
                  value={studentData.length}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="平均正确率"
                  value={Math.round(studentData.reduce((sum, s) => sum + s.correctRate, 0) / studentData.length)}
                  suffix="%"
                  prefix={<TrophyOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
          </Row>

          {/* 快速操作和题目导入 */}
          <Row gutter={[16, 16]} className="mb-6">
            {/* 题目导入 */}
            <Col xs={24} lg={12}>
              <Card title="题目导入" className="h-full">
                <div className="space-y-4">
                  <div>
                    <Paragraph strong>选择章节：</Paragraph>
                    <Select
                      style={{ width: '100%' }}
                      placeholder="请选择要导入的章节"
                      value={selectedChapter}
                      onChange={setSelectedChapter}
                    >
                      {chapters.map(chapter => (
                        <Option key={chapter.name} value={chapter.name}>
                          {chapter.name}
                        </Option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <Paragraph strong>选择难度：</Paragraph>
                    <Select
                      style={{ width: '100%' }}
                      value={selectedDifficulty}
                      onChange={setSelectedDifficulty}
                    >
                      <Option value={1}>简单</Option>
                      <Option value={2}>中等</Option>
                      <Option value={3}>困难</Option>
                    </Select>
                  </div>

                  <Upload
                    beforeUpload={handleFileUpload}
                    accept=".docx,.doc"
                    showUploadList={false}
                  >
                    <Button 
                      icon={<UploadOutlined />} 
                      loading={uploading}
                      disabled={!selectedChapter}
                      block
                      size="large"
                    >
                      上传Word文档
                    </Button>
                  </Upload>

                  <div className="text-xs text-gray-500">
                    支持 .docx 和 .doc 格式，请确保文档格式符合导入标准
                  </div>
                </div>
              </Card>
            </Col>

            {/* 快速操作 */}
            <Col xs={24} lg={12}>
              <Card title="快速操作" className="h-full">
                <div className="space-y-4">
                  <Link href="/teacher/questions">
                    <Card 
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      styles={{ body: { padding: '16px' } }}
                    >
                      <div className="flex items-center">
                        <FileTextOutlined className="text-2xl text-blue-500 mr-3" />
                        <div>
                          <div className="font-semibold">题库管理</div>
                          <div className="text-gray-500 text-sm">查看和编辑现有题目</div>
                        </div>
                      </div>
                    </Card>
                  </Link>

                  <Link href="/teacher/students">
                    <Card 
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      styles={{ body: { padding: '16px' } }}
                    >
                      <div className="flex items-center">
                        <UserOutlined className="text-2xl text-green-500 mr-3" />
                        <div>
                          <div className="font-semibold">学生管理</div>
                          <div className="text-gray-500 text-sm">监控学生学习情况</div>
                        </div>
                      </div>
                    </Card>
                  </Link>

                  <Link href="/teacher/analytics">
                    <Card 
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      styles={{ body: { padding: '16px' } }}
                    >
                      <div className="flex items-center">
                        <TrophyOutlined className="text-2xl text-orange-500 mr-3" />
                        <div>
                          <div className="font-semibold">数据分析</div>
                          <div className="text-gray-500 text-sm">查看详细统计报告</div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </div>
              </Card>
            </Col>
          </Row>

          {/* 章节统计 */}
          <Card title="章节统计" className="mb-6">
            <Row gutter={[16, 16]}>
              {chapters.map((chapter, index) => (
                <Col xs={12} sm={8} md={6} lg={4} key={index}>
                  <Card 
                    className="text-center"
                    styles={{ body: { padding: '12px' } }}
                  >
                    <div className="text-lg mb-2">📚</div>
                    <div className="font-medium text-sm mb-1">{chapter.name}</div>
                    <div className="text-xs text-gray-500">
                      {chapter.questionCount} 题
                    </div>
                    <Progress 
                      percent={Math.min((chapter.questionCount / 50) * 100, 100)} 
                      size="small" 
                      showInfo={false}
                      className="mt-2"
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>

          {/* 学生概览 */}
          <Card title="学生学习概览" className="mb-6">
            <Table 
              columns={studentColumns} 
              dataSource={studentData}
              pagination={false}
              size="middle"
            />
            
            <div className="mt-4 text-center">
              <Link href="/teacher/students">
                <Button type="primary">查看所有学生</Button>
              </Link>
            </div>
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
} 