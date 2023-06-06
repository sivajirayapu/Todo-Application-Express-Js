const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "todoApplication.db");
const app = express();
app.use(express.json());

let database = null;

const initializeDBAndServer = async () => {
  try {
    database = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000")
    );
  } catch (e) {
    console.log(`Db Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// API 1

const convertTODbResponse = (object) => {
  return {};
};

const containStatusAndPriority = (query) => {
  return query.priority !== undefined && query.status !== undefined;
};

const containsStatus = (query) => {
  return query.status !== undefined;
};

const containsPriority = (query) => {
  return query.priority !== undefined;
};

app.get("/todos/", async (request, response) => {
  let todoQuery = "";
  let dbResponse = null;

  const { search_q = "", status, priority } = request.query;

  switch (true) {
    case containStatusAndPriority(request.query):
      todoQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%' AND status = '${status}'
          AND priority = '${priority}'`;
      break;
    case containsStatus(request.query):
      todoQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%' AND status = '${status}';`;
      break;
    case containsPriority(request.query):
      todoQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%' AND priority = '${priority}';`;
      break;
    default:
      todoQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%';`;
  }

  dbResponse = await database.all(todoQuery);
  console.log(dbResponse);
  response.send(dbResponse);
});

//API 2

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const todoQuery = `SELECT * FROM todo WHERE id = ${todoId};`;
  const dbResponse = await database.get(todoQuery);
  response.send(dbResponse);
});

// API 3

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const todoQuery = `INSERT INTO todo (id, todo, priority, status) VALUES (${id}, '${todo}', '${priority}', '${status}');`;
  const dbResponse = await database.run(todoQuery);
  response.send("Todo Successfully Added");
});

// API 4

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { status, priority, todo } = request.body;
  console.log(todoId);

  let todoQuery = "";
  let responseMessage = "";

  switch (true) {
    case containsStatus(request.body):
      todoQuery = `UPDATE todo SET status = '${status}' WHERE id = ${todoId};`;
      responseMessage = "Status Updated";
      break;
    case containsPriority(request.body):
      todoQuery = `UPDATE todo SET priority = '${priority}' WHERE id = ${todoId};`;
      responseMessage = "Priority Updated";
      break;
    default:
      todoQuery = `UPDATE todo SET todo = '${todo}' WHERE id = ${todoId};`;
      responseMessage = "Todo Updated";
  }

  await database.run(todoQuery);
  response.send(responseMessage);
});

// APi 5

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const todoQuery = `DELETE FROM todo WHERE id = ${todoId};`;
  await database.run(todoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
