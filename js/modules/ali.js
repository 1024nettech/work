import * as publics from "./public.js"
const url = location.href;
function img_rename() {
    if (url.includes("https://detail.1688.com/offer/")) {
        // 主图修改：修改 .detail-gallery-img 的图片 alt 和 src 后缀
        document.querySelectorAll(".detail-gallery-img:not(.video-icon + .detail-gallery-img)").forEach((img, index) => {
            img.alt = `主图-${index + 1}`;
            // 只在 src 中不包含 #1024down 时修改
            if (!img.src.includes("#1024down")) {
                img.src = img.src + "#1024down-" + img.alt; // 追加到 src 的末尾，并把 alt 值加到 #1024down 后面
            }
        });
        // 规格图修改：修改 .sku-item-image 的 div 背景图片并添加隐藏 img 子元素
        $(".prop-img,.single-sku-img-pop").addClass("sku-item-image");
        document.querySelectorAll(".sku-item-image").forEach((skuItem, index) => {
            // 检查是否已经存在 img 子元素且 src 中已包含 #1024down
            let existingImg = skuItem.querySelector("img");
            if (!existingImg || !existingImg.src.includes("#1024down")) {
                let bgUrl = window.getComputedStyle(skuItem).backgroundImage.slice(5, -2);
                let img = document.createElement("img");
                img.alt = `规格图-${index + 1}`;
                img.src = bgUrl + "#1024down-" + img.alt; // 追加到 src 的末尾，并把 alt 值加到 #1024down 后面
                img.style.display = "none";
                skuItem.appendChild(img);
            }
        });
        // 详情图修改：修改 .content-detail 内部图片的 alt 和 src 后缀
        document.querySelectorAll(".content-detail img").forEach((img, index) => {
            img.alt = `详情图-${index + 1}`;
            // 如果 img 有 data-lazyload-src 属性，则将其值赋给 src
            if (img.hasAttribute("data-lazyload-src")) {
                img.src = img.getAttribute("data-lazyload-src");
            }
            // 只在 src 中不包含 #1024down 时修改
            if (!img.src.includes("#1024down")) {
                img.src = img.src + "#1024down-" + img.alt; // 追加到 src 的末尾，并把 alt 值加到 #1024down 后面
            }
        });
    }
    else if (url.includes("https://detail.tmall.com/item.htm") || url.includes("https://item.taobao.com/item.htm")) {
        // 主图修改：修改 #picGalleryEle img[class^="thumbnailPic--"] 的图片 alt 和 src 后缀
        document.querySelectorAll("#picGalleryEle img[class^='thumbnailPic--']").forEach((img, index) => {
            img.alt = `主图-${index + 1}`;
            // 只在 src 中不包含 #1024down 时修改
            if (!img.src.includes("#1024down")) {
                img.src = img.src.replace("_q50.jpg_.webp", "") + "#1024down-" + img.alt; // 追加到 src 的末尾，并把 alt 值加到 #1024down 后面
            }
        });
        // 规格图修改：修改 #skuOptionsArea 的 img[class^="valueItemImg--"] 的图片 alt 和 src 后缀
        document.querySelectorAll("#skuOptionsArea img[class^='valueItemImg--']").forEach((img, index) => {
            img.alt = `规格图-${index + 1}`;
            // 只在 src 中不包含 #1024down 时修改
            if (!img.src.includes("#1024down")) {
                img.src = img.src.replace(/_90x90q30.*$/g, "") + "#1024down-" + img.alt; // 追加到 src 的末尾，并把 alt 值加到 #1024down 后面
            }
        });
        // 详情图修改：修改 #content 内部图片的 alt 和 src 后缀
        document.querySelectorAll("#content img").forEach((img, index) => {
            img.alt = `详情图-${index + 1}`;
            // 如果 img 有 data-src 属性，则将其值赋给 src
            if (img.hasAttribute("data-src")) {
                img.src = img.getAttribute("data-src");
            }
            // 只在 src 中不包含 #1024down 时修改
            if (!img.src.includes("#1024down")) {
                img.src = img.src + "#1024down-" + img.alt; // 追加到 src 的末尾，并把 alt 值加到 #1024down 后面
            }
        });
    }
    else if (url.includes("https://item.jd.com/")) {
        // 主图修改：修改 #spec-list img 的图片 alt 和 src 后缀
        document.querySelectorAll("#spec-list img").forEach((img, index) => {
            img.alt = `主图-${index + 1}`;
            // 只在 src 中不包含 #1024down 时修改
            if (!img.src.includes("#1024down")) {
                img.src = img.src.replace("114x114", "720x720") + "#1024down-" + img.alt; // 追加到 src 的末尾，并把 alt 值加到 #1024down 后面
            }
        });
        // 规格图修改：修改 #choose-attrs img 的图片 alt 和 src 后缀
        document.querySelectorAll("#choose-attrs img").forEach((img, index) => {
            img.alt = `规格图-${index + 1}`;
            // 只在 src 中不包含 #1024down 时修改
            if (!img.src.includes("#1024down")) {
                img.src = img.src.replace("28x28", "720x720") + "#1024down-" + img.alt; // 追加到 src 的末尾，并把 alt 值加到 #1024down 后面
            }
        });
        // 详情图修改：修改 #J-detail-content div.ssd-module 内部图片的 alt 和 src 后缀
        document.querySelectorAll("#J-detail-content div.ssd-module").forEach((module, index) => {
            const bgImage = getComputedStyle(module).backgroundImage;
            if (bgImage && bgImage !== 'none') {
                const bgUrl = bgImage.slice(4, -1).replace(/"/g, "");
                const img = document.createElement("img");
                img.style.display = "none";
                img.alt = `详情图-${index + 1}`;
                img.src = bgUrl;
                if (!img.src.includes("#1024down")) {
                    img.src = img.src + "#1024down-" + img.alt;
                }
                module.appendChild(img);
            }
        });
        // 详情图修改：修改 #J-detail-content img 内部图片的 alt 和 src 后缀
        document.querySelectorAll("#J-detail-content img").forEach((img, index) => {
            img.alt = `详情图-${index + 1}`;
            // 只在 src 中不包含 #1024down 时修改
            if (!img.src.includes("#1024down")) {
                img.src = img.src + "#1024down-" + img.alt; // 追加到 src 的末尾，并把 alt 值加到 #1024down 后面
            }
        });
    }
}
export { img_rename }
// End-113-2025.11.18.130524
