import { useEffect, useState } from 'react';
import { getPosts } from '../api/posts';
import { Link } from 'react-router-dom';

export default function Home() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await getPosts({ page: 1, limit: 10 });
                // 适配 mock 数据和真实接口的两种返回格式
                const postList = res.data.data?.data || res.data.data || [];
                setPosts(postList);
            } catch (err) {
                console.error('获取帖子失败:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    if (loading) {
        return <div className="text-center py-12 text-gray-500">加载中...</div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">摄影作品分享</h1>
                <Link to="/create" className="btn btn-primary">发布作品</Link>
            </div>

            {posts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <p>暂无作品，快来发布你的第一组摄影作品吧！</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts.map((post) => (
                        <div key={post._id} className="card">
                            <Link to={`/post/${post._id}`}>
                                <h3 className="text-xl font-bold text-gray-800 mb-2 hover:text-blue-600 transition-colors">
                                    {post.title}
                                </h3>
                            </Link>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                {post.content}
                            </p>
                            <div className="flex items-center justify-between text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                    <img
                                        src={post.author?.avatar || 'https://via.placeholder.com/30'}
                                        alt={post.author?.username}
                                        className="w-6 h-6 rounded-full"
                                    />
                                    <span>{post.author?.username}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span>{post.viewCount} 浏览</span>
                                    <span>{post.likeCount} 点赞</span>
                                </div>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                  {post.category?.name}
                </span>
                                {post.tags?.map((tag) => (
                                    <span
                                        key={tag}
                                        className="px-2 py-1 bg-blue-100 rounded-full text-xs text-blue-700"
                                    >
                    #{tag}
                  </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}