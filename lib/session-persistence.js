const SeedData = require("./seed-data");
const deepCopy = require("./deep-copy");
const {sortTodoLists, sortTodos} = require('./sort');
const nextId = require('./next-id');

module.exports = class SessionPersistence {
  constructor(session) {
    this._todoLists = session.todoLists || deepCopy(SeedData);
    session.todoLists = this._todoLists;
  }

   // Returns a copy of the list of todo lists sorted by completion status and
  // title (case-insensitive).
  sortedTodoLists() {
    let todoLists = deepCopy(this._todoLists);
    let undone = todoLists.filter(todoList => !this.isDoneTodoList(todoList));
    let done = todoLists.filter(todoList => this.isDoneTodoList(todoList));
    return sortTodoLists(undone, done);
  }

   // Are all of the todos in the todo list done? If the todo list has at least
  // one todo and all of its todos are marked as done, then the todo list is
  // done. Otherwise, it is undone.
  isDoneTodoList(todoList) {
    return todoList.todos.length > 0 && todoList.todos.every(todo => todo.done);
  }

  // Returns a copy of the todo list with the indicated ID. Returns `undefined`
  // if not found. Note that `todoListId` must be numeric.
  // Returns a copy of the todo list with the indicated ID. Returns `undefined`
  // if not found. Note that `todoListId` must be numeric.
  loadTodoList(todoListId) {
    let todoList = this._findTodoList(todoListId);
    return deepCopy(todoList);
  }

  hasUndoneTodos(todoList) {
    return todoList.todos.some(todo => !todo.done);
  }

  sortedTodos(todoList) {
    let todos = todoList.todos;
    let undone = todos.filter(todo => !todo.done) ;
    let done = todos.filter(todo => todo.done) ;
    return deepCopy(sortTodos(undone,done));
  }

  // Returns a copy of the indicated todo in the indicated todo list. Returns
  // `undefined` if either the todo list or the todo is not found. Note that
  // both IDs must be numeric.
  loadTodo(todoListId, todoId) {
    let todo = this._findTodo(todoListId, todoId);
    return deepCopy(todo);
  }

  // Toggle a todo between the done and not done state. Returns `true` on
  // success, `false` if the todo or todo list doesn't exist. The id arguments
  // must both be numeric.
  toggleDoneTodo(todoListId, todoId) {
    let todo = this._findTodo(todoListId, todoId);
    if (!todo) return false;

    todo.done = !todo.done;
    return true;
  }

  // Returns a reference to the todo list with the indicated ID. Returns
  // `undefined`. if not found. Note that `todoListId` must be numeric.
  _findTodoList(todoListId) {
    return this._todoLists.find(todoList => todoList.id === todoListId);
  }

  // Returns a reference to the indicated todo in the indicated todo list.
  // Returns `undefined` if either the todo list or the todo is not found. Note
  // that both IDs must be numeric.
  _findTodo(todoListId, todoId) {
    let todoList = this._findTodoList(todoListId);
    if (!todoList) return undefined;

    return todoList.todos.find(todo => todo.id === todoId);
  }


  // Delete the specified todo from the specified todo list. Returns `true` on
  // success, `false` if the todo or todo list doesn't exist. The id arguments
  // must both be numeric.
  deleteTodo(todoListId, todoId) {
    let todoList = this._findTodoList(todoListId);
    if (!todoList) return false;

    let todoIndex = todoList.todos.findIndex(todo => todo.id === todoId);
    if (todoIndex === -1) return false;

    todoList.todos.splice(todoIndex, 1);
    return true;
  }


    // Create a new todo with the specified title and add it to the indicated todo
  // list. Returns `true` on success, `false` on failure.
  createTodo(todoListId, title) {
    let todoList = this._findTodoList(todoListId);
    if (!todoList) return false;

    todoList.todos.push({
      title,
      id: nextId(),
      done: false,
    });

    return true;
  }
    // Mark all todos on the todo list as done. Returns `true` on success,
  // `false` if the todo list doesn't exist. The todo list ID must be numeric.
  completeAllTodos(todoListId) {
    let todoList = this._findTodoList(todoListId);
    if (!todoList) return false;

    todoList.todos.filter(todo => !todo.done)
                  .forEach(todo => (todo.done = true));
    return true;
  }

 // Delete a todo list from the list of todo lists. Returns `true` on success,
  // `false` if the todo list doesn't exist. The ID argument must be numeric.
  deleteTodoList(todoListId) {
    let todoListIndex = this._todoLists.findIndex(todoList => {
      return todoList.id === todoListId;
    });

    if (todoListIndex === -1) return false;

    this._todoLists.splice(todoListIndex, 1);
    return true;
  }

   // Set a new title for the specified todo list. Returns `true` on success,
  // `false` if the todo list isn't found. The todo list ID must be numeric.
  setTodoListTitle(todoListId, title) {
    let todoList = this._findTodoList(todoListId);
    if (!todoList) return false;

    todoList.title = title;
    return true;
  }

  isUniqueConstraintViolation(_error) {
    return false;
  }
  // Returns `true` if a todo list with the specified title exists in the list
  // of todo lists, `false` otherwise.
  existsTodoListTitle(title) {
    return this._todoLists.some(todoList => todoList.title === title);
  }

  createTodoList(title) {
   
      this._todoLists.push({id: nextId(), title : title, todos : []});
    return true;
  }
  // editTitle(todoListId, newTitle) {
  //   let todoList = this._findTodoList(+todoListId)
  //   if (!todoList) {
  //     return false
  //   } else {
  //     todoList.title = newTitle;
  //     return true;
  //   }
  // }

  // completeAllTodos(todoListId) {
  //   let list = this._findTodoList(+todoListId);
  //   if(!list) return false;
  //   list.todos.forEach(todo => todo.done = true);
  // }

  // deleteTodo(todoListId, todoId) {
  //   let list = this._findTodoList(+todoListId)
  //   //cant work with this because this is a single todo and was getting errors when trying to iterate over it. Need the entire list (a reference) so that we can mutate it using splice.
  //   // let todos = this._findTodo(+todoListId,+todoId);
  //   let index = -1;
  //   list.todos.forEach((todo,index) => {
  //     if (todo.id === +todoId) {
  //       index = index
  //     }
  //   })
  //   list.todos.splice(index, 1);
  // }

  // toggleCompletion(todoListId, todoId) {
  //   // doesnt work because loadTodoList returns a deep copy and we need references.
  //   // let todo = this.loadTodo(todoListId, todoId);
  //   //this way works - i got my original train of thought up and running but commented it out and copied their code over.
  //   let todoList = this._todoLists.filter(list => list.id === +todoListId)[0];
  //   let todo = todoList.todos.filter(todo => todo.id === +todoId)[0];
  //   if (todo.done) {
  //      todo.done = false;
  //   } else if (!todo.done) {
  //     todo.done = true;
  //   }

  // }
};