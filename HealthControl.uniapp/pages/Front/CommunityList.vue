<template>
    <view class="community-page">
        <!-- 导航栏 -->
        <uni-nav-bar dark :fixed="true" shadow background-color="var(--primary-color)" status-bar left-icon="left"
            left-text="返回" @clickLeft="goBack" title="健康动态社区" />

        <!-- 标签筛选 -->
        <view class="tag-filter">
            <scroll-view scroll-x class="tag-scroll">
                <view class="tag-list">
                    <view class="tag-item" :class="{ active: where.Tag === '' }" @click="selectTag('')">全部</view>
                    <view v-for="tag in tags" :key="tag.Id" class="tag-item"
                        :class="{ active: where.Tag === '#' + tag.Name }" @click="selectTag('#' + tag.Name)">
                        #{{ tag.Name }}
                    </view>
                </view>
            </scroll-view>
        </view>

        <!-- 帖子列表 -->
        <scroll-view scroll-y class="post-scroll" @scrolltolower="loadMore">
            <view v-for="post in posts" :key="post.Id" class="post-card">
                <!-- 用户信息 -->
                <view class="post-user">
                    <image class="avatar" :src="post.PublishUserDto?.ImageUrls || defaultAvatar" mode="aspectFill" />
                    <view class="user-meta">
                        <text class="name">{{ post.PublishUserDto?.Name || post.PublishUserDto?.UserName || '健康用户' }}</text>
                        <text class="time">{{ post.CreationTime }}</text>
                    </view>
                    <text class="status" v-if="post.AuditStatus === 1">待审核</text>
                </view>

                <!-- 帖子类型 -->
                <text class="post-type">{{ post.PostType || '健康生活记录' }}</text>

                <!-- 内容 -->
                <text class="content">{{ post.Content }}</text>

                <!-- 图片 -->
                <view class="image-grid" v-if="splitImages(post.ImageUrls).length">
                    <image v-for="(img, index) in splitImages(post.ImageUrls)" :key="index" :src="img" class="post-image"
                        mode="aspectFill" @click="preview(post.ImageUrls, index)" />
                </view>

                <!-- 标签 -->
                <view class="tags" v-if="post.Tags">
                    <text v-for="tag in splitTags(post.Tags)" :key="tag" class="post-tag">{{ tag }}</text>
                </view>

                <!-- AI点评 -->
                <view class="ai-comment" v-if="post.AiComment">
                    <text>{{ post.AiComment }}</text>
                </view>

                <!-- 操作栏 -->
                <view class="actions">
                    <view class="action-item" @click="toggleLike(post)">
                        <text class="action-icon" :style="{ color: likeStatuses[post.Id] ? '#ef4444' : '#999' }">
                            {{ likeStatuses[post.Id] ? '♥' : '♡' }}
                        </text>
                        <text>{{ post.LikeCount || 0 }}</text>
                    </view>
                    <view class="action-item" @click="toggleCollect(post)">
                        <text class="action-icon" :style="{ color: collectStatuses[post.Id] ? '#f59e0b' : '#999' }">
                            {{ collectStatuses[post.Id] ? '★' : '☆' }}
                        </text>
                        <text>{{ post.CollectCount || 0 }}</text>
                    </view>
                    <view class="action-item" @click="openComment(post)">
                        <uni-icons type="chat" size="18" color="#999" />
                        <text>{{ post.CommentCount || 0 }}</text>
                    </view>
                    <text class="action-item" @click="report(post)">举报</text>
                    <text v-if="post.PublishUserId === UserId" class="danger" @click="removePost(post)">删除</text>
                </view>

                <!-- 评论 -->
                <view class="comments" v-if="post.Comments && post.Comments.length">
                    <view v-for="comment in post.Comments" :key="comment.Id" class="comment">
                        <text class="comment-name">{{ comment.CommentUserDto?.Name || comment.CommentUserDto?.UserName || '用户' }}：</text>
                        <text>{{ comment.Content }}</text>
                    </view>
                </view>
            </view>

            <!-- 空状态 -->
            <view class="empty-state" v-if="!posts.length">
                <uni-icons type="info" size="48" color="#ccc" />
                <text class="empty-text">暂无动态，来发布第一条健康记录吧</text>
            </view>
        </scroll-view>

        <!-- 发布按钮 -->
        <view class="fab" @click="goPublish">+</view>

        <!-- 评论弹窗 -->
        <uni-popup ref="commentPopup" type="bottom">
            <view class="comment-panel">
                <textarea v-model="commentText" class="comment-input" placeholder="写下你的评论" />
                <button class="comment-submit" @click="submitComment">发送评论</button>
            </view>
        </uni-popup>
    </view>
</template>

<script setup>
import defaultAvatar from '@/assets/默认头像.png';
import { Post } from '@/utils/http';
import { useCommonStore } from '@/store';
import { computed, reactive, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';

const commonStore = useCommonStore();
const UserId = computed(() => commonStore.UserId);
const posts = ref([]);
const tags = ref([]);
const page = ref(1);
const finished = ref(false);
const commentPopup = ref(null);
const activePost = ref(null);
const commentText = ref('');
const where = reactive({ Tag: '' });
const likeStatuses = reactive({});
const collectStatuses = reactive({});

onShow(async () => {
    page.value = 1;
    finished.value = false;
    await Promise.all([loadTags(), loadPosts(true)]);
});

const loadTags = async () => {
    try {
        const res = await Post('/CommunityTag/List', { Page: 1, Limit: 50 });
        console.log('加载标签结果:', res);
        if (res.Success) {
            tags.value = res?.Data?.Items || [];
        } else {
            console.error('加载标签失败:', res.Msg);
        }
    } catch (error) {
        console.error('加载标签异常:', error);
    }
};

const loadPosts = async (reset = false) => {
    if (finished.value && !reset) return;
    try {
        const res = await Post('/CommunityPost/List', {
            Page: page.value,
            Limit: 10,
            Tag: where.Tag,
            Status: 1
        });
        console.log('加载帖子结果:', res);
        if (res.Success) {
            const items = res?.Data?.Items || [];
            items.forEach(item => {
                if (item.Id != null) {
                    likeStatuses[item.Id] = item.Liked || false;
                    collectStatuses[item.Id] = item.Collected || false;
                }
            });
            posts.value = reset ? items : posts.value.concat(items);
            finished.value = items.length < 10;
        } else {
            console.error('加载帖子失败:', res.Msg);
            uni.showToast({ title: res.Msg || '加载数据失败', icon: 'none' });
        }
    } catch (error) {
        console.error('加载帖子异常:', error);
        uni.showToast({ title: '网络请求失败', icon: 'none' });
    }
};

const loadMore = async () => {
    if (finished.value) return;
    page.value += 1;
    await loadPosts();
};

const selectTag = async (tag) => {
    where.Tag = tag;
    page.value = 1;
    finished.value = false;
    await loadPosts(true);
};

const splitImages = (value) => value ? value.split(',').filter(Boolean) : [];
const splitTags = (value) => value ? value.split(',').filter(Boolean) : [];
const preview = (images, index) => uni.previewImage({ urls: splitImages(images), current: index });
const goBack = () => {
    const pages = getCurrentPages();
    if (pages.length > 1) {
        uni.navigateBack();
    } else {
        uni.redirectTo({ url: '/pages/Front/Index' });
    }
};
const goPublish = () => uni.navigateTo({ url: '/pages/Front/CommunityForm' });

const toggleLike = async (post) => {
    const res = await Post('/CommunityPost/ToggleLike', { UserId: UserId.value, PostId: post.Id });
    const liked = res?.Data?.Liked ?? !likeStatuses[post.Id];
    likeStatuses[post.Id] = liked;
    post.LikeCount = res?.Data?.LikeCount ?? post.LikeCount;
};

const toggleCollect = async (post) => {
    const res = await Post('/CommunityPost/ToggleCollect', { UserId: UserId.value, PostId: post.Id });
    const collected = res?.Data?.Collected ?? !collectStatuses[post.Id];
    collectStatuses[post.Id] = collected;
    post.CollectCount = res?.Data?.CollectCount ?? post.CollectCount;
};

const openComment = (post) => {
    activePost.value = post;
    commentText.value = '';
    commentPopup.value.open();
};

const submitComment = async () => {
    if (!commentText.value.trim()) {
        uni.showToast({ title: '请输入评论内容', icon: 'none' });
        return;
    }
    await Post('/CommunityPost/Comment', {
        PostId: activePost.value.Id,
        CommentUserId: UserId.value,
        Content: commentText.value
    });
    commentPopup.value.close();
    await loadPosts(true);
};

const report = async (post) => {
    const res = await uni.showActionSheet({ itemList: ['广告', '违规内容', '恶意信息'] });
    const reasons = ['广告', '违规内容', '恶意信息'];
    await Post('/CommunityPost/Report', { PostId: post.Id, ReportUserId: UserId.value, Reason: reasons[res.tapIndex] });
    uni.showToast({ title: '已提交举报', icon: 'success' });
};

const removePost = async (post) => {
    await Post('/CommunityPost/Delete', { Id: post.Id });
    posts.value = posts.value.filter(item => item.Id !== post.Id);
};
</script>

<style scoped lang="scss">
.community-page {
    min-height: 100vh;
    background-color: var(--bg-color-grey, #f8fffe);
    display: flex;
    flex-direction: column;
}

/* 标签筛选区域 */
.tag-filter {
    background-color: #fff;
    padding: 30upx 0;
}

.tag-scroll {
    white-space: nowrap;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;

    &::-webkit-scrollbar {
        display: none;
    }
}

.tag-list {
    display: flex;
    padding: 0 30upx;
}

.tag-item {
    flex-shrink: 0;
    padding: 16upx 32upx;
    margin-right: 20upx;
    background-color: #f8f8f8;
    border-radius: 40upx;
    font-size: 28upx;
    color: #666;
    transition: all 0.3s ease;

    &.active {
        background-color: var(--primary-color, #10b981);
        color: #fff;
    }

    &:last-child {
        margin-right: 30upx;
    }
}

/* 帖子列表区域 */
.post-scroll {
    flex: 1;
    min-height: 0;
    padding: 30upx;
    box-sizing: border-box;
}

.post-card {
    background-color: #fff;
    border-radius: 24upx;
    padding: 30upx;
    margin-bottom: 30upx;
    box-shadow: 0 4upx 16upx rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease;

    &:active {
        transform: scale(0.98);
    }
}

/* 用户信息 */
.post-user {
    display: flex;
    align-items: center;
    gap: 16upx;
}

.avatar {
    width: 72upx;
    height: 72upx;
    border-radius: var(--border-radius-circle, 50%);
}

.user-meta {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.name {
    color: #333;
    font-size: 28upx;
    font-weight: 600;
}

.time,
.status {
    color: #999;
    font-size: 22upx;
}

/* 帖子类型 */
.post-type {
    display: inline-flex;
    margin: 18upx 0 10upx;
    color: var(--primary-color, #10b981);
    font-size: 24upx;
}

/* 内容 */
.content {
    display: block;
    color: #333;
    font-size: 28upx;
    line-height: 1.6;
}

/* 图片网格 */
.image-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10upx;
    margin-top: 16upx;
}

.post-image {
    width: 100%;
    height: 190upx;
    border-radius: 10upx;
}

/* 标签 */
.tags {
    display: flex;
    flex-wrap: wrap;
    gap: 10upx;
    margin-top: 16upx;
}

.post-tag {
    padding: 8upx 16upx;
    background-color: #f0f0f0;
    border-radius: 16upx;
    color: var(--primary-color, #10b981);
    font-size: 24upx;
}

/* AI点评 */
.ai-comment {
    margin-top: 16upx;
    padding: 14upx;
    border-radius: 12upx;
    background-color: #ecfdf5;
    color: var(--primary-dark, #065f46);
    font-size: 24upx;
}

/* 操作栏 */
.actions {
    display: flex;
    gap: 24upx;
    margin-top: 18upx;
    font-size: 24upx;
}

.action-item {
    display: flex;
    align-items: center;
    gap: 6upx;
    color: #999;
    font-size: 24upx;
}

.action-icon {
    font-size: 28upx;
    line-height: 1;
}

.danger {
    color: #ef4444;
}

/* 评论区域 */
.comments {
    margin-top: 16upx;
    padding-top: 12upx;
    border-top: 1upx solid #f3f4f6;
}

.comment {
    margin-top: 8upx;
    color: #666;
    font-size: 24upx;
}

.comment-name {
    color: #333;
    font-weight: 600;
}

/* 空状态 */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 120upx 40upx;

    .empty-text {
        margin-top: 30upx;
        font-size: 28upx;
        color: #999;
    }
}

/* 发布按钮 */
.fab {
    position: fixed;
    right: 34upx;
    bottom: 52upx;
    width: 96upx;
    height: 96upx;
    border-radius: var(--border-radius-circle, 50%);
    background-color: var(--primary-color, #10b981);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 56upx;
    box-shadow: 0 8upx 24upx rgba(16, 185, 129, 0.35);
    transition: transform 0.2s ease;

    &:active {
        transform: scale(0.9);
    }
}

/* 评论弹窗 */
.comment-panel {
    padding: 24upx;
    background: #fff;
}

.comment-input {
    width: 100%;
    height: 180upx;
    box-sizing: border-box;
    padding: 18upx;
    border-radius: 12upx;
    background: var(--bg-color-light, #f9fafb);
    color: #333;
    font-size: 28upx;
}

.comment-submit {
    margin-top: 16upx;
    background-color: var(--primary-color, #10b981);
    color: #fff;
}
</style>
