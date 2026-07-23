"use strict";
const common_vendor = require("../common/vendor.js");
const utils_cache = require("./cache.js");
let baseUrl = "http://localhost:7245";
async function Post(url, data) {
  let response = {
    Code: "",
    Data: "",
    Msg: "",
    Success: true
  };
  let header = {};
  const token = utils_cache.GetLoginToken();
  if (token) {
    header = {
      Authorization: `Bearer ${token}`
    };
  }
  await Request({
    url: baseUrl + url,
    data,
    method: "POST",
    header,
    dataType: "json"
  }).then((res) => {
    response.Success = res.Success;
    response.Msg = res.Msg;
    response.Code = res.Code;
    response.Data = res.Data;
  }).catch((err) => {
    response.Success = false;
    response.Msg = err;
  });
  return response;
}
var Request = function(option) {
  return new Promise((resolve, reject) => {
    common_vendor.index.request({
      url: option.url,
      data: option.data,
      method: option.method,
      header: option.header,
      dataType: option.dataType,
      success: async (res) => {
        if (res.statusCode == 404) {
          common_vendor.index.showToast({
            icon: "none",
            duration: 3e3,
            title: "请求的资源不存在404!"
          });
          reject("请求的资源不存在404!");
        } else if (res.statusCode == 500) {
          common_vendor.index.showToast({
            icon: "none",
            duration: 3e3,
            title: "服务后端出小差了!"
          });
          reject("服务后端出小差了!");
        } else if (res.statusCode == 200) {
          let {
            data: { Code, Msg, Success }
          } = res;
          if (Code == "401") {
            await store.dispatch("TokenLose", {});
            reject("你没有权限访问");
          } else if (Code == "500") {
            common_vendor.index.showToast({
              icon: "none",
              duration: 3e3,
              title: Msg
            });
            reject(Msg);
          }
          resolve(res.data);
        }
      },
      fail: (err) => {
        common_vendor.index.__f__("log", "at utils/http.js:152", err);
        reject(err);
      }
    });
  });
};
var Upload = function(filePath) {
  return new Promise((resolve, reject) => {
    common_vendor.index.uploadFile({
      url: baseUrl + "/File/BatchUpload",
      filePath,
      name: "file",
      success: (uploadFileRes) => {
        resolve(JSON.parse(uploadFileRes.data));
      }
    });
  });
};
var UploadImageByCamera = function(count = 1) {
  return new Promise((resolve, reject) => {
    common_vendor.index.chooseImage({
      count,
      sizeType: ["original", "compressed"],
      sourceType: ["album", "camera"],
      success: async (res) => {
        let { tempFilePaths } = res;
        let fileList = [];
        for (let i = 0; i < tempFilePaths.length; i++) {
          let response = await Upload(tempFilePaths[i]);
          fileList.push(response.Data[0]);
        }
        resolve(fileList);
      }
    });
  });
};
exports.Post = Post;
exports.Upload = Upload;
exports.UploadImageByCamera = UploadImageByCamera;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/http.js.map
