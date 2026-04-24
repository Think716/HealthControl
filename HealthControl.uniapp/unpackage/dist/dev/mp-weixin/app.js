"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
const store_index = require("./store/index.js");
if (!Math) {
  "./pages/Front/Login.js";
  "./pages/Front/Index.js";
  "./pages/Front/Register.js";
  "./pages/Front/ForgetPassword.js";
  "./pages/Front/UserCenter.js";
  "./pages/Front/PasswordEdit.js";
  "./pages/Front/UserInfoEdit.js";
  "./pages/Front/HealthIndicatorList.js";
  "./pages/Front/HealthIndicatorTypeList.js";
  "./pages/Front/CommHealthIndicatorTypeList.js";
  "./pages/Front/HealthIndicatorForm.js";
  "./pages/Front/BatchRecordForm.js";
  "./pages/Front/HealthIndicatorRecordList.js";
  "./pages/Front/FoodList.js";
  "./pages/Front/DietRecordList.js";
  "./pages/Front/HealthArticleList.js";
  "./pages/Front/HealthArticleForm.js";
  "./pages/Front/MyHealthArticleList.js";
  "./pages/Front/HealthArticleDetail.js";
  "./pages/Front/RecipeList.js";
  "./pages/Front/RecipeForm.js";
  "./pages/Front/RecipeDetail.js";
  "./pages/Front/MyRecipeList.js";
  "./pages/Front/CollectRecordList.js";
  "./pages/Front/LikeRecordList.js";
  "./pages/Front/HealthView.js";
  "./pages/Front/AiAnalyse.js";
  "./pages/Front/HealthNoticeList.js";
  "./pages/Front/HealthNoticeForm.js";
  "./pages/Front/WeChatBind.js";
}
const _sfc_main = {
  __name: "App",
  setup(__props) {
    const commonStore = store_index.useCommonStore();
    common_vendor.onLaunch(() => {
      if (commonStore.Token) {
        commonStore.GetInfo();
        common_vendor.index.reLaunch({ url: "/pages/Front/Index" });
      } else {
        common_vendor.index.reLaunch({ url: "/pages/Front/Login" });
      }
    });
    common_vendor.onShow(() => {
    });
    common_vendor.onHide(() => {
    });
    return () => {
    };
  }
};
const app = common_vendor.createSSRApp(_sfc_main);
app.config.warnHandler = (msg, vm, trace) => {
};
app.use(common_vendor.createPinia());
function createApp() {
  return {
    app,
    Pinia: common_vendor.Pinia
    // 此处必须将 Pinia
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
//# sourceMappingURL=../.sourcemap/mp-weixin/app.js.map
