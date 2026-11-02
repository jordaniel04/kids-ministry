import { createVuetify } from "vuetify";
import "vuetify/styles";
import "@mdi/font/css/materialdesignicons.css";

import { VDateInput } from 'vuetify/labs/VDateInput'
import { es } from 'vuetify/locale';

export default createVuetify({
  components: {
    VDateInput,
  },
  locale: {
    locale: 'es',
    messages: { es },
  },
  defaults: {
    VCard: {
      rounded: "xl",
    },
    VBtn: {
      rounded: "lg",
    },
    VTextField: {
      rounded: "lg",
    },
  },
  theme: {
    defaultTheme: "light",
    themes: {
      light: {
        colors: {
          background: "#FBF5EA",
          surface: "#FFFFFF",
          primary: "#D97757",
          secondary: "#6B9080",
          success: "#6B9080",
          warning: "#E0A33E",
          error: "#C1572E",
          info: "#8A6E4E",
        },
      },
    },
  },
});
