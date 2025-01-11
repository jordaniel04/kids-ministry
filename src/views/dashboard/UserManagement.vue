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
                            <VCol cols="12" sm="6">
                                <VSelect
                                    v-model="editedItem.areaNumber"
                                    :items="areaNumbers"
                                    label="Área"
                                ></VSelect>
                            </VCol>
                            <VCol cols="12" sm="6">
                                <VSelect
                                    v-model="editedItem.districtNumber"
                                    :items="districtNumbers"
                                    label="Distrito"
                                ></VSelect>
                            </VCol>
                            <VCol cols="12" sm="6">
                                <VSelect
                                    v-model="editedItem.location"
                                    :items="locations"
                                    label="Lugar"
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
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, deleteUser as deleteAuthUser } from "firebase/auth";
import type { User } from "../../types/User";
import NavigationBar from '../../components/NavigationBar.vue';
import type { District } from "../../types/District";

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
    districtNumber: undefined as number | undefined,
    location: undefined as string | undefined
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
        areaNumber: undefined,
        districtNumber: undefined,
        location: undefined
    };
    dialog.value = true;
};

const editUser = (user: User) => {
    isEditing.value = true;
    editedItem.value = {
        id: user.id,
        email: user.email,
        password: '',
        role: user.role,
        areaNumber: user.areaNumber || undefined,
        districtNumber: user.districtNumber || undefined,
        location: user.location || undefined
    };
    dialog.value = true;
};

const deleteUser = async (user: User) => {
    if (confirm('¿Estás seguro de eliminar este usuario?')) {
        try {
            // Eliminar de Firestore
            await deleteDoc(doc(db, "users", user.id));
            // Eliminar de Firebase Auth
            const auth = getAuth();
            const authUser = auth.currentUser;
            if (authUser) {
                await deleteAuthUser(authUser);
            }
            await getUsers();
        } catch (error) {
            console.error("Error al eliminar usuario:", error);
            alert("Error al eliminar usuario");
        }
    }
};

const saveUser = async () => {
    // Validaciones manuales
    if (!editedItem.value.email) {
        alert('El correo electrónico es requerido');
        return;
    }

    if (!isEditing.value && !editedItem.value.password) {
        alert('La contraseña es requerida');
        return;
    }

    if (!editedItem.value.role) {
        alert('El rol es requerido');
        return;
    }

    saving.value = true;
    try {
        if (isEditing.value) {
            await updateDoc(doc(db, "users", editedItem.value.id), {
                role: editedItem.value.role,
                areaNumber: editedItem.value.areaNumber,
                districtNumber: editedItem.value.districtNumber,
                location: editedItem.value.location,
                updatedAt: new Date()
            });
        } else {
            const auth = getAuth();
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                editedItem.value.email,
                editedItem.value.password
            );

            // Guardar en users collection
            await setDoc(doc(db, "users", userCredential.user.uid), {
                email: editedItem.value.email,
                role: editedItem.value.role,
                areaNumber: editedItem.value.areaNumber,
                districtNumber: editedItem.value.districtNumber,
                location: editedItem.value.location,
                createdAt: new Date(),
                updatedAt: new Date()
            });

            // Crear documento inicial en leaders collection
            await setDoc(doc(db, "leaders", userCredential.user.uid), {
                personalData: {
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                ministerialData: {
                    district: editedItem.value.location,
                    areaNumber: editedItem.value.areaNumber,
                    districtNumber: editedItem.value.districtNumber,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            });
        }
        await getUsers();
        closeDialog();
    } catch (error) {
        console.error("Error al guardar usuario:", error);
        alert("Error al guardar usuario");
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
        districtNumber: undefined,
        location: undefined
    };
};

const getUsers = async () => {
    try {
  const usersCollection = collection(db, "users");
  const userDocs = await getDocs(usersCollection);
        
        const usersData = await Promise.all(userDocs.docs.map(async (userDoc) => {
            const userData = userDoc.data();
            
            return {
                id: userDoc.id,
                ...userData,
                location: userData.location || 'No asignado',
                lastLogin: userData.lastLogin?.toDate().toLocaleString() || "N/A",
                createdAt: userData.createdAt?.toDate() || new Date(),
                updatedAt: userData.updatedAt?.toDate() || new Date(),
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
const locations = computed(() => {
    return districts.value
        .filter(d => d.areaNumber === editedItem.value.areaNumber && 
                    d.districtNumber === editedItem.value.districtNumber)
        .map(d => d.location);
});

const loadDistricts = async () => {
    const querySnapshot = await getDocs(collection(db, "districts"));
    districts.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as District));
};

onMounted(async () => {
    await loadDistricts();
  getUsers();
});
</script>

<style scoped>
.cursor-pointer {
    cursor: pointer;
}
</style>
