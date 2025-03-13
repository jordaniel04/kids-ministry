<template>
    <div>
        <VOverlay v-model="loading" class="align-center justify-center">
            <VProgressCircular indeterminate size="64" />
        </VOverlay>

        <NavigationBar />
        <VContainer>
            <h1>Lista de Cumpleaños de Líderes</h1>

            <VCard class="mb-4">
                <VCardText>
                    <VSelect v-model="selectedMonth" :items="months" label="Filtrar por mes" clearable></VSelect>
                </VCardText>
            </VCard>

            <VCard>
                <VCardText>
                    <VTable>
                        <thead>
                            <tr>
                                <th scope="col">Nombre</th>
                                <th scope="col">Distrito</th>
                                <th scope="col">Fecha de Cumpleaños</th>
                                <th scope="col">Edad</th>
                                <th scope="col">Días para Cumpleaños</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="leader in filteredLeaders" :key="leader.id">
                                <td>{{ leader.fullName }}</td>
                                <td>{{ leader.district }}</td>
                                <td>{{ formatDate(leader.birthDate) }}</td>
                                <td>{{ calculateAge(leader.birthDate) }}</td>
                                <td>{{ calculateDaysUntilBirthday(leader.birthDate) }}</td>
                            </tr>
                        </tbody>
                    </VTable>
                </VCardText>
            </VCard>
        </VContainer>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '../../firebase/config';
import NavigationBar from '../../components/NavigationBar.vue';
import { useFirestoreListeners } from '../../composables/useFirestoreListeners';

interface Leader {
    id: string;
    fullName: string;
    district: string;
    birthDate: Date;
}

const loading = ref(true);
const leaders = ref<Leader[]>([]);
const componentId = 'BirthdayListView';
const { clearListeners } = useFirestoreListeners(componentId);

// Función para cargar líderes usando getDocs en lugar de onSnapshot
const loadLeaders = async () => {
    try {
        loading.value = true;
        
        // Verificar si hay datos en caché y si son recientes (menos de 24 horas)
        const cachedData = localStorage.getItem('birthdayListCache');
        const cacheTimestamp = localStorage.getItem('birthdayListCacheTimestamp');
        const cacheValid = cachedData && cacheTimestamp && 
                          (Date.now() - Number(cacheTimestamp)) < 24 * 60 * 60 * 1000;
        
        if (cacheValid) {
            // Usar datos en caché
            const parsedData = JSON.parse(cachedData);
            leaders.value = parsedData.map((leader: any) => ({
                ...leader,
                birthDate: new Date(leader.birthDate)
            }));
            loading.value = false;
            return;
        }
        
        // Si no hay caché válido, cargar desde Firestore
        // Obtener district_leaders una sola vez
        const districtLeadersSnapshot = await getDocs(
            query(collection(db, 'district_leaders'), where('isActive', '==', true), limit(100))
        );
        
        const districtMap = new Map();
        districtLeadersSnapshot.docs.forEach(doc => {
            const data = doc.data();
            districtMap.set(data.userId, data.location);
        });
        
        // Usar getDocs en lugar de onSnapshot para leaders
        const leadersSnapshot = await getDocs(query(collection(db, 'leaders'), limit(100)));
        const leadersData: Leader[] = [];
        
        for (const doc of leadersSnapshot.docs) {
            const data = doc.data();
            if (data.personalData?.birthDate) {
                const districtLocation = districtMap.get(doc.id) || 'No asignado';
                
                leadersData.push({
                    id: doc.id,
                    fullName: `${data.personalData.firstName} ${data.personalData.lastName}`,
                    district: districtLocation,
                    birthDate: data.personalData.birthDate.toDate()
                });
            }
        }
        
        leaders.value = leadersData;
        
        // Guardar en caché local
        const cacheableData = leaders.value.map(leader => ({
            ...leader,
            birthDate: leader.birthDate.toISOString() // Convertir Date a string para almacenamiento
        }));
        localStorage.setItem('birthdayListCache', JSON.stringify(cacheableData));
        localStorage.setItem('birthdayListCacheTimestamp', Date.now().toString());
        
    } catch (error) {
        console.error('Error al cargar líderes:', error);
    } finally {
        loading.value = false;
    }
};

const sortedLeaders = computed(() => {
    return [...leaders.value].sort((a, b) => {
        const daysA = calculateDaysUntilBirthday(a.birthDate);
        const daysB = calculateDaysUntilBirthday(b.birthDate);
        return daysA - daysB;
    });
});

const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: 'long'
    }).format(date);
};

const calculateAge = (birthDate: Date) => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

const calculateDaysUntilBirthday = (birthDate: Date) => {
    const today = new Date();
    const nextBirthday = new Date(today.getFullYear(),
        birthDate.getMonth(),
        birthDate.getDate()
    );

    if (nextBirthday < today) {
        nextBirthday.setFullYear(today.getFullYear() + 1);
    }

    const diffTime = nextBirthday.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const months = [
    { title: 'Enero', value: 0 },
    { title: 'Febrero', value: 1 },
    { title: 'Marzo', value: 2 },
    { title: 'Abril', value: 3 },
    { title: 'Mayo', value: 4 },
    { title: 'Junio', value: 5 },
    { title: 'Julio', value: 6 },
    { title: 'Agosto', value: 7 },
    { title: 'Septiembre', value: 8 },
    { title: 'Octubre', value: 9 },
    { title: 'Noviembre', value: 10 },
    { title: 'Diciembre', value: 11 }
];

const selectedMonth = ref<number | null>(null);

const filteredLeaders = computed(() => {
    if (selectedMonth.value === null) {
        return sortedLeaders.value;
    }
    return sortedLeaders.value.filter(leader =>
        leader.birthDate.getMonth() === selectedMonth.value
    );
});

// Función para forzar la recarga de datos
const refreshData = () => {
    // Limpiar caché
    localStorage.removeItem('birthdayListCache');
    localStorage.removeItem('birthdayListCacheTimestamp');
    // Recargar datos
    loadLeaders();
};

onMounted(() => {
    loadLeaders();
});

// Asegurarse de limpiar cualquier listener cuando el componente se desmonta
onUnmounted(() => {
    clearListeners();
});
</script>