import serve from "./server";
import getConfig from "./config";
import HARService from "./har";

const { port, harServiceSettings } = getConfig();
const harService = new HARService(harServiceSettings);

serve(port, harService);