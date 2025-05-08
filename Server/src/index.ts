import app, { server } from "./app";
import dotenv from "dotenv";
import io from "./app";
dotenv.config();

const PORT = process.env.PORT;

server.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`);
});
