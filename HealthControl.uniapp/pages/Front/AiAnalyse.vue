<template>
    <!-- 顶部导航栏 -->
    <uni-nav-bar
        dark
        :fixed="true"
        shadow
        background-color="var(--primary-color)"
        status-bar
        left-icon="left"
        left-text="返回"
        @clickLeft="goBack"
        title="AI智能分析"
    />

    <view class="main-container">

        <!-- 顶部Tab -->
        <view v-if="analysisResult" class="fixed-tabs">
            <scroll-view scroll-x class="tab-scroll" show-scrollbar="false">
                <view class="tab-list">
                    <view
                        v-for="tab in tabList"
                        :key="tab.id"
                        class="tab-item"
                        :class="{ active: activeTab === tab.id }"
                        @click="scrollToSection(tab.id)"
                    >
                        <text class="tab-emoji">{{ tab.emoji }}</text>
                        <text class="tab-text">{{ tab.name }}</text>
                    </view>
                </view>
            </scroll-view>
        </view>

        <!-- loading -->
        <view v-if="loading" class="loading-container">
            <view class="loading-box">
                <view class="loading-title">AI智能分析中...</view>
                <uni-load-more status="loading"></uni-load-more>
            </view>
        </view>

        <!-- 结果 -->
        <view v-else-if="analysisResult" class="result-container">
            <!-- 总评 -->
            <uni-card id="overview" :is-shadow="true">
                <view class="card-title">🎯 健康总评</view>
                <view class="overview-box">
                    <view class="score-circle">
                        <view class="score-number">{{ analysisResult.OverallHealthScore }}</view>
                        <view class="score-total">/100</view>
                    </view>
                    <view class="health-level">{{ analysisResult.HealthLevel }}</view>
                </view>
                <view class="summary">{{ analysisResult.Summary }}</view>
            </uni-card>

            <!-- 风险 -->
            <uni-card id="risks" :is-shadow="true" style="margin-top:20rpx">
                <view class="card-title">⚠️ 健康风险</view>
                <view
                    v-for="(risk, index) in analysisResult.HealthRisks"
                    :key="index"
                    class="risk-item"
                >
                    <view class="risk-header">
                        <view class="risk-name">{{ risk.RiskType }}</view>
                        <view class="risk-level" :class="riskLevelClass(risk.RiskLevel)">
                            {{ risk.RiskLevel }}
                        </view>
                    </view>
                    <view class="risk-desc">{{ risk.Description }}</view>
                    <view class="risk-suggestion">💡 {{ risk.Suggestions }}</view>
                </view>
            </uni-card>

            <!-- 营养 -->
            <uni-card id="nutrition" :is-shadow="true" style="margin-top:20rpx">
                <view class="card-title">🥗 营养分析</view>
                <view class="info-card">
                    <view class="info-row">
                        <text>营养评分</text>
                        <text class="green">{{ analysisResult.NutritionAnalysis.NutritionBalanceScore }}</text>
                    </view>
                    <view class="info-row">
                        <text>热量摄入</text>
                        <text>{{ analysisResult.NutritionAnalysis.CalorieIntakeAssessment }}</text>
                    </view>
                    <view class="info-row">
                        <text>蛋白质</text>
                        <text>{{ analysisResult.NutritionAnalysis.ProteinAssessment }}</text>
                    </view>
                    <view class="info-row">
                        <text>碳水</text>
                        <text>{{ analysisResult.NutritionAnalysis.CarbohydrateAssessment }}</text>
                    </view>
                    <view class="info-row">
                        <text>脂肪</text>
                        <text>{{ analysisResult.NutritionAnalysis.FatAssessment }}</text>
                    </view>
                </view>

                <view class="section-subtitle">饮食建议</view>
                <view
                    v-for="(item, i) in analysisResult.NutritionAnalysis.DietaryRecommendations"
                    :key="i"
                    class="recommend-item"
                >
                    {{ i + 1 }}. {{ item }}
                </view>
            </uni-card>

            <!-- 指标 -->
            <uni-card id="sport" :is-shadow="true" style="margin-top:20rpx">
                <view class="card-title">🏃 运动分析</view>
                <view class="info-card">
                    <view class="info-row">
                        <text>运动评分</text>
                        <text class="green">{{ analysisResult.SportAnalysis.ExerciseFrequencyScore }}</text>
                    </view>
                    <view class="info-row">
                        <text>运动量</text>
                        <text>{{ analysisResult.SportAnalysis.ExerciseVolumeAssessment }}</text>
                    </view>
                    <view class="info-row">
                        <text>热量消耗</text>
                        <text>{{ analysisResult.SportAnalysis.CaloriesBurnedAssessment }}</text>
                    </view>
                    <view class="info-row">
                        <text>运动多样性</text>
                        <text>{{ analysisResult.SportAnalysis.ExerciseVarietyAssessment }}</text>
                    </view>
                </view>

                <view class="section-subtitle">运动建议</view>
                <view
                    v-for="(item, i) in analysisResult.SportAnalysis.ExerciseRecommendations"
                    :key="i"
                    class="recommend-item"
                >
                    {{ i + 1 }}. {{ item }}
                </view>
            </uni-card>

            <!-- 指标 -->
            <uni-card id="indicators" :is-shadow="true" style="margin-top:20rpx">
                <view class="card-title">📊 健康指标</view>
                
                <view v-if="analysisResult.IndicatorAnalyses.length === 0" class="empty-tip">
                    暂无健康指标数据
                </view>
                
                <view
                    v-for="(ind, i) in analysisResult.IndicatorAnalyses"
                    :key="i"
                    class="indicator-item"
                >
                    <view class="indicator-title">{{ ind.IndicatorName }}</view>
                    <view class="indicator-row">当前值：{{ ind.CurrentValue }}</view>
                    <view class="indicator-row">正常范围：{{ ind.NormalRange }}</view>
                    <view class="indicator-row">趋势：{{ ind.Trend }}</view>
                    <view class="indicator-row">建议：{{ ind.Advice }}</view>
                </view>
            </uni-card>

            <!-- 建议 -->
            <uni-card id="recommendations" :is-shadow="true" style="margin-top:20rpx">
                <view class="card-title">💡 综合建议</view>
                
                <view v-if="analysisResult.Recommendations.length === 0" class="empty-tip">
                    暂无综合建议
                </view>
                
                <view
                    v-for="(rec, i) in analysisResult.Recommendations"
                    :key="i"
                    class="advice-item"
                >
                    <view class="advice-title">{{ rec.Title }}</view>
                    <view class="advice-content">{{ rec.Content }}</view>
                    <view class="advice-effect">预期效果：{{ rec.ExpectedEffect }}</view>
                </view>
            </uni-card>

            <!-- 时间 -->
            <view class="time">分析时间：{{ formatAnalysisTime(Data.AnalysisTime) }}</view>
        </view>

        <!-- error -->
        <view v-else-if="error" class="error-box">
            <view class="error-text">AI分析失败</view>
            <view class="error-message">{{ errorMsg }}</view>
            <button class="retry-btn" @click="getAiAnalyseApi">重新分析</button>
        </view>
    </view>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { Post } from '@/utils/http'
import { useCommonStore } from '@/store'

const store = useCommonStore()

const loading = ref(false)
const error = ref(false)
const errorMsg = ref('')
const analysisResult = ref(null)
const Data = ref({})
const activeTab = ref('overview')

const analysisData = reactive({
    UserId: '',
    Days: 7
})

const tabList = [
    { id: 'overview', name: '总评', emoji: '🎯' },
    { id: 'risks', name: '风险', emoji: '⚠️' },
    { id: 'nutrition', name: '营养', emoji: '🥗' },
    { id: 'sport', name: '运动', emoji: '🏃' },
    { id: 'indicators', name: '指标', emoji: '📊' },
    { id: 'recommendations', name: '建议', emoji: '💡' }
]

onLoad(() => {
    analysisData.UserId = store.UserId
    getAiAnalyseApi()
})

// 获取AI分析
const getAiAnalyseApi = async () => {
    try {
        loading.value = true
        error.value = false
        errorMsg.value = ''
        analysisResult.value = null

        const res = await Post('/AiAnalyse/AnalyzeUserHealth', {
            UserId: store.UserId,
            Days: 7
        })

        console.log('AI接口返回：', res)

        if (res?.Success === false || res?.success === false) {
            throw new Error(res?.Message || res?.message || 'AI分析失败')
        }

        const responseData = res?.Data || res?.data || {}
        if (responseData?.Success === false || responseData?.success === false) {
            throw new Error(responseData?.ErrorMessage || responseData?.errorMessage || 'AI分析失败')
        }

        const result = responseData?.AnalysisResult || responseData?.analysisResult || {}
        if (!result || Object.keys(result).length === 0) {
            throw new Error('AI接口没有返回分析结果')
        }

        Data.value = responseData
        analysisResult.value = normalizeAnalysisResult(result)
    } catch (e) {
        console.error('AI分析失败：', e)
        error.value = true
        errorMsg.value = e?.message || e?.Msg || '请检查后端服务、AI配置或网络连接'
    } finally {
        loading.value = false
    }
}

// 尝试解析JSON
const tryParseAiContent = (raw) => {
    if (typeof raw !== 'string') return raw
    const cleaned = raw.trim()
    if (!cleaned) return null
    try {
        return JSON.parse(cleaned)
    } catch (e) {
        console.warn('AI结果非JSON字符串，保留原值：', e)
        return raw
    }
}

// 标准化数据结构
const normalizeAnalysisResult = (raw) => {
    const parsedRaw = tryParseAiContent(raw)
    if (!parsedRaw || typeof parsedRaw !== 'object') {
        return {
            OverallHealthScore: 0,
            HealthLevel: '暂无',
            Summary: '暂无分析结果',
            HealthRisks: [],
            NutritionAnalysis: {
                NutritionBalanceScore: 0,
                CalorieIntakeAssessment: '',
                ProteinAssessment: '',
                CarbohydrateAssessment: '',
                FatAssessment: '',
                DietaryRecommendations: []
            },
            SportAnalysis: {
                ExerciseFrequencyScore: 0,
                ExerciseVolumeAssessment: '',
                CaloriesBurnedAssessment: '',
                ExerciseVarietyAssessment: '',
                ExerciseRecommendations: []
            },
            IndicatorAnalyses: [],
            Recommendations: []
        }
    }

    const score = parsedRaw.OverallHealthScore ?? parsedRaw.overallHealthScore ?? parsedRaw.Score ?? parsedRaw.score ?? 0
    const level = parsedRaw.HealthLevel ?? parsedRaw.healthLevel ?? parsedRaw.Evaluation ?? parsedRaw.evaluation ?? '暂无'
    const summary = parsedRaw.Summary ?? parsedRaw.summary ?? '暂无分析结果'

    // 风险
    const rawRisks = parsedRaw.HealthRisks ?? parsedRaw.healthRisks ?? parsedRaw.Risks ?? parsedRaw.risks ??
        ((parsedRaw.Problems ?? parsedRaw.problems)?.map(item => ({
            RiskType: '健康风险',
            RiskLevel: '中',
            Description: item,
            Suggestions: '建议调整生活习惯'
        })) || [])
    const risks = rawRisks.map(item => ({
        RiskType: item.RiskType ?? item.riskType ?? item.Type ?? item.type ?? '健康风险',
        RiskLevel: item.RiskLevel ?? item.riskLevel ?? item.Level ?? item.level ?? '中',
        Description: item.Description ?? item.description ?? '',
        Suggestions: item.Suggestions ?? item.suggestions ?? item.Advice ?? item.advice ?? ''
    }))

    // 综合建议
    const sourceSuggestions = parsedRaw.Suggestions ?? parsedRaw.suggestions
    const rawRecommendations = parsedRaw.Recommendations ?? parsedRaw.recommendations ?? sourceSuggestions?.map(item => ({
        Title: '健康建议',
        Content: item,
        ExpectedEffect: '改善健康状态'
    })) ?? []
    const recommendations = rawRecommendations.map(item => ({
        Title: item.Title ?? item.title ?? '健康建议',
        Content: item.Content ?? item.content ?? '',
        ExpectedEffect: item.ExpectedEffect ?? item.expectedEffect ?? ''
    }))

    // 营养分析
    const nutrition = parsedRaw.NutritionAnalysis ?? parsedRaw.nutritionAnalysis ?? parsedRaw.Nutrition ?? parsedRaw.nutrition ?? {}
    const nutritionResult = {
        NutritionBalanceScore: nutrition.NutritionBalanceScore ?? nutrition.nutritionBalanceScore ?? score ?? 0,
        CalorieIntakeAssessment: nutrition.CalorieIntakeAssessment ?? nutrition.calorieIntakeAssessment ?? nutrition.Evaluation ?? nutrition.evaluation ?? '',
        ProteinAssessment: nutrition.ProteinAssessment ?? nutrition.proteinAssessment ?? '',
        CarbohydrateAssessment: nutrition.CarbohydrateAssessment ?? nutrition.carbohydrateAssessment ?? '',
        FatAssessment: nutrition.FatAssessment ?? nutrition.fatAssessment ?? '',
        DietaryRecommendations: nutrition.DietaryRecommendations ?? nutrition.dietaryRecommendations ?? sourceSuggestions ?? []
    }

    const sport = parsedRaw.SportAnalysis ?? parsedRaw.sportAnalysis ?? parsedRaw.Sport ?? parsedRaw.sport ?? {}
    const sportResult = {
        ExerciseFrequencyScore: sport.ExerciseFrequencyScore ?? sport.exerciseFrequencyScore ?? 0,
        ExerciseVolumeAssessment: sport.ExerciseVolumeAssessment ?? sport.exerciseVolumeAssessment ?? sport.Evaluation ?? sport.evaluation ?? '',
        CaloriesBurnedAssessment: sport.CaloriesBurnedAssessment ?? sport.caloriesBurnedAssessment ?? '',
        ExerciseVarietyAssessment: sport.ExerciseVarietyAssessment ?? sport.exerciseVarietyAssessment ?? '',
        ExerciseRecommendations: sport.ExerciseRecommendations ?? sport.exerciseRecommendations ?? []
    }

    const rawIndicators = parsedRaw.IndicatorAnalyses ?? parsedRaw.indicatorAnalyses ?? []
    const indicatorAnalyses = rawIndicators.map(item => ({
        IndicatorName: item.IndicatorName ?? item.indicatorName ?? '',
        CurrentValue: item.CurrentValue ?? item.currentValue ?? '',
        NormalRange: item.NormalRange ?? item.normalRange ?? '',
        Trend: item.Trend ?? item.trend ?? item.Status ?? item.status ?? '',
        Advice: item.Advice ?? item.advice ?? ''
    }))

    return {
        OverallHealthScore: score,
        HealthLevel: level,
        Summary: summary,
        HealthRisks: risks,
        NutritionAnalysis: nutritionResult,
        SportAnalysis: sportResult,
        IndicatorAnalyses: indicatorAnalyses,
        Recommendations: recommendations
    }
}

// 返回
const goBack = () => {
    uni.navigateBack()
}

// 滚动到对应区域
const scrollToSection = (id) => {
    activeTab.value = id
    uni.pageScrollTo({
        selector: `#${id}`,
        duration: 300
    })
}

// 风险等级样式
const riskLevelClass = (level) => {
    if (!level) return ''
    return level.trim()
}

// 格式化时间
const formatAnalysisTime = (t) => {
    if (!t) return '暂无时间'
    try {
        const date = new Date(t)
        if (isNaN(date.getTime())) return '时间格式错误'
        return date.toLocaleString('zh-CN')
    } catch {
        return '时间格式错误'
    }
}
</script>

<style scoped>
.main-container {
    min-height: 100vh;
    background: #f5f7fb;
    padding-bottom: 40rpx;
}

.fixed-tabs {
    position: sticky;
    top: var(--status-bar-height);
    z-index: 10;
    background: #ffffff;
    border-bottom: 1px solid #eee;
}

.tab-scroll {
    white-space: nowrap;
}

.tab-list {
    display: flex;
    padding: 20rpx;
}

.tab-item {
    display: flex;
    align-items: center;
    padding: 14rpx 28rpx;
    margin-right: 20rpx;
    border-radius: 999rpx;
    background: #f2f2f2;
    font-size: 28rpx;
    transition: all 0.2s;
}

.tab-item.active {
    background: #00c48c;
    color: #fff;
}

.tab-emoji {
    margin-right: 8rpx;
}

.loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 60vh;
}

.loading-box {
    text-align: center;
}

.loading-title {
    font-size: 34rpx;
    margin-bottom: 30rpx;
    font-weight: bold;
}

.result-container {
    padding: 20rpx;
}

.card-title {
    font-size: 34rpx;
    font-weight: bold;
    margin-bottom: 24rpx;
}

.overview-box {
    display: flex;
    align-items: center;
}

.score-circle {
    width: 180rpx;
    height: 180rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, #00c48c, #00a6ff);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: #fff;
}

.score-number {
    font-size: 56rpx;
    font-weight: bold;
}

.score-total {
    font-size: 24rpx;
}

.health-level {
    margin-left: 40rpx;
    font-size: 40rpx;
    font-weight: bold;
    color: #00c48c;
}

.summary {
    margin-top: 30rpx;
    line-height: 1.8;
    color: #666;
}

.risk-item,
.indicator-item,
.advice-item {
    background: #fafafa;
    padding: 24rpx;
    border-radius: 20rpx;
    margin-bottom: 20rpx;
}

.risk-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16rpx;
}

.risk-name,
.indicator-title,
.advice-title {
    font-size: 32rpx;
    font-weight: bold;
}

.risk-level {
    padding: 4rpx 18rpx;
    border-radius: 999rpx;
    font-size: 24rpx;
    color: #fff;
}

.high {
    background: #ff4d4f;
}

.mideum {
    background: #faad14;
}

.low {
    background: #52c41a;
}

.risk-desc,
.risk-suggestion,
.indicator-row,
.advice-content,
.advice-effect {
    margin-top: 10rpx;
    color: #666;
    line-height: 1.7;
}

.info-card {
    background: #fafafa;
    border-radius: 20rpx;
    padding: 24rpx;
}

.info-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20rpx;
}

.section-subtitle {
    margin-top: 30rpx;
    margin-bottom: 20rpx;
    font-size: 30rpx;
    font-weight: bold;
}

.recommend-item {
    margin-bottom: 14rpx;
    line-height: 1.8;
    color: #555;
}

.green {
    color: #00c48c;
    font-weight: bold;
}

.time {
    text-align: center;
    color: #999;
    margin-top: 30rpx;
    font-size: 24rpx;
}

.error-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 60vh;
}

.error-text {
    font-size: 34rpx;
    margin-bottom: 30rpx;
}

.error-message {
    max-width: 620rpx;
    margin-bottom: 24rpx;
    color: #666;
    font-size: 26rpx;
    line-height: 1.6;
    text-align: center;
}

.retry-btn {
    background: #00c48c;
    color: #fff;
    border-radius: 10rpx;
    padding: 16rpx 40rpx;
}

.empty-tip {
    text-align: center;
    color: #999;
    padding: 40rpx 0;
    font-size: 28rpx;
}
</style>
