"use strict";
const common_vendor = require("../../common/vendor.js");
const store_index = require("../../store/index.js");
const utils_http = require("../../utils/http.js");
if (!Array) {
  const _easycom_uni_nav_bar2 = common_vendor.resolveComponent("uni-nav-bar");
  const _easycom_footer_bar2 = common_vendor.resolveComponent("footer-bar");
  (_easycom_uni_nav_bar2 + _easycom_footer_bar2)();
}
const _easycom_uni_nav_bar = () => "../../uni_modules/uni-nav-bar/components/uni-nav-bar/uni-nav-bar.js";
const _easycom_footer_bar = () => "../../components/footer-bar/footer-bar.js";
if (!Math) {
  (_easycom_uni_nav_bar + _easycom_footer_bar)();
}
const _sfc_main = {
  __name: "Index",
  setup(__props) {
    const commonStore = store_index.useCommonStore();
    common_vendor.computed(() => commonStore.Token);
    common_vendor.computed(() => commonStore.UserInfo);
    common_vendor.computed(() => commonStore.RoleType);
    const UserId = common_vendor.computed(() => commonStore.UserId);
    const todayRecordList = common_vendor.ref([]);
    const TodayRecordListApi = async () => {
      let {
        Data
      } = await utils_http.Post("/HealthIndicatorRecord/TodayRecordList", {
        RecordUserId: UserId.value
      });
      todayRecordList.value = Data;
    };
    const healthArticleList = common_vendor.ref([]);
    const healthPages = common_vendor.computed(() => {
      if (todayRecordList.value.length === 0)
        return [];
      const pages = [];
      const pageSize = 4;
      for (let i = 0; i < todayRecordList.value.length; i += pageSize) {
        pages.push(todayRecordList.value.slice(i, i + pageSize));
      }
      return pages;
    });
    const ToDietRecordList = () => {
      common_vendor.index.navigateTo({
        url: "/pages/Front/DietRecordList"
      });
    };
    const ToHealthRecordList = () => {
      common_vendor.index.navigateTo({
        url: "/pages/Front/HealthIndicatorRecordList"
      });
    };
    const ToHealthArticleList = () => {
      common_vendor.index.navigateTo({
        url: "/pages/Front/HealthArticleList"
      });
    };
    const ToHealthArticleDetail = (articleId) => {
      common_vendor.index.navigateTo({
        url: `/pages/Front/HealthArticleDetail?HealthArticleId=${articleId}`
      });
    };
    const ToRecipeList = () => {
      common_vendor.index.navigateTo({
        url: "/pages/Front/RecipeList"
      });
    };
    const ToHealthNoticeList = () => {
      common_vendor.index.navigateTo({
        url: "/pages/Front/HealthNoticeList"
      });
    };
    const ToHealthView = () => {
      common_vendor.index.navigateTo({
        url: "/pages/Front/HealthView"
      });
    };
    const ToAiAnalyse = () => {
      common_vendor.index.navigateTo({
        url: "/pages/Front/AiAnalyse"
      });
    };
    const getArticleDesc = (content) => {
      if (!content)
        return "暂无描述";
      const plainText = content.replace(/<[^>]*>/g, "");
      return plainText.length > 50 ? plainText.substring(0, 50) + "..." : plainText;
    };
    const formatTime = (timeStr) => {
      if (!timeStr)
        return "";
      const now = /* @__PURE__ */ new Date();
      const articleTime = new Date(timeStr);
      const diff = now - articleTime;
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
        return articleTime.toLocaleDateString("zh-CN", {
          month: "2-digit",
          day: "2-digit"
        });
      }
    };
    const formatRecordValue = (value) => {
      if (value === null || value === void 0)
        return "--";
      return Number(value) % 1 === 0 ? value.toString() : Number(value).toFixed(1);
    };
    const getHealthIndicatorUnit = (name) => {
      const unitMap = {
        "体温": "℃",
        "体重": "kg",
        "身高": "cm",
        "心率": "次/分",
        "血压": "mmHg",
        "空腹血糖": "mmol/L",
        "餐后2小时血糖": "mmol/L",
        "血糖": "mmol/L",
        "胆固醇": "mmol/L",
        "血红蛋白": "g/L",
        "白细胞": "×10⁹/L",
        "血小板": "×10⁹/L"
      };
      for (const [key, unit] of Object.entries(unitMap)) {
        if (name && name.includes(key)) {
          return unit;
        }
      }
      return "";
    };
    const GetHealthArticleListApi = async () => {
      try {
        const response = await utils_http.Post("/HealthArticle/List", {
          Page: 1,
          Limit: 6,
          // 首页只显示2条最新资讯
          AuditStatus: 2,
          SortItem: {
            FieldName: "ViewCount",
            IsAsc: false
          }
        });
        if (response.Success && response.Data && response.Data.Items) {
          healthArticleList.value = response.Data.Items;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/Front/Index.vue:334", "获取健康知识列表失败:", error);
        common_vendor.index.showToast({
          title: "获取数据失败",
          icon: "error"
        });
      }
    };
    common_vendor.onLoad(() => {
    });
    common_vendor.onShow(() => {
      if (commonStore.CheckIsLogin()) {
        setTimeout(() => {
          GetHealthArticleListApi();
          TodayRecordListApi();
        }, 300);
      }
    });
    common_vendor.onHide(() => {
    });
    common_vendor.onUnload(() => {
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          dark: true,
          fixed: true,
          shadow: true,
          ["background-color"]: "var(--primary-color)",
          ["status-bar"]: true,
          title: "健康管理"
        }),
        b: common_vendor.o(($event) => ToHealthRecordList()),
        c: common_vendor.f(healthPages.value, (page, pageIndex, i0) => {
          return {
            a: common_vendor.f(page, (record, k1, i1) => {
              return common_vendor.e({
                a: record.HealthIndicatorDto.Cover
              }, record.HealthIndicatorDto.Cover ? {
                b: record.HealthIndicatorDto.Cover
              } : {}, {
                c: common_vendor.t(record.HealthIndicatorDto.Name),
                d: common_vendor.t(formatRecordValue(record.RecordValue)),
                e: common_vendor.t(getHealthIndicatorUnit(record.HealthIndicatorDto.Name)),
                f: record.IsAbnormity === "Y"
              }, record.IsAbnormity === "Y" ? {} : {}, {
                g: record.HealthIndicatorDto.Id,
                h: record.IsAbnormity === "Y" ? 1 : "",
                i: common_vendor.o(($event) => ToHealthRecordList(), record.HealthIndicatorDto.Id)
              });
            }),
            b: common_vendor.f(4 - page.length, (n, k1, i1) => {
              return {
                a: "empty-" + pageIndex + "-" + n,
                b: common_vendor.o(($event) => ToHealthRecordList(), "empty-" + pageIndex + "-" + n)
              };
            }),
            c: pageIndex
          };
        }),
        d: todayRecordList.value.length === 0
      }, todayRecordList.value.length === 0 ? {
        e: common_vendor.f(4, (n, k0, i0) => {
          return {
            a: "placeholder-" + n,
            b: common_vendor.o(($event) => ToHealthRecordList(), "placeholder-" + n)
          };
        })
      } : {}, {
        f: healthPages.value.length > 1,
        g: common_vendor.o(($event) => ToHealthRecordList()),
        h: common_vendor.o(($event) => ToHealthView()),
        i: common_vendor.o(($event) => ToAiAnalyse()),
        j: common_vendor.o(($event) => ToDietRecordList()),
        k: common_vendor.o(($event) => ToHealthNoticeList()),
        l: common_vendor.o(($event) => ToHealthArticleList()),
        m: common_vendor.o(($event) => ToRecipeList()),
        n: common_vendor.o(($event) => ToHealthArticleList()),
        o: common_vendor.f(healthArticleList.value, (article, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(article.Title),
            b: common_vendor.t(getArticleDesc(article.Content)),
            c: common_vendor.t(formatTime(article.CreationTime)),
            d: common_vendor.t(article.HealthArticleTypeDto.Name),
            e: common_vendor.t(article.ViewCount),
            f: article.Cover
          }, article.Cover ? {
            g: article.Cover
          } : {}, {
            h: article.Id,
            i: common_vendor.o(($event) => ToHealthArticleDetail(article.Id), article.Id)
          });
        }),
        p: healthArticleList.value.length === 0
      }, healthArticleList.value.length === 0 ? {} : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-b146bd57"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/Front/Index.js.map
