"use strict";
const common_vendor = require("../../common/vendor.js");
const store_index = require("../../store/index.js");
const utils_http = require("../../utils/http.js");
if (!Array) {
  const _easycom_uni_nav_bar2 = common_vendor.resolveComponent("uni-nav-bar");
  _easycom_uni_nav_bar2();
}
const _easycom_uni_nav_bar = () => "../../uni_modules/uni-nav-bar/components/uni-nav-bar/uni-nav-bar.js";
if (!Math) {
  _easycom_uni_nav_bar();
}
const _sfc_main = {
  __name: "LikeRecordList",
  setup(__props) {
    const commonStore = store_index.useCommonStore();
    common_vendor.computed(() => commonStore.Token);
    common_vendor.computed(() => commonStore.UserInfo);
    common_vendor.computed(() => commonStore.RoleType);
    common_vendor.computed(() => commonStore.UserId);
    const LikeRecordList = common_vendor.ref([]);
    const activeTab = common_vendor.ref("健康知识");
    const healthArticleList = common_vendor.computed(() => {
      return LikeRecordList.value.filter((item) => item.LikeType === "健康知识");
    });
    const recipeList = common_vendor.computed(() => {
      return LikeRecordList.value.filter((item) => item.LikeType === "食谱");
    });
    const where = common_vendor.reactive({});
    common_vendor.onLoad(async (option) => {
    });
    common_vendor.onShow(async () => {
      GetLikeRecordListApi();
    });
    common_vendor.onReady(async () => {
    });
    const goBack = () => {
      common_vendor.index.navigateBack();
    };
    const switchTab = (tab) => {
      activeTab.value = tab;
    };
    const GetLikeRecordListApi = async () => {
      const { Data } = await utils_http.Post("/LikeRecord/List", where);
      LikeRecordList.value = (Data == null ? void 0 : Data.Items) || [];
    };
    const ShowDeleteModal = async (Id) => {
      common_vendor.index.showModal({
        title: "提示",
        content: "确认删除该点赞记录吗？",
        success: async (res) => {
          if (res.confirm) {
            const { Success } = await utils_http.Post(`/LikeRecord/Delete`, { Id });
            if (Success) {
              await GetLikeRecordListApi();
              common_vendor.index.showToast({
                title: "删除成功",
                icon: "success"
              });
            }
          }
        }
      });
    };
    const goToDetail = (item) => {
      if (item.LikeType === "健康知识") {
        common_vendor.index.navigateTo({
          url: `/pages/Front/HealthArticleDetail?HealthArticleId=${item.RelativeId}`
        });
      } else if (item.LikeType === "食谱") {
        common_vendor.index.navigateTo({
          url: `/pages/Front/RecipeDetail?RecipeId=${item.RelativeId}`
        });
      }
    };
    const formatTime = (timeStr) => {
      const date = new Date(timeStr);
      const now = /* @__PURE__ */ new Date();
      const diff = now - date;
      const minutes = Math.floor(diff / (1e3 * 60));
      const hours = Math.floor(diff / (1e3 * 60 * 60));
      const days = Math.floor(diff / (1e3 * 60 * 60 * 24));
      if (minutes < 60) {
        return minutes <= 0 ? "刚刚" : `${minutes}分钟前`;
      } else if (hours < 24) {
        return `${hours}小时前`;
      } else if (days < 7) {
        return `${days}天前`;
      } else {
        return timeStr.split(" ")[0];
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
          title: "点赞记录列表"
        }),
        c: activeTab.value === "健康知识" ? 1 : "",
        d: common_vendor.o(($event) => switchTab("健康知识")),
        e: activeTab.value === "食谱" ? 1 : "",
        f: common_vendor.o(($event) => switchTab("食谱")),
        g: activeTab.value === "健康知识"
      }, activeTab.value === "健康知识" ? common_vendor.e({
        h: healthArticleList.value.length === 0
      }, healthArticleList.value.length === 0 ? {} : {
        i: common_vendor.f(healthArticleList.value, (item, k0, i0) => {
          return {
            a: item.HealthArticleDto.Cover,
            b: common_vendor.t(item.HealthArticleDto.Title),
            c: common_vendor.t(item.HealthArticleDto.ViewCount),
            d: common_vendor.t(formatTime(item.CreationTime)),
            e: common_vendor.o(($event) => ShowDeleteModal(item.Id), item.Id),
            f: item.Id,
            g: common_vendor.o(($event) => goToDetail(item), item.Id)
          };
        })
      }) : {}, {
        j: activeTab.value === "食谱"
      }, activeTab.value === "食谱" ? common_vendor.e({
        k: recipeList.value.length === 0
      }, recipeList.value.length === 0 ? {} : {
        l: common_vendor.f(recipeList.value, (item, k0, i0) => {
          return {
            a: item.RecipeDto.Cover,
            b: common_vendor.t(item.RecipeDto.Title),
            c: common_vendor.t(item.RecipeDto.ViewCount),
            d: common_vendor.t(formatTime(item.CreationTime)),
            e: common_vendor.o(($event) => ShowDeleteModal(item.Id), item.Id),
            f: item.Id,
            g: common_vendor.o(($event) => goToDetail(item), item.Id)
          };
        })
      }) : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-f79e9276"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/Front/LikeRecordList.js.map
