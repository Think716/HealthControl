import { Post } from "@/utils/http";

import { defineStore } from "pinia";

import { GetLoginToken, RemoveLoginToken, SetLoginToken } from "@/utils/cache";

import UserIcon from "@/assets/个人中心.png";
import HomeIcon from "@/assets/首页.png";
import HealthIndicatorIcon from "@/assets/健康指标.png";
//  状态管理
export const useCommonStore = defineStore("common", {
  state: () => ({
    // 初始状态
    Token: GetLoginToken(),
    UserInfo: null,
    RoleType: undefined,
    HasUserInfo: false,
    FooterBarList: [
      {
        url: "/pages/Front/Index",
        label: "首 页",
        icon: HomeIcon,
      },
	  {
	    url: "/pages/Front/HealthIndicatorList",
	    label: "健康指标",
	    icon: HealthIndicatorIcon,
	  },
      {
        url: "/pages/Front/CommunityList",
        label: "社区",
        icon: HomeIcon,
      },
      {
        url: "/pages/Front/UserCenter",
        label: "个人中心",
        icon: UserIcon,
      },
    ],
  }),
  getters: {
    UserId: (state) => state.UserInfo && state.UserInfo.Id,
  },
  actions: {
    async Login(UserInfo) {
      let res = await Post("/User/SignIn", UserInfo);

      if (res.Success) {
        this.$patch({
          Token: res.Data,
        });
        SetLoginToken(res.Data);
      }

      return res;
    },
    async GetInfo() {
      let res = await Post("/User/GetByToken", {});

      this.$patch({
        UserInfo: res.Data,
        HasUserInfo: res.Data != null,
        RoleType: res.Data.RoleTypeFormat,
      });
      return res;
    },
    /**
     * 退出登录
     */
    async Logout() {
      RemoveLoginToken();
      uni.reLaunch({ url: "/pages/Front/Login" });
      this.$patch({
        Token: null,
        UserInfo: null,
        RoleType: null,
        HasUserInfo: false,
      });
    },
    resetState() {
      this.$patch({
        Token: null,
        UserInfo: null,
        RoleType: undefined,
        HasUserInfo: false,
      });
      RemoveLoginToken();
    },
    /**
     * 检查是否登录
     * @returns {boolean}
     */
    CheckIsLogin() {
      if (!this.Token) {
        uni.reLaunch({ url: "/pages/Front/Login" });
      }
      return true;
    },
  },
});
