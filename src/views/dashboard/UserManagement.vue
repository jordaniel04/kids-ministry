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
                    <template #[`item.district`]="{ item }">
                        {{ item.district || 'No asignado aún' }}
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
                    <VForm ref="form" @submit.prevent="saveUser">
                        <VTextField
                            v-model="editedItem.email"
                            label="Correo Electrónico"
                            type="email"
                            required
                            :disabled="isEditing"
                        ></VTextField>

                        <VTextField
                            v-if="!isEditing"
                            v-model="editedItem.password"
                            label="Contraseña"
                            :type="showPassword ? 'text' : 'password'"
                            required
                            :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                            @click:append="showPassword = !showPassword"
                        ></VTextField>

                        <VSelect
                            v-model="editedItem.role"
                            :items="['admin', 'lider', 'guest']"
                            label="Rol"
                            required
                        ></VSelect>
                    </VForm>
                </VCardText>

                <VCardActions>
                    <VSpacer></VSpacer>
                    <VBtn color="error" variant="text" @click="closeDialog">Cancelar</VBtn>
                    <VBtn color="success" variant="text" @click="saveUser" :loading="saving">
                        Guardar
                    </VBtn>
                </VCardActions>
            </VCard>
        </VDialog>
    </VContainer>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, defineComponent } from "vue";
import { db } from "../../firebase/config";
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc, getDoc } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, deleteUser as deleteAuthUser } from "firebase/auth";
import type { User } from "../../types/User";
import NavigationBar from '../../components/NavigationBar.vue';

defineComponent({
  name: 'UserManagement'
});

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
    role: 'guest'
});

const headers = [
    { title: "Email", key: "email" },
    { title: "Último Inicio de Sesión", key: "lastLogin" },
    { title: "Rol", key: "role" },
    { title: "Distrito", key: "district" },
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
        role: 'guest'
    };
    dialog.value = true;
};

const editUser = (user: User) => {
    isEditing.value = true;
    editedItem.value = {
        id: user.id,
        email: user.email,
        password: '',
        role: user.role
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
    saving.value = true;
    try {
        if (isEditing.value) {
            await updateDoc(doc(db, "users", editedItem.value.id), {
                role: editedItem.value.role,
                updatedAt: new Date()
            });
        } else {
            const auth = getAuth();
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                editedItem.value.email,
                editedItem.value.password
            );

            await setDoc(doc(db, "users", userCredential.user.uid), {
                email: editedItem.value.email,
                role: editedItem.value.role,
                createdAt: new Date(),
                updatedAt: new Date()
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
        role: 'guest'
    };
};

const getUsers = async () => {
    try {
        const usersCollection = collection(db, "users");
        const userDocs = await getDocs(usersCollection);
        
        // Obtener los datos de usuario y sus distritos
        const usersData = await Promise.all(userDocs.docs.map(async (userDoc) => {
            const userData = userDoc.data();
            let district = null;

            // Buscar el distrito en la colección leaders
            const leaderDoc = await getDoc(doc(db, "leaders", userDoc.id));
            if (leaderDoc.exists()) {
                const leaderData = leaderDoc.data();
                district = leaderData?.ministerialData?.district || null;
            }

            return {
                id: userDoc.id,
                ...userData,
                district: district,
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
        case "guest":
            return "grey";
        default:
            return "red";
    }
};

const form = ref<HTMLFormElement | null>(null);

getUsers();
</script>

<style scoped>
.cursor-pointer {
    cursor: pointer;
}
</style>
