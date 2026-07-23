"use strict";
const common_vendor = require("../common/vendor.js");
const utils_http = require("../utils/http.js");
const utils_cache = require("../utils/cache.js");
const common_assets = require("../common/assets.js");
const useCommonStore = common_vendor.defineStore("common", {
  state: () => ({
    // 初始状态
    Token: utils_cache.GetLoginToken(),
    UserInfo: null,
    RoleType: void 0,
    HasUserInfo: false,
    FooterBarList: [
      {
        url: "/pages/Front/Index",
        label: "首 页",
        icon: common_assets.HomeIcon
      },
      {
        url: "/pages/Front/HealthIndicatorList",
        label: "健康指标",
        icon: common_assets.HealthIndicatorIcon
      },
      {
        url: "/pages/Front/CommunityList",
        label: "社区",
        icon: common_assets.HomeIcon
      },
      {
        url: "/pages/Front/UserCenter",
        label: "个人中心",
        icon: common_assets.UserIcon
      }
    ]
  }),
  getters: {
    UserId: (state) => state.UserInfo && state.UserInfo.Id
  },
  actions: {
    async Login(UserInfo) {
      let res = await utils_http.Post("/User/SignIn", UserInfo);
      if (res.Success) {
        this.$patch({
          Token: res.Data
        });
        utils_cache.SetLoginToken(res.Data);
      }
      return res;
    },
    async GetInfo() {
      let res = await utils_http.Post("/User/GetByToken", {});
      this.$patch({
        UserInfo: res.Data,
        HasUserInfo: res.Data != null,
        RoleType: res.Data.RoleTypeFormat
      });
      return res;
    },
    /**
     * 退出登录
     */
    async Logout() {
      utils_cache.RemoveLoginToken();
      common_vendor.index.reLaunch({ url: "/pages/Front/Login" });
      this.$patch({
        Token: null,
        UserInfo: null,
        RoleType: null,
        HasUserInfo: false
      });
    },
    resetState() {
      this.$patch({
        Token: null,
        UserInfo: null,
        RoleType: void 0,
        HasUserInfo: false
      });
      utils_cache.RemoveLoginToken();
    },
    /**
     * 检查是否登录
     * @returns {boolean}
     */
    CheckIsLogin() {
      if (!this.Token) {
        common_vendor.index.reLaunch({ url: "/pages/Front/Login" });
      }
      return true;
    }
  }
});
exports.useCommonStore = useCommonStore;
//# sourceMappingURL=../../.sourcemap/mp-weixin/store/index.js.map
