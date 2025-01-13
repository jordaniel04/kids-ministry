<template>
    <div class="d-flex flex-column" style="min-height: 100vh;">
        <NavigationBar class="z-10" />
        <VContainer class="flex-grow-1">
            <div class="d-flex justify-space-between align-center mb-4">
                <h1>Gestión de Períodos de Reporte</h1>
                <VBtn
                    color="primary"
                    prepend-icon="mdi-plus"
                    @click.stop="createItem"
                >
                    Nuevo Período
                </VBtn>
            </div>

            <VCard>
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
                            <VTooltip location="top">
                                <template v-slot:activator="{ props }">
                                    <VSwitch
                                        v-bind="props"
                                        v-model="item.isActive"
                                        @change="togglePeriodStatus(item)"
                                        :loading="updatingId === item.id"
                                        :color="item.isActive ? 'success' : 'grey'"
                                        density="compact"
                                        hide-details
                                        inset
                                    />
                                </template>
                                <span>{{ item.isActive ? 'Período activo' : 'Período inactivo' }}</span>
                            </VTooltip>
                        </template>

                        <template #[`item.allowEditing`]="{ item }">
                            <VTooltip location="top">
                                <template v-slot:activator="{ props }">
                                    <VSwitch
                                        v-bind="props"
                                        v-model="item.allowEditing"
                                        @change="togglePeriodEditing(item)"
                                        :loading="updatingId === item.id"
                                        :color="item.allowEditing ? 'info' : 'grey'"
                                        density="compact"
                                        hide-details
                                        inset
                                    />
                                </template>
                                <span>{{ item.allowEditing ? 'Edición permitida' : 'Edición bloqueada' }}</span>
                            </VTooltip>
                        </template>

                        <template #[`item.edit`]="{ item }">
                            <VBtn
                                icon
                                color="primary"
                                size="small"
                                variant="tonal"
                                @click="editItem(item)"
                            >
                                <VIcon>mdi-pencil</VIcon>
                                <VTooltip activator="parent" location="top">Editar período</VTooltip>
                            </VBtn>
                        </template>
                    </VDataTable>
                </VCardText>
            </VCard>

            <!-- Diálogo para crear/editar período -->
            <VDialog
                v-model="dialog"
                max-width="500px"
                persistent
                @click:outside="closeDialog"
            >
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
                                        :rules="[v => !!v || 'El nombre es requerido']"
                                        required
                                    />
                                </VCol>
                                <VCol cols="12">
                                    <VTextarea
                                        v-model="editedItem.description"
                                        label="Descripción"
                                        rows="3"
                                    />
                                </VCol>
                                <VCol cols="12" sm="6">
                                    <VTextField
                                        v-model="editedItem.startDate"
                                        label="Fecha Inicio"
                                        type="date"
                                        :rules="[rules.required]"
                                        required
                                    />
                                </VCol>
                                <VCol cols="12" sm="6">
                                    <VTextField
                                        v-model="editedItem.endDate"
                                        label="Fecha Fin"
                                        type="date"
                                        :rules="[rules.required, rules.dateOrder]"
                                        required
                                    />
                                </VCol>
                            </VRow>
                        </VContainer>
                    </VCardText>

                    <VCardActions>
                        <VSpacer />
                        <VBtn 
                            color="error" 
                            variant="text" 
                            @click.stop="closeDialog"
                        >
                            Cancelar
                        </VBtn>
                        <VBtn 
                            color="success" 
                            variant="text" 
                            @click.stop="savePeriod"
                            :disabled="!isFormValid"
                        >
                            Guardar
                        </VBtn>
                    </VCardActions>
                </VCard>
            </VDialog>
        </VContainer>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { collection, doc, getDocs, addDoc, updateDoc, Timestamp, query, where, writeBatch } from 'firebase/firestore';
import { db } from '../../firebase/config';
import type { ReportPeriod } from '../../types/MinisterialReport';
import NavigationBar from '../../components/NavigationBar.vue';

const dialog = ref(false);

const loading = ref(true);
const updatingId = ref<string | null>(null);
const periods = ref<ReportPeriod[]>([]);

interface EditedItem {
    id: string;
    name: string;
    description?: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
    allowEditing: boolean;
}

const defaultItem: EditedItem = {
    id: '',
    name: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    isActive: false,
    allowEditing: false
};

const editedItem = ref<EditedItem>({ ...defaultItem });
const editedIndex = ref(-1);

const headers = [
    { title: 'Nombre', key: 'name', align: 'start' as const },
    { title: 'Descripción', key: 'description', align: 'start' as const },
    { title: 'Fecha Inicio', key: 'startDate', align: 'center' as const },
    { title: 'Fecha Fin', key: 'endDate', align: 'center' as const },
    { 
        title: 'Período Activo', 
        key: 'isActive', 
        align: 'center' as const,
        width: '120px',
        sortable: false,
        tooltip: 'Indica si es el período actual de reporte'
    },
    { 
        title: 'Permitir Edición', 
        key: 'allowEditing', 
        align: 'center' as const,
        width: '120px',
        sortable: false,
        tooltip: 'Habilita/Deshabilita la edición de datos ministeriales'
    },
    { 
        title: 'Editar', 
        key: 'edit',
        align: 'center' as const,
        width: '80px',
        sortable: false 
    }
];

const formTitle = computed(() => {
    return editedIndex.value === -1 ? 'Nuevo Período' : 'Editar Período';
});

const formatDate = (date: Timestamp | null | undefined) => {
    if (!date) return '';
    if (date instanceof Timestamp) {
        return date.toDate().toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }
    return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
};

const dateToTimestamp = (date: string | Timestamp | Date) => {
    if (date instanceof Timestamp) return date;
    if (date instanceof Date) return Timestamp.fromDate(date);
    return Timestamp.fromDate(new Date(date));
};

const closeDialog = () => {
    dialog.value = false;
    editedItem.value = { ...defaultItem };
    editedIndex.value = -1;
};

const loadPeriods = async () => {
    loading.value = true;
    try {
        const querySnapshot = await getDocs(collection(db, "report_periods"));
        periods.value = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name,
                description: data.description || '',
                startDate: data.startDate,
                endDate: data.endDate,
                isActive: data.isActive || false,
                allowEditing: data.allowEditing ?? false
            } as ReportPeriod;
        });
    } catch (error) {
        console.error("Error al cargar períodos:", error);
        alert("Error al cargar los períodos");
    } finally {
        loading.value = false;
    }
};

const savePeriod = async () => {
    try {
        const periodData = {
            name: editedItem.value.name,
            description: editedItem.value.description,
            startDate: dateToTimestamp(editedItem.value.startDate),
            endDate: dateToTimestamp(editedItem.value.endDate),
            isActive: editedItem.value.isActive,
            allowEditing: editedItem.value.allowEditing
        };

        if (editedItem.value.id) {
            await updateDoc(doc(db, "report_periods", editedItem.value.id), periodData);
        } else {
            await addDoc(collection(db, "report_periods"), periodData);
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
        const batch = writeBatch(db);
        
        if (item.isActive) {
            // Si se está activando, desactivar otros períodos activos
            const activePeriodsQuery = query(
                collection(db, "report_periods"),
                where("isActive", "==", true)
            );
            const activePeriodsSnapshot = await getDocs(activePeriodsQuery);
            
            activePeriodsSnapshot.docs.forEach(doc => {
                if (doc.id !== item.id) {
                    batch.update(doc.ref, { 
                        isActive: false,
                        allowEditing: false 
                    });
                }
            });
        }
        
        // Actualizar el período actual
        const periodRef = doc(db, "report_periods", item.id);
        batch.update(periodRef, {
            isActive: item.isActive,
            allowEditing: item.isActive ? item.allowEditing : false
        });
        
        // Ejecutar todas las actualizaciones en una sola transacción
        await batch.commit();
        await loadPeriods();
    } catch (error) {
        console.error("Error al cambiar estado:", error);
        alert("Error al cambiar el estado del período");
        // Revertir cambios locales si hay error
        item.isActive = !item.isActive;
    } finally {
        updatingId.value = null;
    }
};

const togglePeriodEditing = async (item: ReportPeriod) => {
    updatingId.value = item.id;
    try {
        await updateDoc(doc(db, "report_periods", item.id), {
            allowEditing: item.allowEditing
        });
        await loadPeriods();
    } catch (error) {
        console.error("Error al cambiar estado de edición:", error);
        alert("Error al cambiar el estado de edición");
    } finally {
        updatingId.value = null;
    }
};

const createItem = () => {
    editedIndex.value = -1;
    editedItem.value = { ...defaultItem };
    dialog.value = true;
};

const editItem = (item: ReportPeriod) => {
    editedIndex.value = periods.value.indexOf(item);
    editedItem.value = {
        ...item,
        startDate: item.startDate instanceof Timestamp 
            ? item.startDate.toDate().toISOString().split('T')[0]
            : new Date(item.startDate).toISOString().split('T')[0],
        endDate: item.endDate instanceof Timestamp 
            ? item.endDate.toDate().toISOString().split('T')[0]
            : new Date(item.endDate).toISOString().split('T')[0]
    };
    dialog.value = true;
};

const rules = {
    required: (v: any) => !!v || 'Este campo es requerido',
    dateOrder: (v: string) => {
        if (!v || !editedItem.value.startDate) return true;
        return v >= editedItem.value.startDate || 'La fecha de fin debe ser posterior a la fecha de inicio';
    }
};

const isFormValid = computed(() => {
    return (
        !!editedItem.value.name &&
        !!editedItem.value.startDate &&
        !!editedItem.value.endDate &&
        editedItem.value.endDate >= editedItem.value.startDate
    );
});

onMounted(async () => {
    await loadPeriods();
});
</script> 

<style scoped>
.v-switch {
    margin-top: 0;
    margin-bottom: 0;
}
</style> 