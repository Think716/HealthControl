"use strict";
const common_vendor = require("../../common/vendor.js");
const store_index = require("../../store/index.js");
const utils_http = require("../../utils/http.js");
if (!Array) {
  const _easycom_uni_nav_bar2 = common_vendor.resolveComponent("uni-nav-bar");
  const _easycom_uni_search_bar2 = common_vendor.resolveComponent("uni-search-bar");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  (_easycom_uni_nav_bar2 + _easycom_uni_search_bar2 + _easycom_uni_icons2 + _easycom_uni_load_more2)();
}
const _easycom_uni_nav_bar = () => "../../uni_modules/uni-nav-bar/components/uni-nav-bar/uni-nav-bar.js";
const _easycom_uni_search_bar = () => "../../uni_modules/uni-search-bar/components/uni-search-bar/uni-search-bar.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_load_more = () => "../../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
if (!Math) {
  (_easycom_uni_nav_bar + _easycom_uni_search_bar + _easycom_uni_icons + _easycom_uni_load_more)();
}
const _sfc_main = {
  __name: "RecipeList",
  setup(__props) {
    const commonStore = store_index.useCommonStore();
    common_vendor.computed(() => commonStore.Token);
    common_vendor.computed(() => commonStore.UserInfo);
    common_vendor.computed(() => commonStore.RoleType);
    common_vendor.computed(() => commonStore.UserId);
    const RecipeList = common_vendor.ref([]);
    const searchKeyWord = common_vendor.ref("");
    const loadStatus = common_vendor.ref("more");
    const where = common_vendor.reactive({
      KeyWord: ""
    });
    common_vendor.onLoad(async (option) => {
    });
    common_vendor.onShow(async () => {
      GetRecipeListApi();
    });
    common_vendor.onReady(async () => {
    });
    const goBack = () => {
      common_vendor.index.navigateBack();
    };
    const GetRecipeListApi = async () => {
      try {
        loadStatus.value = "loading";
        const { Data } = await utils_http.Post("/Recipe/List", where);
        const Items = (Data == null ? void 0 : Data.Items) || [];
        const processedItems = Items.map((recipe) => ({
          ...recipe,
          imageList: recipe.ImageUrls ? recipe.ImageUrls.split(",").filter((url) => url.trim()).slice(0, 4) : []
        }));
        RecipeList.value = processedItems;
        loadStatus.value = Items.length > 0 ? "more" : "noMore";
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/Front/RecipeList.vue:124", "获取食谱列表失败:", error);
        loadStatus.value = "more";
      }
    };
    const handleSearch = (value) => {
      where.KeyWord = value;
      GetRecipeListApi();
    };
    const goToDetail = (id) => {
      common_vendor.index.navigateTo({
        url: `/pages/Front/RecipeDetail?RecipeId=${id}`
      });
    };
    const getPlainText = (htmlContent) => {
      if (!htmlContent)
        return "";
      return htmlContent.replace(/<[^>]*>/g, "").substring(0, 100) + "...";
    };
    const formatTime = (timeStr) => {
      if (!timeStr)
        return "";
      const date = new Date(timeStr);
      const now = /* @__PURE__ */ new Date();
      const diff = now - date;
      if (diff < 6e4)
        return "刚刚";
      if (diff < 36e5)
        return Math.floor(diff / 6e4) + "分钟前";
      if (diff < 864e5)
        return Math.floor(diff / 36e5) + "小时前";
      if (diff < 2592e6)
        return Math.floor(diff / 864e5) + "天前";
      return timeStr.split(" ")[0];
    };
    const getStatusClass = (status) => {
      switch (status) {
        case 1:
          return "status-pending";
        case 2:
          return "status-approved";
        case 3:
          return "status-rejected";
        default:
          return "status-pending";
      }
    };
    const previewImage = (current, urls) => {
      common_vendor.index.previewImage({
        current,
        urls
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
          title: "食谱列表"
        }),
        c: common_vendor.o(handleSearch),
        d: common_vendor.o(($event) => searchKeyWord.value = $event),
        e: common_vendor.p({
          placeholder: "搜索食谱...",
          modelValue: searchKeyWord.value
        }),
        f: common_vendor.f(RecipeList.value, (recipe, k0, i0) => {
          return common_vendor.e({
            a: recipe.Cover,
            b: "f70ba15e-2-" + i0,
            c: common_vendor.t(recipe.ViewCount),
            d: common_vendor.t(recipe.Title),
            e: common_vendor.t(getPlainText(recipe.Content)),
            f: recipe.imageList && recipe.imageList.length > 0
          }, recipe.imageList && recipe.imageList.length > 0 ? {
            g: common_vendor.f(recipe.imageList, (img, index, i1) => {
              return {
                a: index,
                b: img,
                c: common_vendor.o(($event) => previewImage(img, recipe.imageList), index)
              };
            })
          } : {}, {
            h: common_vendor.t(recipe.PublishUserDto.Name),
            i: common_vendor.t(formatTime(recipe.CreationTime)),
            j: common_vendor.t(recipe.AuditStatusFormat),
            k: common_vendor.n(getStatusClass(recipe.AuditStatus)),
            l: recipe.Id,
            m: common_vendor.o(($event) => goToDetail(recipe.Id), recipe.Id)
          });
        }),
        g: common_vendor.p({
          type: "eye",
          size: "14",
          color: "#fff"
        }),
        h: RecipeList.value.length === 0
      }, RecipeList.value.length === 0 ? {
        i: common_vendor.p({
          type: "info",
          size: "60",
          color: "#ccc"
        })
      } : {}, {
        j: RecipeList.value.length > 0
      }, RecipeList.value.length > 0 ? {
        k: common_vendor.p({
          status: loadStatus.value
        })
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-f70ba15e"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/Front/RecipeList.js.map
