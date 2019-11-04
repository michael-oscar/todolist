
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { assert } from 'chai';
import { Accounts } from 'meteor/accounts-base';

import { Tasks } from './tasks.js';


// this code runs in the server
if (Meteor.isServer) {
    describe('Tasks', () => {
        describe('methods', () =>{
            //create a random userId
            const rUserId = Random.id();
            //create an empty variable for your tasks
            let taskId;
            // this block of code runs once when the program runs
            before(() => {
                 // Create user if not already created.
                Meteor.users.remove({});
                Accounts.createUser({username: 'Michael',
                email: 'oscar@gmail.com',password:'05c4r4t3ch'  });
                userId = Meteor.users.findOne({ username: 'Michael'});
            });

                
                
            // this block of code runs evertime before each (it) testcase is called
            beforeEach(()=>{
                //clear the database everytime this block runs
                Tasks.remove({});
                //add a new entry into the database
                taskId = Tasks.insert({
                        text: ' test task',
                    createdAt: new Date(),
                    owner: rUserId,
                    username: 'oscar ',

                });

            });


            //testcase block begins
            //Test case to check if a user can delete his/her task
            it ('can delete own task', () => {
                // call the delete task method from tasks.js
                const deleteTask= Meteor.server.method_handlers['tasks.remove'];

                //set up an invocation of the argument the method expects i.e a userID
                const testID ={rUserId};

                // run the test for the delete method
                deleteTask.apply(testID, [taskId]);

                //verify that the test method returns the expected result
                assert.equal (Tasks.find().count(),0);
                //in this case, 0 is put because at start, 1 entry is added and 
                //upon delete, no entry is expected to be left

            });

            //Testcase to check if another users task can't be deleted
            it("cannot delete someone else's task", function() {
                         // Set task to private
                         Tasks.update(taskId, { $set: { private: true } });
                
                         // Generate a random ID, representing a different user
                         const rUserId = Random.id();
                
                         const deleteTask = Meteor.server.method_handlers['tasks.remove'];
                         const testID = { rUserId };
                
                         // Verify that error is thrown
                         assert.throws(function() {
                           deleteTask.apply(testID, [taskId]);
                         }, Meteor.Error, '[this is not your task,Daagbooo]');
                         // note that whatever error message you have here must be the same in the method code
                      // Verify that task is not deleted
                         assert.equal(Tasks.find().count(), 1);
                      });

                        // can insert tasks
                      it('can insert task', function() {
                        let text = ' test task';
                          const insert = Meteor.server.method_handlers['tasks.insert'];
                          const invocation = { userId };
                          insert.apply(invocation, [text]);
                          assert.equal(Tasks.find().count(), 2);
                          });


                            // cannot insert tasks if not loggedin
                      it('cannot insert task', function() {
                        let text = ' test task';
                        const insert = Meteor.server.method_handlers['tasks.insert'];
                        const invocation = { rUserId };
                        assert.throws(function() {
                            insert.apply(invocation, [text]);
                          }, Meteor.Error, '[not-authorized]');
                        
                        assert.equal(Tasks.find().count(), 1);
                        });

                        //can set own task checked
                        it ('can set own task checked', () => {
                            // call the internal implementation of the setChecked task method
                            const checkTask= Meteor.server.method_handlers['tasks.setChecked'];
            
                            //set up a fake invocation of the argument the method expects
                            const testID ={userId: rUserId};
            
                            // run the test method
                            checkTask.apply(testID, [taskId, true]);
            
                            //verify that the test method returns the expected result
                            assert.equal (Tasks.find({checked: true}).count(),1);
            
                        });


                        
                        //cannot set someone task checked
                        it ('cannot set someone else task checked', () => {
                            
                            Tasks.update(taskId, {$set: {private: true}});
                            // call the internal implementation of the setChecked task method
                            const checkTask= Meteor.server.method_handlers['tasks.setChecked'];
            
                            //set up a differrent user  of the argument the method expects
                            const testID ={userId};
                            assert.throws(function() {
                                checkTask.apply(testID, [taskId, true]);
                                }, Meteor.Error, '[You cant bro! not-authorized]');
            
                            //verify that the test method returns the expected result
                            assert.equal (Tasks.find({checked: true}).count(),0);
            
                        });

                         //can set own task private
                         it ('can set own task private', () => {
                            // call the internal implementation of the setPrivate task method
                            const privateTask= Meteor.server.method_handlers['tasks.setPrivate'];
            
                            //set up a fake invocation of the argument the method expects
                            const testID ={ userId: rUserId};
            
                            // run the test method
                            privateTask.apply(testID, [taskId, true]);
            
                            //verify that the test method returns the expected result
                            assert.equal (Tasks.find({private: true}).count(),1);
            
                        });

                         //cannot set someones task private
                         it ('cannot set someones task private', () => {
                            // call the internal implementation of the setPrivate task method
                            const privateTask= Meteor.server.method_handlers['tasks.setPrivate'];
            
                            //set up a fake invocation of the argument the method expects
                            const testID ={ userId};
            
                            // run the test method
                            assert.throws(function() {
                            privateTask.apply(testID, [taskId, true]);
                            }, Meteor.Error, '[no way, not-authorized]');
            
            
                            //verify that the test method returns the expected result
                            assert.equal (Tasks.find({private: true}).count(),0);
            
                        });

                        //publish test case

                        it('can view own task and non-private tasks', ()=>{
                            const rUserId = Random.id();
                            Tasks.insert({
                                text: ' test task',
                            createdAt: new Date(),
                            owner: rUserId,
                            username: 'alfred ',
        
                        });
                        const invocation={rUserId};
                        const tasksPublication =Meteor.server.publish_handlers['tasks'];

                        assert.strictEqual(tasksPublication.apply(invocation).count(),2)
        
                        })




        });
    });
}


