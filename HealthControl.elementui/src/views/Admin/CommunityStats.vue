<template>
    <div class="stats">
        <el-card v-for="card in cards" :key="card.label" class="stat-card" :style="{ borderTopColor: card.color }">
            <div class="value" :style="{ color: card.color }">{{ card.value }}</div>
            <div class="label">{{ card.label }}</div>
        </el-card>
    </div>
</template>

<script setup>
import { Post } from '@/api/http';
import { onMounted, ref } from 'vue';

const stats = ref({});

const cards = ref([
    { label: '总动态数', value: 0, color: 'var(--health-primary)' },
    { label: '今日新增', value: 0, color: 'var(--health-info)' },
    { label: '总评论数', value: 0, color: 'var(--health-warning)' },
    { label: '今日评论', value: 0, color: 'var(--sport-cardio)' },
    { label: '发帖人数', value: 0, color: 'var(--diet-protein)' },
    { label: '评论人数', value: 0, color: 'var(--sport-flexibility)' },
    { label: '活跃用户', value: 0, color: 'var(--health-success)' },
]);

onMounted(async () => {
    const res = await Post('/CommunityPost/Stats', {});
    const data = res?.Data || {};
    cards.value = [
        { label: '总动态数', value: data.TotalPosts || 0, color: 'var(--health-primary)' },
        { label: '今日新增', value: data.TodayPosts || 0, color: 'var(--health-info)' },
        { label: '总评论数', value: data.TotalComments || 0, color: 'var(--health-warning)' },
        { label: '今日评论', value: data.TodayComments || 0, color: 'var(--sport-cardio)' },
        { label: '发帖人数', value: data.PostUserCount || 0, color: 'var(--diet-protein)' },
        { label: '评论人数', value: data.CommentUserCount || 0, color: 'var(--sport-flexibility)' },
        { label: '活跃用户', value: data.ActiveUsers || 0, color: 'var(--health-success)' },
    ];
});
</script>

<style scoped>
.stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
}

.stat-card {
    text-align: center;
    border-top: 4px solid;
    border-radius: 8px;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.value {
    font-size: 36px;
    font-weight: 700;
    margin-bottom: 8px;
}

.label {
    font-size: 14px;
    color: #909399;
}
</style>