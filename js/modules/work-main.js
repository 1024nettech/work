import * as publics from "./public.js"
import * as admin from "./admin.js"
import * as qipei from "./qipei.js"
import * as ali from "./ali.js"
async function main() {
    const url = location.href;
    const auth = localStorage.getItem("auth"); // 000: 第一位为admin权限,第二位为组长查店铺权限,第三位为截图权限
    let autorun = Number(localStorage.getItem("autorun"));
    const stored_day = localStorage.getItem("date");
    const today = publics.generateTimestamp(0);
    if (stored_day !== today) {
        localStorage.setItem("date", today);
        console.log(`${today}新的一天开始了: 开始清除所有数据……`);
        publics.clearExceptAuth();
        await publics.clearAll();
        console.log(`${today}新的一天开始了: 所有数据已清除……\n清除后的数据为……`);
        console.log(localStorage);
        await publics.setAndLog("usernames", []);
        await publics.setAndLog("record", {});
        await publics.setAndLog("tel", {});
    }
    if (url.includes("qipeiyigou.com")) {
        // 店铺内打开、关闭产品
        if (url.includes("mshop/?") || url.includes("mshop/product/item")) {
            $(document).on("keyup", function (event) {
                switch (event.key) {
                    case "F2":
                        qipei.open_close_shop_products();
                        break;
                }
            });
        }
        // 首页和登录页面添加导出组件
        if (url === "http://testpage.qipeiyigou.com/" || url.includes("denglu.php")) {
            qipei.export_tsc();
            let cookie = localStorage.getItem("cookie");
            if (!cookie) {
                let encodedCookie = prompt("请输入Key: ");
                localStorage.setItem("cookie", encodedCookie);
            }
        }
        let decodedCookie = "";
        try {
            const key = "TFhzQW1Jq6JTc6ps1PlSRfy7k6EERwuA";
            const encodedCookie = localStorage.getItem("cookie");
            const bytes = CryptoJS.AES.decrypt(encodedCookie, key);
            decodedCookie = bytes.toString(CryptoJS.enc.Utf8);
        } catch (error) {
            console.error("解密 cookie 发生错误, 跳过此操作", error);
        }
        let channelNameMap = "";
        if ($("a:contains(退出)").length) {
            channelNameMap = await qipei.fetchChIdsAndTitles("http://testpage.qipeiyigou.com/dom/shops/shop_pro_manage.php");
        }
        // admin权限
        if (auth[0] === "1") {
            if (url.includes("design-mode")) {
                // 商铺设计图片模块获取src, 复制到剪贴板
                $(document).on("keyup", function (event) {
                    switch (event.key) {
                        case "F2":
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
                    case "F2":
                        admin.setPosition();
                        break;
                }
            });
        }
        // 组长查店铺权限
        if (auth[1] === "1") {
            let urls = ["https://1024nettech.github.io/work/css/work-admin.css?time=1&module=0"];
            publics.loadFiles(urls);
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
                publics.sendRequest(`http://admin.qipeiyigou.com/shops/shops_add.php?shops_id=${shopId}`, decodedCookie, "GET", function (response) {
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
                    publics.sendRequest(`http://testpage.qipeiyigou.com/dom/shops/ajax_get_class.php?big_id=${bigId}&sub_id=${subId}`, document.cookie, "GET", function (response) {
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
                let req_url = `http://testpage.qipeiyigou.com/dom/sc_product.php?ch_id=${channelId}&id=${proId}`;
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
        // 公共权限
        // 获取所有产品栏目id后打开有产品的产品管理页
        if (autorun && channelNameMap) {
            await qipei.open_channel_product_list(Object.keys(channelNameMap));
        }
        // 登录页自动填充密码
        if (url.includes("denglu.php")) {
            function queryUserId(username, cookie, doSuccess) {
                let url = "http://admin.qipeiyigou.com/member_list.php";
                let formData = {
                    "search_identity_id": 0,
                    "search_type": 0,
                    "member_name": username,
                    "start_time": "",
                    "end_time": "",
                    "is_serach": 1
                };
                publics.sendRequest(url, cookie, "POST", function (response) {
                    let userIdMatch = response.responseText.match(/编号：(\d+)/);
                    let userId = userIdMatch ? userIdMatch[1] : null;
                    console.log("成功获取到 UserID: ", userId);
                    if (userId) {
                        queryPassword(userId, cookie, doSuccess);
                    } else {
                        console.error("响应中没有找到 UserID");
                        $("#commonPassword").attr("placeholder", "请检查用户名是否正确……");
                    }
                }, formData);
            }
            function queryPassword(userId, cookie, doSuccess) {
                let url = `http://admin.qipeiyigou.com/member_manage_detail.php?id=${userId}`;
                publics.sendRequest(url, cookie, "GET", function (response) {
                    let passwordMatch = response.responseText.match(/value="([^"]+)"/);
                    let password = passwordMatch ? passwordMatch[1] : null;
                    console.log("成功获取到密码: ", password);
                    if (password) {
                        doSuccess(password);
                    } else {
                        console.error("响应中没有找到密码");
                    }
                });
            }
            function handleSuccess(password) {
                let username = $("#commonName").val().trim();
                $("#commonName").val(username);
                $("#commonPassword").val(password);
                localStorage.setItem("rightpassword", password);
                $("#form2").submit();
                $(".web-login .item-list i").css("background-image", "url(https://aimg8.dlssyht.cn/u/1533835/ueditor/image/767/1533835/1747535858129383.png)");
            }
            function testPassword(password) {
                return new Promise((resolve, reject) => {
                    let url = "http://testpage.qipeiyigou.com/dom/denglu.php";
                    let username = $("#commonName").val().trim();
                    let formData = {
                        "login_type": 0,
                        "login_name": username,
                        "login_pwd": password,
                        "validatecode": "",
                        "trespass": "http://testpage.qipeiyigouwang.com/vip_qipeiyigouwang.html"
                    };
                    publics.sendRequest(url, document.cookie, "POST", function (response) {
                        if (response.responseText.includes("成功")) {
                            console.log(password);
                            resolve(password);
                        } else if (response.responseText.includes("错误")) {
                            resolve(null);
                        } else {
                            console.error("未知响应: ", response.responseText);
                            resolve(null);
                        }
                    }, formData);
                });
            }
            async function testPasswordsSequentially(passwords) {
                for (let i = 0; i < passwords.length; i++) {
                    let password = await testPassword(passwords[i]);
                    if (password) {
                        handleSuccess(password);
                        return;
                    }
                    if (i < passwords.length - 1) {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }
                setTimeout(() => {
                    let username = $("#commonName").val().trim();
                    if (encodedCookie.length > 100) {
                        queryUserId(username, decodedCookie, function (password) {
                            console.log("最终获取到的密码: ", password);
                            $("#commonName").val(username);
                            handleSuccess(password);
                        });
                    }
                }, 1000);
            }
            $("#commonPassword").click(async () => {
                let rightpassword = localStorage.getItem("rightpassword");
                if (rightpassword) { $("#commonPassword").val(rightpassword); $("#form2").submit(); }
                else {
                    $("#commonPassword").val("");
                    $("#commonPassword").attr("placeholder", "查询中……");
                    try {
                        await testPasswordsSequentially(["111111", "666666", "888888"]);
                    } catch (error) {
                        console.error("发生错误: ", error);
                    }
                }
            });
            $("#commonLoginBut").mousedown(() => { $("#form2").submit(); });
            $("#commonName").focus();
            let stored_usernames = localStorage.getItem("usernames");
            if (stored_usernames) {
                let first_stored_username = stored_usernames.split(" ")[0];
                $("#commonName").val(first_stored_username);
                $("#commonName").prop("disabled", true);
                $("#commonPassword").focus();
                $("#commonPassword").click();
                $("#usernameInput").val(`当前用户名: ${first_stored_username}`);
            }
        }
        // 栏目产品管理列表页Esc打开编辑产品
        else if (url.includes("sc_product_list.php")) {
            $(document).on("keyup", function (event) {
                switch (event.key) {
                    case "Escape":
                        qipei.openProductsEdit();
                        break;
                }
            });
        }
        // 产品编辑页自动取消勾选并提交
        else if (url.includes("sc_product.php")) {
            if (autorun) {
                async function handleProductAction(checked_car, status = "") {
                    let today = publics.generateTimestamp(0);
                    let person = "xxpersonname";
                    let username = $(".welcome").text().split("欢迎您：")[1].trim();
                    let ch_id = publics.getUrlParameter(url, "ch_id");
                    let id = publics.getUrlParameter(url, "id");
                    let ch_name = $(".myColumnTit").text();
                    let product_link = `http://testpage.qipeiyigou.com/qipeiyigouwang/products/${id}.html${location.hash}`;
                    let page = publics.getUrlParameter(url, "page");
                    let num = publics.getUrlParameter(url, "num");
                    let record = `${today}\t${person}\t${username}\t${ch_id}\t${id}\t${ch_name}\t${product_link}\t${page}\t${num}\t`;
                    let labelsBefore = Array.from(document.querySelectorAll(`input[name="properties[]"]:checked`))
                        .map(checkbox => checkbox.closest("label").textContent.trim())
                        .join(", ");
                    if (status === "未处理") {
                        record += `${labelsBefore}\t${labelsBefore}\t${status}`;
                        await publics.appendToData("record", `${ch_id}_${id}`, record);
                        window.close();
                    } else {
                        async function processing() {
                            $("input[type=checkbox][value=4]").prop("checked", false);
                            if (checked_car) {
                                $("input[type=checkbox][value=2]").prop("checked", true);
                            }
                            let labelsAfter = Array.from(document.querySelectorAll(`input[name="properties[]"]:checked`))
                                .map(checkbox => checkbox.closest("label").textContent.trim())
                                .join(", ");
                            record += `${labelsBefore}\t${labelsAfter}\t${status}`;
                            await publics.appendToData("record", `${ch_id}_${id}`, record);
                            $("title").text("完成");
                            $("#submit_msg a").click();
                        }
                        async function checkSelectors() {
                            if ($("#sub_id option:selected").length && $("#shop_pro_class_big_id option:selected").length) {
                                await processing();
                            } else {
                                setTimeout(checkSelectors, 100);
                            }
                        }
                        checkSelectors();
                    }
                }
                let proname = $("#proname").val();
                let checked_box_num = $("input[type=checkbox]:checked").length;
                if (proname.includes("库存件")) {
                    handleProductAction(0, "未处理");
                }
                else {
                    if (checked_box_num === 1) {
                        if ($("input[type=checkbox][value=4]:checked").length) {
                            handleProductAction(1, "已处理");
                        }
                        else {
                            handleProductAction(0, "未处理");
                        }
                    }
                    else {
                        if ($("input[type=checkbox][value=4]:checked").length) {
                            handleProductAction(0, "已处理");
                        }
                        else {
                            handleProductAction(0, "未处理");
                        }
                    }
                }
            }
        }
        // 退出后自动跳转登录页
        else if (url === "http://testpage.qipeiyigou.com/vip_qipeiyigouwang.html") {
            location.href = "http://testpage.qipeiyigou.com/dom/denglu.php?username=qipeiyigouwang";
        }
        $(document).on("mousedown", "a:contains(退出)", function () {
            localStorage.setItem("rightpassword", "");
            let usernames = localStorage.getItem("usernames");
            if (!usernames) {
                console.log("No usernames found in localStorage.");
                return;
            }
            usernames = usernames.split(" ");
            let currentUsername = $(".welcome").text().split("欢迎您：")[1].trim();
            console.log("Current Username: ", currentUsername);
            console.log("Usernames from localStorage: ", usernames);
            if (currentUsername && usernames.includes(currentUsername)) {
                usernames = usernames.filter(username => username !== currentUsername);
                localStorage.setItem("usernames", usernames.join(" "));
                console.log("Updated localStorage: ", localStorage);
            } else {
                console.log("Current username not found or not valid.");
            }
        });
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
                case "F2":
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
// End-502-2025.11.01.113452
