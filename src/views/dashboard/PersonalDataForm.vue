<template>
    <div>
        <VOverlay v-model="loading" class="align-center justify-center">
            <VProgressCircular indeterminate size="64" />
        </VOverlay>

        <template v-if="!loading">
            <NavigationBar />
            <VContainer>
                <h1>Datos del Líder Distrital</h1>
                <div class="text-subtitle-1 mb-4">
                    {{ `Área ${userData?.areaNumber || ''} - Distrito ${userData?.districtNumber || ''} -
                    ${userData?.location || ''}` }}
                </div>
                <VForm @submit.prevent="savePersonalData">
                    <!-- LÍDER 1 -->
                    <VCard class="mb-4 pa-4">
                        <VCardTitle>Datos del Líder</VCardTitle>
                        <VCardText>
                            <VTextField label="Nombres" v-model="personalData.firstName" required></VTextField>
                            <VTextField label="Apellidos" v-model="personalData.lastName" required></VTextField>
                            <VDateInput label="Fecha de Nacimiento" prepend-icon="" v-model="personalData.birthDate"
                                placeholder="DD-MM-AAAA" locale="es-ES" required></VDateInput>
                            <VSelect :items="['Soltero', 'Casado']" label="Estado Civil"
                                v-model="personalData.maritalStatus" required>
                            </VSelect>
                            <VTextField v-model="personalData.phoneNumber" label="Número de Celular" :rules="[
            v => !!v || 'El número de celular es requerido',
            v => /^[0-9]{9}$/.test(v) || 'El número debe tener 9 dígitos',
        ]" validate-on="blur" @input="validatePhoneNumber" maxlength="9" counter :error-messages="phoneError" />
                        </VCardText>
                    </VCard>

                    <VCard class="mb-4 pa-4">
                        <VCardTitle>Datos Ministeriales</VCardTitle>
                        <VCardText>
                            <VRow>
                                <VCol cols="12" sm="6">
                                    <VSelect v-model="appointmentMonth" :items="months" label="Mes de Nombramiento"
                                        required @update:model-value="updateAppointmentDate"></VSelect>
                                </VCol>
                                <VCol cols="12" sm="6">
                                    <VSelect v-model="appointmentYear" :items="years" label="Año de Nombramiento"
                                        required @update:model-value="updateAppointmentDate"></VSelect>
                                </VCol>
                            </VRow>
                            <VSelect :items="['Sí', 'No']" label="Bautizado con el Espíritu Santo"
                                v-model="ministerialData.baptized" required></VSelect>
                        </VCardText>
                    </VCard>

                    <!-- LÍDER 2 (pareja) -->
                    <VCard class="mb-4 pa-4">
                        <VCardTitle class="d-flex align-center justify-space-between">
                            Datos del Segundo Líder (Pareja)
                            <VSwitch v-model="hasSecondLeader" hide-details density="compact"
                                label="Registrar segundo líder" class="ms-4" />
                        </VCardTitle>
                        <VCardText v-if="hasSecondLeader">
                            <VTextField label="Nombres" v-model="secondLeaderPersonal.firstName"
                                required></VTextField>
                            <VTextField label="Apellidos" v-model="secondLeaderPersonal.lastName"
                                required></VTextField>
                            <VDateInput label="Fecha de Nacimiento" prepend-icon=""
                                v-model="secondLeaderPersonal.birthDate" placeholder="DD-MM-AAAA" locale="es-ES"
                                required></VDateInput>
                            <VSelect :items="['Soltero', 'Casado']" label="Estado Civil"
                                v-model="secondLeaderPersonal.maritalStatus" required>
                            </VSelect>
                            <VTextField v-model="secondLeaderPersonal.phoneNumber" label="Número de Celular" :rules="[
            v => !!v || 'El número de celular es requerido',
            v => /^[0-9]{9}$/.test(v) || 'El número debe tener 9 dígitos',
        ]" validate-on="blur" maxlength="9" counter />

                            <VDivider class="my-4" />
                            <div class="text-subtitle-1 mb-3">Datos Ministeriales</div>
                            <VRow>
                                <VCol cols="12" sm="6">
                                    <VSelect v-model="secondLeaderAppointmentMonth" :items="months"
                                        label="Mes de Nombramiento" required
                                        @update:model-value="updateSecondLeaderAppointmentDate"></VSelect>
                                </VCol>
                                <VCol cols="12" sm="6">
                                    <VSelect v-model="secondLeaderAppointmentYear" :items="years"
                                        label="Año de Nombramiento" required
                                        @update:model-value="updateSecondLeaderAppointmentDate"></VSelect>
                                </VCol>
                            </VRow>
                            <VSelect :items="['Sí', 'No']" label="Bautizado con el Espíritu Santo"
                                v-model="secondLeaderMinisterial.baptized" required></VSelect>
                        </VCardText>
                        <VCardText v-else class="text-grey">
                            Active esta opción si hay un segundo líder (pareja) en el distrito.
                        </VCardText>
                    </VCard>

                    <!-- Barra de Progreso -->
                    <VProgressLinear :value="completionPercentage" color="primary" height="20" class="mt-4">
                        {{ completionPercentage }}%
                    </VProgressLinear>

                    <VBtn type="submit" color="primary" class="mt-4" block :loading="loading"
                        :disabled="loading || !hasChanges || completionPercentage < 100">
                        {{ loading ? 'Guardando...' : 'Guardar Datos' }}
                    </VBtn>
                </VForm>
            </VContainer>
        </template>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { doc, setDoc, Timestamp, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from 'vue-router';
import NavigationBar from '@/components/NavigationBar.vue';
import { COLLECTIONS } from '@/constants';
import { useUserDistrict } from '@/composables/useUserDistrict';

interface PersonalData {
    [key: string]: string | Date | null;
    firstName: string;
    lastName: string;
    birthDate: Date | null;
    maritalStatus: string;
    phoneNumber: string;
}

interface MinisterialData {
    [key: string]: string | Date | null;
    appointmentDate: Date | null;
    baptized: string;
}

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
});

const hasSecondLeader = ref(false);

const secondLeaderPersonal = ref<PersonalData>({
    firstName: "",
    lastName: "",
    birthDate: null,
    maritalStatus: "",
    phoneNumber: "",
});

const secondLeaderMinisterial = ref<MinisterialData>({
    appointmentDate: null,
    baptized: "",
});

const initialData = ref({
    personal: {} as any,
    ministerial: {} as any,
    hasSecondLeader: false,
    secondLeaderPersonal: {} as any,
    secondLeaderMinisterial: {} as any,
});

const authStore = useAuthStore();
const loading = ref(true);
const router = useRouter();
const userData = ref<any>(null);

const appointmentMonth = ref<number | null>(null);
const appointmentYear = ref<number | null>(null);
const secondLeaderAppointmentMonth = ref<number | null>(null);
const secondLeaderAppointmentYear = ref<number | null>(null);

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
    const result = [];
    for (let year = 2000; year <= currentYear; year++) {
        result.push(year);
    }
    return result;
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

const updateSecondLeaderAppointmentDate = () => {
    if (secondLeaderAppointmentMonth.value !== null && secondLeaderAppointmentYear.value !== null) {
        secondLeaderMinisterial.value.appointmentDate = new Date(
            secondLeaderAppointmentYear.value,
            secondLeaderAppointmentMonth.value,
            1
        );
    }
};

const completionPercentage = computed(() => {
    const personalFields = ['firstName', 'lastName', 'birthDate', 'maritalStatus', 'phoneNumber'];
    const ministerialFields = ['appointmentDate', 'baptized'];

    let filled = 0;
    let total = personalFields.length + ministerialFields.length;

    personalFields.forEach(field => {
        const value = personalData.value[field];
        if (field === 'birthDate') { if (value) filled++; }
        else if (typeof value === 'string' && value.trim()) filled++;
    });

    ministerialFields.forEach(field => {
        const value = ministerialData.value[field];
        if (field === 'appointmentDate') { if (value) filled++; }
        else if (typeof value === 'string' && value.trim()) filled++;
    });

    if (hasSecondLeader.value) {
        total += personalFields.length + ministerialFields.length;
        personalFields.forEach(field => {
            const value = secondLeaderPersonal.value[field];
            if (field === 'birthDate') { if (value) filled++; }
            else if (typeof value === 'string' && value.trim()) filled++;
        });
        ministerialFields.forEach(field => {
            const value = secondLeaderMinisterial.value[field];
            if (field === 'appointmentDate') { if (value) filled++; }
            else if (typeof value === 'string' && value.trim()) filled++;
        });
    }

    return Math.round((filled / total) * 100);
});

const dataLoaded = ref(false);
const unsubscribers = ref<(() => void)[]>([]);

const loadUserData = async () => {
    if (dataLoaded.value) return;
    try {
        loading.value = true;
        const leaderData = await authStore.getUserData();

        if (leaderData) {
            const { getActiveDistrict } = useUserDistrict();
            const { district } = await getActiveDistrict();

            if (district) {
                const districtDoc = await getDoc(doc(db, COLLECTIONS.DISTRICTS, district.id));
                if (districtDoc.exists()) {
                    const districtData = districtDoc.data();
                    userData.value = {
                        areaNumber: districtData.areaNumber,
                        districtNumber: districtData.districtNumber,
                        location: districtData.location
                    };
                }
            }

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
                };

                if (ministerialData.value.appointmentDate) {
                    const date = ministerialData.value.appointmentDate;
                    appointmentMonth.value = date.getMonth();
                    appointmentYear.value = date.getFullYear();
                }
            }

            if (leaderData.secondLeader) {
                hasSecondLeader.value = true;
                const sl = leaderData.secondLeader;
                if (sl.personalData) {
                    secondLeaderPersonal.value = {
                        firstName: sl.personalData.firstName || "",
                        lastName: sl.personalData.lastName || "",
                        birthDate: sl.personalData.birthDate ? sl.personalData.birthDate.toDate() : null,
                        maritalStatus: sl.personalData.maritalStatus || "",
                        phoneNumber: sl.personalData.phoneNumber || "",
                    };
                }
                if (sl.ministerialData) {
                    secondLeaderMinisterial.value = {
                        appointmentDate: sl.ministerialData.appointmentDate?.toDate() || null,
                        baptized: sl.ministerialData.baptized || "",
                    };
                    if (secondLeaderMinisterial.value.appointmentDate) {
                        const date = secondLeaderMinisterial.value.appointmentDate;
                        secondLeaderAppointmentMonth.value = date.getMonth();
                        secondLeaderAppointmentYear.value = date.getFullYear();
                    }
                }
            }

            initialData.value = {
                personal: JSON.parse(JSON.stringify(personalData.value)),
                ministerial: JSON.parse(JSON.stringify(ministerialData.value)),
                hasSecondLeader: hasSecondLeader.value,
                secondLeaderPersonal: JSON.parse(JSON.stringify(secondLeaderPersonal.value)),
                secondLeaderMinisterial: JSON.parse(JSON.stringify(secondLeaderMinisterial.value)),
            };
        }
    } catch (error) {
        console.error("Error al cargar datos:", error);
    } finally {
        loading.value = false;
    }
};

onUnmounted(() => {
    unsubscribers.value.forEach(unsub => unsub());
    unsubscribers.value = [];
});

onMounted(async () => {
    try {
        await loadUserData();
    } catch (error) {
        console.error("Error al cargar datos iniciales:", error);
        alert("Error al cargar los datos");
    } finally {
        loading.value = false;
    }
});

const savePersonalData = async () => {
    if (completionPercentage.value < 100) {
        alert('Por favor, complete todos los campos obligatorios antes de guardar.');
        return;
    }

    loading.value = true;
    try {
        if (!authStore.user?.id) {
            throw new Error("Usuario no autenticado");
        }

        const toUpper = (s: string) => s.trim().toUpperCase();

        const payload: any = {
            personalData: {
                ...personalData.value,
                firstName: toUpper(personalData.value.firstName),
                lastName: toUpper(personalData.value.lastName),
                birthDate: personalData.value.birthDate ? Timestamp.fromDate(personalData.value.birthDate) : null,
                updatedAt: new Date(),
            },
            ministerialData: {
                ...ministerialData.value,
                updatedAt: new Date(),
            },
        };

        if (hasSecondLeader.value) {
            payload.secondLeader = {
                personalData: {
                    ...secondLeaderPersonal.value,
                    firstName: toUpper(secondLeaderPersonal.value.firstName),
                    lastName: toUpper(secondLeaderPersonal.value.lastName),
                    birthDate: secondLeaderPersonal.value.birthDate
                        ? Timestamp.fromDate(secondLeaderPersonal.value.birthDate)
                        : null,
                    updatedAt: new Date(),
                },
                ministerialData: {
                    ...secondLeaderMinisterial.value,
                    updatedAt: new Date(),
                },
            };
        } else {
            payload.secondLeader = null;
        }

        const leaderRef = doc(db, "leaders", authStore.user.id);
        await setDoc(leaderRef, payload, { merge: true });

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
        JSON.stringify(initialData.value.ministerial) !== JSON.stringify(ministerialData.value) ||
        initialData.value.hasSecondLeader !== hasSecondLeader.value ||
        JSON.stringify(initialData.value.secondLeaderPersonal) !== JSON.stringify(secondLeaderPersonal.value) ||
        JSON.stringify(initialData.value.secondLeaderMinisterial) !== JSON.stringify(secondLeaderMinisterial.value);
});

const phoneError = ref('');

const validatePhoneNumber = (event: Event) => {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    input.value = value.replace(/\D/g, '');
    if (input.value.length > 9) {
        input.value = input.value.slice(0, 9);
    }
    personalData.value.phoneNumber = input.value;
    phoneError.value = input.value.length > 0 && input.value.length < 9 ? 'El número debe tener 9 dígitos' : '';
};
</script>
<style scoped>
</style>
