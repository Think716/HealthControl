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
                    <el-form-item label="标题" prop="Title">
                        <el-input v-model.trim="searchForm.Title" placeholder="请输入标题" :clearable="true"></el-input>
                    </el-form-item>
                    <el-form-item label="分类">
                        <SigleSelect url="/HealthArticleType/List" class="search-input" columnName="Name" :clearable="true"
                            columnValue="Id" v-model="searchForm.HealthArticleTypeId">
                        </SigleSelect>
                    </el-form-item>
                    <el-form-item label="发布人">
                        <SigleSelect url="/User/List" class="search-input" columnName="Name" :clearable="true"
                            columnValue="Id" v-model="searchForm.PublishUserId">
                        </SigleSelect>
                    </el-form-item>
                    <el-form-item label="审核状态">
                        <SigleSelect url="/Select/AuditStatusEnum" class="search-input" columnName="Name" :clearable="true"
                            columnValue="Code" v-model="searchForm.AuditStatus">
                        </SigleSelect>
                    </el-form-item>
                    <el-form-item label="审核人">
                        <SigleSelect url="/User/List" class="search-input" columnName="Name" :clearable="true"
                            columnValue="Id" v-model="searchForm.AuditUserId">
                        </SigleSelect>
                    </el-form-item>
                    <el-form-item label="审核时间" class="search-input">
                        <el-date-picker v-model="searchForm.AuditTimeRange" type="datetimerange" start-placeholder="开始审核时间"
                            end-placeholder="结束审核时间" value-format="YYYY-MM-DD HH:mm:ss">
                        </el-date-picker>
                    </el-form-item>

                </el-form>
            </div>
        </el-card>
        <!-- 编辑对话框 -->
        <el-dialog :title="formData.Id ? '修改健康知识' : '添加健康知识'" v-model="editorShow" width="50%" :lock-scroll="true"
            min-height="500px">
            <el-form v-if="editorShow" ref="editModalForm" :rules="editModalFormRules" :model="formData" label-width="140px"
                size="default">
                <el-row :gutter="10" class="edit-from-body">

                    <el-col :span="24">
                        <el-form-item label="标题" prop="Title">
                            <el-input type="text" v-model="formData.Title" placeholder="请输入标题" :clearable="true"></el-input>
                        </el-form-item>
                    </el-col>


                    <el-col :span="24">
                        <el-form-item label="分类" prop="HealthArticleTypeId">
                            <SigleSelect url="/HealthArticleType/List" columnName="Name" columnValue="Id"
                                v-model="formData.HealthArticleTypeId">
                            </SigleSelect>
                        </el-form-item>
                    </el-col>

                    <el-col :span="24">
                        <el-form-item label="发布人" prop="PublishUserId">
                            <SigleSelect url="/User/List" columnName="Name" columnValue="Id"
                                v-model="formData.PublishUserId">
                            </SigleSelect>
                        </el-form-item>
                    </el-col>

                    <el-col :span="24">
                        <el-form-item label="审核人" prop="AuditUserId">
                            <SigleSelect url="/User/List" columnName="Name" columnValue="Id" v-model="formData.AuditUserId">
                            </SigleSelect>
                        </el-form-item>
                    </el-col>

                    <el-col :span="24">
                        <el-form-item label="审核状态" prop="AuditStatus">
                            <SigleSelect url="/Select/AuditStatusEnum" columnName="Name" columnValue="Code"
                                v-model="formData.AuditStatus">
                            </SigleSelect>
                        </el-form-item>
                    </el-col>

                    <el-col :span="24">
                        <el-form-item label="封面" prop="Cover">
                            <UploadImages :limit="1" category="diet-covers" v-model="formData.Cover"></UploadImages>
                        </el-form-item>
                    </el-col>

                    <el-col :span="24">
                        <el-form-item label="浏览量" prop="ViewCount">
                            <el-input-number v-model="formData.ViewCount" placeholder="请输入浏览量" :clearable="true" :min="1"
                                :max="1000000"></el-input-number>
                        </el-form-item>
                    </el-col>

                    <el-col :span="24">
                        <el-form-item label="审核时间" prop="AuditTime">
                            <el-date-picker v-model="formData.AuditTime" align="right" type="datetime" placeholder="选择时间"
                                value-format="YYYY-MM-DD HH:mm:ss">
                            </el-date-picker>
                        </el-form-item>
                    </el-col>

                    <el-col :span="24">
                        <el-form-item label="内容" prop="Content">
                            <AIRichText category="health-article-content" v-model="formData.Content"></AIRichText>
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

        <!-- 审核对话框 -->
        <el-dialog title="审核健康知识" v-model="auditDialogShow" width="40%" :lock-scroll="true">
            <el-form v-if="auditDialogShow" ref="auditForm" :rules="auditFormRules" :model="auditFormData"
                label-width="100px" size="default">
                <el-form-item label="审核状态" prop="AuditStatus">
                    <el-radio-group v-model="auditFormData.AuditStatus">
                        <el-radio label="2">审核通过</el-radio>
                        <el-radio label="3">审核失败</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="审核原因" prop="AuditReply">
                    <el-input type="textarea" v-model="auditFormData.AuditReply" placeholder="请输入审核原因" :rows="4"
                        :clearable="true"></el-input>
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button size="default" @click="auditDialogShow = false">取 消</el-button>
                    <el-button size="default" type="primary" @click="SubmitAudit()">确 定</el-button>
                </span>
            </template>
        </el-dialog>

        <!-- 数据表格 -->
        <PaginationTable ref="PaginationTableId" url="/HealthArticle/List" :column="columnList">
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

                <el-button type="success" v-if="scope.row.AuditStatus == 1" size="default" class="margin-top-xs"
                    @click="ShowAuditModal(scope.row.Id)">
                    <el-icon>
                        <Check />
                    </el-icon>审 核
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

import { Delete, Edit, Refresh, Search, Check } from '@element-plus/icons-vue';
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

// 审核对话框显示状态
const auditDialogShow = ref(false);

// 审核表单数据
const auditFormData = reactive({
    Id: null,
    AuditStatus: '',
    AuditReply: ''
});

// 表单引用
const editModalForm = ref(null);

// 审核表单引用
const auditForm = ref(null);

// 表格列配置
const columnList = ref([
    {
        key: "Id",
        hidden: true,

    },
    {
        key: "Title",
        title: "标题",
        width: "160px",

        type: ColumnType.SHORTTEXT,
    },
    {
        key: "HealthArticleTypeId",
        hidden: true,
    },
    {
        key: "HealthArticleTypeDto.Name",
        title: "分类名称",
        width: "160px",

        type: ColumnType.SHORTTEXT,
    },
    {
        key: "Cover",
        title: "封面",
        type: ColumnType.IMAGES,
    },
    {
        key: "PublishUserId",
        hidden: true,
    },
    {
        key: "PublishUserDto.UserName",
        title: "发布人",
        width: "160px",

        type: ColumnType.SHORTTEXT,
    },
    {
        key: "Content",
        title: "内容",
        width: "140px",
        type: ColumnType.RICHTEXT,
    },
    {
        key: "ViewCount",
        title: "浏览量",
        width: "160px",

        type: ColumnType.SHORTTEXT,
    },
    {
        key: "AuditStatus",
        hidden: true,
    }, {
        key: "AuditStatusFormat",
        title: "审核状态",
        width: "160px",

        type: ColumnType.SHORTTEXT,
    },
    {
        key: "AuditTime",
        title: "审核时间",
        width: "240px",
        type: ColumnType.DATETIME,
    },
    {
        key: "AuditUserId",
        hidden: true,
    },
    {
        key: "AuditReply",
        title: "审核回复",
        width: "160px",
        type: ColumnType.SHORTTEXT,
    },
    {
        key: "AuditUserDto.UserName",
        title: "审核账号",
        width: "160px",

        type: ColumnType.SHORTTEXT,
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
    "Title": [
        { required: true, message: '该项为必填项', trigger: 'blur' },
    ],
    "HealthArticleTypeId": [
        { required: true, message: '该项为必填项', trigger: 'blur' },
    ],
    "PublishUserId": [
        { required: true, message: '该项为必填项', trigger: 'blur' },
    ],
    "AuditUserId": [
        { required: true, message: '该项为必填项', trigger: 'blur' },
    ],
    "AuditStatus": [
        { required: true, message: '该项为必填项', trigger: 'blur' },
    ],
    "Cover": [
        { required: true, message: '该项为必填项', trigger: 'blur' },
    ],
    "ViewCount": [
        { required: true, message: '该项为必填项', trigger: 'blur' },
    ],
    "AuditTime": [
        { required: true, message: '该项为必填项', trigger: 'blur' },
    ],
    "Content": [
        { required: true, message: '该项为必填项', trigger: 'blur' },
    ],
});

// 审核表单验证规则
const auditFormRules = reactive({
    "AuditStatus": [
        { required: true, message: '请选择审核状态', trigger: 'change' },
    ],
    "AuditReply": [
        { required: true, message: '请输入审核原因', trigger: 'blur' },
    ],
});

// 表格引用
const PaginationTableId = ref(null);

// 显示编辑对话框
const ShowEditModal = async (Id) => {

    const { Data } = await Post(`/HealthArticle/Get`, { Id: Id });

    Object.assign(formData, Data);

    editorShow.value = true;

};

// 创建或编辑表单
const CreateOrEditForm = async () => {
    if (!editModalForm.value) return;

    await editModalForm.value.validate(async valid => {
        if (valid) {
            const { Success } = await Post(`/HealthArticle/CreateOrEdit`, formData);

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
        const { Success } = await Post(`/HealthArticle/Delete`, { Id: Id });
        if (Success) {
            PaginationTableId.value.Reload(searchForm);
            ElMessage.success('删除成功');
        }
    }
    catch (error) {
        ElMessage.warning('用户放弃了操作');
    }
};

// 显示审核对话框
const ShowAuditModal = (Id) => {
    // 重置审核表单数据
    auditFormData.Id = Id;
    auditFormData.AuditStatus = '';
    auditFormData.AuditReply = '';

    auditDialogShow.value = true;
};

// 提交审核
const SubmitAudit = async () => {
    if (!auditForm.value) return;

    await auditForm.value.validate(async valid => {
        if (valid) {
            // 设置审核时间为当前时间
            const auditData = {
                Id: auditFormData.Id,
                AuditStatus: auditFormData.AuditStatus,
                AuditReply: auditFormData.AuditReply,
                AuditTime: window.YMDHMSFormat(new Date()),
                AuditUserId: UserId.value
            };

            const { Success } = await Post(`/HealthArticle/Audit`, auditData);

            if (Success) {
                auditDialogShow.value = false;
                PaginationTableId.value.Reload(searchForm);
                ElMessage.success('审核成功');
            }
        }
    });
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


            const { Success } = await Post(`/HealthArticle/BatchDelete`, { Ids: ids });
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
