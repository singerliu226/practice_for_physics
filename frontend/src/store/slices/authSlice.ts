import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authAPI } from '@/lib/api';
import Cookies from 'js-cookie';

/**
 * 用户信息接口
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  studentId?: string;
  teacherId?: string;
}

/**
 * 认证状态接口
 */
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

/**
 * 初始状态
 */
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

/**
 * 异步登录操作
 */
export const loginAsync = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(email, password);
      const { user, accessToken, refreshToken } = response.data;
      
      // 保存令牌到 Cookie
      Cookies.set('access_token', accessToken, { expires: 1 }); // 1天过期
      Cookies.set('refresh_token', refreshToken, { expires: 7 }); // 7天过期
      
      // 设置默认请求头，避免刷新后首个请求丢失令牌
      try {
        const { api } = await import('@/lib/api');
        (api as any).defaults.headers = {
          ...(api as any).defaults.headers,
          Authorization: `Bearer ${accessToken}`,
        };
      } catch {
        /* ignore dynamic import error in SSR */
      }
      
      return user;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '登录失败');
    }
  }
);

/**
 * 异步注册操作
 */
export const registerAsync = createAsyncThunk(
  'auth/register',
  async (userData: any, { rejectWithValue }) => {
    try {
      const response = await authAPI.register(userData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '注册失败');
    }
  }
);

/**
 * 获取用户信息
 */
export const getProfileAsync = createAsyncThunk(
  'auth/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.getProfile();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '获取用户信息失败');
    }
  }
);

/**
 * 认证 Slice
 */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // 登出
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      
      // 清除令牌
      Cookies.remove('access_token');
      Cookies.remove('refresh_token');
    },
    
    // 清除错误
    clearError: (state) => {
      state.error = null;
    },
    
    // 设置用户信息（用于初始化时从令牌恢复）
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    // 登录
    builder
      .addCase(loginAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // 注册
    builder
      .addCase(registerAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerAsync.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(registerAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 获取用户信息
    builder
      .addCase(getProfileAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProfileAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getProfileAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });
  },
});

export const { logout, clearError, setUser } = authSlice.actions;
export default authSlice.reducer; 