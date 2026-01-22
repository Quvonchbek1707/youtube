import express from "express";
import { join } from "path";

const app = express();
const PORT = 3000;

app.use(express.static(join(process.cwd(), "public")));
app.use("/js", express.static(join(process.cwd(), "js")));
app.use("/css", express.static(join(process.cwd(), "css")));
app.use("/img", express.static(join(process.cwd(), "img")));

const servePage = (page) => (req, res) => {
    res.sendFile(join(process.cwd(), "html", page));
};

app.get("/", servePage("index.html"));
app.get("/register", servePage("register.html"));
app.get("/checkmail", servePage("checkmail.html"));
app.get("/login", servePage("login.html"));
app.get("/admin", servePage("admin.html"));
app.use((req, res) => res.redirect("/"));

app.listen(PORT, () => console.log(`Front server running on port ${PORT}`));
