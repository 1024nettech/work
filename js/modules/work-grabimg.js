import { $ } from "./jquery.js";
import * as publics from "./public.js";
const url = location.href;
function rename() {
    function convertBgToImg(element) {
        // 将背景图转换为 img 元素的函数
        let backgroundImage = window.getComputedStyle(element).backgroundImage;
        if (backgroundImage && backgroundImage !== "none") {
            let urlMatch = backgroundImage.match(/url\(["']?(.*?)["']?\)/);
            if (urlMatch && urlMatch[1]) {
                let imageUrl = urlMatch[1];
                let img = document.createElement("img");
                img.src = imageUrl.match(/^([^\s]+?\.(jpg|jpeg|png|gif|bmp|webp))/i)[1] + '#1024down';
                img.style.display = "none";
                element.parentNode.insertBefore(img, element.nextSibling);
            }
        }
    }
    function copyToClipboard(selector, text) {
        // 使用 Clipboard API 复制文本到剪贴板
        $(selector).on('click', function () {
            let suffix = `<style>.product-content {max-width: 888px !important;}</style>`;
            text += suffix;
            navigator.clipboard.writeText(text).then(function () {
                $(selector).css("color", "green");
                setTimeout(() => {
                    $(selector).css("color", "");
                }, 500);
            }).catch(function (err) {
                console.error('复制失败: ', err);
            });
        });
    }
    if (url.includes("https://b2b.baidu.com/land?url=")) {
        const addedImages = new Set();
        // 将背景图转换为 img 元素的函数
        function convertBgToImg0(element) {
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
            return String(index + 1).padStart(2, "0");
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
                    convertBgToImg0(imgElement);
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
                    convertBgToImg0(element);
                });
                // 获取所有的 img 元素
                let images = document.querySelectorAll("img");
                // 遍历所有 img 元素并设置 alt 属性
                images.forEach((img, index) => {
                    img.alt = formatIndex(index); // 使用格式化后的 alt 值
                });
            }
        });
    }
    else if (url.includes("https://detail.1688.com/offer/")) {
        if (url.includes("version=0")) {
            // 旧版页面

            // 主图修改：修改 .detail-gallery-img 的图片, 添加类名
            $(".detail-gallery-img:not(.video-icon + .detail-gallery-img)").addClass("zhutux");

            // 规格图修改：修改 .sku-item-image 的 div 背景图片并添加隐藏 img 子元素, 添加类名
            $(".prop-img,.single-sku-img-pop").addClass("sku-item-image");
            $(".sku-item-image").each((index, skuItem) => {
                $(skuItem).html("");
                let bgUrl = $(skuItem).css("background").split('url("')[1].split('")')[0];
                let img = $("<img>").attr("src", bgUrl).css("display", "none").addClass("guigetux");
                $(skuItem).append(img);
            });

            // 详情图修改：修改 .content-detail 的图片, 添加类名
            $(".content-detail img").each((index, img) => {
                if ($(img).attr("data-lazyload-src")) {
                    img.src = $(img).attr("data-lazyload-src");
                }
            }).addClass("xiangqingtux");
        }
        else {
            // 新版页面

            // 主图修改：修改 .detail-gallery-img 的图片, 添加类名
            $(".od-gallery-img:not(.video-icon + .od-gallery-img), .detail-gallery-img").each((index, img) => {
                // img.src = img.src.split("_.webp")[0].split("_b")[0];
                img.src = img.src.match(/^([^\s]+?\.(jpg|jpeg|png|gif|bmp|webp))/i)[1];
            }).addClass("zhutux");

            // 规格图修改：修改 #skuSelection img 的图片, 添加类名
            $("#skuSelection img").each((index, img) => {
                // img.src = img.src.split("_sum")[0];
                img.src = img.src.match(/^([^\s]+?\.(jpg|jpeg|png|gif|bmp|webp))/i)[1];
            }).addClass("guigetux");

            // 详情图修改：修改 .html-description shadowRoot 的图片, 添加类名
            if ($(".html-description").length) {
                let $shadowHost = $(".html-description");
                let shadowRoot = $shadowHost[0].shadowRoot;
                let $detailElement = $(shadowRoot).find("#detail");
                $(".xiangqingtux").remove();
                $detailElement.find("img").each((index, img) => {
                    let $newImg = $("<img>").attr("src", img.src)
                        .addClass("xiangqingtux")
                        .css("display", "none");
                    $("body").append($newImg);
                });
            }
            $(".od-pc-detail-description img").each((index, img) => {
                img.src = img.src.match(/^([^\s]+?\.(jpg|jpeg|png|gif|bmp|webp))/i)[1];
            }).addClass("xiangqingtux");
        }
    }
    else if (url.includes("https://detail.tmall.com/item.htm") || url.includes("https://item.taobao.com/item.htm")) {
        let html = `${$("span[class^=mainTitle--]").text().trim()}|@@|${$("span[class^=mainTitle--]").text().trim()}|@@|${$("div[class^=highlightPrice--]").text().split("¥")[1].split("起")[0].trim()}|@@|件|@@|${$("input[class^=countValue--]").val()}|@@|10000|@@|${$("#content").html()}`;
        copyToClipboard("p[class^=tabDetailItemTitle--]", html);
        // 主图修改：修改 #picGalleryEle img[class^="thumbnailPic--"] 的图片, 添加类名
        $("#picGalleryEle img[class^='thumbnailPic--']").each((index, img) => {
            // img.src = img.src.split("_q50.jpg_.webp")[0];
            img.src = img.src.match(/^([^\s]+?\.(jpg|jpeg|png|gif|bmp|webp))/i)[1];
        }).addClass("zhutux");

        // 规格图修改：修改 #skuOptionsArea 的 img[class^="valueItemImg--"] 的图片, 添加类名
        $("#skuOptionsArea img[class^='valueItemImg--']").each((index, img) => {
            // img.src = img.src.split("_90x90q30")[0].split("_.webp")[0];
            img.src = img.src.match(/^([^\s]+?\.(jpg|jpeg|png|gif|bmp|webp))/i)[1];
        }).addClass("guigetux");

        // 详情图修改：修改 #content img 的图片, 添加类名
        $("#content img, #imageTextInfo-container img").each((index, img) => {
            if ($(img).attr("data-src")) {
                img.src = $(img).attr("data-src");
            }
        }).addClass("xiangqingtux");
    }
    else if (url.includes("https://item.jd.com/")) {
        let html = `${$(".sku-title-name").text().trim()}|@@|${$("meta[name=keywords]").attr("content").split(",")[0]}|@@|${$(".p-price").length ? $(".p-price span:last").text().trim() : $("#J_FinalPrice span:eq(1)").text().trim()}|@@|件|@@|${$("#buy-num").val()}|@@|10000|@@|${$("#J-detail-content,#detail-main").html()}`;
        copyToClipboard("#sx-product-detail>.module-title", html);
        // 主图修改：修改 #spec-list img 的图片, 添加类名
        $("#spec-list img").each((index, img) => {
            img.src = img.src.match(/^([^\s]+?\.(jpg|jpeg|png|gif|bmp|webp))/i)[1].replace("114x114", "720x720");
        }).addClass("zhutux");

        // 规格图修改：修改 #choose-attrs img 的图片, 添加类名
        $("#choose-attrs img").each((index, img) => {
            img.src = img.src.match(/^([^\s]+?\.(jpg|jpeg|png|gif|bmp|webp))/i)[1].replace("28x28", "720x720");
        }).addClass("guigetux");

        // 详情图修改：修改 #J-detail-content .ssd-module-wrap div.ssd-module 背景图片转图片
        $("#J-detail-content .ssd-module-wrap div.ssd-module").each((index, module) => {
            $(module).html("");
            let data_id = $(module).attr("data-id");
            let selector = `.ssd-module-wrap .${data_id}`;
            let bgUrl = $(selector).css("background-image").slice(4, -1).replaceAll('"', "");
            let img = $("<img>").attr("src", bgUrl).css("display", "none");
            $(module).html(img);
        });

        // 详情图修改：修改 #J-detail-content img 的图片, 添加类名
        $("#J-detail-content img").each((index, img) => {
            if ($(img).attr("data-lazyload")) {
                img.src = $(img).attr("data-lazyload");
            }
            // img.src = img.src.split(".avif")[0];
            img.src = img.src.match(/^([^\s]+?\.(jpg|jpeg|png|gif|bmp|webp))/i)[1];
        }).addClass("xiangqingtux");
    }
    else {
        if (!url.includes("https://b2b.baidu.com/land?url=")) {
            // 其他网站, 背景图转img
            $("*").each(function () {
                convertBgToImg(this);
            });
            if (!url.includes("sc_product.php")) {
                $("img").each(function (index) {
                    this.alt = index + 1;
                });
            }
            console.log("背景图转img完成……");
        }
    }
    $(".zhutux").each((index, img) => {
        let indexWithZero = index + 1 < 10 ? `0${index + 1}` : index + 1;
        img.alt = `A主图-${indexWithZero}`;
        img.src = img.src.split("#1024down")[0] + `#1024down-${img.alt}`;
    });

    $(".guigetux").each((index, img) => {
        let indexWithZero = index + 1 < 10 ? `0${index + 1}` : index + 1;
        img.alt = `B规格图-${indexWithZero}`;
        img.src = img.src.split("#1024down")[0] + `#1024down-${img.alt}`;
    });

    $(".xiangqingtux").each((index, img) => {
        let indexWithZero = index + 1 < 10 ? `0${index + 1}` : index + 1;
        img.alt = `C详情图-${indexWithZero}`;
        img.src = img.src.split("#1024down")[0] + `#1024down-${img.alt}`;
    });
}
export { rename };
// End-302-2026.01.07.085743
