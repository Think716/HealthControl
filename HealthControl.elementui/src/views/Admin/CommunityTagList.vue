<template>
    <div>
        <!-- 编辑对话框 -->
        <el-dialog :title="formData.Id ? '修改标签' : '添加标签'" v-model="editorShow" width="460px" :lock-scroll="true">
            <el-form v-if="editorShow" ref="editModalFormRef" :rules="editModalFormRules" :model="formData"
                label-width="80px" size="default">
                <el-row :gutter="10" class="edit-from-body">
                    <el-col :span="24">
                        <el-form-item label="标签名称" prop="Name">
                            <el-input v-model.trim="formData.Name" placeholder="请输入标签名称" clearable />
                        </el-form-item>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item label="显示排序" prop="Sort">
                            <el-input-number v-model="formData.Sort" :min="0" :max="9999" placeholder="数字越小越靠前" />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row type="flex" justify="end" align="bottom">
                    <el-form-item>
                        <el-button size="default" type="primary" plain @click="CreateOrEditForm()">确 定</el-button>
                        <el-button size="default" @click="editorShow = false">取 消</el-button>
                    </el-form-item>
                </el-row>
            </el-form>
        </el-dialog>

        <!-- 数据表格 -->
        <PaginationTable ref="PaginationTableId" url="/CommunityTag/List" :column="columnList">
            <template v-slot:header>
                <el-button type="primary" size="default" @click="ShowEditModal()">
                    <el-icon><Edit /></el-icon>新 增
                </el-button>
                <el-button type="danger" size="default" @click="BatchDelete">
                    <el-icon><Delete /></el-icon>批量删除
                </el-button>
            </template>
            <template v-slot:Operate="scope">
                <el-button type="primary" size="default" class="margin-top-xs" @click="ShowEditModal(scope.row.Id)">
                    <el-icon><Edit /></el-icon>修 改
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
import { Delete, Edit } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { reactive, ref } from 'vue';

const searchForm = reactive({});
const formData = reactive({});
const editorShow = ref(false);
const editModalFormRef = ref(null);
const PaginationTableId = ref(null);

const columnList = ref([
    { key: "Id", hidden: true },
    { key: "Name", title: "标签名称", width: "200px", type: ColumnType.SHORTTEXT },
    { key: "Sort", title: "排序", width: "120px", type: ColumnType.SHORTTEXT },
    { key: "CreationTime", title: "创建时间", width: "180px", type: ColumnType.DATETIME },
    {
        title: "操作",
        width: "200px",
        key: "Operate",
        type: ColumnType.USERDEFINED,
    },
]);

const editModalFormRules = reactive({
    Name: [{ required: true, message: '该项为必填项', trigger: 'blur' }],
    Sort: [{ required: true, message: '该项为必填项', trigger: 'blur' }],
});

const ShowEditModal = async (Id) => {
    Object.keys(formData).forEach(key => delete formData[key]);
    if (Id) {
        const { Data } = await Post(`/CommunityTag/Get`, { Id });
        Object.assign(formData, Data);
    }
    editorShow.value = true;
};

const CreateOrEditForm = async () => {
    if (!editModalFormRef.value) return;
    await editModalFormRef.value.validate(async valid => {
        if (!valid) return;
        const { Success } = await Post(`/CommunityTag/CreateOrEdit`, formData);
        if (Success) {
            editorShow.value = false;
            PaginationTableId.value.Reload(searchForm);
            ElMessage.success('操作成功');
        }
    });
};

const ShowDeleteModal = async (Id) => {
    try {
        await ElMessageBox.confirm('确认删除该标签吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        });
        const { Success } = await Post(`/CommunityTag/Delete`, { Id });
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
        await ElMessageBox.confirm(`确认删除选中的${ids.length}个标签吗？`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        });
        const deletePromises = ids.map(Id => Post(`/CommunityTag/Delete`, { Id }));
        await Promise.all(deletePromises);
        PaginationTableId.value.Reload(searchForm);
        ElMessage.success('批量删除成功');
    } catch {
        ElMessage.warning('已取消操作');
    }
};
</script>

<style scoped></style>
