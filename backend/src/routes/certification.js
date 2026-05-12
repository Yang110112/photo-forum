// backend/src/routes/certification.js — 新建文件

const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
  submitCertification,
  getMyCertification,
  getAllCerts,
  reviewCert
} = require('../controllers/certificationController');

router.post('/', protect, submitCertification);
router.get('/my', protect, getMyCertification);
router.get('/', protect, admin, getAllCerts);
router.post('/review', protect, admin, reviewCert);

module.exports = router;