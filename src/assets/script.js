import { defaultConfig } from '../config';
import { reactive } from 'vue';

const loadedImages = new Map();
export const state = reactive({
    bgImageUrl: null,
    squareImageUrl: null,
    bgColor: '#ffffff',
    textColor: '#eeeeee',
    watermarkColor: '#dddddd',
    iconColor: '#eeeeee',
    rotation: 0,
    shadowColor: '#646464',
    shadowBlur: 120,
    shadowOffsetX: 1,
    shadowOffsetY: 1,
    shadowStrength: 60,
    watermark: defaultConfig.watermark,
    textSize: 200,
    lineHeight: 1,
    text3D: 0,
    squareSize: 300,
    text: defaultConfig.text,
    bgBlur: 3,
    iconBgSize: 0,
    selectedFont: defaultConfig.fontFamily,
    isFontMenuOpen: false,
    hasMultipleLines: false,
    // 画布缩放相关
    canvasScale: 1,
    baseWidth: 1000,
    baseHeight: 500,
    // 图标拖拽相关状态
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0,
    iconOffsetX: 0,
    iconOffsetY: 0
});

export let canvas = null;
export let ctx = null;

const createCanvas = (width, height) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { 
        alpha: true, // 启用透明度支持
        desynchronized: false,
        colorSpace: 'srgb'
    });
    
    // 设置高质量渲染
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    return { canvas, ctx };
};

export const { canvas: bgCanvas, ctx: bgCtx } = createCanvas(1000, 500);
export const { canvas: textCanvas, ctx: textCtx } = createCanvas(1000, 500);
export const { canvas: watermarkCanvas, ctx: watermarkCtx } = createCanvas(1000, 500);
export const { canvas: squareCanvas, ctx: squareCtx } = createCanvas(1000, 500);

export function updatePreview(type, event) {
    const updateFunctions = {
        bg: updateBackgroundImage,
        bgColor: updateBackgroundColor,
        textColor: updateTextColor,
        watermarkColor: updateWatermarkColor,
        square: updateSquareImage,
        rotation: updateRotation,
        text: updateText,
        watermark: updateWatermark,
        textSize: updateTextSize,
        squareSize: updateSquareSize,
        bgBlur: updateBgBlur,
        iconColor: updateIconColor,
        iconBgSize: updateIconBgSize,
        font: updateFont,
        lineHeight: drawText,
        text3D: updateText3D,
        shadowColor: updateShadowColor,
        shadowStrength: updateShadowStrength,
        resize: handleCanvasResize
    };
    updateFunctions[type] && updateFunctions[type](event);
}

function handleCanvasResize() {
    // 重置图标偏移量
    state.iconOffsetX = 0;
    state.iconOffsetY = 0;
    
    // 计算缩放比例
    if (canvas) {
        state.canvasScale = Math.min(canvas.width / state.baseWidth, canvas.height / state.baseHeight);
        
        // 更新辅助画布尺寸以匹配主画布
        bgCanvas.width = canvas.width;
        bgCanvas.height = canvas.height;
        textCanvas.width = canvas.width;
        textCanvas.height = canvas.height;
        watermarkCanvas.width = canvas.width;
        watermarkCanvas.height = canvas.height;
        squareCanvas.width = canvas.width;
        squareCanvas.height = canvas.height;
    }
    
    // 重新绘制所有内容
    drawBackground();
    drawText();
    drawWatermark();
    drawSquareImage();
}

// 导出画布对象供外部使用
export function updateCanvasSizes(width, height) {
    if (bgCanvas) {
        bgCanvas.width = width;
        bgCanvas.height = height;
    }
    if (textCanvas) {
        textCanvas.width = width;
        textCanvas.height = height;
    }
    if (watermarkCanvas) {
        watermarkCanvas.width = width;
        watermarkCanvas.height = height;
    }
    if (squareCanvas) {
        squareCanvas.width = width;
        squareCanvas.height = height;
    }
}

export function updateText3D(event) {
    state.text3D = event.target.value;
    drawText();
}

export function updateFont(event) {
    state.selectedFont = event.target.value;
    drawText();
    drawWatermark();
}

export function updateBackgroundImage(event) {
    const bgImage = event.target.files[0];
    if (bgImage) {
        loadImage(bgImage, (url) => {
            state.bgImageUrl = url;
            drawBackground();
        });
    }
}

export function updateBackgroundColor(event) {
    state.bgColor = event.target.value;
    state.bgImageUrl = null;
    drawBackground();
}

export function updateTextColor(event) {
    state.textColor = event.target.value;
    drawText();
}

export function updateWatermarkColor(event) {
    state.watermarkColor = event.target.value;
    drawWatermark();
}

export function updateSquareImage(event) {
    const squareImage = event.target.files[0];
    if (squareImage) {
        loadImage(squareImage, (url) => {
            state.squareImageUrl = url;
            drawSquareImage();
        });
    }
}

export function updateRotation(event) {
    state.rotation = event.target.value;
    drawSquareImage();
}

export function updateText(event) {
    state.text = event.target.value || defaultConfig.text;
    state.hasMultipleLines = state.text.includes('\n');
    drawText();
}

export function updateWatermark(event) {
    state.watermark = event.target.value;
    drawWatermark();
}

export function updateTextSize(event) {
    state.textSize = event.target.value;
    drawText();
}

export function updateSquareSize(event) {
    state.squareSize = event.target.value;
    drawSquareImage();
}

// 防抖函数
let bgBlurTimeout = null;

export function updateBgBlur(event) {
    state.bgBlur = event.target.value;
    
    // 清除之前的定时器
    if (bgBlurTimeout) {
        clearTimeout(bgBlurTimeout);
    }
    
    // 设置新的定时器，延迟执行重绘
    bgBlurTimeout = setTimeout(() => {
        drawBackground();
    }, 16); // 约60fps的更新频率
}

export function updateIconColor(event) {
    state.iconColor = event.target.value;
    drawSquareImage();
}

export function updateIconBgSize(event) {
    state.iconBgSize = Number(event.target.value);
    drawSquareImage();
}

export function updateShadowColor(event) {
    state.shadowColor = event.target.value;
    drawSquareImage();
}

export function updateShadowStrength(event) {
    const strength = state.shadowStrength;
    state.shadowBlur = strength * 2;
    state.shadowOffsetX = 0;
    state.shadowOffsetY = 0;
    drawSquareImage();
}

function loadImage(file, callback) {
    if (!loadedImages.has(file)) {
        const reader = new FileReader();
        reader.onload = (e) => {
            loadedImages.set(file, e.target.result);
            callback(e.target.result);
        };
        reader.readAsDataURL(file);
    } else {
        callback(loadedImages.get(file));
    }
}

export function drawBackground() {
    // 清除背景画布，保持透明
    bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
    
    // 设置高质量渲染
    bgCtx.imageSmoothingEnabled = true;
    bgCtx.imageSmoothingQuality = 'high';

    if (state.bgImageUrl) {
        const img = new Image();
        img.onload = () => {
            // 创建高分辨率临时画布以保持图片清晰度
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d', { alpha: true });
            
            // 使用更高的分辨率倍数，特别是对于小尺寸画布
            const resolutionScale = Math.max(3, Math.min(8, 1200 / Math.min(bgCanvas.width, bgCanvas.height)));
            tempCanvas.width = bgCanvas.width * resolutionScale;
            tempCanvas.height = bgCanvas.height * resolutionScale;
            
            // 设置高质量渲染
            tempCtx.imageSmoothingEnabled = true;
            tempCtx.imageSmoothingQuality = 'high';
            
            // 计算缩放比例
            const scaleX = tempCanvas.width / img.width;
            const scaleY = tempCanvas.height / img.height;
            const scale = Math.max(scaleX, scaleY);
            const width = img.width * scale;
            const height = img.height * scale;
            const x = (tempCanvas.width - width) / 2;
            const y = (tempCanvas.height - height) / 2;

            // 应用模糊效果（按比例调整）
            if (state.bgBlur > 0) {
                tempCtx.filter = `blur(${state.bgBlur * resolutionScale}px)`;
            }
            
            // 在高分辨率画布上绘制
            tempCtx.drawImage(img, x, y, width, height);
            tempCtx.filter = 'none';
            
            // 将高分辨率图像缩放到目标画布
            bgCtx.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, 0, 0, bgCanvas.width, bgCanvas.height);
            
            composeCanvases();
        };
        img.src = state.bgImageUrl;
    } else {
        // 只有当背景色不是透明时才填充
        if (state.bgColor && state.bgColor !== 'transparent') {
            bgCtx.fillStyle = state.bgColor;
            bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
        }
        composeCanvases();
    }
}

export function drawSquareImage() {
    squareCtx.clearRect(0, 0, squareCanvas.width, squareCanvas.height);
    
    // 设置高质量渲染
    squareCtx.imageSmoothingEnabled = true;
    squareCtx.imageSmoothingQuality = 'high';
    
    if (state.squareImageUrl) {
        const squareImg = new Image();
        squareImg.onload = () => {
            const totalSize = state.squareSize * state.canvasScale;
            const borderWidth = 20 * state.canvasScale;
            const size = totalSize - 2 * borderWidth;
            const x = (squareCanvas.width - totalSize) / 2;
            const y = (squareCanvas.height - totalSize) / 2;
            const radius = 30 * state.canvasScale;

            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = totalSize;
            tempCanvas.height = totalSize;
            const tempCtx = tempCanvas.getContext('2d');
            
            // 设置临时画布的高质量渲染
            tempCtx.imageSmoothingEnabled = true;
            tempCtx.imageSmoothingQuality = 'high';

            // 绘制背景
            if (state.iconBgSize > 0) {
                const bgPadding = state.iconBgSize;
                tempCtx.fillStyle = state.iconColor;
                tempCtx.beginPath();
                tempCtx.moveTo(radius + borderWidth - bgPadding, borderWidth - bgPadding);
                tempCtx.arcTo(
                    totalSize - borderWidth + bgPadding, 
                    borderWidth - bgPadding, 
                    totalSize - borderWidth + bgPadding, 
                    radius + borderWidth - bgPadding, 
                    radius
                );
                tempCtx.arcTo(
                    totalSize - borderWidth + bgPadding, 
                    totalSize - borderWidth + bgPadding, 
                    totalSize - radius - borderWidth + bgPadding, 
                    totalSize - borderWidth + bgPadding, 
                    radius
                );
                tempCtx.arcTo(
                    borderWidth - bgPadding, 
                    totalSize - borderWidth + bgPadding, 
                    borderWidth - bgPadding, 
                    totalSize - radius - borderWidth + bgPadding, 
                    radius
                );
                tempCtx.arcTo(
                    borderWidth - bgPadding, 
                    borderWidth - bgPadding, 
                    radius + borderWidth - bgPadding, 
                    borderWidth - bgPadding, 
                    radius
                );
                tempCtx.closePath();
                tempCtx.fill();
            }

            tempCtx.save();
            tempCtx.beginPath();
            tempCtx.moveTo(radius + borderWidth, borderWidth);
            tempCtx.arcTo(totalSize - borderWidth, borderWidth, totalSize - borderWidth, radius + borderWidth, radius);
            tempCtx.arcTo(totalSize - borderWidth, totalSize - borderWidth, totalSize - radius - borderWidth, totalSize - borderWidth, radius);
            tempCtx.arcTo(borderWidth, totalSize - borderWidth, borderWidth, totalSize - radius - borderWidth, radius);
            tempCtx.arcTo(borderWidth, borderWidth, radius + borderWidth, borderWidth, radius);
            tempCtx.closePath();
            tempCtx.clip();

            // 计算图像的缩放比例
            const imgAspectRatio = squareImg.width / squareImg.height;
            const containerAspectRatio = size / size; // 因为容器是正方形，所以宽高比为1

            let scaledWidth, scaledHeight;
            if (imgAspectRatio > containerAspectRatio) {
                // 图像比容器宽，按宽度缩放
                scaledWidth = size;
                scaledHeight = size / imgAspectRatio;
            } else {
                // 图像比容器高，按高度缩放
                scaledWidth = size * imgAspectRatio;
                scaledHeight = size;
            }

            // 计算图像在容器中的偏移量，使其居中
            const imgOffsetX = (size - scaledWidth) / 2;
            const imgOffsetY = (size - scaledHeight) / 2;

            tempCtx.drawImage(squareImg, borderWidth + imgOffsetX, borderWidth + imgOffsetY, scaledWidth, scaledHeight);
            tempCtx.restore();

            squareCtx.save();
            squareCtx.shadowColor = state.shadowColor;
            squareCtx.shadowBlur = state.shadowBlur * state.canvasScale;
            squareCtx.shadowOffsetX = state.shadowOffsetX * state.canvasScale;
            squareCtx.shadowOffsetY = state.shadowOffsetY * state.canvasScale;

            const iconX = x + state.iconOffsetX;
            const iconY = y + state.iconOffsetY;
            
            squareCtx.translate(iconX + totalSize / 2, iconY + totalSize / 2);
            squareCtx.rotate(state.rotation * Math.PI / 180);
            squareCtx.translate(-(iconX + totalSize / 2), -(iconY + totalSize / 2));

            squareCtx.drawImage(tempCanvas, iconX, iconY, totalSize, totalSize);
            squareCtx.restore();

            composeCanvases();
        };
        squareImg.src = state.squareImageUrl;
    } else {
        composeCanvases();
    }
}

function getHtmlFontStyles() {
    const htmlElement = document.documentElement;
    const computedStyle = getComputedStyle(htmlElement);
    const fontFamily = computedStyle.fontFamily;
    return { fontFamily };
}

export function drawText() {
    textCtx.clearRect(0, 0, textCanvas.width, textCanvas.height);
    
    // 设置高质量文字渲染
    textCtx.imageSmoothingEnabled = true;
    textCtx.imageSmoothingQuality = 'high';
    textCtx.textRenderingOptimization = 'optimizeQuality';
    
    const { fontFamily } = getHtmlFontStyles();
    const font = state.selectedFont ? `${state.selectedFont}, ${fontFamily}` : fontFamily;
    const scaledTextSize = state.textSize * state.canvasScale;
    textCtx.font = `600 ${scaledTextSize}px ${font}`;
    textCtx.fillStyle = state.textColor;
    textCtx.textAlign = 'center';
    textCtx.textBaseline = 'middle';

    if (state.text3D > 0) {
        textCtx.shadowColor = 'rgba(0, 0, 0, .4)';
        textCtx.shadowBlur = state.text3D * 0.5 * state.canvasScale;
        textCtx.shadowOffsetX = state.text3D * state.canvasScale;
        textCtx.shadowOffsetY = state.text3D * state.canvasScale;
    } else {
        textCtx.shadowColor = 'transparent';
        textCtx.shadowBlur = 0;
        textCtx.shadowOffsetX = 0;
        textCtx.shadowOffsetY = 0;
    }

    // 处理多行文本
    const lines = state.text.split('\n');
    const lineHeight = scaledTextSize * state.lineHeight;
    const totalHeight = lineHeight * lines.length;
    const startY = (textCanvas.height - totalHeight) / 2 + lineHeight / 2;

    lines.forEach((line, index) => {
        const y = startY + index * lineHeight;
        textCtx.fillText(line, textCanvas.width / 2, y);
    });

    composeCanvases();
}

export function drawWatermark() {
    watermarkCtx.clearRect(0, 0, watermarkCanvas.width, watermarkCanvas.height);
    
    // 设置高质量文字渲染
    watermarkCtx.imageSmoothingEnabled = true;
    watermarkCtx.imageSmoothingQuality = 'high';
    watermarkCtx.textRenderingOptimization = 'optimizeQuality';
    
    const { fontFamily } = getHtmlFontStyles();
    const font = state.selectedFont ? `${state.selectedFont}, ${fontFamily}` : fontFamily;
    const scaledFontSize = 14 * state.canvasScale;
    const scaledPadding = 20 * state.canvasScale;
    watermarkCtx.font = `italic ${scaledFontSize}px ${font}`;
    watermarkCtx.fillStyle = state.watermarkColor;
    watermarkCtx.textAlign = 'right';
    watermarkCtx.fillText(state.watermark, watermarkCanvas.width - scaledPadding, watermarkCanvas.height - scaledPadding);
    composeCanvases();
}

export function composeCanvases() {
    if (ctx) {
        // 保存当前的合成操作
        ctx.save();
        
        // 清除画布，保持透明
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 设置高质量渲染
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // 按顺序绘制各层
        ctx.drawImage(bgCanvas, 0, 0);
        ctx.drawImage(textCanvas, 0, 0);
        ctx.drawImage(squareCanvas, 0, 0);
        ctx.drawImage(watermarkCanvas, 0, 0);
        
        // 恢复设置
        ctx.restore();
    }
}

export function saveWebp() {
    if (canvas) {
        canvas.toBlob(blob => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'Canvas-Ruom.webp';
            link.click();
            URL.revokeObjectURL(link.href);
        }, 'image/webp');
    }
}

// 图标拖拽功能
function setupIconDragListeners() {
    if (!canvas) return;
    
    canvas.addEventListener('mousedown', handleIconMouseDown);
    canvas.addEventListener('mousemove', handleIconMouseMove);
    canvas.addEventListener('mouseup', handleIconMouseUp);
    canvas.addEventListener('mouseleave', handleIconMouseUp);
    
    // 触摸事件支持
    canvas.addEventListener('touchstart', handleIconTouchStart);
    canvas.addEventListener('touchmove', handleIconTouchMove);
    canvas.addEventListener('touchend', handleIconTouchEnd);
}

function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    // 计算画布的实际缩放比例
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
    };
}

function getTouchPos(e) {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    // 计算画布的实际缩放比例
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY
    };
}

function isPointInIcon(x, y) {
    if (!state.squareImageUrl) return false;
    
    // 使用与drawSquareImage完全相同的计算逻辑
    const totalSize = state.squareSize * state.canvasScale;
    const baseX = (canvas.width - totalSize) / 2;
    const baseY = (canvas.height - totalSize) / 2;
    const iconX = baseX + state.iconOffsetX;
    const iconY = baseY + state.iconOffsetY;
    
    return x >= iconX && x <= iconX + totalSize &&
           y >= iconY && y <= iconY + totalSize;
}

function handleIconMouseDown(e) {
    const pos = getMousePos(e);
    
    if (isPointInIcon(pos.x, pos.y)) {
        state.isDragging = true;
        state.dragStartX = pos.x;
        state.dragStartY = pos.y;
        canvas.style.cursor = 'grabbing';
        e.preventDefault();
    }
}

function handleIconMouseMove(e) {
    const pos = getMousePos(e);
    
    if (!state.isDragging) {
        // 显示拖拽提示
        if (isPointInIcon(pos.x, pos.y) && state.squareImageUrl) {
            canvas.style.cursor = 'grab';
        } else {
            canvas.style.cursor = 'default';
        }
        return;
    }
    
    const deltaX = pos.x - state.dragStartX;
    const deltaY = pos.y - state.dragStartY;
    
    // 更新图标偏移量，限制在画布范围内
    const totalSize = state.squareSize * state.canvasScale;
    const baseX = (canvas.width - totalSize) / 2;
    const baseY = (canvas.height - totalSize) / 2;
    
    // 计算允许的偏移范围
    const maxOffsetX = canvas.width - baseX - totalSize;
    const maxOffsetY = canvas.height - baseY - totalSize;
    const minOffsetX = -baseX;
    const minOffsetY = -baseY;
    
    state.iconOffsetX = Math.max(minOffsetX, Math.min(maxOffsetX, state.iconOffsetX + deltaX));
    state.iconOffsetY = Math.max(minOffsetY, Math.min(maxOffsetY, state.iconOffsetY + deltaY));
    
    state.dragStartX = pos.x;
    state.dragStartY = pos.y;
    
    // 重新绘制图标
    drawSquareImage();
    e.preventDefault();
}

function handleIconMouseUp() {
    state.isDragging = false;
    canvas.style.cursor = 'default';
}

function handleIconTouchStart(e) {
    e.preventDefault();
    const pos = getTouchPos(e);
    
    if (isPointInIcon(pos.x, pos.y)) {
        state.isDragging = true;
        state.dragStartX = pos.x;
        state.dragStartY = pos.y;
    }
}

function handleIconTouchMove(e) {
    if (!state.isDragging) return;
    
    e.preventDefault();
    const pos = getTouchPos(e);
    const deltaX = pos.x - state.dragStartX;
    const deltaY = pos.y - state.dragStartY;
    
    const totalSize = state.squareSize * state.canvasScale;
    const maxOffsetX = canvas.width / 2 - totalSize / 2;
    const maxOffsetY = canvas.height / 2 - totalSize / 2;
    const minOffsetX = -canvas.width / 2 + totalSize / 2;
    const minOffsetY = -canvas.height / 2 + totalSize / 2;
    
    state.iconOffsetX = Math.max(minOffsetX, Math.min(maxOffsetX, state.iconOffsetX + deltaX));
    state.iconOffsetY = Math.max(minOffsetY, Math.min(maxOffsetY, state.iconOffsetY + deltaY));
    
    state.dragStartX = pos.x;
    state.dragStartY = pos.y;
    
    drawSquareImage();
}

function handleIconTouchEnd(e) {
    e.preventDefault();
    state.isDragging = false;
}

export function initialize() {
    canvas = document.getElementById('canvasPreview');
    if (canvas) {
        ctx = canvas.getContext('2d', { 
            alpha: true, // 启用透明度支持
            desynchronized: false,
            colorSpace: 'srgb'
        });
        
        // 设置画布的高质量渲染
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // 设置图标拖拽监听器
        setupIconDragListeners();
        
        drawBackground();
        drawText();
        drawWatermark();
    } else {
        console.error('Canvas element not found');
    }
}

// 拖拽功能实现
export function initializeDragEvents() {
    if (!canvas) return;
    
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);
    
    // 触摸事件支持
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', handleTouchEnd);
}



function getDragTarget(x, y) {
    // 检查是否点击在图标区域
    if (state.squareImageUrl) {
        const iconCenterX = canvas.width / 2;
        const iconCenterY = canvas.height / 2;
        const iconRadius = state.squareSize / 2;
        
        const distance = Math.sqrt(
            Math.pow(x - iconCenterX - state.imageOffsetX, 2) + 
            Math.pow(y - iconCenterY - state.imageOffsetY, 2)
        );
        
        if (distance <= iconRadius) {
            return 'square';
        }
    }
    
    // 否则认为是背景
    return 'bg';
}

function handleMouseDown(event) {
    const pos = getMousePos(event);
    state.dragTarget = getDragTarget(pos.x, pos.y);
    state.isDragging = true;
    state.dragStartX = pos.x;
    state.dragStartY = pos.y;
    
    canvas.style.cursor = 'grabbing';
    event.preventDefault();
}

function handleMouseMove(event) {
    if (!state.isDragging) {
        // 显示拖拽提示
        const pos = getMousePos(event);
        const target = getDragTarget(pos.x, pos.y);
        canvas.style.cursor = target === 'square' && state.squareImageUrl ? 'grab' : 'move';
        return;
    }
    
    const pos = getMousePos(event);
    const deltaX = pos.x - state.dragStartX;
    const deltaY = pos.y - state.dragStartY;
    
    if (state.dragTarget === 'square' && state.squareImageUrl) {
        // 拖拽图标
        const newOffsetX = state.imageOffsetX + deltaX;
        const newOffsetY = state.imageOffsetY + deltaY;
        
        // 边界检测
        const iconRadius = state.squareSize / 2;
        const maxOffsetX = canvas.width / 2 - iconRadius;
        const maxOffsetY = canvas.height / 2 - iconRadius;
        const minOffsetX = -canvas.width / 2 + iconRadius;
        const minOffsetY = -canvas.height / 2 + iconRadius;
        
        state.imageOffsetX = Math.max(minOffsetX, Math.min(maxOffsetX, newOffsetX));
        state.imageOffsetY = Math.max(minOffsetY, Math.min(maxOffsetY, newOffsetY));
        
        drawSquareImage();
    } else if (state.dragTarget === 'bg' && state.bgImageUrl) {
        // 拖拽背景图片
        state.imageOffsetX += deltaX;
        state.imageOffsetY += deltaY;
        drawBackground();
    }
    
    state.dragStartX = pos.x;
    state.dragStartY = pos.y;
    event.preventDefault();
}

function handleMouseUp(event) {
    state.isDragging = false;
    state.dragTarget = null;
    canvas.style.cursor = 'default';
    event.preventDefault();
}

// 触摸事件处理
function handleTouchStart(event) {
    const pos = getTouchPos(event);
    state.dragTarget = getDragTarget(pos.x, pos.y);
    state.isDragging = true;
    state.dragStartX = pos.x;
    state.dragStartY = pos.y;
    event.preventDefault();
}

function handleTouchMove(event) {
    if (!state.isDragging) return;
    
    const pos = getTouchPos(event);
    const deltaX = pos.x - state.dragStartX;
    const deltaY = pos.y - state.dragStartY;
    
    if (state.dragTarget === 'square' && state.squareImageUrl) {
        const newOffsetX = state.imageOffsetX + deltaX;
        const newOffsetY = state.imageOffsetY + deltaY;
        
        const iconRadius = state.squareSize / 2;
        const maxOffsetX = canvas.width / 2 - iconRadius;
        const maxOffsetY = canvas.height / 2 - iconRadius;
        const minOffsetX = -canvas.width / 2 + iconRadius;
        const minOffsetY = -canvas.height / 2 + iconRadius;
        
        state.imageOffsetX = Math.max(minOffsetX, Math.min(maxOffsetX, newOffsetX));
        state.imageOffsetY = Math.max(minOffsetY, Math.min(maxOffsetY, newOffsetY));
        
        drawSquareImage();
    } else if (state.dragTarget === 'bg' && state.bgImageUrl) {
        state.imageOffsetX += deltaX;
        state.imageOffsetY += deltaY;
        drawBackground();
    }
    
    state.dragStartX = pos.x;
    state.dragStartY = pos.y;
    event.preventDefault();
}

function handleTouchEnd(event) {
    state.isDragging = false;
    state.dragTarget = null;
    event.preventDefault();
}
