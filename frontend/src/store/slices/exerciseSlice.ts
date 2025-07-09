import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { exerciseAPI } from '@/lib/api';

/**
 * 题目接口
 */
export interface Question {
  id: string;
  title: string;
  content: string;
  options?: string[];
  chapter: string;
  section?: string;
  difficulty: number;
  tags: string[];
}

/**
 * 练习会话接口
 */
export interface ExerciseSession {
  sessionId: string;
  questions: Question[];
  totalCount: number;
  mode: string;
  startTime: Date;
}

/**
 * 答题记录接口
 */
export interface AnswerRecord {
  questionId: string;
  answer: string;
  isCorrect: boolean;
  correctAnswer: string;
  explanation?: string;
  timeSpent?: number;
}

/**
 * 学习统计接口
 */
export interface StudyStats {
  totalAnswered: number;
  correctAnswered: number;
  accuracy: number;
  recentActivity: number;
  chapterStats: Array<{
    chapter: string;
    total: number;
    correct: number;
    accuracy: number;
  }>;
}

/**
 * 练习状态接口
 */
interface ExerciseState {
  // 当前练习会话
  currentSession: ExerciseSession | null;
  currentQuestionIndex: number;
  answers: AnswerRecord[];
  
  // 学习统计
  stats: StudyStats | null;
  wrongQuestions: Question[];
  
  // 加载状态
  loading: boolean;
  submitting: boolean;
  error: string | null;
}

/**
 * 初始状态
 */
const initialState: ExerciseState = {
  currentSession: null,
  currentQuestionIndex: 0,
  answers: [],
  stats: null,
  wrongQuestions: [],
  loading: false,
  submitting: false,
  error: null,
};

/**
 * 开始练习
 */
export const startExerciseAsync = createAsyncThunk(
  'exercise/startExercise',
  async (exerciseData: any, { rejectWithValue }) => {
    try {
      const response = await exerciseAPI.startExercise(exerciseData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '开始练习失败');
    }
  }
);

/**
 * 提交答案
 */
export const submitAnswerAsync = createAsyncThunk(
  'exercise/submitAnswer',
  async (answerData: any, { rejectWithValue }) => {
    try {
      const response = await exerciseAPI.submitAnswer(answerData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '提交答案失败');
    }
  }
);

/**
 * 获取学习统计
 */
export const getStatsAsync = createAsyncThunk(
  'exercise/getStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await exerciseAPI.getStats();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '获取统计失败');
    }
  }
);

/**
 * 获取错题本
 */
export const getWrongQuestionsAsync = createAsyncThunk(
  'exercise/getWrongQuestions',
  async (limit: number = 20, { rejectWithValue }) => {
    try {
      const response = await exerciseAPI.getWrongQuestions(limit);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '获取错题失败');
    }
  }
);

/**
 * 练习 Slice
 */
const exerciseSlice = createSlice({
  name: 'exercise',
  initialState,
  reducers: {
    // 下一题
    nextQuestion: (state) => {
      if (state.currentSession && state.currentQuestionIndex < state.currentSession.questions.length - 1) {
        state.currentQuestionIndex += 1;
      }
    },
    
    // 上一题
    prevQuestion: (state) => {
      if (state.currentQuestionIndex > 0) {
        state.currentQuestionIndex -= 1;
      }
    },
    
    // 重置练习
    resetExercise: (state) => {
      state.currentSession = null;
      state.currentQuestionIndex = 0;
      state.answers = [];
      state.error = null;
    },
    
    // 清除错误
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // 开始练习
    builder
      .addCase(startExerciseAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startExerciseAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSession = action.payload;
        state.currentQuestionIndex = 0;
        state.answers = [];
      })
      .addCase(startExerciseAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 提交答案
    builder
      .addCase(submitAnswerAsync.pending, (state) => {
        state.submitting = true;
      })
      .addCase(submitAnswerAsync.fulfilled, (state, action) => {
        state.submitting = false;
        
        // 如果当前题目还没有答题记录，添加到answers数组
        const currentQuestion = state.currentSession?.questions[state.currentQuestionIndex];
        if (currentQuestion) {
          const existingIndex = state.answers.findIndex(a => a.questionId === currentQuestion.id);
          const answerRecord: AnswerRecord = {
            questionId: currentQuestion.id,
            answer: action.meta.arg.answer,
            isCorrect: action.payload.isCorrect,
            correctAnswer: action.payload.correctAnswer,
            explanation: action.payload.explanation,
            timeSpent: action.meta.arg.timeSpent,
          };
          
          if (existingIndex >= 0) {
            state.answers[existingIndex] = answerRecord;
          } else {
            state.answers.push(answerRecord);
          }
        }
      })
      .addCase(submitAnswerAsync.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      });

    // 获取统计
    builder
      .addCase(getStatsAsync.fulfilled, (state, action) => {
        state.stats = action.payload;
      });

    // 获取错题
    builder
      .addCase(getWrongQuestionsAsync.fulfilled, (state, action) => {
        state.wrongQuestions = action.payload;
      });
  },
});

export const { nextQuestion, prevQuestion, resetExercise, clearError } = exerciseSlice.actions;
export default exerciseSlice.reducer; 