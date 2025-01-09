import { createVuetify } from "vuetify";
import "vuetify/styles";
import "@mdi/font/css/materialdesignicons.css";

import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import { VDateInput } from 'vuetify/labs/VDateInput'
import { es } from 'vuetify/locale';

export default createVuetify({
  components: {
    ...components,
    VDateInput,
  },
  directives,
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
