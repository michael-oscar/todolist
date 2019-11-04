import { Meteor } from 'meteor/meteor';
import Links from '/imports/api/links';
import '../imports/api/tasks.js';

function insertLink(title, url) {
  Links.insert({ title, url, createdAt: new Date() });
}

Meteor.startup(() => {
  // the link to kickstart your project
});
