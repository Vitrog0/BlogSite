import express from "express";
import bodyParser from "body-parser";
import morgan  from "morgan";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from "url";
import { dirname } from "path";

const app = express();
app.set('view engine', 'ejs');
const port = 3000;
const __dirname = dirname(fileURLToPath(import.meta.url));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
let created_files = [];



process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

function cleanup() {
    for (let i = 0; i < created_files.length; i++) {
        fs.unlink(path.join(__dirname, 'views', 'partials', created_files[i]), err => {
            if (err) console.error(`Error deleting file ${created_files[i]}: `, err);
        });
    }
    process.exit();
}



app.get("/",(req,res) => {
    fs.readdir(path.join(__dirname, 'views', 'partials'), (err, filenames) => {
        if(err) {
            console.log("Error reading directory: ", err);
        } else {
            res.render("index.ejs",{
                filenames: filenames,
            });
        }
    });
});
app.get('/favicon.ico', (req, res) => res.status(204));
app.get('/:filename', (req, res) => {
    const filename = req.params.filename;
    res.render(`partials/${filename}`);
});

app.post('/submit_url', (req, res) => {
    console.log("Jeste se pripremili");
    let title = req.body["title"];
    let text = req.body["blog"];
    let content = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.2/css/all.min.css">
        <link rel="stylesheet" href="/styles/styles.css">
    </head>
    <body>
        <section>
            <div class="wrapper">
                <input type="checkbox" id="btn" hidden>
                <label for="btn" class="menu-btn">
                  <i class="fas fa-bars"></i>
                  <i class="fas fa-times"></i>
                </label>
                <nav id="sidebar">
                  <div class="title">Side Menu</div>
                  <ul class="list-items">
                    <li><a href="/"><i class="fas fa-home"></i>Home</a></li>
                  </ul>
                </nav>
              </div>
        </section>
        <h1>${title}</h1>  
        <div class="blog-flex">
            <div class="blog-card">${text}</div>
        </div>
    </body>
    </html>`;
    let filename = title + ".ejs";

    fs.writeFile(path.join(__dirname,"views/partials",filename), content, err => {
        if (err) {
            console.log(err);
            res.status(500).send('An error occurred while creating the file.');
        } else {
            created_files.push(filename);
            res.redirect("/");
        }
    });
});
app.listen(port, () => {
    console.log("Server running on port " + port);
});
