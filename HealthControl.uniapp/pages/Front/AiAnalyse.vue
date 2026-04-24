<template>
    <!-- 顶部导航栏 -->
    <uni-nav-bar dark :fixed="true" shadow background-color="var(--primary-color)" status-bar left-icon="left"
        left-text="返回" @clickLeft="goBack" title="AI智能分析" />

    <!-- 主内容区域 -->
    <view class="main-container">
        <!-- 固定Tab导航 -->
        <view v-if="analysisResult" class="fixed-tabs">
            <scroll-view class="tab-scroll" scroll-x>
                <view class="tab-list">
                    <view v-for="(tab, index) in tabList" :key="index" class="tab-item"
                        :class="{ active: activeTab === tab.id }" @click="scrollToSection(tab.id)">
                        <text class="tab-emoji">{{ tab.emoji }}</text>
                        <text class="tab-text">{{ tab.name }}</text>
                    </view>
                </view>
            </scroll-view>
        </view>

        <!-- 加载状态 -->
        <view v-if="loading" class="loading-container">
            <view class="loading-animation">
                <view class="loading-circle">
                    <view class="loading-inner"></view>
                </view>
                <view class="loading-text">AI正在分析您的健康数据...</view>
                <view class="loading-tips">
                    <text>正在分析近{{ analysisData.Days }}天的数据</text>
                </view>
            </view>
        </view>

        <!-- 分析结果展示 -->
        <view v-else-if="analysisResult" class="result-container">
            <!-- 健康总评 -->
            <uni-card id="overview" class="health-overview section" :isShadow="false" margin="20upx 0">
                <view class="card-header">
                    <text class="card-title">🎯 健康总评</text>
                </view>
                <view class="health-score-section">
                    <view class="score-circle">
                        <view class="score-number">{{ analysisResult.OverallHealthScore }}</view>
                        <view class="score-total">/100</view>
                    </view>
                    <view class="health-level">
                        <text class="level-text" :class="getHealthLevelClass()">{{ analysisResult.HealthLevel }}</text>
                        <text class="level-desc">健康等级</text>
                    </view>
                </view>
                <view class="summary-text">{{ analysisResult.Summary }}</view>
            </uni-card>

            <!-- 健康风险评估 -->
            <uni-card id="risks" class="risk-section section" :isShadow="false" margin="20upx 0">
                <view class="card-header">
                    <text class="card-title">⚠️ 健康风险评估</text>
                </view>
                <view class="risk-list">
                    <view v-for="(risk, index) in analysisResult.HealthRisks" :key="index" class="risk-item">
                        <view class="risk-header">
                            <view class="risk-info">
                                <text class="risk-emoji">{{ getRiskEmoji(risk.RiskType) }}</text>
                                <text class="risk-type">{{ risk.RiskType }}</text>
                            </view>
                            <uni-tag :text="risk.RiskLevel" :type="getRiskLevelType(risk.RiskLevel)" size="mini" />
                        </view>
                        <view class="risk-description">{{ risk.Description }}</view>
                        <view class="risk-suggestions">
                            <text class="suggestions-label">💡 建议:</text>
                            <text class="suggestions-text">{{ risk.Suggestions }}</text>
                        </view>
                    </view>
                </view>
            </uni-card>

            <!-- 营养分析 -->
            <uni-card id="nutrition" class="nutrition-section section" :isShadow="false" margin="20upx 0">
                <view class="card-header">
                    <text class="card-title">🥗 营养分析</text>
                </view>
                <view class="nutrition-score">
                    <text class="score-label">📊 营养均衡评分</text>
                    <view class="score-bar">
                        <view class="score-progress"
                            :style="{ width: analysisResult.NutritionAnalysis.NutritionBalanceScore + '%' }"></view>
                    </view>
                    <text class="score-value">{{ analysisResult.NutritionAnalysis.NutritionBalanceScore }}/100</text>
                </view>

                <view class="nutrition-assessments">
                    <view class="assessment-item">
                        <text class="assessment-label">🔥 热量摄入评估</text>
                        <text class="assessment-value">{{ analysisResult.NutritionAnalysis.CalorieIntakeAssessment }}</text>
                    </view>
                    <view class="assessment-item">
                        <text class="assessment-label">🥩 蛋白质评估</text>
                        <text class="assessment-value">{{ analysisResult.NutritionAnalysis.ProteinAssessment }}</text>
                    </view>
                    <view class="assessment-item">
                        <text class="assessment-label">🍞 碳水化合物评估</text>
                        <text class="assessment-value">{{ analysisResult.NutritionAnalysis.CarbohydrateAssessment }}</text>
                    </view>
                    <view class="assessment-item">
                        <text class="assessment-label">🥑 脂肪评估</text>
                        <text class="assessment-value">{{ analysisResult.NutritionAnalysis.FatAssessment }}</text>
                    </view>
                </view>

                <view class="dietary-recommendations">
                    <text class="recommendations-title">🍽️ 饮食建议</text>
                    <view v-for="(recommendation, index) in analysisResult.NutritionAnalysis.DietaryRecommendations"
                        :key="index" class="recommendation-item">
                        <text class="recommendation-text">{{ index + 1 }}. {{ recommendation }}</text>
                    </view>
                </view>
            </uni-card>

            <!-- 运动分析 -->
            <uni-card id="sport" class="sport-section section" :isShadow="false" margin="20upx 0">
                <view class="card-header">
                    <text class="card-title">🏃‍♂️ 运动分析</text>
                </view>
                <view class="sport-score">
                    <text class="score-label">📈 运动频率评分</text>
                    <view class="score-bar">
                        <view class="score-progress"
                            :style="{ width: analysisResult.SportAnalysis.ExerciseFrequencyScore + '%' }"></view>
                    </view>
                    <text class="score-value">{{ analysisResult.SportAnalysis.ExerciseFrequencyScore }}/100</text>
                </view>

                <view class="sport-assessments">
                    <view class="assessment-item">
                        <text class="assessment-label">💪 运动量评估</text>
                        <text class="assessment-value">{{ analysisResult.SportAnalysis.ExerciseVolumeAssessment }}</text>
                    </view>
                    <view class="assessment-item">
                        <text class="assessment-label">🔥 热量消耗评估</text>
                        <text class="assessment-value">{{ analysisResult.SportAnalysis.CaloriesBurnedAssessment }}</text>
                    </view>
                    <view class="assessment-item">
                        <text class="assessment-label">🎯 运动多样性评估</text>
                        <text class="assessment-value">{{ analysisResult.SportAnalysis.ExerciseVarietyAssessment }}</text>
                    </view>
                </view>

                <view class="exercise-recommendations">
                    <text class="recommendations-title">🏋️‍♀️ 运动建议</text>
                    <view v-for="(recommendation, index) in analysisResult.SportAnalysis.ExerciseRecommendations"
                        :key="index" class="recommendation-item">
                        <text class="recommendation-text">{{ index + 1 }}. {{ recommendation }}</text>
                    </view>
                </view>
            </uni-card>

            <!-- 指标分析 -->
            <uni-card id="indicators" class="indicators-section section" :isShadow="false" margin="20upx 0">
                <view class="card-header">
                    <text class="card-title">📊 指标分析</text>
                </view>
                <view class="indicators-list">
                    <view v-for="(indicator, index) in analysisResult.IndicatorAnalyses" :key="index"
                        class="indicator-item">
                        <view class="indicator-header">
                            <view class="indicator-info">
                                <text class="indicator-emoji">{{ getIndicatorEmoji(indicator.IndicatorName) }}</text>
                                <text class="indicator-name">{{ indicator.IndicatorName }}</text>
                            </view>
                            <uni-tag :text="indicator.Status" :type="getIndicatorStatusType(indicator.Status)"
                                size="mini" />
                        </view>
                        <view class="indicator-details">
                            <view class="detail-row">
                                <text class="detail-label">📏 当前值:</text>
                                <text class="detail-value">{{ indicator.CurrentValue }}</text>
                            </view>
                            <view class="detail-row">
                                <text class="detail-label">📋 正常范围:</text>
                                <text class="detail-value">{{ indicator.NormalRange }}</text>
                            </view>
                            <view class="detail-row">
                                <text class="detail-label">📈 趋势:</text>
                                <text class="detail-value">{{ indicator.Trend }}</text>
                            </view>
                            <view class="indicator-advice">
                                <text class="advice-label">💡 建议:</text>
                                <text class="advice-text">{{ indicator.Advice }}</text>
                            </view>
                        </view>
                    </view>
                </view>
            </uni-card>

            <!-- 健康建议 -->
            <uni-card id="recommendations" class="recommendations-section section" :isShadow="false" margin="20upx 0">
                <view class="card-header">
                    <text class="card-title">💡 健康建议</text>
                </view>
                <view class="recommendations-list">
                    <view v-for="(recommendation, index) in analysisResult.Recommendations" :key="index"
                        class="recommendation-card">
                        <view class="recommendation-header">
                            <view class="recommendation-info">
                                <text class="recommendation-emoji">{{
                                    getRecommendationEmoji(recommendation.RecommendationType) }}</text>
                                <text class="recommendation-title">{{ recommendation.Title }}</text>
                            </view>
                            <uni-tag :text="recommendation.Priority" :type="getPriorityType(recommendation.Priority)"
                                size="mini" />
                        </view>
                        <view class="recommendation-type">
                            <text class="type-label">🏷️ 类型:</text>
                            <text class="type-value">{{ recommendation.RecommendationType }}</text>
                        </view>
                        <view class="recommendation-content">{{ recommendation.Content }}</view>
                        <view class="recommendation-effect">
                            <text class="effect-label">✨ 预期效果:</text>
                            <text class="effect-text">{{ recommendation.ExpectedEffect }}</text>
                        </view>
                    </view>
                </view>
            </uni-card>

            <!-- 分析时间 -->
            <view class="analysis-time">
                <text class="time-text">分析时间: {{ formatAnalysisTime(Data.AnalysisTime) }}</text>
            </view>
        </view>

        <!-- 错误状态 -->
        <view v-else-if="error" class="error-container">
            <view class="error-content">
                <uni-icons type="info" size="60" color="#ff6b6b"></uni-icons>
                <text class="error-text">分析失败，请稍后重试</text>
                <button class="retry-button" @click="getAiAnalyseApi" type="primary" size="mini">重新分析</button>
            </view>
        </view>
    </view>
</template>

<script setup>
import { useCommonStore } from '@/store';
import { Post } from "@/utils/http";
import { onLoad, onReady, onShow, onPageScroll } from "@dcloudio/uni-app";
import { computed, nextTick, reactive, ref } from 'vue';

// 获取store
const commonStore = useCommonStore();
const Token = computed(() => commonStore.Token)
const UserInfo = computed(() => commonStore.UserInfo)
const RoleType = computed(() => commonStore.RoleType)
const UserId = computed(() => commonStore.UserId)

// 响应式数据
const loading = ref(false);
const error = ref(false);
const Data = ref(null);
const analysisResult = ref(null);
const activeTab = ref('overview');
const scrollThrottleTimer = ref(null); // 添加滚动节流定时器
const sectionPositions = ref([]); // 缓存section位置信息
const recalcTimer = ref(null); // 重新计算位置的防抖定时器

// 分析请求参数
const analysisData = reactive({
    UserId: '',
    Days: 7
});

// Tab列表配置
const tabList = ref([
    { id: 'overview', name: '总评', emoji: '🎯' },
    { id: 'risks', name: '风险', emoji: '⚠️' },
    { id: 'nutrition', name: '营养', emoji: '🥗' },
    { id: 'sport', name: '运动', emoji: '🏃‍♂️' },
    { id: 'indicators', name: '指标', emoji: '📊' },
    { id: 'recommendations', name: '建议', emoji: '💡' }
]);

// 生命周期钩子
onLoad(async (option) => {
    analysisData.UserId = UserId.value;
    // 页面显示时的逻辑
    getAiAnalyseApi();
});

// 防抖重新计算section位置
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

// 监听页面尺寸变化
onShow(async () => {


    // 监听页面尺寸变化事件
    uni.onWindowResize(() => {
        debouncedRecalculate();
    });
});

// 监听页面滚动 - 添加节流优化
onPageScroll((e) => {
    if (!analysisResult.value) return;

    // 滚动节流优化，避免频繁计算
    if (scrollThrottleTimer.value) {
        clearTimeout(scrollThrottleTimer.value);
    }

    scrollThrottleTimer.value = setTimeout(() => {
        updateActiveTab(e.scrollTop);
    }, 50); // 50ms 节流
});

onReady(async () => {
    // 页面准备就绪后，如果有数据则计算位置
    if (analysisResult.value) {
        await nextTick();
        setTimeout(() => {
            calculateSectionPositions();
        }, 200);
    }
});

// API调用方法
const getAiAnalyseApi = async () => {
    try {
        loading.value = true;
        error.value = false;
        analysisResult.value = null;

        let response = await Post('/AiAnalyse/AnalyzeUserHealth', {
            UserId: UserId.value,
            Days: 7
        });

        Data.value = response.Data;
        analysisResult.value = response.Data.AnalysisResult;

        // 数据加载完成后计算section位置
        await nextTick();
        setTimeout(() => {
            calculateSectionPositions();
        }, 100); // 给DOM一点时间完成渲染

    } catch (err) {
        error.value = true;
        console.error('AI分析失败:', err);
        uni.showToast({
            title: '分析失败，请稍后重试',
            icon: 'error'
        });
    } finally {
        loading.value = false;
    }
};

// 工具方法
const goBack = () => {
    uni.navigateBack();
};

// 获取健康等级样式类
const getHealthLevelClass = () => {
    const level = analysisResult.value.HealthLevel;
    if (level === '优秀') return 'level-excellent';
    if (level === '良好') return 'level-good';
    if (level === '一般') return 'level-average';
    return 'level-poor';
};

// 获取风险等级标签类型
const getRiskLevelType = (level) => {
    if (level === '高') return 'error';
    if (level === '中') return 'warning';
    return 'success';
};

// 获取指标状态标签类型
const getIndicatorStatusType = (status) => {
    if (status === '正常') return 'success';
    if (status === '偏高' || status === '偏低') return 'warning';
    return 'error';
};

// 获取优先级标签类型
const getPriorityType = (priority) => {
    if (priority === '高') return 'error';
    if (priority === '中') return 'warning';
    return 'primary';
};

// 格式化分析时间
const formatAnalysisTime = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// 获取风险类型对应的emoji
const getRiskEmoji = (riskType) => {
    if (riskType.includes('体重')) return '⚖️';
    if (riskType.includes('血糖')) return '🩸';
    if (riskType.includes('营养')) return '🥗';
    if (riskType.includes('运动')) return '🏃‍♂️';
    if (riskType.includes('心血管')) return '❤️';
    return '⚠️';
};

// 获取指标名称对应的emoji
const getIndicatorEmoji = (indicatorName) => {
    if (indicatorName.includes('体重')) return '⚖️';
    if (indicatorName.includes('血糖')) return '🩸';
    if (indicatorName.includes('血氧')) return '🩸';
    if (indicatorName.includes('肺活量')) return '💨';
    if (indicatorName.includes('体温')) return '🌡️';
    if (indicatorName.includes('甲状腺')) return '🦋';
    return '📊';
};

// 获取建议类型对应的emoji
const getRecommendationEmoji = (recommendationType) => {
    if (recommendationType === '医疗') return '🏥';
    if (recommendationType === '饮食') return '🍽️';
    if (recommendationType === '运动') return '🏃‍♂️';
    if (recommendationType === '生活习惯') return '🏡';
    return '💡';
};

// 滚动到指定区域
const scrollToSection = async (sectionId) => {
    activeTab.value = sectionId;

    // 使用 uni.createSelectorQuery 获取精确位置
    await nextTick();

    const query = uni.createSelectorQuery();
    query.select(`#${sectionId}`).boundingClientRect();
    query.selectViewport().scrollOffset();
    query.exec((res) => {
        if (res[0]) {
            // 计算目标滚动位置，减去固定tab的高度偏移
            const targetScrollTop = res[0].top + res[1].scrollTop - 100; // 200upx 为tab导航高度 + 缓冲

            uni.pageScrollTo({
                scrollTop: Math.max(0, targetScrollTop), // 确保不会滚动到负值
                duration: 300
            });
        }
    });
};

// 计算并缓存所有section的位置信息
const calculateSectionPositions = async () => {
    if (!analysisResult.value) return;

    await nextTick();

    const sectionIds = ['overview', 'risks', 'nutrition', 'sport', 'indicators', 'recommendations'];
    const positions = [];

    return new Promise((resolve) => {
        let completed = 0;

        sectionIds.forEach((sectionId, index) => {
            const query = uni.createSelectorQuery();
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
                    // 按top位置排序
                    sectionPositions.value = positions.filter(p => p).sort((a, b) => a.top - b.top);
                    resolve();
                }
            });
        });
    });
};

// 更新活跃tab - 基于缓存的位置信息进行高效计算
const updateActiveTab = (scrollTop) => {
    if (!analysisResult.value || sectionPositions.value.length === 0) return;

    const offsetTop = 200; // tab导航高度 + 缓冲
    const adjustedScrollTop = scrollTop + offsetTop;

    // 从后往前遍历，找到第一个top小于等于当前滚动位置的section
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
</script>

<style scoped lang="scss">
/* 主容器样式 */
.main-container {
    padding: 0upx 20upx 30upx 20upx; // 顶部预留导航栏空间
    min-height: 100vh;
    background-color: #fafafa; // 更简洁的浅灰背景
}

/* 固定Tab导航样式 */
.fixed-tabs {
    position: fixed;
    top: 88upx; // 导航栏下方
    left: 0;
    right: 0;
    z-index: 100;
    background: rgba(255, 255, 255, 0.98);
    border-bottom: 1upx solid #e5e5e5;
    padding: 12upx 0;
}

.tab-scroll {
    width: 100%;
}

.tab-list {
    display: flex;
    padding: 0 20upx;
    gap: 16upx;
    white-space: nowrap;
}

.tab-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10upx 16upx;
    border-radius: 12upx;
    background: transparent;
    transition: all 0.2s ease;
    cursor: pointer;
    min-width: 90upx;
}

.tab-item.active {
    background: #1bb919;
    color: white;
}

.tab-emoji {
    font-size: 24upx;
    margin-bottom: 4upx;
}

.tab-text {
    font-size: 20upx;
    font-weight: 500;
    color: #666;
}

.tab-item.active .tab-text {
    color: white;
}

/* 为内容区域添加顶部间距，避免被fixed tab遮挡 */
.result-container {
    padding-top: 120upx; // Tab导航高度 + 额外间距
}

.section {
    scroll-margin-top: 200upx; // 滚动定位时的偏移量，确保标题不被tab遮挡
    margin-bottom: 30upx; // 增加section之间的间距，便于滚动定位
}

/* 加载动画样式 */
.loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 60vh;
}

.loading-animation {
    text-align: center;
}

.loading-circle {
    width: 120upx;
    height: 120upx;
    border: 6upx solid #e0e0e0;
    border-top: 6upx solid #4caf50;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 30upx auto;
}

.loading-inner {
    width: 80upx;
    height: 80upx;
    border: 4upx solid transparent;
    border-top: 4upx solid #66bb6a;
    border-radius: 50%;
    margin: 16upx auto;
    animation: spin 0.8s linear infinite reverse;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.loading-text {
    font-size: 32upx;
    color: #333;
    font-weight: 500;
    margin-bottom: 20upx;
}

.loading-tips {
    font-size: 26upx;
    color: #666;
}

/* 通用卡片头部样式 */
.card-header {
    padding: 20upx 0 20upx 0;
    border-bottom: 1upx solid #eee;
    margin-bottom: 24upx;
}

.card-title {
    font-size: 32upx;
    font-weight: 600;
    color: #333;
}

/* 健康总评样式 */
.health-overview {
    background: #fff;
    color: #333;
    border-radius: 16upx;
    padding: 32upx;
    border: 1upx solid #eee;
}

.health-score-section {
    display: flex;
    align-items: center;
    margin-bottom: 30upx;
}

.score-circle {
    width: 100upx;
    height: 100upx;
    background: #f8f9fa;
    border: 2upx solid #007bff;
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-right: 32upx;
}

.score-number {
    font-size: 40upx;
    font-weight: bold;
    line-height: 1;
    color: #007bff;
}

.score-total {
    font-size: 20upx;
    color: #666;
}

.health-level {
    flex: 1;
}

.level-text {
    font-size: 32upx;
    font-weight: 600;
    display: block;
    margin-bottom: 8upx;
    color: #333;
}

.level-desc {
    font-size: 24upx;
    color: #666;
}

.summary-text {
    font-size: 26upx;
    line-height: 1.5;
    color: #555;
    margin-top: 20upx;
}

/* 风险评估样式 */
.risk-list {
    space-y: 20upx;
}

.risk-item {
    padding: 24upx;
    background: #fff;
    border-radius: 12upx;
    margin-bottom: 16upx;
    border: 1upx solid #eee;
    border-left: 3upx solid #666;
}

.risk-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16upx;
}

.risk-info {
    display: flex;
    align-items: center;
    gap: 12upx;
}

.risk-emoji {
    font-size: 28upx;
}

.risk-type {
    font-size: 28upx;
    font-weight: 600;
    color: #333;
}

.risk-description {
    font-size: 26upx;
    color: #666;
    line-height: 1.5;
    margin-bottom: 16upx;
}

.risk-suggestions {
    background: #f8f9fa;
    padding: 16upx;
    border-radius: 8upx;
}

.suggestions-label {
    font-size: 24upx;
    font-weight: 600;
    color: #333;
}

.suggestions-text {
    font-size: 24upx;
    color: #666;
    line-height: 1.5;
    margin-left: 8upx;
}

/* 营养分析和运动分析样式 */
.nutrition-section,
.sport-section {
    background: #fff;
    border-radius: 16upx;
    padding: 24upx;
    border: 1upx solid #eee;
}

.nutrition-score,
.sport-score {
    margin-bottom: 32upx;
}

.score-label {
    font-size: 28upx;
    font-weight: 600;
    color: #333;
    display: block;
    margin-bottom: 16upx;
}

.score-bar {
    width: 100%;
    height: 8upx;
    background: #f0f0f0;
    border-radius: 4upx;
    overflow: hidden;
    margin-bottom: 8upx;
}

.score-progress {
    height: 100%;
    background: #007bff;
    border-radius: 4upx;
    transition: width 0.3s ease;
}

.score-value {
    font-size: 24upx;
    color: #666;
}

.nutrition-assessments,
.sport-assessments {
    margin-bottom: 40upx;
}

.assessment-item {
    margin-bottom: 30upx;
    padding: 20upx;
    background: #f8f9fa;
    border-radius: 12upx;
}

.assessment-label {
    font-size: 28upx;
    font-weight: 600;
    color: #333;
    display: block;
    margin-bottom: 10upx;
}

.assessment-value {
    font-size: 26upx;
    color: #666;
    line-height: 1.5;
}

.dietary-recommendations,
.exercise-recommendations {
    background: #f8f9fa;
    padding: 20upx;
    border-radius: 12upx;
    border: 1upx solid #eee;
}

.recommendations-title {
    font-size: 26upx;
    font-weight: 600;
    color: #333;
    display: block;
    margin-bottom: 16upx;
}

.recommendation-item {
    margin-bottom: 12upx;
}

.recommendation-text {
    font-size: 24upx;
    color: #555;
    line-height: 1.5;
}

/* 指标分析样式 */
.indicators-section {
    background: #fff;
    border-radius: 16upx;
    padding: 24upx;
    border: 1upx solid #eee;
}

.indicators-list {
    space-y: 20upx;
}

.indicator-item {
    padding: 20upx;
    background: #f8f9fa;
    border-radius: 12upx;
    margin-bottom: 16upx;
    border: 1upx solid #eee;
}

.indicator-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20upx;
}

.indicator-info {
    display: flex;
    align-items: center;
    gap: 15upx;
}

.indicator-emoji {
    font-size: 28upx;
}

.indicator-name {
    font-size: 32upx;
    font-weight: 600;
    color: #333;
}

.indicator-details {
    space-y: 15upx;
}

.detail-row {
    display: flex;
    margin-bottom: 15upx;
}

.detail-label {
    font-size: 26upx;
    color: #666;
    width: 140upx;
    flex-shrink: 0;
}

.detail-value {
    font-size: 26upx;
    color: #333;
    flex: 1;
}

.indicator-advice {
    margin-top: 20upx;
    padding: 20upx;
    background: #fff;
    border-radius: 12upx;
}

.advice-label {
    font-size: 26upx;
    font-weight: 600;
    color: #4caf50;
}

.advice-text {
    font-size: 26upx;
    color: #666;
    line-height: 1.5;
    margin-left: 10upx;
}

/* 健康建议样式 */
.recommendations-section {
    background: #fff;
    border-radius: 16upx;
    padding: 24upx;
    border: 1upx solid #eee;
}

.recommendations-list {
    space-y: 20upx;
}

.recommendation-card {
    padding: 24upx;
    background: #f8f9fa;
    color: #333;
    border-radius: 12upx;
    margin-bottom: 16upx;
    border: 1upx solid #eee;
}

.recommendation-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16upx;
}

.recommendation-info {
    display: flex;
    align-items: center;
    gap: 12upx;
}

.recommendation-emoji {
    font-size: 28upx;
}

.recommendation-title {
    font-size: 28upx;
    font-weight: 600;
    color: #333;
}

.recommendation-type {
    margin-bottom: 16upx;
}

.type-label {
    font-size: 24upx;
    color: #666;
}

.type-value {
    font-size: 24upx;
    font-weight: 600;
    margin-left: 8upx;
    color: #333;
}

.recommendation-content {
    font-size: 26upx;
    line-height: 1.5;
    margin-bottom: 16upx;
    color: #555;
}

.recommendation-effect {
    background: #fff;
    padding: 16upx;
    border-radius: 8upx;
    border: 1upx solid #eee;
}

.effect-label {
    font-size: 24upx;
    font-weight: 600;
    color: #333;
}

.effect-text {
    font-size: 24upx;
    line-height: 1.5;
    margin-left: 8upx;
    color: #666;
}

/* 分析时间样式 */
.analysis-time {
    text-align: center;
    margin-top: 32upx;
    padding: 20upx;
}

.time-text {
    font-size: 22upx;
    color: #999;
}

/* 错误状态样式 */
.error-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 60vh;
}

.error-content {
    text-align: center;
}

.error-text {
    font-size: 28upx;
    color: #666;
    margin: 24upx 0;
    display: block;
}

.retry-button {
    margin-top: 24upx;
    background: #007bff;
}

/* 健康等级颜色样式 */
.level-excellent {
    color: #28a745;
}

.level-good {
    color: #007bff;
}

.level-average {
    color: #ffc107;
}

.level-poor {
    color: #dc3545;
}
</style>