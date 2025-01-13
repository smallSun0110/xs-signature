import { createApp } from "vue";
import App from "./App.vue";
import "../dist/style.css"
import VueSignaturePad from "vue-signature-pad";
import XsSignature from "@/components";
// import XsSignature from "../dist/xs-signature.es";  
const app = createApp(App);
app.use(VueSignaturePad);
app.use(XsSignature);

app.mount("#app");
