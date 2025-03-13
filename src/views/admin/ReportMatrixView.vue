<template>
    <div>
        <NavigationBar />
        <VContainer>
            <h1>Matriz de Reportes por Distrito</h1>

            <!-- Indicador de carga -->
            <div v-if="loading" class="d-flex justify-center my-4">
                <VProgressCircular indeterminate color="primary"></VProgressCircular>
            </div>

            <!-- Tabla de Matriz -->
            <VCard v-else>
                <VCardTitle class="d-flex justify-space-between align-center">
                    <span>Matriz de Reportes</span>
                    <VBtn 
                        icon 
                        variant="text" 
                        color="primary" 
                        @click="refreshData"
                        :disabled="loading"
                    >
                        <VIcon>mdi-refresh</VIcon>
                    </VBtn>
                </VCardTitle>
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
import { ref, onMounted, onUnmounted } from 'vue';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '../../firebase/config';
import NavigationBar from '../../components/NavigationBar.vue';
import { useFirestoreListeners } from '../../composables/useFirestoreListeners';

interface MatrixDistrict {
    id: string;
    location: string;
    reports: Record<string, boolean>;
}

const loading = ref(true);
const periods = ref<any[]>([]);
const matrixData = ref<MatrixDistrict[]>([]);
const dataLoaded = ref(false);
const componentId = 'ReportMatrixView';
const { clearListeners } = useFirestoreListeners(componentId);

// Claves para el caché
const CACHE_KEYS = {
    PERIODS: 'report-matrix-periods',
    DISTRICTS: 'report-matrix-districts',
    CONFIRMATIONS: 'report-matrix-confirmations',
    TIMESTAMP: 'report-matrix-timestamp'
};

// Tiempo de expiración del caché: 30 minutos (en lugar de 5)
const CACHE_EXPIRY = 30 * 60 * 1000;

// Funciones de caché simplificadas
const getFromCache = (key: string) => {
    try {
        const cachedData = localStorage.getItem(key);
        if (!cachedData) return null;
        
        const timestamp = localStorage.getItem(CACHE_KEYS.TIMESTAMP);
        if (!timestamp) return null;
        
        // Verificar si el caché ha expirado
        if (Date.now() - Number(timestamp) > CACHE_EXPIRY) {
            return null;
        }
        
        return JSON.parse(cachedData);
    } catch (error) {
        console.error(`Error al recuperar ${key} del caché:`, error);
        return null;
    }
};

const setInCache = (key: string, data: any) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        localStorage.setItem(CACHE_KEYS.TIMESTAMP, Date.now().toString());
    } catch (error) {
        console.error(`Error al guardar ${key} en caché:`, error);
    }
};

onMounted(() => {
    if (!dataLoaded.value) {
        loadMatrixData();
        dataLoaded.value = true;
    }
});

// Asegurarse de limpiar cualquier listener cuando el componente se desmonta
onUnmounted(() => {
    clearListeners();
});

// Función principal para cargar todos los datos
const loadMatrixData = async () => {
    loading.value = true;
    
    // Verificar si todos los datos están en caché
    const cachedPeriods = getFromCache(CACHE_KEYS.PERIODS);
    const cachedDistricts = getFromCache(CACHE_KEYS.DISTRICTS);
    const cachedConfirmations = getFromCache(CACHE_KEYS.CONFIRMATIONS);
    
    if (cachedPeriods && cachedDistricts && cachedConfirmations) {
        // Usar datos en caché
        periods.value = cachedPeriods;
        matrixData.value = cachedDistricts;
        
        // Aplicar confirmaciones a los distritos
        matrixData.value.forEach(district => {
            district.reports = cachedConfirmations[district.id] || {};
        });
        
        loading.value = false;
        return;
    }
    
    try {
        // Cargar datos en paralelo para mejorar rendimiento
        await Promise.all([
            loadPeriods(),
            loadDistricts()
        ]);
        
        // Cargar confirmaciones después de tener distritos y períodos
        await loadConfirmations();
    } catch (error) {
        console.error("Error al cargar la matriz de reportes:", error);
        alert("Error al cargar los datos de la matriz");
    } finally {
        loading.value = false;
    }
};

const loadPeriods = async () => {
    try {
        // Limitar la cantidad de documentos si hay muchos períodos
        const periodsQuery = query(collection(db, "report_periods"), limit(20));
        const periodsSnapshot = await getDocs(periodsQuery);
        
        const periodsData = periodsSnapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name
        }));
        
        periods.value = periodsData;
        
        // Guardar en caché
        setInCache(CACHE_KEYS.PERIODS, periodsData);
    } catch (error) {
        console.error("Error al cargar períodos:", error);
    }
};

const loadDistricts = async () => {
    try {
        const districtsQuery = query(collection(db, "districts"), limit(100));
        const districtsSnapshot = await getDocs(districtsQuery);
        
        // Obtener los distritos y ordenarlos alfabéticamente por ubicación
        const districtsData = districtsSnapshot.docs
            .map(doc => ({
                id: doc.id,
                location: doc.data().location,
                areaNumber: doc.data().areaNumber,
                districtNumber: doc.data().districtNumber,
                reports: {}
            }))
            .sort((a, b) => a.location.localeCompare(b.location));
        
        matrixData.value = districtsData;
        
        // Guardar en caché
        setInCache(CACHE_KEYS.DISTRICTS, districtsData);
    } catch (error) {
        console.error("Error al cargar distritos:", error);
    }
};

const loadConfirmations = async () => {
    if (!periods.value.length || !matrixData.value.length) return;

    try {
        // Obtener todas las confirmaciones de distrito
        const confirmationsQuery = query(collection(db, "district_confirmations"), limit(500));
        const confirmationsSnapshot = await getDocs(confirmationsQuery);

        // Crear mapa de reportes por distrito
        const confirmationsMap: Record<string, Record<string, boolean>> = {};
        
        confirmationsSnapshot.docs.forEach(doc => {
            const data = doc.data();
            const districtId = data.districtId;
            
            if (!confirmationsMap[districtId]) {
                confirmationsMap[districtId] = {};
            }
            
            confirmationsMap[districtId][data.periodId] = true;
        });
        
        // Aplicar confirmaciones a los distritos
        matrixData.value.forEach(district => {
            district.reports = confirmationsMap[district.id] || {};
        });
        
        // Guardar en caché
        setInCache(CACHE_KEYS.CONFIRMATIONS, confirmationsMap);
    } catch (error) {
        console.error("Error al cargar confirmaciones:", error);
    }
};

// Función para forzar la recarga de datos
const refreshData = async () => {
    // Limpiar caché
    localStorage.removeItem(CACHE_KEYS.PERIODS);
    localStorage.removeItem(CACHE_KEYS.DISTRICTS);
    localStorage.removeItem(CACHE_KEYS.CONFIRMATIONS);
    localStorage.removeItem(CACHE_KEYS.TIMESTAMP);
    
    // Recargar datos
    dataLoaded.value = false;
    await loadMatrixData();
    dataLoaded.value = true;
};
</script>

<style scoped>
.matrix-table-container {
    overflow-x: auto;
    max-width: 100%;
}

.matrix-table {
    border-collapse: collapse;
    width: 100%;
}

.matrix-table th, .matrix-table td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: center;
}

.matrix-table th {
    background-color: #f2f2f2;
    position: sticky;
    top: 0;
    z-index: 1;
}

.fixed-column {
    position: sticky;
    left: 0;
    background-color: white;
    z-index: 2;
}

th.fixed-column {
    background-color: #f2f2f2;
    z-index: 3;
}

.reported {
    background-color: rgba(76, 175, 80, 0.1);
}
</style>