import { $ } from './jquery.js';
import { set, get, del, keys } from "./idb-keyval.js"
import * as publics from "./public.js"
const url = location.href;
function open_close_shop_products() {
    // 店铺内打开或关闭产品
    if (!location.href.includes("mshop/product/item")) {
        $(".list .image").each(function () {
            window.open($(this).attr("href"));
        });
    } else if (location.href.includes("mshop/product/item")) {
        window.close();
    }
}
function showKeyword() {
    // 显示关键词
    let keyword = $("meta[name=keywords]").attr("content");
    let author = $("meta[name=author]").attr("content");
    if (keyword.includes(author)) {
        $("#keywordx").text("关键词为空");
    } else {
        $("#keywordx").text(keyword);
    }
};
async function fetchChIdsAndTitles(url) {
    // 获取产品栏目id和名称{}
    try {
        let response = await fetch(url);
        if (!response.ok) {
            throw new Error(`请求失败, 状态码: ${response.status}`);
        }
        let arrayBuffer = await response.arrayBuffer();
        let decoder = new TextDecoder("gbk");
        let decodedText = decoder.decode(arrayBuffer);
        let parser = new DOMParser();
        let doc = parser.parseFromString(decodedText, "text/html");
        let anchorElements = doc.querySelectorAll(`a[href*="ch_id="]`);
        let chIdDict = {};
        anchorElements.forEach(anchor => {
            let chIdMatch = anchor.href.match(/ch_id=(\d+)/);
            if (chIdMatch) {
                let chId = chIdMatch[1];
                let titleElement = anchor.querySelector(".p-tit");
                let title = titleElement ? titleElement.textContent.trim() : "";
                if (title) {
                    chIdDict[chId] = title;
                }
            }
        });
        if (chIdDict) { await set("chIds", Object.keys(chIdDict)); }
        console.log("提取到的 ch_id 和标题字典: ", chIdDict);
        return chIdDict;
    } catch (error) {
        console.error("请求失败: " + error.message);
        return {};
    }
}
function checkProduct() {
    // 检查产品详情
    let id = 0;
    let tip = "";
    $("#tipx").text("正在检查中……");
    if ($(".main a").length) {
        id = 1;
        tip += "存在超链接！";
    }
    if ($(".main *[style*=pointer]").length) {
        id = 2;
        tip += "存在非超链接小手！";
    }
    let images = $(".main img");
    for (let i = 0; i < images.length; i++) {
        let src = images.eq(i).attr("src");
        if (!src.includes("aimg8.dlssyht.cn")) {
            id = 3;
            tip += "存在外链图片！";
            break;
        }
    }
    if (id === 0) {
        tip = "正常！";
    } else {
        $("#tipx").css("background-color", "red");
        alert(tip);
    }
    $("#tipx").text(`检查结果: ${tip}`);
};
export { open_close_shop_products, showKeyword, fetchChIdsAndTitles, checkProduct }
// End-89-2025.11.20.115537
