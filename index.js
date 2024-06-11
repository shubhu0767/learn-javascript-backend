import dotenv from "dotenv";
import connectMongoDB from "./src/db/mongodb.js";
import {app} from "./src/app.js";

dotenv.config({
  path: "/.env",
});

connectMongoDB().then(() => {
  app.on('error', (err) => {
    console.log('error', err);
  });
  app.listen(process.env.PORT || 3232, () => {
    console.log('server is running on', process.env.PORT);
  })
}).catch((err) => {
  console.log("DB connection error", err);
})  

// app.get("/", (req, res) => {
//   res.send("Hello World!");
// });

// app.get("/here", (req, res) => {
//   res.send("Hey I'm Shubham Tambwe");
// });

// app.get("/login", (req, res) => {
//   res.send("<h1>sign up</h1>");
// });

// const resObj = {
//   firstName: "shubham",
//   lastName: "Tambwe",
//   dob: "26/07/2001",
//   educationInfo: {
//     degree: "BCA",
//     completed: true,
//     yearOfPassing: 2022,
//   },
//   city: "Ambajogai",
//   state: "Maharashtra",
// };

// app.get("/getData", (req, res) => {
//   res.json(resObj);
// });

// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`);
// });
