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
import { ref, computed, onMounted } from 'vue';
import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import NavigationBar from '../../components/NavigationBar.vue';
import type { ReportPeriod } from '../../types/MinisterialReport';

const dialog = ref(false);
const loading = ref(true);
const updatingId = ref<string | null>(null);
const periods = ref<ReportPeriod[]>([]);

const headers = [
    { title: 'Nombre', key: 'name' },
    { title: 'Descripción', key: 'description' },
    { title: 'Fecha Inicio', key: 'startDate' },
    { title: 'Fecha Fin', key: 'endDate' },
    { title: 'Estado', key: 'isActive' },
    { title: 'Acciones', key: 'actions' }
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

const loadPeriods = async () => {
    loading.value = true;
    try {
        const querySnapshot = await getDocs(collection(db, "report_periods"));
        periods.value = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as ReportPeriod));
    } catch (error) {
        console.error("Error al cargar períodos:", error);
    } finally {
        loading.value = false;
    }
};

const savePeriod = async () => {
    try {
        if (editedItem.value.id) {
            // Actualizar período existente
            await updateDoc(doc(db, "report_periods", editedItem.value.id), {
                name: editedItem.value.name,
                description: editedItem.value.description,
                startDate: editedItem.value.startDate,
                endDate: editedItem.value.endDate,
                isActive: editedItem.value.isActive
            });
        } else {
            // Crear nuevo período
            await addDoc(collection(db, "report_periods"), {
                name: editedItem.value.name,
                description: editedItem.value.description,
                startDate: editedItem.value.startDate,
                endDate: editedItem.value.endDate,
                isActive: false
            });
        }
        await loadPeriods();
        closeDialog();
    } catch (error) {
        console.error("Error al guardar período:", error);
        alert("Error al guardar el período");
    }
};

const togglePeriodStatus = async (item: ReportPeriod) => {
    updatingId.value = item.id;
    try {
        if (item.isActive) {
            // Si se está activando, desactivar otros períodos activos
            const activePeriodsQuery = query(
                collection(db, "report_periods"),
                where("isActive", "==", true)
            );
            const activePeriodsSnapshot = await getDocs(activePeriodsQuery);
            
            for (const doc of activePeriodsSnapshot.docs) {
                if (doc.id !== item.id) {
                    await updateDoc(doc.ref, { isActive: false });
                }
            }
        }
        
        await updateDoc(doc(db, "report_periods", item.id), {
            isActive: item.isActive
        });
        
        await loadPeriods();
    } catch (error) {
        console.error("Error al cambiar estado:", error);
        alert("Error al cambiar el estado del período");
    } finally {
        updatingId.value = null;
    }
};

onMounted(loadPeriods);
</script> 