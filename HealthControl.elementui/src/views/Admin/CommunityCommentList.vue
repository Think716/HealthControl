<template>
    <div>
        <!-- 搜索表单卡片 -->
        <el-card class="box-card">
            <div slot="header" class="clearfix">
                <el-row>
                    <el-button type="primary" size="default" @click="SearchClick">
                        <el-icon><Search /></el-icon>查询
                    </el-button>
                    <el-button type="warning" size="default" @click="ResetClick">
                        <el-icon><Refresh /></el-icon>清空条件
                    </el-button>
                </el-row>
            </div>
            <div class="margin-top-sm">
                <el-form :inline="true" :model="searchForm" size="default">
                    <el-form-item label="评论内容">
                        <el-input v-model.trim="searchForm.Content" placeholder="请输入评论内容关键字" clearable />
                    </el-form-item>
                    <el-form-item label="帖子ID">
                        <el-input v-model.trim="searchForm.PostId" placeholder="请输入帖子ID" clearable />
                    </el-form-item>
                    <el-form-item label="评论人">
                        <SigleSelect url="/User/List" class="search-input" columnName="Name" clearable
                            columnValue="Id" v-model="searchForm.CommentUserId" />
                    </el-form-item>
                </el-form>
            </div>
        </el-card>

        <!-- 数据表格 -->
        <PaginationTable ref="PaginationTableId" url="/CommunityComment/List" :column="columnList">
            <template v-slot:header>
                <el-button type="danger" size="default" @click="BatchDelete">
                    <el-icon><Delete /></el-icon>批量删除
                </el-button>
            </template>
            <template v-slot:Operate="scope">
                <el-button type="danger" size="default" class="margin-top-xs" @click="ShowDeleteModal(scope.row.Id)">
                    <el-icon><Delete /></el-icon>删 除
                </el-button>
            </template>
        </PaginationTable>
    </div>
</template>

<script setup>
import { Post } from '@/api/http';
import { ColumnType } from '@/components/Tables/columnTypes';
import { Delete, Refresh, Search } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { reactive, ref } from 'vue';

const searchForm = reactive({});
const PaginationTableId = ref(null);

const columnList = ref([
    { key: "Id", hidden: true },
    { key: "PostId", title: "帖子ID", width: "100px", type: ColumnType.SHORTTEXT },
    { key: "CommentUserDto.Name", title: "评论人", width: "140px", type: ColumnType.SHORTTEXT },
    { key: "Content", title: "评论内容", minWidth: "300px", type: ColumnType.SHORTTEXT },
    {
        key: "CreationTime",
        title: "发布时间",
        width: "180px",
        type: ColumnType.DATETIME,
    },
    {
        title: "操作",
        width: "120px",
        key: "Operate",
        type: ColumnType.USERDEFINED,
    },
]);

const SearchClick = () => {
    PaginationTableId.value.Reload(searchForm);
};

const ResetClick = () => {
    Object.keys(searchForm).forEach(key => searchForm[key] = undefined);
    PaginationTableId.value.Reload(searchForm);
};

const ShowDeleteModal = async (Id) => {
    try {
        await ElMessageBox.confirm('确认删除该评论吗？删除后不可恢复。', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        });
        const { Success } = await Post(`/CommunityComment/Delete`, { Id });
        if (Success) {
            PaginationTableId.value.Reload(searchForm);
            ElMessage.success('删除成功');
        }
    } catch {
        ElMessage.warning('已取消操作');
    }
};

const BatchDelete = async () => {
    const ids = PaginationTableId.value.GetSelectionRow().map(x => x.Id);
    if (ids.length === 0) {
        ElMessage.warning('请先选择要删除的数据');
        return;
    }
    try {
        await ElMessageBox.confirm(`确认删除选中的${ids.length}条评论吗？`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        });
        const deletePromises = ids.map(Id => Post(`/CommunityComment/Delete`, { Id }));
        await Promise.all(deletePromises);
        PaginationTableId.value.Reload(searchForm);
        ElMessage.success('批量删除成功');
    } catch {
        ElMessage.warning('已取消操作');
    }
};
</script>

<style scoped></style>
