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
                    <el-form-item label="用户名称">
                        <el-input v-model.trim="searchForm.UserName" placeholder="请输入用户名称" clearable />
                    </el-form-item>
                    <el-form-item label="帖子标签">
                        <el-input v-model.trim="searchForm.Tag" placeholder="#减脂" clearable />
                    </el-form-item>
                    <el-form-item label="审核状态">
                        <el-select v-model="searchForm.AuditStatus" clearable placeholder="请选择" style="min-width:140px">
                            <el-option label="待审核" :value="1" />
                            <el-option label="已通过" :value="2" />
                            <el-option label="已驳回" :value="3" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="帖子类型">
                        <el-input v-model.trim="searchForm.PostType" placeholder="请输入帖子类型" clearable />
                    </el-form-item>
                </el-form>
            </div>
        </el-card>

        <!-- 审核对话框 -->
        <el-dialog title="审核帖子" v-model="auditDialogShow" width="40%" :lock-scroll="true">
            <el-form v-if="auditDialogShow" ref="auditForm" :rules="auditFormRules" :model="auditFormData"
                label-width="100px" size="default">
                <el-form-item label="审核状态" prop="AuditStatus">
                    <el-radio-group v-model="auditFormData.AuditStatus">
                        <el-radio label="2">审核通过</el-radio>
                        <el-radio label="3">审核驳回</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="审核原因" prop="AuditReply">
                    <el-input type="textarea" v-model="auditFormData.AuditReply" placeholder="请输入审核原因" :rows="4"
                        clearable />
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button size="default" @click="auditDialogShow = false">取 消</el-button>
                    <el-button size="default" type="primary" @click="SubmitAudit()">确 定</el-button>
                </span>
            </template>
        </el-dialog>

        <!-- 详情对话框 -->
        <el-dialog title="帖子详情" v-model="detailShow" width="560px" :lock-scroll="true">
            <el-form v-if="detailShow" label-width="100px" size="default">
                <el-row :gutter="10" class="edit-from-body">
                    <el-col :span="24">
                        <el-form-item label="发布用户">
                            <span>{{ detailData.PublishUserDto ? (detailData.PublishUserDto.Name || detailData.PublishUserDto.UserName) : '-' }}</span>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="帖子类型">
                            <el-tag>{{ detailData.PostType || '-' }}</el-tag>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="审核状态">
                            <el-tag :type="auditTagType(detailData.AuditStatus)">
                                {{ auditStatusMap[detailData.AuditStatus] || '未知' }}
                            </el-tag>
                        </el-form-item>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item label="标签">
                            <span>{{ detailData.Tags || '-' }}</span>
                        </el-form-item>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item label="内容">
                            <div class="detail-content">{{ detailData.Content || '-' }}</div>
                        </el-form-item>
                    </el-col>
                    <el-col :span="24" v-if="detailData.ImageUrls">
                        <el-form-item label="图片">
                            <viewer :images="detailData.ImageUrls.split(',').filter(u => u)">
                                <div class="image-grid">
                                    <img v-for="(url, idx) in detailData.ImageUrls.split(',').filter(u => u)"
                                        :key="idx" :src="url" class="detail-image" />
                                </div>
                            </viewer>
                        </el-form-item>
                    </el-col>
                    <el-col :span="24" v-if="detailData.AiComment">
                        <el-form-item label="AI点评">
                            <div class="detail-ai-comment">{{ detailData.AiComment }}</div>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="来源类型">
                            <span>{{ detailData.SourceType || '-' }}</span>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="来源ID">
                            <span>{{ detailData.SourceId || '-' }}</span>
                        </el-form-item>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item label="互动数据">
                            <span>赞 {{ detailData.LikeCount || 0 }} / 评 {{ detailData.CommentCount || 0 }} / 藏 {{ detailData.CollectCount || 0 }}</span>
                        </el-form-item>
                    </el-col>
                    <el-col :span="24" v-if="detailData.AuditReply">
                        <el-form-item label="审核回复">
                            <span>{{ detailData.AuditReply }}</span>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12" v-if="detailData.AuditUserDto">
                        <el-form-item label="审核人">
                            <span>{{ detailData.AuditUserDto.Name || detailData.AuditUserDto.UserName || '-' }}</span>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="发布时间">
                            <span>{{ detailData.CreationTime || '-' }}</span>
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button size="default" @click="detailShow = false">关 闭</el-button>
                </span>
            </template>
        </el-dialog>

        <!-- 数据表格 -->
        <PaginationTable ref="PaginationTableId" url="/CommunityPost/List" :column="columnList">
            <template v-slot:header>
                <el-button type="danger" size="default" @click="BatchDelete">
                    <el-icon><Delete /></el-icon>批量删除
                </el-button>
            </template>
            <template v-slot:Operate="scope">
                <el-button type="primary" size="default" class="margin-top-xs" @click="ShowDetailModal(scope.row.Id)">
                    <el-icon><View /></el-icon>详 情
                </el-button>
                <el-button type="success" v-if="scope.row.AuditStatus == 1" size="default" class="margin-top-xs"
                    @click="ShowAuditModal(scope.row.Id)">
                    <el-icon><Check /></el-icon>审 核
                </el-button>
                <el-button type="warning" size="default" class="margin-top-xs"
                    @click="ToggleStatus(scope.row.Id, scope.row.Status === 2 ? 1 : 2)">
                    {{ scope.row.Status === 2 ? '上 架' : '下 架' }}
                </el-button>
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
import { useCommonStore } from "@/store";
import { Delete, Refresh, Search, Check, View } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { computed, reactive, ref } from 'vue';

const commonStore = useCommonStore();
const UserId = computed(() => commonStore.UserId);

const searchForm = reactive({});
const auditDialogShow = ref(false);
const detailShow = ref(false);
const detailData = reactive({});
const auditForm = ref(null);
const auditFormData = reactive({
    Id: null,
    AuditStatus: '',
    AuditReply: ''
});
const PaginationTableId = ref(null);

const auditStatusMap = { 1: '待审核', 2: '已通过', 3: '已驳回' };
const auditTagType = (status) => {
    return { 1: 'warning', 2: 'success', 3: 'danger' }[status] || 'info';
};

const columnList = ref([
    { key: "Id", hidden: true },
    { key: "PublishUserDto.Name", title: "发布用户", width: "120px", type: ColumnType.SHORTTEXT },
    { key: "PostType", title: "帖子类型", width: "120px", type: ColumnType.SHORTTEXT },
    { key: "Tags", title: "标签", width: "180px", type: ColumnType.SHORTTEXT },
    { key: "Content", title: "内容", minWidth: "200px", type: ColumnType.SHORTTEXT },
    { key: "AiComment", title: "AI点评", minWidth: "180px", type: ColumnType.SHORTTEXT },
    { key: "AuditStatus", hidden: true },
    {
        key: "AuditStatusFormat",
        title: "审核状态",
        width: "100px",
        type: ColumnType.SHORTTEXT,
        template: (item) => ({ 1: '待审核', 2: '已通过', 3: '已驳回' }[item.AuditStatus] || ''),
    },
    {
        key: "Interaction",
        title: "互动数据",
        width: "170px",
        type: ColumnType.SHORTTEXT,
        template: (item) => `赞${item.LikeCount || 0} / 评${item.CommentCount || 0} / 藏${item.CollectCount || 0}`,
    },
    { key: "CreationTime", title: "发布时间", width: "180px", type: ColumnType.DATETIME },
    { key: "Status", hidden: true },
    {
        title: "操作",
        width: "320px",
        key: "Operate",
        type: ColumnType.USERDEFINED,
    },
]);

const auditFormRules = reactive({
    "AuditStatus": [
        { required: true, message: '请选择审核状态', trigger: 'change' },
    ],
    "AuditReply": [
        { required: true, message: '请输入审核原因', trigger: 'blur' },
    ],
});

const SearchClick = () => {
    PaginationTableId.value.Reload(searchForm);
};

const ResetClick = () => {
    Object.keys(searchForm).forEach(key => searchForm[key] = undefined);
    PaginationTableId.value.Reload(searchForm);
};

const ShowAuditModal = (Id) => {
    auditFormData.Id = Id;
    auditFormData.AuditStatus = '';
    auditFormData.AuditReply = '';
    auditDialogShow.value = true;
};

const SubmitAudit = async () => {
    if (!auditForm.value) return;
    await auditForm.value.validate(async valid => {
        if (valid) {
            const { Success } = await Post(`/CommunityPost/Audit`, {
                Id: auditFormData.Id,
                AuditStatus: auditFormData.AuditStatus,
                AuditReply: auditFormData.AuditReply,
                AuditUserId: UserId.value
            });
            if (Success) {
                auditDialogShow.value = false;
                PaginationTableId.value.Reload(searchForm);
                ElMessage.success('审核操作成功');
            }
        }
    });
};

const ShowDetailModal = async (Id) => {
    const { Data } = await Post(`/CommunityPost/Get`, { Id });
    if (Data) {
        Object.keys(detailData).forEach(key => delete detailData[key]);
        Object.assign(detailData, Data);
        detailShow.value = true;
    }
};

const ToggleStatus = async (Id, Status) => {
    const label = Status === 1 ? '上架' : '下架';
    try {
        await ElMessageBox.confirm(`确认${label}该帖子吗？`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        });
        const { Success } = await Post(`/CommunityPost/SetStatus`, { Id, Status });
        if (Success) {
            PaginationTableId.value.Reload(searchForm);
            ElMessage.success(`${label}成功`);
        }
    } catch {
        ElMessage.warning('已取消操作');
    }
};

const ShowDeleteModal = async (Id) => {
    try {
        await ElMessageBox.confirm('确认删除该帖子吗？删除后不可恢复。', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        });
        const { Success } = await Post(`/CommunityPost/Delete`, { Id });
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
        await ElMessageBox.confirm(`确认删除选中的${ids.length}条帖子吗？`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        });
        const deletePromises = ids.map(Id => Post(`/CommunityPost/Delete`, { Id }));
        await Promise.all(deletePromises);
        PaginationTableId.value.Reload(searchForm);
        ElMessage.success('批量删除成功');
    } catch {
        ElMessage.warning('已取消操作');
    }
};
</script>

<style scoped>
.detail-content {
    padding: 12px 16px;
    background: #f8f9fa;
    border-radius: 8px;
    line-height: 1.8;
    white-space: pre-wrap;
    word-break: break-all;
    color: #333;
    font-size: 14px;
    max-height: 200px;
    overflow-y: auto;
}

.detail-ai-comment {
    padding: 12px 16px;
    background: #ecfdf5;
    border-left: 4px solid var(--primary-color, #409eff);
    border-radius: 4px;
    line-height: 1.8;
    color: #333;
    font-size: 14px;
}

.image-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.detail-image {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 8px;
    cursor: pointer;
    border: 1px solid #e5e7eb;
}
</style>
