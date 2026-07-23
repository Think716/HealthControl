"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_http = require("../../utils/http.js");
const store_index = require("../../store/index.js");
if (!Array) {
  const _easycom_uni_nav_bar2 = common_vendor.resolveComponent("uni-nav-bar");
  _easycom_uni_nav_bar2();
}
const _easycom_uni_nav_bar = () => "../../uni_modules/uni-nav-bar/components/uni-nav-bar/uni-nav-bar.js";
if (!Math) {
  _easycom_uni_nav_bar();
}
const _sfc_main = {
  __name: "CommunityForm",
  setup(__props) {
    const commonStore = store_index.useCommonStore();
    const UserId = common_vendor.computed(() => commonStore.UserId);
    const postTypes = ["健康饮食分享", "减脂打卡", "增肌打卡", "健身心得", "健康生活记录", "食谱分享"];
    const tags = common_vendor.ref([]);
    const selectedTags = common_vendor.ref([]);
    const images = common_vendor.ref([]);
    const form = common_vendor.reactive({
      PublishUserId: null,
      PostType: "健康生活记录",
      Content: "",
      ImageUrls: "",
      Tags: ""
    });
    common_vendor.index.__f__("log", "at pages/Front/CommunityForm.vue:56", "CommunityForm 页面已加载");
    common_vendor.onShow(() => {
      common_vendor.index.__f__("log", "at pages/Front/CommunityForm.vue:58", "CommunityForm onShow 触发");
      loadTags();
    });
    const loadTags = async () => {
      var _a;
      try {
        const res = await utils_http.Post("/CommunityTag/List", { Page: 1, Limit: 50 });
        common_vendor.index.__f__("log", "at pages/Front/CommunityForm.vue:65", "加载标签结果:", res);
        if (res.Success) {
          tags.value = ((_a = res == null ? void 0 : res.Data) == null ? void 0 : _a.Items) || [];
        } else {
          common_vendor.index.__f__("error", "at pages/Front/CommunityForm.vue:69", "加载标签失败:", res.Msg);
          tags.value = [
            { Id: 1, Name: "健康饮食" },
            { Id: 2, Name: "减脂打卡" },
            { Id: 3, Name: "增肌打卡" }
          ];
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/Front/CommunityForm.vue:78", "加载标签异常:", error);
        tags.value = [
          { Id: 1, Name: "健康饮食" },
          { Id: 2, Name: "减脂打卡" },
          { Id: 3, Name: "增肌打卡" }
        ];
      }
    };
    const onTypeChange = (e) => {
      form.PostType = postTypes[e.detail.value];
    };
    const toggleTag = (tag) => {
      selectedTags.value = selectedTags.value.includes(tag) ? selectedTags.value.filter((item) => item !== tag) : selectedTags.value.concat(tag);
    };
    const chooseImages = async () => {
      const files = await utils_http.UploadImageByCamera(9 - images.value.length);
      images.value = images.value.concat(files).slice(0, 9);
    };
    const removeImage = (index) => {
      images.value.splice(index, 1);
    };
    const submit = async () => {
      if (!form.Content.trim()) {
        common_vendor.index.showToast({ title: "请输入动态内容", icon: "none" });
        return;
      }
      try {
        common_vendor.index.__f__("log", "at pages/Front/CommunityForm.vue:113", "提交表单数据:", {
          ...form,
          PublishUserId: UserId.value,
          ImageUrls: images.value.join(","),
          Tags: selectedTags.value.join(",")
        });
        const res = await utils_http.Post("/CommunityPost/CreateOrEdit", {
          ...form,
          PublishUserId: UserId.value,
          ImageUrls: images.value.join(","),
          Tags: selectedTags.value.join(",")
        });
        common_vendor.index.__f__("log", "at pages/Front/CommunityForm.vue:125", "提交结果:", res);
        if (res.Success) {
          common_vendor.index.showToast({ title: "发布成功，等待审核", icon: "success" });
          setTimeout(() => common_vendor.index.navigateBack(), 800);
        } else {
          common_vendor.index.showToast({ title: res.Msg || "发布失败", icon: "none" });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/Front/CommunityForm.vue:133", "提交异常:", error);
        common_vendor.index.showToast({ title: "网络请求失败", icon: "none" });
      }
    };
    const goBack = () => {
      const pages = getCurrentPages();
      if (pages.length > 1) {
        common_vendor.index.navigateBack();
      } else {
        common_vendor.index.switchTab({ url: "/pages/Front/Index" });
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(goBack),
        b: common_vendor.p({
          dark: true,
          fixed: true,
          shadow: true,
          ["background-color"]: "var(--primary-color)",
          ["status-bar"]: true,
          ["left-icon"]: "left",
          ["left-text"]: "返回",
          title: "发布健康动态"
        }),
        c: common_vendor.t(form.PostType || "选择动态类型"),
        d: postTypes,
        e: common_vendor.o(onTypeChange),
        f: form.Content,
        g: common_vendor.o(($event) => form.Content = $event.detail.value),
        h: common_vendor.f(tags.value, (tag, k0, i0) => {
          return {
            a: common_vendor.t(tag.Name),
            b: tag.Id,
            c: selectedTags.value.includes("#" + tag.Name) ? 1 : "",
            d: common_vendor.o(($event) => toggleTag("#" + tag.Name), tag.Id)
          };
        }),
        i: common_vendor.f(images.value, (img, index, i0) => {
          return {
            a: img,
            b: img,
            c: common_vendor.o(($event) => removeImage(index), img)
          };
        }),
        j: images.value.length < 9
      }, images.value.length < 9 ? {
        k: common_vendor.o(chooseImages)
      } : {}, {
        l: common_vendor.o(submit)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-c81a5dde"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/Front/CommunityForm.js.map
