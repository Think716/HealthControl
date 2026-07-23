"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_http = require("../../utils/http.js");
const store_index = require("../../store/index.js");
if (!Array) {
  const _easycom_uni_nav_bar2 = common_vendor.resolveComponent("uni-nav-bar");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_uni_nav_bar2 + _easycom_uni_icons2 + _easycom_uni_popup2)();
}
const _easycom_uni_nav_bar = () => "../../uni_modules/uni-nav-bar/components/uni-nav-bar/uni-nav-bar.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_uni_nav_bar + _easycom_uni_icons + _easycom_uni_popup)();
}
const _sfc_main = {
  __name: "FitnessVideoList",
  setup(__props) {
    const commonStore = store_index.useCommonStore();
    const UserId = common_vendor.computed(() => commonStore.UserId);
    const profile = common_vendor.ref({});
    const videos = common_vendor.ref([]);
    const currentVideo = common_vendor.ref({});
    const videoPopup = common_vendor.ref(null);
    common_vendor.onShow(async () => {
      await Promise.all([loadProfile(), loadVideos()]);
    });
    const loadProfile = async () => {
      const res = await utils_http.Post("/FitnessVideo/BmiProfile", { UserId: UserId.value });
      if (res.Success)
        profile.value = res.Data || {};
    };
    const loadVideos = async () => {
      const res = await utils_http.Post("/FitnessVideo/RecommendList", { UserId: UserId.value, Limit: 10 });
      if (res.Success)
        videos.value = res.Data || [];
    };
    const play = (video) => {
      if (!video.VideoUrl) {
        common_vendor.index.showToast({ title: "视频地址为空", icon: "none" });
        return;
      }
      currentVideo.value = video;
      videoPopup.value.open();
    };
    const goHealthRecord = () => {
      common_vendor.index.navigateTo({ url: "/pages/Front/BatchRecordForm" });
    };
    const previewImages = (urls, index) => {
      common_vendor.index.previewImage({ urls, current: index });
    };
    const goBack = () => common_vendor.index.navigateBack();
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
          title: "AI健身视频推荐"
        }),
        c: common_vendor.t(profile.value.BMI ? Number(profile.value.BMI).toFixed(2) : "--"),
        d: common_vendor.t(profile.value.BmiCategory || "通用"),
        e: common_vendor.t(profile.value.HealthLayer || "待完善健康数据人群"),
        f: common_vendor.t(profile.value.Recommendation || "完善身高、体重和BMI记录后，系统会自动生成推荐。"),
        g: common_vendor.o(goHealthRecord),
        h: videos.value.length === 0
      }, videos.value.length === 0 ? {
        i: common_vendor.p({
          type: "videocam",
          size: "56",
          color: "#ccc"
        })
      } : {}, {
        j: common_vendor.f(videos.value, (video, k0, i0) => {
          return common_vendor.e({
            a: video.Cover
          }, video.Cover ? {
            b: video.Cover
          } : {
            c: "871ee623-2-" + i0,
            d: common_vendor.p({
              type: "videocam",
              size: "42",
              color: "#bbb"
            })
          }, {
            e: common_vendor.o(($event) => play(video), video.Id),
            f: common_vendor.t(video.Title),
            g: common_vendor.t(video.Level || "入门"),
            h: common_vendor.t(video.DurationMinutes || 0),
            i: common_vendor.t(video.Calories || 0),
            j: common_vendor.t(video.TrainingGoal || "健康训练"),
            k: common_vendor.t(video.RecommendReason),
            l: video.ImageUrls
          }, video.ImageUrls ? {
            m: common_vendor.f(video.ImageUrls.split(","), (url, idx, i1) => {
              return {
                a: idx,
                b: url,
                c: common_vendor.o(($event) => previewImages(video.ImageUrls.split(","), idx), idx)
              };
            })
          } : {}, {
            n: video.Content
          }, video.Content ? {
            o: video.Content
          } : {}, {
            p: video.Id
          });
        }),
        k: currentVideo.value.VideoUrl
      }, currentVideo.value.VideoUrl ? {
        l: currentVideo.value.VideoUrl
      } : {}, {
        m: common_vendor.t(currentVideo.value.Title),
        n: common_vendor.o(($event) => videoPopup.value.close()),
        o: common_vendor.sr(videoPopup, "871ee623-3", {
          "k": "videoPopup"
        }),
        p: common_vendor.p({
          type: "center"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-871ee623"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/Front/FitnessVideoList.js.map
