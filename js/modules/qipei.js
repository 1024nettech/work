import { $ } from "./jquery.js";
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
function zhutu_upload() {
    let html = `<span class="uploadx"></span><input type="file" accept=".jpg,.gif,.png">`;
    $("input[id^=propicpath]").before(html);

    $(".uploadx").click(function () {
        // 获取文件上传的 input 元素
        let $fileInput = $(this).next('input[type="file"]');
        $fileInput.trigger('click');

        $fileInput.on('change', function (event) {
            // 修改紧邻后面的兄弟input元素的边框颜色
            $(this).next('input').css("border", "1px solid green"); // Change the border color of the next input element

            let file = event.target.files[0];
            if (file) {
                let reader = new FileReader();
                reader.onload = function (e) {
                    let img = new Image();
                    img.onload = function () {
                        let isSquare = img.width === img.height;
                        console.log('图片大小:', img.width, 'x', img.height, '正方形:', isSquare);

                        // 如果图片不是正方形，处理成正方形
                        if (!isSquare) {
                            let canvas = document.createElement('canvas');
                            let ctx = canvas.getContext('2d');
                            let size = Math.max(img.width, img.height);
                            canvas.width = size;
                            canvas.height = size;

                            // 填充背景为白色
                            ctx.fillStyle = 'white';
                            ctx.fillRect(0, 0, size, size);

                            // 将图片居中绘制
                            ctx.drawImage(img, (size - img.width) / 2, (size - img.height) / 2);

                            // 将 canvas 转换为 Blob 并上传
                            canvas.toBlob(function (blob) {
                                uploadImage(blob, file.name, event); // Pass the event to the upload function
                                triggerNextUpload(event); // 延迟触发下一个 uploadx 按钮
                            }, 'image/png');
                        } else {
                            // 正方形图片直接上传
                            uploadImage(dataURLtoBlob(e.target.result), file.name, event); // Pass the event to the upload function
                            triggerNextUpload(event); // 延迟触发下一个 uploadx 按钮
                        }
                    };
                    img.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }

        });
    });

    // 用于延迟触发下一个按钮的函数
    function triggerNextUpload(event) {
        // 使用 setTimeout 确保文件上传操作完成后再触发下一个 uploadx
        setTimeout(function () {
            // 跳过一行tr，查找下一个uploadx元素
            let $nextUpload = $(event.target).closest('tr').next().next('tr').find('.uploadx'); // Skip one row and find the next uploadx
            if ($nextUpload.length) {
                $nextUpload.trigger('click'); // 自动触发下一个 uploadx 元素
            }
        }, 500); // 500ms 延迟，可以根据实际情况调整
    }

    // 将 dataURL 转换为 Blob 对象
    function dataURLtoBlob(dataURL) {
        const byteString = atob(dataURL.split(',')[1]);
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const uintArray = new Uint8Array(arrayBuffer);
        for (let i = 0; i < byteString.length; i++) {
            uintArray[i] = byteString.charCodeAt(i);
        }
        return new Blob([arrayBuffer], { type: 'image/png' });
    }

    // 上传图片函数（使用 fetch）
    function uploadImage(imageBlob, filename, event) {
        console.log(`上传图片，文件名: ${filename}`);

        let formData = new FormData();
        formData.append('file', imageBlob, filename);
        formData.append('name', filename);
        formData.append('chunk', 0);
        formData.append('chunks', 1);
        let url = location.origin + "/Ajax/plupload.php?username=qipeiyigouwang&set_type=2"
        // 使用 fetch 上传
        fetch(url, {
            method: 'POST',
            body: formData
        })
            .then(response => response.text())
            .then(responseText => {
                console.log('上传成功:', responseText);

                // 假设服务器响应返回了一个图片的 URL
                let uploadedImageUrl = responseText.trim().split("?")[0];  // 获取上传后的图片 URL（根据实际返回内容修改）

                // 从上传 URL 获取图片链接并修改为缩略图链接
                let resizedUrl = uploadedImageUrl + '?x-oss-process=image/resize,m_lfit,w_100,h_80,limit_0';

                // 获取点击的span的父tr元素
                let $span = $(event.target); // Use the event passed from the click handler
                let $parentTr = $span.closest('tr');

                // 更新前一行tr中的img的src
                $parentTr.prev('tr').find('img').attr('src', resizedUrl).show(); // 设置图片并确保img标签显示
                // 还需要更新点击的span元素的兄弟元素中的type="hidden"的input的value值
                $span.siblings('input[type="hidden"]').val(resizedUrl);

                $parentTr.prev('tr').css("display", "table-row");

                console.log('更新图片链接成功:', resizedUrl);
            })
            .catch(error => {
                console.log('上传失败:', error);
            });
    }

}
export { open_close_shop_products, showKeyword, fetchChIdsAndTitles, checkProduct, zhutu_upload }
// End-203-2025.11.28.092523
