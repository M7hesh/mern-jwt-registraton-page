const app = require("./app");

const { NODE_PORT } = process.env;
app.listen(NODE_PORT, () =>
  console.log(`Server running at Port: ${NODE_PORT}`)
);
