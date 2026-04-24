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

        <!-- Tab -->
        <view v-if="result" class="fixed-tabs">
            <scroll-view class="tab-scroll" scroll-x>
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
            <view class="loading-animation">
                <view class="loading-circle">
                    <view class="loading-inner"></view>
                </view>
                <view class="loading-text">AI正在分析健康数据...</view>
                <view class="loading-tips">
                    <text>分析最近 {{ params.Days }} 天数据</text>
                </view>
            </view>
        </view>

        <!-- result -->
        <view v-else-if="result" class="result-container">

            <!-- 总评 -->
            <uni-card id="overview" class="section">
                <view class="card-title">🎯 健康总评</view>

                <view class="health-score-section">
                    <view class="score-circle">
                        <view class="score-number">{{ result.OverallHealthScore ?? 0 }}</view>
                        <view class="score-total">/100</view>
                    </view>

                    <view class="health-level">
                        <text :class="getHealthLevelClass(result.HealthLevel)">
                            {{ result.HealthLevel || '-' }}
                        </text>
                        <text class="level-desc">健康等级</text>
                    </view>
                </view>

                <view class="summary-text">
                    {{ result.Summary || '暂无分析结果' }}
                </view>
            </uni-card>

            <!-- 风险 -->
            <uni-card id="risks" class="section">
                <view class="card-title">⚠️ 风险评估</view>

                <view v-for="(risk, i) in (result.HealthRisks || [])" :key="i" class="risk-item">
                    <view class="risk-header">
                        <text>{{ risk.RiskType }}</text>
                        <uni-tag :text="risk.RiskLevel" :type="getRiskLevelType(risk.RiskLevel)" />
                    </view>

                    <view class="risk-description">
                        {{ risk.Description }}
                    </view>

                    <view class="risk-suggestions">
                        {{ risk.Suggestions }}
                    </view>
                </view>
            </uni-card>

            <!-- 营养 -->
            <uni-card id="nutrition" class="section">
                <view class="card-title">🥗 营养分析</view>

                <view class="score-bar">
                    <view
                        class="score-progress"
                        :style="{ width: (result.NutritionAnalysis?.NutritionBalanceScore || 0) + '%' }"
                    />
                </view>

                <view class="assessment-item">
                    {{ result.NutritionAnalysis?.CalorieIntakeAssessment }}
                </view>
            </uni-card>

            <!-- 运动 -->
            <uni-card id="sport" class="section">
                <view class="card-title">🏃‍♂️ 运动分析</view>

                <view class="score-bar">
                    <view
                        class="score-progress"
                        :style="{ width: (result.SportAnalysis?.ExerciseFrequencyScore || 0) + '%' }"
                    />
                </view>

                <view class="assessment-item">
                    {{ result.SportAnalysis?.ExerciseVolumeAssessment }}
                </view>
            </uni-card>

            <!-- 指标 -->
            <uni-card id="indicators" class="section">
                <view class="card-title">📊 指标分析</view>

                <view v-for="(item, i) in (result.IndicatorAnalyses || [])" :key="i" class="indicator-item">
                    <view class="indicator-header">
                        {{ item.IndicatorName }}
                        <uni-tag :text="item.Status" />
                    </view>

                    <view>{{ item.CurrentValue }} / {{ item.NormalRange }}</view>
                    <view>{{ item.Advice }}</view>
                </view>
            </uni-card>

            <!-- 建议 -->
            <uni-card id="recommendations" class="section">
                <view class="card-title">💡 健康建议</view>

                <view v-for="(item, i) in (result.Recommendations || [])" :key="i" class="recommendation-card">
                    <view>{{ item.Title }}</view>
                    <view>{{ item.Content }}</view>
                </view>
            </uni-card>

            <!-- 时间 -->
            <view class="analysis-time">
                {{ formatTime(data?.AnalysisTime) }}
            </view>
        </view>

        <!-- error -->
        <view v-else-if="error" class="error-container">
            <text>分析失败</text>
            <button @click="loadData">重新加载</button>
        </view>

    </view>
</template>

<script setup>
import { ref, reactive, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { Post } from '@/utils/http'
import { useCommonStore } from '@/store'

const store = useCommonStore()

const loading = ref(false)
const error = ref(false)

const data = ref(null)
const result = ref(null)

const activeTab = ref('overview')

const params = reactive({
    UserId: store.UserId,
    Days: 7
})

const tabList = [
    { id: 'overview', name: '总评', emoji: '🎯' },
    { id: 'risks', name: '风险', emoji: '⚠️' },
    { id: 'nutrition', name: '营养', emoji: '🥗' },
    { id: 'sport', name: '运动', emoji: '🏃‍♂️' },
    { id: 'indicators', name: '指标', emoji: '📊' },
    { id: 'recommendations', name: '建议', emoji: '💡' }
]

const loadData = async () => {
    try {
        loading.value = true
        error.value = false

        const res = await Post('/AiAnalyse/AnalyzeUserHealth', params)

        data.value = res.Data
        result.value = res.Data?.AnalysisResult || null

        await nextTick()

    } catch (e) {
        error.value = true
    } finally {
        loading.value = false
    }
}

const goBack = () => uni.navigateBack()

const scrollToSection = (id) => {
    activeTab.value = id

    uni.pageScrollTo({
        selector: `#${id}`,
        duration: 300
    })
}

const getHealthLevelClass = (level) => {
    if (level === '优秀') return 'level-excellent'
    if (level === '良好') return 'level-good'
    if (level === '一般') return 'level-average'
    return 'level-poor'
}

const getRiskLevelType = (level) => {
    if (level === '高') return 'error'
    if (level === '中') return 'warning'
    return 'success'
}

const formatTime = (t) => {
    if (!t) return '-'
    return new Date(t).toLocaleString()
}

onMounted(() => {
    loadData()
})

onUnmounted(() => {
    // 清理（避免监听残留）
    uni.offWindowResize?.()
})
</script>

<style scoped>
.main-container {
    padding: 20rpx;
}

.fixed-tabs {
    position: fixed;
    top: 88rpx;
    left: 0;
    right: 0;
    background: #fff;
    z-index: 100;
}

.tab-list {
    display: flex;
}

.tab-item {
    padding: 10rpx 20rpx;
}

.tab-item.active {
    color: #1bb919;
}

.section {
    margin-top: 120rpx;
}

.score-bar {
    height: 10rpx;
    background: #eee;
}

.score-progress {
    height: 100%;
    background: #4caf50;
}

.risk-item,
.indicator-item,
.recommendation-card {
    margin-bottom: 20rpx;
    padding: 20rpx;
    background: #f8f8f8;
}

.analysis-time {
    text-align: center;
    color: #999;
    margin-top: 40rpx;
}
</style>
