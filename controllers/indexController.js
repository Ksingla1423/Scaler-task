const Item = require('../models/listitem');
const Participant = require('../models/participant');
const moment = require('moment');

// Home Controller
module.exports.homeController = async function (req, res) {
  try {
    let toDoList = await Item.find({}).populate('participants');
    let participants = await Participant.find({});
    let ans = [];
    toDoList.forEach(function (item) {
      let temp = {};
      temp.startTime = moment(item.startTime).utc().format();
      temp.endTime = moment(item.endTime).utc().format();
      temp._id = item._id;
      temp.description = item.description;
      ans.push(temp);
    });
    return res.render('home', {
      list: ans,
      participants: participants,
    });
  } catch (err) {
    console.error('Error in fetching list:', err);
    return res.status(500).send('Internal Server Error');
  }
};

// Get Info
module.exports.getInfo = async (req, res) => {
  try {
    let info = await Item.findById(req.query.id).populate('participants');
    return res.status(200).json({ data: info });
  } catch (err) {
    console.error('Error fetching info:', err);
    return res.status(500).send('Internal Server Error');
  }
};

// Render Create List Page
module.exports.renderCreateList = async function (req, res) {
  try {
    let participants = await Participant.find({});
    return res.render('create_list', { participants });
  } catch (err) {
    console.error('Error rendering Create List page:', err);
    return res.status(500).send('Internal Server Error');
  }
};

// Create List
module.exports.createList = async function (req, res) {
  let startDate = new Date(`${req.body.date}T${req.body.start_time}+05:30`);
  let endDate = new Date(`${req.body.date}T${req.body.end_time}+05:30`);

  if (endDate.getTime() < startDate.getTime()) {
    req.flash('error', 'End time cannot be before start time');
    return res.redirect('back');
  }

  if (!Array.isArray(req.body.pid) || req.body.pid.length < 2) {
    req.flash('error', 'Number of participants must be at least 2');
    return res.redirect('back');
  }

  try {
    let conflict = await Item.findOne({
      $and: [
        { participants: { $in: req.body.pid } },
        {
          $or: [
            {
              $and: [
                { startTime: { $lte: startDate } },
                { endTime: { $gte: startDate } },
              ],
            },
            {
              $and: [
                { startTime: { $lte: endDate } },
                { endTime: { $gte: endDate } },
              ],
            },
            {
              $and: [
                { startTime: { $gte: startDate } },
                { endTime: { $lte: endDate } },
              ],
            },
          ],
        },
      ],
    });

    if (conflict) {
      req.flash('error', 'Time clash with one of the participants');
      return res.redirect('back');
    }

    await Item.create({
      description: req.body.description,
      category: req.body.category,
      startTime: startDate,
      endTime: endDate,
      participants: req.body.pid,
    });

    req.flash('success', 'Interview Scheduled Successfully');
    return res.redirect('/');
  } catch (err) {
    console.error('Error creating list:', err);
    return res.redirect('back');
  }
};

// Delete List
module.exports.DeleteList = async function (req, res) {
  try {
    await Item.findByIdAndDelete(req.query.id);
    req.flash('success', 'Task Deleted Successfully');
    return res.redirect('/');
  } catch (err) {
    console.error('Error deleting list:', err);
    return res.status(500).send('Internal Server Error');
  }
};

// Add Participant
module.exports.addParticipant = async (req, res) => {
  try {
    await Participant.create({
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email,
    });
    return res.status(200).json({ message: 'Participant Created' });
  } catch (err) {
    console.error('Error creating participant:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Edit List
module.exports.edit = async (req, res) => {
  let startDate = new Date(`${req.body.date}T${req.body.start_time}+05:30`);
  let endDate = new Date(`${req.body.date}T${req.body.end_time}+05:30`);

  if (endDate.getTime() < startDate.getTime()) {
    req.flash('error', 'End time cannot be before start time');
    return res.redirect('back');
  }

  if (!Array.isArray(req.body.pid) || req.body.pid.length < 2) {
    req.flash('error', 'Number of participants must be at least 2');
    return res.redirect('back');
  }

  try {
    let conflict = await Item.findOne({
      $and: [
        { participants: { $in: req.body.pid } },
        { _id: { $ne: req.query.id } },
        {
          $or: [
            {
              $and: [
                { startTime: { $lte: startDate } },
                { endTime: { $gte: startDate } },
              ],
            },
            {
              $and: [
                { startTime: { $lte: endDate } },
                { endTime: { $gte: endDate } },
              ],
            },
            {
              $and: [
                { startTime: { $gte: startDate } },
                { endTime: { $lte: endDate } },
              ],
            },
          ],
        },
      ],
    });

    if (conflict) {
      req.flash('error', 'Time clash with one of the participants');
      return res.redirect('back');
    }

    await Item.findByIdAndUpdate(req.query.id, {
      description: req.body.description,
      category: req.body.category,
      startTime: startDate,
      endTime: endDate,
      participants: req.body.pid,
    });

    req.flash('success', 'Record Updated');
    return res.redirect('back');
  } catch (err) {
    console.error('Error updating list:', err);
    return res.redirect('back');
  }
};
