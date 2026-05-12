import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { login, register, getMe } from '../api/auth';

// 登录
export const loginUser = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    const res = await login(data);
    localStorage.setItem('token', res.data.data.token);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: '登录失败' });
  }
});

// 注册
export const registerUser = createAsyncThunk('auth/register', async (data) => {
  const res = await register(data);
  localStorage.setItem('token', res.data.data.token);
  return res.data.data;
});

// 获取用户信息
export const fetchUserInfo = createAsyncThunk('auth/getMe', async () => {
  const res = await getMe();
  return res.data;
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
        .addCase(loginUser.fulfilled, (state, action) => {
          state.user = action.payload.user;
          state.token = action.payload.token;
        })
        .addCase(registerUser.fulfilled, (state, action) => {
          state.user = action.payload.user;
          state.token = action.payload.token;
        })
        .addCase(fetchUserInfo.fulfilled, (state, action) => {
          // 兼容后端返回格式：res.data.data.user 或 res.data.user
          const userData = action.payload.data?.user || action.payload.user;
          if (userData) {
            state.user = userData;
          }
        });
  },
});

export const { logout, updateCertStatus } = authSlice.actions;
export default authSlice.reducer;
