const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

// Middleware
function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find( (user) => user.username === username);

  if(!user){
    return response.status(404).json({error : "User not found"})
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some( user => user.username === username);

  if(userAlreadyExists){
    return response.status(400).json({ error : "User already exists!" });
  }

  const user =(
    {
      id : uuidv4(),
      name,
      username,
      todos: []
    }
  );

  users.push(user);

  return response.status(201).json(user);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at : new Date()
  }

  user.todos.push(todo);

  return response.status(201).json(todo);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const {title, deadline} = request.body;
  const { id } = request.params; 

  const indexOfTodo = user.todos.findIndex( todo => todo.id === id);

  if(indexOfTodo < 0 ){
    return response.status(404).json({error: "Todo don't fount"})
  }

  const todoToChangeInfo = user.todos[indexOfTodo];

  title ? todoToChangeInfo.title = title : false;
  deadline ? todoToChangeInfo.deadline = deadline : false;

  return response.status(201).json(todoToChangeInfo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const indexOfTodo = user.todos.findIndex( todo => todo.id === id);

  if(indexOfTodo < 0 ){
    return response.status(404).json({error: "Todo don't fount"})
  }

  user.todos[indexOfTodo].done = true;

  return response.status(201).json(user.todos[indexOfTodo])
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const indexOfTodo = user.todos.findIndex( todo => todo.id === id);
  
  if(indexOfTodo < 0){
    return response.status(404).json({error : "Todo don't fount"})
  }

  user.todos.splice(indexOfTodo, 1)

  return response.status(204).send();

});

module.exports = app;