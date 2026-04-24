<template>
    <view>
        <!-- 导航栏 -->
        <uni-nav-bar dark :fixed="true" shadow background-color="var(--primary-color)" status-bar left-icon="left"
            title="批量录入数据" @clickLeft="goBack" />

        <!-- 页面内容 -->
        <view class="page-content">
            <!-- 头部信息 -->
            <view class="header-info">
                <view class="info-card">
                    <view class="info-icon">
                        <uni-icons type="list" size="20" color="#4CAF50"></uni-icons>
                    </view>
                    <view class="info-text">
                        <view class="info-title">共 {{ indicatorList.length }} 项指标待录入</view>
                        <view class="info-subtitle">请填写各项指标的测量值</view>
                    </view>
                </view>
            </view>

            <!-- 录入表单 -->
            <view class="form-container">
                <view v-for="(indicator, index) in indicatorList" :key="indicator.Id" class="form-item">
                    <!-- 指标信息 -->
                    <view class="indicator-info">
                        <view class="indicator-header">
                            <view class="indicator-icon">
                                <image v-if="indicator.Cover" :src="indicator.Cover" class="icon-image" mode="aspectFit">
                                </image>
                                <uni-icons v-else type="pulse" size="20" color="#4CAF50"></uni-icons>
                            </view>
                            <view class="indicator-details">
                                <view class="indicator-name">{{ indicator.Name }}</view>
                                <view class="indicator-category">{{ indicator.HealthIndicatorTypeName }}</view>
                                <view class="indicator-threshold">正常范围: {{ indicator.Threshold }}</view>
                            </view>
                        </view>
                        <view class="indicator-description">{{ indicator.Content }}</view>
                    </view>

                    <!-- 数据录入区域 -->
                    <view class="input-section">
                        <view class="input-group">
                            <view class="input-label">测量值</view>
                            <view class="input-wrapper">
                                <input type="number" class="data-input" placeholder="请输入测量值"
                                    v-model="recordData[index].RecordValue" @input="handleRecordInput(index)" />
                                <view class="unit-text">{{ getUnit(indicator.Threshold) }}</view>
                            </view>
                        </view>

                        <view class="input-group">
                            <view class="input-label">记录时间</view>
                            <view class="input-wrapper">
                                <uni-datetime-picker type="datetime" v-model="recordData[index].RecordTime"
                                    :clear-icon="false">
                                    <view class="time-input">
                                        {{ formatDateTime(recordData[index].RecordTime) || '点击选择时间' }}
                                    </view>
                                </uni-datetime-picker>
                            </view>
                        </view>

                        <!-- 异常状态提示 -->
                        <view v-if="recordData[index].IsAbnormity" class="abnormity-tip">
                            <uni-icons type="info-filled" size="16" color="#FF9800"></uni-icons>
                            <text class="tip-text">测量值超出正常范围</text>
                        </view>
                    </view>
                </view>
            </view>

            <!-- 提交按钮 -->
            <view class="submit-section">
                <button class="submit-btn" @click="submitRecords" :disabled="!isFormValid">
                    提交数据 ({{ validRecordsCount }}/{{ indicatorList.length }})
                </button>
            </view>
        </view>
    </view>
</template>

<script setup>
import { useCommonStore } from '@/store';
import { Post } from '@/utils/http';
import { onLoad } from "@dcloudio/uni-app";
import { computed, reactive, ref } from 'vue';
import { GetFormatFullDate } from '@/utils/comm';

// 获取store
const commonStore = useCommonStore();
const Token = computed(() => commonStore.Token)
const UserInfo = computed(() => commonStore.UserInfo)
const UserId = computed(() => commonStore.UserId)

// 页面数据
const indicatorList = ref([]); // 指标列表
const recordData = ref([]); // 录入数据

// 页面加载
onLoad(async (option) => {

    try {
        indicatorList.value = JSON.parse(uni.getStorageSync('selectedIndicators'));
        initRecordData();
    } catch (error) {
        console.error('解析指标数据失败:', error);
        uni.showToast({
            title: '数据解析失败',
            icon: 'error'
        });
        setTimeout(() => {
            uni.navigateBack();
        }, 1500);
    }

});

// 初始化录入数据
const initRecordData = () => {
    recordData.value = indicatorList.value.map(indicator => ({
        HealthIndicatorTypeId: indicator.HealthIndicatorTypeId,
        HealthIndicatorId: indicator.Id,
        RecordUserId: UserId.value,
        RecordTime: GetFormatFullDate(new Date()),
        RecordValue: '',
        IsAbnormity: false
    }));
};
const BMI_KEYWORDS = ['bmi', '体质指数'];
const HEIGHT_KEYWORDS = ['身高'];
const WEIGHT_KEYWORDS = ['体重'];

const hasKeyword = (name, keywords) => {
    const text = String(name || '').toLowerCase();
    return keywords.some(keyword => text.includes(String(keyword).toLowerCase()));
};

const findIndicatorIndexByKeywords = (keywords) => {
    return indicatorList.value.findIndex(item => hasKeyword(item?.Name, keywords));
};

const parseMetricHeight = (rawValue) => {
    const height = parseFloat(rawValue);
    if (!height || height <= 0) return null;
    return height > 3 ? height / 100 : height;
};

const syncBMIFromHeightWeight = () => {
    const heightIndex = findIndicatorIndexByKeywords(HEIGHT_KEYWORDS);
    const weightIndex = findIndicatorIndexByKeywords(WEIGHT_KEYWORDS);
    const bmiIndex = findIndicatorIndexByKeywords(BMI_KEYWORDS);

    if (heightIndex < 0 || weightIndex < 0 || bmiIndex < 0) return;

    const heightRecord = recordData.value[heightIndex];
    const weightRecord = recordData.value[weightIndex];
    const bmiRecord = recordData.value[bmiIndex];

    const heightInMeter = parseMetricHeight(heightRecord?.RecordValue);
    const weight = parseFloat(weightRecord?.RecordValue);

    if (!heightInMeter || !weight || weight <= 0) {
        bmiRecord.RecordValue = '';
        bmiRecord.IsAbnormity = false;
        return;
    }

    const bmi = weight / (heightInMeter * heightInMeter);
    bmiRecord.RecordValue = bmi.toFixed(2);

    // BMI自动填充时同步记录时间
    if (!bmiRecord.RecordTime) {
        bmiRecord.RecordTime = GetFormatFullDate(new Date());
    }

    checkAbnormity(bmiIndex);
};

const handleRecordInput = (index) => {
    checkAbnormity(index);

    const indicatorName = indicatorList.value[index]?.Name;
    if (hasKeyword(indicatorName, HEIGHT_KEYWORDS) || hasKeyword(indicatorName, WEIGHT_KEYWORDS)) {
        syncBMIFromHeightWeight();
    }
};

// 检查异常状态
const checkAbnormity = (index) => {
    const record = recordData.value[index];
    const indicator = indicatorList.value[index];

    if (!record.RecordValue || !indicator.Threshold) {
        record.IsAbnormity = false;
        return;
    }

    const value = parseFloat(record.RecordValue);
    const threshold = indicator.Threshold;

    // 解析正常范围
    if (threshold.includes('-')) {
        const [min, max] = threshold.split('-').map(v => parseFloat(v.trim()));
        record.IsAbnormity = value < min || value > max;
    } else if (threshold.includes('>')) {
        const min = parseFloat(threshold.replace('>', '').trim());
        record.IsAbnormity = value <= min;
    } else if (threshold.includes('<')) {
        const max = parseFloat(threshold.replace('<', '').trim());
        record.IsAbnormity = value >= max;
    } else {
        record.IsAbnormity = false;
    }
};

// 获取单位
const getUnit = (threshold) => {
    // 从阈值字符串中提取单位
    const units = ['ml', 'mg/dl', 'mmol/L', 'mIU/L', 'pmol/L', '%', 'bpm', 'mmHg'];
    for (const unit of units) {
        if (threshold.includes(unit)) {
            return unit;
        }
    }
    return '';
};

// 格式化日期时间
const formatDateTime = (dateTime) => {
    if (!dateTime) return '';
    const date = new Date(dateTime);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// 计算有效记录数量
const validRecordsCount = computed(() => {
    return recordData.value.filter(record => record.RecordValue && record.RecordTime).length;
});

// 表单验证
const isFormValid = computed(() => {
    return validRecordsCount.value > 0;
});

// 提交记录
const submitRecords = async () => {
    if (!isFormValid.value) {
        uni.showToast({
            title: '请至少填写一项数据',
            icon: 'none'
        });
        return;
    }

    try {
        uni.showLoading({ title: '提交中...' });

        // 过滤有效数据
        const validRecords = recordData.value.filter(record =>
            record.RecordValue && record.RecordTime
        ).map(record => ({
            ...record,
            RecordValue: parseFloat(record.RecordValue),
            IsAbnormity: record.IsAbnormity ? 'Y' : 'N'
        }));

        // 批量提交数据
        const { Success } = await Post('/HealthIndicatorRecord/BatchAdd', validRecords);

        uni.hideLoading();

        if (Success) {
            uni.showToast({
                title: '提交成功',
                icon: 'success'
            });
            setTimeout(() => {
                uni.navigateBack();
            }, 1500);
        }
    } catch (error) {
        uni.hideLoading();
        console.error('提交失败:', error);
        uni.showToast({
            title: '提交失败',
            icon: 'error'
        });
    }
};

// 返回上一页
const goBack = () => {
    uni.navigateBack();
};
</script>

<style scoped lang="scss">
/* 页面内容区域 */
.page-content {
    padding: 10rpx 24rpx 140rpx;
    min-height: 100vh;
    background-color: #f5f5f5;
}

/* 头部信息卡片 */
.header-info {
    margin-bottom: 32rpx;
}

.info-card {
    display: flex;
    align-items: center;
    background: #ffffff;
    border-radius: 16rpx;
    padding: 24rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.info-icon {
    width: 60rpx;
    height: 60rpx;
    background: #f0f8f0;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 20rpx;
}

.info-text {
    flex: 1;
}

.info-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #333333;
    margin-bottom: 4rpx;
}

.info-subtitle {
    font-size: 24rpx;
    color: #666666;
}

/* 表单容器 */
.form-container {
    display: flex;
    flex-direction: column;
    gap: 24rpx;
    padding: 0px;
}

/* 表单项 */
.form-item {
    background: #ffffff;
    border-radius: 16rpx;
    padding: 24rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

/* 指标信息区域 */
.indicator-info {
    margin-bottom: 24rpx;
    padding-bottom: 20rpx;
    border-bottom: 2rpx solid #f0f0f0;
}

.indicator-header {
    display: flex;
    align-items: flex-start;
    margin-bottom: 12rpx;
}

.indicator-icon {
    width: 60rpx;
    height: 60rpx;
    background: #f0f8f0;
    border-radius: 12rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 16rpx;
    flex-shrink: 0;
}

.icon-image {
    width: 40rpx;
    height: 40rpx;
    border-radius: 8rpx;
}

.indicator-details {
    flex: 1;
}

.indicator-name {
    font-size: 28rpx;
    font-weight: 600;
    color: #333333;
    margin-bottom: 4rpx;
}

.indicator-category {
    font-size: 22rpx;
    color: #888888;
    margin-bottom: 4rpx;
}

.indicator-threshold {
    font-size: 24rpx;
    color: #4CAF50;
    font-weight: 500;
}

.indicator-description {
    font-size: 24rpx;
    color: #666666;
    line-height: 1.5;
}

/* 输入区域 */
.input-section {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
}

.input-group {
    display: flex;
    flex-direction: column;
    gap: 8rpx;
}

.input-label {
    font-size: 26rpx;
    font-weight: 600;
    color: #333333;
}

.input-wrapper {
    display: flex;
    align-items: center;
    background: #f8f8f8;
    border-radius: 12rpx;
    padding: 16rpx;
    border: 2rpx solid transparent;
    transition: border-color 0.3s ease;

    &:focus-within {
        border-color: #4CAF50;
        background: #ffffff;
    }
}

.data-input {
    flex: 1;
    font-size: 28rpx;
    color: #333333;
    background: transparent;
    border: none;
    outline: none;
}

.unit-text {
    font-size: 24rpx;
    color: #888888;
    margin-left: 12rpx;
}

.time-input {
    flex: 1;
    font-size: 28rpx;
    color: #333333;
    padding: 4rpx 0;
}

/* 异常提示 */
.abnormity-tip {
    display: flex;
    align-items: center;
    background: #fff3e0;
    border: 2rpx solid #ffcc80;
    border-radius: 8rpx;
    padding: 12rpx 16rpx;
    margin-top: 8rpx;
}

.tip-text {
    font-size: 24rpx;
    color: #FF9800;
    margin-left: 8rpx;
}

/* 提交区域 */
.submit-section {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 20rpx 24rpx;
    background: #ffffff;
    box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.submit-btn {
    width: 100%;
    height: 88rpx;
    background: linear-gradient(135deg, #4CAF50, #45a049);
    border-radius: 16rpx;
    font-size: 32rpx;
    font-weight: 600;
    color: #ffffff;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4rpx 16rpx rgba(76, 175, 80, 0.3);
    transition: all 0.3s ease;

    &:active {
        transform: scale(0.98);
        opacity: 0.9;
    }

    &[disabled] {
        background: #cccccc;
        box-shadow: none;
        opacity: 0.6;
    }
}
</style> 