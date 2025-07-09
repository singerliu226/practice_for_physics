'use client';

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { getQuestionListAsync, getChaptersAsync, clearError } from '@/store/slices/questionSlice';
import { questionAPI } from '@/lib/api';
import {
  Table,
  Button,
  Space,
  Layout,
  message,
  Select,
  Card,
  Upload,
  Typography,
  Popconfirm,
} from 'antd';
import {
  DeleteOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import Link from 'next/link';

const { Content } = Layout;
const { Option } = Select;
const { Title } = Typography;

export default function TeacherQuestionPage() {
  const dispatch = useAppDispatch();
  const { list, total, page, limit, loading, chapters, error } = useAppSelector(
    (state) => state.question,
  );

  const [filterChapter, setFilterChapter] = useState<string | undefined>();
  const [filterDifficulty, setFilterDifficulty] = useState<number | undefined>();
  const [uploading, setUploading] = useState(false);

  // 初次加载
  useEffect(() => {
    dispatch(getChaptersAsync());
    fetchList(1, limit);
  }, []);

  // 错误弹窗
  useEffect(() => {
    if (error) {
      message.error(error);
      dispatch(clearError());
    }
  }, [error]);

  const fetchList = (p: number, l: number) => {
    dispatch(
      getQuestionListAsync({
        page: p,
        limit: l,
        chapter: filterChapter,
        difficulty: filterDifficulty,
      }),
    );
  };

  /** 删除题目 */
  const handleDelete = async (id: string) => {
    try {
      await questionAPI.deleteQuestion(id);
      message.success('删除成功');
      fetchList(page, limit);
    } catch (err: any) {
      message.error(err?.response?.data?.message || '删除失败');
    }
  };

  /** 文件上传 */
  const handleUpload = async (file: any) => {
    if (!filterChapter) {
      message.error('请先选择章节进行导入');
      return false;
    }
    setUploading(true);
    try {
      await questionAPI.importQuestions(file, filterChapter, filterDifficulty || 3);
      message.success('导入成功');
      fetchList(page, limit);
    } catch (err: any) {
      message.error(err?.response?.data?.message || '导入失败');
    } finally {
      setUploading(false);
    }
    return false;
  };

  const columns = [
    { title: '标题', dataIndex: 'title', key: 'title', ellipsis: true },
    { title: '章节', dataIndex: 'chapter', key: 'chapter' },
    { title: '难度', dataIndex: 'difficulty', key: 'difficulty' },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (t: string) => new Date(t).toLocaleDateString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Popconfirm title="确认删除此题？" onConfirm={() => handleDelete(record.id)}>
            <Button type="primary" danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Layout className="min-h-screen">
      <Content className="p-6">
        <Card className="mb-6">
          <Title level={3}>题库管理</Title>
          <Space wrap>
            <Select
              placeholder="章节过滤"
              style={{ minWidth: 160 }}
              allowClear
              value={filterChapter}
              onChange={(val) => {
                setFilterChapter(val);
                fetchList(1, limit);
              }}
            >
              {chapters.map((c) => (
                <Option key={c.name} value={c.name}>
                  {c.name}
                </Option>
              ))}
            </Select>

            <Select
              placeholder="难度过滤"
              style={{ width: 120 }}
              allowClear
              value={filterDifficulty}
              onChange={(val) => {
                setFilterDifficulty(val);
                fetchList(1, limit);
              }}
            >
              <Option value={1}>简单</Option>
              <Option value={2}>中等</Option>
              <Option value={3}>困难</Option>
              <Option value={4}>挑战</Option>
              <Option value={5}>地狱</Option>
            </Select>

            <Upload beforeUpload={handleUpload} showUploadList={false} accept=".doc,.docx">
              <Button icon={<UploadOutlined />} loading={uploading} disabled={!filterChapter}>
                导入Docx
              </Button>
            </Upload>
          </Space>
        </Card>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={list}
          loading={loading}
          pagination={{
            current: page,
            pageSize: limit,
            total,
            onChange: (p, l) => fetchList(p, l),
          }}
        />

        <div className="mt-4 text-center">
          <Link href="/teacher">← 返回教师首页</Link>
        </div>
      </Content>
    </Layout>
  );
} 