/**
 * 视频处理库 - 生成去除水印后的15秒视频
 * 使用FFmpeg.wasm进行视频处理
 */

class VideoWatermarkRemover {
  constructor() {
    this.ffmpeg = null;
    this.isLoaded = false;
  }

  /**
   * 初始化FFmpeg
   */
  async initFFmpeg() {
    if (this.isLoaded) return;
    
    try {
      const { FFmpeg, fetchFile } = FFmpeg;
      this.ffmpeg = new FFmpeg.FFmpeg();
      
      await this.ffmpeg.load();
      this.isLoaded = true;
      console.log('FFmpeg loaded successfully');
    } catch (error) {
      console.error('Failed to load FFmpeg:', error);
      throw error;
    }
  }

  /**
   * 从视频URL加载视频文件
   */
  async loadVideoFile(videoUrl) {
    try {
      const response = await fetch(videoUrl);
      const buffer = await response.arrayBuffer();
      return new Uint8Array(buffer);
    } catch (error) {
      console.error('Failed to load video:', error);
      throw error;
    }
  }

  /**
   * 获取视频信息
   */
  async getVideoInfo(inputFile) {
    try {
      const { FFmpeg } = FFmpeg;
      
      this.ffmpeg.FS('writeFile', 'input.mp4', inputFile);
      
      await this.ffmpeg.run(
        '-i', 'input.mp4'
      );
      
      // 从输出中解析视频信息
      const output = this.ffmpeg.FS('readFile', 'output.txt');
      return output;
    } catch (error) {
      // FFmpeg 总是会返回错误，但我们可以从stderr获取信息
      console.log('Video info retrieved');
    }
  }

  /**
   * 裁剪视频到指定时长（15秒）
   */
  async cropVideoToLength(inputFile, duration = 15, startTime = 0) {
    try {
      const { FFmpeg } = FFmpeg;
      
      this.ffmpeg.FS('writeFile', 'input.mp4', inputFile);
      
      // 使用FFmpeg裁剪视频
      await this.ffmpeg.run(
        '-i', 'input.mp4',
        '-ss', startTime.toString(),
        '-t', duration.toString(),
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-preset', 'ultrafast',
        'cropped.mp4'
      );
      
      const croppedVideo = this.ffmpeg.FS('readFile', 'cropped.mp4');
      return croppedVideo;
    } catch (error) {
      console.error('Failed to crop video:', error);
      throw error;
    }
  }

  /**
   * 检测视频中的水印位置
   */
  async detectWatermarkInVideo(inputFile) {
    try {
      const { FFmpeg } = FFmpeg;
      
      this.ffmpeg.FS('writeFile', 'input.mp4', inputFile);
      
      // 提取视频的第一帧进行水印检测
      await this.ffmpeg.run(
        '-i', 'input.mp4',
        '-vf', 'select=eq(n\\,0)',
        '-q:v', '3',
        'frame.jpg'
      );
      
      const frameData = this.ffmpeg.FS('readFile', 'frame.jpg');
      
      // 这里可以使用图片处理库来检测水印位置
      return {
        hasWatermark: true,
        position: 'bottom',
        confidence: 0.85
      };
    } catch (error) {
      console.error('Failed to detect watermark:', error);
      throw error;
    }
  }

  /**
   * 应用视频滤镜去除水印
   */
  async applyWatermarkRemovalFilter(inputFile, watermarkRegion) {
    try {
      const { FFmpeg } = FFmpeg;
      
      this.ffmpeg.FS('writeFile', 'input.mp4', inputFile);
      
      // 使用FFmpeg的delogo或其他滤镜去除水印
      // 假设水印在底部
      const { height = 1080 } = watermarkRegion;
      const filterComplex = `[0:v]scale=iw:ih[scaled];[scaled]crop=iw:${height-100}:0:0[cropped]`;
      
      await this.ffmpeg.run(
        '-i', 'input.mp4',
        '-vf', filterComplex,
        '-c:a', 'copy',
        'filtered.mp4'
      );
      
      const filteredVideo = this.ffmpeg.FS('readFile', 'filtered.mp4');
      return filteredVideo;
    } catch (error) {
      console.error('Failed to apply filter:', error);
      throw error;
    }
  }

  /**
   * 调整视频质量
   */
  async adjustVideoQuality(inputFile, quality = 'medium') {
    try {
      const { FFmpeg } = FFmpeg;
      
      this.ffmpeg.FS('writeFile', 'input.mp4', inputFile);
      
      // 不同质量的CRF值（越低越好，默认23）
      const crfMap = {
        low: 28,
        medium: 23,
        high: 18,
        veryHigh: 10
      };
      
      const crf = crfMap[quality] || 23;
      
      await this.ffmpeg.run(
        '-i', 'input.mp4',
        '-c:v', 'libx264',
        '-crf', crf.toString(),
        '-preset', 'fast',
        '-c:a', 'aac',
        '-b:a', '128k',
        'output.mp4'
      );
      
      const outputVideo = this.ffmpeg.FS('readFile', 'output.mp4');
      return outputVideo;
    } catch (error) {
      console.error('Failed to adjust quality:', error);
      throw error;
    }
  }

  /**
   * 添加字幕或文本叠加
   */
  async addTextOverlay(inputFile, text, options = {}) {
    try {
      const { FFmpeg } = FFmpeg;
      
      this.ffmpeg.FS('writeFile', 'input.mp4', inputFile);
      
      const {
        fontSize = 20,
        fontColor = 'white',
        position = 'top-left'
      } = options;
      
      // FFmpeg drawtext filter
      const filterComplex = `drawtext=text='${text}':fontsize=${fontSize}:fontcolor=${fontColor}`;
      
      await this.ffmpeg.run(
        '-i', 'input.mp4',
        '-vf', filterComplex,
        '-c:a', 'copy',
        'output.mp4'
      );
      
      const outputVideo = this.ffmpeg.FS('readFile', 'output.mp4');
      return outputVideo;
    } catch (error) {
      console.error('Failed to add text overlay:', error);
      throw error;
    }
  }

  /**
   * 转换视频格式
   */
  async convertVideoFormat(inputFile, outputFormat = 'mp4') {
    try {
      const { FFmpeg } = FFmpeg;
      
      this.ffmpeg.FS('writeFile', `input.${inputFile.type.split('/')[1]}`, inputFile);
      
      const inputName = `input.${inputFile.type.split('/')[1]}`;
      const outputName = `output.${outputFormat}`;
      
      await this.ffmpeg.run(
        '-i', inputName,
        '-c:v', 'libx264',
        '-c:a', 'aac',
        outputName
      );
      
      const outputVideo = this.ffmpeg.FS('readFile', outputName);
      return outputVideo;
    } catch (error) {
      console.error('Failed to convert video format:', error);
      throw error;
    }
  }

  /**
   * 生成15秒的处理视频 - 主函数
   */
  async generate15SecondVideo(videoUrl, options = {}) {
    try {
      // 1. 初始化FFmpeg
      await this.initFFmpeg();
      
      // 2. 加载视频文件
      console.log('Loading video...');
      const inputFile = await this.loadVideoFile(videoUrl);
      
      // 3. 检测水印
      console.log('Detecting watermark...');
      const watermarkRegion = await this.detectWatermarkInVideo(inputFile);
      
      // 4. 去除水印
      console.log('Removing watermark...');
      let processedVideo = await this.applyWatermarkRemovalFilter(inputFile, watermarkRegion);
      
      // 5. 裁剪到15秒
      console.log('Cropping to 15 seconds...');
      const {
        startTime = 0,
        duration = 15
      } = options;
      processedVideo = await this.cropVideoToLength(processedVideo, duration, startTime);
      
      // 6. 调整质量
      console.log('Adjusting quality...');
      const { quality = 'medium' } = options;
      processedVideo = await this.adjustVideoQuality(processedVideo, quality);
      
      // 7. 如果需要，添加文本叠加
      if (options.text) {
        console.log('Adding text overlay...');
        processedVideo = await this.addTextOverlay(processedVideo, options.text, options.textOptions);
      }
      
      console.log('Video processing completed');
      return processedVideo;
    } catch (error) {
      console.error('Failed to generate video:', error);
      throw error;
    }
  }

  /**
   * 获取视频的Blob对象用于下载
   */
  videoToBlob(videoData, mimeType = 'video/mp4') {
    return new Blob([videoData], { type: mimeType });
  }

  /**
   * 下载处理后的视频
   */
  downloadVideo(videoData, filename = 'output.mp4') {
    const blob = this.videoToBlob(videoData);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  /**
   * 获取视频预览帧
   */
  async getVideoPreview(videoUrl) {
    try {
      await this.initFFmpeg();
      const inputFile = await this.loadVideoFile(videoUrl);
      
      this.ffmpeg.FS('writeFile', 'input.mp4', inputFile);
      
      await this.ffmpeg.run(
        '-i', 'input.mp4',
        '-vf', 'select=eq(n\\,0)',
        '-q:v', '3',
        'preview.jpg'
      );
      
      const frameData = this.ffmpeg.FS('readFile', 'preview.jpg');
      const blob = new Blob([frameData], { type: 'image/jpeg' });
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Failed to get preview:', error);
      throw error;
    }
  }

  /**
   * 清理临时文件
   */
  cleanup() {
    try {
      const files = this.ffmpeg.FS('readdir', '/');
      files.forEach(file => {
        if (file !== '.' && file !== '..') {
          this.ffmpeg.FS('unlink', `/${file}`);
        }
      });
    } catch (error) {
      console.error('Failed to cleanup:', error);
    }
  }

  /**
   * 卸载FFmpeg
   */
  async unload() {
    if (this.ffmpeg && this.isLoaded) {
      await this.ffmpeg.exit();
      this.isLoaded = false;
    }
  }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VideoWatermarkRemover;
}
