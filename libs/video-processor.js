// 高级视频处理工具库
class VideoProcessor {
    constructor(options = {}) {
        this.options = {
            quality: options.quality || 'medium',
            maxDuration: options.maxDuration || 15,
            watermarkStrength: options.watermarkStrength || 0.5,
            ...options
        };
    }

    /**
     * 处理视频文件
     * @param {File} videoFile - 视频文件
     * @param {Function} onProgress - 进度回调
     */
    async processVideo(videoFile, onProgress) {
        try {
            const videoUrl = URL.createObjectURL(videoFile);
            const video = await this.loadVideo(videoUrl);
            
            const frames = await this.extractFrames(video, onProgress);
            const processedFrames = await this.removeWatermarkFromFrames(frames, onProgress);
            const outputBlob = await this.encodeVideo(processedFrames);
            
            return outputBlob;
        } catch (error) {
            throw new Error(`视频处理失败: ${error.message}`);
        }
    }

    /**
     * 加载视频文件
     */
    async loadVideo(videoUrl) {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            video.crossOrigin = 'anonymous';
            
            video.onloadedmetadata = () => {
                resolve(video);
            };
            
            video.onerror = () => {
                reject(new Error('视频加载失败'));
            };
            
            video.src = videoUrl;
        });
    }

    /**
     * 提取视频帧
     */
    async extractFrames(video, onProgress) {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');

        const fps = 30;
        const maxDuration = Math.min(this.options.maxDuration, video.duration);
        const totalFrames = Math.ceil(maxDuration * fps);
        
        const frames = [];
        const frameTimestamps = [];

        for (let i = 0; i < totalFrames; i++) {
            frameTimestamps.push((i / fps));
        }

        return new Promise((resolve) => {
            let currentIndex = 0;

            const seekAndCapture = () => {
                if (currentIndex >= frameTimestamps.length) {
                    resolve(frames);
                    return;
                }

                video.currentTime = frameTimestamps[currentIndex];
            };

            video.onseeked = () => {
                ctx.drawImage(video, 0, 0);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                frames.push({
                    data: imageData,
                    timestamp: video.currentTime
                });

                const progress = (currentIndex / frameTimestamps.length) * 50;
                onProgress?.(progress);

                currentIndex++;
                seekAndCapture();
            };

            seekAndCapture();
        });
    }

    /**
     * 从帧中移除水印
     */
    async removeWatermarkFromFrames(frames, onProgress) {
        const processedFrames = [];
        
        for (let i = 0; i < frames.length; i++) {
            const frame = frames[i];
            const processedData = this.removeWatermarkFromFrame(frame.data);
            
            processedFrames.push({
                data: processedData,
                timestamp: frame.timestamp
            });

            const progress = 50 + (i / frames.length) * 30;
            onProgress?.(progress);
        }

        return processedFrames;
    }

    /**
     * 从单个帧中移除水印
     */
    removeWatermarkFromFrame(imageData) {
        const data = imageData.data;
        const strength = this.options.watermarkStrength;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];

            // 检测水印特征
            const brightness = (r + g + b) / 3;
            const isWatermark = a < 200 || (brightness > 200 && a > 100);

            if (isWatermark) {
                // 降低透明度
                data[i + 3] = Math.round(a * (1 - strength * 0.4));
                
                // 轻微色彩调整
                const factor = 1 - strength * 0.3;
                data[i] = Math.round(r * factor + 128 * (1 - factor));
                data[i + 1] = Math.round(g * factor + 128 * (1 - factor));
                data[i + 2] = Math.round(b * factor + 128 * (1 - factor));
            }
        }

        return imageData;
    }

    /**
     * 编码为视频文件
     */
    async encodeVideo(frames) {
        return new Promise((resolve, reject) => {
            try {
                // 获取质量参数
                const qualityMap = {
                    'low': 0.6,
                    'medium': 0.8,
                    'high': 0.95
                };
                const quality = qualityMap[this.options.quality] || 0.8;

                // 创建 WebM 或 MP4 格式视频
                const mimeType = 'video/webm';
                const chunks = [];

                // 简化处理：使用第一帧作为视频
                // 实际应用需要使用 MediaRecorder 或 FFmpeg
                if (frames.length > 0) {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    const firstFrame = frames[0].data;
                    canvas.width = firstFrame.width;
                    canvas.height = firstFrame.height;
                    
                    ctx.putImageData(firstFrame, 0, 0);

                    canvas.toBlob((blob) => {
                        resolve(blob);
                    }, mimeType, quality);
                } else {
                    reject(new Error('没有有效的帧数据'));
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * 获取视频元数据
     */
    async getVideoMetadata(videoFile) {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            video.crossOrigin = 'anonymous';

            video.onloadedmetadata = () => {
                resolve({
                    duration: video.duration,
                    width: video.videoWidth,
                    height: video.videoHeight,
                    filename: videoFile.name,
                    size: videoFile.size,
                    type: videoFile.type
                });
            };

            video.onerror = () => {
                reject(new Error('无法读取视频元数据'));
            };

            video.src = URL.createObjectURL(videoFile);
        });
    }
}

// 导出 VideoProcessor
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VideoProcessor;
}
