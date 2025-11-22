import { $ } from "./jquery.js";
import { set, get, del, keys } from "./idb-keyval.js"
const url = location.href;
function get_img_src() {
    // 商铺设计图片模块获取图片src, 复制到剪贴板
    let a = $(".n-upload-file-info a").attr("href");
}
function setPosition() {
    // 管理后台设计页面设置坐标
    let input = prompt("请输入left/top值（例如: 100/200）:");
    let [left, top] = input.split("/");
    if (left !== "" && !isNaN(left)) {
        $(".curEditModuleSize").attr("data-left", left);
        $(".curEditModuleSize").css("left", `${left}px`);
    }
    if (top !== "" && !isNaN(top)) {
        $(".curEditModuleSize").attr("data-top", top);
        $(".curEditModuleSize").css("top", `${top}px`);
    }
}
async function gatherMemberDataAndSave() {
    // 管理后台会员详情页电话处理记录保存
    let username = $("td:contains(用户名)+td").text().trim();
    let tel = $("#tel").val().trim();
    let card_id = $("#card_id").val().trim();
    let record = `${username}\t${tel}\t${card_id}`;
    let currentData = await get("tel");
    currentData[username] = record;
    await set("tel", currentData);
}
async function save_tel_record() {
    // 导出管理后台会员电话处理记录为xlsx
    let telData = await get("tel");
    if (Object.keys(telData).length > 0) {
        // 获取所有记录并按会员卡号降序排序
        let sortedData = Object.values(telData).sort((a, b) => {
            let cardIdA = a.split("\t")[2];
            let cardIdB = b.split("\t")[2];
            return cardIdB.localeCompare(cardIdA);
        });
        let sheetData = [["用户名", "联系电话", "会员卡号"]];
        sortedData.forEach(row => {
            sheetData.push(row.split("\t"));
        });
        let ws = XLSX.utils.aoa_to_sheet(sheetData);
        let wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "会员数据");
        let timestamp = new Date();
        let formattedTimestamp = timestamp.getFullYear().toString().padStart(4, "0") +
            (timestamp.getMonth() + 1).toString().padStart(2, "0") +
            timestamp.getDate().toString().padStart(2, "0") +
            timestamp.getHours().toString().padStart(2, "0") +
            timestamp.getMinutes().toString().padStart(2, "0") +
            timestamp.getSeconds().toString().padStart(2, "0");
        let filename = `管理后台会员电话清空处理记录-${formattedTimestamp}.xlsx`;
        XLSX.writeFile(wb, filename);
    } else {
        alert("没有数据可导出！");
    }
}
async function shop_pass() {
    // 管理后台店铺审核批量通过
    if ($("#all_checkbox").length) {
        $("#class_form input:checkbox[name='key[]']").prop("checked", true);
        $("#all_checkbox").prop("checked", true);
        $("#operation").val("set_top");
        $("#class_form").submit();
    }
    else {
        setTimeout(() => { location.href = "http://admin.qipeiyigou.com/shops/shops_pass.php?no_navi=0&is_frame=2&dom_id=18"; }, 10000);
    }
}
export { get_img_src, setPosition, gatherMemberDataAndSave, save_tel_record, shop_pass }
// End-74-2025.11.22.150000
