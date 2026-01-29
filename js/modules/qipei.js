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
                <input type="button" value="上传主图" id="zhutu">
                <input type="file" accept=".jpg,.gif,.png" multiple>
                <input type="button" value="上传规格图" id="guigetu">
                <input type="file" accept=".jpg,.gif,.png" multiple>
                <input type="button" value="上传详情图" id="xiangqingtu">
                <input type="file" accept=".jpg,.gif,.png" multiple>
                <input type="button" value="" id="uploadProgress">
            </td>
        </tr>
        `;
    if ($("#add_guige").length) {
        $("#add_guige").parents("tr").before(html);
    }
    else {
        $("#mp4_upload").parents("tr").before(html);
    }
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
        let url = location.origin + `/Ajax/plupload.php?username=${publics.getUrlParameter(location.href, "username")}&set_type=2`;

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

        let url = location.origin + `/Ajax/plupload.php?username=${publics.getUrlParameter(location.href, "username")}&type=10`;

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
function xiangqingtu_upload() {
    // 用于存储上传进度
    let totalImages = 0; // 总共需要上传的图片数
    let completedImages = 0; // 已上传成功的图片数
    let failedImages = 0; // 上传失败的图片数

    // 页面加载时，移除a标签的onclick事件

    $('#submit_msg a').attr('onclick', "");

    $("#xiangqingtu").click(() => {
        // 获取iframe中的图片元素
        var iframe = $('#ueditor_0').contents();
        var images = iframe.find('img');

        totalImages = images.length; // 设置总共需要上传的图片数
        updateProgress(); // 更新上传进度

        images.each(function () {
            var img = $(this);
            var imageUrl = img.attr('src');
            var alt = img.attr('alt');

            // 获取图片的二进制数据并上传
            fetchImageData(imageUrl).then(function (imageData) {
                // 动态获取图片类型和大小
                var filetype = getImageFileType(imageData);
                var filesize = imageData.byteLength;
                console.log(filetype);
                console.log(filesize);
                // 上传图片
                uploadImage(imageData, filetype, filesize, img, alt);
            }).catch(function (error) {
                console.error('获取图片数据失败:', error);
                failedImages++; // 失败次数加1
                updateProgress(); // 更新进度
            });
        });
    });
    // 获取图片二进制数据
    function fetchImageData(url) {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: 'GET',
                // url: url.match(/^([^\s]+?\.(jpg|jpeg|png|gif|bmp|webp))/i)[1],
                url: url.match(/^([^\s?#]+?\.(jpg|jpeg|png|gif|bmp|webp))/i),
                responseType: 'arraybuffer',
                onload: function (response) {
                    if (response.status === 200) {
                        resolve(response.response);
                    } else {
                        reject('图片下载失败');
                    }
                },
                onerror: function () {
                    reject('请求失败');
                }
            });
        });
    }

    // 获取图片类型
    function getImageFileType(imageData) {
        var view = new DataView(imageData);
        var signature = view.getUint32(0, false); // 获取文件头部的前四个字节

        // 判断图片类型
        if (signature === 0x89504e47) return 'image/png'; // PNG
        if (signature === 0xffd8ffe0 || signature === 0xffd8ffe1) return 'image/jpeg'; // JPEG
        return 'image/octet-stream'; // Default binary stream
    }

    // 上传图片
    function uploadImage(imageData, filetype, filesize, img, alt) {
        var filename = 'image' + Date.now() + '.' + filetype.split('/')[1]; // 文件名动态生成
        var lastModifiedDate = new Date().toISOString();

        var boundary = '----geckoformboundary' + Math.random().toString(36).substring(2, 15);
        var formData = new FormData();
        formData.append('id', 'WU_FILE_0');
        formData.append('name', filename);
        formData.append('type', filetype);
        formData.append('lastModifiedDate', lastModifiedDate);
        formData.append('size', filesize);

        var blob = new Blob([imageData], { type: filetype });
        formData.append('upfile', blob, filename);

        // 动态设置请求头
        var origin = location.origin;
        var referer = origin + '/ueditor/dialogs/image/image.html';

        GM_xmlhttpRequest({
            method: 'POST',
            url: origin + '/ueditor/php/controller.php?action=uploadimage&encode=gbk&nozip=1',
            data: formData,
            headers: {
                'X_Requested_With': 'XMLHttpRequest',
                'DNT': '1',
                'Sec-GPC': '1',
                'Origin': origin,
                'Referer': referer,
                'Cookie': document.cookie,
                'Idempotency-Key': Math.random().toString(36).substring(2, 15)
            },
            onload: function (response) {
                var responseData = JSON.parse(response.responseText);
                var uploadedImageUrl = responseData.url.replace(/\\\//g, '/');
                var title = responseData.title;

                console.log('图片上传成功:');
                console.log('图片URL:', uploadedImageUrl);
                console.log('图片标题:', title);

                // 手动构建按顺序的图片标签
                var customImgTag = `<img src="${uploadedImageUrl}" style="vertical-align:top;" title="${title}" alt="${$("#proname").val()}" />`;

                // 替换原始img标签为手动构建的标签
                img.replaceWith(customImgTag);

                // 输出手动构建的完整图片标签
                console.log('手动构建的图片标签：', customImgTag);

                completedImages++; // 上传成功次数加1
                updateProgress(); // 更新进度
            },
            onerror: function (response) {
                console.error('图片上传失败:', response.statusText);
                failedImages++; // 失败次数加1
                updateProgress(); // 更新进度
            }
        });
    }

    // 更新上传进度并显示到页面上
    function updateProgress() {
        const progressText = `上传进度: ${completedImages}/${totalImages} 成功: ${completedImages} 失败: ${failedImages}`;
        $("#uploadProgress").val(progressText).css("display", "inline-block");
    }

    // 在提交按钮按下时，检查是否有未包含特定图片的图片
    $('#submit_msg a').on('click', function () {

        var iframe = $('#ueditor_0').contents();
        var images = iframe.find('img:not(.edui-upload-video.vjs-default-skin)');
        var hasInvalidImages = false;

        images.each(function () {
            var imgSrc = $(this).attr('src').trim();
            if (imgSrc && !imgSrc.includes('aimg8.dlssyht.cn')) {
                console.log(imgSrc);
                hasInvalidImages = true;
                // 为无效图片添加跑马灯彩条效果
                $(this).css({
                    'border': '5px solid',
                    'border-image': 'linear-gradient(to right, red 0%, orange 10%, yellow 20%, lime 30%, cyan 40%, blue 50%, purple 60%) 1',
                });
            }
        });

        if (hasInvalidImages) {
            alert('存在外链图片，请检查！');
            return false; // 禁止提交
        } else {
            // 检查通过，直接触发check_form()函数
            check_form();
        }
    });
}
function auto_city() {
    if (url.includes('shops_info.php')) {
        $('#city').on('change', async function () {
            const city = $('#city').val();
            await set('city', city);
        });
    }
    else if (url.includes('sc_product.php')) {
        let css = `
            <style>
                #submit_msg {
                    position: fixed !important;
                    right: 250px;
                    top: 50%;
                }
            </style>
            `;
        $("body").append(css);
        $('#proname').on('input', function () {
            const pronameValue = $(this).val();
            $('#keywords').val(pronameValue);
        });
        // 系统分类
        $('#big_id').on('change', async function () {
            const big_id = $('#big_id').val();
            await set('big_id', big_id);
        });
        get('big_id').then(big_id => {
            console.log("系统分类", big_id);
            if (big_id) {
                setInterval(() => {
                    if ($('#big_id').length) {
                        $('#big_id').val($(`#big_id option:contains(${big_id})`).val());
                    }
                }, 100);
            }
        });
        // 自定义分类-大类
        $('#shop_pro_class_big_id').on('change', async function () {
            const shop_pro_class_big_id = $('#shop_pro_class_big_id').val();
            await set('shop_pro_class_big_id', shop_pro_class_big_id);
        });
        get('shop_pro_class_big_id').then(shop_pro_class_big_id => {
            console.log("自定义分类-大类", shop_pro_class_big_id);
            if (shop_pro_class_big_id) {
                setInterval(() => {
                    if ($('#shop_pro_class_big_id').length) {
                        $('#shop_pro_class_big_id').val($(`#shop_pro_class_big_id option:contains(${shop_pro_class_big_id})`).val());
                    }
                }, 100);
            }
        });
        // 自定义分类-小类
        $('#shop_pro_class_sub_id').on('change', async function () {
            const shop_pro_class_sub_id = $('#shop_pro_class_sub_id').val();
            await set('shop_pro_class_sub_id', shop_pro_class_sub_id);
        });
        get('shop_pro_class_sub_id').then(shop_pro_class_sub_id => {
            console.log("自定义分类-小类", shop_pro_class_sub_id);
            if (shop_pro_class_sub_id) {
                setInterval(() => {
                    if ($('#shop_pro_class_sub_id').length) {
                        $('#shop_pro_class_sub_id').val($(`#shop_pro_class_sub_id option:contains(${shop_pro_class_sub_id})`).val());
                    }
                }, 100);
            }
        });
        // 服务专区
        $('input[name="exclusive_model"]').on('change', async function () {
            const selectedValue = $('input[name="exclusive_model"]:checked').val();
            await set('selectedValue', selectedValue);
        });
        get('selectedValue').then(selectedValue => {
            console.log("服务专区", selectedValue);
            if (selectedValue) {
                $('input[name="exclusive_model"][value="' + selectedValue + '"]').prop('checked', true);
            }
        });
        // 城市
        get('city').then(city => {
            console.log("城市", city);
            if (city) {
                $('#citycode').val($(`#citycode option:contains(${city})`).val());
            }
        });
        $('#submit_msg').on('mousedown', function () {
            let imagesHtml = '';
            let title = $("#proname").val();
            for (let i = 1; i <= 8; i++) {
                const img = $(`#propic${i} img`);
                if (img.length) {
                    const src = img.attr('src').split('?')[0];
                    imagesHtml += `<p><img src="${src}" title="${title}" alt="${title}" /></p>`;
                }
            }
            $("#ueditor_0").contents().find("body").html(imagesHtml);
        });
    }
}
export { open_close_shop_products, showKeyword, fetchChIdsAndTitles, checkProduct, zhutu_upload, guigetu_upload, xiangqingtu_upload, auto_city }
// End-647-2026.01.29.100154
