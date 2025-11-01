import * as publics from "./public.js"
const url = location.href;
const addedImages = new Set();
// 将背景图转换为 img 元素的函数
function convertBgToImg(element) {
    let backgroundImage = window.getComputedStyle(element).backgroundImage;
    if (backgroundImage && backgroundImage !== "none") {
        if (url.includes("https://b2b.baidu.com")) {
            // 爱采购主图, 替换背景图像的 URL 中的 &fmt=auto? 为 &fmt=JPEG?
            backgroundImage = backgroundImage.replace(/&fmt=auto\?/, "&fmt=JPEG?");
        }
        // 提取背景图像的 URL 部分
        let urlMatch = backgroundImage.match(/url\(["']?(.*?)["']?\)/);
        if (urlMatch && urlMatch[1]) {
            let imageUrl = urlMatch[1];
            // 如果此背景图尚未转换为 img 元素
            if (!addedImages.has(imageUrl)) {
                // 创建一个新的 img 元素
                let img = document.createElement("img");
                img.src = imageUrl;
                img.style.display = "none"; // 隐藏新建的 img 元素（而不是原始元素）
                // 将 img 元素插入到原始元素的后面作为兄弟元素
                element.parentNode.insertBefore(img, element.nextSibling);
                // 将该背景图对应的 img 元素加入到已添加集合中
                addedImages.add(imageUrl);
            }
        }
    }
}
// 格式化为两位数
function formatIndex(index) {
    return String(index + 1).padStart(2, '0');
}
if (url.includes("https://b2b.baidu.com")) {
    let style = `
        .thumb-play+div {
            background-color: #fff;
            background-position: 50% 50%;
            background-repeat: no-repeat;
            background-size: cover;
            bottom: 0;
            height: 100%;
            left: 0;
            position: absolute;
            right: 0;
            top: 0;
        }
        #videox {
            width: 100%;
        }
        .video-container {
            display: flex;
            justify-content: center;
            align-items: center;
        }
        `;
    let styleElement = document.createElement("style");
    styleElement.id = "stylex";
    styleElement.innerHTML = style;
    document.head.appendChild(styleElement);
    let firstThumbItem = document.querySelector(".thumb-item:first-child");
    let videoContainer = document.querySelector(".video-container");
    let video = document.querySelector(".album video");
    if (video) {
        if (firstThumbItem) {
            videoContainer.addEventListener("mouseenter", function () {
                if (videoContainer && !document.querySelector("#videox")) {
                    videoContainer.innerHTML = `<video id="videox" autoplay controls muted loop src="${video.src}"></video>`;
                }
            });
            firstThumbItem.addEventListener("click", function () {
                window.open(video.src);
            });
        }
    }
    // 修改页面标题
    let pageTitle = document.querySelector("title");
    if (pageTitle) {
        pageTitle.textContent = publics.generateTimestamp(1) + "-" + pageTitle.textContent;
    }
}
document.addEventListener("mouseleave", function () {
    if (url.includes("https://b2b.baidu.com")) {
        // 1. 移除 .thumb-play + div 的 class 值
        let thumbPlayDiv = document.querySelector(".thumb-play+div");
        if (thumbPlayDiv) {
            thumbPlayDiv.className = "";  // 移除 class
        }
        // 2. 检查并将 .thumb-item .img 的背景图像转换为 img 元素
        let thumbItemImgs = document.querySelectorAll(".thumb-item .img");
        thumbItemImgs.forEach(function (imgElement) {
            convertBgToImg(imgElement);
        });
        // 3. 处理 .thumb-item 中的 img 元素, 赋值 alt 和修改 src
        let thumbItemImages = document.querySelectorAll(".thumb-item img");
        thumbItemImages.forEach(function (imgElement, index) {
            imgElement.alt = `导读图-${formatIndex(index)}`; // 使用格式化后的 alt 值
            let imgSrc = imgElement.src;
            if (!imgSrc.endsWith("#1024")) {
                imgElement.src = imgSrc + "#1024";
            }
        });
        // 4. 修改 .questionable-detail 中的 img, alt 赋值为“详情图-01”、“详情图-02”等
        let questionableDetailImages = document.querySelectorAll(".questionable-detail img");
        questionableDetailImages.forEach(function (imgElement, index) {
            imgElement.alt = `详情图-${formatIndex(index)}`; // 使用格式化后的 alt 值
            let imgSrc = imgElement.src;
            if (!imgSrc.endsWith("#1024")) {
                imgElement.src = imgSrc + "#1024";
            }
        });
    } else {
        // 获取所有具有背景图的元素
        let allElements = document.querySelectorAll("*");
        allElements.forEach(function (element) {
            convertBgToImg(element);
        });
        // 获取所有的 img 元素
        let images = document.querySelectorAll('img');
        // 遍历所有 img 元素并设置 alt 属性
        images.forEach((img, index) => {
            img.alt = formatIndex(index); // 使用格式化后的 alt 值
        });
    }
});
// End-126-2025.11.01.113500
