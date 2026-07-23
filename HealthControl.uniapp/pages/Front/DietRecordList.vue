<template>
    <view>
        <!-- 导航栏 -->
        <uni-nav-bar dark :fixed="true" shadow background-color="var(--primary-color)" status-bar left-icon="left"
            left-text="返回" @clickLeft="goBack" title="我的饮食记录" />

        <!-- 饮食记录列表内容区域 -->
        <view>
            <!-- 日历组件 -->
            <view class="calendar-container">
                <uni-calendar :selected="selectedDates" @change="onDateChange" :lunar="false" :start-date="startDate"
                    :end-date="endDate" />
            </view>

            <!-- 选中日期显示 -->
            <view class="selected-date">
                <text class="date-text">{{ selectedDateText }}</text>
                <button v-if="DietRecordList.length > 0" class="share-btn" @click="shareDietRecord" size="mini">分享今日饮食到社区</button>
            </view>

            <!-- 饮食记录列表 -->
            <view class="diet-records-container" v-if="DietRecordList.length > 0">
                <!-- 遍历每个时段（早餐、午餐、晚餐等） -->
                <view class="meal-section" v-for="(mealGroup, index) in DietRecordList" :key="index">
                    <!-- 时段标题 -->
                    <view class="meal-header">
                        <view class="meal-title">
                            <text class="meal-name">{{ mealGroup.DateType }}</text>
                            <text class="meal-calories">{{ mealGroup.TotalCalories }}千卡</text>
                        </view>
                        <view class="nutrition-info">
                            <text class="nutrition-item">蛋白质: {{ mealGroup.TotalProtein }}g</text>
                            <text class="nutrition-item">碳水: {{ mealGroup.TotalCarbohydrates }}g</text>
                            <text class="nutrition-item">脂肪: {{ mealGroup.TotalFat }}g</text>
                        </view>
                    </view>

                    <!-- 该时段的食物记录 -->
                    <view class="food-records">
                        <view class="food-item" v-for="record in mealGroup.DietRecords" :key="record.Id">
                            <view class="food-info">
                                <image class="food-image" :src="record.FoodDto.Cover" mode="aspectFill"></image>
                                <view class="food-details">
                                    <text class="food-name">{{ record.FoodDto.Name }}</text>
                                    <text class="food-unit">{{ record.RecordValue }}{{ record.FoodUnitDto.UnitName }}</text>
                                    <text class="food-calories">{{ record.FoodUnitDto.Calories }}千卡</text>
                                    <text class="food-time">{{ formatTime(record.RecordTime) }}</text>
                                </view>
                            </view>
                            <view class="food-actions">
                                <uni-icons type="trash" size="20" color="#ff4757"
                                    @click="ShowDeleteModal(record.Id)"></uni-icons>
                            </view>
                        </view>
                    </view>
                </view>
            </view>

            <!-- 空状态 -->
            <view class="empty-state" v-else>
                <uni-icons type="calendar" size="60" color="#ccc"></uni-icons>
                <text class="empty-text">该日期暂无饮食记录</text>
                <text class="empty-hint">点击右下角按钮添加记录</text>
            </view>
        </view>
        <view style="height: 150upx;"></view>

        <!-- 浮动添加按钮 -->
        <view class="floating-add-btn" @click="goToAddRecord">
            <uni-icons type="plus" size="24" color="#fff"></uni-icons>
            <text class="btn-text">添加</text>
        </view>
    </view>
</template>

<script setup>

import { useCommonStore } from '@/store';
import { Post } from '@/utils/http';
import { onLoad, onReady, onShow } from "@dcloudio/uni-app";
import { computed, reactive, ref } from 'vue';

// 获取store
const commonStore = useCommonStore();
const Token = computed(() => commonStore.Token)
const UserInfo = computed(() => commonStore.UserInfo)
const RoleType = computed(() => commonStore.RoleType)
const UserId = computed(() => commonStore.UserId)

// 日历相关数据
const selectedDates = ref([]);
const selectedDate = ref(new Date());
const startDate = ref('2020-01-01');
const endDate = ref('2030-12-31');

// 计算选中日期的显示文本
const selectedDateText = computed(() => {
    const date = selectedDate.value;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}年${month}月${day}日`;
});

// 格式化日期为API需要的时间范围格式
const formatDateRangeForApi = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    // 返回当天的开始和结束时间
    const startTime = `${year}-${month}-${day} 00:00:00`;
    const endTime = `${year}-${month}-${day} 23:59:59`;

    return [startTime, endTime];
};

const TestInfoList = ref([]);

const where = reactive({
    RecordUserId: UserId.value,
    RecordTimeRange: formatDateRangeForApi(selectedDate.value), // 修改为时间范围参数
});

// 日历日期改变事件
const onDateChange = (event) => {
    const { fulldate } = event;
    selectedDate.value = new Date(fulldate);
    selectedDates.value = [{ date: fulldate, info: '选中' }];

    // 更新查询条件中的时间范围
    where.RecordTimeRange = formatDateRangeForApi(selectedDate.value);

    // 重新获取数据
    GetDietRecordListApi();
};

// 生命周期钩子
onLoad(async (option) => {
    // 初始化选中今天的日期
    const today = new Date();
    selectedDate.value = today;
    const todayFormatted = formatDateRangeForApi(today)[0].split(' ')[0]; // 获取日期部分用于日历显示
    selectedDates.value = [{ date: todayFormatted, info: '选中' }];
    where.RecordTimeRange = formatDateRangeForApi(today);
});

onShow(async () => {
    GetDietRecordListApi();
});

onReady(async () => {

});

// 方法
const goBack = () => {
    uni.navigateBack();
};

// 跳转到添加记录页面
const goToAddRecord = () => {
    uni.navigateTo({
        url: '/pages/Front/FoodList'
    });
};

const DietRecordList = ref([])
const GetDietRecordListApi = async () => {
    let {
        Data
    } = await Post('/DietRecord/DietRecordByDay', where);
    DietRecordList.value = Data || [];
}

// 删除
const ShowDeleteModal = async (Id) => {
    uni.showModal({
        title: '提示',
        content: '确认删除该饮食记录吗？',
        success: async (res) => {
            if (res.confirm) {
                const { Success } = await Post(`/DietRecord/Delete`, { Id: Id });
                if (Success) {
                    await GetDietRecordListApi();
                    uni.showToast({
                        title: '删除成功',
                        icon: 'success'
                    });
                }
            }
        }
    })
};

// 格式化时间
const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
};

// 分享今日饮食到社区
const shareDietRecord = async () => {
    uni.showModal({
        title: '分享饮食',
        content: '确认将今日饮食记录分享到社区吗？',
        success: async (res) => {
            if (res.confirm) {
                const year = selectedDate.value.getFullYear();
                const month = String(selectedDate.value.getMonth() + 1).padStart(2, '0');
                const day = String(selectedDate.value.getDate()).padStart(2, '0');
                const dateStr = `${year}-${month}-${day}`;
                const { Success, Msg } = await Post('/CommunityPost/ShareDietRecord', {
                    UserId: UserId.value,
                    Date: dateStr
                });
                uni.showToast({
                    title: Success ? '已分享到社区' : (Msg || '分享失败'),
                    icon: Success ? 'success' : 'none'
                });
            }
        }
    });
};

</script>

<style scoped lang="scss">
/* 内容容器样式 */
.content-container {
    padding-top: 88rpx;
    /* 为导航栏留出空间 */
    padding-bottom: 120rpx;
    /* 为浮动按钮留出空间 */
    min-height: 100vh;
    background-color: #f8f9fa;
}

/* 日历容器样式 */
.calendar-container {
    background-color: #fff;
    margin: 20rpx;
    border-radius: 16rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
    overflow: hidden;
}

/* 选中日期显示 */
.selected-date {
    padding: 20rpx 40rpx;
    background-color: #fff;
    margin: 20rpx;
    border-radius: 12rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.date-text {
    font-size: 32rpx;
    font-weight: 600;
    color: var(--primary-color);
}

.share-btn {
    margin-top: 16rpx;
    padding: 12rpx 24rpx;
    border-radius: 999rpx;
    background: var(--primary-color);
    color: #fff;
    font-size: 24rpx;
    border: none;
    line-height: 1.4;
}

/* 饮食记录容器 */
.diet-records-container {
    padding: 0 20rpx;
}

/* 用餐时段样式 */
.meal-section {
    background-color: #fff;
    border-radius: 16rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
    overflow: hidden;
}

.meal-header {
    padding: 30rpx;
    background-color: #fff;
    border-bottom: 1rpx solid #f0f0f0;
    color: #333;
}

.meal-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15rpx;
}

.meal-name {
    font-size: 36rpx;
    font-weight: 600;
    color: var(--primary-color);
}

.meal-calories {
    font-size: 32rpx;
    font-weight: 500;
    color: #333;
}

.nutrition-info {
    display: flex;
    justify-content: space-between;
}

.nutrition-item {
    font-size: 24rpx;
    color: #666;
}

/* 食物记录样式 */
.food-records {
    padding: 0;
}

.food-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx;
    border-bottom: 1rpx solid #f0f0f0;
}

.food-item:last-child {
    border-bottom: none;
}

.food-info {
    display: flex;
    align-items: center;
    flex: 1;
}

.food-image {
    width: 80rpx;
    height: 80rpx;
    border-radius: 12rpx;
    margin-right: 20rpx;
    background-color: #f5f5f5;
}

.food-details {
    display: flex;
    flex-direction: column;
    flex: 1;
}

.food-name {
    font-size: 32rpx;
    font-weight: 500;
    color: #333;
    margin-bottom: 8rpx;
}

.food-unit {
    font-size: 28rpx;
    color: #666;
    margin-bottom: 8rpx;
}

.food-calories {
    font-size: 26rpx;
    color: var(--primary-color);
    font-weight: 500;
}

.food-time {
    font-size: 24rpx;
    color: #999;
    margin-top: 8rpx;
}

.food-actions {
    padding: 10rpx;
}

/* 空状态样式 */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 100rpx 40rpx;
    background-color: #fff;
    margin: 20rpx;
    border-radius: 16rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.empty-text {
    font-size: 32rpx;
    color: #999;
    margin-top: 30rpx;
    margin-bottom: 10rpx;
}

.empty-hint {
    font-size: 28rpx;
    color: #ccc;
}

/* 浮动添加按钮样式 */
.floating-add-btn {
    position: fixed;
    bottom: 30rpx;
    right: 30rpx;
    width: 100rpx;
    height: 100rpx;
    background-color: var(--primary-color);
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8rpx 16rpx rgba(0, 0, 0, 0.15);
    z-index: 999;
    transition: all 0.3s ease;
}

/* 按钮点击效果 */
.floating-add-btn:active {
    transform: scale(0.95);
    box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
}

/* 按钮文本样式 */
.btn-text {
    color: #fff;
    font-size: 20rpx;
    margin-top: 8rpx;
    font-weight: 500;
}
</style>