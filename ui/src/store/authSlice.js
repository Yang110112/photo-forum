import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { login, register, getMe } from '../api/auth';

// 登录
export const loginUser = createAsyncThunk('auth/login', async (data) => {
  const res = await login(data);
  localStorage.setItem('token', res.data.data.token);
  return res.data.data;
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
          state.user = action.payload.user;
        });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;