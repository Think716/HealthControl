<template>
    <view class="page-container">
        <!-- 顶部导航栏 -->
        <uni-nav-bar dark :fixed="true" shadow background-color="var(--primary-color)" status-bar title="健康管理" />

        <!-- 页面内容 -->
        <view class="content-wrapper">
            <!-- 欢迎横幅 -->
            <view class="welcome-banner">
                <view class="banner-content">
                    <view class="welcome-info">
                        <text class="welcome-title">您好，欢迎回来！</text>
                        <text class="welcome-subtitle">让我们一起关注您的健康</text>
                    </view>
                    <view class="health-icon">
                        <text class="icon">🏥</text>
                    </view>
                </view>
            </view>

            <!-- 健康数据概览 -->
            <view class="health-overview">
                <view class="section-title">
                    <text class="title-text">今日健康概览</text>
                    <text class="more-text" @click="ToHealthRecordList()">查看更多 </text>
                </view>
                <swiper class="overview-swiper" :indicator-dots="healthPages.length > 1" indicator-color="rgba(0, 0, 0, .3)"
                    indicator-active-color="var(--primary-color)" :autoplay="false" :circular="false">
                    <swiper-item v-for="(page, pageIndex) in healthPages" :key="pageIndex" class="swiper-page">
                        <view class="overview-grid">
                            <!-- 显示当前页的健康数据 -->
                            <view v-for="record in page" :key="record.HealthIndicatorDto.Id" class="overview-card"
                                :class="{ 'abnormal': record.IsAbnormity === 'Y' }" @click="ToHealthRecordList()">
                                <view class="card-icon">
                                    <image v-if="record.HealthIndicatorDto.Cover" :src="record.HealthIndicatorDto.Cover"
                                        class="icon-image" mode="aspectFit" />
                                    <text v-else class="default-icon">📊</text>
                                </view>
                                <text class="card-label">{{ record.HealthIndicatorDto.Name }}</text>
                                <text class="card-value">{{ formatRecordValue(record.RecordValue) }}</text>
                                <text class="card-unit">{{ getHealthIndicatorUnit(record.HealthIndicatorDto.Name) }}</text>
                                <!-- 异常状态提示 -->
                                <view v-if="record.IsAbnormity === 'Y'" class="abnormal-tag">
                                    <text class="abnormal-text">异常</text>
                                </view>
                            </view>

                            <!-- 填充空白卡片，确保4宫格布局 -->
                            <view v-for="n in (4 - page.length)" :key="'empty-' + pageIndex + '-' + n"
                                class="overview-card empty-card" @click="ToHealthRecordList()">
                                <view class="card-icon">
                                    <text class="default-icon">➕</text>
                                </view>
                                <text class="card-label">添加记录</text>
                                <text class="card-desc">点击记录健康数据</text>
                            </view>
                        </view>
                    </swiper-item>

                    <!-- 没有数据时显示占位页面 -->
                    <swiper-item v-if="todayRecordList.length === 0" class="swiper-page">
                        <view class="overview-grid">
                            <view class="overview-card empty-card" v-for="n in 4" :key="'placeholder-' + n"
                                @click="ToHealthRecordList()">
                                <view class="card-icon">
                                    <text class="default-icon">📊</text>
                                </view>
                                <text class="card-label">暂无数据</text>
                                <text class="card-desc">点击记录健康数据</text>
                            </view>
                        </view>
                    </swiper-item>
                </swiper>
            </view>

            <!-- 快捷功能 -->
            <view class="quick-actions">
                <view class="section-title">
                    <text class="title-text">快捷功能</text>
                </view>
                <view class="action-grid">
                    <view class="action-item" @click="ToHealthRecordList()">
                        <view class="action-icon record">📊</view>
                        <text class="action-label">健康记录</text>
                    </view>
                    <view class="action-item" @click="ToHealthView()">
                        <view class="action-icon health-view">📈</view>
                        <text class="action-label">健康视图</text>
                    </view>
                    <view class="action-item" @click="ToAiAnalyse()">
                        <view class="action-icon ai-analyse">🤖</view>
                        <text class="action-label">AI分析</text>
                    </view>
                    <view class="action-item" @click="ToDietRecordList()">
                        <view class="action-icon diet">🍎</view>
                        <text class="action-label">饮食记录</text>
                    </view>

                    <view class="action-item" @click="ToHealthNoticeList()">
                        <view class="action-icon reminder">⏰</view>
                        <text class="action-label">健康提醒</text>
                    </view>
                    <view class="action-item" @click="ToHealthArticleList()">
                        <view class="action-icon article">📖</view>
                        <text class="action-label">健康知识</text>
                    </view>
                    <view class="action-item" @click="ToRecipeList()">
                        <view class="action-icon recipe">🥗</view>
                        <text class="action-label">健康食谱</text>
                    </view>
                </view>
            </view>

            <!-- 最新健康资讯 -->
            <view class="health-news">
                <view class="section-title">
                    <text class="title-text">健康资讯</text>
                    <text class="more-text" @click="ToHealthArticleList()">查看更多 </text>
                </view>
                <view class="news-list">
                    <!-- 显示真实的健康资讯数据 -->
                    <view class="news-item" v-for="article in healthArticleList" :key="article.Id"
                        @click="ToHealthArticleDetail(article.Id)">
                        <view class="news-content">
                            <text class="news-title">{{ article.Title }}</text>
                            <text class="news-desc">{{ getArticleDesc(article.Content) }}</text>
                            <view class="news-meta">
                                <text class="news-time">{{ formatTime(article.CreationTime) }}</text>
                                <text class="news-category">{{ article.HealthArticleTypeDto.Name }}</text>
                                <text class="news-views">{{ article.ViewCount }}阅读</text>
                            </view>
                        </view>
                        <view class="news-image">
                            <image v-if="article.Cover" :src="article.Cover" class="cover-image" mode="aspectFill" />
                            <text v-else class="placeholder-icon">📖</text>
                        </view>
                    </view>

                    <!-- 没有数据时显示占位内容 -->
                    <view v-if="healthArticleList.length === 0" class="no-data">
                        <text class="no-data-text">暂无健康资讯</text>
                    </view>
                </view>
            </view>
        </view>

        <!-- 底部导航栏 -->
        <footer-bar />
    </view>
</template>

<script setup>
import { useCommonStore } from "@/store";
import { Post } from "@/utils/http";
import { onHide, onLoad, onShow, onUnload } from "@dcloudio/uni-app";
import { computed, ref } from 'vue';


// 获取store
const commonStore = useCommonStore();
const Token = computed(() => commonStore.Token)
const UserInfo = computed(() => commonStore.UserInfo)
const RoleType = computed(() => commonStore.RoleType)
const UserId = computed(() => commonStore.UserId)

const todayRecordList = ref([]);
const TodayRecordListApi = async () => {
    let {
        Data
    } = await Post('/HealthIndicatorRecord/TodayRecordList', {
        RecordUserId: UserId.value
    });
    todayRecordList.value = Data;
};


// 健康资讯数据状态
const healthArticleList = ref([]);

// 健康数据分页处理
const healthPages = computed(() => {
    if (todayRecordList.value.length === 0) return [];

    const pages = [];
    const pageSize = 4; // 每页4个卡片

    for (let i = 0; i < todayRecordList.value.length; i += pageSize) {
        pages.push(todayRecordList.value.slice(i, i + pageSize));
    }

    return pages;
});


const ToDietRecordList = () => {
    uni.navigateTo({
        url: '/pages/Front/DietRecordList'
    });
};
const ToSportRecord = () => {
    uni.navigateTo({
        url: '/pages/Front/SportRecordList'
    });
};

const ToHealthRecordList = () => {
    uni.navigateTo({
        url: '/pages/Front/HealthIndicatorRecordList'
    });
};

const ToHealthArticleList = () => {
    uni.navigateTo({
        url: '/pages/Front/HealthArticleList'
    });
};

// 跳转到健康文章详情
const ToHealthArticleDetail = (articleId) => {
    uni.navigateTo({
        url: `/pages/Front/HealthArticleDetail?HealthArticleId=${articleId}`
    });
};

const ToRecipeList = () => {
    uni.navigateTo({
        url: '/pages/Front/RecipeList'
    });
};
const ToHealthNoticeList = () => {
    uni.navigateTo({
        url: '/pages/Front/HealthNoticeList'
    });
};

// 跳转到健康视图
const ToHealthView = () => {
    uni.navigateTo({
        url: '/pages/Front/HealthView'
    });
};

const ToAiAnalyse = () => {
    uni.navigateTo({
        url: '/pages/Front/AiAnalyse'
    });
};

// 提取文章描述（去除HTML标签，截取前50个字符）
const getArticleDesc = (content) => {
    if (!content) return '暂无描述';
    // 去除HTML标签
    const plainText = content.replace(/<[^>]*>/g, '');
    // 截取前50个字符
    return plainText.length > 50 ? plainText.substring(0, 50) + '...' : plainText;
};

// 格式化时间显示
const formatTime = (timeStr) => {
    if (!timeStr) return '';

    const now = new Date();
    const articleTime = new Date(timeStr);
    const diff = now - articleTime;

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
        return minutes <= 0 ? '刚刚' : `${minutes}分钟前`;
    } else if (hours < 24) {
        return `${hours}小时前`;
    } else if (days < 7) {
        return `${days}天前`;
    } else {
        // 超过7天显示具体日期
        return articleTime.toLocaleDateString('zh-CN', {
            month: '2-digit',
            day: '2-digit'
        });
    }
};

// 格式化健康记录数值显示
const formatRecordValue = (value) => {
    if (value === null || value === undefined) return '--';
    // 如果是整数，直接显示；如果是小数，保留1位小数
    return Number(value) % 1 === 0 ? value.toString() : Number(value).toFixed(1);
};

// 根据健康指标名称获取单位
const getHealthIndicatorUnit = (name) => {
    const unitMap = {
        '体温': '℃',
        '体重': 'kg',
        '身高': 'cm',
        '心率': '次/分',
        '血压': 'mmHg',
        '空腹血糖': 'mmol/L',
        '餐后2小时血糖': 'mmol/L',
        '血糖': 'mmol/L',
        '胆固醇': 'mmol/L',
        '血红蛋白': 'g/L',
        '白细胞': '×10⁹/L',
        '血小板': '×10⁹/L'
    };

    // 模糊匹配，包含关键字即可
    for (const [key, unit] of Object.entries(unitMap)) {
        if (name && name.includes(key)) {
            return unit;
        }
    }

    return ''; // 默认无单位
};
// 获取健康知识列表
const GetHealthArticleListApi = async () => {
    try {
        const response = await Post('/HealthArticle/List', {
            Page: 1,
            Limit: 6, // 首页只显示2条最新资讯
            AuditStatus: 2,
            SortItem: {
                FieldName: "ViewCount",
                IsAsc: false
            }
        });
        if (response.Success && response.Data && response.Data.Items) {
            healthArticleList.value = response.Data.Items;
        }
    } catch (error) {
        console.error('获取健康知识列表失败:', error);
        uni.showToast({
            title: '获取数据失败',
            icon: 'error'
        });
    }
};
onLoad(() => {

});

onShow(() => {
    if (commonStore.CheckIsLogin()) {
        setTimeout(() => {
            GetHealthArticleListApi();
            TodayRecordListApi();
        }, 300);
    }
});

onHide(() => {

});

onUnload(() => {

});
</script>

<style scoped lang="scss">
/* 页面容器 */
.page-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #f8fffe 0%, #ecfdf5 100%);
}

/* 内容包装器 */
.content-wrapper {
    padding: 20upx;
    padding-bottom: 140upx;
    /* 给底部导航留出空间 */
}

/* 欢迎横幅 */
.welcome-banner {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%);
    border-radius: var(--border-radius-lg);
    margin-bottom: var(--spacing-base);
    box-shadow: var(--box-shadow-base);
}

.banner-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-lg);
}

.welcome-info {
    display: flex;
    flex-direction: column;
}

.welcome-title {
    color: white;
    font-size: var(--font-size-lg);
    font-weight: 600;
    margin-bottom: var(--spacing-xs);
}

.welcome-subtitle {
    color: rgba(255, 255, 255, 0.9);
    font-size: var(--font-size-base);
}

.health-icon {
    .icon {
        font-size: 60upx;
    }
}

/* 健康概览 */
.health-overview {
    margin-bottom: var(--spacing-base);
}

.section-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-base);
    padding: 0 var(--spacing-xs);
}

.title-text {
    font-size: var(--font-size-md);
    font-weight: 600;
    color: var(--text-color);
}

.more-text {
    font-size: var(--font-size-sm);
    color: var(--primary-color);
}

/* Swiper 容器样式 */
.overview-swiper {
    width: 100%;
    height: 520upx;
}

.swiper-page {
    padding: 0 var(--spacing-xs);
}

/* 4宫格布局 */
.overview-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(2, 1fr);
    gap: var(--spacing-base);
    height: 300upx;
}

.overview-card {
    background: white;
    border-radius: var(--border-radius-base);
    padding: var(--spacing-base);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    box-shadow: var(--box-shadow-sm);
    transition: var(--transition-base);
    position: relative;
    cursor: pointer;
}

/* 异常状态卡片样式 */
.overview-card.abnormal {
    border: 2upx solid #ff4757;
    background: linear-gradient(135deg, #fff 0%, #fff5f5 100%);
}

.overview-card:active {
    transform: scale(0.98);
}

.card-icon {
    font-size: 48upx;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60upx;
    height: 60upx;
    flex-shrink: 0;
}

/* 图标图片样式 */
.icon-image {
    width: 48upx;
    height: 48upx;
}

/* 默认图标样式 */
.default-icon {
    font-size: 48upx;
}

.card-label {
    font-size: var(--font-size-sm);
    color: var(--text-color-light);
    text-align: center;
    flex-shrink: 0;
}

.card-value {
    font-size: var(--font-size-lg);
    font-weight: 600;
    color: var(--text-color);
    text-align: center;
    flex-shrink: 0;
}

.card-unit {
    font-size: var(--font-size-xs);
    color: var(--text-color-lighter);
    text-align: center;
    flex-shrink: 0;
}

/* 异常状态标签 */
.abnormal-tag {
    position: absolute;
    top: 8upx;
    right: 8upx;
    background: #ff4757;
    border-radius: 8upx;
    padding: 2upx 6upx;
}

.abnormal-text {
    color: white;
    font-size: 20upx;
    font-weight: 500;
}

/* 空卡片样式 */
.empty-card {
    background: white;
    border: 2upx dashed var(--border-color-light);
    opacity: 0.8;
}

.empty-card:hover {
    opacity: 1;
    border-color: var(--primary-color);
}

.empty-card .default-icon {
    color: var(--text-color-lighter);
}

.empty-card .card-label {
    color: var(--text-color-light);
}

.card-desc {
    font-size: var(--font-size-xs);
    color: var(--text-color-lighter);
    text-align: center;
    flex-shrink: 0;
}

/* 快捷功能 */
.quick-actions {
    margin-bottom: var(--spacing-base);
}

.action-grid {
    background: white;
    border-radius: var(--border-radius-base);
    padding: var(--spacing-base);
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--spacing-lg);
    box-shadow: var(--box-shadow-sm);
}

.action-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    transition: var(--transition-base);
}

.action-item:active {
    transform: scale(0.95);
}

.action-icon {
    width: 80upx;
    height: 80upx;
    border-radius: var(--border-radius-circle);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40upx;
    margin-bottom: var(--spacing-xs);
    background: var(--bg-color-light);
}

.action-label {
    font-size: var(--font-size-sm);
    color: var(--text-color);
    text-align: center;
}

/* 健康资讯 */
.health-news {
    margin-bottom: var(--spacing-base);
}

.news-list {
    background: white;
    border-radius: var(--border-radius-base);
    overflow: hidden;
    box-shadow: var(--box-shadow-sm);
}

.news-item {
    display: flex;
    padding: var(--spacing-base);
    border-bottom: 1upx solid var(--border-color-light);
    transition: var(--transition-base);
}

.news-item:last-child {
    border-bottom: none;
}

.news-item:active {
    background-color: var(--bg-color-hover);
}

.news-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    margin-right: var(--spacing-base);
}

.news-title {
    font-size: var(--font-size-base);
    color: var(--text-color);
    font-weight: 500;
    margin-bottom: var(--spacing-xs);
}

.news-desc {
    font-size: var(--font-size-sm);
    color: var(--text-color-light);
    margin-bottom: var(--spacing-xs);
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

/* 文章元信息容器 */
.news-meta {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
}

.news-time {
    font-size: var(--font-size-xs);
    color: var(--text-color-lighter);
}

.news-category {
    font-size: var(--font-size-xs);
    color: var(--primary-color);
    background: var(--primary-color-light);
    padding: 2upx 8upx;
    border-radius: 8upx;
}

.news-views {
    font-size: var(--font-size-xs);
    color: var(--text-color-lighter);
}

.news-image {
    width: 120upx;
    height: 80upx;
    border-radius: var(--border-radius-sm);
    background: var(--bg-color-light);
    display: flex;
    align-items: center;
    justify-content: center;
}

.placeholder-icon {
    font-size: 40upx;
}

/* 封面图片样式 */
.cover-image {
    width: 100%;
    height: 100%;
    border-radius: var(--border-radius-sm);
}

/* 无数据状态样式 */
.no-data {
    padding: var(--spacing-xl);
    text-align: center;
}

.no-data-text {
    font-size: var(--font-size-sm);
    color: var(--text-color-lighter);
}
</style>