// 后台服务 Worker
chrome.runtime.onInstalled.addListener(() => {
    console.log('豆包水印移除工具已安装');
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'processImage') {
        // 处理图片请求
        console.log('处理图片:', request.data);
        sendResponse({ success: true });
    } else if (request.action === 'processVideo') {
        // 处理视频请求
        console.log('处理视频:', request.data);
        sendResponse({ success: true });
    }
});
