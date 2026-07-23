"use strict";
const common_vendor = require("../../common/vendor.js");
const store_index = require("../../store/index.js");
const utils_http = require("../../utils/http.js");
if (!Array) {
  const _easycom_uni_nav_bar2 = common_vendor.resolveComponent("uni-nav-bar");
  const _easycom_uni_calendar2 = common_vendor.resolveComponent("uni-calendar");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  (_easycom_uni_nav_bar2 + _easycom_uni_calendar2 + _easycom_uni_icons2)();
}
const _easycom_uni_nav_bar = () => "../../uni_modules/uni-nav-bar/components/uni-nav-bar/uni-nav-bar.js";
const _easycom_uni_calendar = () => "../../uni_modules/uni-calendar/components/uni-calendar/uni-calendar.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  (_easycom_uni_nav_bar + _easycom_uni_calendar + _easycom_uni_icons)();
}
const _sfc_main = {
  __name: "DietRecordList",
  setup(__props) {
    const commonStore = store_index.useCommonStore();
    common_vendor.computed(() => commonStore.Token);
    common_vendor.computed(() => commonStore.UserInfo);
    common_vendor.computed(() => commonStore.RoleType);
    const UserId = common_vendor.computed(() => commonStore.UserId);
    const selectedDates = common_vendor.ref([]);
    const selectedDate = common_vendor.ref(/* @__PURE__ */ new Date());
    const startDate = common_vendor.ref("2020-01-01");
    const endDate = common_vendor.ref("2030-12-31");
    const selectedDateText = common_vendor.computed(() => {
      const date = selectedDate.value;
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}年${month}月${day}日`;
    });
    const formatDateRangeForApi = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const startTime = `${year}-${month}-${day} 00:00:00`;
      const endTime = `${year}-${month}-${day} 23:59:59`;
      return [startTime, endTime];
    };
    common_vendor.ref([]);
    const where = common_vendor.reactive({
      RecordUserId: UserId.value,
      RecordTimeRange: formatDateRangeForApi(selectedDate.value)
      // 修改为时间范围参数
    });
    const onDateChange = (event) => {
      const { fulldate } = event;
      selectedDate.value = new Date(fulldate);
      selectedDates.value = [{ date: fulldate, info: "选中" }];
      where.RecordTimeRange = formatDateRangeForApi(selectedDate.value);
      GetDietRecordListApi();
    };
    common_vendor.onLoad(async (option) => {
      const today = /* @__PURE__ */ new Date();
      selectedDate.value = today;
      const todayFormatted = formatDateRangeForApi(today)[0].split(" ")[0];
      selectedDates.value = [{ date: todayFormatted, info: "选中" }];
      where.RecordTimeRange = formatDateRangeForApi(today);
    });
    common_vendor.onShow(async () => {
      GetDietRecordListApi();
    });
    common_vendor.onReady(async () => {
    });
    const goBack = () => {
      common_vendor.index.navigateBack();
    };
    const goToAddRecord = () => {
      common_vendor.index.navigateTo({
        url: "/pages/Front/FoodList"
      });
    };
    const DietRecordList = common_vendor.ref([]);
    const GetDietRecordListApi = async () => {
      let {
        Data
      } = await utils_http.Post("/DietRecord/DietRecordByDay", where);
      DietRecordList.value = Data || [];
    };
    const ShowDeleteModal = async (Id) => {
      common_vendor.index.showModal({
        title: "提示",
        content: "确认删除该饮食记录吗？",
        success: async (res) => {
          if (res.confirm) {
            const { Success } = await utils_http.Post(`/DietRecord/Delete`, { Id });
            if (Success) {
              await GetDietRecordListApi();
              common_vendor.index.showToast({
                title: "删除成功",
                icon: "success"
              });
            }
          }
        }
      });
    };
    const formatTime = (timestamp) => {
      const date = new Date(timestamp);
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${hours}:${minutes}`;
    };
    const shareDietRecord = async () => {
      common_vendor.index.showModal({
        title: "分享饮食",
        content: "确认将今日饮食记录分享到社区吗？",
        success: async (res) => {
          if (res.confirm) {
            const year = selectedDate.value.getFullYear();
            const month = String(selectedDate.value.getMonth() + 1).padStart(2, "0");
            const day = String(selectedDate.value.getDate()).padStart(2, "0");
            const dateStr = `${year}-${month}-${day}`;
            const { Success, Msg } = await utils_http.Post("/CommunityPost/ShareDietRecord", {
              UserId: UserId.value,
              Date: dateStr
            });
            common_vendor.index.showToast({
              title: Success ? "已分享到社区" : Msg || "分享失败",
              icon: Success ? "success" : "none"
            });
          }
        }
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
          title: "我的饮食记录"
        }),
        c: common_vendor.o(onDateChange),
        d: common_vendor.p({
          selected: selectedDates.value,
          lunar: false,
          ["start-date"]: startDate.value,
          ["end-date"]: endDate.value
        }),
        e: common_vendor.t(selectedDateText.value),
        f: DietRecordList.value.length > 0
      }, DietRecordList.value.length > 0 ? {
        g: common_vendor.o(shareDietRecord)
      } : {}, {
        h: DietRecordList.value.length > 0
      }, DietRecordList.value.length > 0 ? {
        i: common_vendor.f(DietRecordList.value, (mealGroup, index, i0) => {
          return {
            a: common_vendor.t(mealGroup.DateType),
            b: common_vendor.t(mealGroup.TotalCalories),
            c: common_vendor.t(mealGroup.TotalProtein),
            d: common_vendor.t(mealGroup.TotalCarbohydrates),
            e: common_vendor.t(mealGroup.TotalFat),
            f: common_vendor.f(mealGroup.DietRecords, (record, k1, i1) => {
              return {
                a: record.FoodDto.Cover,
                b: common_vendor.t(record.FoodDto.Name),
                c: common_vendor.t(record.RecordValue),
                d: common_vendor.t(record.FoodUnitDto.UnitName),
                e: common_vendor.t(record.FoodUnitDto.Calories),
                f: common_vendor.t(formatTime(record.RecordTime)),
                g: common_vendor.o(($event) => ShowDeleteModal(record.Id), record.Id),
                h: "3e16dfb0-2-" + i0 + "-" + i1,
                i: record.Id
              };
            }),
            g: index
          };
        }),
        j: common_vendor.p({
          type: "trash",
          size: "20",
          color: "#ff4757"
        })
      } : {
        k: common_vendor.p({
          type: "calendar",
          size: "60",
          color: "#ccc"
        })
      }, {
        l: common_vendor.p({
          type: "plus",
          size: "24",
          color: "#fff"
        }),
        m: common_vendor.o(goToAddRecord)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-3e16dfb0"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/Front/DietRecordList.js.map
