import * as publics from "./public.js"
import * as admin from "./admin.js"
import * as qipei from "./qipei.js"
import * as ali from "./ali.js"
async function main() {
    const url = location.href;
    let auth = localStorage.getItem("auth"); // 000: 第一位为admin权限, 第二位为组长查店铺权限, 第三位为截图权限
    const today = publics.generateTimestamp(0);
    const stored_day = publics.getAndLog("date");
    if (stored_day !== today) {
        console.log(`${today}新的一天开始了: 开始清除所有数据……`);
        localStorage.clear();
        await publics.clearAll();
        publics.setAndLog("date", today);
        publics.setAndLog("auth", auth);
        auth = publics.getAndLog("auth");
    }
    alert(auth[0])
    if (url.includes("qipeiyigou.com")) {
        // admin权限
        if (auth[0] === "1") {
            if (url.includes("design-mode")) {
                // 商铺设计图片模块获取src, 复制到剪贴板
                $(document).on("keyup", function (event) {
                    switch (event.key) {
                        case "F1":
                            admin.get_img_src();
                            break;
                    }
                });
            }
            else {
                // 管理后台功能
                if (url.includes("member_list.php")) {
                    // 会员管理列表页
                    $(document).on('keydown', function (e) {
                        if (e.key === 'Escape') {
                            // 按下Esc键时，获取并打开会员编辑页面
                            $('#form1 a').each(function () {
                                if ($(this).text().trim() === '编辑') {
                                    window.open($(this).attr('href'), '_blank');
                                }
                            });
                            let nextPageLink = $('a.page-next').attr('href');
                            if (nextPageLink) {
                                location.href = nextPageLink;
                            }
                        }
                    });
                    $("body").append(`<button id="exportx" style="top: 20px;">导出数据为 xlsx</button>`);
                    $("#exportx").click(() => {
                        admin.save_tel_record();
                    });
                }
                else if (url.includes("member_manage_detail.php")) {
                    // 会员管理资料详情页
                    if (!$('td.right:contains("短信验证手机号")').length && $('#tel').val().trim() === '13000000000') {
                        await admin.gatherMemberDataAndSave();
                        $('#tel').val('');
                        $('#sub_btn').click();
                    }
                    else {
                        window.close();
                    }
                }
                else if (url.includes("shops_pass.php")) {
                    // 店铺申请批量通过审核
                    admin.shop_pass();
                }
            }
            $(document).on("mouseenter", "div[id^='evMo_']", function () {
                let $this = $(this);
                $this.attr("title", `宽度: ${$this.css("width")}\n高度: ${$this.css("height")}\n左: ${$this.css("left")}\n上: ${$this.css("top")}`);
            });
            $(document).on("keyup", function (event) {
                switch (event.key) {
                    case "F1":
                        admin.setPosition();
                        break;
                }
            });
        }
        // 组长查店铺权限
        if (auth[1] === "1") {
            let urls = ["https://1024nettech.github.io/work/css/work-admin.css?time=1&module=0"];
            publics.loadFiles(urls);
            // 店铺内打开、关闭产品
            $(document).on("keyup", function (event) {
                switch (event.key) {
                    case "F1":
                        qipei.open_close_shop_products();
                        break;
                }
            });
            if (url.includes("mshop/?")) {
                // 店铺首页
                let html = `
                    <div id="shop-info" style="display: none;">
                        <span id="shop-cat">商铺类别</span>
                        <span id="shop-cert">
                            <a target="_blank">认证资料</a>
                        </span>
                    </div>
                    `;
                $("body").append(html);
                let shopId = window.__NUXT__.data["/api/siteData?undefined"]["dev"]["rawdata"]["basic_info"]["shop_info"]["id"];
                publics.sendRequest(`http://admin.qipeiyigou.com/shops/shops_add.php?shops_id=${shopId}`, "", "GET", function (response) {
                    let bigId = response.responseText.match(/big_id.*?>/)[0].match(/(\d+)/)[0];
                    let subId = response.responseText.match(/sub_id".*>/)[0].match(/(\d+)/)[0];
                    let certifiedInfo = "无";
                    if (response.responseText.includes("certified_info")) {
                        certifiedInfo = response.responseText.match(/https:\/\/aimg8.dlssyht.cn\/certified_info.*target/)[0].split("?")[0];
                    }
                    if (certifiedInfo === "无") {
                        $("#shop-cert a").text("无认证资料");
                    } else {
                        $("#shop-cert a").attr("href", certifiedInfo);
                    }
                    publics.sendRequest(`${location.origin}/dom/shops/ajax_get_class.php?big_id=${bigId}&sub_id=${subId}`, document.cookie, "GET", function (response) {
                        $("#shop-cat").attr("title", "查询完毕……");
                        let big_shop_class = response.responseText.split("selected")[1].split("<")[0].replace(">|-", "");
                        let sub_shop_class = response.responseText.split("selected")[2].split("<")[0].replace(">", "");
                        $("#shop-cat").attr("title", `${big_shop_class}-${sub_shop_class}`);
                    });
                });
                $(document).on("mouseenter", "body", function () {
                    if (!$(".header-nav #shop-info").length) {
                        publics.moveElement("#shop-info", ".header-nav");
                    }
                });
            }
            else if (url.includes("mshop/product/item")) {
                // 店铺产品详情页
                let html = `
                    <div id="divx">
                        <span id="span1">查询中……</span><br>
                        <span id="span2">系统分类: </span><br>
                        <span id="span3">产品性质: </span><br>
                        <span id="span4">专属车型: </span><br>
                    </div>
                    <p id="tipx" style="display: none;">正在检查中……</p>
                    `;
                $("body").append(html);
                $(".title h3").append(`<br><p id="keywordx"></p>`);
                $(".nav-link").click(() => {
                    $("#divx, #tipx").remove();
                });
                qipei.showKeyword();
                qipei.checkProduct();
                let author = "-" + $(`meta[name="author"]`).attr("content");
                let proname = $("title").text().split(author)[0];
                let proId = url.split("/item/")[1].split("?")[0];
                let channelId = window.__NUXT__.data[`/api/product/item/${proId}?undefined`]["data"]["channelId"];
                let channelName = channelNameMap[channelId];
                let req_url = `${location.origin}/dom/sc_product.php?ch_id=${channelId}&id=${proId}`;
                publics.sendRequest(req_url, document.cookie, "GET", function (response) {
                    let productName = "";
                    let regex = /<input[^>]+name="proname"[^>]+value="([^"]+)"/;
                    let match = response.responseText.match(regex);
                    if (match && match[1]) {
                        productName = match[1];
                        console.log("提取的产品名称: " + productName);
                    } else {
                        console.log("未找到产品名称");
                    }
                    if (proname === productName) {
                        // 获取产品性质和专属车型
                        let productProperties = "";
                        let exclusiveModels = "";
                        let properties = response.responseText.split("产品性质")[1].split("tr")[0].split("checked=");
                        for (let prop of properties) {
                            if (prop.includes("checked")) {
                                productProperties += prop.match(/[\u4e00-\u9fa5]+/) + "-";
                            }
                        }
                        productProperties = productProperties.slice(0, -1);
                        exclusiveModels = response.responseText.split("专属车型")[1].split(`"checked"`)[1].split("</label>")[0].match(/[\u4e00-\u9fa5]+/);
                        $("#span3").text(`产品性质: ${productProperties}`);
                        $("#span4").text(`专属车型: ${exclusiveModels}`);
                        // 获取系统分类id
                        let bigId = response.responseText.split(`"big_id"`)[2].split(`"`)[1];
                        let subId = response.responseText.split(`"sub_id"`)[2].split(`"`)[1];
                        // 获取系统分类名
                        req_url = `http://admin.qipeiyigou.com/Ajax/VT/AjaxGetInfo.php?ch_id=${channelId}&req_method=5&one_cid=${bigId}&two_cid=${subId}`;
                        publics.sendRequest(req_url, decodedCookie, "GET", function (response) {
                            let one_class = response.responseText.split(`"${bigId}","classname":`)[1].split(",")[0].split(`"`)[1];
                            let two_class = response.responseText.split(`"${subId}","classname":`)[1].split(",")[0].split(`"`)[1];
                            $("#span2").text(`系统分类: ${channelName}-${one_class}-${two_class}`);
                            $("#span1").text("查询完毕……");
                        });
                    }
                });
                $(document).on("mouseenter", "body", function () {
                    if (!$(".main .v-x-scroll #tipx").length) {
                        publics.moveElement("#tipx", ".main .v-x-scroll");
                        let top = $(".content-wrap").offset().top + "px";
                        let left = (($("body").width() - 1200) / 2 + 1223) + "px";
                        $("#divx").css("top", top);
                        $("#divx").css("left", left);
                    }
                });
            }
        }
    }
    else if (url.includes("https://detail.1688.com/offer/") && auth[2] === "1") {
        let html = `
        <button id="modex">多图模式</button>
        <button id="processing-message">已准备...</button>
        `;
        $("body").append(html);
        let storedmode = localStorage.getItem("screenshotMode");
        if (storedmode) {
            $("#modex").text(storedmode);
        }
        // 点击切换模式
        $("#modex").click(() => {
            if ($("#modex").text() === "多图模式") {
                $("#modex").text("单图模式");
                localStorage.setItem("screenshotMode", "单图模式");
            } else {
                $("#modex").text("多图模式");
                localStorage.setItem("screenshotMode", "多图模式");
            }
        });
        $(document).on("mouseleave", "body", function () {
            ali.img_rename();
        });
        $(document).on("keyup", function (event) {
            switch (event.key) {
                case "F1":
                    publics.takeScreenshots(".content-detail");
                    break;
            }
        });
    }
}
let interval = setInterval(function () {
    if ((document.readyState === "complete" || document.readyState === "interactive") && window.jQuery) {
        clearInterval(interval);
        main();
        console.log("来自work-main.js输出: DOM 已加载完成, jQuery 已加载, main()函数已执行");
    } else {
        if (document.readyState !== "complete" && document.readyState !== "interactive") {
            console.log("来自work-main.js输出: DOM 还未加载");
        }
        if (!window.jQuery) {
            console.log("来自work-main.js输出: jQuery 还未加载");
        }
    }
}, 10);
// End-250-2025.11.17.155731

