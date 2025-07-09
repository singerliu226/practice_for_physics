'use client';

import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Card, 
  Button, 
  Radio, 
  Typography, 
  Space, 
  Progress,
  Modal,
  Select,
  Row,
  Col,
  Tag,
  Divider,
  Input,
  App as AntdApp
} from 'antd';
import { 
  PlayCircleOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  ClockCircleOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store';
import { 
  startExerciseAsync, 
  submitAnswerAsync, 
  nextQuestion, 
  prevQuestion,
  resetExercise 
} from '@/store/slices/exerciseSlice';
import { getChaptersAsync } from '@/store/slices/questionSlice';

const { Header, Content } = Layout;
const { Title, Paragraph } = Typography;
const { Option } = Select;

/**
 * 去除选项文本前多余的字母标记，例如 “A. xxx” → “xxx”
 */
function stripOptionPrefix(text: string, optionKey: string) {
  // 匹配 开头的 “A.” “A、” “A ” 等形式，忽略中英文标点及空格
  const pattern = new RegExp(`^${optionKey}[\.．、\s]+`);
  return text.replace(pattern, '').trim();
}

/**
 * 练习配置接口
 */
interface ExerciseConfig {
  mode: 'random' | 'chapter' | 'wrong' | 'difficulty';
  chapter?: string;
  difficulty?: number;
  count: number;
}

/**
 * 练习页面组件
 */
export default function ExercisePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  // 从 Ant Design App 上下文获取实例化的 message、notification 等，避免静态调用警告
  const { message } = AntdApp.useApp();
  
  const { currentSession, currentQuestionIndex, answers, loading, submitting } = useAppSelector(state => state.exercise);
  const { chapters } = useAppSelector(state => state.question);
  
  const [exerciseStarted, setExerciseStarted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [currentAnswerResult, setCurrentAnswerResult] = useState<any>(null);
  const [startTime, setStartTime] = useState<Date>(new Date());
  
  // 练习配置状态
  const [config, setConfig] = useState<ExerciseConfig>({
    mode: 'random',
    count: 10
  });

  useEffect(() => {
    // 从URL参数获取初始配置
    const mode = searchParams.get('mode') as 'random' | 'chapter' | 'wrong' | 'difficulty' || 'random';
    const chapter = searchParams.get('chapter') || undefined;
    const difficulty = searchParams.get('difficulty') ? parseInt(searchParams.get('difficulty')!) : undefined;
    
    setConfig({
      mode,
      chapter,
      difficulty,
      count: 10
    });

    // 获取章节列表
    dispatch(getChaptersAsync());

    // 如果有特定模式，自动开始练习
    if (mode !== 'random' || chapter) {
      handleStartExercise({ mode, chapter, difficulty, count: 10 });
    }
  }, [searchParams, dispatch]);

  /**
   * 开始练习
   */
  const handleStartExercise = async (exerciseConfig: ExerciseConfig) => {
    try {
      setStartTime(new Date());
      await dispatch(startExerciseAsync(exerciseConfig)).unwrap();
      setExerciseStarted(true);
      message.success('练习开始！');
    } catch (error) {
      message.error('开始练习失败，请重试');
    }
  };

  /**
   * 提交答案
   */
  const handleSubmitAnswer = async () => {
    if (!selectedAnswer) {
      message.warning('请选择一个答案');
      return;
    }

    if (!currentSession?.questions[currentQuestionIndex]) {
      return;
    }

    const currentQuestion = currentSession.questions[currentQuestionIndex];
    const timeSpent = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);

    try {
      const result = await dispatch(submitAnswerAsync({
        questionId: currentQuestion.id,
        answer: selectedAnswer,
        timeSpent
      })).unwrap();

      setCurrentAnswerResult(result);
      setShowResult(true);
    } catch (error) {
      message.error('提交答案失败，请重试');
    }
  };

  /**
   * 下一题
   */
  const handleNextQuestion = () => {
    setShowResult(false);
    setSelectedAnswer('');
    setCurrentAnswerResult(null);
    setStartTime(new Date());
    dispatch(nextQuestion());
  };

  /**
   * 上一题
   */
  const handlePrevQuestion = () => {
    setShowResult(false);
    setSelectedAnswer('');
    setCurrentAnswerResult(null);
    dispatch(prevQuestion());
  };

  /**
   * 结束练习
   */
  const handleFinishExercise = () => {
    Modal.confirm({
      title: '确认结束练习？',
      content: '结束后将返回学习首页，您可以查看本次练习的统计结果。',
      onOk: () => {
        dispatch(resetExercise());
        router.push('/student');
      }
    });
  };

  // 如果还没开始练习，显示配置页面
  if (!exerciseStarted || !currentSession) {
    return (
      <Layout className="min-h-screen">
        <Header className="bg-white border-b border-gray-200 px-6">
          <div className="flex justify-between items-center h-full">
            <Title level={3} className="mb-0">配置练习</Title>
            <Link href="/student">
              <Button>返回首页</Button>
            </Link>
          </div>
        </Header>

        <Content className="p-6">
          <div className="max-w-2xl mx-auto">
            <Card title="练习设置" className="mb-6">
              <div className="space-y-6">
                {/* 练习模式 */}
                <div>
                  <Paragraph strong>练习模式</Paragraph>
                  <Radio.Group 
                    value={config.mode} 
                    onChange={(e) => setConfig({...config, mode: e.target.value})}
                  >
                    <Space direction="vertical">
                      <Radio value="random">随机练习 - 从所有章节随机出题</Radio>
                      <Radio value="chapter">章节练习 - 选择特定章节</Radio>
                      <Radio value="wrong">错题练习 - 复习做错的题目</Radio>
                      <Radio value="difficulty">难度练习 - 按难度筛选</Radio>
                    </Space>
                  </Radio.Group>
                </div>

                {/* 章节选择 */}
                {config.mode === 'chapter' && (
                  <div>
                    <Paragraph strong>选择章节</Paragraph>
                    <Select
                      style={{ width: '100%' }}
                      placeholder="请选择章节"
                      value={config.chapter}
                      onChange={(value) => setConfig({...config, chapter: value})}
                    >
                      {chapters.map(chapter => (
                        <Option key={chapter.name} value={chapter.name}>
                          {chapter.name} ({chapter.questionCount} 题)
                        </Option>
                      ))}
                    </Select>
                  </div>
                )}

                {/* 难度选择 */}
                {config.mode === 'difficulty' && (
                  <div>
                    <Paragraph strong>选择难度</Paragraph>
                    <Radio.Group 
                      value={config.difficulty} 
                      onChange={(e) => setConfig({...config, difficulty: e.target.value})}
                    >
                      <Space>
                        <Radio value={1}>简单</Radio>
                        <Radio value={2}>中等</Radio>
                        <Radio value={3}>困难</Radio>
                      </Space>
                    </Radio.Group>
                  </div>
                )}

                {/* 题目数量 */}
                <div>
                  <Paragraph strong>题目数量</Paragraph>
                  <Select
                    value={config.count}
                    onChange={(value) => setConfig({...config, count: value})}
                  >
                    <Option value={5}>5 题</Option>
                    <Option value={10}>10 题</Option>
                    <Option value={20}>20 题</Option>
                    <Option value={50}>50 题</Option>
                  </Select>
                </div>
              </div>

              <div className="mt-8 text-center">
                <Button 
                  type="primary" 
                  size="large" 
                  icon={<PlayCircleOutlined />}
                  loading={loading}
                  onClick={() => handleStartExercise(config)}
                >
                  开始练习
                </Button>
              </div>
            </Card>
          </div>
        </Content>
      </Layout>
    );
  }

  // 获取当前题目
  const currentQuestion = currentSession.questions[currentQuestionIndex];
  const progress = Math.round(((currentQuestionIndex + 1) / currentSession.questions.length) * 100);

  return (
    <Layout className="min-h-screen">
      <Header className="bg-white border-b border-gray-200 px-6">
        <div className="flex justify-between items-center h-full">
          <div>
            <Title level={4} className="mb-0">
              题目 {currentQuestionIndex + 1} / {currentSession.questions.length}
            </Title>
            <Progress percent={progress} size="small" showInfo={false} className="w-48" />
          </div>
          <Space>
            <Button onClick={handleFinishExercise}>结束练习</Button>
          </Space>
        </div>
      </Header>

      <Content className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* 题目卡片 */}
          <Card className="mb-6">
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <Space size={8}>
                  <Tag color="blue">{currentQuestion?.chapter}</Tag>
                  <Tag color={currentQuestion?.difficulty === 1 ? 'green' : currentQuestion?.difficulty === 2 ? 'orange' : 'red'}>
                    难度 {currentQuestion?.difficulty}/3
                  </Tag>
                </Space>
                <span className="text-sm text-gray-500">
                  <ClockCircleOutlined className="mr-1" />
                  计时中...
                </span>
              </div>
              <Title level={4}>{currentQuestion?.title}</Title>
            </div>

            <div 
              className="question-content mb-6"
              dangerouslySetInnerHTML={{ __html: currentQuestion?.content || '' }}
            />

            {/* 选项 / 填空 */}
            {currentQuestion?.options ? (
              <div className="space-y-3">
                <Radio.Group 
                  value={selectedAnswer} 
                  onChange={(e) => setSelectedAnswer(e.target.value)}
                  className="w-full"
                  disabled={showResult}
                >
                  <Space direction="vertical" className="w-full">
                    {currentQuestion.options.slice(0, 4).map((option, index) => {
                      const optionKey = String.fromCharCode(65 + index); // A, B, C, D
                      let className = "option-item w-full";
                      
                      if (showResult && currentAnswerResult) {
                        if (optionKey === currentAnswerResult.correctAnswer) {
                          className += " correct";
                        } else if (optionKey === selectedAnswer && !currentAnswerResult.isCorrect) {
                          className += " wrong";
                        }
                      } else if (selectedAnswer === optionKey) {
                        className += " selected";
                      }
                      
                      return (
                        <Radio key={optionKey} value={optionKey} className="w-full">
                          <div className={className}>
                            <strong>{optionKey}. </strong>{stripOptionPrefix(option, optionKey)}
                          </div>
                        </Radio>
                      );
                    })}
                  </Space>
                </Radio.Group>
              </div>
            ) : (
              <Input.TextArea
                rows={4}
                placeholder="请输入你的答案"
                value={selectedAnswer}
                onChange={(e) => setSelectedAnswer(e.target.value)}
                disabled={showResult}
              />
            )}

            {/* 答案解析 */}
            {showResult && currentAnswerResult && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center mb-3">
                  {currentAnswerResult.isCorrect ? (
                    <CheckCircleOutlined className="text-green-500 text-xl mr-2" />
                  ) : (
                    <CloseCircleOutlined className="text-red-500 text-xl mr-2" />
                  )}
                  <span className="font-semibold">
                    {currentAnswerResult.isCorrect ? '回答正确！' : '回答错误'}
                  </span>
                </div>
                
                <Paragraph>
                  <strong>正确答案：</strong>{currentAnswerResult.correctAnswer}
                </Paragraph>
                
                {currentAnswerResult.explanation && (
                  <Paragraph>
                    <strong>解析：</strong>{currentAnswerResult.explanation}
                  </Paragraph>
                )}
              </div>
            )}

            {/* 分隔线 */}
            <Divider />

            {/* 操作按钮 */}
            <Row justify="space-between" align="middle" gutter={16} className="mt-4">
              <Col>
                <Button 
                  icon={<ArrowLeftOutlined />}
                  onClick={handlePrevQuestion}
                  disabled={currentQuestionIndex === 0}
                >
                  上一题
                </Button>
              </Col>

              <Col>
                {!showResult ? (
                  <Button 
                    type="primary" 
                    onClick={handleSubmitAnswer}
                    loading={submitting}
                    disabled={!selectedAnswer}
                  >
                    提交答案
                  </Button>
                ) : (
                  <Button 
                    type="primary" 
                    icon={<ArrowRightOutlined />}
                    onClick={handleNextQuestion}
                    disabled={currentQuestionIndex >= currentSession.questions.length - 1}
                  >
                    下一题
                  </Button>
                )}
              </Col>
            </Row>
          </Card>
        </div>
      </Content>
    </Layout>
  );
} 