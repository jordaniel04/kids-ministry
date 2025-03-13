import { ref, onUnmounted } from 'vue';

// Almacén global de listeners
const globalListeners = ref<Map<string, (() => void)[]>>(new Map());

export function useFirestoreListeners(componentId: string = 'default') {
  // Asegurarse de que existe una entrada para este componente
  if (!globalListeners.value.has(componentId)) {
    globalListeners.value.set(componentId, []);
  }
  
  const addListener = (unsubscribe: () => void) => {
    const listeners = globalListeners.value.get(componentId) || [];
    listeners.push(unsubscribe);
    globalListeners.value.set(componentId, listeners);
    
    // Para depuración
    console.log(`Listener añadido a ${componentId}. Total: ${listeners.length}`);
  };
  
  const clearListeners = () => {
    const listeners = globalListeners.value.get(componentId) || [];
    listeners.forEach(unsubscribe => unsubscribe());
    globalListeners.value.set(componentId, []);
    
    // Para depuración
    console.log(`Listeners limpiados para ${componentId}`);
  };
  
  // Limpiar automáticamente cuando el componente se desmonta
  onUnmounted(() => {
    clearListeners();
  });
  
  return {
    addListener,
    clearListeners
  };
}

// Función para limpiar todos los listeners (útil para cambios de ruta)
export function clearAllFirestoreListeners() {
  globalListeners.value.forEach((listeners, componentId) => {
    listeners.forEach(unsubscribe => unsubscribe());
    console.log(`Listeners limpiados para ${componentId}: ${listeners.length}`);
  });
  
  // Reiniciar el mapa
  globalListeners.value = new Map();
  console.log('Todos los listeners han sido limpiados');
}