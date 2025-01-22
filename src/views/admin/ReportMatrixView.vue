<template>
    <div>
        <NavigationBar />
        <VContainer>
            <h1>Matriz de Reportes por Distrito</h1>

            <!-- Tabla de Matriz -->
            <VCard>
                <VCardTitle>Matriz de Reportes</VCardTitle>
                <VCardText>
                    <div class="matrix-table-container">
                        <table class="matrix-table">
                            <thead>
                                <tr>
                                    <th class="fixed-column">Distrito</th>
                                    <th v-for="period in periods" :key="period.id">
                                        {{ period.name }}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="district in matrixData" :key="district.id">
                                    <td class="fixed-column">{{ district.location }}</td>
                                    <td v-for="period in periods" :key="period.id"
                                        :class="{ 'reported': district.reports[period.id] }">
                                        <VIcon :color="district.reports[period.id] ? 'success' : 'error'">
                                            {{ district.reports[period.id] ? 'mdi-check-circle' : 'mdi-close-circle' }}
                                        </VIcon>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </VCardText>
            </VCard>
        </VContainer>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import NavigationBar from '../../components/NavigationBar.vue';

interface MatrixDistrict {
    id: string;
    location: string;
    reports: Record<string, boolean>;
}

const loading = ref(false);
const periods = ref<any[]>([]);
const matrixData = ref<MatrixDistrict[]>([]);

onMounted(async () => {
    await Promise.all([loadDistricts(), loadPeriods()]);
    await loadMatrixData();
});

const loadPeriods = async () => {
    try {
        const periodsSnapshot = await getDocs(collection(db, "report_periods"));
        periods.value = periodsSnapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name
        }));
    } catch (error) {
        console.error("Error al cargar períodos:", error);
        alert("Error al cargar los períodos");
    }
};

const loadDistricts = async () => {
    loading.value = true;
    try {
        const districtsRef = collection(db, "districts");
        const districtsSnapshot = await getDocs(districtsRef);
        
        // Obtener los distritos y ordenarlos alfabéticamente por ubicación
        matrixData.value = districtsSnapshot.docs
            .map(doc => ({
                id: doc.id,
                location: doc.data().location,
                areaNumber: doc.data().areaNumber,
                districtNumber: doc.data().districtNumber,
                reports: {}
            }))
            .sort((a, b) => a.location.localeCompare(b.location));
            
        // Cargar los datos de la matriz después de ordenar los distritos
        await loadMatrixData();
    } catch (error) {
        console.error("Error al cargar distritos:", error);
        alert("Error al cargar los datos de los distritos");
    } finally {
        loading.value = false;
    }
};

const loadMatrixData = async () => {
    if (!periods.value.length || !matrixData.value.length) return;

    loading.value = true;
    try {
        // Obtener todas las confirmaciones de distrito
        const confirmationsRef = collection(db, "district_confirmations");
        const confirmationsSnapshot = await getDocs(confirmationsRef);

        // Crear mapa de reportes por distrito
        confirmationsSnapshot.docs.forEach(doc => {
            const data = doc.data();
            const district = matrixData.value.find(d => d.id === data.districtId);
            if (district) {
                district.reports[data.periodId] = true;
            }
        });

    } catch (error) {
        console.error("Error al cargar datos de la matriz:", error);
        alert("Error al cargar los datos de la matriz");
    } finally {
        loading.value = false;
    }
};
</script>

<style scoped>
.matrix-table-container {
    overflow-x: auto;
    max-width: 100%;
}

.matrix-table {
    width: 100%;
    border-collapse: collapse;
}

.matrix-table th,
.matrix-table td {
    padding: 12px;
    text-align: center;
    border: 1px solid #ddd;
}

.matrix-table th {
    background-color: #f5f5f5;
    font-weight: bold;
}

.fixed-column {
    position: sticky;
    left: 0;
    background-color: white;
    z-index: 1;
    text-align: left !important;
    min-width: 200px;
}

th.fixed-column {
    background-color: #f5f5f5;
    z-index: 2;
}

.reported {
    background-color: #f8fff8;
}
</style>