import { set, get, del, keys } from "./idb-keyval.js"
import * as publics from "./public.js"
const url = location.href;
function export_tsc() {
    // 首页导出数据组件
    let html = `
        <img src="https://aimg8.dlssyht.cn/u/1533835/ueditor/image/767/1533835/1746954291684901.png" id="toggleImg" />
        <input type="text" id="nameInput" placeholder="请输入姓名" />
        <button id="exportx">导出数据为 xlsx</button>
        <img src="https://aimg8.dlssyht.cn/u/1533835/ueditor/image/767/1533835/1747970937415077.png" id="clearLocalStorage" />
        <input type="text" id="usernameInput" value="当前用户名: ">
        `;
    $("body").append(html);
    if (url.includes("denglu.php")) { $("#toggleImg").css("display", "none"); }
    let autorun = Number(localStorage.getItem("autorun"));
    if (autorun) {
        $("#toggleImg").attr("src", "https://aimg8.dlssyht.cn/u/1533835/ueditor/image/767/1533835/1746954291684901.png");
    }
    else {
        $("#toggleImg").attr("src", "https://aimg8.dlssyht.cn/u/1533835/ueditor/image/767/1533835/1746954290554632.png");
    }
    $("#toggleImg").click(function () {
        let autorun = Number(localStorage.getItem("autorun"));
        if (autorun) {
            $(this).attr("src", "https://aimg8.dlssyht.cn/u/1533835/ueditor/image/767/1533835/1746954290554632.png");
            autorun = 0;
        } else {
            $(this).attr("src", "https://aimg8.dlssyht.cn/u/1533835/ueditor/image/767/1533835/1746954291684901.png");
            autorun = 1;
        }
        localStorage.setItem("autorun", autorun);
    });
    $("#exportx").click(function () {
        let personName = $("#nameInput").val().trim();
        localStorage.setItem("name", personName);
        if (!personName) {
            alert("姓名不能为空！");
            return;
        }
        let time = publics.generateTimestamp(1);
        let fileName = `${personName}-${time}`;
        publics.downloadRecordAsFile(personName, fileName);
    });
    $("#clearLocalStorage").click(() => {
        localStorage.clear();
        $("#clearLocalStorage").attr("src", "https://aimg8.dlssyht.cn/u/1533835/ueditor/image/767/1533835/1747976911167008.png");
        setTimeout(() => { location.reload(); }, 1000);
    });
    $("#usernameInput").click(() => { $("#usernameInput").val(""); });
    let stored_personname = localStorage.getItem("name");
    if (stored_personname) {
        $("#nameInput").val(stored_personname);
    }
    $("#usernameInput").on("input", function () {
        let usernames = $("#usernameInput").val().trim().split(" ").map(function (username) {
            return username.trim();
        }).filter(function (username) {
            return username.length > 0;
        });
        let first_username = usernames[0] || "";
        localStorage.setItem("usernames", usernames.join(" "));
        $("#commonName").val(first_username);
        $("#commonName").focus();
        $("#commonName").prop("disabled", true);
        $("#commonPassword").focus();
        $("#commonPassword").click();
        $("#usernameInput").val(`当前用户名: ${first_username}`);
    });
}
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
async function open_channel_product_list(chIds) {
    // 打开所有包含产品的栏目管理列表页
    if (!Array.isArray(chIds) || chIds.length === 0) {
        console.log("chIds 不是有效的数组或为空");
        return;
    }
    console.log("函数 open_channel_product_list 被调用\n频道 ID 列表:\n", chIds);
    if (url === "http://testpage.qipeiyigou.com/" || url.includes("http://testpage.qipeiyigou.com/dom/sc_user_center.php?username=qipeiyigouwang")) {
        console.log("URL 匹配, 开始处理频道 ID 列表");
        let promises = chIds.map((id, index) => {
            return new Promise((resolve, reject) => {
                let productUrl = `http://testpage.qipeiyigou.com/dom/sc_product_list.php?username=qipeiyigouwang&ch_id=${id}&ls_cur=112&page=1`;
                console.log(`请求频道 ID: ${id}`);
                $.ajax({
                    url: productUrl,
                    method: "GET",
                    success: function (response) {
                        console.log(`响应频道 ID: ${id}`);
                        resolve({
                            index: index,
                            id: id,
                            hasProducts: !response.includes("暂无数据"),
                            url: productUrl
                        });
                    },
                    error: function (xhr, status, error) {
                        console.error(`请求失败, URL: ${productUrl}, 错误: ${error}`);
                        resolve({ index: index, id: id, hasProducts: false, url: productUrl });
                    }
                });
            });
        });
        Promise.all(promises).then(results => {
            results.sort((a, b) => a.index - b.index);
            results.forEach(result => {
                if (result.hasProducts) {
                    console.log(`打开有产品的页面: ${result.url}`);
                    window.open(result.url, "_blank");
                } else {
                    console.log(`该频道没有产品, 跳过: ${result.url}`);
                }
            });
            console.log("所有请求已完成, 窗口按顺序打开");
        }).catch(error => {
            console.error("处理请求时发生错误:", error);
        });
    } else {
        console.log("URL 不匹配, 跳过处理");
    }
}
async function openProductsEdit() {
    // ESC打开产品栏目管理列表页
    let username = $(".welcome").text().split("欢迎您：")[1].trim();
    await publics.appendToData("usernames", username);
    let page = publics.getUrlParameter(url, "page");
    $("a").filter(function () {
        return $(this).text().trim() === "编辑";
    }).each(function (index) {
        window.open($(this).attr("href") + "#page=" + page + "&num=" + (index + 1), "_blank");
    });
    if ($(".page-next").length) {
        location.href = $(".page-next").attr("href");
    } else {
        window.close();
    }
};
function extractDataAsObject() {
    // 手动提取商家中心的栏目{id:名称}
    let items = document.querySelectorAll(".item-list li");
    let dataObj = {};
    items.forEach(item => {
        let link = item.querySelector("a");
        let chId = publics.getUrlParameter(link, "ch_id");
        let title = item.querySelector(".p-tit").textContent.trim();
        dataObj[chId] = title;
    });
    console.log(dataObj);
    return dataObj;
}
export { export_tsc, open_close_shop_products, showKeyword, checkProduct, fetchChIdsAndTitles, open_channel_product_list, openProductsEdit, extractDataAsObject }
// End-233-2025.11.01.113436
