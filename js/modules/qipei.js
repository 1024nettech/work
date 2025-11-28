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
    // Create a single upload button
    let html = `
            <tr id='batch_upload'>
                <td>
                    <span class="tdName">批量上传：</span>
                </td>
                <td>
                    <input type="button" value="上传主图" style="width:100px; height:26px;" id="zhutu">
                    <input type="file" accept=".jpg,.gif,.png" multiple>
                    <input type="button" value="上传规格图" style="width:100px; height:26px;" id="guigetu">
                    <input type="file" accept=".jpg,.gif,.png" multiple>
                    <input type="button" value="上传详情图" style="width:100px; height:26px;" id="xiangqingtu">
                    <input type="file" accept=".jpg,.gif,.png" multiple>
                </td>
            </tr>
            `;
    $("#add_guige").parents("tr").before(html);

    $("#zhutu").click(function () {
        // Get the file input element
        let $fileInput = $(this).next('input[type="file"]');

        // Remove any existing 'change' event listeners before adding a new one
        $fileInput.off('change').on('change', function (event) {
            let files = event.target.files;
            let fileIndex = 0; // Track which file to upload

            // We create an async function to upload files one by one
            async function uploadFiles() {
                for (fileIndex = 0; fileIndex < files.length; fileIndex++) {
                    let file = files[fileIndex];
                    await uploadFile(file, fileIndex + 1); // Wait for each upload to finish before continuing
                }
            }

            // Start uploading files in sequence
            uploadFiles();
        });

        // Trigger file input click
        $fileInput.trigger('click');
    });

    // Function to convert DataURL to Blob
    function dataURLtoBlob(dataURL) {
        const byteString = atob(dataURL.split(',')[1]);
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const uintArray = new Uint8Array(arrayBuffer);
        for (let i = 0; i < byteString.length; i++) {
            uintArray[i] = byteString.charCodeAt(i);
        }
        return new Blob([arrayBuffer], { type: 'image/png' });
    }

    // Function to upload image and update DOM after upload
    function uploadFile(file, index) {
        return new Promise((resolve, reject) => {
            let reader = new FileReader();

            reader.onload = function (e) {
                let img = new Image();
                img.onload = function () {
                    let isSquare = img.width === img.height;
                    console.log('Image Size:', img.width, 'x', img.height, 'Square:', isSquare);

                    // If the image is not square, make it square
                    if (!isSquare) {
                        let canvas = document.createElement('canvas');
                        let ctx = canvas.getContext('2d');
                        let size = Math.max(img.width, img.height);
                        canvas.width = size;
                        canvas.height = size;

                        // Fill background with white
                        ctx.fillStyle = 'white';
                        ctx.fillRect(0, 0, size, size);

                        // Draw image in center
                        ctx.drawImage(img, (size - img.width) / 2, (size - img.height) / 2);

                        // Convert canvas to Blob and upload
                        canvas.toBlob(function (blob) {
                            uploadImage(blob, file.name, index, resolve, reject); // Pass resolve and reject
                        }, 'image/png');
                    } else {
                        // Directly upload the square image
                        uploadImage(dataURLtoBlob(e.target.result), file.name, index, resolve, reject); // Pass resolve and reject
                    }
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    // Function to upload image and update DOM after upload
    function uploadImage(imageBlob, filename, index, resolve, reject) {
        console.log(`Uploading image, filename: ${filename}`);
        let formData = new FormData();
        formData.append('file', imageBlob, filename);
        formData.append('name', filename);
        formData.append('chunk', 0);
        formData.append('chunks', 1);
        let url = location.origin + "/Ajax/plupload.php?username=qipeiyigouwang&set_type=2";

        // Use fetch to upload
        fetch(url, {
            method: 'POST',
            body: formData
        })
            .then(response => response.text())
            .then(responseText => {
                console.log('Upload successful:', responseText);
                // Assume the server response returns the image URL
                let uploadedImageUrl = responseText.trim().split("?")[0];  // Modify this based on your actual response

                // Resize image URL for thumbnail
                let resizedUrl = uploadedImageUrl + '?x-oss-process=image/resize,m_lfit,w_100,h_80,limit_0';

                // Immediately update the DOM after uploading
                updateDOM(resizedUrl, index); // Pass index to update DOM for the correct element
                resolve(); // Resolve the promise to proceed with the next image
            })
            .catch(error => {
                console.log('Upload failed:', error);
                reject(error); // Reject the promise if there's an error
            });
    }

    // Function to update the DOM once the image URL is available
    function updateDOM(imageUrl, index) {
        console.log(`Updating DOM for image index ${index}, with URL: ${imageUrl}`);

        let propicElement = $(`#propic${index}`);
        let picElement = $(`#pic${index}`);

        // Check if the corresponding DOM elements exist
        if (propicElement.length) {
            propicElement.find('img').attr('src', imageUrl);  // Set image src
            propicElement.css('display', 'table-row');  // Show the image row
        } else {
            console.log(`#propic${index} does not exist.`);
        }

        if (picElement.length) {
            picElement.val(imageUrl.split('?')[0]);  // Set the hidden input value (without query parameters)
        } else {
            console.log(`#pic${index} does not exist.`);
        }
    }
}
function guigetu_upload() {

    // --- 关键修复：将 uploadedUrls 与 files 提升到全局作用域 ---
    let uploadedUrls = [];
    let files = [];

    // 创建上传按钮事件
    $("#guigetu").click(function () {
        let $fileInput = $(this).next('input[type="file"]');

        // 先解绑旧事件
        $fileInput.off('change').on('change', function (event) {

            files = event.target.files;     // 赋值全局变量
            uploadedUrls = [];              // 每次上传前清空

            async function uploadFiles() {
                for (let i = 0; i < files.length; i++) {
                    await uploadFile(files[i], i + 1); // 逐个上传
                }
            }

            uploadFiles();  // 开始上传
        });

        $fileInput.trigger('click');
    });

    // DataURL 转 blob
    function dataURLtoBlob(dataURL) {
        const byteString = atob(dataURL.split(',')[1]);
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const uintArray = new Uint8Array(arrayBuffer);
        for (let i = 0; i < byteString.length; i++) {
            uintArray[i] = byteString.charCodeAt(i);
        }
        return new Blob([arrayBuffer], { type: 'image/png' });
    }

    // 处理并上传单个文件
    function uploadFile(file, index) {
        return new Promise((resolve, reject) => {
            let reader = new FileReader();

            reader.onload = function (e) {
                let img = new Image();
                img.onload = function () {

                    let isSquare = img.width === img.height;

                    if (!isSquare) {
                        let canvas = document.createElement('canvas');
                        let ctx = canvas.getContext('2d');
                        let size = Math.max(img.width, img.height);
                        canvas.width = size;
                        canvas.height = size;

                        ctx.fillStyle = 'white';
                        ctx.fillRect(0, 0, size, size);

                        // 居中绘制
                        ctx.drawImage(img, (size - img.width) / 2, (size - img.height) / 2);

                        canvas.toBlob(function (blob) {
                            uploadImage(blob, file.name, index, resolve, reject);
                        }, 'image/png');

                    } else {
                        uploadImage(
                            dataURLtoBlob(e.target.result),
                            file.name,
                            index,
                            resolve,
                            reject
                        );
                    }
                };
                img.src = e.target.result;
            };

            reader.readAsDataURL(file);
        });
    }

    // 上传图片到服务器
    function uploadImage(imageBlob, filename, index, resolve, reject) {

        let formData = new FormData();
        formData.append('file', imageBlob, filename);
        formData.append('name', filename);
        formData.append('chunk', 0);
        formData.append('chunks', 1);

        let url = location.origin + "/Ajax/plupload.php?username=qipeiyigouwang&type=10";

        fetch(url, {
            method: 'POST',
            body: formData
        })
            .then(response => response.text())
            .then(responseText => {

                let uploadedImageUrl = responseText.trim().split("?")[0];

                let resizedUrl = uploadedImageUrl + '?x-oss-process=image/resize,m_lfit,w_150,h_150,limit_0';

                uploadedUrls.push(resizedUrl);

                // 上传后立即更新 DOM
                updateDOM(uploadedUrls, index, files.length);

                resolve();
            })
            .catch(error => {
                console.log('Upload failed:', error);
                reject(error);
            });
    }

    // 更新表格中的图片
    function updateDOM(uploadedUrls, currentIndex, totalFiles) {

        $('#combination_table tr[data-sn]').each(function (index) {

            let tableRow = $(this);
            let rowIndex = index + 1;

            // 数组不够就循环使用
            let imageUrl = uploadedUrls[(rowIndex - 1) % uploadedUrls.length];

            tableRow.find('.img-td img').attr('src', imageUrl);

            tableRow.find('.img-td>input').val(imageUrl.split('?')[0]);

            tableRow.find('.img-td .del-tag').css('style', '');
        });
    }
}
export { open_close_shop_products, showKeyword, fetchChIdsAndTitles, checkProduct, zhutu_upload, guigetu_upload }
// End-379-2025.11.28.153750