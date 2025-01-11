<template>
    <div>
        <NavigationBar />
        <VContainer>
            <h1>Gestión de Períodos de Reporte</h1>
            
            <VCard class="mb-4">
                <VCardTitle class="d-flex justify-space-between align-center">
                    <span>Períodos de Reporte</span>
                    <VBtn
                        color="primary"
                        prepend-icon="mdi-plus"
                        @click="dialog = true"
                    >
                        Nuevo Período
                    </VBtn>
                </VCardTitle>
                
                <VCardText>
                    <VDataTable
                        :headers="headers"
                        :items="periods"
                        :loading="loading"
                    >
                        <template #[`item.startDate`]="{ item }">
                            {{ formatDate(item.startDate) }}
                        </template>
                        <template #[`item.endDate`]="{ item }">
                            {{ formatDate(item.endDate) }}
                        </template>
                        <template #[`item.isActive`]="{ item }">
                            <VSwitch
                                v-model="item.isActive"
                                @change="togglePeriodStatus(item)"
                                :loading="updatingId === item.id"
                            ></VSwitch>
                        </template>
                    </VDataTable>
                </VCardText>
            </VCard>

            <VDialog v-model="dialog" max-width="500px">
                <VCard>
                    <VCardTitle>
                        <span class="text-h5">{{ formTitle }}</span>
                    </VCardTitle>

                    <VCardText>
                        <VContainer>
                            <VRow>
                                <VCol cols="12">
                                    <VTextField
                                        v-model="editedItem.name"
                                        label="Nombre del Período"
                                        required
                                    ></VTextField>
                                </VCol>
                                <VCol cols="12">
                                    <VTextField
                                        v-model="editedItem.description"
                                        label="Descripción"
                                    ></VTextField>
                                </VCol>
                                <VCol cols="12" sm="6">
                                    <VDatePicker
                                        v-model="editedItem.startDate"
                                        label="Fecha de Inicio"
                                        required
                                    ></VDatePicker>
                                </VCol>
                                <VCol cols="12" sm="6">
                                    <VDatePicker
                                        v-model="editedItem.endDate"
                                        label="Fecha de Fin"
                                        required
                                    ></VDatePicker>
                                </VCol>
                            </VRow>
                        </VContainer>
                    </VCardText>

                    <VCardActions>
                        <VSpacer></VSpacer>
                        <VBtn color="error" variant="text" @click="closeDialog">Cancelar</VBtn>
                        <VBtn color="success" variant="text" @click="savePeriod">Guardar</VBtn>
                    </VCardActions>
                </VCard>
            </VDialog>
        </VContainer>
    </div>
</template> 

<script setup lang="ts">
import { ref, computed } from 'vue';
import NavigationBar from '../../components/NavigationBar.vue';
import type { ReportPeriod } from '../../types/MinisterialReport';
import { Timestamp } from 'firebase/firestore';

const dialog = ref(false);
const loading = ref(false);
const updatingId = ref<string | null>(null);
const periods = ref<ReportPeriod[]>([]);

const headers = [
    { title: 'Nombre', key: 'name' },
    { title: 'Descripción', key: 'description' },
    { title: 'Fecha Inicio', key: 'startDate' },
    { title: 'Fecha Fin', key: 'endDate' },
    { title: 'Estado', key: 'isActive' }
];

const editedItem = ref<ReportPeriod>({
    id: '',
    name: '',
    description: '',
    startDate: Timestamp.now(),
    endDate: Timestamp.now(),
    isActive: false
});

const formTitle = computed(() => 'Nuevo Período');

const formatDate = (date: Timestamp) => {
    return date.toDate().toLocaleDateString('es-ES');
};

const closeDialog = () => {
    dialog.value = false;
};

const savePeriod = () => {
    // Implementar lógica de guardado
    closeDialog();
};

const togglePeriodStatus = (item: ReportPeriod) => {
    // Implementar lógica de cambio de estado
};
</script> 