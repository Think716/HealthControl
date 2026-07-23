"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_http = require("../../utils/http.js");
const store_index = require("../../store/index.js");
if (!Array) {
  const _easycom_uni_nav_bar2 = common_vendor.resolveComponent("uni-nav-bar");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  (_easycom_uni_nav_bar2 + _easycom_uni_icons2)();
}
const _easycom_uni_nav_bar = () => "../../uni_modules/uni-nav-bar/components/uni-nav-bar/uni-nav-bar.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  (_easycom_uni_nav_bar + _easycom_uni_icons)();
}
const _sfc_main = {
  __name: "SportRecordList",
  setup(__props) {
    const store = store_index.useCommonStore();
    const sportList = common_vendor.ref([]);
    const selectedSport = common_vendor.ref(null);
    const selectedUnit = common_vendor.ref(null);
    const recordValue = common_vendor.ref("");
    const growth = common_vendor.ref({
      CheckDays: 0,
      ContinuousDays: 0,
      MonthCheckDays: 0,
      Points: 0,
      LevelName: "",
      Badges: []
    });
    const leaderboard = common_vendor.ref([]);
    const leaderboardType = common_vendor.ref("week");
    const dashboard = common_vendor.ref({
      IntakeCalories: 0,
      BurnedCalories: 0,
      NetCalories: 0,
      RecordCount: 0,
      IsChecked: false,
      Suggestion: "",
      ContinuousDays: 0,
      Points: 0,
      Badges: [],
      SportRecords: []
    });
    const pad = (num) => String(num).padStart(2, "0");
    const formatRecordTimeForPicker = (date = /* @__PURE__ */ new Date()) => {
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };
    const recordTime = common_vendor.ref(formatRecordTimeForPicker());
    const estimatedCalories = common_vendor.computed(() => {
      if (!selectedUnit.value || !recordValue.value)
        return 0;
      const value = Number(recordValue.value);
      const unitValue = Number(selectedUnit.value.UnitValue || 1);
      const calories = Number(selectedUnit.value.Calories || 0);
      return unitValue > 0 ? value * calories / unitValue : value * calories;
    });
    const canSave = common_vendor.computed(() => selectedSport.value && selectedUnit.value && Number(recordValue.value) > 0);
    common_vendor.onShow(async () => {
      await loadSports();
      await loadDashboard();
      await Promise.all([loadGrowth(), loadLeaderboard()]);
    });
    const loadSports = async () => {
      const { Data, Success, Msg } = await utils_http.Post("/Sport/List", {});
      if (!Success) {
        common_vendor.index.showToast({ title: Msg || "运动项目加载失败", icon: "none" });
        return;
      }
      sportList.value = Data || [];
      if (!selectedSport.value && sportList.value.length > 0) {
        selectSport(sportList.value[0]);
      }
    };
    const loadDashboard = async () => {
      const { Data, Success, Msg } = await utils_http.Post("/SportRecord/TodaySummary", {
        RecordUserId: store.UserId,
        RecordTimeRange: [getTodayStart(), getTodayEnd()]
      });
      if (!Success) {
        common_vendor.index.showToast({ title: Msg || "运动汇总加载失败", icon: "none" });
        return;
      }
      dashboard.value = {
        IntakeCalories: 0,
        BurnedCalories: 0,
        NetCalories: 0,
        RecordCount: 0,
        IsChecked: false,
        Suggestion: "",
        SportRecords: [],
        ...Data || {}
      };
    };
    const loadGrowth = async () => {
      const { Data, Success } = await utils_http.Post("/SportRecord/GrowthSummary", { RecordUserId: store.UserId });
      if (Success) {
        growth.value = {
          CheckDays: 0,
          ContinuousDays: 0,
          MonthCheckDays: 0,
          Points: 0,
          LevelName: "",
          Badges: [],
          ...Data || {}
        };
      }
    };
    const loadLeaderboard = async () => {
      const { Data, Success } = await utils_http.Post("/SportRecord/Leaderboard", { Type: leaderboardType.value });
      if (Success)
        leaderboard.value = Data || [];
    };
    const switchLeaderboard = async (type) => {
      leaderboardType.value = type;
      await loadLeaderboard();
    };
    const shareSport = async () => {
      const { Success, Msg } = await utils_http.Post("/SportRecord/ShareSportRecord", { UserId: store.UserId });
      common_vendor.index.showToast({ title: Success ? "已分享到社区，等待审核" : Msg || "分享失败", icon: Success ? "success" : "none" });
    };
    const selectSport = (sport) => {
      selectedSport.value = sport;
      selectedUnit.value = sport.SportUnits && sport.SportUnits.length > 0 ? sport.SportUnits[0] : null;
    };
    const selectUnit = (unit) => {
      selectedUnit.value = unit;
    };
    const onTimeChange = (e) => {
      recordTime.value = e.detail.value;
    };
    const saveRecord = async () => {
      if (!canSave.value)
        return;
      const { Success, Msg } = await utils_http.Post("/SportRecord/CreateOrEdit", {
        SportId: selectedSport.value.Id,
        SportUnitId: selectedUnit.value.Id,
        RecordUserId: store.UserId,
        RecordTime: normalizeDateTime(recordTime.value),
        RecordValue: Math.round(Number(recordValue.value))
      });
      if (!Success) {
        common_vendor.index.showToast({ title: Msg || "保存失败", icon: "none" });
        return;
      }
      common_vendor.index.showToast({ title: "运动打卡成功", icon: "success" });
      recordValue.value = "";
      recordTime.value = formatRecordTimeForPicker();
      await loadDashboard();
    };
    const deleteRecord = async (id) => {
      const modalResult = await common_vendor.index.showModal({ title: "删除记录", content: "确定删除这条运动记录吗？" });
      const confirm = Array.isArray(modalResult) ? modalResult[1] && modalResult[1].confirm : modalResult.confirm;
      if (!confirm)
        return;
      const { Success, Msg } = await utils_http.Post("/SportRecord/Delete", { Id: id });
      if (!Success) {
        common_vendor.index.showToast({ title: Msg || "删除失败", icon: "none" });
        return;
      }
      await loadDashboard();
    };
    const goBack = () => {
      common_vendor.index.navigateBack();
    };
    const getTodayStart = () => {
      const now = /* @__PURE__ */ new Date();
      return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} 00:00:00`;
    };
    const getTodayEnd = () => {
      const now = /* @__PURE__ */ new Date();
      return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} 23:59:59`;
    };
    const normalizeDateTime = (value) => {
      if (!value)
        return formatRecordTimeForPicker() + ":00";
      return value.length === 16 ? `${value}:00` : value;
    };
    const formatNumber = (num) => Math.round(Number(num || 0));
    const formatTime = (time) => {
      if (!time)
        return "";
      return String(time).slice(11, 16);
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
          title: "运动打卡"
        }),
        c: common_vendor.t(formatNumber(dashboard.value.NetCalories)),
        d: dashboard.value.NetCalories < 900 ? 1 : "",
        e: dashboard.value.NetCalories > 1800 ? 1 : "",
        f: common_vendor.t(dashboard.value.IsChecked ? "已打卡" : "未打卡"),
        g: dashboard.value.IsChecked ? 1 : "",
        h: common_vendor.t(formatNumber(dashboard.value.IntakeCalories)),
        i: common_vendor.t(formatNumber(dashboard.value.BurnedCalories)),
        j: common_vendor.t(dashboard.value.RecordCount || 0),
        k: common_vendor.t(dashboard.value.Suggestion || "选择一项运动，记录今天的热量消耗。"),
        l: common_vendor.t(growth.value.LevelName || "健康新手"),
        m: common_vendor.t(growth.value.Points || dashboard.value.Points || 0),
        n: common_vendor.t(dashboard.value.ContinuousDays || growth.value.ContinuousDays || 0),
        o: common_vendor.t(growth.value.MonthCheckDays || 0),
        p: common_vendor.t(growth.value.CheckDays || 0),
        q: common_vendor.f(dashboard.value.Badges && dashboard.value.Badges.length ? dashboard.value.Badges : growth.value.Badges, (badge, k0, i0) => {
          return {
            a: common_vendor.t(badge),
            b: badge
          };
        }),
        r: common_vendor.o(shareSport),
        s: common_vendor.f(sportList.value, (sport, k0, i0) => {
          return common_vendor.e({
            a: sport.Cover
          }, sport.Cover ? {
            b: sport.Cover
          } : {}, {
            c: common_vendor.t(sport.Name),
            d: sport.Id,
            e: selectedSport.value && selectedSport.value.Id === sport.Id ? 1 : "",
            f: common_vendor.o(($event) => selectSport(sport), sport.Id)
          });
        }),
        t: selectedSport.value
      }, selectedSport.value ? {
        v: common_vendor.f(selectedSport.value.SportUnits, (unit, k0, i0) => {
          return {
            a: common_vendor.t(unit.UnitName),
            b: unit.Id,
            c: selectedUnit.value && selectedUnit.value.Id === unit.Id ? 1 : "",
            d: common_vendor.o(($event) => selectUnit(unit), unit.Id)
          };
        }),
        w: `请输入${selectedUnit.value ? selectedUnit.value.UnitName : "数量"}`,
        x: recordValue.value,
        y: common_vendor.o(($event) => recordValue.value = $event.detail.value),
        z: common_vendor.t(recordTime.value),
        A: recordTime.value,
        B: common_vendor.o(onTimeChange),
        C: common_vendor.t(formatNumber(estimatedCalories.value)),
        D: !canSave.value,
        E: common_vendor.o(saveRecord)
      } : {}, {
        F: dashboard.value.SportRecords.length === 0
      }, dashboard.value.SportRecords.length === 0 ? {
        G: common_vendor.p({
          type: "calendar",
          size: "56",
          color: "#ccc"
        })
      } : {}, {
        H: common_vendor.f(dashboard.value.SportRecords, (record, k0, i0) => {
          return common_vendor.e({
            a: record.SportDto && record.SportDto.Cover
          }, record.SportDto && record.SportDto.Cover ? {
            b: record.SportDto.Cover
          } : {}, {
            c: common_vendor.t(record.SportDto ? record.SportDto.Name : "运动"),
            d: common_vendor.t(record.RecordValue),
            e: common_vendor.t(record.SportUnitDto ? record.SportUnitDto.UnitName : ""),
            f: common_vendor.t(formatTime(record.RecordTime)),
            g: common_vendor.t(formatNumber(record.CaloriesBurned)),
            h: common_vendor.o(($event) => deleteRecord(record.Id), record.Id),
            i: "0f544f89-2-" + i0,
            j: record.Id
          });
        }),
        I: common_vendor.p({
          type: "trash",
          size: "20",
          color: "#ff4757"
        }),
        J: leaderboardType.value === "week" ? 1 : "",
        K: common_vendor.o(($event) => switchLeaderboard("week")),
        L: leaderboardType.value === "month" ? 1 : "",
        M: common_vendor.o(($event) => switchLeaderboard("month")),
        N: leaderboard.value.length === 0
      }, leaderboard.value.length === 0 ? {} : {}, {
        O: common_vendor.f(leaderboard.value, (row, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(row.Rank),
            b: row.ImageUrls
          }, row.ImageUrls ? {
            c: row.ImageUrls
          } : {}, {
            d: common_vendor.t(row.UserName),
            e: common_vendor.t(row.CheckDays),
            f: common_vendor.t(formatNumber(row.BurnedCalories)),
            g: common_vendor.t(row.Points),
            h: row.UserId
          });
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-0f544f89"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/Front/SportRecordList.js.map
