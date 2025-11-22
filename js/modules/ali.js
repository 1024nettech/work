import { $ } from "./jquery.js";
import * as publics from "./public.js";
const url = location.href;
function img_rename() {
    if (url.includes("https://detail.1688.com/offer/")) {

        // 主图修改：修改 .detail-gallery-img 的图片, 添加类名
        $(".od-gallery-img:not(.video-icon + .od-gallery-img)").addClass("zhutux"); // 新版页面
        $(".detail-gallery-img:not(.video-icon + .detail-gallery-img)").addClass("zhutux"); // 旧版页面

        // 规格图修改：修改 .sku-item-image 的 div 背景图片并添加隐藏 img 子元素, 添加类名
        $(".prop-img,.single-sku-img-pop").addClass("sku-item-image");
        $(".sku-item-image").each((index, skuItem) => {
            if ($(skuItem).find("img").length === 0) {
                let bgUrl = $(skuItem).css("background").split('url("')[1].split('")')[0];
                let img = $("<img>").attr("src", bgUrl).css("display", "none").addClass("guigetux");
                $(skuItem).append(img);
            }
        });

        // 详情图修改：修改 .content-detail 的图片, 添加类名
        $(".content-detail img").each((index, img) => {
            if ($(img).attr("data-lazyload-src")) {
                img.src = $(img).attr("data-lazyload-src");
            }
        }).addClass("xiangqingtux");


// 获取包含 shadow DOM 的宿主元素
let $shadowHost = $(".html-description"); 

// 获取 shadowRoot (open 类型)
let shadowRoot = $shadowHost[0].shadowRoot;

// 获取 #detail 元素
let $detailElement = $(shadowRoot).find("#detail");

// 获取 detailElement 中的所有 img 元素
$detailElement.find("img").each((index, img) => {
    // 设置 alt 属性，添加前导零（如果需要）
    let indexWithZero = index + 1 < 10 ? `0${index + 1}` : index + 1;
    $(img).attr("alt", `C详情图-${indexWithZero}`);

    // 修改 img 的 src 属性，确保去除旧的 #1024down，并添加新的后缀
    let newSrc = $(img).attr("src").split("#1024down")[0] + `#1024down-${indexWithZero}`;
    $(img).attr("src", newSrc);

    // 创建一个新的 img 元素并添加到 body
    let $newImg = $("<img>").attr("src", newSrc)
                            .attr("alt", `C详情图-${indexWithZero}`)
                            .addClass("xiangqingtux")
                            .css("display", "none");  // 隐藏图片

    // 将新创建的 img 元素添加到 body
    $("body").append($newImg);
});




        
    }
    else if (url.includes("https://detail.tmall.com/item.htm") || url.includes("https://item.taobao.com/item.htm")) {

        // 主图修改：修改 #picGalleryEle img[class^="thumbnailPic--"] 的图片, 添加类名
        $("#picGalleryEle img[class^='thumbnailPic--']").each((index, img) => {
            img.src = img.src.split("_q50.jpg_.webp")[0];
        }).addClass("zhutux");

        // 规格图修改：修改 #skuOptionsArea 的 img[class^="valueItemImg--"] 的图片, 添加类名
        $("#skuOptionsArea img[class^='valueItemImg--']").each((index, img) => {
            img.src = img.src.split("_90x90q30")[0];
        }).addClass("guigetux");

        // 详情图修改：修改 #content img 的图片, 添加类名
        $("#content img").each((index, img) => {
            if ($(img).attr("data-src")) {
                img.src = $(img).attr("data-src");
            }
        }).addClass("xiangqingtux");
    }
    else if (url.includes("https://item.jd.com/")) {

        // 主图修改：修改 #spec-list img 的图片, 添加类名
        $("#spec-list img").each((index, img) => {
            img.src = img.src.replace("114x114", "720x720");
        }).addClass("zhutux");

        // 规格图修改：修改 #choose-attrs img 的图片, 添加类名
        $("#choose-attrs img").each((index, img) => {
            img.src = img.src.replace("28x28", "720x720");
        }).addClass("guigetux");

        // 详情图修改：修改 #J-detail-content .ssd-module-wrap div.ssd-module 背景图片转图片
        $("#J-detail-content .ssd-module-wrap div.ssd-module").each((index, module) => {
            $(module).find("img").remove();
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
            img.src = img.src.split(".avif")[0];
        }).addClass("xiangqingtux");
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
export { img_rename };
// End-97-2025.11.22.115746

