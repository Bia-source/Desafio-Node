const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

 const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find((user)=> user.username === username);
  if(!user){
    return response.status(404).json({ error: "Este Usuário não foi cadastrado"});
  }
  request.user = user;
  return next();
}

app.post('/users', (request, response) => {
   const { name, username } = request.body;
   const userAlreadyExists = users.some((user)=>user.username === username);
   if(userAlreadyExists){
     return response.status(400).json({ error: "Esse Usuário já existe"});
   }

   const newUser = {
     id: uuidv4(),
     name,
     username,
     todos: []
   }
   users.push(newUser);
   return response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
    const { user } = request;
    return response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { user } = request;
  const date = new Date().toDateString();
  const newTodo = {
   id: uuidv4(),
   title, 
   done: false,
   deadline: new Date(deadline),
   created_at: new Date(date + " 00:00"),
  }

  user.todos.push(newTodo);
  return response.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount,(request, response) => {
   const { id } = request.params;
   const { title, deadline } = request.body;
   const { user } = request;
   const todo = user.todos.find(todo => todo.id === id);
   if(!todo){
     return response.status(404).json({ error: "Esse todo nao existe, verifique o id"});
   }
   todo.title = title;
   todo.deadline = new Date(deadline);
   return response.json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
   const { id } = request.params;
   const { user } = request;
   const todo = user.todos.find(todo=> todo.id === id);
   if(!todo){
    return response.status(404).json({ error: "Esse todo nao existe, verifique o id"});
   } 
   todo.done = true;
   return response.status(200).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
   const { id } = request.params;
   const { user } = request;
   const todo = user.todos.findIndex((todo)=> todo.id === id);
   if(todo === -1){
    return response.status(404).json({ error: "Esse todo nao existe, verifique o id"});
   } 
   
   user.todos.splice(todo, 1);
   return response.status(204).json();
});

module.exports = app;
