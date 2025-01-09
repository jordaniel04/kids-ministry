<template>
    <VDialog 
        :model-value="modelValue" 
        @update:model-value="$emit('update:modelValue', $event)"
        max-width="800px"
    >
        <template v-slot:activator="{ props }">
            <VBtn
                color="primary"
                v-bind="props"
                prepend-icon="mdi-plus"
            >
                Agregar Iglesia
            </VBtn>
        </template>
        <VCard>
            <VCardTitle>
                <span class="text-h5">{{ formTitle }}</span>
            </VCardTitle>

            <VCardText>
                <VContainer>
                    <VRow>
                        <VCol cols="12" sm="6">
                            <VTextField
                                v-model="editedItem.name"
                                label="Nombre de la Iglesia"
                                required
                            ></VTextField>
                        </VCol>
                        <VCol cols="12" sm="6">
                            <VTextField
                                v-model="editedItem.leaderName"
                                label="Nombre del Líder"
                                required
                            ></VTextField>
                        </VCol>
                        <VCol cols="12" sm="6">
                            <VTextField
                                v-model="editedItem.totalTeachers"
                                label="Total Maestras"
                                type="number"
                                required
                            ></VTextField>
                        </VCol>
                        <VCol cols="12" sm="6">
                            <VTextField
                                v-model="editedItem.totalChildren"
                                label="Total Niños"
                                type="number"
                                required
                            ></VTextField>
                        </VCol>
                        <VCol cols="12" sm="6">
                            <VTextField
                                v-model="editedItem.ministeredChildren"
                                label="Niños Ministrados"
                                type="number"
                                required
                            ></VTextField>
                        </VCol>
                        <VCol cols="12" sm="6">
                            <VTextField
                                v-model="editedItem.convertedChildren" 
                                label="Niños Convertidos"
                                type="number"
                                required
                            ></VTextField>
                        </VCol>
                        <VCol cols="12" sm="6">
                            <VTextField
                                v-model="editedItem.memberChildren"
                                label="Niños Miembros"
                                type="number"
                                required
                            ></VTextField>
                        </VCol>
                        <VCol cols="12" sm="6">
                            <VTextField
                                v-model="editedItem.baptizedChildren"
                                label="Niños Bautizados"
                                type="number"
                                required
                            ></VTextField>
                        </VCol>
                        <VCol cols="12" sm="6">
                            <VTextField
                                v-model="editedItem.consolidatedGraduates"
                                label="Graduados Consolidados"
                                type="number"
                                required
                            ></VTextField>
                        </VCol>
                        <VCol cols="12" sm="6">
                            <VTextField
                                v-model="editedItem.sacramentsGraduates"
                                label="Graduados Sacramentos"
                                type="number"
                                required
                            ></VTextField>
                        </VCol>
                        <VCol cols="12" sm="6">
                            <VTextField
                                v-model="editedItem.rescueClubChildren"
                                label="Niños Club de Rescate"
                                type="number"
                                required
                            ></VTextField>
                        </VCol>
                        <VCol cols="12" sm="6">
                            <VTextField
                                v-model="editedItem.discipleshipGraduates"
                                label="Graduados Discipulado"
                                type="number"
                                required
                            ></VTextField>
                        </VCol>
                        <VCol cols="12" sm="6">
                            <VTextField
                                v-model="editedItem.connection911Children"
                                label="Niños Conexión 911"
                                type="number"
                                required
                            ></VTextField>
                        </VCol>
                    </VRow>
                </VContainer>
            </VCardText>

            <VCardActions>
                <VSpacer></VSpacer>
                <VBtn color="error" variant="text" @click="close">Cancelar</VBtn>
                <VBtn color="success" variant="text" @click="save">Guardar</VBtn>
            </VCardActions>
        </VCard>
    </VDialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
    modelValue: boolean;
    editedItem: any;
    editedIndex: number;
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    editedIndex: -1
});

const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    'save': []
    'close': []
}>();

const formTitle = computed(() => {
    return props.editedIndex === -1 ? 'Nueva Iglesia' : 'Editar Iglesia'
});

const close = () => {
    emit('close');
};

const save = () => {
    emit('save');
};
</script> 