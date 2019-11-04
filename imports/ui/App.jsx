import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import {Meteor} from  'meteor/meteor';
import {withTracker} from 'meteor/react-meteor-data'; 

import { Tasks } from '../api/tasks.js';

import Task from './Task.jsx';
import AccountsUIWrapper from './AccountsUIWrapper.jsx';

 
// App component - represents the whole app
class App extends Component {
  constructor(props) {
    super(props);

    this.state={
      hideCompleted:false,
    };
  }
  handleSubmit(event){
    event.preventDefault();

    //find the text field via the React ref
    const text = ReactDOM.findDOMNode(this.refs.taskInput).value.trim();

   Meteor.call('tasks.insert', text)

    //clear form
    ReactDOM.findDOMNode(this.refs.taskInput).value='';
  }

  toggleHideCompleted(){
    this.setState({
      hideCompleted: !this.state.hideCompleted,
    });
  }

  renderTasks() {

    let filteredTasks = this.props.tasks;
    if(this.state.hideCompleted){
      filteredTasks = filteredTasks.filter(task=> !task.checked);

    }


    return filteredTasks.map((task) => {
      const currentUserId = this.props.currentUser && this.props.currentUser._id;
      const showPrivateButton = task.owner === currentUserId;

      return(
      <Task
       key={task._id} 
       task={task} 
       showPrivateButton= {showPrivateButton}
       />
    );
  });
}

render() {
    return (
      <div className="container">
        <header>
          <h1>Dreco Todo List ({this.props.incompleteCount})</h1>

          <label className= "hide-completed">
            <input 
              type = "checkbox"
              readOnly
              checked = {this.state.hideCompleted}
              onClick={this.toggleHideCompleted.bind(this)}
          />
          Hide Completed Tasks
          </label>

          <AccountsUIWrapper />
          { this.props.currentUser?
     // the following code creates a form for you to add text 
          <form className="new-task" onSubmit={this.handleSubmit.bind(this)}>
          	<input
          		type= "text"
          		ref="taskInput"
          		placeholder="Add a new task"/>
          		</form>: ''
           }
            </header>

 
        <ul>
          {this.renderTasks()}
        </ul>
      </div>
    );
  }

}
export default withTracker(() =>{
  Meteor.subscribe('tasks');

	return {
    tasks:Tasks.find({}, {sort: { createdAt: -1}}).fetch(),
    incompleteCount: Tasks.find({ checked: {$ne:true}}).count(),
    currentUser:Meteor.user(),
	};
})(App);

