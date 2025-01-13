<template>
    <div>
        <NavigationBar />
        <VContainer>
            <h1>Reportes por Distrito</h1>

            <!-- Filtros -->
            <VCard class="mb-4">
                <VCardText>
                    <VRow>
                        <VCol cols="12" sm="6" md="4">
                            <VSelect
                                v-model="selectedDistrict"
                                :items="districts"
                                label="Distrito"
                                item-title="location"
                                item-value="id"
                                @update:model-value="loadDistrictData"
                            />
                        </VCol>
                        <VCol cols="12" sm="6" md="4">
                            <VSelect
                                v-model="selectedPeriod"
                                :items="periods"
                                label="Período"
                                item-title="name"
                                item-value="id"
                                @update:model-value="loadDistrictData"
                            />
                        </VCol>
                    </VRow>
                </VCardText>
            </VCard>

            <!-- Tabla de Datos -->
            <VCard v-if="selectedDistrict && selectedPeriod">
                <VCardTitle>Datos del Distrito</VCardTitle>
                <VCardText>
                    <VDataTable
                        :headers="headers"
                        :items="churchesData"
                        :loading="loading"
                    >
                        <template #bottom>
                            <div class="d-flex justify-end pt-4">
                                <div class="text-subtitle-1 font-weight-bold">
                                    Total Iglesias: {{ churchesData.length }}
                                </div>
                            </div>
                        </template>
                    </VDataTable>
                </VCardText>
            </VCard>

            <!-- Resumen de Totales -->
            <VCard v-if="churchesData.length > 0" class="mt-4">
                <VCardTitle>Resumen del Distrito</VCardTitle>
                <VCardText>
                    <VRow>
                        <VCol v-for="(total, key) in districtTotals" :key="key" cols="12" sm="6" md="3">
                            <div class="d-flex align-center justify-space-between pa-2 rounded bg-surface">
                                <span class="text-subtitle-2">{{ formatTotalLabel(key) }}:</span>
                                <span class="text-h6">{{ total }}</span>
                            </div>
                        </VCol>
                    </VRow>
                </VCardText>
            </VCard>
        </VContainer>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import NavigationBar from '../../components/NavigationBar.vue';
import type { District } from '../../types/District';
import type { ReportPeriod } from '../../types/MinisterialReport';
import type { Church } from '../../types/Church';
import type { MinisterialData } from '../../types/MinisterialData';

const loading = ref(false);
const districts = ref<District[]>([]);
const periods = ref<ReportPeriod[]>([]);
const selectedDistrict = ref('');
const selectedPeriod = ref('');
const churchesData = ref<Church[]>([]);

const headers = [
    { title: 'Iglesia', key: 'name', sortable: true },
    { title: 'Líder', key: 'leaderName', sortable: true },
    { title: 'Total Maestras', key: 'ministerialData.totalTeachers', sortable: true },
    { title: 'Total Niños', key: 'ministerialData.totalChildren', sortable: true },
    { title: 'Niños Convertidos', key: 'ministerialData.convertedChildren', sortable: true },
    { title: 'Niños Bautizados', key: 'ministerialData.baptizedChildren', sortable: true },
    { title: 'Graduados Consolidados', key: 'ministerialData.consolidatedGraduates', sortable: true },
    { title: 'Graduados Sacramentos', key: 'ministerialData.sacramentsGraduates', sortable: true }
];

// Cargar períodos y distritos al montar el componente
onMounted(async () => {
    try {
        // Cargar períodos
        const periodsSnapshot = await getDocs(collection(db, "report_periods"));
        periods.value = periodsSnapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name,
            startDate: doc.data().startDate,
            endDate: doc.data().endDate,
            isActive: doc.data().isActive,
            allowEditing: doc.data().allowEditing
        }));

        // Cargar distritos
        const districtsSnapshot = await getDocs(collection(db, "districts"));
        districts.value = districtsSnapshot.docs.map(doc => ({
            id: doc.id,
            areaNumber: doc.data().areaNumber,
            districtNumber: doc.data().districtNumber,
            location: doc.data().location,
            createdAt: doc.data().createdAt,
            updatedAt: doc.data().updatedAt
        }));
    } catch (error) {
        console.error("Error al cargar datos iniciales:", error);
        alert("Error al cargar los datos");
    }
});

const loadDistrictData = async () => {
    if (!selectedDistrict.value || !selectedPeriod.value) return;
    
    loading.value = true;
    try {
        // Obtener iglesias del distrito
        const churchesRef = collection(db, "churches");
        const churchesQuery = query(
            churchesRef,
            where("districtId", "==", selectedDistrict.value)
        );
        
        const churchesSnapshot = await getDocs(churchesQuery);
        const churches = churchesSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name,
                leaderName: data.leaderName,
                districtId: data.districtId,
                ministerialData: [],
                createdAt: data.createdAt,
                updatedAt: data.updatedAt,
                createdBy: data.createdBy,
                updatedBy: data.updatedBy,
                isActive: data.isActive
            } as Church;
        });

        // Obtener confirmaciones del período
        const confirmationsRef = collection(db, "church_confirmations");
        const confirmations: Church[] = [];
        
        for (const church of churches) {
            const confirmationQuery = query(
                confirmationsRef,
                where("churchId", "==", church.id),
                where("periodId", "==", selectedPeriod.value)
            );
            
            const confirmationSnapshot = await getDocs(confirmationQuery);
            if (!confirmationSnapshot.empty) {
                const confirmationData = confirmationSnapshot.docs[0].data();
                confirmations.push({
                    ...church,
                    ministerialData: [confirmationData.ministerialData]
                });
            }
        }

        churchesData.value = confirmations;
    } catch (error) {
        console.error("Error al cargar datos:", error);
        alert("Error al cargar los datos del distrito");
    } finally {
        loading.value = false;
    }
};

type TotalKeys = 'totalTeachers' | 'totalChildren' | 'convertedChildren' | 'baptizedChildren' | 'consolidatedGraduates' | 'sacramentsGraduates';

const labels: Record<TotalKeys, string> = {
    totalTeachers: 'Total Maestras',
    totalChildren: 'Total Niños',
    convertedChildren: 'Niños Convertidos',
    baptizedChildren: 'Niños Bautizados',
    consolidatedGraduates: 'Graduados Consolidados',
    sacramentsGraduates: 'Graduados Sacramentos'
};

const formatTotalLabel = (key: TotalKeys): string => {
    return labels[key];
};

const districtTotals = computed(() => {
    return churchesData.value.reduce((acc: Record<TotalKeys, number>, church) => {
        const md = church.ministerialData[0] || {};
        Object.keys(labels).forEach(key => {
            const totalKey = key as TotalKeys;
            acc[totalKey] = (acc[totalKey] || 0) + (md[totalKey] || 0);
        });
        return acc;
    }, {
        totalTeachers: 0,
        totalChildren: 0,
        convertedChildren: 0,
        baptizedChildren: 0,
        consolidatedGraduates: 0,
        sacramentsGraduates: 0
    });
});
</script> 