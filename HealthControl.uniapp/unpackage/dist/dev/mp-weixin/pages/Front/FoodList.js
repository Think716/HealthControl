"use strict";
const common_vendor = require("../../common/vendor.js");
const store_index = require("../../store/index.js");
const utils_http = require("../../utils/http.js");
const utils_comm = require("../../utils/comm.js");
if (!Array) {
  const _easycom_uni_nav_bar2 = common_vendor.resolveComponent("uni-nav-bar");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_uni_nav_bar2 + _easycom_uni_icons2 + _easycom_uni_popup2)();
}
const _easycom_uni_nav_bar = () => "../../uni_modules/uni-nav-bar/components/uni-nav-bar/uni-nav-bar.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_uni_nav_bar + _easycom_uni_icons + _easycom_uni_popup)();
}
const _sfc_main = {
  __name: "FoodList",
  setup(__props) {
    const commonStore = store_index.useCommonStore();
    common_vendor.computed(() => commonStore.Token);
    common_vendor.computed(() => commonStore.UserInfo);
    common_vendor.computed(() => commonStore.RoleType);
    const UserId = common_vendor.computed(() => commonStore.UserId);
    const FoodTypeList = common_vendor.ref([]);
    const activeCategory = common_vendor.ref(0);
    const scrollTop = common_vendor.ref(0);
    const selectedFood = common_vendor.ref(null);
    common_vendor.ref(null);
    const portionPopup = common_vendor.ref(null);
    const selectedUnit = common_vendor.ref(null);
    const portionAmount = common_vendor.ref("");
    const formatRecordTimeForPicker = (date = /* @__PURE__ */ new Date()) => {
      const pad = (num) => String(num).padStart(2, "0");
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };
    const recordTime = common_vendor.ref(formatRecordTimeForPicker());
    const calculatedNutrition = common_vendor.ref(null);
    const isRecording = common_vendor.ref(false);
    const voiceText = common_vendor.ref("");
    const voiceMatchedPreview = common_vendor.ref([]);
    const foodLoadError = common_vendor.ref("");
    let plugin = null;
    let manager = null;
    const inputStyles = {
      borderColor: "#4CAF50",
      borderRadius: "12rpx"
    };
    common_vendor.reactive({});
    const canSave = common_vendor.computed(() => {
      return portionAmount.value && parseFloat(portionAmount.value) > 0 && selectedUnit.value;
    });
    common_vendor.onLoad(async (option) => {
      initVoicePlugin();
    });
    common_vendor.onShow(async () => {
      await GetFoodTypeListApi();
    });
    common_vendor.onReady(async () => {
    });
    const goBack = () => {
      common_vendor.index.navigateBack();
    };
    const GetFoodTypeListApi = async () => {
      var _a;
      foodLoadError.value = "";
      try {
        const result = await utils_http.Post("/FoodType/List", { isQueryChild: true });
        const items = ((_a = result == null ? void 0 : result.Data) == null ? void 0 : _a.Items) || [];
        FoodTypeList.value = Array.isArray(items) ? items : [];
        if (!FoodTypeList.value.length) {
          foodLoadError.value = "食物列表为空，请先在后台维护食物数据";
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/Front/FoodList.vue:241", "获取食物列表失败:", error);
        FoodTypeList.value = [];
        foodLoadError.value = "食物列表加载失败，请检查网络或服务";
      }
    };
    const selectCategory = async (index, categoryId) => {
      activeCategory.value = index;
      await common_vendor.nextTick$1();
      const query = common_vendor.index.createSelectorQuery();
      query.select(`#category-${categoryId}`).boundingClientRect();
      query.selectViewport().scrollOffset();
      query.exec((res) => {
        if (res[0]) {
          scrollTop.value = res[0].top - 100;
        }
      });
    };
    const onFoodScroll = (e) => {
      e.detail.scrollTop;
      const query = common_vendor.index.createSelectorQuery();
      const categoryIds = FoodTypeList.value.map((item) => `#category-${item.Id}`);
      if (categoryIds.length === 0)
        return;
      query.selectAll(categoryIds.join(",")).boundingClientRect();
      query.exec((res) => {
        if (!res || !res[0])
          return;
        const rects = res[0];
        let currentIndex = 0;
        for (let i = 0; i < rects.length; i++) {
          if (rects[i].top <= 100) {
            currentIndex = i;
          } else {
            break;
          }
        }
        activeCategory.value = currentIndex;
      });
    };
    const selectFood = (food) => {
      selectedFood.value = food;
    };
    const selectUnit = (food, unit) => {
      selectedUnit.value = { food, unit };
      portionPopup.value.open();
      portionAmount.value = "";
      calculatedNutrition.value = null;
      recordTime.value = formatRecordTimeForPicker();
    };
    const closePortionPopup = () => {
      portionPopup.value.close();
      selectedUnit.value = null;
      portionAmount.value = "";
      calculatedNutrition.value = null;
      recordTime.value = formatRecordTimeForPicker();
    };
    const onTimeChange = (e) => {
      recordTime.value = e.detail.value;
    };
    const calculateNutrition = () => {
      if (!selectedUnit.value || !portionAmount.value || parseFloat(portionAmount.value) <= 0) {
        calculatedNutrition.value = null;
        return null;
      }
      const { food, unit } = selectedUnit.value;
      const amount = parseFloat(portionAmount.value);
      const unitWeight = parseFloat(unit.UnitValue || 1);
      calculatedNutrition.value = {
        calories: (food.Calories * unitWeight * amount).toFixed(2),
        protein: (food.Protein * unitWeight * amount).toFixed(2),
        carbohydrates: (food.Carbohydrates * unitWeight * amount).toFixed(2),
        fat: (food.Fat * unitWeight * amount).toFixed(2)
      };
      return calculatedNutrition.value;
    };
    common_vendor.watch([portionAmount, selectedUnit], () => {
      calculateNutrition();
    });
    const saveDietRecord = async () => {
      if (!canSave.value)
        return;
      common_vendor.index.showLoading({ title: "保存中..." });
      try {
        const nutrition = calculateNutrition();
        if (!nutrition) {
          common_vendor.index.showToast({
            title: "请先输入有效分量",
            icon: "none"
          });
          return;
        }
        const result = await utils_http.Post("/DietRecord/CreateOrEdit", {
          UserId: UserId.value,
          FoodId: selectedUnit.value.food.Id,
          UnitId: selectedUnit.value.unit.Id,
          Amount: parseFloat(portionAmount.value),
          RecordTime: utils_comm.GetFormatFullDate(new Date(recordTime.value.replace(" ", "T"))),
          Calories: parseFloat(nutrition.calories),
          Protein: parseFloat(nutrition.protein),
          Carbohydrates: parseFloat(nutrition.carbohydrates),
          Fat: parseFloat(nutrition.fat)
        });
        if (result.Success) {
          common_vendor.index.showToast({
            title: "记录保存成功！",
            icon: "success"
          });
          closePortionPopup();
        } else {
          common_vendor.index.showToast({
            title: result.Msg || "保存失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.showToast({
          title: (error == null ? void 0 : error.Msg) || (error == null ? void 0 : error.message) || "网络错误，请重试",
          icon: "none"
        });
        common_vendor.index.__f__("error", "at pages/Front/FoodList.vue:399", "保存饮食记录失败:", error);
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const initVoicePlugin = () => {
      try {
        plugin = requirePlugin("WechatSI");
        manager = plugin.getRecordRecognitionManager();
        manager.onStart = () => {
          isRecording.value = true;
        };
        manager.onStop = async (res) => {
          isRecording.value = false;
          if (!(res == null ? void 0 : res.result)) {
            common_vendor.index.showToast({ title: "未识别到有效语音", icon: "none" });
            return;
          }
          voiceText.value = res.result;
          await handleVoiceRecognitionResult(res.result);
        };
        manager.onError = (error) => {
          isRecording.value = false;
          common_vendor.index.__f__("error", "at pages/Front/FoodList.vue:427", "语音识别失败:", error);
          common_vendor.index.showToast({
            title: "语音识别失败，请重试",
            icon: "none"
          });
        };
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/Front/FoodList.vue:434", "初始化微信语音插件失败:", error);
      }
    };
    const toggleVoiceRecording = () => {
      if (!manager) {
        common_vendor.index.showToast({ title: "语音能力未初始化，请检查插件配置", icon: "none" });
        return;
      }
      if (isRecording.value) {
        manager.stop();
        return;
      }
      manager.start({
        lang: "zh_CN",
        duration: 3e4
      });
    };
    const clearVoiceResult = () => {
      voiceText.value = "";
      voiceMatchedPreview.value = [];
    };
    const handleVoiceRecognitionResult = async (text) => {
      if (!text || !text.trim()) {
        common_vendor.index.showToast({ title: "未识别到有效语音", icon: "none" });
        return;
      }
      common_vendor.index.showLoading({ title: "正在保存记录..." });
      try {
        const result = await utils_http.Post("/api/voice/recognize-text", {
          Text: text,
          UserId: UserId.value,
          RecordTime: utils_comm.GetFormatFullDate(/* @__PURE__ */ new Date())
        });
        const data = (result == null ? void 0 : result.Data) || result;
        const matchedItems = (data == null ? void 0 : data.matchedItems) || [];
        const savedCount = (data == null ? void 0 : data.savedCount) || 0;
        voiceMatchedPreview.value = matchedItems.map((item) => ({
          foodName: item.foodName,
          amount: item.count,
          unitName: item.unitName
        }));
        if (savedCount > 0) {
          common_vendor.index.showToast({ title: `已记录${savedCount}条`, icon: "success" });
          return;
        }
        common_vendor.index.showToast({ title: "未匹配到食物，请更换描述", icon: "none" });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/Front/FoodList.vue:499", "语音记录保存失败:", error);
        common_vendor.index.showToast({ title: "保存失败，请稍后重试", icon: "none" });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(goBack),
        b: common_vendor.p({
          dark: true,
          fixed: true,
          shadow: true,
          ["background-color"]: "#4CAF50",
          ["status-bar"]: true,
          ["left-icon"]: "left",
          ["left-text"]: "返回",
          title: "🥗 健康食物库"
        }),
        c: common_vendor.p({
          type: isRecording.value ? "mic-filled" : "mic",
          size: "20",
          color: "#fff"
        }),
        d: common_vendor.t(isRecording.value ? "结束录音" : "语音录入"),
        e: isRecording.value ? 1 : "",
        f: common_vendor.o(toggleVoiceRecording),
        g: common_vendor.p({
          type: "clear",
          size: "18",
          color: "#4CAF50"
        }),
        h: common_vendor.o(clearVoiceResult),
        i: voiceText.value
      }, voiceText.value ? {
        j: common_vendor.t(voiceText.value)
      } : {}, {
        k: voiceMatchedPreview.value.length > 0
      }, voiceMatchedPreview.value.length > 0 ? {
        l: common_vendor.f(voiceMatchedPreview.value, (item, index, i0) => {
          return {
            a: common_vendor.t(item.foodName),
            b: common_vendor.t(item.amount),
            c: common_vendor.t(item.unitName),
            d: index
          };
        })
      } : {}, {
        m: common_vendor.f(FoodTypeList.value, (category, index, i0) => {
          return {
            a: common_vendor.t(category.Name),
            b: category.Id,
            c: activeCategory.value === index ? 1 : "",
            d: common_vendor.o(($event) => selectCategory(index, category.Id), category.Id)
          };
        }),
        n: FoodTypeList.value.length > 0
      }, FoodTypeList.value.length > 0 ? {
        o: common_vendor.f(FoodTypeList.value, (category, k0, i0) => {
          return {
            a: common_vendor.t(category.Name),
            b: common_vendor.f(category.Foods, (food, k1, i1) => {
              return common_vendor.e({
                a: food.Cover,
                b: common_vendor.t(food.Name),
                c: common_vendor.t(food.Calories),
                d: common_vendor.t(food.Protein),
                e: common_vendor.t(food.Carbohydrates),
                f: common_vendor.t(food.Fat),
                g: food.FoodUnits && food.FoodUnits.length > 0
              }, food.FoodUnits && food.FoodUnits.length > 0 ? {
                h: common_vendor.f(food.FoodUnits, (unit, k2, i2) => {
                  return {
                    a: common_vendor.t(unit.UnitName),
                    b: common_vendor.t(unit.Calories),
                    c: unit.Id,
                    d: common_vendor.o(($event) => selectUnit(food, unit), unit.Id)
                  };
                })
              } : {}, {
                i: food.Id,
                j: common_vendor.o(($event) => selectFood(food), food.Id)
              });
            }),
            c: category.Id,
            d: `category-${category.Id}`
          };
        }),
        p: common_vendor.o(onFoodScroll),
        q: scrollTop.value
      } : {
        r: common_vendor.p({
          type: "info",
          size: "28",
          color: "#7cb67c"
        }),
        s: common_vendor.t(foodLoadError.value || "暂无食物数据，请稍后重试")
      }, {
        t: selectedUnit.value
      }, selectedUnit.value ? common_vendor.e({
        v: common_vendor.p({
          type: "closeempty",
          size: "24",
          color: "#666"
        }),
        w: common_vendor.o(closePortionPopup),
        x: selectedUnit.value.food.Cover,
        y: common_vendor.t(selectedUnit.value.food.Name),
        z: common_vendor.t(selectedUnit.value.unit.UnitName),
        A: common_vendor.t(selectedUnit.value.unit.UnitValue),
        B: common_vendor.s(inputStyles),
        C: portionAmount.value,
        D: common_vendor.o(($event) => portionAmount.value = $event.detail.value),
        E: calculatedNutrition.value
      }, calculatedNutrition.value ? {
        F: common_vendor.t(calculatedNutrition.value.calories),
        G: common_vendor.t(calculatedNutrition.value.protein),
        H: common_vendor.t(calculatedNutrition.value.carbohydrates),
        I: common_vendor.t(calculatedNutrition.value.fat)
      } : {}, {
        J: common_vendor.t(recordTime.value),
        K: common_vendor.p({
          type: "arrowright",
          size: "18",
          color: "#999"
        }),
        L: recordTime.value,
        M: common_vendor.o(onTimeChange),
        N: common_vendor.o(closePortionPopup),
        O: !canSave.value,
        P: common_vendor.o(saveDietRecord)
      }) : {}, {
        Q: common_vendor.sr(portionPopup, "05c655f0-4", {
          "k": "portionPopup"
        }),
        R: common_vendor.p({
          type: "center",
          ["background-color"]: "rgba(0,0,0,0.5)"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-05c655f0"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/Front/FoodList.js.map
