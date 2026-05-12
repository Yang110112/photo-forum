// backend/src/models/PhotographerCert.js — 新建文件

const mongoose = require('mongoose');

const photographerCertSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  realName: { type: String, required: true },
  phone: { type: String, required: true },
  certType: { 
    type: String, 
    enum: ['id_card', 'photographer_license', 'business_license', 'award_cert', 'media_cert'],
    required: true 
  },
  description: { type: String, default: '' },
  certFiles: [{ type: String }],    // 证书照片 URL 列表
  portfolioFiles: [{ type: String }], // 代表作品 URL 列表
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  reviewNote: { type: String, default: '' },
  reviewedAt: { type: Date },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('PhotographerCert', photographerCertSchema);