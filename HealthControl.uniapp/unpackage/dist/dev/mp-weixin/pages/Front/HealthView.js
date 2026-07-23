"use strict";
const common_vendor = require("../../common/vendor.js");
const store_index = require("../../store/index.js");
const utils_http = require("../../utils/http.js");
if (!Array) {
  const _easycom_uni_nav_bar2 = common_vendor.resolveComponent("uni-nav-bar");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_datetime_picker2 = common_vendor.resolveComponent("uni-datetime-picker");
  const _easycom_qiun_data_charts2 = common_vendor.resolveComponent("qiun-data-charts");
  (_easycom_uni_nav_bar2 + _easycom_uni_icons2 + _easycom_uni_datetime_picker2 + _easycom_qiun_data_charts2)();
}
const _easycom_uni_nav_bar = () => "../../uni_modules/uni-nav-bar/components/uni-nav-bar/uni-nav-bar.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_datetime_picker = () => "../../uni_modules/uni-datetime-picker/components/uni-datetime-picker/uni-datetime-picker.js";
const _easycom_qiun_data_charts = () => "../../uni_modules/qiun-data-charts/components/qiun-data-charts/qiun-data-charts.js";
if (!Math) {
  (_easycom_uni_nav_bar + _easycom_uni_icons + _easycom_uni_datetime_picker + _easycom_qiun_data_charts)();
}
const _sfc_main = {
  __name: "HealthView",
  setup(__props) {
    const commonStore = store_index.useCommonStore();
    common_vendor.computed(() => commonStore.Token);
    common_vendor.computed(() => commonStore.UserInfo);
    common_vendor.computed(() => commonStore.RoleType);
    const UserId = common_vendor.computed(() => commonStore.UserId);
    common_vendor.onLoad(async (option) => {
    });
    common_vendor.onShow(async () => {
      initDefaultTimeRange();
      await HealthIndicatorTypeListApi();
      await RecordListStatisticsApi();
    });
    common_vendor.onReady(async () => {
    });
    const HealthIndicatorTypeList = common_vendor.ref([]);
    const selectedTypeId = common_vendor.ref(null);
    const timeRange = common_vendor.ref({
      startTime: "",
      endTime: ""
    });
    const selectedQuickOption = common_vendor.ref("week");
    const initDefaultTimeRange = () => {
      const now = /* @__PURE__ */ new Date();
      const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startDate = /* @__PURE__ */ new Date();
      startDate.setDate(endDate.getDate() - 7);
      timeRange.value.startTime = formatDate(startDate);
      timeRange.value.endTime = formatDate(endDate);
    };
    const HealthIndicatorTypeListApi = async () => {
      let {
        Data
      } = await utils_http.Post("/HealthIndicatorType/List", {
        BelongUserId: UserId.value
      });
      HealthIndicatorTypeList.value = Data.Items || Data;
      if (HealthIndicatorTypeList.value && HealthIndicatorTypeList.value.length > 0) {
        selectedTypeId.value = HealthIndicatorTypeList.value[0].Id;
      }
    };
    const RecordListStatistics = common_vendor.ref([]);
    const chartData = common_vendor.ref({});
    const chartLegend = common_vendor.ref([]);
    const chartRenderTimer = common_vendor.ref(null);
    const chartOpts = common_vendor.ref({
      color: ["#1890FF", "#91CB74", "#FAC858", "#EE6666", "#73C0DE", "#3CA272", "#FC8452", "#9A60B4", "#ea7ccc"],
      padding: [30, 30, 50, 50],
      dataLabel: false,
      dataPointShape: true,
      enableScroll: false,
      legend: {
        show: false
      },
      xAxis: {
        disableGrid: false,
        gridColor: "#E5E5E5",
        fontColor: "#333333",
        fontSize: 12
      },
      yAxis: {
        gridType: "dash",
        dashLength: 2,
        gridColor: "#E5E5E5",
        fontColor: "#333333",
        fontSize: 12,
        data: [{
          min: 0
          // 确保Y轴从0开始
        }]
      },
      extra: {
        line: {
          type: "straight",
          width: 2,
          activeType: "hollow"
        }
      }
    });
    const RecordListStatisticsApi = async () => {
      const params = {
        RecordUserId: UserId.value,
        HealthIndicatorTypeId: selectedTypeId.value
      };
      if (timeRange.value.startTime && timeRange.value.endTime) {
        params.RecordTimeRange = [
          `${timeRange.value.startTime} 00:00:00`,
          `${timeRange.value.endTime} 23:59:59`
        ];
      }
      let {
        Data
      } = await utils_http.Post("/HealthIndicatorRecord/RecordListStatistics", params);
      RecordListStatistics.value = Data;
      if (Data && Data.length > 0) {
        await common_vendor.nextTick$1();
        updateChartData();
      } else {
        chartData.value = {};
        chartLegend.value = [];
      }
    };
    const goBack = () => {
      common_vendor.index.navigateBack();
    };
    const selectType = async (type) => {
      selectedTypeId.value = type.Id;
      if (chartRenderTimer.value) {
        clearTimeout(chartRenderTimer.value);
      }
      chartRenderTimer.value = setTimeout(async () => {
        await RecordListStatisticsApi();
      }, 300);
    };
    const onStartTimeChange = (e) => {
      timeRange.value.startTime = e;
      selectedQuickOption.value = "";
    };
    const onEndTimeChange = (e) => {
      timeRange.value.endTime = e;
      selectedQuickOption.value = "";
    };
    const setQuickTime = (option) => {
      selectedQuickOption.value = option;
      const now = /* @__PURE__ */ new Date();
      const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      let startDate = /* @__PURE__ */ new Date();
      switch (option) {
        case "week":
          startDate.setDate(endDate.getDate() - 7);
          break;
        case "month":
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case "three-months":
          startDate.setMonth(endDate.getMonth() - 3);
          break;
      }
      timeRange.value.startTime = formatDate(startDate);
      timeRange.value.endTime = formatDate(endDate);
    };
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };
    const resetTimeFilter = () => {
      timeRange.value.startTime = "";
      timeRange.value.endTime = "";
      selectedQuickOption.value = "";
    };
    const applyTimeFilter = async () => {
      if (timeRange.value.startTime && timeRange.value.endTime) {
        if (new Date(timeRange.value.startTime) > new Date(timeRange.value.endTime)) {
          common_vendor.index.showToast({
            title: "开始时间不能大于结束时间",
            icon: "none"
          });
          return;
        }
      }
      await RecordListStatisticsApi();
      common_vendor.index.showToast({
        title: "数据已更新",
        icon: "success"
      });
    };
    const updateChartData = () => {
      if (!RecordListStatistics.value || RecordListStatistics.value.length === 0) {
        chartData.value = {};
        chartLegend.value = [];
        return;
      }
      const sortedData = [...RecordListStatistics.value].sort((a, b) => new Date(a.Date) - new Date(b.Date));
      const categories = sortedData.map((item) => {
        const date = new Date(item.Date);
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${month}-${day}`;
      });
      const indicatorNames = /* @__PURE__ */ new Set();
      sortedData.forEach((dateItem) => {
        dateItem.Items.forEach((item) => {
          indicatorNames.add(item.HealthIndicatorName);
        });
      });
      const series = Array.from(indicatorNames).map((indicatorName, index) => {
        const data = sortedData.map((dateItem) => {
          const indicator = dateItem.Items.find((item) => item.HealthIndicatorName === indicatorName);
          return indicator ? indicator.RecordValue : 0;
        });
        return {
          name: indicatorName,
          data
        };
      });
      const colors = chartOpts.value.color;
      chartLegend.value = series.map((item, index) => ({
        name: item.name,
        color: colors[index % colors.length]
      }));
      chartData.value = {
        categories,
        series
      };
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
          title: "健康指标"
        }),
        c: common_vendor.t(timeRange.value.startTime || "选择开始时间"),
        d: common_vendor.p({
          type: "calendar",
          size: "16",
          color: "#999"
        }),
        e: common_vendor.o(onStartTimeChange),
        f: common_vendor.o(($event) => timeRange.value.startTime = $event),
        g: common_vendor.p({
          type: "date",
          ["clear-icon"]: false,
          placeholder: "选择开始时间",
          modelValue: timeRange.value.startTime
        }),
        h: common_vendor.t(timeRange.value.endTime || "选择结束时间"),
        i: common_vendor.p({
          type: "calendar",
          size: "16",
          color: "#999"
        }),
        j: common_vendor.o(onEndTimeChange),
        k: common_vendor.o(($event) => timeRange.value.endTime = $event),
        l: common_vendor.p({
          type: "date",
          ["clear-icon"]: false,
          placeholder: "选择结束时间",
          modelValue: timeRange.value.endTime
        }),
        m: selectedQuickOption.value === "week" ? 1 : "",
        n: common_vendor.o(($event) => setQuickTime("week")),
        o: selectedQuickOption.value === "month" ? 1 : "",
        p: common_vendor.o(($event) => setQuickTime("month")),
        q: selectedQuickOption.value === "three-months" ? 1 : "",
        r: common_vendor.o(($event) => setQuickTime("three-months")),
        s: common_vendor.o(resetTimeFilter),
        t: common_vendor.o(applyTimeFilter),
        v: common_vendor.f(HealthIndicatorTypeList.value, (type, index, i0) => {
          return common_vendor.e({
            a: common_vendor.t(type.Name),
            b: selectedTypeId.value === type.Id
          }, selectedTypeId.value === type.Id ? {
            c: "d039dd64-5-" + i0,
            d: common_vendor.p({
              type: "checkmarkempty",
              size: "16",
              color: "#fff"
            })
          } : {}, {
            e: type.Id,
            f: selectedTypeId.value === type.Id ? 1 : "",
            g: common_vendor.o(($event) => selectType(type), type.Id)
          });
        }),
        w: RecordListStatistics.value.length > 0
      }, RecordListStatistics.value.length > 0 ? {
        x: common_vendor.p({
          type: "line",
          opts: chartOpts.value,
          chartData: chartData.value,
          background: "none"
        }),
        y: common_vendor.f(chartLegend.value, (indicator, index, i0) => {
          return {
            a: indicator.color,
            b: common_vendor.t(indicator.name),
            c: index
          };
        })
      } : {}, {
        z: HealthIndicatorTypeList.value.length === 0
      }, HealthIndicatorTypeList.value.length === 0 ? {} : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-d039dd64"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/Front/HealthView.js.map
