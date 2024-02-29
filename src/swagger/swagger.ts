import swaggerJsdoc from "swagger-jsdoc";
import { serve, setup } from "swagger-ui-express";

const options = {
    definition: {
        openapi: "3.0.3",
        info: {
            title: "HalloDoc API",
            description: "API endpoints for a HalloDoc application",
            contact: {
                name: "Deep Akabari",
                email: "arcadecohort2.1@gmail.com",
                url: "https://github.com/deepakabari/HalloDoc-typescript",
            },
            version: "1.0.0",
        },
        servers: [
            {
                url: "http://localhost:3000/",
                description: "Local server",
            },
        ],
    },
    apis: ["./src/routes/*.routes.ts"],
};
const swaggerSpec = swaggerJsdoc(options);
function swaggerDocs(app: any) {
    // Swagger Page
    app.use("/docs", serve, setup(swaggerSpec));
    // Documentation in JSON format
    app.get("/docs.json", (req: any, res: any) => {
        res.setHeader("Content-Type", "application/json");
        res.send(swaggerSpec);
    });
}
export default swaggerDocs;
