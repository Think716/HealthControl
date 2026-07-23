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
    const scrollIntoView = common_vendor.ref("");
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
    const parsePickerDateTime = (value) => {
      if (!value)
        return /* @__PURE__ */ new Date();
      const [datePart, timePart = "00:00"] = value.split(" ");
      const [year, month, day] = datePart.split("-").map(Number);
      const [hour, minute] = timePart.split(":").map(Number);
      return new Date(year, (month || 1) - 1, day || 1, hour || 0, minute || 0, 0);
    };
    const calculatedNutrition = common_vendor.ref(null);
    const quickRecordText = common_vendor.ref("");
    const voiceText = common_vendor.ref("");
    const voiceMatchedPreview = common_vendor.ref([]);
    const voiceUnmatchedTexts = common_vendor.ref([]);
    const foodLoadError = common_vendor.ref("");
    const inputStyles = {
      color: "#111827",
      fontSize: "32rpx",
      fontWeight: "700"
    };
    common_vendor.reactive({});
    const canSave = common_vendor.computed(() => {
      return portionAmount.value && parseFloat(portionAmount.value) > 0 && selectedUnit.value;
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
        common_vendor.index.__f__("error", "at pages/Front/FoodList.vue:261", "获取食物列表失败:", error);
        FoodTypeList.value = [];
        foodLoadError.value = "食物列表加载失败，请检查网络或服务";
      }
    };
    const selectCategory = async (index, categoryId) => {
      activeCategory.value = index;
      scrollIntoView.value = "";
      await common_vendor.nextTick$1();
      scrollIntoView.value = `category-${categoryId}`;
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
    const onPortionInput = (e) => {
      let val = e.detail.value;
      val = val.replace(/[^\d.]/g, "");
      const dotIndex = val.indexOf(".");
      if (dotIndex !== -1) {
        val = val.substring(0, dotIndex + 1) + val.substring(dotIndex + 1).replace(/\./g, "");
      }
      portionAmount.value = val;
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
        const parsedAmount = parseFloat(portionAmount.value);
        const result = await utils_http.Post("/DietRecord/CreateOrEdit", {
          RecordUserId: UserId.value,
          FoodId: selectedUnit.value.food.Id,
          // ← 加上 FoodId
          FoodUnitId: selectedUnit.value.unit.Id,
          RecordValue: Math.max(1, Math.round(parsedAmount)),
          RecordTime: utils_comm.GetFormatFullDate(parsePickerDateTime(recordTime.value))
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
        common_vendor.index.__f__("error", "at pages/Front/FoodList.vue:419", "保存饮食记录失败:", error);
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const clearVoiceResult = () => {
      quickRecordText.value = "";
      voiceText.value = "";
      voiceMatchedPreview.value = [];
      voiceUnmatchedTexts.value = [];
    };
    const submitQuickRecord = async () => {
      const text = quickRecordText.value.trim();
      if (!text) {
        common_vendor.index.showToast({ title: "请输入饮食描述", icon: "none" });
        return;
      }
      voiceText.value = text;
      common_vendor.index.showLoading({ title: "正在保存记录..." });
      try {
        const result = await utils_http.Post("/api/voice/recognize-text", {
          Text: text,
          UserId: UserId.value,
          RecordTime: utils_comm.GetFormatFullDate(/* @__PURE__ */ new Date())
        });
        const data = (result == null ? void 0 : result.Data) || result;
        const matchedItems = (data == null ? void 0 : data.MatchedItems) || (data == null ? void 0 : data.matchedItems) || [];
        const meaninglessWords = [
          "早餐",
          "午餐",
          "晚餐",
          "夜宵",
          "宵夜",
          "加餐",
          "吃了",
          "喝了",
          "还有",
          "和",
          "以及",
          "一个",
          "一杯",
          "一些",
          "一点",
          "今天",
          "刚刚",
          "记录",
          "一下",
          "我"
          // ← 补充缺失项
        ];
        const unmatchedTexts = ((data == null ? void 0 : data.UnmatchedTexts) || (data == null ? void 0 : data.unmatchedTexts) || []).filter((item) => {
          return !meaninglessWords.includes(item);
        });
        const savedCount = (data == null ? void 0 : data.SavedCount) || (data == null ? void 0 : data.savedCount) || 0;
        voiceMatchedPreview.value = matchedItems.map((item) => ({
          foodName: item.FoodName || item.foodName,
          amount: item.Count || item.count,
          unitName: item.UnitName || item.unitName
        }));
        voiceUnmatchedTexts.value = unmatchedTexts;
        if (savedCount > 0) {
          if (unmatchedTexts.length > 0) {
            common_vendor.index.showToast({
              title: `已记录${savedCount}条，${unmatchedTexts.length}条未识别`,
              icon: "success",
              duration: 3e3
            });
          } else {
            common_vendor.index.showToast({ title: `已记录${savedCount}条`, icon: "success" });
          }
          return;
        }
        common_vendor.index.showToast({ title: "未匹配到食物，请更换描述", icon: "none" });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/Front/FoodList.vue:484", "快速记录保存失败:", error);
        common_vendor.index.showToast({ title: "保存失败，请稍后重试", icon: "none" });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const recorderManager = common_vendor.index.getRecorderManager();
    const isRecording = common_vendor.ref(false);
    const audioFilePath = common_vendor.ref("");
    recorderManager.onStart(() => {
      isRecording.value = true;
      common_vendor.index.__f__("log", "at pages/Front/FoodList.vue:499", "[Voice] 录音已开始");
      common_vendor.index.showLoading({ title: "正在聆听..." });
    });
    recorderManager.onStop((res) => {
      isRecording.value = false;
      common_vendor.index.hideLoading();
      audioFilePath.value = res.tempFilePath;
      common_vendor.index.__f__("log", "at pages/Front/FoodList.vue:508", "[Voice] 录音结束, 文件路径:", res.tempFilePath);
      common_vendor.index.__f__("log", "at pages/Front/FoodList.vue:509", "[Voice] 录音时长:", res.duration, "ms");
      uploadAndRecognizeAudio(res.tempFilePath);
    });
    recorderManager.onError((err) => {
      common_vendor.index.__f__("error", "at pages/Front/FoodList.vue:516", "[Voice] 录音错误:", JSON.stringify(err));
      isRecording.value = false;
      common_vendor.index.hideLoading();
      let errorMsg = "录音失败";
      if (err.errMsg && err.errMsg.includes("permission")) {
        errorMsg = "请允许麦克风权限后再试";
      } else if (err.errMsg && err.errMsg.includes("system")) {
        errorMsg = "系统录音功能异常，请重试";
      }
      common_vendor.index.showToast({
        title: errorMsg,
        icon: "none",
        duration: 2e3
      });
    });
    const toggleVoice = () => {
      if (isRecording.value) {
        stopVoiceRecognition();
      } else {
        startVoiceRecognition();
      }
    };
    const startVoiceRecognition = () => {
      common_vendor.index.__f__("log", "at pages/Front/FoodList.vue:545", "[Voice] 点击语音输入按钮");
      try {
        recorderManager.start({
          duration: 1e4,
          sampleRate: 16e3,
          numberOfChannels: 1,
          encodeBitRate: 48e3,
          format: "wav"
        });
        common_vendor.index.__f__("log", "at pages/Front/FoodList.vue:561", "[Voice] start() 调用成功");
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/Front/FoodList.vue:563", "[Voice] start() 异常:", e);
        common_vendor.index.showToast({ title: "录音启动失败", icon: "none" });
      }
    };
    const stopVoiceRecognition = () => {
      common_vendor.index.__f__("log", "at pages/Front/FoodList.vue:570", "[Voice] 停止录音");
      recorderManager.stop();
    };
    const uploadAndRecognizeAudio = async (filePath) => {
      common_vendor.index.showLoading({ title: "识别中..." });
      try {
        const uploadRes = await new Promise((resolve, reject) => {
          common_vendor.index.uploadFile({
            url: `${"http://localhost:7245"}/api/voice/recognize`,
            filePath,
            name: "file",
            formData: {
              userId: UserId.value
            },
            success: resolve,
            fail: reject
          });
        });
        const result = JSON.parse(uploadRes.data);
        if (result.Success && result.Data) {
          const data = result.Data;
          const matchedItems = data.matchedItems || [];
          const unmatchedTexts = data.unmatchedTexts || [];
          const savedCount = data.savedCount || 0;
          voiceMatchedPreview.value = matchedItems.map((item) => ({
            foodName: item.foodName,
            amount: item.count,
            unitName: item.unitName
          }));
          voiceUnmatchedTexts.value = unmatchedTexts.filter((text) => {
            const meaninglessWords = ["早餐", "午餐", "晚餐", "吃了", "喝了"];
            return !meaninglessWords.some((word) => text.includes(word));
          });
          if (savedCount > 0) {
            common_vendor.index.showToast({
              title: `已记录${savedCount}条`,
              icon: "success"
            });
          } else {
            common_vendor.index.showToast({
              title: "未匹配到食物",
              icon: "none"
            });
          }
        } else {
          common_vendor.index.showToast({
            title: result.Msg || "识别失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/Front/FoodList.vue:629", "语音识别失败:", error);
        common_vendor.index.showToast({
          title: "网络错误，请重试",
          icon: "none"
        });
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
        c: common_vendor.o(submitQuickRecord),
        d: quickRecordText.value,
        e: common_vendor.o(($event) => quickRecordText.value = $event.detail.value),
        f: common_vendor.p({
          type: isRecording.value ? "sound-filled" : "mic",
          size: "20",
          color: "#fff"
        }),
        g: common_vendor.t(isRecording.value ? "停止录音" : "语音输入"),
        h: isRecording.value ? 1 : "",
        i: isRecording.value || !!voiceText.value ? 1 : "",
        j: common_vendor.o(toggleVoice),
        k: common_vendor.p({
          type: "compose",
          size: "20",
          color: "#fff"
        }),
        l: common_vendor.o(submitQuickRecord),
        m: common_vendor.p({
          type: "clear",
          size: "18",
          color: "#4CAF50"
        }),
        n: common_vendor.o(clearVoiceResult),
        o: voiceText.value
      }, voiceText.value ? {
        p: common_vendor.t(voiceText.value)
      } : {}, {
        q: voiceMatchedPreview.value.length > 0
      }, voiceMatchedPreview.value.length > 0 ? {
        r: common_vendor.f(voiceMatchedPreview.value, (item, index, i0) => {
          return {
            a: common_vendor.t(item.foodName),
            b: common_vendor.t(item.amount),
            c: common_vendor.t(item.unitName),
            d: index
          };
        })
      } : {}, {
        s: voiceUnmatchedTexts.value.length > 0
      }, voiceUnmatchedTexts.value.length > 0 ? {
        t: common_vendor.f(voiceUnmatchedTexts.value, (text, index, i0) => {
          return {
            a: common_vendor.t(text),
            b: index
          };
        })
      } : {}, {
        v: common_vendor.f(FoodTypeList.value, (category, index, i0) => {
          return {
            a: common_vendor.t(category.Name),
            b: category.Id,
            c: activeCategory.value === index ? 1 : "",
            d: common_vendor.o(($event) => selectCategory(index, category.Id), category.Id)
          };
        }),
        w: FoodTypeList.value.length > 0
      }, FoodTypeList.value.length > 0 ? {
        x: common_vendor.f(FoodTypeList.value, (category, k0, i0) => {
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
        y: common_vendor.o(onFoodScroll),
        z: scrollIntoView.value
      } : {
        A: common_vendor.p({
          type: "info",
          size: "28",
          color: "#7cb67c"
        }),
        B: common_vendor.t(foodLoadError.value || "暂无食物数据，请稍后重试")
      }, {
        C: selectedUnit.value
      }, selectedUnit.value ? common_vendor.e({
        D: common_vendor.p({
          type: "closeempty",
          size: "24",
          color: "#666"
        }),
        E: common_vendor.o(closePortionPopup),
        F: selectedUnit.value.food.Cover,
        G: common_vendor.t(selectedUnit.value.food.Name),
        H: common_vendor.t(selectedUnit.value.unit.UnitName),
        I: common_vendor.t(selectedUnit.value.unit.UnitValue),
        J: common_vendor.s(inputStyles),
        K: common_vendor.o([($event) => portionAmount.value = $event.detail.value, onPortionInput]),
        L: portionAmount.value,
        M: calculatedNutrition.value
      }, calculatedNutrition.value ? {
        N: common_vendor.t(calculatedNutrition.value.calories),
        O: common_vendor.t(calculatedNutrition.value.protein),
        P: common_vendor.t(calculatedNutrition.value.carbohydrates),
        Q: common_vendor.t(calculatedNutrition.value.fat)
      } : {}, {
        R: common_vendor.t(recordTime.value),
        S: common_vendor.p({
          type: "arrowright",
          size: "18",
          color: "#999"
        }),
        T: recordTime.value,
        U: common_vendor.o(onTimeChange),
        V: common_vendor.o(closePortionPopup),
        W: !canSave.value,
        X: common_vendor.o(saveDietRecord)
      }) : {}, {
        Y: common_vendor.sr(portionPopup, "05c655f0-5", {
          "k": "portionPopup"
        }),
        Z: common_vendor.p({
          type: "center"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-05c655f0"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/Front/FoodList.js.map
