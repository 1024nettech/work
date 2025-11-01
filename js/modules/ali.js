import * as publics from "./public.js"
const url = location.href;
function img_rename() {
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
export { img_rename }
// End-40-2025.11.01.113418
