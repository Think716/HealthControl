<template>
    <view class="food-list-container">
        <!-- 导航栏 -->
        <uni-nav-bar dark :fixed="true" shadow background-color="#4CAF50" status-bar left-icon="left" left-text="返回"
            @clickLeft="goBack" title="🥗 健康食物库" />

        <!-- 主要内容区域 -->
        <view class="voice-entry-panel">
            <view class="voice-entry-title">语音/文字记饮食</view>
            <input
                v-model="quickRecordText"
                class="quick-record-input"
                placeholder="例如：早餐吃了一个鸡蛋、一杯牛奶"
                placeholder-style="color:#9ca3af;font-size:24rpx;"
                confirm-type="done"
                @confirm="submitQuickRecord"
            />
            <view class="voice-entry-actions">
                <view class="voice-btn" :class="{ recording: isRecording, listening: isRecording || !!voiceText }" @click="toggleVoice">
                    <uni-icons :type="isRecording ? 'sound-filled' : 'mic'" size="20" color="#fff"></uni-icons>
                    <text class="voice-btn-text">{{ isRecording ? '停止录音' : '语音输入' }}</text>
                </view>
                <view class="voice-btn" @click="submitQuickRecord">
                    <uni-icons type="compose" size="20" color="#fff"></uni-icons>
                    <text class="voice-btn-text">解析记录</text>
                </view>
                <view class="voice-btn secondary" @click="clearVoiceResult">
                    <uni-icons type="clear" size="18" color="#4CAF50"></uni-icons>
                    <text class="voice-btn-text secondary-text">清空</text>
                </view>
            </view>
            <view class="voice-result" v-if="voiceText">
                <text class="voice-result-label">输入内容：</text>
                <text class="voice-result-text">{{ voiceText }}</text>
            </view>
            <view class="voice-match-result" v-if="voiceMatchedPreview.length > 0">
                <text class="voice-result-label">将自动记录：</text>
                <text class="voice-match-item" v-for="(item, index) in voiceMatchedPreview" :key="index">
                    {{ item.foodName }} × {{ item.amount }}{{ item.unitName }}
                </text>
            </view>
            <view class="voice-unmatch-result" v-if="voiceUnmatchedTexts.length > 0">
                <text class="voice-result-label warning">未匹配到：</text>
                <text class="voice-unmatch-item" v-for="(text, index) in voiceUnmatchedTexts" :key="index">
                    {{ text }}
                </text>
            </view>
        </view>

        <view class="content-wrapper">
            <!-- 左侧分类菜单 -->
            <view class="category-menu">
                <scroll-view class="category-scroll" scroll-y>
                    <view v-for="(category, index) in FoodTypeList" :key="category.Id" class="category-item"
                        :class="{ active: activeCategory === index }" @click="selectCategory(index, category.Id)">
                        <text class="category-name">{{ category.Name }}</text>
                    </view>
                </scroll-view>
            </view>

            <!-- 右侧食物列表 -->
            <view class="food-content">
                <scroll-view v-if="FoodTypeList.length > 0" class="food-scroll" scroll-y @scroll="onFoodScroll" :scroll-into-view="scrollIntoView" :scroll-with-animation="true">
                    <view v-for="category in FoodTypeList" :key="category.Id" :id="`category-${category.Id}`"
                        class="food-category-section">
                        <!-- 分类标题 -->
                        <view class="category-title">
                            <text class="title-text">{{ category.Name }}</text>
                        </view>

                        <!-- 该分类下的食物列表 -->
                        <view class="food-list">
                            <view v-for="food in category.Foods" :key="food.Id" class="food-item" @click="selectFood(food)">
                                <!-- 食物图片 -->
                                <view class="food-image">
                                    <image :src="food.Cover" mode="aspectFill" class="food-cover" />
                                </view>

                                <!-- 食物信息 -->
                                <view class="food-info">
                                    <view class="food-name">{{ food.Name }}</view>
                                    <view class="food-nutrition">
                                        <text class="nutrition-item">热量: {{ food.Calories }}kcal/1g</text>
                                        <text class="nutrition-item">蛋白质: {{ food.Protein }}g</text>
                                        <text class="nutrition-item">碳水: {{ food.Carbohydrates }}g</text>
                                        <text class="nutrition-item">脂肪: {{ food.Fat }}g</text>
                                    </view>

                                    <!-- 食物单位选择 -->
                                    <view class="food-units" v-if="food.FoodUnits && food.FoodUnits.length > 0">
                                        <text class="units-label">常见单位：</text>
                                        <view class="units-list">
                                            <view v-for="unit in food.FoodUnits" :key="unit.Id" class="unit-item"
                                                @click.stop="selectUnit(food, unit)">
                                                <text class="unit-name">{{ unit.UnitName }}</text>
                                                <text class="unit-calories">({{ unit.Calories }}kcal)</text>
                                            </view>
                                        </view>
                                    </view>
                                </view>
                            </view>
                        </view>
                    </view>
                </scroll-view>
                <view class="food-empty-state" v-else>
                    <uni-icons type="info" size="28" color="#7cb67c"></uni-icons>
                    <text class="food-empty-text">{{ foodLoadError || '暂无食物数据，请稍后重试' }}</text>
                </view>
            </view>
        </view>

        <!-- 分量输入弹窗 -->
        <uni-popup ref="portionPopup" type="center" >
            <view class="portion-input-popup" v-if="selectedUnit">
                <view class="portion-header">
                    <text class="portion-title">添加食物记录</text>
                    <view class="portion-close" @click="closePortionPopup">
                        <uni-icons type="closeempty" size="24" color="#666"></uni-icons>
                    </view>
                </view>

                <view class="portion-content">
                    <!-- 食物信息显示 -->
                    <view class="food-summary">
                        <image :src="selectedUnit.food.Cover" mode="aspectFill" class="summary-image" />
                        <view class="summary-info">
                            <text class="summary-name">{{ selectedUnit.food.Name }}</text>
                            <text class="summary-unit">单位: {{ selectedUnit.unit.UnitName }} ({{ selectedUnit.unit.UnitValue }}g)</text>
                        </view>
                    </view>

                    <!-- 分量输入 -->
                    <view class="input-section">
                        <text class="input-label">请输入分量：</text>
                         <input
						 v-model="portionAmount"
                        type="digit"
                            placeholder="例如：1、2.5"
                            placeholder-style="color:#9ca3af;font-size:24rpx;"
                            :style="inputStyles"
                            class="portion-input"
                            @input="onPortionInput"
                        />
                    </view>

                    <!-- 营养计算结果 -->
                    <view class="nutrition-result" v-if="calculatedNutrition">
                        <text class="result-label">营养计算结果：</text>
                        <view class="nutrition-items">
                            <text class="nutrition-item">总热量：{{ calculatedNutrition.calories }}kcal</text>
                            <text class="nutrition-item">蛋白质：{{ calculatedNutrition.protein }}g</text>
                            <text class="nutrition-item">碳水化合物：{{ calculatedNutrition.carbohydrates }}g</text>
                            <text class="nutrition-item">脂肪：{{ calculatedNutrition.fat }}g</text>
                        </view>
                    </view>

                    <!-- 时间选择 -->
                    <view class="time-section">
                        <text class="time-label">记录时间：</text>
                        <picker mode="datetime" :value="recordTime" @change="onTimeChange">
                            <view class="time-picker">
                                <text>{{ recordTime }}</text>
                                <uni-icons type="arrowright" size="18" color="#999"></uni-icons>
                            </view>
                        </picker>
                    </view>
                </view>

                <!-- 底部操作按钮 -->
                <view class="portion-footer">
                    <button class="cancel-btn" @click="closePortionPopup">取消</button>
                    <button class="save-btn" :disabled="!canSave" @click="saveDietRecord">保存记录</button>
                </view>
            </view>
        </uni-popup>
    </view>
</template>

<script setup>
import { useCommonStore } from '@/store';
import { Post } from '@/utils/http';
import { onReady, onShow } from "@dcloudio/uni-app";
import { computed, reactive, ref, nextTick, watch } from 'vue';
import { GetFormatFullDate } from '@/utils/comm';

// 获取store
const commonStore = useCommonStore();
const Token = computed(() => commonStore.Token)
const UserInfo = computed(() => commonStore.UserInfo)
const RoleType = computed(() => commonStore.RoleType)
const UserId = computed(() => commonStore.UserId)

// 响应式数据
const FoodTypeList = ref([]);
const activeCategory = ref(0); // 当前激活的分类索引
const scrollIntoView = ref('');// 右侧滚动位置
const selectedFood = ref(null); // 选中的食物
const foodPopup = ref(null); // 弹窗引用

// 分量输入相关数据
const portionPopup = ref(null); // 分量输入弹窗引用
const selectedUnit = ref(null); // 选中的单位信息 { food, unit }
const portionAmount = ref(''); // 输入的分量数量
const formatRecordTimeForPicker = (date = new Date()) => {
    const pad = (num) => String(num).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};
const recordTime = ref(formatRecordTimeForPicker()); // 记录时间，默认当前时间

const parsePickerDateTime = (value) => {
    if (!value) return new Date();
    const [datePart, timePart = '00:00'] = value.split(' ');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute] = timePart.split(':').map(Number);
    return new Date(year, (month || 1) - 1, day || 1, hour || 0, minute || 0, 0);
};
const calculatedNutrition = ref(null); // 计算后的营养信息
const quickRecordText = ref('');
const voiceText = ref('');
const voiceMatchedPreview = ref([]);
const voiceUnmatchedTexts = ref([]);
const foodLoadError = ref('');

// 输入框样式（uni-app原生input需内联样式控制文字颜色）
const inputStyles = {
    color: '#111827',
    fontSize: '32rpx',
    fontWeight: '700'
};

const where = reactive({});

// 计算属性
const canSave = computed(() => {
    return portionAmount.value && parseFloat(portionAmount.value) > 0 && selectedUnit.value;
});

onShow(async () => {
    await GetFoodTypeListApi();
});

onReady(async () => {
});

// 方法
const goBack = () => {
    uni.navigateBack();
};

// 获取食物分类列表
const GetFoodTypeListApi = async () => {
    foodLoadError.value = '';
    try {
        const result = await Post('/FoodType/List', { isQueryChild: true });
        const items = result?.Data?.Items || [];
        FoodTypeList.value = Array.isArray(items) ? items : [];
        if (!FoodTypeList.value.length) {
            foodLoadError.value = '食物列表为空，请先在后台维护食物数据';
        }
    } catch (error) {
        console.error('获取食物列表失败:', error);
        FoodTypeList.value = [];
        foodLoadError.value = '食物列表加载失败，请检查网络或服务';
    }
};

// 选择分类
const selectCategory = async (index, categoryId) => {
    activeCategory.value = index;
    scrollIntoView.value = '';
    await nextTick();
    scrollIntoView.value = `category-${categoryId}`;
};

// 监听右侧滚动，同步左侧菜单
const onFoodScroll = (e) => {
    const scrollTop = e.detail.scrollTop;

    // 获取所有分类区域的位置，找到当前应该高亮的分类
    const query = uni.createSelectorQuery();
    const categoryIds = FoodTypeList.value.map(item => `#category-${item.Id}`);
    
    if (categoryIds.length === 0) return;

    query.selectAll(categoryIds.join(',')).boundingClientRect();
    query.exec((res) => {
        if (!res || !res[0]) return;
        
        const rects = res[0];
        let currentIndex = 0;
        
        for (let i = 0; i < rects.length; i++) {
            if (rects[i].top <= 100) {
                currentIndex = i;
            } else {
                break;
            }
        }
        
        activeCategory.value = currentIndex;
    });
};

// 选择食物
const selectFood = (food) => {
    selectedFood.value = food;
};

// 选择单位
const selectUnit = (food, unit) => {
    selectedUnit.value = { food, unit };
    // 打开分量输入弹窗
    portionPopup.value.open();
    // 初始化分量输入
    portionAmount.value = '';
    calculatedNutrition.value = null;
	recordTime.value = formatRecordTimeForPicker();
};

// 关闭分量弹窗
const closePortionPopup = () => {
    portionPopup.value.close();
    selectedUnit.value = null;
    portionAmount.value = '';
    calculatedNutrition.value = null;
	recordTime.value = formatRecordTimeForPicker();
};

// 分量输入过滤（只允许数字和小数点）
const onPortionInput = (e) => {
    let val = e.detail.value;
    // 移除非数字和小数点的字符
    val = val.replace(/[^\d.]/g, '');
    // 只保留第一个小数点
    const dotIndex = val.indexOf('.');
    if (dotIndex !== -1) {
        val = val.substring(0, dotIndex + 1) + val.substring(dotIndex + 1).replace(/\./g, '');
    }
    portionAmount.value = val;
};

// 时间选择变化
const onTimeChange = (e) => {
    recordTime.value = e.detail.value;
};

// 计算营养信息
const calculateNutrition = () => {
    if (!selectedUnit.value || !portionAmount.value || parseFloat(portionAmount.value) <= 0) {
        calculatedNutrition.value = null;
        return null;
    }

    const { food, unit } = selectedUnit.value;
    const amount = parseFloat(portionAmount.value);
    const unitWeight = parseFloat(unit.UnitValue || 1);
    
    calculatedNutrition.value = {
        calories: (food.Calories * unitWeight * amount).toFixed(2),
        protein: (food.Protein * unitWeight * amount).toFixed(2),
        carbohydrates: (food.Carbohydrates * unitWeight * amount).toFixed(2),
        fat: (food.Fat * unitWeight * amount).toFixed(2)
    };
	
    return calculatedNutrition.value;
};

// 监听分量输入变化
watch([portionAmount, selectedUnit], () => {
    calculateNutrition();
});

// 保存饮食记录
const saveDietRecord = async () => {
    if (!canSave.value) return;

    uni.showLoading({ title: '保存中...' });
    
    try {
          const nutrition = calculateNutrition();
          
                  if (!nutrition) {
                      uni.showToast({
                          title: '请先输入有效分量',
                          icon: 'none'
                      });
                      return;
                  }
          
                  const parsedAmount = parseFloat(portionAmount.value);
                  const result = await Post('/DietRecord/CreateOrEdit', {
                      RecordUserId: UserId.value,
                      FoodId: selectedUnit.value.food.Id,          // ← 加上 FoodId
                      FoodUnitId: selectedUnit.value.unit.Id,
                      RecordValue: Math.max(1, Math.round(parsedAmount)),
                      RecordTime: GetFormatFullDate(parsePickerDateTime(recordTime.value))
                  });

        if (result.Success) {
            uni.showToast({
                title: '记录保存成功！',
                icon: 'success'
            });

            // 关闭弹窗
            closePortionPopup();
        } else {
            uni.showToast({
                title: result.Msg || '保存失败',
                icon: 'none'
            });
        }

    } catch (error) {
        uni.showToast({
			 title: error?.Msg || error?.message || '网络错误，请重试',
            icon: 'none'
        });
        console.error('保存饮食记录失败:', error);
		 } finally {
		        uni.hideLoading();
		    }
};

const clearVoiceResult = () => {
    quickRecordText.value = '';
    voiceText.value = '';
    voiceMatchedPreview.value = [];
    voiceUnmatchedTexts.value = [];
};

const submitQuickRecord = async () => {
    const text = quickRecordText.value.trim();
    if (!text) {
        uni.showToast({ title: '请输入饮食描述', icon: 'none' });
        return;
    }

    voiceText.value = text;
    uni.showLoading({ title: '正在保存记录...' });
    try {
        const result = await Post('/api/voice/recognize-text', {
            Text: text,
            UserId: UserId.value,
            RecordTime: GetFormatFullDate(new Date())
        });

        const data = result?.Data || result;
        const matchedItems = data?.MatchedItems || data?.matchedItems || [];
        const meaninglessWords = [
            '早餐', '午餐', '晚餐', '夜宵', '宵夜', '加餐',
            '吃了', '喝了', '还有', '和', '以及',
            '一个', '一杯', '一些', '一点', '今天', '刚刚',
            '记录', '一下', '我'    // ← 补充缺失项
        ];
        
        const unmatchedTexts = (data?.UnmatchedTexts || data?.unmatchedTexts || []).filter(item => {
            return !meaninglessWords.includes(item);
        });
        const savedCount = data?.SavedCount || data?.savedCount || 0;

        voiceMatchedPreview.value = matchedItems.map(item => ({
            foodName: item.FoodName || item.foodName,
            amount: item.Count || item.count,
            unitName: item.UnitName || item.unitName
        }));
        voiceUnmatchedTexts.value = unmatchedTexts;

        if (savedCount > 0) {
            if (unmatchedTexts.length > 0) {
                uni.showToast({
                    title: `已记录${savedCount}条，${unmatchedTexts.length}条未识别`,
                    icon: 'success',
                    duration: 3000
                });
            } else {
                uni.showToast({ title: `已记录${savedCount}条`, icon: 'success' });
            }
            return;
        }
        
                uni.showToast({ title: '未匹配到食物，请更换描述', icon: 'none' });
            } catch (error) {
                console.error('快速记录保存失败:', error);
                uni.showToast({ title: '保存失败，请稍后重试', icon: 'none' });
            } finally {
                uni.hideLoading();
            }
        };

// 录音管理器
const recorderManager = uni.getRecorderManager();
const isRecording = ref(false);
const audioFilePath = ref('');

// 初始化录音监听器
recorderManager.onStart(() => {
    isRecording.value = true;
    console.log('[Voice] 录音已开始');
    uni.showLoading({ title: '正在聆听...' });
});

recorderManager.onStop((res) => {
    isRecording.value = false;
    uni.hideLoading();
    audioFilePath.value = res.tempFilePath;

    console.log('[Voice] 录音结束, 文件路径:', res.tempFilePath);
    console.log('[Voice] 录音时长:', res.duration, 'ms');

    // 自动上传并识别
    uploadAndRecognizeAudio(res.tempFilePath);
});

recorderManager.onError((err) => {
    console.error('[Voice] 录音错误:', JSON.stringify(err));
    isRecording.value = false;
    uni.hideLoading();

    let errorMsg = '录音失败';
    if (err.errMsg && err.errMsg.includes('permission')) {
        errorMsg = '请允许麦克风权限后再试';
    } else if (err.errMsg && err.errMsg.includes('system')) {
        errorMsg = '系统录音功能异常，请重试';
    }

    uni.showToast({
        title: errorMsg,
        icon: 'none',
        duration: 2000
    });
});

// 语音按钮统一入口
const toggleVoice = () => {
    if (isRecording.value) {
        stopVoiceRecognition();
    } else {
        startVoiceRecognition();
    }
};

// 开始录音
const startVoiceRecognition = () => {
    console.log('[Voice] 点击语音输入按钮');

    // 运行时检测：H5 环境不调用录音（编译指令 #ifdef H5 保留）
    // #ifdef H5
    uni.showToast({ title: 'H5暂不支持语音输入', icon: 'none', duration: 2000 });
    return;
    // #endif

    try {
        recorderManager.start({
            duration: 10000,
            sampleRate: 16000,
            numberOfChannels: 1,
            encodeBitRate: 48000,
            format: 'wav'
        });
        console.log('[Voice] start() 调用成功');
    } catch (e) {
        console.error('[Voice] start() 异常:', e);
        uni.showToast({ title: '录音启动失败', icon: 'none' });
    }
};

// 停止录音
const stopVoiceRecognition = () => {
    console.log('[Voice] 停止录音');
    recorderManager.stop();
};

// 上传音频并识别
const uploadAndRecognizeAudio = async (filePath) => {
    uni.showLoading({ title: '识别中...' });

    try {
        const uploadRes = await new Promise((resolve, reject) => {
            uni.uploadFile({
                url: `${import.meta.env.VITE_API_BASE_URL}/api/voice/recognize`,
                filePath: filePath,
                name: 'file',
                formData: {
                    userId: UserId.value
                },
                success: resolve,
                fail: reject
            });
        });

        const result = JSON.parse(uploadRes.data);

        if (result.Success && result.Data) {
            const data = result.Data;
            const matchedItems = data.matchedItems || [];
            const unmatchedTexts = data.unmatchedTexts || [];
            const savedCount = data.savedCount || 0;

            voiceMatchedPreview.value = matchedItems.map(item => ({
                foodName: item.foodName,
                amount: item.count,
                unitName: item.unitName
            }));
            voiceUnmatchedTexts.value = unmatchedTexts.filter(text => {
                const meaninglessWords = ['早餐', '午餐', '晚餐', '吃了', '喝了'];
                return !meaninglessWords.some(word => text.includes(word));
            });

            if (savedCount > 0) {
                uni.showToast({
                    title: `已记录${savedCount}条`,
                    icon: 'success'
                });
            } else {
                uni.showToast({
                    title: '未匹配到食物',
                    icon: 'none'
                });
            }
        } else {
            uni.showToast({
                title: result.Msg || '识别失败',
                icon: 'none'
            });
        }

    } catch (error) {
        console.error('语音识别失败:', error);
        uni.showToast({
            title: '网络错误，请重试',
            icon: 'none'
        });
    } finally {
        uni.hideLoading();
    }
};
</script>

<style scoped lang="scss">
.food-list-container {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%);
}

.voice-entry-panel {
    margin: 20rpx;
    padding: 20rpx;
    border-radius: 16rpx;
    background: #fff;
    box-shadow: 0 4rpx 12rpx rgba(76, 175, 80, 0.15);

    .voice-entry-title {
        font-size: 30rpx;
        font-weight: 600;
        color: #2E7D32;
        margin-bottom: 16rpx;
    }

    .quick-record-input {
        box-sizing: border-box;
        width: 100%;
        min-height: 76rpx;
        margin-bottom: 16rpx;
        padding: 0 20rpx;
        border: 1rpx solid #d7ead7;
        border-radius: 12rpx;
        background: #f8fdf8;
        color: #111827;
        font-size: 28rpx;
    }

    .voice-entry-actions {
        display: flex;
        gap: 16rpx;
        margin-bottom: 16rpx;
    }

    .voice-btn {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8rpx;
        padding: 14rpx 24rpx;
        border-radius: 999rpx;
        background: #4CAF50;
        overflow: visible;
        z-index: 1;

        &.listening {
            background: #2196F3;
            box-shadow: 0 8rpx 24rpx rgba(33, 150, 243, 0.28);

            &::before,
            &::after {
                content: '';
                position: absolute;
                inset: -10rpx;
                border: 2rpx solid rgba(33, 150, 243, 0.55);
                border-radius: 999rpx;
                z-index: -1;
                animation: voice-ripple 1.6s ease-out infinite;
            }

            &::after {
                animation-delay: .8s;
            }
        }

        &.recording {
            background: #1E88E5;
        }

        &.secondary {
            background: #f1f8f1;
            border: 1rpx solid #bfe2bf;
        }

        .voice-btn-text {
            color: #fff;
            font-size: 24rpx;

            &.secondary-text {
                color: #4CAF50;
            }
        }
    }

    @keyframes pulse {
        0%, 100% {
            opacity: 1;
        }
        50% {
            opacity: 0.7;
        }
    }

    @keyframes voice-ripple {
        0% {
            opacity: .75;
            transform: scale(.9);
        }
        70% {
            opacity: .16;
            transform: scale(1.28);
        }
        100% {
            opacity: 0;
            transform: scale(1.35);
        }
    }

    .voice-result,
    .voice-match-result,
    .voice-unmatch-result {
        margin-top: 8rpx;
        display: flex;
        flex-direction: column;
        gap: 6rpx;
    }

    .voice-result-label {
        font-size: 22rpx;
        color: #7a7a7a;

        &.warning {
            color: #ff9800;
        }
    }

    .voice-result-text,
    .voice-match-item {
        font-size: 24rpx;
        color: #333;
    }

    .voice-unmatch-item {
        font-size: 24rpx;
        color: #ff9800;
        background: #fff3e0;
        padding: 4rpx 8rpx;
        border-radius: 4rpx;
    }
}

/* 主要内容区域 */
.content-wrapper {
    display: flex;
    height: calc(100vh - 44px);
    flex: 1;
    min-height: 0;
}

/* 左侧分类菜单 */
.category-menu {
    width: 120rpx;
    background: linear-gradient(180deg, #ffffff 0%, #f8fdf8 100%);
    border-right: 1rpx solid #e0f0e0;
    box-shadow: 2rpx 0 8rpx rgba(76, 175, 80, 0.1);

    .category-scroll {
        height: 100%;
    }

    .category-item {
        height: 100rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        border-bottom: 1rpx solid #f0f0f0;
        background-color: #fff;
        transition: all 0.3s;

        &.active {
            background: linear-gradient(90deg, #e8f5e8 0%, #d4f4d4 100%);
            border-right: 4rpx solid #4CAF50;
            box-shadow: inset -2rpx 0 4rpx rgba(76, 175, 80, 0.2);

            .category-name {
                color: #2E7D32;
                font-weight: bold;
            }
        }

        .category-name {
            font-size: 24rpx;
            color: #333;
            text-align: center;
            line-height: 1.2;
        }
    }
}

/* 右侧食物内容 */
.food-content {
    flex: 1;
    min-width: 0;
    display: flex;        /* 新增 */
    flex-direction: column; /* 新增 */
}

.food-scroll {
    flex: 1;              /* 改为 flex:1 替代 height:100% */
    min-height: 0;        /* 新增，允许 flex 子元素收缩 */
    padding: 0 20rpx;
    box-sizing: border-box;
}

.food-empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: #5e8f5e;
    gap: 12rpx;

    .food-empty-text {
        font-size: 24rpx;
    }
}

/* 分类区域 */
.food-category-section {
    margin-bottom: 40rpx;

    .category-title {
        background: linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%);
        padding: 20rpx 0;
        z-index: 10;
        border-radius: 12rpx 12rpx 0 0;
        margin-bottom: 8rpx;

        .title-text {
            font-size: 32rpx;
            font-weight: bold;
            color: #2E7D32;
            display: flex;
            align-items: center;

            &::before {
                content: '🌿';
                margin-right: 12rpx;
                font-size: 28rpx;
            }
        }
    }

    .food-list {
        display: flex;
        flex-direction: column;
        gap: 16rpx;
    }

    .food-item {
        display: flex;
        gap: 16rpx;
        padding: 16rpx;
        background: #fff;
        border-radius: 12rpx;
        box-shadow: 0 2rpx 8rpx rgba(76, 175, 80, 0.1);

        .food-image {
            width: 120rpx;
            height: 120rpx;
            border-radius: 8rpx;
            overflow: hidden;

            .food-cover {
                width: 100%;
                height: 100%;
            }
        }

        .food-info {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 8rpx;

            .food-name {
                font-size: 28rpx;
                font-weight: 600;
                color: #333;
            }

            .food-nutrition {
                display: flex;
                flex-wrap: wrap;
                gap: 8rpx;

                .nutrition-item {
                    font-size: 22rpx;
                    color: #666;
                    background: #f5f9f5;
                    padding: 4rpx 8rpx;
                    border-radius: 4rpx;
                }
            }

            .food-units {
                margin-top: 8rpx;

                .units-label {
                    font-size: 22rpx;
                    color: #666;
                    margin-right: 8rpx;
                }

                .units-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8rpx;
                    margin-top: 8rpx;

                    .unit-item {
                        padding: 6rpx 12rpx;
                        background: #f1f8f1;
                        border-radius: 6rpx;
                        border: 1rpx solid #e0f0e0;

                        .unit-name {
                            font-size: 22rpx;
                            color: #2E7D32;
                        }

                        .unit-calories {
                            font-size: 20rpx;
                            color: #666;
                            margin-left: 4rpx;
                        }
                    }
                }
            }
        }
    }
}

/* 分量弹窗样式 - 优化版 */
.portion-input-popup {
    width: 86%;
    max-width: 600rpx;
    background: #fff;
    border-radius: 24rpx;
    padding: 36rpx 32rpx 28rpx;
    overflow: hidden;
    box-sizing: border-box;
    box-shadow: 0 8rpx 40rpx rgba(0, 0, 0, 0.12);

    .portion-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 28rpx;

        .portion-title {
            font-size: 32rpx;
            font-weight: 700;
            color: #1a1a2e;
            letter-spacing: 1rpx;
        }

        .portion-close {
            width: 48rpx;
            height: 48rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            background: #f5f5f5;
            transition: background 0.2s;

            &:active {
                background: #e8e8e8;
            }
        }
    }

    .portion-content {
        margin-bottom: 32rpx;

        .food-summary {
            display: flex;
            gap: 20rpx;
            margin-bottom: 28rpx;
            padding-bottom: 24rpx;
            border-bottom: 1rpx solid #f0f0f0;

            .summary-image {
                width: 120rpx;
                height: 120rpx;
                border-radius: 16rpx;
                box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
                flex-shrink: 0;
            }

            .summary-info {
                flex: 1;
                display: flex;
                flex-direction: column;
                justify-content: center;
                gap: 6rpx;

                .summary-name {
                    font-size: 30rpx;
                    font-weight: 700;
                    color: #1a1a2e;
                }

                .summary-unit {
                    font-size: 24rpx;
                    color: #888;
                    background: #f8f8f8;
                    display: inline-block;
                    padding: 4rpx 12rpx;
                    border-radius: 6rpx;
                    align-self: flex-start;
                }
            }
        }

        .input-section {
            margin-bottom: 24rpx;

            .input-label {
                font-size: 26rpx;
                font-weight: 600;
                color: #1a1a2e;
                margin-bottom: 12rpx;
                display: block;
            }

            .portion-input {
                box-sizing: border-box;
                width: 100%;
                height: 88rpx;
                padding: 0 24rpx;
                border: 2rpx solid #d0d0d0;
                border-radius: 16rpx;
                font-size: 32rpx;
                color: #111827;
                font-weight: 700;
                line-height: 88rpx;
                background: #fff;
                &:focus {
                    border-color: #4CAF50;
                }
            }
        }

        .nutrition-result {
            margin-bottom: 24rpx;
            padding: 20rpx;
            background: linear-gradient(135deg, #f0faf0 0%, #f8fff8 100%);
            border-radius: 16rpx;
            border: 1rpx solid #e8f5e8;

            .result-label {
                font-size: 24rpx;
                font-weight: 600;
                color: #2e7d32;
                margin-bottom: 14rpx;
                display: flex;
                align-items: center;
                gap: 6rpx;
            }

            .nutrition-items {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10rpx;

                .nutrition-item {
                    font-size: 24rpx;
                    color: #444;
                    background: rgba(255, 255, 255, 0.85);
                    padding: 10rpx 14rpx;
                    border-radius: 10rpx;
                    text-align: center;
                    font-weight: 500;
                    box-shadow: 0 1rpx 4rpx rgba(0, 0, 0, 0.04);
                }
            }
        }

        .time-section {
            .time-label {
                font-size: 26rpx;
                font-weight: 600;
                color: #1a1a2e;
                margin-bottom: 12rpx;
                display: block;
            }

            .time-picker {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 16rpx 20rpx;
                border: 2rpx solid #e8e8e8;
                border-radius: 16rpx;
                font-size: 26rpx;
                color: #444;
                background: #fafafa;
                transition: border-color 0.2s;

                &:active {
                    border-color: #4CAF50;
                }
            }
        }
    }

    .portion-footer {
        display: flex;
        gap: 20rpx;

        .cancel-btn {
            flex: 1;
            padding: 20rpx 0;
            background: #f5f5f5;
            color: #666;
            border: none;
            border-radius: 16rpx;
            font-size: 28rpx;
            font-weight: 500;
            transition: background 0.2s;

            &:active {
                background: #e8e8e8;
            }
        }

        .save-btn {
            flex: 1;
            padding: 20rpx 0;
            background: linear-gradient(135deg, #4CAF50, #43a047);
            color: #fff;
            border: none;
            border-radius: 16rpx;
            font-size: 28rpx;
            font-weight: 600;
            box-shadow: 0 4rpx 12rpx rgba(76, 175, 80, 0.3);
            transition: opacity 0.2s, box-shadow 0.2s;

            &:active:not(:disabled) {
                opacity: 0.9;
                box-shadow: 0 2rpx 6rpx rgba(76, 175, 80, 0.2);
            }

            &:disabled {
                background: #ccc;
                color: #999;
                box-shadow: none;
            }
        }
    }
}

/* 单位选择弹窗样式 */
.unit-select-popup {
    padding: 20rpx;

    .unit-list {
        display: flex;
        flex-direction: column;
        gap: 12rpx;
        max-height: 60vh;
        overflow-y: auto;
    }

    .unit-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16rpx;
        background: #f8fdf8;
        border-radius: 8rpx;

        .unit-info {
            display: flex;
            flex-direction: column;
            gap: 4rpx;

            .unit-main {
                font-size: 28rpx;
                font-weight: bold;
                color: #333;
                margin-right: 12rpx;
            }

            .unit-weight {
                font-size: 24rpx;
                color: #666;
            }
        }

        .unit-nutrition {
            .unit-cal {
                font-size: 24rpx;
                color: #007aff;
                font-weight: bold;
            }
        }
    }
}
</style>
