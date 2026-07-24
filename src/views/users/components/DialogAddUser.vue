<script setup>
import { useUserForm } from '../composables/useUserForm';
import { messageAddUser } from '@views/utils/messages.js';

const props = defineProps({
    getUsers: { type: Function, required: true }
});

const { dataPostUser, companyAccessCode, moduleOptions, displayModalAdd, openModalAdd, closeModal, validatePostUser } = useUserForm(props.getUsers);

const copyAccessCode = async () => {
    if (companyAccessCode.value) {
        await navigator.clipboard.writeText(companyAccessCode.value);
    }
};

defineExpose({ open: openModalAdd });
</script>

<template>
    <Dialog header="Adicionar Usuário" v-model:visible="displayModalAdd" position="top" :breakpoints="{ '960px': '75vw', '640px': '100vw' }" :style="{ width: 'clamp(22rem, 48vw, 42rem)' }" :modal="true">
        <transition-group tag="div">
            <Message v-for="msg of messageAddUser" :severity="msg.severity" :key="msg.content">{{ msg.content }}</Message>
        </transition-group>
        <div v-if="companyAccessCode" class="surface-100 border-1 surface-border p-3 mb-4">
            <label class="block text-600 text-sm mb-1">Código da empresa para acesso</label>
            <div class="flex align-items-center justify-content-between gap-2">
                <strong class="text-900">{{ companyAccessCode }}</strong>
                <Button icon="pi pi-copy" class="p-button-text p-button-sm" v-tooltip.top="'Copiar código'" @click="copyAccessCode" />
            </div>
        </div>
        <div class="grid p-fluid mt-1">
            <div class="field col-12">
                <span class="p-float-label">
                    <InputText type="text" id="addName" v-model="dataPostUser.name" />
                    <label for="addName"><span style="color: red">*</span> Nome </label>
                </span>
            </div>
            <div class="field col-12 md:col-6">
                <span class="p-float-label">
                    <InputText type="text" id="addUsername" v-model="dataPostUser.username" />
                    <label for="addUsername"><span style="color: red">*</span> Nome de Usuário </label>
                </span>
            </div>
            <div class="field col-12 md:col-6">
                <span class="p-float-label">
                    <Password id="addPassword" v-model="dataPostUser.password" toggleMask :feedback="false" />
                    <label for="addPassword"> <span style="color: red">*</span> Senha </label>
                </span>
            </div>
            <div class="field col-12 md:col-6">
                <span class="p-float-label">
                    <Password id="addConfirmPassword" v-model="dataPostUser.confirmPassword" toggleMask :feedback="false" />
                    <label for="addConfirmPassword"> <span style="color: red">*</span> Confirmar Senha </label>
                </span>
            </div>
            <div class="field col-12 md:col-6">
                <div class="flex align-items-center gap-2 h-full">
                    <Checkbox id="addAdmin" v-model="dataPostUser.admin" :binary="true" />
                    <label for="addAdmin">Administrador com acesso completo</label>
                </div>
            </div>
            <div class="field col-12">
                <span class="p-float-label">
                    <MultiSelect
                        id="addModules"
                        v-model="dataPostUser.modules"
                        :options="moduleOptions"
                        optionLabel="label"
                        optionValue="value"
                        display="chip"
                        class="w-full"
                        :disabled="dataPostUser.admin"
                    >
                        <template #option="{ option }">
                            <div>
                                <div class="font-medium">{{ option.label }}</div>
                                <small class="text-600">{{ option.description }}</small>
                            </div>
                        </template>
                    </MultiSelect>
                    <label for="addModules">Módulos permitidos</label>
                </span>
                <small class="text-600 block mt-2">
                    Usuários administradores têm acesso a todas as rotas. Usuários comuns veem somente os módulos selecionados.
                </small>
            </div>
        </div>
        <template #footer>
            <Button label="Cancelar" icon="pi pi-times" class="p-button-danger" @click="closeModal()" />
            <Button label="Adicionar" icon="pi pi-check" class="p-button-success" @click="validatePostUser()" />
        </template>
    </Dialog>
</template>
