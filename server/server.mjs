import express from "express";
import cors from "cors";
import records from "./routes/record.mjs"



const PORT = process.env.PORT || 5050;
const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use("/record" , records)


app.get("/", async (req, res) => {
    res.send("<h1>Hello world </h1>").status(200)
});

app.listen(PORT, () =>{
    console.log(`server is running on port: http://localhost:${PORT}`);
});
