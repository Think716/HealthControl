<template>
    <div>
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
                    <el-form-item label="运动名称" prop="Name">
                        <el-input v-model.trim="searchForm.Name" placeholder="请输入运动名称" :clearable="true"></el-input>
                    </el-form-item>
                </el-form>
            </div>
        </el-card>

        <el-dialog :title="formData.Id ? '修改运动' : '添加运动'" v-model="editorShow" width="50%" :lock-scroll="true">
            <el-form v-if="editorShow" ref="editModalForm" :rules="editModalFormRules" :model="formData" label-width="120px"
                size="default">
                <el-row :gutter="10" class="edit-from-body">
                    <el-col :span="24">
                        <el-form-item label="运动名称" prop="Name">
                            <el-input v-model="formData.Name" placeholder="请输入运动名称" :clearable="true"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item label="运动图片" prop="Cover">
                            <UploadImages :limit="1" category="sport-covers" v-model="formData.Cover"></UploadImages>
                        </el-form-item>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item label="运动说明" prop="Content">
                            <el-input type="textarea" v-model="formData.Content" :rows="4" placeholder="请输入运动说明"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row type="flex" justify="end" align="bottom">
                    <el-form-item>
                        <el-button size="default" type="primary" plain @click="CreateOrEditForm()">确定</el-button>
                        <el-button size="default" @click="editorShow = false">取消</el-button>
                    </el-form-item>
                </el-row>
            </el-form>
        </el-dialog>

        <PaginationTable ref="PaginationTableId" url="/Sport/AdminList" :column="columnList">
            <template v-slot:header>
                <el-button type="primary" size="default" @click="ShowEditModal()">
                    <el-icon><Edit /></el-icon>新增
                </el-button>
                <el-button type="danger" size="default" @click="BatchDelete">
                    <el-icon><Delete /></el-icon>批量删除
                </el-button>
            </template>
            <template v-slot:Operate="scope">
                <el-button type="primary" size="default" class="margin-top-xs" @click="ShowEditModal(scope.row.Id)">
                    <el-icon><Edit /></el-icon>修改
                </el-button>
                <el-button type="danger" size="default" class="margin-top-xs" @click="ShowDeleteModal(scope.row.Id)">
                    <el-icon><Delete /></el-icon>删除
                </el-button>
            </template>
        </PaginationTable>
    </div>
</template>

<script setup>
import { Post } from '@/api/http';
import { ColumnType } from '@/components/Tables/columnTypes';
import { Delete, Edit, Refresh, Search } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { reactive, ref } from 'vue';

const searchForm = reactive({});
const formData = reactive({});
const editorShow = ref(false);
const editModalForm = ref(null);
const PaginationTableId = ref(null);

const columnList = ref([
    { key: "Id", hidden: true },
    { key: "Name", title: "运动名称", width: "160px", type: ColumnType.SHORTTEXT },
    { key: "Cover", title: "运动图片", width: "140px", type: ColumnType.IMAGES },
    { key: "Content", title: "运动说明", type: ColumnType.SHORTTEXT },
    { title: "操作", width: "260px", key: "Operate", type: ColumnType.USERDEFINED },
]);

const editModalFormRules = reactive({
    Name: [{ required: true, message: '该项为必填项', trigger: 'blur' }],
    Cover: [{ required: true, message: '该项为必填项', trigger: 'blur' }],
    Content: [{ required: true, message: '该项为必填项', trigger: 'blur' }],
});

const ShowEditModal = async (Id) => {
    const { Data } = await Post(`/Sport/Get`, { Id });
    Object.keys(formData).forEach(key => delete formData[key]);
    Object.assign(formData, Data);
    editorShow.value = true;
};

const CreateOrEditForm = async () => {
    if (!editModalForm.value) return;
    await editModalForm.value.validate(async valid => {
        if (!valid) return;
        const { Success } = await Post(`/Sport/CreateOrEdit`, formData);
        if (Success) {
            editorShow.value = false;
            PaginationTableId.value.Reload(searchForm);
            ElMessage.success('操作成功');
        }
    });
};

const SearchClick = () => PaginationTableId.value.Reload(searchForm);

const ResetClick = () => {
    Object.keys(searchForm).forEach(key => searchForm[key] = undefined);
    PaginationTableId.value.Reload(searchForm);
};

const ShowDeleteModal = async (Id) => {
    try {
        await ElMessageBox.confirm('确认删除该运动及其单位配置吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        });
        const { Success } = await Post(`/Sport/Delete`, { Id });
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
        ElMessage.warning('请选择要删除的数据');
        return;
    }
    try {
        await ElMessageBox.confirm('确认删除所选运动及其单位配置吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        });
        const { Success } = await Post(`/Sport/BatchDelete`, { Ids: ids });
        if (Success) {
            PaginationTableId.value.Reload(searchForm);
            ElMessage.success('删除成功');
        }
    } catch {
        ElMessage.warning('已取消操作');
    }
};
</script>

<style scoped></style>
