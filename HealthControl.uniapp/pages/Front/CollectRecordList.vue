<template>
    <view>
        <!-- 导航栏 -->
        <uni-nav-bar dark :fixed="true" shadow background-color="var(--primary-color)" status-bar left-icon="left"
            left-text="返回" @clickLeft="goBack" title="收藏记录列表" />

        <!-- Tab切换 -->
        <view class="tab-container">
            <view class="tab-item" :class="{ active: activeTab === '健康知识' }" @click="switchTab('健康知识')">
                健康知识
            </view>
            <view class="tab-item" :class="{ active: activeTab === '食谱' }" @click="switchTab('食谱')">
                食谱
            </view>
        </view>

        <!-- 列表内容 -->
        <view class="list-container">
            <!-- 健康知识列表 -->
            <view v-if="activeTab === '健康知识'" class="content-list">
                <view v-if="healthArticleList.length === 0" class="empty-state">
                    暂无健康知识收藏
                </view>
                <view v-else>
                    <view v-for="item in healthArticleList" :key="item.Id" class="list-item" @click="goToDetail(item)">
                        <!-- 封面图片 -->
                        <image :src="item.HealthArticleDto.Cover" class="item-cover" mode="aspectFill"></image>

                        <!-- 内容信息 -->
                        <view class="item-content">
                            <view class="item-title">{{ item.HealthArticleDto.Title }}</view>
                            <view class="item-meta">
                                <text class="view-count">阅读 {{ item.HealthArticleDto.ViewCount }}</text>
                                <text class="collect-time">{{ formatTime(item.CreationTime) }}</text>
                            </view>
                        </view>

                        <!-- 操作按钮 -->
                        <view class="item-actions">
                            <view class="delete-btn" @click.stop="ShowDeleteModal(item.Id)">删除</view>
                        </view>
                    </view>
                </view>
            </view>

            <!-- 食谱列表 -->
            <view v-if="activeTab === '食谱'" class="content-list">
                <view v-if="recipeList.length === 0" class="empty-state">
                    暂无食谱收藏
                </view>
                <view v-else>
                    <view v-for="item in recipeList" :key="item.Id" class="list-item" @click="goToDetail(item)">
                        <!-- 封面图片 -->
                        <image :src="item.RecipeDto.Cover" class="item-cover" mode="aspectFill"></image>

                        <!-- 内容信息 -->
                        <view class="item-content">
                            <view class="item-title">{{ item.RecipeDto.Title }}</view>
                            <view class="item-meta">
                                <text class="view-count">浏览 {{ item.RecipeDto.ViewCount }}</text>
                                <text class="collect-time">{{ formatTime(item.CreationTime) }}</text>
                            </view>
                        </view>

                        <!-- 操作按钮 -->
                        <view class="item-actions">
                            <view class="delete-btn" @click.stop="ShowDeleteModal(item.Id)">删除</view>
                        </view>
                    </view>
                </view>
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
const CollectRecordList = ref([]); // 修复变量定义
const activeTab = ref('健康知识'); // 当前激活的tab

// 计算属性：根据tab过滤列表数据
const healthArticleList = computed(() => {
    return CollectRecordList.value.filter(item => item.CollectType === '健康知识');
});

const recipeList = computed(() => {
    return CollectRecordList.value.filter(item => item.CollectType === '食谱');
});

const where = reactive({

});

// 生命周期钩子
onLoad(async (option) => {
});
onShow(async () => {
    GetCollectRecordListApi();
});

onReady(async () => {

});

// 方法
const goBack = () => {
    uni.navigateBack();
};

// Tab切换方法
const switchTab = (tab) => {
    activeTab.value = tab;
};

// 获取收藏记录列表
const GetCollectRecordListApi = async () => {
    const { Data } = await Post('/CollectRecord/List', where);
    CollectRecordList.value = Data?.Items || [];
}

// 删除收藏记录
const ShowDeleteModal = async (Id) => {
    uni.showModal({
        title: '提示',
        content: '确认删除该收藏记录吗？',
        success: async (res) => {
            if (res.confirm) {
                const { Success } = await Post(`/CollectRecord/Delete`, { Id: Id });
                if (Success) {
                    await GetCollectRecordListApi();
                    uni.showToast({
                        title: '删除成功',
                        icon: 'success'
                    });
                }
            }
        }
    })
};

// 跳转到详情页
const goToDetail = (item) => {
    if (item.CollectType === '健康知识') {
        uni.navigateTo({
            url: `/pages/Front/HealthArticleDetail?HealthArticleId=${item.RelativeId}`
        });
    } else if (item.CollectType === '食谱') {
        uni.navigateTo({
            url: `/pages/Front/RecipeDetail?RecipeId=${item.RelativeId}`
        });
    }
};

// 时间格式化
const formatTime = (timeStr) => {
    const date = new Date(timeStr);
    const now = new Date();
    const diff = now - date;

    // 计算时间差
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
        return timeStr.split(' ')[0]; // 返回日期部分
    }
};

</script>

<style scoped lang="scss">
/* 页面容器 */
.tab-container {
    position: sticky;
    top: 88rpx;
    /* 导航栏高度 */
    z-index: 99;
    display: flex;
    background-color: #fff;
    border-bottom: 1px solid #eee;
}

/* Tab项样式 */
.tab-item {
    flex: 1;
    text-align: center;
    padding: 30rpx 0;
    font-size: 32rpx;
    color: #666;
    position: relative;
    transition: all 0.3s ease;
}

.tab-item.active {
    color: var(--primary-color, #007aff);
    font-weight: 600;
}

.tab-item.active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 60rpx;
    height: 4rpx;
    background-color: var(--primary-color, #007aff);
    border-radius: 2rpx;
}

/* 列表容器 */
.list-container {}

/* 内容列表 */
.content-list {
    background-color: #fff;
    border-radius: 12rpx;
}

/* 空状态 */
.empty-state {
    text-align: center;
    padding: 120rpx 0;
    color: #999;
    font-size: 28rpx;
}

/* 列表项 */
.list-item {
    display: flex;
    align-items: center;
    padding: 30rpx 20rpx;
    border-bottom: 1px solid #f5f5f5;
    background-color: #fff;
    border-radius: 12rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}

.list-item:hover {
    transform: translateY(-2rpx);
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.15);
}

.list-item:last-child {
    border-bottom: none;
}

/* 封面图片 */
.item-cover {
    width: 120rpx;
    height: 120rpx;
    border-radius: 12rpx;
    margin-right: 20rpx;
    flex-shrink: 0;
}

/* 内容区域 */
.item-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 120rpx;
}

/* 标题 */
.item-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
    line-height: 1.4;
    /* 限制两行显示 */
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* 元信息 */
.item-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10rpx;
}

.view-count {
    font-size: 24rpx;
    color: #999;
}

.collect-time {
    font-size: 24rpx;
    color: #999;
}

/* 操作按钮 */
.item-actions {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-left: 20rpx;
}

.delete-btn {
    padding: 12rpx 24rpx;
    background-color: #ff4757;
    color: #fff;
    font-size: 24rpx;
    border-radius: 20rpx;
    transition: all 0.3s ease;
}

.delete-btn:hover {
    background-color: #ff3742;
    transform: scale(1.05);
}
</style>