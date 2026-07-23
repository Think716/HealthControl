<template>
    <view>
        <!-- 导航栏 -->
        <uni-nav-bar dark :fixed="true" shadow background-color="var(--primary-color)" status-bar left-icon="left"
            left-text="返回" @clickLeft="goBack" title="发布健康动态" />

        <view class="publish-content">
            <!-- 动态类型 -->
            <picker :range="postTypes" @change="onTypeChange">
                <view class="picker-row">{{ form.PostType || '选择动态类型' }}</view>
            </picker>

            <!-- 内容输入 -->
            <textarea v-model="form.Content" class="content-input" placeholder="分享健康饮食、减脂打卡、增肌打卡、健身心得..." />

            <!-- 标签选择 -->
            <view class="tag-list">
                <text v-for="tag in tags" :key="tag.Id" class="tag"
                    :class="{ active: selectedTags.includes('#' + tag.Name) }"
                    @click="toggleTag('#' + tag.Name)">#{{ tag.Name }}</text>
            </view>

            <!-- 图片上传 -->
            <view class="images">
                <image v-for="(img, index) in images" :key="img" :src="img" class="image" mode="aspectFill"
                    @click="removeImage(index)" />
                <view class="add-image" v-if="images.length < 9" @click="chooseImages">+</view>
            </view>

            <!-- 提交按钮 -->
            <button class="btn-primary submit-btn" @click="submit">发布</button>
        </view>
    </view>
</template>

<script setup>
import { Post, UploadImageByCamera } from '@/utils/http';
import { useCommonStore } from '@/store';
import { computed, reactive, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';

const commonStore = useCommonStore();
const UserId = computed(() => commonStore.UserId);
const postTypes = ['健康饮食分享', '减脂打卡', '增肌打卡', '健身心得', '健康生活记录', '食谱分享'];
const tags = ref([]);
const selectedTags = ref([]);
const images = ref([]);
const form = reactive({
    PublishUserId: null,
    PostType: '健康生活记录',
    Content: '',
    ImageUrls: '',
    Tags: ''
});

console.log('CommunityForm 页面已加载');
onShow(() => {
    console.log('CommunityForm onShow 触发');
    loadTags();
});

const loadTags = async () => {
    try {
        const res = await Post('/CommunityTag/List', { Page: 1, Limit: 50 });
        console.log('加载标签结果:', res);
        if (res.Success) {
            tags.value = res?.Data?.Items || [];
        } else {
            console.error('加载标签失败:', res.Msg);
            // 使用默认标签作为降级方案
            tags.value = [
                { Id: 1, Name: '健康饮食' },
                { Id: 2, Name: '减脂打卡' },
                { Id: 3, Name: '增肌打卡' }
            ];
        }
    } catch (error) {
        console.error('加载标签异常:', error);
        // 网络错误时使用默认标签
        tags.value = [
            { Id: 1, Name: '健康饮食' },
            { Id: 2, Name: '减脂打卡' },
            { Id: 3, Name: '增肌打卡' }
        ];
    }
};

const onTypeChange = (e) => {
    form.PostType = postTypes[e.detail.value];
};

const toggleTag = (tag) => {
    selectedTags.value = selectedTags.value.includes(tag)
        ? selectedTags.value.filter(item => item !== tag)
        : selectedTags.value.concat(tag);
};

const chooseImages = async () => {
    const files = await UploadImageByCamera(9 - images.value.length);
    images.value = images.value.concat(files).slice(0, 9);
};

const removeImage = (index) => {
    images.value.splice(index, 1);
};

const submit = async () => {
    if (!form.Content.trim()) {
        uni.showToast({ title: '请输入动态内容', icon: 'none' });
        return;
    }
    try {
        console.log('提交表单数据:', {
            ...form,
            PublishUserId: UserId.value,
            ImageUrls: images.value.join(','),
            Tags: selectedTags.value.join(',')
        });
        const res = await Post('/CommunityPost/CreateOrEdit', {
            ...form,
            PublishUserId: UserId.value,
            ImageUrls: images.value.join(','),
            Tags: selectedTags.value.join(',')
        });
        console.log('提交结果:', res);
        if (res.Success) {
            uni.showToast({ title: '发布成功，等待审核', icon: 'success' });
            setTimeout(() => uni.navigateBack(), 800);
        } else {
            uni.showToast({ title: res.Msg || '发布失败', icon: 'none' });
        }
    } catch (error) {
        console.error('提交异常:', error);
        uni.showToast({ title: '网络请求失败', icon: 'none' });
    }
};

const goBack = () => {
    const pages = getCurrentPages();
    if (pages.length > 1) {
        uni.navigateBack();
    } else {
        uni.switchTab({ url: '/pages/Front/Index' });
    }
};
</script>

<style scoped lang="scss">
.publish-content {
    padding: 30upx;
    min-height: calc(100vh - 60px); /* 减去导航栏高度 */
    background-color: #fff; /* 确保有白色背景 */
}

.picker-row {
    padding: 24upx 30upx;
    background-color: #ecfdf5;
    border-radius: 12upx;
    color: var(--primary-dark, #065f46);
    font-size: 28upx;
}

.content-input {
    width: 100%;
    height: 280upx;
    box-sizing: border-box;
    margin-top: 20upx;
    padding: 20upx;
    border-radius: 12upx;
    background: var(--bg-color-light, #f9fafb);
    color: #333;
    font-size: 28upx;
}

.tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 14upx;
    margin-top: 20upx;
}

.tag {
    padding: 16upx 32upx;
    background-color: #f8f8f8;
    border-radius: 40upx;
    color: #666;
    font-size: 28upx;
    transition: all 0.3s ease;

    &.active {
        background-color: var(--primary-color, #10b981);
        color: #fff;
    }
}

.images {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12upx;
    margin-top: 22upx;
}

.image,
.add-image {
    width: 100%;
    height: 190upx;
    border-radius: 12upx;
}

.add-image {
    background-color: #f3f4f6;
    color: #999;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 54upx;
}

.submit-btn {
    margin-top: 28upx;
    width: 100%;
    border-radius: 12upx;
    font-size: 30upx;
}
</style>
