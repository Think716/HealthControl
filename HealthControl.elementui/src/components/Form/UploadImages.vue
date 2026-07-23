<template>
    <div class="upload-files-wrap">
        <el-upload :action="uploadUrl" :data="uploadData" list-type="picture-card" :show-file-list="true"
            :on-success="handleUploadSuccess" :on-remove="handleRemove" :file-list="fileList"
            accept=".jpg,.png,.jpeg,.jfif,.webp,.svg" :limit="limit" :multiple="limit > 1">
            <el-icon>
                <Plus />
            </el-icon>
        </el-upload>
    </div>
</template>

<script setup>
import { GetFileNameByPath } from "@/utils/comm.js";
import { Plus } from '@element-plus/icons-vue';
import { computed, ref, watch } from 'vue';

const props = defineProps({
    modelValue: {
        type: [Number, String],
        default: ''
    },
    limit: {
        type: Number,
        default: 1,
    },
    category: {
        type: String,
        default: 'uploads'
    },
})

const emit = defineEmits(['update:modelValue'])

const uploadUrl = import.meta.env.VITE_API_BASE_URL + "/File/BatchUpload"
const uploadData = computed(() => ({ category: props.category || 'uploads' }))
const fileList = ref([])

watch(() => props.modelValue, (newVal) => {
    if (!newVal) {
        fileList.value = []
        return
    }

    fileList.value = String(newVal).split(",").filter(Boolean).map(x => ({
        url: x,
        name: GetFileNameByPath(x),
        status: "success"
    }))
}, { immediate: true })

const FileListConvert = (files) => {
    const list = []
    if (Array.isArray(files)) {
        files.filter(x => x.status === "success").forEach((item) => {
            if (item.response != null) {
                list.push({ name: item.name || "", url: item.response.Data[0].Url, status: "success" })
            } else {
                list.push(item)
            }
        })
    }
    return list
}

const updateValue = (files) => {
    const fs = FileListConvert(files)
    const url = fs.length > 0 ? fs.map(x => x.url).join(",") : ""
    fileList.value = fs
    emit('update:modelValue', url)
}

const handleUploadSuccess = (response, file, files) => {
    updateValue(files)
}

const handleRemove = (file, files) => {
    updateValue(files)
}
</script>

<style scoped>
.upload-files-wrap {
    width: 100%;
}

:deep(.el-upload--picture-card) {
    background-color: transparent !important;
}

:deep(.el-upload--picture-card .el-icon) {
    font-size: 28px;
    color: #8c939d;
}
</style>
