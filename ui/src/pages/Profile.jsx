import { useSelector } from 'react-redux';

export default function Profile() {
  const { user } = useSelector((state) => state.auth);

  if (!user) return <div>请先登录</div>;

  return (
    <div>
      <h1>个人主页</h1>
      <p>用户名：{user.username}</p>
    </div>
  );
}