import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { login, register, getMe } from '../api/auth';

// 登录
export const loginUser = createAsyncThunk(
  'auth/login',
  async (data, { rejectWithValue }) => {
    try {
      const res = await login(data);
      const { user, token } = res.data.data;
      localStorage.setItem('token', token);
      return { user, token };
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: '登录失败' });
    }
  }
);

// 注册
export const registerUser = createAsyncThunk(
  'auth/register',
  async (data, { rejectWithValue }) => {
    try {
      const res = await register(data);
      const { user, token } = res.data.data;
      localStorage.setItem('token', token);
      return { user, token };
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: '注册失败' });
    }
  }
);

// 获取用户信息
export const fetchUserInfo = createAsyncThunk('auth/getMe', async () => {
  const res = await getMe();
  // 兼容不同后端返回格式
  return res.data.data?.user || res.data.user || null;
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('token'),
    loading: false,
  },
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      state.user = null;
      state.token = null;
    },
    // 更新用户认证状态（在认证申请/审核后调用）
    updateCertStatus: (state, action) => {
      if (state.user) {
        state.user.certStatus = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // 登录
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      // 注册
      .addCase(registerUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      // 获取用户信息
      .addCase(fetchUserInfo.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload;
        }
      })
      // 可以加 pending/ rejected 处理 loading/error
      .addMatcher(
        (action) => action.type.startsWith('auth/') && action.type.endsWith('/pending'),
        (state) => { state.loading = true; }
      )
      .addMatcher(
        (action) => action.type.startsWith('auth/') && action.type.endsWith('/fulfilled'),
        (state) => { state.loading = false; }
      )
      .addMatcher(
        (action) => action.type.startsWith('auth/') && action.type.endsWith('/rejected'),
        (state) => { state.loading = false; }
      );
  },
});

export const { logout, updateCertStatus } = authSlice.actions;
export default authSlice.reducer;