<template>
    <div>
        <!-- 搜索表单卡片 -->
        <el-card class="box-card">
            <div slot="header" class="clearfix">
                <el-row>
                    <el-button type="primary" size="default" @click="SearchClick">
                        <el-icon>
                            <Search />
                        </el-icon>查询
                    </el-button>
                    <el-button type="warning" size="default" @click="ResetClick">
                        <el-icon>
                            <Refresh />
                        </el-icon>清空条件
                    </el-button>
                </el-row>
            </div>
            <div class="margin-top-sm">
                <el-form :inline="true" :model="searchForm" size="default">
                    <el-form-item label="指标名称" prop="Name">
                        <el-input v-model.trim="searchForm.Name" placeholder="请输入指标名称" :clearable="true"></el-input>
                    </el-form-item>

                    <el-form-item label="所属人">
                        <SigleSelect url="/User/List" class="search-input" columnName="Name" :clearable="true"
                            columnValue="Id" v-model="searchForm.BelongUserId">
                        </SigleSelect>
                    </el-form-item>
                    <el-form-item label="指标归类">
                        <SigleSelect url="/HealthIndicatorType/List" class="search-input" columnName="Name"
                            :clearable="true" columnValue="Id" v-model="searchForm.HealthIndicatorTypeId">
                        </SigleSelect>
                    </el-form-item>

                    <el-form-item label="是否公用" class="search-input">
                        <el-select v-model="searchForm.IsComm" class="search-input" :clearable="true" placeholder="请选择是否公用">
                            <el-option key="true" label="是" value="true">
                            </el-option>
                            <el-option key="false" label="否" value="false">
                            </el-option>
                        </el-select>
                    </el-form-item>
                </el-form>
            </div>
        </el-card>
        <!-- 编辑对话框 -->
        <el-dialog :title="formData.Id ? '修改健康指标' : '添加健康指标'" v-model="editorShow" width="50%" :lock-scroll="true"
            min-height="500px">
            <el-form v-if="editorShow" ref="editModalForm" :rules="editModalFormRules" :model="formData" label-width="140px"
                size="default">
                <el-row :gutter="10" class="edit-from-body">

                    <el-col :span="24">
                        <el-form-item label="指标名称" prop="Name">
                            <el-input type="text" v-model="formData.Name" placeholder="请输入指标名称"
                                :clearable="true"></el-input>
                        </el-form-item>
                    </el-col>


                    <el-col :span="24">
                        <el-form-item label="所属人" prop="BelongUserId">
                            <SigleSelect url="/User/List" columnName="Name" columnValue="Id" :disabled="true"
                                v-model="formData.BelongUserId">
                            </SigleSelect>
                        </el-form-item>
                    </el-col>

                    <el-col :span="24">
                        <el-form-item label="指标归类" prop="HealthIndicatorTypeId">
                            <SigleSelect url="/HealthIndicatorType/List" columnName="Name" columnValue="Id"
                                v-model="formData.HealthIndicatorTypeId" :where="{ BelongUserId: UserId }">
                            </SigleSelect>
                        </el-form-item>
                    </el-col>

                    <el-col :span="24">
                        <el-form-item label="封面" prop="Cover">
                            <UploadImages :limit="1" category="health-indicator-covers" v-model="formData.Cover"></UploadImages>
                        </el-form-item>
                    </el-col>

                    <el-col :span="24">
                        <el-form-item label="是否公用" prop="IsComm">
                            <el-switch v-model="formData.IsComm" :active-value="true" :inactive-value="false">
                            </el-switch>
                        </el-form-item>
                    </el-col>

                    <el-col :span="24">
                        <el-form-item label="阈值" prop="Threshold">
                            <el-input type="text" v-model="formData.Threshold"
                                placeholder="格式：范围(3.4-17.1) 或 大于(>1.04) 或 小于(<3.4)" :clearable="true">
                                <template #append>
                                    <el-tooltip content="支持格式：3.4-17.1 / >1.04 / <3.4" placement="top">
                                        <el-icon>
                                            <QuestionFilled />
                                        </el-icon>
                                    </el-tooltip>
                                </template>
                            </el-input>
                        </el-form-item>
                    </el-col>


                    <el-col :span="24">
                        <el-form-item label="描述内容" prop="Content">
                            <el-input type="textarea" :rows="5" v-model="formData.Content" placeholder="请输入描述内容"
                                :clearable="true"></el-input>
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
        <PaginationTable ref="PaginationTableId" url="/HealthIndicator/List" :column="columnList">
            <template v-slot:header>
                <el-button type="primary" size="default" @click="ShowEditModal()">
                    <el-icon>
                        <Edit />
                    </el-icon>新 增
                </el-button>
                <el-button type="danger" size="default" @click="BatchDelete">
                    <el-icon>
                        <Delete />
                    </el-icon>批量删除
                </el-button>
            </template>
            <template v-slot:Operate="scope">
                <el-button type="primary" size="default" class="margin-top-xs" @click="ShowEditModal(scope.row.Id)">
                    <el-icon>
                        <Edit />
                    </el-icon>修 改
                </el-button>
                <el-button type="danger" size="default" class="margin-top-xs" @click="ShowDeleteModal(scope.row.Id)">
                    <el-icon>
                        <Delete />
                    </el-icon>删 除
                </el-button>
            </template>
        </PaginationTable>



    </div>
</template>

<script setup>
import { Post, PostSingleUpdate } from '@/api/http';
import { ColumnType } from '@/components/Tables/columnTypes';
import { useCommonStore } from "@/store";

import { Delete, Edit, Refresh, Search, QuestionFilled } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { onMounted, onBeforeMount, nextTick, watch, computed, reactive, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const commonStore = useCommonStore();
// 计算属性
const Token = computed(() => commonStore.Token)
const UserInfo = computed(() => commonStore.UserInfo)
const RoleType = computed(() => commonStore.RoleType)
const UserId = computed(() => commonStore.UserId)

// 搜索表单数据
const searchForm = reactive({});

// 编辑表单数据
const formData = reactive({});

// 编辑对话框显示状态
const editorShow = ref(false);

// 表单引用
const editModalForm = ref(null);

// 表格列配置
const columnList = ref([
    {
        key: "Id",
        hidden: true,

    }, {
        key: "HealthIndicatorTypeDto.Name",
        title: "分类名称",
        width: "160px",

        type: ColumnType.SHORTTEXT,
    },
    {
        key: "Name",
        title: "指标名称",
        width: "160px",

        type: ColumnType.SHORTTEXT,
    }, {
        key: "Cover",
        title: "封面",
        type: ColumnType.IMAGES,
    },
    {
        key: "BelongUserId",
        hidden: true,
    },
    {
        key: "BelongUserDto.Name",
        title: "归属人",
        width: "160px",

        type: ColumnType.SHORTTEXT,
    },
    {
        key: "Content",
        title: "描述内容",
        width: "140px",
        type: ColumnType.SHORTTEXT,
    },

    {
        key: "IsComm",
        title: "是否公用",
        width: "140px",
        type: ColumnType.JUDGMENTTAG,
    },
    {
        key: "Threshold",
        title: "阈值",
        width: "160px",

        type: ColumnType.SHORTTEXT,
    },
    {
        key: "HealthIndicatorTypeId",
        hidden: true,
    },

    {
        title: "操作",
        width: "300px",
        key: "Operate",
        type: ColumnType.USERDEFINED,
    },
]);

// 表单验证规则
const editModalFormRules = reactive({
    "Name": [
        { required: true, message: '该项为必填项', trigger: 'blur' },
    ],
    "BelongUserId": [
        { required: true, message: '该项为必填项', trigger: 'blur' },
    ],
    "HealthIndicatorTypeId": [
        { required: true, message: '该项为必填项', trigger: 'blur' },
    ],
    "Cover": [
        { required: true, message: '该项为必填项', trigger: 'blur' },
    ],
    "IsComm": [
        { required: true, message: '该项为必填项', trigger: 'blur' },
    ],
    "Threshold": [
        { required: true, message: '该项为必填项', trigger: 'blur' },
        {
            validator: (rule, value, callback) => {
                if (!value) {
                    callback();
                    return;
                }
                // 阈值格式验证：支持三种格式
                // 1. 范围格式：数字-数字 (如: 3.4-17.1)
                // 2. 大于格式：>数字 (如: >1.04)  
                // 3. 小于格式：<数字 (如: <3.4)
                const rangePattern = /^\d+(\.\d+)?-\d+(\.\d+)?$/; // 范围格式
                const greaterPattern = /^>\d+(\.\d+)?$/; // 大于格式
                const lessPattern = /^<\d+(\.\d+)?$/; // 小于格式

                if (rangePattern.test(value) || greaterPattern.test(value) || lessPattern.test(value)) {
                    // 如果是范围格式，需要验证前面的数字小于后面的数字
                    if (rangePattern.test(value)) {
                        const [start, end] = value.split('-').map(Number);
                        if (start >= end) {
                            callback(new Error('范围格式中前面的数值应小于后面的数值'));
                            return;
                        }
                    }
                    callback();
                } else {
                    callback(new Error('格式错误，请输入：范围(3.4-17.1) 或 大于(>1.04) 或 小于(<3.4)'));
                }
            },
            trigger: 'blur'
        },
    ],
    "Content": [
        { required: true, message: '该项为必填项', trigger: 'blur' },
    ],
});


// 表格引用
const PaginationTableId = ref(null);

// 显示编辑对话框
const ShowEditModal = async (Id) => {

    const { Data } = await Post(`/HealthIndicator/Get`, { Id: Id });
    if (!Id) {
        Data.BelongUserId = UserId.value;
    }
    Object.assign(formData, Data);

    editorShow.value = true;

};

// 创建或编辑表单
const CreateOrEditForm = async () => {
    if (!editModalForm.value) return;

    await editModalForm.value.validate(async valid => {
        if (valid) {
            const { Success } = await Post(`/HealthIndicator/CreateOrEdit`, formData);

            if (Success) {
                editorShow.value = false;
                PaginationTableId.value.Reload(searchForm);
                ElMessage.success('操作成功');
            }
        }
    });
};

// 搜索点击
const SearchClick = () => {
    PaginationTableId.value.Reload(searchForm);
};

// 重置搜索条件
const ResetClick = () => {
    Object.keys(searchForm).forEach(key => {
        searchForm[key] = undefined;
    });
    PaginationTableId.value.Reload(searchForm);
};

// 显示删除确认框
const ShowDeleteModal = async (Id) => {

    try {
        await ElMessageBox.confirm('确认删除该测试信息吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        })
        const { Success } = await Post(`/HealthIndicator/Delete`, { Id: Id });
        if (Success) {
            PaginationTableId.value.Reload(searchForm);
            ElMessage.success('删除成功');
        }
    }
    catch (error) {
        ElMessage.warning('用户放弃了操作');
    }
};

// 批量删除
const BatchDelete = async () => {
    const ids = PaginationTableId.value.GetSelectionRow().map(x => x.Id);
    if (ids.length > 0) {
        try {
            await ElMessageBox.confirm('确认删除所选的行数据吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            })


            const { Success } = await Post(`/HealthIndicator/BatchDelete`, { Ids: ids });
            if (Success) {
                PaginationTableId.value.Reload(searchForm);
                ElMessage.success('删除成功');
            }
        }
        catch (error) {
            ElMessage.warning('用户放弃了操作');
        }
    }
    else {
        ElMessage.warning('用户放弃了操作');
    }
};
onBeforeMount(() => {

});
</script>

<style scoped></style>
