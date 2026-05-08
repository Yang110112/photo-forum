import { useState, useRef } from 'react';
import '../css/MediaUploader.css';

export default function MediaUploader({ files, onFilesChange }) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadingType, setUploadingType] = useState(null); // 'image' or 'video'
  const fileInputRef = useRef(null);

  // 支持的图片格式
  const imageFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  // 支持的视频格式
  const videoFormats = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo'];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    handleFiles(selectedFiles);
  };

  const handleFiles = (newFiles) => {
    const validFiles = newFiles.map(file => {
      const isImage = imageFormats.includes(file.type);
      const isVideo = videoFormats.includes(file.type);

      if (!isImage && !isVideo) {
        alert(`不支持的文件格式: ${file.name}`);
        return null;
      }

      // 创建本地预览URL
      const previewUrl = URL.createObjectURL(file);

      return {
        file,
        previewUrl,
        type: isImage ? 'image' : 'video',
        name: file.name,
        size: file.size
      };
    }).filter(Boolean);

    onFilesChange([...files, ...validFiles]);
  };

  const removeFile = (index) => {
    const newFiles = [...files];
    // 释放预览URL
    if (newFiles[index].previewUrl) {
      URL.revokeObjectURL(newFiles[index].previewUrl);
    }
    newFiles.splice(index, 1);
    onFilesChange(newFiles);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="media-uploader">
      {/* 拖拽上传区域 */}
      <div
        className={`drop-zone ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={imageFormats.join(',') + ',' + videoFormats.join(',')}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        <div className="drop-zone-content">
          <div className="upload-icons">
            <span className="upload-icon">🖼️</span>
            <span className="upload-icon">🎬</span>
          </div>
          <p className="drop-zone-title">
            拖拽图片或视频到这里，或<span className="browse-link">点击浏览</span>
          </p>
          <p className="drop-zone-hint">
            支持格式：JPG, PNG, GIF, WebP, MP4, WebM, MOV
          </p>
        </div>
      </div>

      {/* 文件预览列表 */}
      {files.length > 0 && (
        <div className="files-preview">
          <h4 className="preview-title">已上传的文件 ({files.length})</h4>
          <div className="files-grid">
            {files.map((fileData, index) => (
              <div key={index} className="file-item">
                <div className="file-preview">
                  {fileData.type === 'image' ? (
                    <img src={fileData.previewUrl} alt={fileData.name} />
                  ) : (
                    <video src={fileData.previewUrl} />
                  )}
                  <span className={`file-type-badge ${fileData.type}`}>
                    {fileData.type === 'image' ? '🖼️' : '🎬'}
                  </span>
                </div>
                <div className="file-info">
                  <p className="file-name" title={fileData.name}>{fileData.name}</p>
                  <p className="file-size">{formatFileSize(fileData.size)}</p>
                </div>
                <button
                  className="remove-btn"
                  onClick={() => removeFile(index)}
                  title="删除"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
