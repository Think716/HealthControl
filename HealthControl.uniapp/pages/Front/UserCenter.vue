<template>
	<view class="user-center-page">
		<!-- 顶部导航栏 -->
		<uni-nav-bar dark :fixed="true" shadow background-color="var(--primary-color)" status-bar title="个人中心" />

		<!-- 用户信息卡片 -->
		<view class="user-info-card" @click="navigateTo('/pages/Front/UserInfoEdit')">
			<view class="user-avatar-container">
				<image class="user-avatar" mode="aspectFill" :src="UserInfo.ImageUrls || defaultHeadImage"></image>
				<view class="user-details">
					<view class="user-name">{{ UserInfo.Name }}</view>
					<view class="user-role">{{ UserInfo.RoleTypeFormat }}</view>
					<view class="user-openid-container">
						<view class="user-openid bound" v-if="UserInfo.OpenId">
							<view class="status-dot bound-dot"></view>
							<text class="status-text">已绑定微信</text>
						</view>
						<view class="user-openid unbound" v-else>
							<view class="status-dot unbound-dot"></view>
							<text class="status-text">未绑定微信</text>
						</view>
					</view>
				</view>
			</view>
			<view class="arrow-icon"></view>
		</view>

		<!-- 功能菜单卡片 -->
		<view class="function-menu-section">
			<uni-card :is-shadow="false" is-full margin="0" padding="0" spacing="0">
				<uni-section class="section-header" title="常用功能" :sub-title="' '" type="line"
					:titleFontSize="28"></uni-section>

				<uni-grid :column="3" :square="true" :showBorder="false">
					<uni-grid-item>
						<view class="menu-item" @click="navigateTo('/pages/Front/UserInfoEdit')">
							<image :src="UserInfoIcon" class="menu-icon"></image>
							<text class="menu-text">个人信息</text>
						</view>
					</uni-grid-item>
					<uni-grid-item>
						<view class="menu-item" @click="navigateTo('/pages/Front/PasswordEdit')">
							<image :src="PasswordEditIcon" class="menu-icon"></image>
							<text class="menu-text">密码修改</text>
						</view>
					</uni-grid-item>
					<uni-grid-item>
						<view class="menu-item" @click="navigateTo('/pages/Front/MyHealthArticleList')">
							<image :src="MyHealthArticleIcon" class="menu-icon"></image>
							<text class="menu-text">我的健康知识</text>
						</view>
					</uni-grid-item>
					<uni-grid-item>
						<view class="menu-item" @click="navigateTo('/pages/Front/MyRecipeList')">
							<image :src="MyRecipeIcon" class="menu-icon"></image>
							<text class="menu-text">我的食谱</text>
						</view>
					</uni-grid-item>
					<uni-grid-item>
						<view class="menu-item" @click="navigateTo('/pages/Front/CollectRecordList')">
							<image :src="CollectRecordListIcon" class="menu-icon"></image>
							<text class="menu-text">收藏记录</text>
						</view>
					</uni-grid-item>
					<uni-grid-item>
						<view class="menu-item" @click="navigateTo('/pages/Front/LikeRecordList')">
							<image :src="LikeRecordListIcon" class="menu-icon"></image>
							<text class="menu-text">点赞记录</text>
						</view>
					</uni-grid-item>
					<uni-grid-item>
						<view class="menu-item" @click="navigateTo('/pages/Front/WeChatBind')">
							<image :src="WeChatBindIcon" class="menu-icon"></image>
							<text class="menu-text">微信绑定</text>
						</view>
					</uni-grid-item>
				</uni-grid>
			</uni-card>
		</view>

		<!-- 退出按钮 -->
		<button class="logout-button" @click="logout">退出</button>

		<footer-bar />
	</view>
</template>

<script setup>
import UserInfoIcon from '@/assets/个人信息.png';
import PasswordEditIcon from '@/assets/密码修改.png';
import MyHealthArticleIcon from '@/assets/健康知识.png';
import userInfoIcon from '@/assets/默认头像.png';
import MyRecipeIcon from '@/assets/食谱.png';
import CollectRecordListIcon from '@/assets/收藏.png';
import LikeRecordListIcon from '@/assets/点赞.png';
import WeChatBindIcon from '@/assets/wx.png';
import { useCommonStore } from '@/store';
import { computed, ref } from 'vue';

import { onLoad } from "@dcloudio/uni-app";

const commonStore = useCommonStore()
const defaultHeadImage = ref(userInfoIcon)

const Token = computed(() => commonStore.Token)
const UserInfo = computed(() => commonStore.UserInfo)
const RoleType = computed(() => commonStore.RoleType)
const UserId = computed(() => commonStore.UserId)

// 页面加载时获取用户信息
onLoad(() => {
	if (commonStore.CheckIsLogin()) {
		setTimeout(() => {
			getUserInfo()
		}, 100)
	}
})

// 方法定义
const getUserInfo = async () => {
	await commonStore.GetInfo()
}

const logout = () => {
	commonStore.Logout()
}

const navigateTo = (url) => {
	uni.navigateTo({
		url: url
	})
}


</script>

<style lang="scss" scoped>
	/* 页面容器，预留底部导航高度，避免退出按钮被遮挡 */
	.user-center-page {
		padding-bottom: calc(220rpx + env(safe-area-inset-bottom));
		box-sizing: border-box;
	}
/* 用户信息卡片样式 */
.user-info-card {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 30rpx 40rpx;
	background-color: #fff;
	margin-bottom: 20rpx;
	border-radius: 0 0 20rpx 20rpx;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.user-avatar-container {
	display: flex;
	align-items: center;
}

.user-avatar {
	width: 120rpx;
	height: 120rpx;
	border-radius: 60rpx;
	border: 4rpx solid #f5f5f5;
}

.user-details {
	margin-left: 24rpx;
}

.user-name {
	font-size: 40rpx;
	font-weight: 600;
	color: #333;
	margin-bottom: 8rpx;
}

.user-role {
	font-size: 26rpx;
	color: #fff;
	background-color: var(--primary-color);
	padding: 4rpx 16rpx;
	border-radius: 20rpx;
	display: inline-block;
}

/* 微信绑定状态样式 */
.user-openid-container {
	margin-top: 8rpx;
}

.user-openid {
	display: flex;
	align-items: center;
	padding: 4rpx 12rpx;
	border-radius: 16rpx;
	display: inline-flex;
}

.user-openid.bound {
	background-color: #e8f5e8;
	border: 1rpx solid #52c41a;
}

.user-openid.unbound {
	background-color: #fff2f0;
	border: 1rpx solid #ff7875;
}

.status-dot {
	width: 12rpx;
	height: 12rpx;
	border-radius: 50%;
	margin-right: 8rpx;
}

.bound-dot {
	background-color: #52c41a;
}

.unbound-dot {
	background-color: #ff7875;
}

.status-text {
	font-size: 24rpx;
	font-weight: 500;
}

.bound .status-text {
	color: #389e0d;
}

.unbound .status-text {
	color: #cf1322;
}

.arrow-icon {
	width: 16rpx;
	height: 16rpx;
	border-top: 3rpx solid #a9acb3;
	border-right: 3rpx solid #a9acb3;
	transform: rotate(45deg);
}

/* 功能菜单区域样式 */
.function-menu-section {
	margin-top: 20rpx;
	border-radius: 20rpx;
	overflow: hidden;
}

.section-header {
	padding: 20rpx 0;
}

.menu-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 20rpx 0;
}

.menu-icon {
	width: 80rpx;
	height: 80rpx;
	margin-bottom: 16rpx;
}

.menu-text {
	font-size: 28rpx;
	color: #666;
}

/* 退出按钮样式 */
.logout-button {
	width: 90%;
	display: block;
	height: 90rpx;
	line-height: 90rpx;
	margin: 60rpx auto;
	background-color: var(--primary-color);
	color: #fff;
	font-size: 32rpx;
	font-weight: 500;
	border-radius: 45rpx;
}

/* 底部间距 */
.bottom-spacer {
	height: 200rpx;
}
</style>