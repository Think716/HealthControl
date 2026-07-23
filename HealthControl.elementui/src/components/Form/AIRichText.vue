<template>
    <div>
        <div id="aiEditor" :style="{ height: height }"></div>
    </div>
</template>

<script setup>
import { PostUpload } from "@/api/http";
import { AiEditor } from "aieditor";
import "aieditor/dist/style.css";
import { nextTick, onBeforeUnmount, onMounted, watch } from 'vue';

const props = defineProps({
    modelValue: {
        type: String,
        default: ''
    },
    height: {
        type: String,
        default: '300px'
    },
    category: {
        type: String,
        default: 'richtext-assets'
    }
})

const emit = defineEmits(['update:modelValue'])

const uploadUrl = import.meta.env.VITE_API_BASE_URL + "/File/BatchUpload"
let editor = null

const initEditor = () => {
    editor = new AiEditor({
        element: "#aiEditor",
        placeholder: "点击输入内容...",
        theme: "light",
        content: props.modelValue,
        contentIsMarkdown: false,
        contentRetention: false,
        contentRetentionKey: 'ai-editor-content',
        draggable: true,
        pasteAsText: false,
        image: {
            uploadUrl: uploadUrl,
            uploader: async (file, uploadUrl) => {
                const formData = new FormData()
                formData.append('file', file)
                formData.append('category', props.category)

                const { Data } = await PostUpload(uploadUrl, formData)

                return {
                    errorCode: 0,
                    data: {
                        src: Data[0].Url,
                        alt: Data[0].FileName,
                        align: "center",
                        width: "100%",
                        height: "auto",
                        class: "image-class",
                        loading: true,
                        "data-src": Data[0].Url
                    }
                }
            },
        },
        onChange: (aiEditor) => {
            emit('update:modelValue', aiEditor.getHtml())
        },
        ai: {
            models: {
                spark: {
                    appId: "2e9be894",
                    apiKey: "69b882dc87fb511d0b32198636617d57",
                    apiSecret: "NWE5OTJmZmM1MjAxYjViYTQ4OTdjMzg0",
                    version: "v1.1"
                }
            }
        }
    })
}

onMounted(() => {
    nextTick(() => {
        initEditor()
    })
})

onBeforeUnmount(() => {
    if (editor) {
        editor.destroy()
        editor = null
    }
})

watch(() => props.modelValue, (newValue) => {
    if (editor && newValue !== editor.getHtml()) {
        editor.setHtml(newValue)
    }
})
</script>

<style scoped>
#aiEditor {
    border: 1px solid #dcdfe6;
    border-radius: 4px;
}
</style>
