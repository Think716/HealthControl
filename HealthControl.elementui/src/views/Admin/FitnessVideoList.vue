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
                    <el-form-item label="视频标题" prop="Title">
                        <el-input v-model.trim="searchForm.Title" placeholder="请输入视频标题" clearable />
                    </el-form-item>
                    <el-form-item label="BMI分层">
                        <el-select v-model="searchForm.BmiCategory" clearable placeholder="请选择BMI分层" class="search-input">
                            <el-option v-for="item in bmiOptions" :key="item" :label="item" :value="item" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="训练目标">
                        <el-input v-model.trim="searchForm.TrainingGoal" placeholder="如减脂/塑形/增肌" clearable />
                    </el-form-item>
                    <el-form-item label="状态">
                        <el-select v-model="searchForm.Status" clearable placeholder="请选择状态" class="search-input">
                            <el-option label="启用" :value="1" />
                            <el-option label="停用" :value="0" />
                        </el-select>
                    </el-form-item>
                </el-form>
            </div>
        </el-card>

        <!-- 编辑对话框 -->
        <el-dialog :title="formData.Id ? '修改健身视频' : '添加健身视频'" v-model="editorShow" width="56%" :lock-scroll="true">
            <el-form v-if="editorShow" ref="editModalForm" :rules="editModalFormRules" :model="formData" label-width="120px"
                size="default">
                <el-row :gutter="10" class="edit-from-body">
                    <el-col :span="24">
                        <el-form-item label="视频标题" prop="Title">
                            <el-input v-model="formData.Title" placeholder="请输入视频标题" clearable />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="BMI分层" prop="BmiCategory">
                            <el-select v-model="formData.BmiCategory" placeholder="请选择BMI分层">
                                <el-option v-for="item in bmiOptions" :key="item" :label="item" :value="item" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="训练目标" prop="TrainingGoal">
                            <el-input v-model="formData.TrainingGoal" placeholder="如减脂、增肌、体态改善" clearable />
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="训练等级" prop="Level">
                            <el-select v-model="formData.Level" placeholder="请选择训练等级">
                                <el-option label="入门" value="入门" />
                                <el-option label="进阶" value="进阶" />
                                <el-option label="强化" value="强化" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="时长(分钟)" prop="DurationMinutes">
                            <el-input-number v-model="formData.DurationMinutes" :min="1" :max="300" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="消耗(kcal)" prop="Calories">
                            <el-input-number v-model="formData.Calories" :min="0" :max="5000" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="排序" prop="SortOrder">
                            <el-input-number v-model="formData.SortOrder" :min="1" :max="9999" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="状态" prop="Status">
                            <el-switch v-model="formData.Status" :active-value="1" :inactive-value="0" active-text="启用"
                                inactive-text="停用" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item label="封面" prop="Cover">
                            <UploadImages :limit="1" category="fitness-video-covers" v-model="formData.Cover" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item label="训练视频" prop="VideoUrl">
                            <UploadVideo :limit="1" category="fitness-videos" v-model="formData.VideoUrl" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item label="展示图" prop="ImageUrls">
                            <UploadImages :limit="6" category="fitness-video-images" v-model="formData.ImageUrls" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item label="视频说明" prop="Content">
                            <AIRichText category="fitness-video-content" v-model="formData.Content" />
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

        <!-- 数据表格 -->
        <PaginationTable ref="PaginationTableId" url="/FitnessVideo/List" :column="columnList">
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
const bmiOptions = ['偏瘦', '正常', '超重', '肥胖', '通用'];

const columnList = ref([
    { key: "Id", hidden: true },
    { key: "Title", title: "视频标题", width: "180px", type: ColumnType.SHORTTEXT },
    { key: "Cover", title: "封面", type: ColumnType.IMAGES },
    { key: "ImageUrls", title: "展示图", width: "260px", type: ColumnType.IMAGES },
    { key: "VideoUrl", title: "训练视频", width: "160px", type: ColumnType.VIDEO },
    { key: "BmiCategory", title: "BMI分层", width: "120px", type: ColumnType.SHORTTEXT },
    { key: "TrainingGoal", title: "训练目标", width: "140px", type: ColumnType.SHORTTEXT },
    { key: "Level", title: "等级", width: "100px", type: ColumnType.SHORTTEXT },
    { key: "DurationMinutes", title: "时长", width: "100px", type: ColumnType.SHORTTEXT },
    { key: "Calories", title: "消耗", width: "100px", type: ColumnType.SHORTTEXT },
    { key: "Content", title: "说明", width: "140px", type: ColumnType.RICHTEXT },
    { key: "Status", title: "状态", width: "100px", type: ColumnType.SHORTTEXT },
    { title: "操作", width: "220px", key: "Operate", type: ColumnType.USERDEFINED },
]);

const editModalFormRules = reactive({
    Title: [{ required: true, message: '该项为必填项', trigger: 'blur' }],
    BmiCategory: [{ required: true, message: '该项为必填项', trigger: 'change' }],
    TrainingGoal: [{ required: true, message: '该项为必填项', trigger: 'blur' }],
    Level: [{ required: true, message: '该项为必填项', trigger: 'change' }],
    DurationMinutes: [{ required: true, message: '该项为必填项', trigger: 'blur' }],
    Cover: [{ required: true, message: '该项为必填项', trigger: 'blur' }],
    VideoUrl: [{ required: true, message: '该项为必填项', trigger: 'blur' }],
});

const ShowEditModal = async (Id) => {
    const { Data } = await Post('/FitnessVideo/Get', { Id });
    Object.keys(formData).forEach(key => delete formData[key]);
    Object.assign(formData, {
        Status: 1,
        SortOrder: 100,
        DurationMinutes: 20,
        Calories: 120,
        ...(Data || {})
    });
    editorShow.value = true;
};

const CreateOrEditForm = async () => {
    if (!editModalForm.value) return;
    await editModalForm.value.validate(async valid => {
        if (!valid) return;
        const { Success } = await Post('/FitnessVideo/CreateOrEdit', formData);
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
        await ElMessageBox.confirm('确认删除该健身视频吗？', '提示', { type: 'warning' });
        const { Success } = await Post('/FitnessVideo/Delete', { Id });
        if (Success) {
            PaginationTableId.value.Reload(searchForm);
            ElMessage.success('删除成功');
        }
    } catch (error) {
        ElMessage.warning('用户取消操作');
    }
};

const BatchDelete = async () => {
    const ids = PaginationTableId.value.GetSelectionRow().map(x => x.Id);
    if (!ids.length) {
        ElMessage.warning('请选择要删除的数据');
        return;
    }
    try {
        await ElMessageBox.confirm('确认删除所选健身视频吗？', '提示', { type: 'warning' });
        const { Success } = await Post('/FitnessVideo/BatchDelete', { Ids: ids });
        if (Success) {
            PaginationTableId.value.Reload(searchForm);
            ElMessage.success('删除成功');
        }
    } catch (error) {
        ElMessage.warning('用户取消操作');
    }
};
</script>

<style scoped></style>
