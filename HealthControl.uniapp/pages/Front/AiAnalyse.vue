<template>
    <!-- 顶部导航栏 -->
    <uni-nav-bar dark :fixed="true" shadow background-color="var(--primary-color)" status-bar
        left-icon="left" left-text="返回" @clickLeft="goBack" title="AI智能分析" />

    <view class="main-container">

        <!-- Tab -->
        <view v-if="analysisResult" class="fixed-tabs">
            <scroll-view scroll-x class="tab-scroll">
                <view class="tab-list">
                    <view v-for="tab in tabList" :key="tab.id"
                        class="tab-item"
                        :class="{ active: activeTab === tab.id }"
                        @click="scrollToSection(tab.id)">
                        <text class="tab-emoji">{{ tab.emoji }}</text>
                        <text class="tab-text">{{ tab.name }}</text>
                    </view>
                </view>
            </scroll-view>
        </view>

        <!-- loading -->
        <view v-if="loading" class="loading-container">
            <view class="loading-text">AI分析中...</view>
        </view>

        <!-- result -->
        <view v-else-if="analysisResult" class="result-container">

            <!-- 总评 -->
            <uni-card id="overview">
                <view class="card-title">🎯 健康总评</view>

                <view class="score">
                    {{ analysisResult?.OverallHealthScore ?? 0 }}/100
                </view>

                <view class="level">
                    {{ analysisResult?.HealthLevel ?? '未知' }}
                </view>

                <view class="summary">
                    {{ analysisResult?.Summary ?? '暂无分析结果' }}
                </view>
            </uni-card>

            <!-- 风险 -->
            <uni-card id="risks">
                <view class="card-title">⚠️ 风险</view>

                <view v-for="(risk, index) in analysisResult?.HealthRisks || []"
                      :key="index" class="item">

                    <text>{{ risk?.RiskType || '未知风险' }}</text>
                    <text>{{ risk?.RiskLevel || '-' }}</text>

                    <view>{{ risk?.Description || '无描述' }}</view>
                    <view>{{ risk?.Suggestions || '无建议' }}</view>
                </view>
            </uni-card>

            <!-- 营养 -->
            <uni-card id="nutrition">
                <view class="card-title">🥗 营养分析</view>

                <view>评分：{{ analysisResult?.NutritionAnalysis?.NutritionBalanceScore ?? 0 }}</view>

                <view>热量：{{ analysisResult?.NutritionAnalysis?.CalorieIntakeAssessment ?? '暂无' }}</view>
                <view>蛋白质：{{ analysisResult?.NutritionAnalysis?.ProteinAssessment ?? '暂无' }}</view>
                <view>碳水：{{ analysisResult?.NutritionAnalysis?.CarbohydrateAssessment ?? '暂无' }}</view>
                <view>脂肪：{{ analysisResult?.NutritionAnalysis?.FatAssessment ?? '暂无' }}</view>

                <view v-for="(item, i) in analysisResult?.NutritionAnalysis?.DietaryRecommendations || []"
                      :key="i">
                    {{ i + 1 }}. {{ item }}
                </view>
            </uni-card>

            <!-- 运动 -->
            <uni-card id="sport">
                <view class="card-title">🏃 运动分析</view>

                <view>评分：{{ analysisResult?.SportAnalysis?.ExerciseFrequencyScore ?? 0 }}</view>

                <view>
                    运动量：{{ analysisResult?.SportAnalysis?.ExerciseVolumeAssessment ?? '暂无' }}
                </view>

                <view>
                    消耗：{{ analysisResult?.SportAnalysis?.CaloriesBurnedAssessment ?? '暂无' }}
                </view>

                <view>
                    多样性：{{ analysisResult?.SportAnalysis?.ExerciseVarietyAssessment ?? '暂无' }}
                </view>

                <view v-for="(item, i) in analysisResult?.SportAnalysis?.ExerciseRecommendations || []"
                      :key="i">
                    {{ i + 1 }}. {{ item }}
                </view>
            </uni-card>

            <!-- 指标 -->
            <uni-card id="indicators">
                <view class="card-title">📊 指标</view>

                <view v-for="(ind, i) in analysisResult?.IndicatorAnalyses || []"
                      :key="i">

                    <view>{{ ind?.IndicatorName || '未知指标' }}</view>
                    <view>值：{{ ind?.CurrentValue ?? '-' }}</view>
                    <view>范围：{{ ind?.NormalRange ?? '-' }}</view>
                    <view>趋势：{{ ind?.Trend ?? '-' }}</view>
                    <view>建议：{{ ind?.Advice ?? '暂无' }}</view>
                </view>
            </uni-card>

            <!-- 建议 -->
            <uni-card id="recommendations">
                <view class="card-title">💡 建议</view>

                <view v-for="(rec, i) in analysisResult?.Recommendations || []"
                      :key="i">

                    <view>{{ rec?.Title || '建议' }}</view>
                    <view>{{ rec?.Content || '' }}</view>
                    <view>{{ rec?.ExpectedEffect || '' }}</view>
                </view>
            </uni-card>

            <!-- 时间 -->
            <view class="time">
                {{ formatAnalysisTime(Data?.AnalysisTime) }}
            </view>

        </view>

        <!-- error -->
        <view v-else-if="error">
            <view>加载失败</view>
            <button @click="getAiAnalyseApi">重试</button>
        </view>

    </view>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { Post } from '@/utils/http'
import { useCommonStore } from '@/store'

const store = useCommonStore()

const loading = ref(false)
const error = ref(false)
const analysisResult = ref(null)
const Data = ref(null)
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

const getAiAnalyseApi = async () => {
    try {
        loading.value = true
        error.value = false

        const res = await Post('/AiAnalyse/AnalyzeUserHealth', {
            UserId: store.UserId,
            Days: 7
        })

        Data.value = res?.Data || {}
        analysisResult.value = res?.Data?.AnalysisResult || null

    } catch (e) {
        error.value = true
    } finally {
        loading.value = false
    }
}

const goBack = () => uni.navigateBack()

const formatAnalysisTime = (t) => {
    if (!t) return '暂无时间'
    return new Date(t).toLocaleString()
}

const scrollToSection = (id) => {
    activeTab.value = id
}
</script>
