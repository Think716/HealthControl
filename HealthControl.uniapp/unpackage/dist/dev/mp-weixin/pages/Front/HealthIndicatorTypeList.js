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
  __name: "HealthIndicatorTypeList",
  setup(__props) {
    const commonStore = store_index.useCommonStore();
    common_vendor.computed(() => commonStore.Token);
    common_vendor.computed(() => commonStore.UserInfo);
    common_vendor.computed(() => commonStore.RoleType);
    common_vendor.computed(() => commonStore.UserId);
    common_vendor.ref([]);
    const where = common_vendor.reactive({});
    common_vendor.onLoad(async (option) => {
    });
    common_vendor.onShow(async () => {
      GetCommHealthIndicatorTypeListApi();
      GetHealthIndicatorTypeListApi();
    });
    common_vendor.onReady(async () => {
    });
    const goBack = () => {
      common_vendor.index.navigateBack();
    };
    const CommHealthIndicatorTypeList = common_vendor.ref([]);
    const GetCommHealthIndicatorTypeListApi = async () => {
      let {
        Data: {
          Items
        }
      } = await utils_http.Post("/HealthIndicatorType/List", {
        IsComm: true
      });
      CommHealthIndicatorTypeList.value = Items;
    };
    const HealthIndicatorTypeList = common_vendor.ref([]);
    const GetHealthIndicatorTypeListApi = async () => {
      let {
        Data: {
          Items
        }
      } = await utils_http.Post("/HealthIndicatorType/List", where);
      HealthIndicatorTypeList.value = Items;
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(goBack),
        b: common_vendor.p({
          dark: true,
          fixed: true,
          shadow: true,
          ["background-color"]: "var(--primary-color)",
          ["status-bar"]: true,
          ["left-icon"]: "left",
          ["left-text"]: "返回",
          title: "健康指标分类"
        })
      };
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/Front/HealthIndicatorTypeList.js.map
