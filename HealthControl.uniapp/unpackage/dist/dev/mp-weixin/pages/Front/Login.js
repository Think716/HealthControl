"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const store_index = require("../../store/index.js");
const utils_http = require("../../utils/http.js");
const utils_comm = require("../../utils/comm.js");
if (!Array) {
  const _easycom_uni_data_checkbox2 = common_vendor.resolveComponent("uni-data-checkbox");
  _easycom_uni_data_checkbox2();
}
const _easycom_uni_data_checkbox = () => "../../uni_modules/uni-data-checkbox/components/uni-data-checkbox/uni-data-checkbox.js";
if (!Math) {
  _easycom_uni_data_checkbox();
}
const _sfc_main = {
  __name: "Login",
  setup(__props) {
    const formData = common_vendor.ref({
      UserName: "",
      Password: "",
      RoleType: "2"
    });
    const RoleTypeList = common_vendor.ref([]);
    const commonStore = store_index.useCommonStore();
    const GetRoleTypeListApi = async () => {
      const { Data } = await utils_http.Post("/Select/RoleType");
      const Items = (Data == null ? void 0 : Data.Items) || [];
      RoleTypeList.value = Items.filter((item) => item.Code != 1).map((item) => ({
        text: item.Name,
        value: item.Code
      }));
      common_vendor.index.__f__("log", "at pages/Front/Login.vue:105", RoleTypeList.value);
    };
    const Login = async () => {
      if (!formData.value.UserName) {
        common_vendor.index.showToast({
          title: "请输入账户",
          icon: "none"
        });
        return;
      }
      if (!formData.value.Password) {
        common_vendor.index.showToast({
          title: "请输入密码",
          icon: "none"
        });
        return;
      }
      const { Data, Success } = await commonStore.Login(formData.value);
      if (Success) {
        await commonStore.GetInfo();
        common_vendor.index.reLaunch({
          url: "/pages/Front/Index"
        });
      }
    };
    const ForgetPassword = () => {
      common_vendor.index.redirectTo({
        url: "/pages/Front/ForgetPassword"
      });
    };
    const Reg = () => {
      common_vendor.index.redirectTo({
        url: "/pages/Front/Register"
      });
    };
    const otherLogin = async (type) => {
      if (type == 0) {
        common_vendor.index.showLoading({
          title: "正在登录中~"
        });
        let WxCode = null;
        await utils_comm.GetLoginCode().then((code) => {
          WxCode = code;
        });
        const { Data, Success } = await commonStore.Login({
          WxCode
        });
        common_vendor.index.hideLoading();
        if (Success) {
          await commonStore.GetInfo();
          common_vendor.index.reLaunch({
            url: "/pages/Front/Index"
          });
        }
      } else {
        common_vendor.index.$comm.ShowToast("该方式还未实现,尽情期待！");
      }
    };
    common_vendor.onLoad(() => {
      GetRoleTypeListApi();
    });
    return (_ctx, _cache) => {
      return {
        a: formData.value.UserName,
        b: common_vendor.o(($event) => formData.value.UserName = $event.detail.value),
        c: formData.value.Password,
        d: common_vendor.o(($event) => formData.value.Password = $event.detail.value),
        e: common_vendor.o(($event) => formData.value.RoleType = $event),
        f: common_vendor.p({
          localdata: RoleTypeList.value,
          modelValue: formData.value.RoleType
        }),
        g: common_vendor.o(Login),
        h: common_vendor.o(ForgetPassword),
        i: common_vendor.o(Reg),
        j: common_assets.WeChatBindIcon,
        k: common_vendor.o(($event) => otherLogin(0))
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-d9542588"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/Front/Login.js.map
