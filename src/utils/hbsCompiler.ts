import fs from "fs";
import path from "path";
import * as exphbs from "express-handlebars";

const resetLink = `http://localhost:3000/auth/resetPassword/`;

const data = new Promise((resolve) => {
    console.log(__dirname);
    fs.readFile(
        path.join(
            __dirname,
            "..",
            "public",
            "templates",
            "resetEmail.hbs"
        ),
        "utf8",
        (err, hbsFile) => {
            if (err) {
                console.error(err);
                return;
            }
            const hbs = exphbs.create({
                extname: "hbs",
                defaultLayout: false,
            }).handlebars;

            // Compile template with reset link
            const template = hbs.compile(hbsFile, {});
            const htmlToSend = template({
                reset_url: resetLink,
            });
            resolve(htmlToSend);
        }
    );
});

