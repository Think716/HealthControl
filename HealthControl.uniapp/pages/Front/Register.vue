<template>
	<view class="login-container">
		<!-- 背景装饰 -->
		<view class="bg-decoration">
			<view class="circle circle-1"></view>
			<view class="circle circle-2"></view>
			<view class="circle circle-3"></view>
		</view>

		<!-- Logo区域 -->
		<view class="logo-area">
			<image class="logo animate-float" src="/static/logo.png" mode="aspectFit"></image>
			<text class="welcome-text animate-fade-in">欢迎注册</text>
			<text class="slogan animate-fade-in-delay">加入健康管理，开启自律生活</text>
		</view>

		<!-- 注册表单区域 -->
		<view class="login-view animate-slide-up">
			<view class="login-card">
				<form class="login-form">


					<view class="input-group">
						<text class="icon">👤</text>
						<input type="text" v-model="formData.UserName" placeholder="请输入您的账号" class="custom-input" />
						<view class="input-line"></view>
					</view>

					<view class="input-group">
						<text class="icon">🔒</text>
						<input type="password" v-model="formData.Password" placeholder="请输入您的密码" class="custom-input"
							password="true" />
						<view class="input-line"></view>
					</view>

					<view class="input-group">
						<text class="icon">📱</text>
						<input type="text" v-model="formData.PhoneNumber" placeholder="请输入您的手机号" class="custom-input" />
						<view class="input-line"></view>
					</view>

					<view class="input-group">
						<text class="icon">🧑</text>
						<uni-data-checkbox v-model="formData.RoleType" :localdata="RoleTypeList" />
						<view class="input-line"></view>
					</view>

					<button class="login-btn" @click="Register">
						<text class="btn-text">注 册</text>
						<view class="btn-wave"></view>
					</button>

					<view class="quick-actions">
						<text class="register-link" @click="ToLogin">已有账号？立即登录</text>
					</view>
				</form>
			</view>
		</view>
	</view>
</template>

<script setup>
import { GetLoginCode } from "@/utils/comm";
import { Post } from "@/utils/http";
import { reactive, ref } from 'vue';
import { onLoad } from "@dcloudio/uni-app";

// 响应式数据
const formData = reactive({
	UserName: "",
	Password: "",
	RoleType: "2",
	PhoneNumber: "",
	Name: ""
})

const RoleTypeList = ref([])

// 获取角色列表
const GetRoleTypeListApi = async () => {
	const { Data: { Items } } = await Post("/Select/RoleType")
	RoleTypeList.value = Items.filter(item => item.Code != 1).map(item => ({
		text: item.Name,
		value: item.Code
	}))
}

// 注册方法
const Register = async () => {
	if (!formData.UserName) {
		uni.showToast({
			title: "请输入账户",
			icon: "none"
		})
		return
	}
	if (!formData.Password) {
		uni.showToast({
			title: "请输入密码",
			icon: "none"
		})
		return
	}

	if (!formData.PhoneNumber) {
		uni.showToast({
			title: "请输入手机号",
			icon: "none"
		})
		return
	}
	formData.Name = Math.random().toString(36).substring(2, 15);


	//正则表达式
	if (!/^\d{11}$/.test(formData.PhoneNumber)) {
		uni.showToast({
			title: "请输入正确的手机号",
			icon: "none"
		})
		return
	}

	let WxCode = null
	await GetLoginCode().then(code => {
		WxCode = code
	})

	const { Data, Success } = await Post("/User/Register", {
		...formData,
		WxCode
	})

	if (Success) {
		Object.assign(formData, {
			UserName: "",
			Password: "",
			RoleType: "2",
			Name: "",
			PhoneNumber: ""
		})

		uni.redirectTo({
			url: "/pages/Front/Login"
		})
	}
}

// 去登录
const ToLogin = () => {
	uni.redirectTo({
		url: "/pages/Front/Login"
	})
}

// 生命周期钩子
onLoad(() => {
	GetRoleTypeListApi()
})
</script>

<style scoped>
/* 基础页面样式 */
page {
	background-color: #f8fffe;
}

/* 容器样式 */
.login-container {
	min-height: 100vh;
	background: linear-gradient(135deg, #e8f8f5 0%, #f0fdf4 60%, #ffffff 100%);
	position: relative;
	overflow: hidden;
}

/* 背景装饰 */
.bg-decoration {
	position: absolute;
	width: 100%;
	height: 100%;
	pointer-events: none;
}

.circle {
	position: absolute;
	border-radius: 50%;
	opacity: 0.1;
}

.circle-1 {
	width: 600rpx;
	height: 600rpx;
	background: linear-gradient(45deg, #10b981, #34d399);
	top: -200rpx;
	right: -200rpx;
	animation: float 8s ease-in-out infinite;
}

.circle-2 {
	width: 400rpx;
	height: 400rpx;
	background: linear-gradient(45deg, #34d399, #10b981);
	bottom: -150rpx;
	left: -150rpx;
	animation: float 12s ease-in-out infinite;
}

.circle-3 {
	width: 300rpx;
	height: 300rpx;
	background: linear-gradient(45deg, #10b981, #34d399);
	top: 40%;
	left: 60%;
	animation: float 10s ease-in-out infinite;
}

/* Logo 区域 */
.logo-area {
	padding: 100rpx 0;
	text-align: center;
}

.logo {
	width: 200rpx;
	height: 200rpx;
	margin-bottom: 30rpx;
	filter: drop-shadow(0 8rpx 16rpx rgba(0, 0, 0, 0.1));
}

.welcome-text {
	font-size: 40rpx;
	color: #333;
	font-weight: bold;
	margin-bottom: 16rpx;
	display: block;
}

.slogan {
	font-size: 28rpx;
	color: #666;
	opacity: 0.8;
	display: block;
}

/* 登录视图 */
.login-view {
	width: 100%;
	position: relative;
	margin-top: -120upx;
	background-color: rgba(255,255,255,0.96);
		border-radius: 48rpx 48rpx 0 0;
		box-shadow: 0 -8rpx 24rpx rgba(16, 185, 129, 0.08);
}

/* 登录卡片 */
.login-card {
	padding: 60rpx 40rpx;
	background: rgba(255,255,255,0.92);
	border-radius: 24rpx;
	margin: 40rpx 30rpx 0rpx;
	box-shadow: 0 8rpx 24rpx rgba(15, 118, 110, 0.08);
}

/* 输入框组 */
.input-group {
	margin-bottom: 50rpx;
	position: relative;
	display: flex;
	align-items: center;
	padding: 0 20rpx;
}

.icon {
	font-size: 36rpx;
	color: #999;
	margin-right: 20rpx;
}

.custom-input {
	flex: 1;
	height: 90rpx;
	font-size: 32rpx;
	background: transparent;
}

.input-line {
	position: absolute;
	bottom: -10rpx;
	left: 0;
	right: 0;
	height: 2rpx;
	background: linear-gradient(90deg, transparent, #e0e0e0, transparent);
	transition: all 0.3s;
}

.custom-input:focus+.input-line {
	height: 3rpx;
	background: linear-gradient(90deg, transparent, #10b981, transparent);
}

/* 按钮样式 */
.login-btn {
	position: relative;
	width: 100%;
	height: 90rpx;
	background: linear-gradient(135deg, #10b981, #34d399);
	border: none;
	border-radius: 45rpx;
	margin: 60rpx 0 30rpx;
	padding: 0;
	overflow: hidden;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 15rpx 30rpx rgba(16, 185, 129, 0.25);
	transition: transform 0.3s ease;
}

.btn-text {
	color: #ffffff;
	font-size: 32rpx;
	font-weight: 600;
	letter-spacing: 4rpx;
	z-index: 1;
}

.btn-wave {
	position: absolute;
	top: 0;
	left: -100%;
	width: 200%;
	height: 100%;
	background: linear-gradient(90deg,
			transparent,
			rgba(255, 255, 255, 0.3),
			transparent);
	transform: skewX(-15deg);
	animation: wave 2s infinite;
}

/* 快捷操作区 */
.quick-actions {
	display: flex;
	justify-content: center;
	margin-top: 30rpx;
	padding: 0 20rpx;
}

.register-link {
	color: #10b981;
	font-size: 28rpx;
}

/* 动画关键帧 */
@keyframes float {

	0%,
	100% {
		transform: translateY(0) rotate(0deg);
	}

	50% {
		transform: translateY(-20rpx) rotate(5deg);
	}
}

@keyframes wave {
	0% {
		left: -100%;
	}

	50%,
	100% {
		left: 100%;
	}
}

.animate-float {
	animation: float 3s ease-in-out infinite;
}

.animate-fade-in {
	animation: fadeIn 0.8s ease-out;
}

.animate-fade-in-delay {
	animation: fadeIn 0.8s ease-out 0.3s backwards;
}

@keyframes fadeIn {
	from {
		opacity: 0;
		transform: translateY(20rpx);
	}

	to {
		opacity: 1;
		transform: translateY(0);
	}
}
</style>