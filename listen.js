const app = require("./db/app");
const { PORT = 9090 } = process.env;

app.listen(PORT, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log(`Listening on port ${PORT}...`);
  }
});
