// backend/src/controllers/certificationController.js — 新建文件

const PhotographerCert = require('../models/PhotographerCert');
const User = require('../models/User');

// 提交认证申请
exports.submitCertification = async (req, res) => {
  try {
    const { realName, phone, certType, description, certFiles, portfolioFiles } = req.body;
    
    // 校验必填字段
    if (!realName || !phone || !certType) {
      return res.status(400).json({ message: '请填写必填字段' });
    }
    if (!certFiles || certFiles.length === 0) {
      return res.status(400).json({ message: '请上传证书照片' });
    }
    if (!portfolioFiles || portfolioFiles.length === 0) {
      return res.status(400).json({ message: '请上传代表作品' });
    }

    // 检查是否已有待审核/已通过的申请
    const existing = await PhotographerCert.findOne({
      user: req.user._id,
      status: { $in: ['pending', 'approved'] }
    });
    if (existing) {
      return res.status(400).json({ 
        message: existing.status === 'approved' ? '您已通过认证' : '您已有待审核的申请' 
      });
    }

    const cert = await PhotographerCert.create({
      user: req.user._id,
      realName, phone, certType, description,
      certFiles, portfolioFiles,
    });

    // 更新用户认证状态为 pending
    await User.findByIdAndUpdate(req.user._id, { certStatus: 'pending' });

    res.status(201).json({ cert });
  } catch (err) {
    res.status(500).json({ message: '提交失败', error: err.message });
  }
};

// 获取我的认证状态
exports.getMyCertification = async (req, res) => {
  try {
    const cert = await PhotographerCert.findOne({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json({ cert });
  } catch (err) {
    res.status(500).json({ message: '获取失败', error: err.message });
  }
};

// 管理员：获取所有认证列表
exports.getAllCerts = async (req, res) => {
  try {
    const certs = await PhotographerCert.find()
      .populate('user', 'username avatar email')
      .sort({ createdAt: -1 });
    res.json({ certs });
  } catch (err) {
    res.status(500).json({ message: '获取失败', error: err.message });
  }
};

// 管理员：审核认证
exports.reviewCert = async (req, res) => {
  try {
    const { certId, status, reviewNote } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: '参数错误' });
    }

    const cert = await PhotographerCert.findById(certId);
    if (!cert) return res.status(404).json({ message: '认证记录不存在' });

    cert.status = status;
    cert.reviewNote = reviewNote || '';
    cert.reviewedAt = new Date();
    cert.reviewedBy = req.user._id;
    await cert.save();

    // 同步更新用户认证状态
    await User.findByIdAndUpdate(cert.user, { certStatus: status });

    res.json({ message: status === 'approved' ? '已通过认证' : '已拒绝认证' });
  } catch (err) {
    res.status(500).json({ message: '审核失败', error: err.message });
  }
};