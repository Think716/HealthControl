"use strict";
const common_vendor = require("../../common/vendor.js");
const store_index = require("../../store/index.js");
const utils_http = require("../../utils/http.js");
const common_assets = require("../../common/assets.js");
if (!Array) {
  const _easycom_uni_nav_bar2 = common_vendor.resolveComponent("uni-nav-bar");
  _easycom_uni_nav_bar2();
}
const _easycom_uni_nav_bar = () => "../../uni_modules/uni-nav-bar/components/uni-nav-bar/uni-nav-bar.js";
if (!Math) {
  _easycom_uni_nav_bar();
}
const _sfc_main = {
  __name: "HealthArticleDetail",
  setup(__props) {
    const commonStore = store_index.useCommonStore();
    common_vendor.computed(() => commonStore.Token);
    common_vendor.computed(() => commonStore.UserInfo);
    common_vendor.computed(() => commonStore.RoleType);
    const UserId = common_vendor.computed(() => commonStore.UserId);
    common_vendor.ref([]);
    common_vendor.reactive({});
    const HealthArticleId = common_vendor.ref(0);
    common_vendor.onLoad(async (option) => {
      HealthArticleId.value = option.HealthArticleId;
    });
    common_vendor.onShow(async () => {
      await AddViewCountApi();
      await GetHealthArticleApi();
      await CheckIsCollectApi();
      await CheckIsLikeRecordApi();
      await RecommendListApi();
    });
    common_vendor.onReady(async () => {
    });
    const goBack = () => {
      common_vendor.index.navigateBack();
    };
    const HealthArticle = common_vendor.ref({});
    const GetHealthArticleApi = async () => {
      let {
        Data
      } = await utils_http.Post("/HealthArticle/Get", { Id: HealthArticleId.value });
      HealthArticle.value = Data;
    };
    const AddViewCountApi = async () => {
      await utils_http.Post("/HealthArticle/AddViewCount", { Id: HealthArticleId.value });
    };
    const CollectId = common_vendor.ref(0);
    const LikeRecordId = common_vendor.ref(0);
    const CheckIsCollectApi = async () => {
      let {
        Success,
        Data
      } = await utils_http.Post("/CollectRecord/Get", {
        Id: 0,
        CollectUserId: UserId.value,
        CollectType: "健康知识",
        RelativeId: HealthArticleId.value
      });
      CollectId.value = Data.Id;
    };
    const CollectApi = async () => {
      if (CollectId.value > 0) {
        let {
          Success
        } = await utils_http.Post("/CollectRecord/Delete", {
          Id: CollectId.value
        });
        if (Success) {
          CollectId.value = 0;
          common_vendor.index.showToast({
            title: "取消收藏",
            icon: "none"
          });
        }
      } else {
        let {
          Success,
          Data
        } = await utils_http.Post("/CollectRecord/CreateOrEdit", {
          CollectUserId: UserId.value,
          CollectType: "健康知识",
          RelativeId: HealthArticleId.value
        });
        if (Success) {
          CollectId.value = Data.Id;
          common_vendor.index.showToast({
            title: "收藏成功",
            icon: "none"
          });
        }
      }
    };
    const CheckIsLikeRecordApi = async () => {
      let {
        Success,
        Data
      } = await utils_http.Post("/LikeRecord/Get", {
        Id: 0,
        LikeUserId: UserId.value,
        LikeType: "健康知识",
        RelativeId: HealthArticleId.value
      });
      LikeRecordId.value = Data.Id;
    };
    const LikeRecordApi = async () => {
      if (LikeRecordId.value > 0) {
        let {
          Success
        } = await utils_http.Post("/LikeRecord/Delete", {
          Id: LikeRecordId.value
        });
        if (Success) {
          LikeRecordId.value = 0;
          common_vendor.index.showToast({
            title: "取消点赞",
            icon: "none"
          });
        }
      } else {
        let {
          Success,
          Data
        } = await utils_http.Post("/LikeRecord/CreateOrEdit", {
          LikeUserId: UserId.value,
          LikeType: "健康知识",
          RelativeId: HealthArticleId.value
        });
        if (Success) {
          LikeRecordId.value = Data.Id;
          common_vendor.index.showToast({
            title: "点赞成功",
            icon: "none"
          });
        }
      }
    };
    const RecommendList = common_vendor.ref([]);
    const RecommendListApi = async () => {
      let {
        Data
      } = await utils_http.Post("/HealthArticle/RecommendList", {
        Id: HealthArticleId.value
      });
      RecommendList.value = Data;
    };
    const formatDate = (dateString) => {
      if (!dateString)
        return "";
      const date = new Date(dateString);
      return date.toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      });
    };
    const goToDetail = (articleId) => {
      common_vendor.index.redirectTo({
        url: `/pages/Front/HealthArticleDetail?HealthArticleId=${articleId}`
      });
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
          title: "健康知识"
        }),
        c: common_vendor.t(HealthArticle.value.Title),
        d: HealthArticle.value.PublishUserDto
      }, HealthArticle.value.PublishUserDto ? {
        e: HealthArticle.value.PublishUserDto.ImageUrls || common_vendor.unref(common_assets.defaultAvatar),
        f: common_vendor.t(HealthArticle.value.PublishUserDto.Name || HealthArticle.value.PublishUserDto.UserName)
      } : {}, {
        g: common_vendor.t(HealthArticle.value.HealthArticleTypeDto && HealthArticle.value.HealthArticleTypeDto.Name),
        h: HealthArticle.value.Content,
        i: common_vendor.t(formatDate(HealthArticle.value.CreationTime)),
        j: common_vendor.t(HealthArticle.value.ViewCount),
        k: RecommendList.value.length > 0
      }, RecommendList.value.length > 0 ? {
        l: common_vendor.f(RecommendList.value, (item, k0, i0) => {
          return {
            a: item.Cover,
            b: common_vendor.t(item.Title),
            c: common_vendor.t(item.ViewCount),
            d: common_vendor.t(formatDate(item.CreationTime)),
            e: common_vendor.t(item.HealthArticleTypeDto && item.HealthArticleTypeDto.Name),
            f: common_vendor.t(item.PublishUserDto && (item.PublishUserDto.Name || item.PublishUserDto.UserName)),
            g: item.Id,
            h: common_vendor.o(($event) => goToDetail(item.Id), item.Id)
          };
        })
      } : {}, {
        m: common_vendor.t(CollectId.value > 0 ? "❤️" : "🤍"),
        n: common_vendor.t(CollectId.value > 0 ? "已收藏" : "收藏"),
        o: CollectId.value > 0 ? 1 : "",
        p: CollectId.value > 0 ? 1 : "",
        q: common_vendor.o(CollectApi),
        r: common_vendor.t(LikeRecordId.value > 0 ? "👍" : "👍🏻"),
        s: common_vendor.t(LikeRecordId.value > 0 ? "已点赞" : "点赞"),
        t: LikeRecordId.value > 0 ? 1 : "",
        v: LikeRecordId.value > 0 ? 1 : "",
        w: common_vendor.o(LikeRecordApi)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-73aaf5e4"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/Front/HealthArticleDetail.js.map
