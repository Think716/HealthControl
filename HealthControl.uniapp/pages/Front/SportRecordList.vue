<template>
    <view class="sport-page">
        <uni-nav-bar dark :fixed="true" shadow background-color="var(--primary-color)" status-bar left-icon="left"
            left-text="返回" @clickLeft="goBack" title="运动打卡" />

        <view class="content-container">
            <view class="summary-card">
                <view class="summary-head">
                    <view>
                        <text class="summary-label">今日净热量</text>
                        <view class="net-value" :class="{ low: dashboard.NetCalories < 900, high: dashboard.NetCalories > 1800 }">
                            {{ formatNumber(dashboard.NetCalories) }}
                            <text class="unit">kcal</text>
                        </view>
                    </view>
                    <view class="check-badge" :class="{ done: dashboard.IsChecked }">
                        {{ dashboard.IsChecked ? '已打卡' : '未打卡' }}
                    </view>
                </view>

                <view class="metric-grid">
                    <view class="metric-item">
                        <text class="metric-value">{{ formatNumber(dashboard.IntakeCalories) }}</text>
                        <text class="metric-label">摄入</text>
                    </view>
                    <view class="metric-item">
                        <text class="metric-value">{{ formatNumber(dashboard.BurnedCalories) }}</text>
                        <text class="metric-label">消耗</text>
                    </view>
                    <view class="metric-item">
                        <text class="metric-value">{{ dashboard.RecordCount || 0 }}</text>
                        <text class="metric-label">次数</text>
                    </view>
                </view>

                <view class="suggestion">{{ dashboard.Suggestion || '选择一项运动，记录今天的热量消耗。' }}</view>
            </view>

            <view class="growth-card">
                <view class="growth-top">
                    <view>
                        <text class="panel-title">成长体系</text>
                        <view class="growth-level">{{ growth.LevelName || '健康新手' }}</view>
                    </view>
                    <view class="points">{{ growth.Points || dashboard.Points || 0 }}<text>积分</text></view>
                </view>
                <view class="growth-grid">
                    <view class="growth-item">
                        <text class="growth-value">{{ dashboard.ContinuousDays || growth.ContinuousDays || 0 }}</text>
                        <text class="growth-label">连续签到</text>
                    </view>
                    <view class="growth-item">
                        <text class="growth-value">{{ growth.MonthCheckDays || 0 }}</text>
                        <text class="growth-label">本月打卡</text>
                    </view>
                    <view class="growth-item">
                        <text class="growth-value">{{ growth.CheckDays || 0 }}</text>
                        <text class="growth-label">累计天数</text>
                    </view>
                </view>
                <view class="badge-row">
                    <text v-for="badge in (dashboard.Badges && dashboard.Badges.length ? dashboard.Badges : growth.Badges)"
                        :key="badge" class="badge">{{ badge }}</text>
                </view>
                <button class="share-btn" @click="shareSport">分享运动成果</button>
            </view>

            <view class="panel-card">
                <view class="panel-title">选择运动</view>
                <scroll-view scroll-x class="sport-scroll" show-scrollbar="false">
                    <view class="sport-list">
                        <view v-for="sport in sportList" :key="sport.Id" class="sport-chip"
                            :class="{ active: selectedSport && selectedSport.Id === sport.Id }" @click="selectSport(sport)">
                            <image v-if="sport.Cover" :src="sport.Cover" class="sport-cover" mode="aspectFill" />
                            <view v-else class="sport-placeholder"></view>
                            <text class="sport-name">{{ sport.Name }}</text>
                        </view>
                    </view>
                </scroll-view>

                <view v-if="selectedSport" class="form-box">
                    <view class="unit-row">
                        <view v-for="unit in selectedSport.SportUnits" :key="unit.Id" class="unit-chip"
                            :class="{ active: selectedUnit && selectedUnit.Id === unit.Id }" @click="selectUnit(unit)">
                            {{ unit.UnitName }}
                        </view>
                    </view>

                    <view class="input-row">
                        <input v-model="recordValue" type="number" class="amount-input"
                            :placeholder="`请输入${selectedUnit ? selectedUnit.UnitName : '数量'}`"
                            placeholder-style="color:#999;font-size:26rpx;" />
                        <picker mode="datetime" :value="recordTime" @change="onTimeChange">
                            <view class="time-picker">{{ recordTime }}</view>
                        </picker>
                    </view>

                    <view class="calc-line">
                        预计消耗 <text>{{ formatNumber(estimatedCalories) }}</text> kcal
                    </view>

                    <button class="save-btn" :disabled="!canSave" @click="saveRecord">保存并打卡</button>
                </view>
            </view>

            <view class="panel-card">
                <view class="panel-title">今日运动</view>
                <view v-if="dashboard.SportRecords.length === 0" class="empty-state">
                    <uni-icons type="calendar" size="56" color="#ccc"></uni-icons>
                    <text class="empty-text">今天还没有运动记录</text>
                </view>
                <view v-for="record in dashboard.SportRecords" :key="record.Id" class="record-item">
                    <view class="record-left">
                        <image v-if="record.SportDto && record.SportDto.Cover" class="record-cover"
                            :src="record.SportDto.Cover" mode="aspectFill" />
                        <view v-else class="record-cover placeholder"></view>
                        <view class="record-info">
                            <view class="record-title">{{ record.SportDto ? record.SportDto.Name : '运动' }}</view>
                            <view class="record-desc">
                                {{ record.RecordValue }}{{ record.SportUnitDto ? record.SportUnitDto.UnitName : '' }}
                                · {{ formatTime(record.RecordTime) }}
                            </view>
                        </view>
                    </view>
                    <view class="record-right">
                        <text class="burned">{{ formatNumber(record.CaloriesBurned) }} kcal</text>
                        <uni-icons type="trash" size="20" color="#ff4757" @click="deleteRecord(record.Id)"></uni-icons>
                    </view>
                </view>
            </view>

            <view class="panel-card">
                <view class="leader-head">
                    <view class="panel-title">运动排行榜</view>
                    <view class="leader-tabs">
                        <text :class="{ active: leaderboardType === 'week' }" @click="switchLeaderboard('week')">周榜</text>
                        <text :class="{ active: leaderboardType === 'month' }" @click="switchLeaderboard('month')">月榜</text>
                    </view>
                </view>
                <view v-if="leaderboard.length === 0" class="empty-state compact">
                    <text class="empty-text">暂无排行榜数据</text>
                </view>
                <view v-for="row in leaderboard" :key="row.UserId" class="leader-item">
                    <text class="rank">#{{ row.Rank }}</text>
                    <image v-if="row.ImageUrls" class="leader-avatar" :src="row.ImageUrls" mode="aspectFill" />
                    <view v-else class="leader-avatar placeholder"></view>
                    <view class="leader-info">
                        <text class="leader-name">{{ row.UserName }}</text>
                        <text class="leader-desc">{{ row.CheckDays }}天 · {{ formatNumber(row.BurnedCalories) }}kcal</text>
                    </view>
                    <text class="leader-points">{{ row.Points }}分</text>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup>
import { computed, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { Post } from '@/utils/http';
import { useCommonStore } from '@/store';

const store = useCommonStore();
const sportList = ref([]);
const selectedSport = ref(null);
const selectedUnit = ref(null);
const recordValue = ref('');
const growth = ref({
    CheckDays: 0,
    ContinuousDays: 0,
    MonthCheckDays: 0,
    Points: 0,
    LevelName: '',
    Badges: []
});
const leaderboard = ref([]);
const leaderboardType = ref('week');
const dashboard = ref({
    IntakeCalories: 0,
    BurnedCalories: 0,
    NetCalories: 0,
    RecordCount: 0,
    IsChecked: false,
    Suggestion: '',
    ContinuousDays: 0,
    Points: 0,
    Badges: [],
    SportRecords: []
});

const pad = (num) => String(num).padStart(2, '0');

const formatRecordTimeForPicker = (date = new Date()) => {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const recordTime = ref(formatRecordTimeForPicker());

const estimatedCalories = computed(() => {
    if (!selectedUnit.value || !recordValue.value) return 0;
    const value = Number(recordValue.value);
    const unitValue = Number(selectedUnit.value.UnitValue || 1);
    const calories = Number(selectedUnit.value.Calories || 0);
    return unitValue > 0 ? value * calories / unitValue : value * calories;
});

const canSave = computed(() => selectedSport.value && selectedUnit.value && Number(recordValue.value) > 0);

onShow(async () => {
    await loadSports();
    await loadDashboard();
    await Promise.all([loadGrowth(), loadLeaderboard()]);
});

const loadSports = async () => {
    const { Data, Success, Msg } = await Post('/Sport/List', {});
    if (!Success) {
        uni.showToast({ title: Msg || '运动项目加载失败', icon: 'none' });
        return;
    }
    sportList.value = Data || [];
    if (!selectedSport.value && sportList.value.length > 0) {
        selectSport(sportList.value[0]);
    }
};

const loadDashboard = async () => {
    const { Data, Success, Msg } = await Post('/SportRecord/TodaySummary', {
        RecordUserId: store.UserId,
        RecordTimeRange: [getTodayStart(), getTodayEnd()]
    });
    if (!Success) {
        uni.showToast({ title: Msg || '运动汇总加载失败', icon: 'none' });
        return;
    }
    dashboard.value = {
        IntakeCalories: 0,
        BurnedCalories: 0,
        NetCalories: 0,
        RecordCount: 0,
        IsChecked: false,
        Suggestion: '',
        SportRecords: [],
        ...(Data || {})
    };
};

const loadGrowth = async () => {
    const { Data, Success } = await Post('/SportRecord/GrowthSummary', { RecordUserId: store.UserId });
    if (Success) {
        growth.value = {
            CheckDays: 0,
            ContinuousDays: 0,
            MonthCheckDays: 0,
            Points: 0,
            LevelName: '',
            Badges: [],
            ...(Data || {})
        };
    }
};

const loadLeaderboard = async () => {
    const { Data, Success } = await Post('/SportRecord/Leaderboard', { Type: leaderboardType.value });
    if (Success) leaderboard.value = Data || [];
};

const switchLeaderboard = async (type) => {
    leaderboardType.value = type;
    await loadLeaderboard();
};

const shareSport = async () => {
    const { Success, Msg } = await Post('/SportRecord/ShareSportRecord', { UserId: store.UserId });
    uni.showToast({ title: Success ? '已分享到社区，等待审核' : (Msg || '分享失败'), icon: Success ? 'success' : 'none' });
};

const selectSport = (sport) => {
    selectedSport.value = sport;
    selectedUnit.value = sport.SportUnits && sport.SportUnits.length > 0 ? sport.SportUnits[0] : null;
};

const selectUnit = (unit) => {
    selectedUnit.value = unit;
};

const onTimeChange = (e) => {
    recordTime.value = e.detail.value;
};

const saveRecord = async () => {
    if (!canSave.value) return;
    const { Success, Msg } = await Post('/SportRecord/CreateOrEdit', {
        SportId: selectedSport.value.Id,
        SportUnitId: selectedUnit.value.Id,
        RecordUserId: store.UserId,
        RecordTime: normalizeDateTime(recordTime.value),
        RecordValue: Math.round(Number(recordValue.value))
    });

    if (!Success) {
        uni.showToast({ title: Msg || '保存失败', icon: 'none' });
        return;
    }

    uni.showToast({ title: '运动打卡成功', icon: 'success' });
    recordValue.value = '';
    recordTime.value = formatRecordTimeForPicker();
    await loadDashboard();
};

const deleteRecord = async (id) => {
    const modalResult = await uni.showModal({ title: '删除记录', content: '确定删除这条运动记录吗？' });
    const confirm = Array.isArray(modalResult) ? modalResult[1] && modalResult[1].confirm : modalResult.confirm;
    if (!confirm) return;
    const { Success, Msg } = await Post('/SportRecord/Delete', { Id: id });
    if (!Success) {
        uni.showToast({ title: Msg || '删除失败', icon: 'none' });
        return;
    }
    await loadDashboard();
};

const goBack = () => {
    uni.navigateBack();
};

const getTodayStart = () => {
    const now = new Date();
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} 00:00:00`;
};

const getTodayEnd = () => {
    const now = new Date();
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} 23:59:59`;
};

const normalizeDateTime = (value) => {
    if (!value) return formatRecordTimeForPicker() + ':00';
    return value.length === 16 ? `${value}:00` : value;
};

const formatNumber = (num) => Math.round(Number(num || 0));

const formatTime = (time) => {
    if (!time) return '';
    return String(time).slice(11, 16);
};
</script>

<style scoped lang="scss">
.sport-page {
    min-height: 100vh;
    background-color: #f8f9fa;
}

.content-container {
    padding: 20rpx;
    padding-bottom: 50rpx;
}

.summary-card,
.panel-card {
    background-color: #fff;
    border-radius: 16rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
    overflow: hidden;
}

.summary-card {
    padding: 30rpx;
}

.summary-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.summary-label,
.metric-label {
    font-size: 24rpx;
    color: #666;
}

.net-value {
    margin-top: 8rpx;
    color: var(--primary-color);
    font-size: 56rpx;
    font-weight: 700;
}

.net-value.high {
    color: #ef6c00;
}

.net-value.low {
    color: #409eff;
}

.unit {
    margin-left: 8rpx;
    font-size: 24rpx;
}

.check-badge {
    padding: 10rpx 22rpx;
    border-radius: 999rpx;
    background: #eef2f7;
    color: #666;
    font-size: 24rpx;
}

.check-badge.done {
    background: var(--primary-color);
    color: #fff;
}

.metric-grid {
    display: flex;
    justify-content: space-between;
    margin-top: 28rpx;
}

.metric-item {
    width: 30%;
    padding: 18rpx 0;
    border-radius: 12rpx;
    background: #f8f9fa;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.metric-value {
    color: #333;
    font-size: 34rpx;
    font-weight: 700;
}

.suggestion {
    margin-top: 22rpx;
    color: #666;
    line-height: 1.6;
    font-size: 26rpx;
}

.panel-card {
    padding: 24rpx;
}

.panel-title {
    margin-bottom: 20rpx;
    color: #333;
    font-size: 32rpx;
    font-weight: 600;
}

.sport-scroll {
    white-space: nowrap;
}

.sport-list {
    display: flex;
    gap: 16rpx;
}

.sport-chip {
    flex: 0 0 auto;
    width: 158rpx;
    padding: 14rpx 10rpx;
    border: 2rpx solid #eef2f7;
    border-radius: 14rpx;
    background: #fbfdff;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.sport-chip.active {
    border-color: var(--primary-color);
    background: #f0f9ff;
}

.sport-cover {
    width: 96rpx;
    height: 96rpx;
    border-radius: 14rpx;
    background: #f5f5f5;
}

.sport-placeholder {
    width: 96rpx;
    height: 96rpx;
    border-radius: 14rpx;
    background: #eef2f7;
}

.sport-name {
    max-width: 136rpx;
    margin-top: 10rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #333;
    font-size: 24rpx;
}

.form-box {
    margin-top: 24rpx;
}

.unit-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
}

.unit-chip {
    padding: 10rpx 20rpx;
    border-radius: 999rpx;
    background: #eef2f7;
    color: #666;
    font-size: 24rpx;
}

.unit-chip.active {
    background: var(--primary-color);
    color: #fff;
}

.input-row {
    margin-top: 20rpx;
    display: flex;
    gap: 16rpx;
}

.amount-input,
.time-picker {
    box-sizing: border-box;
    min-height: 76rpx;
    padding: 0 18rpx;
    border: 1rpx solid #e5e7eb;
    border-radius: 12rpx;
    background: #fbfdff;
    color: #333;
    font-size: 26rpx;
    display: flex;
    align-items: center;
}

.amount-input {
    flex: 1;
}

.time-picker {
    width: 270rpx;
}

.calc-line {
    margin-top: 18rpx;
    color: #666;
    font-size: 26rpx;
}

.calc-line text {
    color: var(--primary-color);
    font-weight: 700;
}

.save-btn {
    margin-top: 20rpx;
    background: var(--primary-color);
    color: #fff;
    border-radius: 12rpx;
}

.record-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 22rpx 0;
    border-bottom: 1rpx solid #f0f0f0;
}

.record-item:last-child {
    border-bottom: none;
}

.record-left {
    display: flex;
    align-items: center;
    flex: 1;
}

.record-cover {
    width: 80rpx;
    height: 80rpx;
    border-radius: 12rpx;
    margin-right: 20rpx;
    background: #f5f5f5;
}

.record-cover.placeholder {
    background: #eef2f7;
}

.record-info {
    min-width: 0;
    flex: 1;
}

.record-title {
    color: #333;
    font-size: 30rpx;
    font-weight: 600;
}

.record-desc {
    margin-top: 8rpx;
    color: #666;
    font-size: 24rpx;
}

.record-right {
    display: flex;
    align-items: center;
    gap: 16rpx;
}

.burned {
    color: #ef6c00;
    font-size: 26rpx;
    font-weight: 700;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 70rpx 20rpx;
}

.empty-text {
    margin-top: 18rpx;
    color: #999;
    font-size: 28rpx;
}

.growth-card {
    padding: 24rpx;
    background: #fff;
    border-radius: 16rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.growth-top,
.leader-head,
.leader-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.growth-level {
    margin-top: 10rpx;
    color: var(--primary-color);
    font-size: 28rpx;
    font-weight: 700;
}

.points {
    color: #ef6c00;
    font-size: 44rpx;
    font-weight: 800;
}

.points text {
    margin-left: 6rpx;
    font-size: 22rpx;
    font-weight: 500;
}

.growth-grid {
    display: flex;
    gap: 12rpx;
    margin-top: 22rpx;
}

.growth-item {
    flex: 1;
    padding: 18rpx 0;
    border-radius: 12rpx;
    background: #f8f9fa;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.growth-value {
    color: #333;
    font-size: 34rpx;
    font-weight: 700;
}

.growth-label {
    margin-top: 6rpx;
    color: #666;
    font-size: 24rpx;
}

.badge-row {
    display: flex;
    flex-wrap: wrap;
    gap: 10rpx;
    margin-top: 18rpx;
}

.badge {
    padding: 8rpx 18rpx;
    border-radius: 999rpx;
    background: #ecfdf5;
    color: var(--primary-color);
    font-size: 24rpx;
}

.share-btn {
    margin-top: 20rpx;
    border-radius: 12rpx;
    background: var(--primary-color);
    color: #fff;
}

.leader-tabs {
    display: flex;
    gap: 12rpx;
}

.leader-tabs text {
    padding: 8rpx 18rpx;
    border-radius: 999rpx;
    background: #eef2f7;
    color: #666;
    font-size: 24rpx;
}

.leader-tabs text.active {
    background: var(--primary-color);
    color: #fff;
}

.leader-item {
    padding: 18rpx 0;
    border-bottom: 1rpx solid #f0f0f0;
}

.leader-item:last-child {
    border-bottom: none;
}

.rank {
    width: 70rpx;
    color: #ef6c00;
    font-size: 28rpx;
    font-weight: 700;
}

.leader-avatar {
    width: 70rpx;
    height: 70rpx;
    border-radius: 50%;
    margin-right: 16rpx;
    background: #eef2f7;
}

.leader-info {
    flex: 1;
    min-width: 0;
}

.leader-name {
    color: #333;
    font-size: 28rpx;
    font-weight: 600;
}

.leader-desc {
    margin-top: 6rpx;
    color: #666;
    font-size: 24rpx;
}

.leader-points {
    color: var(--primary-color);
    font-size: 28rpx;
    font-weight: 700;
}

.compact {
    padding: 36rpx 20rpx;
}
</style>
