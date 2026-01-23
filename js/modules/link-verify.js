import { $ } from "./jquery.js";

let domains = {
    "https://www.qipeiyigou.com": "testpage",
    "https://www.cheliangzulin.com": "clzl"
};

// 遍历所有 <a> 标签
$("a").each(function () {
    $(this).attr("title", $(this).attr("href"));
    $(this).click(function (event) {
        event.preventDefault();  // 阻止默认点击行为

        // 获取当前触发的 <a> 标签的 href 属性
        const url = $(this).attr("href");
        let domain = new URL(url).origin;  // 获取 href 的域名部分

        // 如果当前域名在 domains 中，则进行处理
        if (domain in domains) {
            // 获取域名后面的部分 (即 url 中去掉域名的部分)
            let path = url.replace(domain, "");

            // 构建新的链接
            let newUrl = `http://${domains[domain]}.qipeiyigou.com${path}`;

            // 在新标签页中打开新的链接
            window.open(newUrl, "_blank");
        }
    });
});
// End-31-2026.01.23.101758
