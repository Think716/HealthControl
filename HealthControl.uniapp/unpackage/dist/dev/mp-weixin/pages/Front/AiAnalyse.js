"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_http = require("../../utils/http.js");
const store_index = require("../../store/index.js");
if (!Array) {
  const _easycom_uni_nav_bar2 = common_vendor.resolveComponent("uni-nav-bar");
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  const _easycom_uni_card2 = common_vendor.resolveComponent("uni-card");
  (_easycom_uni_nav_bar2 + _easycom_uni_load_more2 + _easycom_uni_card2)();
}
const _easycom_uni_nav_bar = () => "../../uni_modules/uni-nav-bar/components/uni-nav-bar/uni-nav-bar.js";
const _easycom_uni_load_more = () => "../../uni_modules/uni-load-more/components/uni-load-more/uni-load-more.js";
const _easycom_uni_card = () => "../../uni_modules/uni-card/components/uni-card/uni-card.js";
if (!Math) {
  (_easycom_uni_nav_bar + _easycom_uni_load_more + _easycom_uni_card)();
}
const _sfc_main = {
  __name: "AiAnalyse",
  setup(__props) {
    const store = store_index.useCommonStore();
    const loading = common_vendor.ref(false);
    const error = common_vendor.ref(false);
    const errorMsg = common_vendor.ref("");
    const analysisResult = common_vendor.ref(null);
    const Data = common_vendor.ref({});
    const activeTab = common_vendor.ref("overview");
    const analysisData = common_vendor.reactive({
      UserId: "",
      Days: 7
    });
    const tabList = [
      { id: "overview", name: "总评", emoji: "🎯" },
      { id: "risks", name: "风险", emoji: "⚠️" },
      { id: "nutrition", name: "营养", emoji: "🥗" },
      { id: "sport", name: "运动", emoji: "🏃" },
      { id: "indicators", name: "指标", emoji: "📊" },
      { id: "recommendations", name: "建议", emoji: "💡" }
    ];
    common_vendor.onLoad(() => {
      analysisData.UserId = store.UserId;
      getAiAnalyseApi();
    });
    const getAiAnalyseApi = async () => {
      try {
        loading.value = true;
        error.value = false;
        errorMsg.value = "";
        analysisResult.value = null;
        const res = await utils_http.Post("/AiAnalyse/AnalyzeUserHealth", {
          UserId: store.UserId,
          Days: 7
        });
        common_vendor.index.__f__("log", "at pages/Front/AiAnalyse.vue:245", "AI接口返回：", res);
        if ((res == null ? void 0 : res.Success) === false || (res == null ? void 0 : res.success) === false) {
          throw new Error((res == null ? void 0 : res.Message) || (res == null ? void 0 : res.message) || "AI分析失败");
        }
        const responseData = (res == null ? void 0 : res.Data) || (res == null ? void 0 : res.data) || {};
        if ((responseData == null ? void 0 : responseData.Success) === false || (responseData == null ? void 0 : responseData.success) === false) {
          throw new Error((responseData == null ? void 0 : responseData.ErrorMessage) || (responseData == null ? void 0 : responseData.errorMessage) || "AI分析失败");
        }
        const result = (responseData == null ? void 0 : responseData.AnalysisResult) || (responseData == null ? void 0 : responseData.analysisResult) || {};
        if (!result || Object.keys(result).length === 0) {
          throw new Error("AI接口没有返回分析结果");
        }
        Data.value = responseData;
        analysisResult.value = normalizeAnalysisResult(result);
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/Front/AiAnalyse.vue:264", "AI分析失败：", e);
        error.value = true;
        errorMsg.value = (e == null ? void 0 : e.message) || (e == null ? void 0 : e.Msg) || "请检查后端服务、AI配置或网络连接";
      } finally {
        loading.value = false;
      }
    };
    const tryParseAiContent = (raw) => {
      if (typeof raw !== "string")
        return raw;
      const cleaned = raw.trim();
      if (!cleaned)
        return null;
      try {
        return JSON.parse(cleaned);
      } catch (e) {
        common_vendor.index.__f__("warn", "at pages/Front/AiAnalyse.vue:280", "AI结果非JSON字符串，保留原值：", e);
        return raw;
      }
    };
    const normalizeAnalysisResult = (raw) => {
      var _a;
      const parsedRaw = tryParseAiContent(raw);
      if (!parsedRaw || typeof parsedRaw !== "object") {
        return {
          OverallHealthScore: 0,
          HealthLevel: "暂无",
          Summary: "暂无分析结果",
          HealthRisks: [],
          NutritionAnalysis: {
            NutritionBalanceScore: 0,
            CalorieIntakeAssessment: "",
            ProteinAssessment: "",
            CarbohydrateAssessment: "",
            FatAssessment: "",
            DietaryRecommendations: []
          },
          SportAnalysis: {
            ExerciseFrequencyScore: 0,
            ExerciseVolumeAssessment: "",
            CaloriesBurnedAssessment: "",
            ExerciseVarietyAssessment: "",
            ExerciseRecommendations: []
          },
          IndicatorAnalyses: [],
          Recommendations: []
        };
      }
      const score = parsedRaw.OverallHealthScore ?? parsedRaw.overallHealthScore ?? parsedRaw.Score ?? parsedRaw.score ?? 0;
      const level = parsedRaw.HealthLevel ?? parsedRaw.healthLevel ?? parsedRaw.Evaluation ?? parsedRaw.evaluation ?? "暂无";
      const summary = parsedRaw.Summary ?? parsedRaw.summary ?? "暂无分析结果";
      const rawRisks = parsedRaw.HealthRisks ?? parsedRaw.healthRisks ?? parsedRaw.Risks ?? parsedRaw.risks ?? (((_a = parsedRaw.Problems ?? parsedRaw.problems) == null ? void 0 : _a.map((item) => ({
        RiskType: "健康风险",
        RiskLevel: "中",
        Description: item,
        Suggestions: "建议调整生活习惯"
      }))) || []);
      const risks = rawRisks.map((item) => ({
        RiskType: item.RiskType ?? item.riskType ?? item.Type ?? item.type ?? "健康风险",
        RiskLevel: item.RiskLevel ?? item.riskLevel ?? item.Level ?? item.level ?? "中",
        Description: item.Description ?? item.description ?? "",
        Suggestions: item.Suggestions ?? item.suggestions ?? item.Advice ?? item.advice ?? ""
      }));
      const sourceSuggestions = parsedRaw.Suggestions ?? parsedRaw.suggestions;
      const rawRecommendations = parsedRaw.Recommendations ?? parsedRaw.recommendations ?? (sourceSuggestions == null ? void 0 : sourceSuggestions.map((item) => ({
        Title: "健康建议",
        Content: item,
        ExpectedEffect: "改善健康状态"
      }))) ?? [];
      const recommendations = rawRecommendations.map((item) => ({
        Title: item.Title ?? item.title ?? "健康建议",
        Content: item.Content ?? item.content ?? "",
        ExpectedEffect: item.ExpectedEffect ?? item.expectedEffect ?? ""
      }));
      const nutrition = parsedRaw.NutritionAnalysis ?? parsedRaw.nutritionAnalysis ?? parsedRaw.Nutrition ?? parsedRaw.nutrition ?? {};
      const nutritionResult = {
        NutritionBalanceScore: nutrition.NutritionBalanceScore ?? nutrition.nutritionBalanceScore ?? score ?? 0,
        CalorieIntakeAssessment: nutrition.CalorieIntakeAssessment ?? nutrition.calorieIntakeAssessment ?? nutrition.Evaluation ?? nutrition.evaluation ?? "",
        ProteinAssessment: nutrition.ProteinAssessment ?? nutrition.proteinAssessment ?? "",
        CarbohydrateAssessment: nutrition.CarbohydrateAssessment ?? nutrition.carbohydrateAssessment ?? "",
        FatAssessment: nutrition.FatAssessment ?? nutrition.fatAssessment ?? "",
        DietaryRecommendations: nutrition.DietaryRecommendations ?? nutrition.dietaryRecommendations ?? sourceSuggestions ?? []
      };
      const sport = parsedRaw.SportAnalysis ?? parsedRaw.sportAnalysis ?? parsedRaw.Sport ?? parsedRaw.sport ?? {};
      const sportResult = {
        ExerciseFrequencyScore: sport.ExerciseFrequencyScore ?? sport.exerciseFrequencyScore ?? 0,
        ExerciseVolumeAssessment: sport.ExerciseVolumeAssessment ?? sport.exerciseVolumeAssessment ?? sport.Evaluation ?? sport.evaluation ?? "",
        CaloriesBurnedAssessment: sport.CaloriesBurnedAssessment ?? sport.caloriesBurnedAssessment ?? "",
        ExerciseVarietyAssessment: sport.ExerciseVarietyAssessment ?? sport.exerciseVarietyAssessment ?? "",
        ExerciseRecommendations: sport.ExerciseRecommendations ?? sport.exerciseRecommendations ?? []
      };
      const rawIndicators = parsedRaw.IndicatorAnalyses ?? parsedRaw.indicatorAnalyses ?? [];
      const indicatorAnalyses = rawIndicators.map((item) => ({
        IndicatorName: item.IndicatorName ?? item.indicatorName ?? "",
        CurrentValue: item.CurrentValue ?? item.currentValue ?? "",
        NormalRange: item.NormalRange ?? item.normalRange ?? "",
        Trend: item.Trend ?? item.trend ?? item.Status ?? item.status ?? "",
        Advice: item.Advice ?? item.advice ?? ""
      }));
      return {
        OverallHealthScore: score,
        HealthLevel: level,
        Summary: summary,
        HealthRisks: risks,
        NutritionAnalysis: nutritionResult,
        SportAnalysis: sportResult,
        IndicatorAnalyses: indicatorAnalyses,
        Recommendations: recommendations
      };
    };
    const goBack = () => {
      common_vendor.index.navigateBack();
    };
    const scrollToSection = (id) => {
      activeTab.value = id;
      common_vendor.index.pageScrollTo({
        selector: `#${id}`,
        duration: 300
      });
    };
    const riskLevelClass = (level) => {
      if (!level)
        return "";
      return level.trim();
    };
    const formatAnalysisTime = (t) => {
      if (!t)
        return "暂无时间";
      try {
        const date = new Date(t);
        if (isNaN(date.getTime()))
          return "时间格式错误";
        return date.toLocaleString("zh-CN");
      } catch {
        return "时间格式错误";
      }
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
          title: "AI智能分析"
        }),
        c: analysisResult.value
      }, analysisResult.value ? {
        d: common_vendor.f(tabList, (tab, k0, i0) => {
          return {
            a: common_vendor.t(tab.emoji),
            b: common_vendor.t(tab.name),
            c: tab.id,
            d: activeTab.value === tab.id ? 1 : "",
            e: common_vendor.o(($event) => scrollToSection(tab.id), tab.id)
          };
        })
      } : {}, {
        e: loading.value
      }, loading.value ? {
        f: common_vendor.p({
          status: "loading"
        })
      } : analysisResult.value ? common_vendor.e({
        h: common_vendor.t(analysisResult.value.OverallHealthScore),
        i: common_vendor.t(analysisResult.value.HealthLevel),
        j: common_vendor.t(analysisResult.value.Summary),
        k: common_vendor.p({
          id: "overview",
          ["is-shadow"]: true
        }),
        l: common_vendor.f(analysisResult.value.HealthRisks, (risk, index, i0) => {
          return {
            a: common_vendor.t(risk.RiskType),
            b: common_vendor.t(risk.RiskLevel),
            c: common_vendor.n(riskLevelClass(risk.RiskLevel)),
            d: common_vendor.t(risk.Description),
            e: common_vendor.t(risk.Suggestions),
            f: index
          };
        }),
        m: common_vendor.p({
          id: "risks",
          ["is-shadow"]: true
        }),
        n: common_vendor.t(analysisResult.value.NutritionAnalysis.NutritionBalanceScore),
        o: common_vendor.t(analysisResult.value.NutritionAnalysis.CalorieIntakeAssessment),
        p: common_vendor.t(analysisResult.value.NutritionAnalysis.ProteinAssessment),
        q: common_vendor.t(analysisResult.value.NutritionAnalysis.CarbohydrateAssessment),
        r: common_vendor.t(analysisResult.value.NutritionAnalysis.FatAssessment),
        s: common_vendor.f(analysisResult.value.NutritionAnalysis.DietaryRecommendations, (item, i, i0) => {
          return {
            a: common_vendor.t(i + 1),
            b: common_vendor.t(item),
            c: i
          };
        }),
        t: common_vendor.p({
          id: "nutrition",
          ["is-shadow"]: true
        }),
        v: common_vendor.t(analysisResult.value.SportAnalysis.ExerciseFrequencyScore),
        w: common_vendor.t(analysisResult.value.SportAnalysis.ExerciseVolumeAssessment),
        x: common_vendor.t(analysisResult.value.SportAnalysis.CaloriesBurnedAssessment),
        y: common_vendor.t(analysisResult.value.SportAnalysis.ExerciseVarietyAssessment),
        z: common_vendor.f(analysisResult.value.SportAnalysis.ExerciseRecommendations, (item, i, i0) => {
          return {
            a: common_vendor.t(i + 1),
            b: common_vendor.t(item),
            c: i
          };
        }),
        A: common_vendor.p({
          id: "sport",
          ["is-shadow"]: true
        }),
        B: analysisResult.value.IndicatorAnalyses.length === 0
      }, analysisResult.value.IndicatorAnalyses.length === 0 ? {} : {}, {
        C: common_vendor.f(analysisResult.value.IndicatorAnalyses, (ind, i, i0) => {
          return {
            a: common_vendor.t(ind.IndicatorName),
            b: common_vendor.t(ind.CurrentValue),
            c: common_vendor.t(ind.NormalRange),
            d: common_vendor.t(ind.Trend),
            e: common_vendor.t(ind.Advice),
            f: i
          };
        }),
        D: common_vendor.p({
          id: "indicators",
          ["is-shadow"]: true
        }),
        E: analysisResult.value.Recommendations.length === 0
      }, analysisResult.value.Recommendations.length === 0 ? {} : {}, {
        F: common_vendor.f(analysisResult.value.Recommendations, (rec, i, i0) => {
          return {
            a: common_vendor.t(rec.Title),
            b: common_vendor.t(rec.Content),
            c: common_vendor.t(rec.ExpectedEffect),
            d: i
          };
        }),
        G: common_vendor.p({
          id: "recommendations",
          ["is-shadow"]: true
        }),
        H: common_vendor.t(formatAnalysisTime(Data.value.AnalysisTime))
      }) : error.value ? {
        J: common_vendor.t(errorMsg.value),
        K: common_vendor.o(getAiAnalyseApi)
      } : {}, {
        g: analysisResult.value,
        I: error.value
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-3b5a3068"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/Front/AiAnalyse.js.map
