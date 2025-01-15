<template>
    <div>
        <VOverlay v-model="loading" class="align-center justify-center">
            <VProgressCircular indeterminate size="64"/>
        </VOverlay>
        
        <template v-if="!loading">
            <NavigationBar />
            <VContainer>
                <h1>Datos del Líder Distrital</h1>
                <div class="text-subtitle-1 mb-4">
                    {{ `Área ${userData?.areaNumber || ''} - Distrito ${userData?.districtNumber || ''} - ${userData?.location || ''}` }}
                </div>
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
                            <VTextField
                                v-model="personalData.phoneNumber"
                                label="Número de Celular"
                                :rules="[
                                    v => !!v || 'El número de celular es requerido',
                                    v => /^[0-9]{9}$/.test(v) || 'El número debe tener 9 dígitos',
                                    v => !isNaN(v) || 'Solo se permiten números'
                                ]"
                                @input="validatePhoneNumber"
                                maxlength="9"
                                counter
                                :error-messages="phoneError"
                            />
                        </VCardText>
                    </VCard>

                    <VCard class="mb-4 pa-4">
                        <VCardTitle>Datos Ministeriales</VCardTitle>
                        <VCardText>
                            <VRow>
                                <VCol cols="12" sm="6">
                                    <VSelect
                                        v-model="appointmentMonth"
                                        :items="months"
                                        label="Mes de Nombramiento"
                                        required
                                        @update:model-value="updateAppointmentDate"
                                    ></VSelect>
                                </VCol>
                                <VCol cols="12" sm="6">
                                    <VSelect
                                        v-model="appointmentYear"
                                        :items="years"
                                        label="Año de Nombramiento"
                                        required
                                        @update:model-value="updateAppointmentDate"
                                    ></VSelect>
                                </VCol>
                            </VRow>
                            <VSelect :items="['Sí', 'No']" label="Bautizado con el Espíritu Santo"
                                v-model="ministerialData.baptized" required></VSelect>
                            <VRow>
                                <VCol cols="12">
                                    <div class="text-h7 mb-1">
                                        Capacitaciones recibidas de la RUTA DE FORMACIÓN DE LIDERAZGO
                                    </div>
                                    <VCheckbox
                                        v-model="noCourses"
                                        label="No he realizado ninguna capacitación"
                                        @update:model-value="handleNoCourses"
                                    ></VCheckbox>
                                    
                                    <VCheckbox 
                                        v-for="course in availableCourses" 
                                        :key="course"
                                        v-model="ministerialData.courses" 
                                        :label="course" 
                                        :value="course"
                                        :disabled="noCourses"
                                        @update:model-value="handleCourseSelection"
                                    ></VCheckbox>
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
        </template>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { doc, setDoc, collection, getDocs, Timestamp, getDoc, query, where } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuthStore } from "../../stores/auth";
import { useRouter } from 'vue-router';
import NavigationBar from '../../components/NavigationBar.vue';

interface PersonalData {
    [key: string]: string | Date | null;
    firstName: string;
    lastName: string;
    birthDate: Date | null;
    maritalStatus: string;
    phoneNumber: string;
}

interface MinisterialData {
    [key: string]: string | string[] | Date | null;
    appointmentDate: Date | null;
    baptized: string;
    courses: string[];
}

const availableCourses = [
    "Bases del Ministerio",
    "Manual del Ministerio de Niños",
    "Formando un Corazón Pastoral hacia los Niños",
    "Entrenamiento Impacto I",
    "Entrenamiento Impacto II",
    "Entrenamiento Evangelístico I",
];

const personalData = ref<PersonalData>({
    firstName: "",
    lastName: "",
    birthDate: null,
    maritalStatus: "",
    phoneNumber: "",
});

const ministerialData = ref<MinisterialData>({
    appointmentDate: null,
    baptized: "",
    courses: [],
});

const districts = ref<string[]>([]);

const initialData = ref({
    personal: {} as any,
    ministerial: {} as any
});

const noCourses = ref(false);

const handleNoCourses = (value: boolean | null) => {
    if (value) {
        ministerialData.value.courses = ['NO_COURSES'];
    } else {
        ministerialData.value.courses = [];
    }
};

const handleCourseSelection = () => {
    if (ministerialData.value.courses.length > 0) {
        noCourses.value = false;
    }
};

const completionPercentage = computed(() => {
    // Definir los campos requeridos para cada sección
    const personalFields = [
        'firstName',
        'lastName', 
        'birthDate',
        'maritalStatus',
        'phoneNumber'
    ];

    const ministerialFields = [
        'appointmentDate',
        'baptized',
        'courses'
    ];

    let filledFields = 0;

    // Validar campos personales
    personalFields.forEach(field => {
        if (field === 'birthDate') {
            if (personalData.value[field]) filledFields++;
        } else {
            const value = personalData.value[field];
            if (typeof value === 'string' && value.trim()) filledFields++;
        }
    });

    // Validar campos ministeriales
    ministerialFields.forEach(field => {
        if (field === 'courses') {
            if ((ministerialData.value[field]?.length > 0 && !noCourses.value) || noCourses.value) {
                filledFields++;
            }
        } else if (field === 'appointmentDate') {
            if (ministerialData.value.appointmentDate) {
                filledFields++;
            }
        } else {
            const value = ministerialData.value[field];
            if (typeof value === 'string' && value.trim()) filledFields++;
        }
    });

    const totalFields = personalFields.length + ministerialFields.length;
    return Math.round((filledFields / totalFields) * 100);
});

const authStore = useAuthStore();

const loading = ref(true);

const router = useRouter();

const userData = ref<any>(null);

const appointmentMonth = ref<number | null>(null);
const appointmentYear = ref<number | null>(null);

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

const years = computed(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = 2000; year <= currentYear; year++) {
        years.push(year);
    }
    return years;
});

const updateAppointmentDate = () => {
    if (appointmentMonth.value !== null && appointmentYear.value !== null) {
        ministerialData.value.appointmentDate = new Date(
            appointmentYear.value,
            appointmentMonth.value,
            1
        );
    }
};

const loadUserData = async () => {
    try {
        // 1. Cargar datos básicos del usuario
        const userDoc = await getDoc(doc(db, "users", authStore.user!.id));
        if (userDoc.exists()) {
            const basicUserData = userDoc.data();
            
            // 2. Cargar datos del district_leaders para obtener el districtId
            const districtLeadersRef = collection(db, "district_leaders");
            const q = query(
                districtLeadersRef, 
                where("userId", "==", authStore.user!.id),
                where("isActive", "==", true)
            );
            const districtLeaderDocs = await getDocs(q);
            
            if (!districtLeaderDocs.empty) {
                const districtLeader = districtLeaderDocs.docs[0].data();
                
                // 3. Cargar datos del distrito
                const districtDoc = await getDoc(doc(db, "districts", districtLeader.districtId));
                if (districtDoc.exists()) {
                    const districtData = districtDoc.data();
                    userData.value = {
                        ...basicUserData,
                        areaNumber: districtData.areaNumber,
                        districtNumber: districtData.districtNumber,
                        location: districtData.location
                    };
                }
            }
        }

        // 4. Cargar datos personales y ministeriales del líder
        const leaderData = await authStore.getUserData();
        if (leaderData) {
            if (leaderData.personalData) {
                personalData.value = {
                    firstName: leaderData.personalData.firstName || "",
                    lastName: leaderData.personalData.lastName || "",
                    birthDate: leaderData.personalData.birthDate ? leaderData.personalData.birthDate.toDate() : null,
                    maritalStatus: leaderData.personalData.maritalStatus || "",
                    phoneNumber: leaderData.personalData.phoneNumber || "",
                };
            }

            if (leaderData.ministerialData) {
                ministerialData.value = {
                    appointmentDate: leaderData.ministerialData.appointmentDate?.toDate() || null,
                    baptized: leaderData.ministerialData.baptized || "",
                    courses: leaderData.ministerialData.courses || [],
                };
                
                if (ministerialData.value.appointmentDate) {
                    const date = ministerialData.value.appointmentDate;
                    appointmentMonth.value = date.getMonth();
                    appointmentYear.value = date.getFullYear();
                }
                
                noCourses.value = ministerialData.value.courses.includes('NO_COURSES');
            }

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
    try {
        await Promise.all([
            loadDistricts(),
            loadUserData()
        ]);
    } catch (error) {
        console.error("Error al cargar datos iniciales:", error);
        alert("Error al cargar los datos");
    } finally {
        loading.value = false;
    }
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

const phoneNumber = ref('');
const phoneError = ref('');

const validatePhoneNumber = (event: Event) => {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    
    // Remover cualquier caracter que no sea número
    input.value = value.replace(/\D/g, '');
    
    // Validar longitud
    if (input.value.length > 9) {
        input.value = input.value.slice(0, 9);
    }
    
    phoneNumber.value = input.value;
};

watch(phoneNumber, (newValue) => {
    if (newValue.length > 0 && newValue.length < 9) {
        phoneError.value = 'El número debe tener 9 dígitos';
    } else if (!/^[0-9]*$/.test(newValue)) {
        phoneError.value = 'Solo se permiten números';
    } else {
        phoneError.value = '';
    }
});
</script>
<style scoped>
/* Estilos específicos para el formulario de datos personales */
</style>

