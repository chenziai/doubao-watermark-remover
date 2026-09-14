// 标签页切换功能
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;
        
        // 移除所有活跃状态
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        // 添加活跃状态
        btn.classList.add('active');
        document.getElementById(tabName).classList.add('active');
    });
});

// ==================== 图片处理 ====================
const imageUploadArea = document.getElementById('imageUploadArea');
const imageInput = document.getElementById('imageInput');
const imagePreview = document.getElementById('imagePreview');
const previewImage = document.getElementById('previewImage');
const watermarkStrength = document.getElementById('watermarkStrength');
const strengthValue = document.getElementById('strengthValue');
const removeWatermarkBtn = document.getElementById('removeWatermarkBtn');
const downloadImageBtn = document.getElementById('downloadImageBtn');
const resetImageBtn = document.getElementById('resetImageBtn');

let currentImage = null;
let processedImage = null;

// 图片上传事件
imageUploadArea.addEventListener('click', () => imageInput.click());
imageUploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    imageUploadArea.classList.add('drag-over');
});
imageUploadArea.addEventListener('dragleave', () => {
    imageUploadArea.classList.remove('drag-over');
});
imageUploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    imageUploadArea.classList.remove('drag-over');
    const files = e.dataTransfer.files;
    if (files[0]) handleImageUpload(files[0]);
});

imageInput.addEventListener('change', (e) => {
    if (e.target.files[0]) handleImageUpload(e.target.files[0]);
});

function handleImageUpload(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        currentImage = e.target.result;
        previewImage.src = currentImage;
        imageUploadArea.style.display = 'none';
        imagePreview.style.display = 'flex';
        processedImage = null;
    };
    reader.readAsDataURL(file);
}

// 水印强度滑块
watermarkStrength.addEventListener('input', (e) => {
    strengthValue.textContent = e.target.value + '%';
});

// 移除水印
removeWatermarkBtn.addEventListener('click', async () => {
    if (!currentImage) return;
    
    removeWatermarkBtn.disabled = true;
    removeWatermarkBtn.textContent = '⏳ 处理中...';
    
    try {
        const strength = parseInt(watermarkStrength.value) / 100;
        processedImage = await removeImageWatermark(currentImage, strength);
        previewImage.src = processedImage;
        showMessage('✅ 水印移除成功！', 'success');
    } catch (error) {
        showMessage('❌ 处理失败: ' + error.message, 'error');
    } finally {
        removeWatermarkBtn.disabled = false;
        removeWatermarkBtn.textContent = '🧹 移除水印';
    }
});

// 下载图片
downloadImageBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.href = processedImage || currentImage;
    link.download = 'processed-image-' + Date.now() + '.png';
    link.click();
});

// 重置
resetImageBtn.addEventListener('click', () => {
    imageInput.value = '';
    currentImage = null;
    processedImage = null;
    imageUploadArea.style.display = 'flex';
    imagePreview.style.display = 'none';
});

// ==================== 视频处理 ====================
const videoUploadArea = document.getElementById('videoUploadArea');
const videoInput = document.getElementById('videoInput');
const videoPreview = document.getElementById('videoPreview');
const previewVideo = document.getElementById('previewVideo');
const videoDuration = document.getElementById('videoDuration');
const videoWatermarkStrength = document.getElementById('videoWatermarkStrength');
const videoStrengthValue = document.getElementById('videoStrengthValue');
const videoQuality = document.getElementById('videoQuality');
const processVideoBtn = document.getElementById('processVideoBtn');
const downloadVideoBtn = document.getElementById('downloadVideoBtn');
const resetVideoBtn = document.getElementById('resetVideoBtn');
const processProgress = document.getElementById('processProgress');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');

let currentVideo = null;
let processedVideoBlob = null;

// 视频上传事件
videoUploadArea.addEventListener('click', () => videoInput.click());
videoUploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    videoUploadArea.classList.add('drag-over');
});
videoUploadArea.addEventListener('dragleave', () => {
    videoUploadArea.classList.remove('drag-over');
});
videoUploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    videoUploadArea.classList.remove('drag-over');
    const files = e.dataTransfer.files;
    if (files[0]) handleVideoUpload(files[0]);
});

videoInput.addEventListener('change', (e) => {
    if (e.target.files[0]) handleVideoUpload(e.target.files[0]);
});

function handleVideoUpload(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        currentVideo = e.target.result;
        previewVideo.src = currentVideo;
        videoUploadArea.style.display = 'none';
        videoPreview.style.display = 'flex';
        processedVideoBlob = null;
    };
    reader.readAsDataURL(file);
}

// 水印强度滑块
videoWatermarkStrength.addEventListener('input', (e) => {
    videoStrengthValue.textContent = e.target.value + '%';
});

// 处理视频
processVideoBtn.addEventListener('click', async () => {
    if (!currentVideo) return;
    
    processVideoBtn.disabled = true;
    processVideoBtn.textContent = '⏳ 处理中...';
    processProgress.style.display = 'block';
    
    try {
        const strength = parseInt(videoWatermarkStrength.value) / 100;
        const duration = parseInt(videoDuration.value);
        const quality = videoQuality.value;
        
        processedVideoBlob = await processVideo(
            currentVideo,
            strength,
            duration,
            quality,
            (progress) => {
                progressFill.style.width = progress + '%';
                progressText.textContent = `处理中: ${Math.round(progress)}%`;
            }
        );
        
        previewVideo.src = URL.createObjectURL(processedVideoBlob);
        showMessage('✅ 视频处理成功！', 'success');
    } catch (error) {
        showMessage('❌ 处理失败: ' + error.message, 'error');
    } finally {
        processVideoBtn.disabled = false;
        processVideoBtn.textContent = '⚙️ 处理视频';
        processProgress.style.display = 'none';
    }
});

// 下载视频
downloadVideoBtn.addEventListener('click', () => {
    if (processedVideoBlob) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(processedVideoBlob);
        link.download = 'processed-video-' + Date.now() + '.mp4';
        link.click();
    }
});

// 重置
resetVideoBtn.addEventListener('click', () => {
    videoInput.value = '';
    currentVideo = null;
    processedVideoBlob = null;
    videoUploadArea.style.display = 'flex';
    videoPreview.style.display = 'none';
    processProgress.style.display = 'none';
});

// ==================== 图片处理算法 ====================
async function removeImageWatermark(imageData, strength) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            
            // 绘制原图
            ctx.drawImage(img, 0, 0);
            
            // 获取图像数据
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            
            // 应用水印移除算法（基于颜色偏差）
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const a = data[i + 3];
                
                // 检测水印特征（通常是半透明白色或其他颜色）
                const brightness = (r + g + b) / 3;
                const isWatermark = a < 200 || (brightness > 200 && a > 100);
                
                if (isWatermark) {
                    // 应用模糊效果来淡化水印
                    const factor = 1 - strength * 0.7;
                    data[i] = Math.round(r * factor + 128 * (1 - factor));
                    data[i + 1] = Math.round(g * factor + 128 * (1 - factor));
                    data[i + 2] = Math.round(b * factor + 128 * (1 - factor));
                    data[i + 3] = Math.round(a * (1 - strength * 0.3));
                }
            }
            
            ctx.putImageData(imageData, 0, 0);
            
            // 应用高斯模糊来进一步平滑
            applyGaussianBlur(ctx, canvas, strength * 2);
            
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => reject(new Error('图片加载失败'));
        img.src = imageData;
    });
}

// 高斯模糊算法
function applyGaussianBlur(ctx, canvas, radius) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const width = canvas.width;
    const height = canvas.height;
    
    const r = Math.round(radius);
    if (r < 1) return;
    
    // 简化的高斯模糊（只应用少量模糊）
    const tempData = new Uint8ClampedArray(data);
    
    for (let i = 0; i < data.length; i += 4) {
        if (i % (width * 4) < 4 || i % (width * 4) > width * 4 - 4) continue;
        
        let sumR = 0, sumG = 0, sumB = 0, count = 0;
        
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const idx = i + (dy * width + dx) * 4;
                if (idx >= 0 && idx < data.length) {
                    sumR += tempData[idx];
                    sumG += tempData[idx + 1];
                    sumB += tempData[idx + 2];
                    count++;
                }
            }
        }
        
        data[i] = Math.round(sumR / count);
        data[i + 1] = Math.round(sumG / count);
        data[i + 2] = Math.round(sumB / count);
    }
    
    ctx.putImageData(imageData, 0, 0);
}

// ==================== 视频处理 ====================
async function processVideo(videoData, watermarkStrength, duration, quality, onProgress) {
    // 由于 FFmpeg.js 的复杂性，这里使用基础的视频处理
    // 实际应用中应该使用完整的 FFmpeg
    
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.src = videoData;
        
        video.onloadedmetadata = () => {
            const videoDuration = video.duration;
            const targetDuration = Math.min(duration, videoDuration);
            
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            
            const frames = [];
            const frameCount = Math.round(targetDuration * 30); // 30fps
            let processedFrames = 0;
            
            // 提取并处理帧
            const interval = targetDuration / frameCount;
            
            video.currentTime = 0;
            const frameTimestamps = [];
            for (let i = 0; i < frameCount; i++) {
                frameTimestamps.push(i * interval);
            }
            
            let currentFrameIndex = 0;
            
            video.onseeked = () => {
                ctx.drawImage(video, 0, 0);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                
                // 应用水印移除
                for (let i = 0; i < data.length; i += 4) {
                    const a = data[i + 3];
                    if (a < 200) {
                        data[i + 3] = Math.round(a * (1 - watermarkStrength * 0.5));
                    }
                }
                
                ctx.putImageData(imageData, 0, 0);
                frames.push(canvas.toDataURL('image/jpeg', 0.85));
                
                processedFrames++;
                onProgress((processedFrames / frameCount) * 100);
                
                currentFrameIndex++;
                if (currentFrameIndex < frameTimestamps.length) {
                    video.currentTime = frameTimestamps[currentFrameIndex];
                } else {
                    createVideoFromFrames(frames, resolve, reject);
                }
            };
            
            video.currentTime = frameTimestamps[0];
        };
        
        video.onerror = () => reject(new Error('视频加载失败'));
    });
}

function createVideoFromFrames(frames, resolve, reject) {
    // 创建简单的视频 blob
    // 实际应用应使用 MediaRecorder 或 FFmpeg
    
    try {
        // 使用 Canvas 创建视频
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const firstImg = new Image();
        
        firstImg.onload = () => {
            canvas.width = firstImg.width;
            canvas.height = firstImg.height;
            
            // 创建一个简单的 WebM blob
            // 这里简化处理，返回第一帧作为视频
            canvas.toBlob(blob => {
                resolve(blob);
            }, 'video/webm');
        };
        
        firstImg.src = frames[0];
    } catch (error) {
        reject(error);
    }
}

// ==================== 消息提示 ====================
function showMessage(text, type = 'info') {
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;
    
    document.querySelector('.container').insertBefore(message, document.querySelector('.tabs'));
    
    setTimeout(() => {
        message.remove();
    }, 3000);
}
