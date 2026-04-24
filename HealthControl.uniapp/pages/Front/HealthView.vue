<template>
    <view>
        <!-- 导航栏 -->
        <uni-nav-bar dark :fixed="true" shadow background-color="var(--primary-color)" status-bar left-icon="left"
            left-text="返回" @clickLeft="goBack" title="健康指标" />

        <!-- 内容区域 -->
        <view class="content">
            <!-- 时间过滤器 -->
            <view class="time-filter-section">
                <view class="filter-title">数据时间范围</view>
                <view class="time-range-container">
                    <view class="time-input-group">
                        <view class="input-label">开始时间</view>
                        <uni-datetime-picker v-model="timeRange.startTime" type="date" :clear-icon="false"
                            placeholder="选择开始时间" @change="onStartTimeChange">
                            <view class="time-input">
                                <text class="time-text">{{ timeRange.startTime || '选择开始时间' }}</text>
                                <uni-icons type="calendar" size="16" color="#999"></uni-icons>
                            </view>
                        </uni-datetime-picker>
                    </view>

                    <view class="time-separator">至</view>

                    <view class="time-input-group">
                        <view class="input-label">结束时间</view>
                        <uni-datetime-picker v-model="timeRange.endTime" type="date" :clear-icon="false"
                            placeholder="选择结束时间" @change="onEndTimeChange">
                            <view class="time-input">
                                <text class="time-text">{{ timeRange.endTime || '选择结束时间' }}</text>
                                <uni-icons type="calendar" size="16" color="#999"></uni-icons>
                            </view>
                        </uni-datetime-picker>
                    </view>
                </view>

                <!-- 快捷时间选择 -->
                <view class="quick-time-options">
                    <view class="quick-option" :class="{ active: selectedQuickOption === 'week' }"
                        @click="setQuickTime('week')">
                        最近一周
                    </view>
                    <view class="quick-option" :class="{ active: selectedQuickOption === 'month' }"
                        @click="setQuickTime('month')">
                        最近一月
                    </view>
                    <view class="quick-option" :class="{ active: selectedQuickOption === 'three-months' }"
                        @click="setQuickTime('three-months')">
                        最近三月
                    </view>
                </view>

                <!-- 查询按钮 -->
                <view class="filter-actions">
                    <button class="reset-btn" size="mini" @click="resetTimeFilter">重置</button>
                    <button class="search-btn" size="mini" type="primary" @click="applyTimeFilter">查询</button>
                </view>
            </view>

            <!-- 健康指标类型选择卡片 -->
            <view class="indicator-types-section">
                <view class="section-title">选择指标类型</view>
                <scroll-view class="types-scroll" scroll-x="true" show-scrollbar="false">
                    <view class="types-container">
                        <view v-for="(type, index) in HealthIndicatorTypeList" :key="type.Id" class="type-card"
                            :class="{ active: selectedTypeId === type.Id }" @click="selectType(type)">
                            <!-- 卡片内容 -->
                            <view class="card-content">
                                <view class="type-name">{{ type.Name }}</view>
                            </view>
                            <!-- 选中状态指示器 -->
                            <view class="selected-indicator" v-if="selectedTypeId === type.Id">
                                <uni-icons type="checkmarkempty" size="16" color="#fff"></uni-icons>
                            </view>
                        </view>
                    </view>
                </scroll-view>
            </view>

            <!-- 健康数据图表区域 -->
            <view class="chart-section" v-if="RecordListStatistics.length > 0">
                <view class="section-title">健康数据趋势</view>
                <view class="chart-container">
                    <qiun-data-charts type="line" :opts="chartOpts" :chartData="chartData" background="none" />
                </view>

                <!-- 图表说明 -->
                <view class="chart-legend">
                    <view class="legend-item" v-for="(indicator, index) in chartLegend" :key="index">
                        <view class="legend-color" :style="{ backgroundColor: indicator.color }"></view>
                        <view class="legend-text">{{ indicator.name }}</view>
                    </view>
                </view>
            </view>

            <!-- 空状态提示 -->
            <view class="empty-state" v-if="HealthIndicatorTypeList.length === 0">
                <view class="empty-text">暂无健康指标类型</view>
            </view>
        </view>
    </view>
</template>

<script setup>

import { useCommonStore } from '@/store';
import { Post } from "@/utils/http";
import { onLoad, onReady, onShow } from "@dcloudio/uni-app";
import { computed, nextTick, reactive, ref } from 'vue';


// 获取store
const commonStore = useCommonStore();
const Token = computed(() => commonStore.Token)
const UserInfo = computed(() => commonStore.UserInfo)
const RoleType = computed(() => commonStore.RoleType)
const UserId = computed(() => commonStore.UserId)





// 生命周期钩子
onLoad(async (option) => {


});

onShow(async () => {
    // 初始化默认时间范围
    initDefaultTimeRange();

    await HealthIndicatorTypeListApi();
    await RecordListStatisticsApi();
    // 页面显示时的逻辑
});

onReady(async () => {


});

const HealthIndicatorTypeList = ref([]);
// 选中的类型ID
const selectedTypeId = ref(null);

// 时间过滤相关变量 - 默认设置为最近一周
const timeRange = ref({
    startTime: '',
    endTime: ''
});
const selectedQuickOption = ref('week'); // 默认选中最近一周

// 初始化默认时间范围（最近一周）
const initDefaultTimeRange = () => {
    const now = new Date();
    const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);

    timeRange.value.startTime = formatDate(startDate);
    timeRange.value.endTime = formatDate(endDate);
};

const HealthIndicatorTypeListApi = async () => {
    let {
        Data
    } = await Post('/HealthIndicatorType/List', {
        BelongUserId: UserId.value
    });
    HealthIndicatorTypeList.value = Data.Items || Data;

    // 默认选中第一个类型，但不立即触发数据请求
    if (HealthIndicatorTypeList.value && HealthIndicatorTypeList.value.length > 0) {
        selectedTypeId.value = HealthIndicatorTypeList.value[0].Id;
    }
};

const RecordListStatistics = ref([]);
// 图表数据和配置
const chartData = ref({});
const chartLegend = ref([]);
const chartRenderTimer = ref(null);

// 图表配置选项
const chartOpts = ref({
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
            min: 0  // 确保Y轴从0开始
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
    // 构建请求参数
    const params = {
        RecordUserId: UserId.value,
        HealthIndicatorTypeId: selectedTypeId.value
    };

    // 如果有时间范围，添加到参数中
    if (timeRange.value.startTime && timeRange.value.endTime) {
        params.RecordTimeRange = [
            `${timeRange.value.startTime} 00:00:00`,
            `${timeRange.value.endTime} 23:59:59`
        ];
    }

    let {
        Data
    } = await Post('/HealthIndicatorRecord/RecordListStatistics', params);
    RecordListStatistics.value = Data;

    // 数据获取后更新图表
    if (Data && Data.length > 0) {
        await nextTick();
        updateChartData();
    } else {
        // 没有数据时清空图表
        chartData.value = {};
        chartLegend.value = [];
    }
};

// 方法
const goBack = () => {
    uni.navigateBack();
};

// 选择指标类型
const selectType = async (type) => {
    selectedTypeId.value = type.Id;

    // 清除之前的定时器
    if (chartRenderTimer.value) {
        clearTimeout(chartRenderTimer.value);
    }

    // 防抖处理，避免快速切换
    chartRenderTimer.value = setTimeout(async () => {
        await RecordListStatisticsApi();
    }, 300);
};

// 时间过滤相关方法
const onStartTimeChange = (e) => {
    timeRange.value.startTime = e;
    selectedQuickOption.value = ''; // 清除快捷选项
};

const onEndTimeChange = (e) => {
    timeRange.value.endTime = e;
    selectedQuickOption.value = ''; // 清除快捷选项
};

// 设置快捷时间
const setQuickTime = (option) => {
    selectedQuickOption.value = option;
    const now = new Date();
    const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let startDate = new Date();

    switch (option) {
        case 'week':
            startDate.setDate(endDate.getDate() - 7);
            break;
        case 'month':
            startDate.setMonth(endDate.getMonth() - 1);
            break;
        case 'three-months':
            startDate.setMonth(endDate.getMonth() - 3);
            break;
    }

    timeRange.value.startTime = formatDate(startDate);
    timeRange.value.endTime = formatDate(endDate);
};

// 格式化日期
const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// 重置时间过滤
const resetTimeFilter = () => {
    timeRange.value.startTime = '';
    timeRange.value.endTime = '';
    selectedQuickOption.value = '';
};

// 应用时间过滤
const applyTimeFilter = async () => {
    if (timeRange.value.startTime && timeRange.value.endTime) {
        // 验证时间范围
        if (new Date(timeRange.value.startTime) > new Date(timeRange.value.endTime)) {
            uni.showToast({
                title: '开始时间不能大于结束时间',
                icon: 'none'
            });
            return;
        }
    }

    // 重新获取数据
    await RecordListStatisticsApi();

    uni.showToast({
        title: '数据已更新',
        icon: 'success'
    });
};

// 更新图表数据
const updateChartData = () => {
    if (!RecordListStatistics.value || RecordListStatistics.value.length === 0) {
        chartData.value = {};
        chartLegend.value = [];
        return;
    }

    // 按日期排序数据
    const sortedData = [...RecordListStatistics.value].sort((a, b) => new Date(a.Date) - new Date(b.Date));

    // 获取所有日期作为X轴
    const categories = sortedData.map(item => {
        const date = new Date(item.Date);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${month}-${day}`;
    });

    // 收集所有健康指标名称
    const indicatorNames = new Set();
    sortedData.forEach(dateItem => {
        dateItem.Items.forEach(item => {
            indicatorNames.add(item.HealthIndicatorName);
        });
    });

    // 为每个指标创建数据系列
    const series = Array.from(indicatorNames).map((indicatorName) => {
        const data = sortedData.map(dateItem => {
            const indicator = dateItem.Items.find(item => item.HealthIndicatorName === indicatorName);
            if (!indicator || indicator.RecordValue === null || indicator.RecordValue === undefined || indicator.RecordValue === '') {
                return null;
            }

            const value = parseFloat(indicator.RecordValue);
            return Number.isNaN(value) ? null : value;
        });

        return {
            name: indicatorName,
            data: data
        };
    });

    // 根据当前数据动态调整Y轴范围，让小数级变化更明显
    const validValues = series.flatMap(item => item.data).filter(value => value !== null && value !== undefined);
    if (validValues.length > 0) {
        const dataMin = Math.min(...validValues);
        const dataMax = Math.max(...validValues);
        const range = dataMax - dataMin;

        // 数据跨度越小，保留的小数位越多
        const tofix = range < 1 ? 3 : range < 10 ? 2 : 1;
        const padding = range === 0 ? Math.max(Math.abs(dataMax) * 0.1, 0.1) : Math.max(range * 0.2, 0.05);

        chartOpts.value = {
            ...chartOpts.value,
            yAxis: {
                ...chartOpts.value.yAxis,
                data: [{
                    min: Number((dataMin - padding).toFixed(tofix)),
                    max: Number((dataMax + padding).toFixed(tofix)),
                    tofix
                }]
            }
        };
    }

    // 更新图例数据
    const colors = chartOpts.value.color;
    chartLegend.value = series.map((item, index) => ({
        name: item.name,
        color: colors[index % colors.length]
    }));

    // 设置图表数据
    chartData.value = {
        categories: categories,
        series: series
    };
};




</script>

<style scoped lang="scss">
/* 主内容区域 */
.content {

    /* 导航栏高度 */
    min-height: 100vh;
    background-color: #f5f5f5;
}

/* 时间过滤器样式 */
.time-filter-section {
    background-color: #fff;
    padding: 30rpx;
    margin-bottom: 20rpx;

    .filter-title {
        font-size: 32rpx;
        font-weight: 600;
        color: #333;
        margin-bottom: 30rpx;
        text-align: center;
    }

    .time-range-container {
        display: flex;
        align-items: center;
        gap: 20rpx;
        margin-bottom: 30rpx;

        .time-input-group {
            flex: 1;

            .input-label {
                font-size: 24rpx;
                color: #666;
                margin-bottom: 10rpx;
            }

            .time-input {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 20rpx;
                border: 2rpx solid #e9ecef;
                border-radius: 8rpx;
                background-color: #f8f9fa;

                .time-text {
                    font-size: 28rpx;
                    color: #333;
                }
            }
        }

        .time-separator {
            font-size: 28rpx;
            color: #666;
            margin-top: 30rpx;
        }
    }

    .quick-time-options {
        display: flex;
        gap: 15rpx;
        margin-bottom: 30rpx;

        .quick-option {
            flex: 1;
            padding: 16rpx 20rpx;
            text-align: center;
            font-size: 24rpx;
            color: #666;
            background-color: #f8f9fa;
            border: 2rpx solid #e9ecef;
            border-radius: 8rpx;
            transition: all 0.2s ease;

            &.active {
                background-color: var(--primary-color);
                border-color: var(--primary-color);
                color: #fff;
            }
        }
    }

    .filter-actions {
        display: flex;
        gap: 20rpx;

        .reset-btn {
            flex: 1;
            height: 60rpx;
            line-height: 60rpx;
            font-size: 24rpx;
            color: #666;
            background-color: #f8f9fa;
            border: 2rpx solid #e9ecef;
            border-radius: 8rpx;

            &:after {
                border: none;
            }
        }

        .search-btn {
            flex: 2;
            height: 60rpx;
            line-height: 60rpx;
            font-size: 24rpx;
            color: #fff;
            background-color: var(--primary-color);
            border: 2rpx solid var(--primary-color);
            border-radius: 8rpx;

            &:after {
                border: none;
            }
        }
    }
}

/* 指标类型选择区域 */
.indicator-types-section {
    background-color: #fff;
    padding: 20rpx 0;
    margin-bottom: 20rpx;

    .section-title {
        font-size: 32rpx;
        font-weight: 600;
        color: #333;
        padding: 0 30rpx 20rpx;
    }
}

/* 横向滚动容器 */
.types-scroll {
    white-space: nowrap;
}

.types-container {
    display: flex;
    padding: 0 30rpx;
    gap: 20rpx;
}

/* 类型卡片样式 */
.type-card {
    position: relative;
    min-width: 160rpx;
    height: 80rpx;
    background-color: #f8f9fa;
    border: 2rpx solid #e9ecef;
    border-radius: 12rpx;
    padding: 20rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    &.active {
        background-color: var(--primary-color);
        border-color: var(--primary-color);
    }

    .card-content {
        text-align: center;

        .type-name {
            font-size: 28rpx;
            font-weight: 500;
            color: #495057;
        }
    }

    &.active .card-content .type-name {
        color: #fff;
    }

    .selected-indicator {
        position: absolute;
        top: 8rpx;
        right: 8rpx;
        width: 24rpx;
        height: 24rpx;
        background-color: #28a745;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
    }
}

/* 图表区域样式 */
.chart-section {
    background-color: #fff;
    margin: 0 0 20rpx;
    padding: 30rpx;

    .section-title {
        font-size: 32rpx;
        font-weight: 600;
        color: #333;
        margin-bottom: 30rpx;
        text-align: center;
    }

    .chart-container {
        width: 100%;
        height: 600rpx;
        border-radius: 12rpx;
        overflow: visible;
        box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
        background-color: #fff;
    }

    .chart-legend {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 20rpx;
        margin-top: 30rpx;
        padding: 20rpx;
        background-color: #f8f9fa;
        border-radius: 12rpx;

        .legend-item {
            display: flex;
            align-items: center;
            gap: 8rpx;

            .legend-color {
                width: 16rpx;
                height: 16rpx;
                border-radius: 50%;
            }

            .legend-text {
                font-size: 24rpx;
                color: #666;
            }
        }
    }
}

/* 空状态样式 */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 100rpx 30rpx;

    .empty-text {
        font-size: 28rpx;
        color: #999;
        margin-top: 20rpx;
    }
}

/* 响应式适配 */
@media (max-width: 750rpx) {
    .type-card {
        min-width: 140rpx;
        height: 70rpx;
        padding: 16rpx;

        .card-content {
            .type-name {
                font-size: 26rpx;
            }
        }
    }
}
</style>