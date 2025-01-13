<template>
    <VDialog v-model="dialog" max-width="900px">
        <VCard>
            <VCardTitle>
                <span class="text-h5">Historial de {{ church?.name }}</span>
            </VCardTitle>

            <VCardText>
                <VContainer>
                    <VRow>
                        <VCol cols="12">
                            <VDataTable :headers="headers" :items="sortedHistory" :loading="loading">
                                <template #[`item.updatedAt`]="{ item }">
                                    {{ formatDate(item.updatedAt) }}
                                </template>
                                <template #[`item.reportPeriod`]="{ item }">
                                    {{ getReportPeriodName(item.reportPeriodId) }}
                                </template>
                            </VDataTable>
                        </VCol>
                    </VRow>
                </VContainer>
            </VCardText>

            <VCardActions>
                <VSpacer></VSpacer>
                <VBtn color="primary" variant="text" @click="dialog = false">
                    Cerrar
                </VBtn>
            </VCardActions>
        </VCard>
    </VDialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineOptions } from 'vue';
import { Timestamp, collection, getDoc, doc } from 'firebase/firestore';
import type { Church } from '../types/Church';
import { db } from '../firebase/config';

defineOptions({
    name: 'ChurchHistoryDialog'
});

const props = defineProps<{
    modelValue: boolean;
    church?: Church;
}>();

const emit = defineEmits(['update:modelValue']);

const dialog = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
});

const loading = ref(false);
const reportPeriods = ref<Map<string, string>>(new Map());

const headers = [
    { title: 'Fecha', key: 'updatedAt', sortable: true },
    { title: 'Período', key: 'reportPeriod', sortable: true },
    { title: 'Maestras', key: 'totalTeachers', sortable: true },
    { title: 'Niños', key: 'totalChildren', sortable: true },
    { title: 'Convertidos', key: 'convertedChildren', sortable: true },
    { title: 'Miembros', key: 'memberChildren', sortable: true },
    { title: 'No Arrepentidos', key: 'nonRepentantChildren', sortable: true },
    { title: 'Bautizados', key: 'baptizedChildren', sortable: true },
    { title: 'Graduados Consolidados', key: 'consolidatedGraduates', sortable: true },
    { title: 'Graduados Sacramentos', key: 'sacramentsGraduates', sortable: true }
];

const sortedHistory = computed(() => {
    if (!props.church?.ministerialData) return [];
    return [...props.church.ministerialData].sort((a, b) => {
        if (a.reportPeriodId && b.reportPeriodId) {
            const periodCompare = b.reportPeriodId.localeCompare(a.reportPeriodId);
            if (periodCompare !== 0) return periodCompare;
        }
        return b.updatedAt.seconds - a.updatedAt.seconds;
    });
});

const dateFormatter = new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
});

const formatDate = (timestamp: Timestamp) => {
    return dateFormatter.format(timestamp.toDate());
};

const getReportPeriodName = (periodId: string | null | undefined) => {
    return periodId ? reportPeriods.value.get(periodId) || 'Período no encontrado' : 'N/A';
};

const loadReportPeriods = async (periodIds: string[]) => {
    loading.value = true;
    const errors: string[] = [];
    
    try {
        const periodsRef = collection(db, "report_periods");
        const uniquePeriodIds = [...new Set(periodIds)];
        
        await Promise.all(uniquePeriodIds.map(async (periodId) => {
            try {
                const periodDoc = await getDoc(doc(periodsRef, periodId));
                if (periodDoc.exists()) {
                    reportPeriods.value.set(periodId, periodDoc.data().name);
                } else {
                    errors.push(`Período no encontrado: ${periodId}`);
                }
            } catch (error) {
                errors.push(`Error al cargar período ${periodId}: ${error}`);
            }
        }));

        if (errors.length > 0) {
            console.error("Errores durante la carga:", errors);
        }
    } catch (error) {
        console.error("Error general al cargar períodos:", error);
    } finally {
        loading.value = false;
    }
};

onMounted(async () => {
    if (props.church?.ministerialData) {
        const periodIds = props.church.ministerialData
            .map(data => data.reportPeriodId)
            .filter((id): id is string => !!id);

        if (periodIds.length > 0) {
            await loadReportPeriods(periodIds);
        }
    }
});
</script>