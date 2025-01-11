<template>
    <div>
        <NavigationBar />
        <VContainer>
            <h1>Datos del Líder Distrital</h1>
            <VForm @submit.prevent="savePersonalData">
                <VCard class="mb-4 pa-4">
                    <VCardTitle>Datos Personales</VCardTitle>
                    <VCardText>
                        <VTextField label="Nombres" v-model="personalData.firstName" required></VTextField>
                        <VTextField label="Apellidos" v-model="personalData.lastName" required></VTextField>
                        <VDateInput 
                            label="Fecha de Nacimiento" 
                            prepend-icon=""
                            v-model="personalData.birthDate"
                            placeholder="DD-MM-AAAA"
                            locale="es-ES"
                            required
                        ></VDateInput>
                        <VSelect :items="['Soltero', 'Casado']" label="Estado Civil" v-model="personalData.maritalStatus"
                            required>
                        </VSelect>
                        <VTextField label="Número de Celular" v-model="personalData.phoneNumber" required></VTextField>
                    </VCardText>
                </VCard>

                <VCard class="mb-4 pa-4">
                    <VCardTitle>Datos Ministeriales</VCardTitle>
                    <VCardText>
                        <VSelect :items="districts" label="Distrito" v-model="ministerialData.district" required></VSelect>
                        <VTextField label="Tiempo en Liderazgo Distrital" v-model="ministerialData.leadershipTime" required>
                        </VTextField>
                        <VTextField label="Otros Cargos" v-model="ministerialData.otherPositions"></VTextField>
                        <VSelect :items="['Sí', 'No']" label="Bautizado con el Espíritu Santo"
                            v-model="ministerialData.baptized" required></VSelect>
                        <VRow>
                            <VCol cols="12">
                                <div class="text-h7 mb-1">Capacitaciones recibidas de la RUTA DE FORMACIÓN DE LIDERAZGO
                                    (Marca solo los cursos que has llevado)</div>
                                <VCheckbox v-for="course in availableCourses" :key="course"
                                    v-model="ministerialData.courses" :label="course" :value="course"></VCheckbox>
                            </VCol>
                        </VRow>
                    </VCardText>
                </VCard>

                <!-- Barra de Progreso -->
                <VProgressLinear :value="completionPercentage" color="primary" height="20" class="mt-4">
                    {{ completionPercentage }}%
                </VProgressLinear>

                <VBtn 
                    type="submit" 
                    color="primary" 
                    class="mt-4" 
                    block 
                    :loading="loading" 
                    :disabled="loading || !hasChanges || completionPercentage < 100"
                >
                    {{ loading ? 'Guardando...' : 'Guardar Datos' }}
                </VBtn>
            </VForm>
        </VContainer>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { doc, setDoc, collection, getDocs, Timestamp } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuthStore } from "../../stores/auth";
import { useRouter } from 'vue-router';
import NavigationBar from '../../components/NavigationBar.vue';

const availableCourses = [
    "Bases del Ministerio",
    "Manual del Ministerio de Niños",
    "Formando un Corazón Pastoral hacia los Niños",
    "Entrenamiento Impacto I",
    "Entrenamiento Impacto II",
    "Entrenamiento Evangelístico I",
];

const personalData = ref({
    firstName: "",
    lastName: "",
    birthDate: null as Date | null,
    maritalStatus: "",
    phoneNumber: "",
});

const ministerialData = ref({
    district: "",
    leadershipTime: "",
    otherPositions: "",
    baptized: "",
    courses: [] as string[],
});

const districts = ref<string[]>([]);

const initialData = ref({
    personal: {} as any,
    ministerial: {} as any
});

const completionPercentage = computed(() => {
    const totalFields = 10;
    let filledFields = 0;

    // Validación más estricta para campos personales
    if (personalData.value.firstName?.trim()) filledFields++;
    if (personalData.value.lastName?.trim()) filledFields++;
    if (personalData.value.birthDate) filledFields++;
    if (personalData.value.maritalStatus?.trim()) filledFields++;
    if (personalData.value.phoneNumber?.trim()) filledFields++;

    // Validación más estricta para campos ministeriales
    if (ministerialData.value.district?.trim()) filledFields++;
    if (ministerialData.value.leadershipTime?.trim()) filledFields++;
    if (ministerialData.value.otherPositions?.trim()) filledFields++;
    if (ministerialData.value.baptized?.trim()) filledFields++;
    if (ministerialData.value.courses?.length > 0) filledFields++;

    return Math.round((filledFields / totalFields) * 100);
});

const authStore = useAuthStore();

const loading = ref(false);

const router = useRouter();

// Función para cargar los datos
const loadUserData = async () => {
    try {
        const userData = await authStore.getUserData();
        if (userData) {
            // Cargar datos personales
            if (userData.personalData) {
                personalData.value = {
                    firstName: userData.personalData.firstName || "",
                    lastName: userData.personalData.lastName || "",
                    birthDate: userData.personalData.birthDate ? userData.personalData.birthDate.toDate() : null,
                    maritalStatus: userData.personalData.maritalStatus || "",
                    phoneNumber: userData.personalData.phoneNumber || "",
                };
            }

            // Cargar datos ministeriales
            if (userData.ministerialData) {
                ministerialData.value = {
                    district: userData.ministerialData.district || "",
                    leadershipTime: userData.ministerialData.leadershipTime || "",
                    otherPositions: userData.ministerialData.otherPositions || "",
                    baptized: userData.ministerialData.baptized || "",
                    courses: userData.ministerialData.courses || [],
                };
            }

            // Guarda el estado inicial
            initialData.value = {
                personal: { ...personalData.value },
                ministerial: { ...ministerialData.value }
            };
        }
    } catch (error) {
        console.error("Error al cargar los datos:", error);
    }
};

const loadDistricts = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "districts"));
        districts.value = querySnapshot.docs.map(doc => doc.data().name);
    } catch (error) {
        console.error("Error al cargar distritos:", error);
        districts.value = [];
    }
};

// Cargar datos al montar el componente
onMounted(async () => {
    await loadDistricts();
    await loadUserData();
});

const savePersonalData = async () => {
    // Validar que todos los campos requeridos estén completos
    if (completionPercentage.value < 100) {
        alert('Por favor, complete todos los campos obligatorios antes de guardar.');
        return;
    }

    loading.value = true;
    try {
        if (!authStore.user?.id) {
            throw new Error("Usuario no autenticado");
        }

        const leaderData = {
            personalData: {
                ...personalData.value,
                birthDate: personalData.value.birthDate ? Timestamp.fromDate(personalData.value.birthDate) : null,
                updatedAt: new Date(),
            },
            ministerialData: {
                ...ministerialData.value,
                updatedAt: new Date(),
            }
        };

        const leaderRef = doc(db, "leaders", authStore.user.id);
        await setDoc(leaderRef, leaderData, { merge: true });

        router.push('/');
    } catch (error) {
        console.error("Error al guardar:", error);
        alert('Error al guardar los datos. Por favor, intente nuevamente.');
    } finally {
        loading.value = false;
    }
};

const hasChanges = computed(() => {
    return JSON.stringify(initialData.value.personal) !== JSON.stringify(personalData.value) ||
           JSON.stringify(initialData.value.ministerial) !== JSON.stringify(ministerialData.value);
});
</script>
<style scoped>
/* Estilos específicos para el formulario de datos personales */
</style>

