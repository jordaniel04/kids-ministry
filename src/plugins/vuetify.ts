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
  theme: {
    defaultTheme: "light",
    themes: {
      light: {
        colors: {
          primary: "#1867C0",
          secondary: "#5CBBF6",
        },
      },
    },
  },
});
