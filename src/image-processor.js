/**
 * 图片处理库 - 去除豆包水印
 * 支持多种图片格式的水印去除
 */

class ImageWatermarkRemover {
  constructor() {
    this.canvas = null;
    this.ctx = null;
  }

  /**
   * 初始化Canvas上下文
   */
  initCanvas(width, height) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d');
    return this.ctx;
  }

  /**
   * 从图片URL加载图片
   */
  async loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }

  /**
   * 检测水印区域（底部通常包含水印）
   */
  detectWatermarkRegion(imageData) {
    const { data, width, height } = imageData;
    const watermarkThreshold = 0.1; // 水印覆盖面积阈值
    
    // 从底部向上检测
    let watermarkStartY = height;
    
    for (let y = height - 1; y >= 0; y--) {
      let changedPixels = 0;
      
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const alpha = data[idx + 3];
        
        // 检测透明度变化（水印通常有半透明效果）
        if (alpha < 255 && alpha > 0) {
          changedPixels++;
        }
      }
      
      const changeRatio = changedPixels / width;
      
      if (changeRatio > watermarkThreshold) {
        watermarkStartY = y;
      } else if (watermarkStartY < height) {
        // 已经找到水印区域且当前行没有水印，停止
        break;
      }
    }
    
    return {
      startY: watermarkStartY,
      endY: height,
      startX: 0,
      endX: width
    };
  }

  /**
   * 使用内容感知填充去除水印
   */
  removeWatermarkContentAware(imageData, watermarkRegion) {
    const { data, width, height } = imageData;
    const { startY, endY, startX, endX } = watermarkRegion;
    
    // 简单的内容感知填充算法
    // 使用周围像素的平均值填充
    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        // 从上方邻域采样
        const sampleY = Math.max(0, y - 10);
        const sampleIdx = (sampleY * width + x) * 4;
        
        const idx = (y * width + x) * 4;
        
        // 复制上方像素颜色
        data[idx] = data[sampleIdx];
        data[idx + 1] = data[sampleIdx + 1];
        data[idx + 2] = data[sampleIdx + 2];
        data[idx + 3] = 255; // 完全不透明
      }
    }
    
    return imageData;
  }

  /**
   * 使用模糊和混合去除水印
   */
  removeWatermarkBlur(imageData, watermarkRegion) {
    const { data, width, height } = imageData;
    const { startY, endY, startX, endX } = watermarkRegion;
    
    // 创建临时图片数据
    const tempData = new Uint8ClampedArray(data);
    
    // 高斯模糊
    const kernelSize = 5;
    const sigma = 1.5;
    const kernel = this.createGaussianKernel(kernelSize, sigma);
    
    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        let r = 0, g = 0, b = 0, a = 0;
        let kernelSum = 0;
        
        for (let ky = 0; ky < kernelSize; ky++) {
          for (let kx = 0; kx < kernelSize; kx++) {
            const ny = y + ky - Math.floor(kernelSize / 2);
            const nx = x + kx - Math.floor(kernelSize / 2);
            
            if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
              const idx = (ny * width + nx) * 4;
              const weight = kernel[ky][kx];
              
              r += tempData[idx] * weight;
              g += tempData[idx + 1] * weight;
              b += tempData[idx + 2] * weight;
              a += tempData[idx + 3] * weight;
              kernelSum += weight;
            }
          }
        }
        
        const idx = (y * width + x) * 4;
        data[idx] = Math.round(r / kernelSum);
        data[idx + 1] = Math.round(g / kernelSum);
        data[idx + 2] = Math.round(b / kernelSum);
        data[idx + 3] = Math.round(a / kernelSum);
      }
    }
    
    return imageData;
  }

  /**
   * 创建高斯核
   */
  createGaussianKernel(size, sigma) {
    const kernel = [];
    const mean = size / 2;
    let sum = 0;
    
    for (let y = 0; y < size; y++) {
      kernel[y] = [];
      for (let x = 0; x < size; x++) {
        const value = Math.exp(-((Math.pow(x - mean, 2) + Math.pow(y - mean, 2)) / (2 * Math.pow(sigma, 2))));
        kernel[y][x] = value;
        sum += value;
      }
    }
    
    // 归一化
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        kernel[y][x] /= sum;
      }
    }
    
    return kernel;
  }

  /**
   * 主要处理函数 - 去除图片水印
   */
  async removeWatermark(imageUrl, method = 'contentAware') {
    try {
      // 1. 加载图片
      const img = await this.loadImage(imageUrl);
      
      // 2. 初始化Canvas
      this.initCanvas(img.width, img.height);
      
      // 3. 绘制图片到Canvas
      this.ctx.drawImage(img, 0, 0);
      
      // 4. 获取图片数据
      let imageData = this.ctx.getImageData(0, 0, img.width, img.height);
      
      // 5. 检测水印区域
      const watermarkRegion = this.detectWatermarkRegion(imageData);
      
      // 6. 选择去除方法
      if (method === 'blur') {
        imageData = this.removeWatermarkBlur(imageData, watermarkRegion);
      } else {
        imageData = this.removeWatermarkContentAware(imageData, watermarkRegion);
      }
      
      // 7. 将处理后的图片数据放回Canvas
      this.ctx.putImageData(imageData, 0, 0);
      
      // 8. 返回处理后的图片
      return this.canvas.toDataURL('image/png');
    } catch (error) {
      console.error('图片处理失败:', error);
      throw error;
    }
  }

  /**
   * 批量处理图片
   */
  async batchRemoveWatermark(imageUrls, method = 'contentAware') {
    const results = [];
    
    for (const url of imageUrls) {
      try {
        const result = await this.removeWatermark(url, method);
        results.push({
          original: url,
          processed: result,
          success: true
        });
      } catch (error) {
        results.push({
          original: url,
          error: error.message,
          success: false
        });
      }
    }
    
    return results;
  }

  /**
   * 下载处理后的图片
   */
  downloadImage(dataUrl, filename = 'image.png') {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    link.click();
  }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ImageWatermarkRemover;
}
