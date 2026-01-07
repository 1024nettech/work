import { $ } from "./jquery.js";
import * as publics from "./public.js"
import * as admin from "./admin.js"
import * as qipei from "./qipei.js"
import * as img from "./img.js"
async function main() {
    const url = location.href;
    let auth = localStorage.getItem("auth"); // 000: 第一位为admin权限, 第二位为组长查店铺权限, 第三位为截图权限
    const today = publics.generateTimestamp(0);
    const stored_day = await publics.getAndLog("date");
    if (stored_day !== today) {
        console.log(`${today}新的一天开始了: 开始清除所有数据……`);
        localStorage.clear();
        await publics.clearAll();
        await publics.setAndLog("date", today);
        await publics.setAndLog("auth", auth);
    }
    auth = await publics.getAndLog("auth");
    if (url.includes("qipeiyigou.com")) {
        // admin权限
        if (auth[0] === "1") {
            if (url.includes("design-mode")) {
                // 商铺设计图片模块获取src, 复制到剪贴板
                publics.onKeyUp("F1", function () {
                    admin.get_img_src();
                });
            }
            else {
                // 管理后台功能
                if (url.includes("member_list.php")) {
                    // 会员管理列表页
                    onKeyUp("Escape", function () {
                        // 按下Esc键时, 获取并打开会员编辑页面
                        $("#form1 a").each(function () {
                            if ($(this).text().trim() === "编辑") {
                                window.open($(this).attr("href"), "_blank");
                            }
                        });
                        let nextPageLink = $("a.page-next").attr("href");
                        if (nextPageLink) {
                            location.href = nextPageLink;
                        }
                    });
                    $("body").append(`<button id="exportx" style="top: 20px;">导出数据为 xlsx</button>`);
                    $("#exportx").click(() => {
                        admin.save_tel_record();
                    });
                }
                else if (url.includes("member_manage_detail.php")) {
                    // 会员管理资料详情页
                    if (!$("td.right:contains(短信验证手机号)").length && $("#tel").val().trim() === "13000000000") {
                        await admin.gatherMemberDataAndSave();
                        $("#tel").val("");
                        $("#sub_btn").click();
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
            publics.onKeyUp("F1", function () {
                admin.setPosition();
            });
        }
        // 组长查店铺权限
        if (auth[1] === "1") {
            let urls = ["https://1024nettech.github.io/work/css/work-admin.css?time=1&module=0"];
            publics.loadFiles(urls);
            // 店铺内打开、关闭产品
            publics.onKeyUp("F1", function () {
                qipei.open_close_shop_products();
            });
            if (url.includes("mshop/?")) {
                // 店铺首页
                let html = `
                    <div id="shop-info">
                        <span id="shop-cat">商铺类别</span>
                        <span id="shop-cert">
                            <a target="_blank">认证资料</a>
                        </span>
                    </div>
                    `;
                $("body").append(html);
                setInterval(() => {
                    let top = $("#siteHeaderMenu").offset().top + "px";
                    $("#shop-info").css("top", top);
                }, 1000);
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
                    <p id="tipx">正在检查中……</p>
                    `;
                $("body").append(html);
                setInterval(() => {
                    let top = $(".content-wrap").offset().top + "px";
                    let left = (($("body").width() - 1200) / 2 + 1223) + "px";
                    $("#divx").css("top", top);
                    $("#divx").css("left", left);
                    top = $(".main").offset().top + 1 + "px";
                    left = $(".main").offset().left + 249 + "px";
                    $("#tipx").css("top", top);
                    $("#tipx").css("left", left);
                }, 1000);
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
                let channelNameMap = await qipei.fetchChIdsAndTitles(`${location.origin}/dom/shops/shop_pro_manage.php`);
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
                        publics.sendRequest(req_url, "", "GET", function (response) {
                            let one_class = response.responseText.split(`"${bigId}","classname":`)[1].split(",")[0].split(`"`)[1];
                            let two_class = response.responseText.split(`"${subId}","classname":`)[1].split(",")[0].split(`"`)[1];
                            $("#span2").text(`系统分类: ${channelName}-${one_class}-${two_class}`);
                            $("#span1").text("查询完毕……");
                        });
                    }
                });
            }
        }
        if (url.includes("sc_product.php")) {
            // 商品发布页面
            $("body").append(`
                <style>
                    * {
                        font-family: 微软雅黑 !important;
                    }
                </style>
                `);
            qipei.zhutu_upload();
            qipei.guigetu_upload();
            qipei.xiangqingtu_upload();
            $("span:contains(产品名称)").click(() => {
                let html = $("#proname").val().trim().split("|@@|");
                $("#proname").val(html[0]);
                $("#keywords").val(html[1]);
                $("#prounitprice").val(html[2]);
                $("#prounit").val(html[3]);
                $("#prosmallnum").val(html[4]);
                $("#propurveynum").val(html[5]);
                let prefix = `<p><span style="font-family: 微软雅黑, 'Microsoft YaHei'; font-size: 18px;">产品描述</span></p>`;
                $("#ueditor_0").contents().find("body").html(prefix + html[6]);
            });
        }
    }
    else if (url.includes("https://detail.1688.com/offer/")) {
        if (auth[2] === "1") {
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
            publics.onKeyUp("F1", function () {
                publics.takeScreenshots(".content-detail");
            });
        }
    }
    if (url.includes("https://detail.1688.com/offer/") || url.includes("https://detail.tmall.com/item.htm") || url.includes("https://item.taobao.com/item.htm") || url.includes("https://item.jd.com/") || url.includes("https://b2b.baidu.com/land?url=")) {
        $(document).on("mouseleave", "body", function () {
            img.rename();
        });
    }
    if (url.includes("https://detail.tmall.com/item.htm") || url.includes("https://item.taobao.com/item.htm")) {
        publics.addDownloadButton("#mainPicVideoEl video", ".videox-progress-container", "downloadVideoButton_tb");
    }
    if (url.includes("https://b2b.baidu.com/land?url=")) {
        publics.addDownloadButton(".video-container video", ".video-container", "downloadVideoButton_aicaigou");
    }
    if (url.includes("https://detail.1688.com/offer/")) {
        publics.copyTextOnClick();
    }
    else if (url.includes("https://detail.tmall.com/item.htm") || url.includes("https://item.taobao.com/item.htm")) {
        publics.copyTextOnClick("#tbpcDetail_SkuPanelBody span, div[class^='paramsWrap--'] div");
    }
    else if (url.includes("https://item.jd.com/")) {
        publics.copyTextOnClick(".infomation span, .infomation i, .goods-base div");
    }
    else {
        $(document).on("mouseleave", "body", function () {
            img.rename();
        });
    }
}
let interval = setInterval(function () {
    if ((document.readyState === "complete" || document.readyState === "interactive")) {
        clearInterval(interval);
        main();
        console.log("来自work-main.js输出: DOM 已加载完成, main()函数已执行");
    } else {
        if (document.readyState !== "complete" && document.readyState !== "interactive") {
            console.log("来自work-main.js输出: DOM 还未加载");
        }
    }
}, 1000);
// End-279-2026.01.07.101811
