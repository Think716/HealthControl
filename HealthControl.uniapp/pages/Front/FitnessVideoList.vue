<template>
    <view class="video-page">
        <uni-nav-bar dark :fixed="true" shadow background-color="var(--primary-color)" status-bar left-icon="left"
            left-text="返回" @clickLeft="goBack" title="AI健身视频推荐" />

        <view class="content">
            <view class="bmi-card">
                <view class="bmi-main">
                    <view>
                        <text class="bmi-label">BMI智能分层</text>
                        <view class="bmi-value">{{ profile.BMI ? Number(profile.BMI).toFixed(2) : '--' }}</view>
                    </view>
                    <view class="bmi-category">{{ profile.BmiCategory || '通用' }}</view>
                </view>
                <view class="health-layer">{{ profile.HealthLayer || '待完善健康数据人群' }}</view>
                <view class="recommendation">{{ profile.Recommendation || '完善身高、体重和BMI记录后，系统会自动生成推荐。' }}</view>
                <button class="record-btn" @click="goHealthRecord">完善BMI数据</button>
            </view>

            <view class="section-head">
                <text class="section-title">推荐训练视频</text>
                <text class="section-subtitle">根据BMI分层匹配</text>
            </view>

            <view v-if="videos.length === 0" class="empty-state">
                <uni-icons type="videocam" size="56" color="#ccc" />
                <text class="empty-text">暂无推荐视频，请联系管理员维护视频数据</text>
            </view>

            <view v-for="video in videos" :key="video.Id" class="video-card">
                <view class="cover-wrap" @click="play(video)">
                    <image v-if="video.Cover" :src="video.Cover" class="cover" mode="aspectFill" />
                    <view v-else class="cover placeholder">
                        <uni-icons type="videocam" size="42" color="#bbb" />
                    </view>
                    <view class="play-mask">▶</view>
                </view>
                <view class="video-info">
                    <view class="title-row">
                        <text class="video-title">{{ video.Title }}</text>
                        <text class="level">{{ video.Level || '入门' }}</text>
                    </view>
                    <view class="meta">
                        <text>{{ video.DurationMinutes || 0 }}分钟</text>
                        <text>{{ video.Calories || 0 }}kcal</text>
                        <text>{{ video.TrainingGoal || '健康训练' }}</text>
                    </view>
                    <view class="reason">{{ video.RecommendReason }}</view>
                    <!-- 展示图 -->
                    <view v-if="video.ImageUrls" class="image-gallery">
                        <image v-for="(url, idx) in video.ImageUrls.split(',')" :key="idx" :src="url" class="gallery-img" mode="aspectFill"
                            @click="previewImages(video.ImageUrls.split(','), idx)" />
                    </view>
                    <view class="desc" v-if="video.Content">
                        <rich-text :nodes="video.Content" />
                    </view>
                </view>
            </view>
        </view>

        <uni-popup ref="videoPopup" type="center">
            <view class="video-popup">
                <video v-if="currentVideo.VideoUrl" :src="currentVideo.VideoUrl" controls autoplay class="player" />
                <view class="popup-title">{{ currentVideo.Title }}</view>
                <button class="close-btn" @click="videoPopup.close()">关闭</button>
            </view>
        </uni-popup>
    </view>
</template>

<script setup>
import { Post } from '@/utils/http';
import { useCommonStore } from '@/store';
import { computed, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';

const commonStore = useCommonStore();
const UserId = computed(() => commonStore.UserId);
const profile = ref({});
const videos = ref([]);
const currentVideo = ref({});
const videoPopup = ref(null);

onShow(async () => {
    await Promise.all([loadProfile(), loadVideos()]);
});

const loadProfile = async () => {
    const res = await Post('/FitnessVideo/BmiProfile', { UserId: UserId.value });
    if (res.Success) profile.value = res.Data || {};
};

const loadVideos = async () => {
    const res = await Post('/FitnessVideo/RecommendList', { UserId: UserId.value, Limit: 10 });
    if (res.Success) videos.value = res.Data || [];
};

const play = (video) => {
    if (!video.VideoUrl) {
        uni.showToast({ title: '视频地址为空', icon: 'none' });
        return;
    }
    currentVideo.value = video;
    videoPopup.value.open();
};

const goHealthRecord = () => {
    uni.navigateTo({ url: '/pages/Front/BatchRecordForm' });
};

const previewImages = (urls, index) => {
    uni.previewImage({ urls, current: index });
};

const goBack = () => uni.navigateBack();
</script>

<style scoped lang="scss">
.video-page {
    min-height: 100vh;
    background: #f8f9fa;
}

.content {
    padding: 20rpx;
    padding-bottom: 60rpx;
}

.bmi-card,
.video-card,
.empty-state {
    background: #fff;
    border-radius: 16rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.bmi-card {
    padding: 28rpx;
}

.bmi-main,
.title-row,
.section-head,
.meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.bmi-label,
.section-subtitle,
.meta,
.desc {
    color: #666;
    font-size: 24rpx;
}

.bmi-value {
    margin-top: 8rpx;
    color: var(--primary-color);
    font-size: 56rpx;
    font-weight: 700;
}

.bmi-category,
.level {
    padding: 8rpx 18rpx;
    border-radius: 999rpx;
    background: #ecfdf5;
    color: var(--primary-color);
    font-size: 24rpx;
    font-weight: 600;
}

.health-layer {
    margin-top: 18rpx;
    color: #333;
    font-size: 30rpx;
    font-weight: 600;
}

.recommendation,
.reason {
    margin-top: 12rpx;
    color: #666;
    font-size: 26rpx;
    line-height: 1.6;
}

.record-btn,
.close-btn {
    margin-top: 20rpx;
    background: var(--primary-color);
    color: #fff;
    border-radius: 12rpx;
}

.section-head {
    margin: 30rpx 4rpx 18rpx;
}

.section-title {
    color: #333;
    font-size: 32rpx;
    font-weight: 700;
}

.video-card {
    margin-bottom: 22rpx;
    overflow: hidden;
}

.cover-wrap {
    position: relative;
    height: 340rpx;
    background: #eef2f7;
}

.cover,
.player {
    width: 100%;
    height: 100%;
}

.placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
}

.play-mask {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 88rpx;
    height: 88rpx;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.45);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40rpx;
}

.video-info {
    padding: 24rpx;
}

.video-title {
    flex: 1;
    min-width: 0;
    color: #333;
    font-size: 32rpx;
    font-weight: 700;
}

.meta {
    justify-content: flex-start;
    gap: 20rpx;
    margin-top: 12rpx;
}

.desc {
    margin-top: 10rpx;
    line-height: 1.5;
}

.image-gallery {
    display: flex;
    gap: 12rpx;
    margin-top: 16rpx;
    overflow-x: auto;
}

.gallery-img {
    flex: 0 0 auto;
    width: 180rpx;
    height: 180rpx;
    border-radius: 12rpx;
    background: #eef2f7;
}

.empty-state {
    padding: 80rpx 30rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.empty-text {
    margin-top: 18rpx;
    color: #999;
    font-size: 28rpx;
}

.video-popup {
    width: 680rpx;
    padding: 20rpx;
    border-radius: 16rpx;
    background: #fff;
}

.player {
    height: 380rpx;
    background: #000;
}

.popup-title {
    margin-top: 16rpx;
    color: #333;
    font-size: 30rpx;
    font-weight: 600;
}
</style>
