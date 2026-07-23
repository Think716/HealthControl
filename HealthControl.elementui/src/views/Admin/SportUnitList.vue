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
                    <el-form-item label="运动">
                        <SigleSelect url="/Sport/AdminList" class="search-input" columnName="Name" :clearable="true"
                            columnValue="Id" v-model="searchForm.SportId" />
                    </el-form-item>
                    <el-form-item label="单位名称" prop="UnitName">
                        <el-input v-model.trim="searchForm.UnitName" placeholder="请输入单位名称" :clearable="true"></el-input>
                    </el-form-item>
                </el-form>
            </div>
        </el-card>

        <el-dialog :title="formData.Id ? '修改运动单位' : '添加运动单位'" v-model="editorShow" width="50%" :lock-scroll="true">
            <el-form v-if="editorShow" ref="editModalForm" :rules="editModalFormRules" :model="formData" label-width="130px"
                size="default">
                <el-row :gutter="10" class="edit-from-body">
                    <el-col :span="24">
                        <el-form-item label="运动" prop="SportId">
                            <SigleSelect url="/Sport/AdminList" columnName="Name" columnValue="Id" v-model="formData.SportId" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item label="单位名称" prop="UnitName">
                            <el-input v-model="formData.UnitName" placeholder="如：分钟、公里、组" :clearable="true"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item label="单位值" prop="UnitValue">
                            <el-input-number v-model="formData.UnitValue" :min="1" :max="1000000"></el-input-number>
                        </el-form-item>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item label="消耗热量" prop="Calories">
                            <el-input-number v-model="formData.Calories" :min="0" :max="1000000" :precision="2"></el-input-number>
                            <span class="field-tip">每 1 个单位值消耗的 kcal</span>
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

        <PaginationTable ref="PaginationTableId" url="/Sport/UnitList" :column="columnList">
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

const sportNameMap = ref({});

const columnList = ref([
    { key: "Id", hidden: true },
    { key: "SportId", hidden: true },
    { key: "SportName", title: "运动名称", width: "160px", type: ColumnType.SHORTTEXT, template: row => sportNameMap.value[row.SportId] || row.SportId },
    { key: "UnitName", title: "单位名称", width: "140px", type: ColumnType.SHORTTEXT },
    { key: "UnitValue", title: "单位值", width: "120px", type: ColumnType.SHORTTEXT },
    { key: "Calories", title: "消耗热量(kcal)", width: "160px", type: ColumnType.SHORTTEXT },
    { title: "操作", width: "260px", key: "Operate", type: ColumnType.USERDEFINED },
]);

const editModalFormRules = reactive({
    SportId: [{ required: true, message: '该项为必填项', trigger: 'change' }],
    UnitName: [{ required: true, message: '该项为必填项', trigger: 'blur' }],
    UnitValue: [{ required: true, message: '该项为必填项', trigger: 'blur' }],
    Calories: [{ required: true, message: '该项为必填项', trigger: 'blur' }],
});

const loadSportMap = async () => {
    const { Data } = await Post('/Sport/AdminList', { Limit: 999 });
    const map = {};
    ;(Data?.Items || []).forEach(item => map[item.Id] = item.Name);
    sportNameMap.value = map;
};

loadSportMap();

const ShowEditModal = async (Id) => {
    const { Data } = await Post(`/Sport/UnitGet`, { Id });
    Object.keys(formData).forEach(key => delete formData[key]);
    Object.assign(formData, Data);
    editorShow.value = true;
};

const CreateOrEditForm = async () => {
    if (!editModalForm.value) return;
    await editModalForm.value.validate(async valid => {
        if (!valid) return;
        const { Success } = await Post(`/Sport/UnitCreateOrEdit`, formData);
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
        await ElMessageBox.confirm('确认删除该运动单位吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        });
        const { Success } = await Post(`/Sport/UnitDelete`, { Id });
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
        await ElMessageBox.confirm('确认删除所选运动单位吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        });
        const { Success } = await Post(`/Sport/UnitBatchDelete`, { Ids: ids });
        if (Success) {
            PaginationTableId.value.Reload(searchForm);
            ElMessage.success('删除成功');
        }
    } catch {
        ElMessage.warning('已取消操作');
    }
};
</script>

<style scoped>
.field-tip {
    margin-left: 12px;
    color: #909399;
    font-size: 13px;
}
</style>
