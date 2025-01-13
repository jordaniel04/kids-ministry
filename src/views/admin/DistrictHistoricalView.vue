<template>
    <div>
        <NavigationBar />
        <VContainer>
            <h1>Histórico de Totales por Distrito</h1>

            <!-- Selector de Distrito -->
            <VCard class="mb-4">
                <VCardText>
                    <VSelect
                        v-model="selectedDistrict"
                        :items="districts"
                        label="Distrito"
                        item-title="location"
                        item-value="id"
                        @update:model-value="loadHistoricalData"
                    />
                </VCardText>
            </VCard>

            <!-- Tabla de Totales por Período -->
            <VCard v-if="selectedDistrict && historicalData.length > 0">
                <VCardTitle>Totales por Período</VCardTitle>
                <VCardText>
                    <VDataTable
                        :headers="headers"
                        :items="historicalData"
                        :loading="loading"
                    >
                        <template v-slot:item="{ item }">
                            {{ item.periodName }}
                        </template>
                    </VDataTable>
                </VCardText>
            </VCard>
        </VContainer>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import type { District } from '../../types/District';

const loading = ref(false);
const districts = ref<District[]>([]);
const selectedDistrict = ref('');
const historicalData = ref<any[]>([]);

const headers = [
    { title: 'Período', key: 'periodName', sortable: true },
    { title: 'Total Maestras', key: 'totalTeachers', sortable: true, align: 'end' as const },
    { title: 'Total Niños', key: 'totalChildren', sortable: true, align: 'end' as const },
    { title: 'Niños Convertidos', key: 'convertedChildren', sortable: true, align: 'end' as const },
    { title: 'Niños Bautizados', key: 'baptizedChildren', sortable: true, align: 'end' as const },
    { title: 'Graduados Consolidados', key: 'consolidatedGraduates', sortable: true, align: 'end' as const },
    { title: 'Graduados Sacramentos', key: 'sacramentsGraduates', sortable: true, align: 'end' as const },
    { title: 'Total Iglesias', key: 'churchesCount', sortable: true, align: 'end' as const }
];

// Cargar distritos al montar el componente
onMounted(async () => {
    try {
        const districtsSnapshot = await getDocs(collection(db, "districts"));
        districts.value = districtsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                areaNumber: data.areaNumber,
                districtNumber: data.districtNumber,
                location: data.location,
                createdAt: data.createdAt,
                updatedAt: data.updatedAt
            } as District;
        });
    } catch (error) {
        console.error("Error al cargar distritos:", error);
        alert("Error al cargar los distritos");
    }
});

const loadHistoricalData = async () => {
    if (!selectedDistrict.value) return;
    
    loading.value = true;
    try {
        // Obtener todas las confirmaciones del distrito
        const confirmationsRef = collection(db, "district_confirmations");
        const confirmationsQuery = query(
            confirmationsRef,
            where("districtId", "==", selectedDistrict.value)
        );
        
        const confirmationsSnapshot = await getDocs(confirmationsQuery);
        const confirmations = confirmationsSnapshot.docs.map(doc => doc.data());

        // Obtener los períodos para mostrar los nombres
        const periodsRef = collection(db, "report_periods");
        const periodsSnapshot = await getDocs(periodsRef);
        const periodsMap = new Map(
            periodsSnapshot.docs.map(doc => [doc.id, doc.data().name])
        );

        // Combinar datos
        historicalData.value = confirmations.map(conf => ({
            periodName: periodsMap.get(conf.periodId) || 'Período Desconocido',
            totalTeachers: conf.totalTeachers,
            totalChildren: conf.totalChildren,
            convertedChildren: conf.convertedChildren,
            baptizedChildren: conf.baptizedChildren,
            consolidatedGraduates: conf.consolidatedGraduates,
            sacramentsGraduates: conf.sacramentsGraduates,
            churchesCount: conf.churchesCount
        }));

    } catch (error) {
        console.error("Error al cargar datos históricos:", error);
        alert("Error al cargar los datos históricos");
    } finally {
        loading.value = false;
    }
};
</script> 