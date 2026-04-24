"use strict";
const common_vendor = require("../../common/vendor.js");
const store_index = require("../../store/index.js");
const utils_http = require("../../utils/http.js");
if (!Array) {
  const _easycom_uni_nav_bar2 = common_vendor.resolveComponent("uni-nav-bar");
  const _easycom_uni_tag2 = common_vendor.resolveComponent("uni-tag");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  (_easycom_uni_nav_bar2 + _easycom_uni_tag2 + _easycom_uni_icons2)();
}
const _easycom_uni_nav_bar = () => "../../uni_modules/uni-nav-bar/components/uni-nav-bar/uni-nav-bar.js";
const _easycom_uni_tag = () => "../../uni_modules/uni-tag/components/uni-tag/uni-tag.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  (_easycom_uni_nav_bar + _easycom_uni_tag + _easycom_uni_icons)();
}
const _sfc_main = {
  __name: "AiAnalyse",
  setup(__props) {
    const commonStore = store_index.useCommonStore();
    common_vendor.computed(() => commonStore.Token);
    common_vendor.computed(() => commonStore.UserInfo);
    common_vendor.computed(() => commonStore.RoleType);
    const UserId = common_vendor.computed(() => commonStore.UserId);
    const loading = common_vendor.ref(false);
    const error = common_vendor.ref(false);
    const Data = common_vendor.ref(null);
    const analysisResult = common_vendor.ref(null);
    const activeTab = common_vendor.ref("overview");
    const scrollThrottleTimer = common_vendor.ref(null);
    const sectionPositions = common_vendor.ref([]);
    const recalcTimer = common_vendor.ref(null);
    const analysisData = common_vendor.reactive({
      UserId: "",
      Days: 7
    });
    const tabList = common_vendor.ref([
      { id: "overview", name: "总评", emoji: "🎯" },
      { id: "risks", name: "风险", emoji: "⚠️" },
      { id: "nutrition", name: "营养", emoji: "🥗" },
      { id: "indicators", name: "指标", emoji: "📊" },
      { id: "recommendations", name: "建议", emoji: "💡" }
    ]);
    common_vendor.onLoad(async (option) => {
      analysisData.UserId = UserId.value;
      getAiAnalyseApi();
    });
    const debouncedRecalculate = () => {
      if (recalcTimer.value) {
        clearTimeout(recalcTimer.value);
      }
      recalcTimer.value = setTimeout(() => {
        if (analysisResult.value) {
          calculateSectionPositions();
        }
      }, 300);
    };
    common_vendor.onShow(async () => {
      common_vendor.index.onWindowResize(() => {
        debouncedRecalculate();
      });
    });
    common_vendor.onPageScroll((e) => {
      if (!analysisResult.value)
        return;
      if (scrollThrottleTimer.value) {
        clearTimeout(scrollThrottleTimer.value);
      }
      scrollThrottleTimer.value = setTimeout(() => {
        updateActiveTab(e.scrollTop);
      }, 50);
    });
    common_vendor.onReady(async () => {
      if (analysisResult.value) {
        await common_vendor.nextTick$1();
        setTimeout(() => {
          calculateSectionPositions();
        }, 200);
      }
    });
    const getDefaultAnalysisResult = () => ({
      OverallHealthScore: 0,
      HealthLevel: "待评估",
      Summary: "暂无分析摘要",
      HealthRisks: [],
      NutritionAnalysis: {
        NutritionBalanceScore: 0,
        CalorieIntakeAssessment: "暂无数据",
        ProteinAssessment: "暂无数据",
        CarbohydrateAssessment: "暂无数据",
        FatAssessment: "暂无数据",
        DietaryRecommendations: []
      },
      IndicatorAnalyses: [],
      Recommendations: []
    });
    const EXCLUDED_KEYWORDS = ["运动", "血糖", "血氧", "肺活量", "游离三碘甲状腺氨基酸", "游离三碘甲状腺原氨酸", "FT3"];
    const shouldExcludeText = (...texts) => {
      const merged = texts.filter(Boolean).join("");
      return EXCLUDED_KEYWORDS.some((keyword) => merged.includes(keyword));
    };
    const filterAnalysisItems = (result) => ({
      ...result,
      HealthRisks: result.HealthRisks.filter((risk) => !shouldExcludeText(risk == null ? void 0 : risk.RiskType, risk == null ? void 0 : risk.Description, risk == null ? void 0 : risk.Suggestions)),
      IndicatorAnalyses: result.IndicatorAnalyses.filter((indicator) => !shouldExcludeText(indicator == null ? void 0 : indicator.IndicatorName)),
      Recommendations: result.Recommendations.filter((item) => !shouldExcludeText(item == null ? void 0 : item.RecommendationType, item == null ? void 0 : item.Title, item == null ? void 0 : item.Content))
    });
    const normalizeAnalysisResult = (result) => {
      var _a;
      const fallback = getDefaultAnalysisResult();
      if (!result || typeof result !== "object")
        return fallback;
      const normalized = {
        ...fallback,
        ...result,
        HealthRisks: Array.isArray(result.HealthRisks) ? result.HealthRisks : [],
        NutritionAnalysis: {
          ...fallback.NutritionAnalysis,
          ...result.NutritionAnalysis || {},
          DietaryRecommendations: Array.isArray((_a = result.NutritionAnalysis) == null ? void 0 : _a.DietaryRecommendations) ? result.NutritionAnalysis.DietaryRecommendations : []
        },
        IndicatorAnalyses: Array.isArray(result.IndicatorAnalyses) ? result.IndicatorAnalyses : [],
        Recommendations: Array.isArray(result.Recommendations) ? result.Recommendations : []
      };
      return filterAnalysisItems(normalized);
    };
    const getAiAnalyseApi = async () => {
      var _a;
      try {
        loading.value = true;
        error.value = false;
        analysisResult.value = null;
        let response = await utils_http.Post("/AiAnalyse/AnalyzeUserHealth", {
          UserId: UserId.value,
          Days: 7
        });
        Data.value = (response == null ? void 0 : response.Data) || {};
        analysisResult.value = normalizeAnalysisResult((_a = response == null ? void 0 : response.Data) == null ? void 0 : _a.AnalysisResult);
        await common_vendor.nextTick$1();
        setTimeout(() => {
          calculateSectionPositions();
        }, 100);
      } catch (err) {
        error.value = true;
        common_vendor.index.__f__("error", "at pages/Front/AiAnalyse.vue:372", "AI分析失败:", err);
        common_vendor.index.showToast({
          title: "分析失败，请稍后重试",
          icon: "error"
        });
      } finally {
        loading.value = false;
      }
    };
    const goBack = () => {
      common_vendor.index.navigateBack();
    };
    const getHealthLevelClass = () => {
      const level = analysisResult.value.HealthLevel;
      if (level === "优秀")
        return "level-excellent";
      if (level === "良好")
        return "level-good";
      if (level === "一般")
        return "level-average";
      return "level-poor";
    };
    const getRiskLevelType = (level) => {
      if (level === "高")
        return "error";
      if (level === "中")
        return "warning";
      return "success";
    };
    const getIndicatorStatusType = (status) => {
      if (status === "正常")
        return "success";
      if (status === "偏高" || status === "偏低")
        return "warning";
      return "error";
    };
    const getPriorityType = (priority) => {
      if (priority === "高")
        return "error";
      if (priority === "中")
        return "warning";
      return "primary";
    };
    const formatAnalysisTime = (timeString) => {
      if (!timeString)
        return "暂无时间";
      const date = new Date(timeString);
      if (Number.isNaN(date.getTime()))
        return "暂无时间";
      return date.toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      });
    };
    const getRiskEmoji = (riskType) => {
      const type = String(riskType || "");
      if (type.includes("体重"))
        return "⚖️";
      if (type.includes("营养"))
        return "🥗";
      if (type.includes("心血管"))
        return "❤️";
    };
    const getIndicatorEmoji = (indicatorName) => {
      const name = String(indicatorName || "");
      if (name.includes("体重"))
        return "⚖️";
      if (name.includes("体温"))
        return "🌡️";
      return "📊";
    };
    const getRecommendationEmoji = (recommendationType) => {
      if (recommendationType === "医疗")
        return "🏥";
      if (recommendationType === "饮食")
        return "🍽️";
      if (recommendationType === "生活习惯")
        return "🏡";
      return "💡";
    };
    const scrollToSection = async (sectionId) => {
      activeTab.value = sectionId;
      await common_vendor.nextTick$1();
      const query = common_vendor.index.createSelectorQuery();
      query.select(`#${sectionId}`).boundingClientRect();
      query.selectViewport().scrollOffset();
      query.exec((res) => {
        if (res[0]) {
          let targetScrollTop;
          targetScrollTop = res[0].top + res[1].scrollTop - 180;
          common_vendor.index.pageScrollTo({
            scrollTop: Math.max(0, targetScrollTop),
            // 确保不会滚动到负值
            duration: 300
          });
        }
      });
    };
    const calculateSectionPositions = async () => {
      if (!analysisResult.value)
        return;
      await common_vendor.nextTick$1();
      const sectionIds = ["overview", "risks", "nutrition", "indicators", "recommendations"];
      const positions = [];
      return new Promise((resolve) => {
        let completed = 0;
        sectionIds.forEach((sectionId, index) => {
          const query = common_vendor.index.createSelectorQuery();
          query.select(`#${sectionId}`).boundingClientRect();
          query.selectViewport().scrollOffset();
          query.exec((res) => {
            if (res[0] && res[1]) {
              positions[index] = {
                id: sectionId,
                top: res[0].top + res[1].scrollTop,
                bottom: res[0].top + res[1].scrollTop + res[0].height
              };
            }
            completed++;
            if (completed === sectionIds.length) {
              sectionPositions.value = positions.filter((p) => p).sort((a, b) => a.top - b.top);
              resolve();
            }
          });
        });
      });
    };
    const updateActiveTab = (scrollTop) => {
      if (!analysisResult.value || sectionPositions.value.length === 0)
        return;
      let offsetTop;
      offsetTop = 280;
      const adjustedScrollTop = scrollTop + offsetTop;
      for (let i = sectionPositions.value.length - 1; i >= 0; i--) {
        const section = sectionPositions.value[i];
        if (adjustedScrollTop >= section.top) {
          if (activeTab.value !== section.id) {
            activeTab.value = section.id;
          }
          break;
        }
      }
    };
    return (_ctx, _cache) => {
      var _a;
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
          title: "AI智能分析"
        }),
        c: analysisResult.value
      }, analysisResult.value ? {
        d: common_vendor.f(tabList.value, (tab, index, i0) => {
          return {
            a: common_vendor.t(tab.emoji),
            b: common_vendor.t(tab.name),
            c: index,
            d: activeTab.value === tab.id ? 1 : "",
            e: common_vendor.o(($event) => scrollToSection(tab.id), index)
          };
        })
      } : {}, {
        e: loading.value
      }, loading.value ? {
        f: common_vendor.t(analysisData.Days)
      } : analysisResult.value ? {
        h: common_vendor.t(analysisResult.value.OverallHealthScore),
        i: common_vendor.t(analysisResult.value.HealthLevel),
        j: common_vendor.n(getHealthLevelClass()),
        k: common_vendor.t(analysisResult.value.Summary),
        l: common_vendor.f(analysisResult.value.HealthRisks, (risk, index, i0) => {
          return {
            a: common_vendor.t(getRiskEmoji(risk.RiskType)),
            b: common_vendor.t(risk.RiskType),
            c: "3b5a3068-1-" + i0,
            d: common_vendor.p({
              text: risk.RiskLevel,
              type: getRiskLevelType(risk.RiskLevel),
              size: "mini"
            }),
            e: common_vendor.t(risk.Description),
            f: common_vendor.t(risk.Suggestions),
            g: index
          };
        }),
        m: analysisResult.value.NutritionAnalysis.NutritionBalanceScore + "%",
        n: common_vendor.t(analysisResult.value.NutritionAnalysis.NutritionBalanceScore),
        o: common_vendor.t(analysisResult.value.NutritionAnalysis.CalorieIntakeAssessment),
        p: common_vendor.t(analysisResult.value.NutritionAnalysis.ProteinAssessment),
        q: common_vendor.t(analysisResult.value.NutritionAnalysis.CarbohydrateAssessment),
        r: common_vendor.t(analysisResult.value.NutritionAnalysis.FatAssessment),
        s: common_vendor.f(analysisResult.value.NutritionAnalysis.DietaryRecommendations, (recommendation, index, i0) => {
          return {
            a: common_vendor.t(index + 1),
            b: common_vendor.t(recommendation),
            c: index
          };
        }),
        t: common_vendor.f(analysisResult.value.IndicatorAnalyses, (indicator, index, i0) => {
          return {
            a: common_vendor.t(getIndicatorEmoji(indicator.IndicatorName)),
            b: common_vendor.t(indicator.IndicatorName),
            c: "3b5a3068-2-" + i0,
            d: common_vendor.p({
              text: indicator.Status,
              type: getIndicatorStatusType(indicator.Status),
              size: "mini"
            }),
            e: common_vendor.t(indicator.CurrentValue),
            f: common_vendor.t(indicator.NormalRange),
            g: common_vendor.t(indicator.Trend),
            h: common_vendor.t(indicator.Advice),
            i: index
          };
        }),
        v: common_vendor.f(analysisResult.value.Recommendations, (recommendation, index, i0) => {
          return {
            a: common_vendor.t(getRecommendationEmoji(recommendation.RecommendationType)),
            b: common_vendor.t(recommendation.Title),
            c: "3b5a3068-3-" + i0,
            d: common_vendor.p({
              text: recommendation.Priority,
              type: getPriorityType(recommendation.Priority),
              size: "mini"
            }),
            e: common_vendor.t(recommendation.RecommendationType),
            f: common_vendor.t(recommendation.Content),
            g: common_vendor.t(recommendation.ExpectedEffect),
            h: index
          };
        }),
        w: common_vendor.t(formatAnalysisTime((_a = Data.value) == null ? void 0 : _a.AnalysisTime))
      } : error.value ? {
        y: common_vendor.p({
          type: "info",
          size: "60",
          color: "#ff6b6b"
        }),
        z: common_vendor.o(getAiAnalyseApi)
      } : {}, {
        g: analysisResult.value,
        x: error.value
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-3b5a3068"]]);
_sfc_main.__runtimeHooks = 1;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/Front/AiAnalyse.js.map
