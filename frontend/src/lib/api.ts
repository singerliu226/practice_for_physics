import axios from 'axios';
import Cookies from 'js-cookie';

/**
 * API 基础配置
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// 创建 axios 实例
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加认证令牌
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('access_token');
    if (token) {
      // 统一写入 Authorization 头；Axios 会自动处理大小写
      config.headers = {
        ...(config.headers || {}),
        Authorization: `Bearer ${token}`,
      } as any;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理认证失败
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 如果是401错误且没有重试过
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // 尝试刷新令牌
        const refreshToken = Cookies.get('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken } = response.data;
          Cookies.set('access_token', accessToken);

          // 重新发送原请求
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // 刷新失败，清除令牌并跳转到登录页
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

/**
 * API 接口定义
 */

// 认证相关接口
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  register: (userData: any) =>
    api.post('/auth/register', userData),
  
  logout: () =>
    api.post('/auth/logout'),
  
  getProfile: () =>
    api.get('/auth/profile'),
  
  // 忘记密码 - 发送验证码
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  
  // 重置密码
  resetPassword: (email: string, verificationCode: string, newPassword: string) =>
    api.post('/auth/reset-password', { email, verificationCode, newPassword }),
};

// 题库相关接口
export const questionAPI = {
  getChapters: () =>
    api.get('/questions/chapters'),
  
  getQuestionsByChapter: (chapter: string, page = 1, limit = 20) =>
    api.get(`/questions/chapter/${chapter}`, { params: { page, limit } }),
  
  getRandomQuestions: (count = 10, chapter?: string, difficulty?: number) =>
    api.get('/questions/random', { params: { count, chapter, difficulty } }),
  
  createQuestion: (questionData: any) =>
    api.post('/questions', questionData),
  
  importQuestions: (file: File, chapter: string, difficulty: number) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('chapter', chapter);
    formData.append('difficulty', difficulty.toString());
    
    return api.post('/questions/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // 分页获取题库列表（教师端）
  listQuestions: (
    page = 1,
    limit = 20,
    chapter?: string,
    difficulty?: number,
  ) =>
    api.get('/questions', {
      params: { page, limit, chapter, difficulty },
    }),
  
  // 删除题目
  deleteQuestion: (id: string) => api.delete(`/questions/${id}`),
};

// 练习相关接口
export const exerciseAPI = {
  startExercise: (exerciseData: any) =>
    api.post('/exercise/start', exerciseData),
  
  submitAnswer: (answerData: any) =>
    api.post('/exercise/submit', answerData),
  
  getStats: () =>
    api.get('/exercise/stats'),
  
  getWrongQuestions: (limit = 20) =>
    api.get('/exercise/wrong-questions', { params: { limit } }),
  
  markWrongQuestionResolved: (questionId: string) =>
    api.post(`/exercise/wrong-questions/${questionId}/resolved`),
};

// AI规划相关接口
export const aiPlannerAPI = {
  getLearningPlan: () =>
    api.get('/ai-planner/learning-plan'),
  
  getReminders: () =>
    api.get('/ai-planner/reminders'),
};

// 用户相关接口
export const userAPI = {
  getStudentInfo: () =>
    api.get('/user/student/info'),
  
  updateStudentInfo: (studentData: any) =>
    api.put('/user/student/info', studentData),
  
  getTeacherInfo: () =>
    api.get('/user/teacher/info'),
};

export default api; 