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
                    <el-form-item label="处理状态">
                        <el-select v-model="searchForm.Status" clearable placeholder="请选择" style="min-width:140px">
                            <el-option label="待处理" :value="1" />
                            <el-option label="已处理" :value="2" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="举报人">
                        <SigleSelect url="/User/List" class="search-input" columnName="Name" clearable
                            columnValue="Id" v-model="searchForm.ReportUserId" />
                    </el-form-item>
                </el-form>
            </div>
        </el-card>

        <!-- 处理举报对话框 -->
        <el-dialog title="处理举报" v-model="handleDialogShow" width="40%" :lock-scroll="true">
            <el-form v-if="handleDialogShow" ref="handleForm" :rules="handleFormRules" :model="handleFormData"
                label-width="100px" size="default">
                <el-form-item label="处理方式">
                    <el-radio-group v-model="handleFormData.Action">
                        <el-radio label="delete">删除被举报动态</el-radio>
                        <el-radio label="dismiss">忽略举报</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="处理说明" prop="HandleReply">
                    <el-input type="textarea" v-model="handleFormData.HandleReply" placeholder="请输入处理说明" :rows="4"
                        clearable />
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button size="default" @click="handleDialogShow = false">取 消</el-button>
                    <el-button size="default" type="primary" @click="SubmitHandle()">确 定</el-button>
                </span>
            </template>
        </el-dialog>

        <!-- 数据表格 -->
        <PaginationTable ref="PaginationTableId" url="/CommunityReport/List" :column="columnList">
            <template v-slot:Operate="scope">
                <el-button type="warning" size="default" class="margin-top-xs"
                    @click="ShowHandleModal(scope.row)">
                    <el-icon><Check /></el-icon>处 理
                </el-button>
            </template>
        </PaginationTable>
    </div>
</template>

<script setup>
import { Post } from '@/api/http';
import { ColumnType } from '@/components/Tables/columnTypes';
import { Refresh, Search, Check } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { reactive, ref } from 'vue';

const searchForm = reactive({});
const handleDialogShow = ref(false);
const handleForm = ref(null);
const handleFormData = reactive({
    Id: null,
    PostId: null,
    Action: 'dismiss',
    HandleReply: ''
});
const PaginationTableId = ref(null);

const columnList = ref([
    { key: "Id", hidden: true },
    { key: "PostId", title: "被举报动态ID", width: "130px", type: ColumnType.SHORTTEXT },
    { key: "ReportUserDto.Name", title: "举报人", width: "140px", type: ColumnType.SHORTTEXT },
    { key: "Reason", title: "举报原因", minWidth: "200px", type: ColumnType.SHORTTEXT },
    { key: "Status", hidden: true },
    {
        key: "StatusFormat",
        title: "处理状态",
        width: "100px",
        type: ColumnType.SHORTTEXT,
        template: (item) => ({ 1: '待处理', 2: '已处理' }[item.Status] || ''),
    },
    { key: "HandleReply", title: "处理说明", width: "160px", type: ColumnType.SHORTTEXT },
    {
        key: "CreationTime",
        title: "举报时间",
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

const handleFormRules = reactive({
    HandleReply: [
        { required: true, message: '请输入处理说明', trigger: 'blur' },
    ],
});

const SearchClick = () => {
    PaginationTableId.value.Reload(searchForm);
};

const ResetClick = () => {
    Object.keys(searchForm).forEach(key => searchForm[key] = undefined);
    PaginationTableId.value.Reload(searchForm);
};

const ShowHandleModal = (row) => {
    handleFormData.Id = row.Id;
    handleFormData.PostId = row.PostId;
    handleFormData.Action = 'dismiss';
    handleFormData.HandleReply = '';
    handleDialogShow.value = true;
};

const SubmitHandle = async () => {
    if (!handleForm.value) return;
    await handleForm.value.validate(async valid => {
        if (valid) {
            const { Id, PostId, Action, HandleReply } = handleFormData;

            if (Action === 'delete') {
                await Post(`/CommunityPost/SetStatus`, { Id: PostId, Status: 2 });
            }

            const { Success } = await Post(`/CommunityReport/CreateOrEdit`, {
                Id,
                Status: 2,
                HandleReply
            });
            if (Success) {
                handleDialogShow.value = false;
                PaginationTableId.value.Reload(searchForm);
                ElMessage.success('处理成功');
            }
        }
    });
};
</script>

<style scoped></style>
