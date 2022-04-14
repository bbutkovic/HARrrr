import serve from "./server";

const port = parseInt(process.env.PORT || "8080", 10);
serve(port);