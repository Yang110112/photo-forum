// backend/src/controllers/bookingController.js — 新建文件

const Booking = require('../models/Booking');
const Post = require('../models/Post');

// 创建约拍请求
exports.createBooking = async (req, res) => {
  try {
    const { postId, proposedLocation, proposedDate, message } = req.body;
    
    if (!proposedLocation || !proposedDate) {
      return res.status(400).json({ message: '请填写拍摄地点和时间' });
    }

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: '作品不存在' });
    if (!post.openForBooking) return res.status(400).json({ message: '该作品未开启约拍' });
    if (post.author.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: '不能向自己约拍' });
    }

    // 检查重复请求
    const existing = await Booking.findOne({
      post: postId,
      requester: req.user._id,
      status: 'pending'
    });
    if (existing) return res.status(400).json({ message: '您已有待处理的约拍请求' });

    const booking = await Booking.create({
      post: postId,
      requester: req.user._id,
      photographer: post.author,
      proposedLocation, proposedDate, message,
    });

    await booking.populate('requester', 'username avatar');
    await booking.populate('photographer', 'username avatar');
    await booking.populate('post', 'title');

    res.status(201).json({ booking });
  } catch (err) {
    res.status(500).json({ message: '约拍请求发送失败', error: err.message });
  }
};

// 获取收到的约拍请求（摄影师端）
exports.getReceivedBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ photographer: req.user._id })
      .populate('requester', 'username avatar certStatus')
      .populate('post', 'title')
      .sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ message: '获取失败', error: err.message });
  }
};

// 获取发出的约拍请求（用户端）
exports.getSentBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ requester: req.user._id })
      .populate('photographer', 'username avatar certStatus')
      .populate('post', 'title')
      .sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ message: '获取失败', error: err.message });
  }
};

// 更新约拍状态（接受/拒绝）
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: '参数错误' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: '约拍请求不存在' });
    if (booking.photographer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: '无权操作' });
    }
    if (booking.status !== 'pending') {
      return res.status(400).json({ message: '该请求已处理' });
    }

    booking.status = status;
    await booking.save();

    res.json({ message: status === 'accepted' ? '已接受约拍' : '已拒绝约拍' });
  } catch (err) {
    res.status(500).json({ message: '操作失败', error: err.message });
  }
};