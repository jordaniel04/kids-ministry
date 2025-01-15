<template>
    <div>
        <VOverlay v-model="loading" class="align-center justify-center">
            <VProgressCircular indeterminate size="64"/>
        </VOverlay>

        <NavigationBar />
        <VContainer>
            <h1>Lista de Cumpleaños de Líderes</h1>

            <VCard class="mb-4">
                <VCardText>
                    <VSelect
                        v-model="selectedMonth"
                        :items="months"
                        label="Filtrar por mes"
                        clearable
                    ></VSelect>
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
import { ref, computed, onMounted } from 'vue';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import NavigationBar from '../../components/NavigationBar.vue';

interface Leader {
    id: string;
    fullName: string;
    district: string;
    birthDate: Date;
}

const loading = ref(true);
const leaders = ref<Leader[]>([]);

const loadLeaders = async () => {
    try {
        const leadersSnapshot = await getDocs(collection(db, 'leaders'));
        const leadersData: Leader[] = [];

        for (const doc of leadersSnapshot.docs) {
            const data = doc.data();
            if (data.personalData?.birthDate) {
                const districtLeaderQuery = query(
                    collection(db, 'district_leaders'),
                    where('userId', '==', doc.id),
                    where('isActive', '==', true)
                );
                const districtLeaderDocs = await getDocs(districtLeaderQuery);
                
                let districtLocation = 'No asignado';
                if (!districtLeaderDocs.empty) {
                    const districtLeader = districtLeaderDocs.docs[0].data();
                    districtLocation = districtLeader.location;
                }

                leadersData.push({
                    id: doc.id,
                    fullName: `${data.personalData.firstName} ${data.personalData.lastName}`,
                    district: districtLocation,
                    birthDate: data.personalData.birthDate.toDate()
                });
            }
        }
        leaders.value = leadersData;
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

onMounted(loadLeaders);
</script> 