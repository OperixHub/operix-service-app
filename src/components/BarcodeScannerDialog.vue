<script setup>
import { nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { BrowserMultiFormatReader } from '@zxing/browser';

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    title: { type: String, default: 'Ler código da peça' }
});

const emit = defineEmits(['update:modelValue', 'detected']);
const video = ref(null);
const manualCode = ref('');
const errorMessage = ref('');
const scanning = ref(false);
let stream = null;
let scannerControls = null;
let reader = null;
let detected = false;

const close = () => {
    stopScanner();
    emit('update:modelValue', false);
};

const parseValue = (value) => {
    try { return JSON.parse(value); } catch { return null; }
};

const emitDetected = (value) => {
    if (detected) return;
    const rawValue = String(value || '').trim();
    if (!rawValue) return;
    detected = true;
    stopScanner();
    emit('detected', { rawValue, data: parseValue(rawValue) });
    emit('update:modelValue', false);
};

const startScanner = async () => {
    errorMessage.value = '';
    manualCode.value = '';
    detected = false;
    await nextTick();
    try {
        reader = new BrowserMultiFormatReader();
        scanning.value = true;
        scannerControls = await reader.decodeFromConstraints(
            { video: { facingMode: { ideal: 'environment' } }, audio: false },
            video.value,
            (result) => {
                if (result) emitDetected(result.getText());
            }
        );
    } catch (error) {
        scanning.value = false;
        errorMessage.value = error.name === 'NotAllowedError'
            ? 'Acesso à câmera não autorizado. Permita o uso da câmera ou informe o código manualmente.'
            : 'Não foi possível iniciar a câmera. Informe o código manualmente.';
    }
};

const stopScanner = () => {
    scanning.value = false;
    if (scannerControls) {
        try { scannerControls.stop(); } catch { /* scanner already stopped */ }
    }
    scannerControls = null;
    if (reader) {
        try { reader.reset(); } catch { /* reader already reset */ }
    }
    if (stream) stream.getTracks().forEach((track) => track.stop());
    stream = null;
    reader = null;
    if (video.value) {
        video.value.pause();
        video.value.srcObject = null;
    }
};

const submitManual = () => emitDetected(manualCode.value);

watch(() => props.modelValue, (visible) => {
    if (visible) startScanner();
    else stopScanner();
});
onBeforeUnmount(stopScanner);
</script>

<template>
    <Dialog :header="title" :visible="modelValue" @update:visible="emit('update:modelValue', $event)" :modal="true" :style="{ width: 'min(92vw, 38rem)' }" :breakpoints="{ '640px': '100vw' }">
        <div class="flex flex-column align-items-center gap-3">
            <div v-if="modelValue" class="barcode-scanner-frame w-full">
                <video ref="video" class="barcode-scanner-video" autoplay playsinline muted />
                <div class="barcode-scanner-guide" />
            </div>
            <Message v-if="errorMessage" severity="info" class="w-full">{{ errorMessage }}</Message>
            <div class="w-full mt-3">
                <span class="p-float-label">
                    <InputText id="manualBarcode" v-model="manualCode" class="w-full" @keyup.enter="submitManual" />
                    <label for="manualBarcode"><span class="text-red-500">*</span> Código, QR Code ou número de série</label>
                </span>
            </div>
            <small class="text-600 text-center">Aponte a câmera para o código ou informe o valor manualmente.</small>
        </div>
        <template #footer>
            <Button label="Cancelar" icon="pi pi-times" class="p-button-text" @click="close" />
            <Button label="Continuar" icon="pi pi-check" :disabled="!manualCode.trim()" @click="submitManual" />
        </template>
    </Dialog>
</template>
