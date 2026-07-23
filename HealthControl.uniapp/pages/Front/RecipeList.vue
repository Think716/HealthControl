<template>
    <view>
        <!-- 导航栏 -->
        <uni-nav-bar dark :fixed="true" shadow background-color="var(--primary-color)" status-bar left-icon="left"
            left-text="返回" @clickLeft="goBack" title="食谱列表" />

        <!-- 内容区域 -->
        <view class="content">
            <!-- 搜索栏 -->
            <view class="search-bar">
                <uni-search-bar v-model="searchKeyWord" placeholder="搜索食谱..." @input="handleSearch" />
            </view>

            <!-- 食谱列表 -->
            <view class="recipe-list">
                <view v-for="recipe in RecipeList" :key="recipe.Id" class="recipe-card" @click="goToDetail(recipe.Id)">
                    <!-- 封面图片 -->
                    <view class="recipe-cover">
                        <image :src="recipe.Cover" class="cover-image" mode="aspectFill" />
                        <!-- 浏览量标签 -->
                        <view class="view-count">
                            <uni-icons type="eye" size="14" color="#fff" />
                            <text class="count-text">{{ recipe.ViewCount }}</text>
                        </view>
                    </view>

                    <!-- 食谱信息 -->
                    <view class="recipe-info">
                        <!-- 标题 -->
                        <view class="recipe-title">{{ recipe.Title }}</view>

                        <!-- 描述内容（去除HTML标签） -->
                        <view class="recipe-desc">{{ getPlainText(recipe.Content) }}</view>

                        <!-- 图片列表 -->
                        <view v-if="recipe.imageList && recipe.imageList.length > 0" class="image-list">
                            <image v-for="(img, index) in recipe.imageList" :key="index" :src="img" class="small-image"
                                mode="aspectFill" @click.stop="previewImage(img, recipe.imageList)" />
                        </view>

                        <!-- 底部信息 -->
                        <view class="recipe-bottom">
                            <view class="author-info">
                                <text class="author-name">{{ recipe.PublishUserDto.Name }}</text>
                                <text class="publish-time">{{ formatTime(recipe.CreationTime) }}</text>
                            </view>
                            <view class="status-badge" :class="getStatusClass(recipe.AuditStatus)">
                                {{ recipe.AuditStatusFormat }}
                            </view>
                        </view>
                    </view>
                </view>

                <!-- 空状态 -->
                <view v-if="RecipeList.length === 0" class="empty-state">
                    <uni-icons type="info" size="60" color="#ccc" />
                    <text class="empty-text">暂无食谱数据</text>
                </view>
            </view>

            <!-- 加载更多 -->
            <view v-if="RecipeList.length > 0" class="load-more">
                <uni-load-more :status="loadStatus" />
            </view>
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

// 数据定义
const RecipeList = ref([]);
const searchKeyWord = ref('');
const loadStatus = ref('more'); // more, loading, noMore

const where = reactive({
    KeyWord: ''
});

// 生命周期钩子
onLoad(async (option) => {
});

onShow(async () => {
    GetRecipeListApi();
});

onReady(async () => {
});

// 方法
const goBack = () => {
    uni.navigateBack();
};

// 获取食谱列表
const GetRecipeListApi = async () => {
    try {
        loadStatus.value = 'loading';
        const { Data } = await Post('/Recipe/List', where);
        const Items = Data?.Items || [];

        // 预处理每个食谱的图片列表
        const processedItems = Items.map(recipe => ({
            ...recipe,
            imageList: recipe.ImageUrls ? recipe.ImageUrls.split(',').filter(url => url.trim()).slice(0, 4) : []
        }));

        RecipeList.value = processedItems;
        loadStatus.value = Items.length > 0 ? 'more' : 'noMore';
    } catch (error) {
        console.error('获取食谱列表失败:', error);
        loadStatus.value = 'more';
    }
}

// 搜索处理
const handleSearch = (value) => {
    where.KeyWord = value;
    GetRecipeListApi();
};



// 跳转到详情页
const goToDetail = (id) => {
    uni.navigateTo({
        url: `/pages/Front/RecipeDetail?RecipeId=${id}`
    });
};

// 获取纯文本内容（去除HTML标签）
const getPlainText = (htmlContent) => {
    if (!htmlContent) return '';
    // 简单的HTML标签去除
    return htmlContent.replace(/<[^>]*>/g, '').substring(0, 100) + '...';
};

// 格式化时间
const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const date = new Date(timeStr);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前';
    if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前';
    if (diff < 2592000000) return Math.floor(diff / 86400000) + '天前';

    return timeStr.split(' ')[0]; // 返回日期部分
};

// 获取状态样式类
const getStatusClass = (status) => {
    switch (status) {
        case 1: return 'status-pending';
        case 2: return 'status-approved';
        case 3: return 'status-rejected';
        default: return 'status-pending';
    }
};

// 预览图片
const previewImage = (current, urls) => {
    uni.previewImage({
        current: current,
        urls: urls
    });
};

</script>

<style scoped lang="scss">
/* 页面整体样式 */
.content {
    background-color: #f5f5f5;
    min-height: 100vh;
}

/* 搜索栏样式 */
.search-bar {
    padding: 20rpx;
    background-color: #fff;
    margin-bottom: 20rpx;
}

/* 食谱列表样式 */
.recipe-list {
    padding: 0 20rpx;
}

/* 食谱卡片样式 */
.recipe-card {
    background-color: #fff;
    border-radius: 16rpx;
    margin-bottom: 20rpx;
    overflow: hidden;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;
}

.recipe-card:active {
    transform: scale(0.98);
    /* 点击效果 */
}

/* 封面图片区域 */
.recipe-cover {
    position: relative;
    height: 360rpx;
    overflow: hidden;
}

.cover-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

/* 浏览量标签 */
.view-count {
    position: absolute;
    top: 20rpx;
    right: 20rpx;
    background-color: rgba(0, 0, 0, 0.6);
    padding: 8rpx 16rpx;
    border-radius: 20rpx;
    display: flex;
    align-items: center;
    gap: 8rpx;
}

.count-text {
    color: #fff;
    font-size: 24rpx;
}

/* 食谱信息区域 */
.recipe-info {
    padding: 24rpx;
}

/* 食谱标题 */
.recipe-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 16rpx;
    line-height: 1.4;
}

/* 食谱描述 */
.recipe-desc {
    font-size: 28rpx;
    color: #666;
    line-height: 1.5;
    margin-bottom: 16rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

/* 图片列表样式 */
.image-list {
    display: flex;
    gap: 12rpx;
    margin-bottom: 20rpx;
    overflow-x: auto;
}

.small-image {
    width: 120rpx;
    height: 120rpx;
    border-radius: 12rpx;
    flex-shrink: 0;
    border: 2rpx solid #f0f0f0;
    transition: transform 0.2s ease;
}

.small-image:active {
    transform: scale(0.95);
}

/* 底部信息 */
.recipe-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

/* 作者信息 */
.author-info {
    display: flex;
    flex-direction: column;
    gap: 8rpx;
}

.author-name {
    font-size: 26rpx;
    color: #333;
    font-weight: 500;
}

.publish-time {
    font-size: 24rpx;
    color: #999;
}

/* 状态标签 */
.status-badge {
    padding: 8rpx 16rpx;
    border-radius: 20rpx;
    font-size: 24rpx;
    font-weight: 500;
}

.status-pending {
    background-color: #fff3cd;
    color: #856404;
    border: 1px solid #ffeaa7;
}

.status-approved {
    background-color: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
}

.status-rejected {
    background-color: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
}

/* 空状态样式 */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 120rpx 40rpx;
    color: #999;
}

.empty-text {
    font-size: 28rpx;
    margin-top: 20rpx;
}

/* 加载更多样式 */
.load-more {
    padding: 40rpx 0;
}

/* 响应式适配 */
@media screen and (max-width: 750rpx) {
    .recipe-card {
        margin-bottom: 16rpx;
    }

    .recipe-cover {
        height: 320rpx;
    }

    .recipe-title {
        font-size: 30rpx;
    }

    .recipe-desc {
        font-size: 26rpx;
    }
}
</style>