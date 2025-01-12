<template>
    <div>
        <NavigationBar />
        <VContainer>
    <h1>Gestor de Usuarios</h1>
            
        <VCard class="mb-4">
            <VCardTitle class="d-flex justify-space-between align-center">
                <span>Lista de Usuarios</span>
                <VBtn
                    color="primary"
                    prepend-icon="mdi-plus"
                    @click="openCreateDialog"
                >
                    Nuevo Usuario
                </VBtn>
            </VCardTitle>
            
            <VCardText>
                <!-- Buscador -->
                <VTextField
                    v-model="search"
                    prepend-icon="mdi-magnify"
                    label="Buscar usuario"
                    single-line
                    hide-details
                    class="mb-4"
                ></VTextField>

                <VDataTable
                    v-if="$vuetify.display.mdAndUp"
      :headers="headers"
                    :items="filteredUsers"
      :loading="loading"
                    :search="search"
      item-key="email"
    >
                    <template #[`item.role`]="{ item }">
                        <VChip :color="getRoleColor(item.role)">{{ item.role }}</VChip>
                    </template>
                    <template #[`item.actions`]="{ item }">
                        <VIcon
                            color="primary"
                            icon="mdi-pencil"
                            size="small"
                            class="me-2 cursor-pointer"
                            @click="editUser(item)"
                        >
                            <VTooltip activator="parent" location="top">Editar</VTooltip>
                        </VIcon>
                        <VIcon
                            color="error"
                            icon="mdi-delete"
                            size="small"
                            class="cursor-pointer"
                            @click="deleteUser(item)"
                        >
                            <VTooltip activator="parent" location="top">Eliminar</VTooltip>
                        </VIcon>
                    </template>
                </VDataTable>

                <VRow v-else>
                    <VCol v-for="user in filteredUsers" :key="user.email" cols="12" sm="6" md="4">
                        <VCard>
                            <VCardTitle>{{ user.email }}</VCardTitle>
                            <VCardSubtitle>{{ user.lastLogin }}</VCardSubtitle>
                            <VCardText>
                                <VChip :color="getRoleColor(user.role)">{{ user.role }}</VChip>
                            </VCardText>
                            <VCardActions>
                                <VSpacer />
                                <VIcon
                                    color="primary"
                                    icon="mdi-pencil"
                                    size="small"
                                    class="me-2"
                                    @click="editUser(user)"
                                />
                                <VIcon
                                    color="error"
                                    icon="mdi-delete"
                                    size="small"
                                    @click="deleteUser(user)"
                                />
                            </VCardActions>
                        </VCard>
                    </VCol>
                </VRow>
            </VCardText>
        </VCard>

        <!-- Modal para crear/editar usuario -->
        <VDialog v-model="dialog" max-width="500px">
            <VCard>
                <VCardTitle>
                    <span class="text-h5">{{ formTitle }}</span>
                </VCardTitle>

                <VCardText>
                    <VContainer>
                        <VRow>
                            <VCol cols="12">
                                <VTextField
                                    v-model="editedItem.email"
                                    label="Email"
                                    required
                                    :readonly="isEditing"
                                    :disabled="isEditing"
                                ></VTextField>
                            </VCol>
                            <VCol cols="12" v-if="!isEditing">
                                <VTextField
                                    v-model="editedItem.password"
                                    :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                                    :type="showPassword ? 'text' : 'password'"
                                    label="Contraseña"
                                    @click:append="showPassword = !showPassword"
                                    required
                                ></VTextField>
                            </VCol>
                            <VCol cols="12" sm="6">
                                <VSelect
                                    v-model="editedItem.role"
                                    :items="['admin', 'lider']"
                                    label="Rol"
                                    required
                                ></VSelect>
                            </VCol>
                            <VCol cols="12" sm="6" v-if="editedItem.role === 'lider'">
                                <VSelect
                                    v-model="editedItem.areaNumber"
                                    :items="areaNumbers"
                                    label="Área"
                                    required
                                ></VSelect>
                            </VCol>
                            <VCol cols="12" sm="6" v-if="editedItem.role === 'lider'">
                                <VSelect
                                    v-model="editedItem.districtNumber"
                                    :items="districtNumbers"
                                    label="Distrito"
                                    required
                                ></VSelect>
                            </VCol>
                            <VCol cols="12" v-if="editedItem.role === 'lider'">
                                <VSelect
                                    v-model="selectedDistrict"
                                    :items="filteredDistricts"
                                    item-title="location"
                                    item-value="id"
                                    label="Lugar"
                                    :loading="loadingDistricts"
                                    required
                                ></VSelect>
                            </VCol>
                            <VCol cols="12" v-if="editedItem.role === 'lider'">
                                <VSelect
                                    v-model="leaderRole"
                                    :items="[
                                        { title: 'Líder Principal', value: 'primary' },
                                        { title: 'Líder Secundario', value: 'secondary' }
                                    ]"
                                    label="Rol en el Distrito"
                                    required
                                ></VSelect>
                            </VCol>
                        </VRow>
                    </VContainer>
                </VCardText>

                <form @submit.prevent="saveUser">
                    <VCardActions>
                        <VSpacer></VSpacer>
                        <VBtn color="error" variant="text" @click="closeDialog">Cancelar</VBtn>
                        <VBtn type="submit" color="success" variant="text" :loading="saving">
                            Guardar
                        </VBtn>
                    </VCardActions>
                </form>
            </VCard>
        </VDialog>
    </VContainer>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { db } from "../../firebase/config";
import { collection, getDocs, doc, setDoc, deleteDoc, Timestamp, query, where, getDoc, updateDoc } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, deleteUser as deleteAuthUser } from "firebase/auth";
import type { User } from "../../types/User";
import NavigationBar from '../../components/NavigationBar.vue';
import type { District } from "../../types/District";
import type { DistrictLeader } from '../../types/DistrictLeader';
import { useAuthStore } from '../../stores/auth';

const authStore = useAuthStore();

const dialog = ref(false);
const showPassword = ref(false);
const saving = ref(false);
const users = ref<User[]>([]);
const loading = ref(true);
const search = ref("");
const isEditing = ref(false);

const editedItem = ref({
    id: '',
    email: '',
    password: '',
    role: 'lider',
    areaNumber: undefined as number | undefined,
    districtNumber: undefined as number | undefined
});

const headers = [
    { title: "Email", key: "email", sortable: true },
    { title: "Lugar", key: "location", sortable: true },
    { title: "Rol", key: "role", sortable: true },
    { title: "Último Inicio de Sesión", key: "lastLogin", sortable: true },
    { title: "Acciones", key: "actions", sortable: false }
];

const filteredUsers = computed(() => {
    if (!users.value) return [];
    
    return users.value.filter(user => {
        const searchTerm = search.value.toLowerCase();
        return (
            user?.email?.toLowerCase().includes(searchTerm) ||
            user?.role?.toLowerCase().includes(searchTerm) ||
            false
        );
    });
});

const formTitle = computed(() => isEditing.value ? 'Editar Usuario' : 'Nuevo Usuario');

const openCreateDialog = () => {
    isEditing.value = false;
    editedItem.value = {
        id: '',
        email: '',
        password: '',
        role: 'lider',
        areaNumber: undefined as number | undefined,
        districtNumber: undefined as number | undefined
    };
    selectedDistrict.value = '';
    leaderRole.value = 'primary';
    dialog.value = true;
};

const editUser = async (user: User) => {
    try {
        isEditing.value = true;
        
        // 1. Obtener información del distrito activo del líder
        const districtLeadersRef = collection(db, "district_leaders");
        const q = query(
            districtLeadersRef, 
            where("userId", "==", user.id),
            where("isActive", "==", true)
        );
        const districtLeaderDocs = await getDocs(q);
        
        if (!districtLeaderDocs.empty) {
            const districtLeader = districtLeaderDocs.docs[0].data();
            const districtDoc = await getDoc(doc(db, "districts", districtLeader.districtId));
            
            if (districtDoc.exists()) {
                const districtData = districtDoc.data();
                
                editedItem.value = {
                    id: user.id,
                    email: user.email,
                    password: '',
                    role: user.role,
                    areaNumber: districtData.areaNumber,
                    districtNumber: districtData.districtNumber
                };
                
                selectedDistrict.value = districtLeader.districtId;
                leaderRole.value = districtLeader.role || 'primary';
            }
        } else {
            // Si no tiene distrito asignado, cargar solo datos básicos
            editedItem.value = {
                id: user.id,
                email: user.email,
                password: '',
                role: user.role,
                areaNumber: undefined,
                districtNumber: undefined
            };
            selectedDistrict.value = '';
            leaderRole.value = 'primary';
        }
        
        dialog.value = true;
    } catch (error) {
        console.error("Error al cargar datos del usuario:", error);
        alert("Error al cargar datos del usuario");
    }
};

const deleteUser = async (user: User) => {
    if (confirm('¿Estás seguro de eliminar este usuario?')) {
        try {
            // 1. Eliminar relaciones de distrito-líder si existen
            const districtLeadersRef = collection(db, "district_leaders");
            const q = query(districtLeadersRef, where("userId", "==", user.id));
            const districtLeaderDocs = await getDocs(q);
            
            for (const doc of districtLeaderDocs.docs) {
                await deleteDoc(doc.ref);
            }

            // 2. Eliminar datos del líder si existen
            await deleteDoc(doc(db, "leaders", user.id));

            // 3. Eliminar el usuario de Firestore
            await deleteDoc(doc(db, "users", user.id));

            // 4. Actualizar la lista de usuarios
            await getUsers();

            // Nota: La eliminación del usuario en Firebase Auth debe hacerse desde el backend
            // ya que requiere privilegios de administrador
        } catch (error) {
            console.error("Error al eliminar usuario:", error);
            alert("Error al eliminar usuario. Los datos se han eliminado de la base de datos, pero es posible que necesites ayuda del administrador para eliminar la cuenta de autenticación.");
        }
    }
};

const selectedDistrict = ref('');
const leaderRole = ref<'primary' | 'secondary'>('primary');
const loadingDistricts = ref(false);

const saveUser = async () => {
    try {
        saving.value = true;
        const now = Timestamp.now();
        const auth = getAuth();

        if (editedItem.value.id) {
            // Código de actualización existente...
        } else {
            // 1. Crear usuario en Authentication
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                editedItem.value.email,
                editedItem.value.password
            );

            // 2. Obtener datos del distrito seleccionado
            const districtDoc = await getDoc(doc(db, "districts", selectedDistrict.value));
            if (!districtDoc.exists()) {
                throw new Error("Distrito no encontrado");
            }
            const districtData = districtDoc.data();

            // 3. Crear documento en la colección users
            const userRef = doc(db, "users", userCredential.user.uid);
            await setDoc(userRef, {
                id: userCredential.user.uid,
                email: editedItem.value.email,
                role: editedItem.value.role,
                createdAt: now,
                updatedAt: now,
                isActive: true,
                createdBy: authStore.user?.id,
                updatedBy: authStore.user?.id
            });

            // 4. Crear documento en la colección leaders
            await setDoc(doc(db, "leaders", userCredential.user.uid), {
                email: editedItem.value.email,
                role: editedItem.value.role,
                createdAt: now,
                updatedAt: now,
                createdBy: authStore.user?.id,
                updatedBy: authStore.user?.id
            });

            // 5. Si es líder, crear relación distrito-líder
            if (editedItem.value.role === 'lider') {
                const districtLeaderRef = doc(collection(db, "district_leaders"));
                await setDoc(districtLeaderRef, {
                    id: districtLeaderRef.id,
                    districtId: selectedDistrict.value,
                    userId: userCredential.user.uid,
                    role: leaderRole.value,
                    areaNumber: districtData.areaNumber,
                    districtNumber: districtData.districtNumber,
                    location: districtData.location,
                    startDate: now,
                    isActive: true,
                    createdAt: now,
                    updatedAt: now,
                    createdBy: authStore.user?.id,
                    updatedBy: authStore.user?.id
                });
            }
        }

        await getUsers();
        closeDialog();
    } catch (error) {
        console.error("Error al guardar usuario:", error);
        alert("Error al guardar usuario: " + (error as Error).message);
    } finally {
        saving.value = false;
    }
};

const closeDialog = () => {
    dialog.value = false;
    editedItem.value = {
        id: '',
        email: '',
        password: '',
        role: 'lider',
        areaNumber: undefined,
        districtNumber: undefined
    };
};

const getUsers = async () => {
    try {
        const usersCollection = collection(db, "users");
        const userDocs = await getDocs(usersCollection);
        
        const usersData = await Promise.all(userDocs.docs.map(async (userDoc) => {
            const userData = userDoc.data();
            
            // Obtener información del distrito del líder
            const districtLeadersRef = collection(db, "district_leaders");
            const q = query(districtLeadersRef, where("userId", "==", userDoc.id), where("isActive", "==", true));
            const districtLeaderDocs = await getDocs(q);
            
            let districtInfo = { location: 'No asignado' };
            if (!districtLeaderDocs.empty) {
                const districtLeader = districtLeaderDocs.docs[0].data();
                const districtDoc = await getDoc(doc(db, "districts", districtLeader.districtId));
                if (districtDoc.exists()) {
                    districtInfo = districtDoc.data() as { location: string };
                }
            }
            
            return {
                id: userDoc.id,
                email: userData.email,
                role: userData.role,
                location: districtInfo.location,
                lastLogin: userData.lastLogin?.toDate().toLocaleString() || "N/A",
                createdAt: userData.createdAt?.toDate(),
                updatedAt: userData.updatedAt?.toDate()
            };
        }));

        users.value = usersData as User[];
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
    } finally {
        loading.value = false;
    }
};

const getRoleColor = (role: string) => {
  switch (role) {
    case "admin":
      return "green";
    case "lider":
      return "blue";
    default:
      return "red";
  }
};

const districts = ref<District[]>([]);
const areaNumbers = Array.from({ length: 11 }, (_, i) => i + 1);
const districtNumbers = Array.from({ length: 10 }, (_, i) => i + 1);

const filteredDistricts = computed(() => {
    return districts.value.filter(d => 
        d.areaNumber === editedItem.value.areaNumber && 
        d.districtNumber === editedItem.value.districtNumber
    ).map(d => ({
        id: d.id,
        location: d.location
    }));
});

const loadDistricts = async () => {
    loadingDistricts.value = true;
    try {
        const querySnapshot = await getDocs(collection(db, "districts"));
        districts.value = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as District));
    } catch (error) {
        console.error("Error al cargar distritos:", error);
    } finally {
        loadingDistricts.value = false;
    }
};

onMounted(async () => {
    await loadDistricts();
    await getUsers();
});
</script>

<style scoped>
.cursor-pointer {
    cursor: pointer;
}
</style>
