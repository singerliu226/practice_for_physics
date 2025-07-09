import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { questionAPI } from '@/lib/api';

/**
 * 章节信息接口
 */
export interface Chapter {
  name: string;
  questionCount: number;
}

/**
 * 题目信息接口
 */
export interface QuestionItem {
  id: string;
  title: string;
  chapter: string;
  difficulty: number;
  createdAt: string;
}

/**
 * 题库状态接口
 */
interface QuestionState {
  chapters: Chapter[];

  // 题目列表
  list: QuestionItem[];
  total: number;
  page: number;
  limit: number;

  loading: boolean;
  error: string | null;
}

/**
 * 初始状态
 */
const initialState: QuestionState = {
  chapters: [],
  list: [],
  total: 0,
  page: 1,
  limit: 20,
  loading: false,
  error: null,
};

/**
 * 获取章节列表
 */
export const getChaptersAsync = createAsyncThunk(
  'question/getChapters',
  async (_, { rejectWithValue }) => {
    try {
      const response = await questionAPI.getChapters();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '获取章节失败');
    }
  }
);

/**
 * 分页获取题目列表
 */
export const getQuestionListAsync = createAsyncThunk(
  'question/getList',
  async (
    params: { page?: number; limit?: number; chapter?: string; difficulty?: number },
    { rejectWithValue },
  ) => {
    try {
      const { page = 1, limit = 20, chapter, difficulty } = params;
      const response = await questionAPI.listQuestions(page, limit, chapter, difficulty);
      return { ...response.data, page, limit };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '获取题目列表失败');
    }
  },
);

/**
 * 题库 Slice
 */
const questionSlice = createSlice({
  name: 'question',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 章节列表
      .addCase(getChaptersAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getChaptersAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.chapters = action.payload;
      })
      .addCase(getChaptersAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // 题目列表
      .addCase(getQuestionListAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getQuestionListAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data || action.payload.items || action.payload.questions || [];
        state.total = action.payload.total || 0;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
      })
      .addCase(getQuestionListAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = questionSlice.actions;
export default questionSlice.reducer; 