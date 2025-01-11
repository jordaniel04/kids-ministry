<template>
    <VDialog 
        :model-value="modelValue" 
        @update:model-value="$emit('update:modelValue', $event)"
        max-width="500px"
    >
        <VCard>
            <VCardTitle>
                <span class="text-h5">{{ formTitle }}</span>
            </VCardTitle>

            <VCardText>
                <VContainer>
                    <VRow>
                        <VCol cols="12" sm="6">
                            <VSelect
                                v-model="editedItem.areaNumber"
                                :items="areaNumbers"
                                label="Número de Área"
                                required
                                :rules="[v => !!v || 'El área es requerida']"
                            ></VSelect>
                        </VCol>
                        <VCol cols="12" sm="6">
                            <VSelect
                                v-model="editedItem.districtNumber"
                                :items="districtNumbers"
                                label="Número de Distrito"
                                required
                                :rules="[v => !!v || 'El distrito es requerido']"
                            ></VSelect>
                        </VCol>
                        <VCol cols="12">
                            <VTextField
                                v-model="editedItem.location"
                                label="Lugar"
                                required
                                :rules="[v => !!v || 'El lugar es requerido']"
                            ></VTextField>
                        </VCol>
                    </VRow>
                </VContainer>
            </VCardText>

            <VCardActions>
                <VSpacer></VSpacer>
                <VBtn color="error" variant="text" @click="$emit('close')">Cancelar</VBtn>
                <VBtn color="success" variant="text" @click="save">Guardar</VBtn>
            </VCardActions>
        </VCard>
    </VDialog>
</template>


<script lang="ts">
export default {
    name: 'DistrictFormDialog'
}
</script>


<script setup lang="ts">
// defineOptions({
//   name: 'DistrictFormDialog'
// });

import { computed } from 'vue';
import type { District } from '../types/District';

const props = defineProps<{
    modelValue: boolean;
    editedItem: District;
    editedIndex: number;
}>();

const emit = defineEmits<{
    'update:modelValue': [value: boolean];
    'save': [item: District];
    'close': [];
}>();

// Arrays para los selectores
const areaNumbers = Array.from({ length: 11 }, (_, i) => i + 1);
const districtNumbers = Array.from({ length: 10 }, (_, i) => i + 1);

const formTitle = computed(() => {
    return props.editedIndex === -1 ? 'Nuevo Distrito' : 'Editar Distrito'
});

const save = () => {
    emit('save', props.editedItem);
};
</script> 