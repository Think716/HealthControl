"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const store_index = require("../../store/index.js");
if (!Array) {
  const _easycom_uni_nav_bar2 = common_vendor.resolveComponent("uni-nav-bar");
  const _easycom_uni_section2 = common_vendor.resolveComponent("uni-section");
  const _easycom_uni_grid_item2 = common_vendor.resolveComponent("uni-grid-item");
  const _easycom_uni_grid2 = common_vendor.resolveComponent("uni-grid");
  const _easycom_uni_card2 = common_vendor.resolveComponent("uni-card");
  const _easycom_footer_bar2 = common_vendor.resolveComponent("footer-bar");
  (_easycom_uni_nav_bar2 + _easycom_uni_section2 + _easycom_uni_grid_item2 + _easycom_uni_grid2 + _easycom_uni_card2 + _easycom_footer_bar2)();
}
const _easycom_uni_nav_bar = () => "../../uni_modules/uni-nav-bar/components/uni-nav-bar/uni-nav-bar.js";
const _easycom_uni_section = () => "../../uni_modules/uni-section/components/uni-section/uni-section.js";
const _easycom_uni_grid_item = () => "../../uni_modules/uni-grid/components/uni-grid-item/uni-grid-item.js";
const _easycom_uni_grid = () => "../../uni_modules/uni-grid/components/uni-grid/uni-grid.js";
const _easycom_uni_card = () => "../../uni_modules/uni-card/components/uni-card/uni-card.js";
const _easycom_footer_bar = () => "../../components/footer-bar/footer-bar.js";
if (!Math) {
  (_easycom_uni_nav_bar + _easycom_uni_section + _easycom_uni_grid_item + _easycom_uni_grid + _easycom_uni_card + _easycom_footer_bar)();
}
const _sfc_main = {
  __name: "UserCenter",
  setup(__props) {
    const commonStore = store_index.useCommonStore();
    const defaultHeadImage = common_vendor.ref(common_assets.defaultAvatar);
    common_vendor.computed(() => commonStore.Token);
    const UserInfo = common_vendor.computed(() => commonStore.UserInfo);
    common_vendor.computed(() => commonStore.RoleType);
    common_vendor.computed(() => commonStore.UserId);
    common_vendor.onLoad(() => {
      if (commonStore.CheckIsLogin()) {
        setTimeout(() => {
          getUserInfo();
        }, 100);
      }
    });
    const getUserInfo = async () => {
      await commonStore.GetInfo();
    };
    const logout = () => {
      commonStore.Logout();
    };
    const navigateTo = (url) => {
      common_vendor.index.navigateTo({
        url
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          dark: true,
          fixed: true,
          shadow: true,
          ["background-color"]: "var(--primary-color)",
          ["status-bar"]: true,
          title: "个人中心"
        }),
        b: UserInfo.value.ImageUrls || defaultHeadImage.value,
        c: common_vendor.t(UserInfo.value.Name),
        d: common_vendor.t(UserInfo.value.RoleTypeFormat),
        e: UserInfo.value.OpenId
      }, UserInfo.value.OpenId ? {} : {}, {
        f: common_vendor.o(($event) => navigateTo("/pages/Front/UserInfoEdit")),
        g: common_vendor.p({
          title: "常用功能",
          ["sub-title"]: " ",
          type: "line",
          titleFontSize: 28
        }),
        h: common_vendor.unref(common_assets.UserInfoIcon),
        i: common_vendor.o(($event) => navigateTo("/pages/Front/UserInfoEdit")),
        j: common_vendor.unref(common_assets.PasswordEditIcon),
        k: common_vendor.o(($event) => navigateTo("/pages/Front/PasswordEdit")),
        l: common_vendor.unref(common_assets.MyHealthArticleIcon),
        m: common_vendor.o(($event) => navigateTo("/pages/Front/MyHealthArticleList")),
        n: common_vendor.unref(common_assets.MyRecipeIcon),
        o: common_vendor.o(($event) => navigateTo("/pages/Front/MyRecipeList")),
        p: common_vendor.unref(common_assets.CollectRecordListIcon),
        q: common_vendor.o(($event) => navigateTo("/pages/Front/CollectRecordList")),
        r: common_vendor.unref(common_assets.LikeRecordListIcon),
        s: common_vendor.o(($event) => navigateTo("/pages/Front/LikeRecordList")),
        t: common_vendor.unref(common_assets.WeChatBindIcon),
        v: common_vendor.o(($event) => navigateTo("/pages/Front/WeChatBind")),
        w: common_vendor.p({
          column: 3,
          square: true,
          showBorder: false
        }),
        x: common_vendor.p({
          ["is-shadow"]: false,
          ["is-full"]: true,
          margin: "0",
          padding: "0",
          spacing: "0"
        }),
        y: common_vendor.o(logout)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-937a22e8"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/Front/UserCenter.js.map
