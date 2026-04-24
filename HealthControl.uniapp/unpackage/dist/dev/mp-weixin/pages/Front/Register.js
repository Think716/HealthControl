"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const utils_comm = require("../../utils/comm.js");
const utils_http = require("../../utils/http.js");
if (!Array) {
  const _easycom_uni_data_checkbox2 = common_vendor.resolveComponent("uni-data-checkbox");
  _easycom_uni_data_checkbox2();
}
const _easycom_uni_data_checkbox = () => "../../uni_modules/uni-data-checkbox/components/uni-data-checkbox/uni-data-checkbox.js";
if (!Math) {
  _easycom_uni_data_checkbox();
}
const _sfc_main = {
  __name: "Register",
  setup(__props) {
    const formData = common_vendor.reactive({
      UserName: "",
      Password: "",
      RoleType: "2",
      PhoneNumber: "",
      Name: ""
    });
    const RoleTypeList = common_vendor.ref([]);
    const GetRoleTypeListApi = async () => {
      const { Data: { Items } } = await utils_http.Post("/Select/RoleType");
      RoleTypeList.value = Items.filter((item) => item.Code != 1).map((item) => ({
        text: item.Name,
        value: item.Code
      }));
    };
    const Register = async () => {
      if (!formData.UserName) {
        common_vendor.index.showToast({
          title: "请输入账户",
          icon: "none"
        });
        return;
      }
      if (!formData.Password) {
        common_vendor.index.showToast({
          title: "请输入密码",
          icon: "none"
        });
        return;
      }
      if (!formData.PhoneNumber) {
        common_vendor.index.showToast({
          title: "请输入手机号",
          icon: "none"
        });
        return;
      }
      formData.Name = Math.random().toString(36).substring(2, 15);
      if (!/^\d{11}$/.test(formData.PhoneNumber)) {
        common_vendor.index.showToast({
          title: "请输入正确的手机号",
          icon: "none"
        });
        return;
      }
      let WxCode = null;
      await utils_comm.GetLoginCode().then((code) => {
        WxCode = code;
      });
      const { Data, Success } = await utils_http.Post("/User/Register", {
        ...formData,
        WxCode
      });
      if (Success) {
        Object.assign(formData, {
          UserName: "",
          Password: "",
          RoleType: "2",
          Name: "",
          PhoneNumber: ""
        });
        common_vendor.index.redirectTo({
          url: "/pages/Front/Login"
        });
      }
    };
    const ToLogin = () => {
      common_vendor.index.redirectTo({
        url: "/pages/Front/Login"
      });
    };
    common_vendor.onLoad(() => {
      GetRoleTypeListApi();
    });
    return (_ctx, _cache) => {
      return {
        a: common_assets._imports_0,
        b: formData.UserName,
        c: common_vendor.o(($event) => formData.UserName = $event.detail.value),
        d: formData.Password,
        e: common_vendor.o(($event) => formData.Password = $event.detail.value),
        f: formData.PhoneNumber,
        g: common_vendor.o(($event) => formData.PhoneNumber = $event.detail.value),
        h: common_vendor.o(($event) => formData.RoleType = $event),
        i: common_vendor.p({
          localdata: RoleTypeList.value,
          modelValue: formData.RoleType
        }),
        j: common_vendor.o(Register),
        k: common_vendor.o(ToLogin)
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-95cbe21b"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/Front/Register.js.map
