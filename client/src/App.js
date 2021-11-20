import React from 'react';
import io from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

class App extends React.Component {
  state = {
    tasks: [],
    taskName: '',
  };

  componentDidMount() {
    this.socket = io('http://localhost:8000');
    this.socket.on('updateData', (db) => this.updataData(db));
    this.socket.on('addTask', (task) => this.addTask(task.id, task.name));
    this.socket.on('removeTask', (taskId) => this.removeTaskSocket(taskId));
  }

  updataData = (db) => {
    this.setState({ tasks: db });
  }

  removeTaskSocket = (id) => {
    const newState = this.state.tasks.filter((element) => element.id !== id)
    this.setState({ tasks: newState });
  }

  removeTask = (e) => {
    const idElement = e.target.getAttribute('taskid');
    const newState = this.state.tasks.filter((element) => element.id !== idElement)
    this.setState({ tasks: newState });
    this.socket.emit('removeTask', idElement);
  }

  taskNameOnChange = (e) => {
    this.setState({ taskName: e.target.value });
  }

  submitForm = (e) => {
    e.preventDefault();
    const id = uuidv4();
    this.addTask(id, this.state.taskName);
    this.socket.emit('addTask', { id: id, name: this.state.taskName });
    this.setState({ taskName: '' });
  }

  addTask = (id, task) => {
    this.setState({ tasks: [...this.state.tasks, { id: id, name: task }] });
  }

  render() {

    const { tasks } = this.state;

    return (
      <div className="App">

        <header>
          <h1>ToDoList.app</h1>
        </header>

        <section className="tasks-section" id="tasks-section">
          <h2>Tasks</h2>

          <ul className="tasks-section__list" id="tasks-list">

            {tasks.map((task) => (

              <li key={task.id} className="task">
                {task.name}
                <button taskid={task.id} onClick={this.removeTask} className="btn btn--red">Remove</button>
              </li>
            ))}

          </ul>

          <form id="add-task-form" onSubmit={this.submitForm}>
            <input className="text-input" autoComplete="off" type="text" placeholder="Type your description" id="task-name" value={this.state.taskName} onChange={this.taskNameOnChange} />
            <button className="btn" type="submit">Add</button>
          </form>

        </section>
      </div>
    );
  };
};

export default App;
