const Message = require('../models/Message');

exports.sendMessage = async (req, res) => {
    try {
        const { receiver, content } = req.body;
        let message = new Message({
            sender: req.user.id,
            receiver,
            content
        });
        await message.save();

        message = await message.populate('sender', 'username role');
        message = await message.populate('receiver', 'username role');

        res.json(message);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getMessages = async (req, res) => {
    try {
        const userId = req.user.id;
        const otherUserId = req.params.userId;

        let query;
        if (req.user.role === 'admin') {
            // Admin can see all messages of the selected user (with anyone)
            // But wait, if we return all their messages, they won't be grouped. 
            // If admin just clicks a user, admin can see their conversations.
            query = {
                $or: [
                    { sender: otherUserId },
                    { receiver: otherUserId }
                ]
            };
        } else {
            query = {
                $or: [
                    { sender: userId, receiver: otherUserId },
                    { sender: otherUserId, receiver: userId }
                ]
            };
        }

        const messages = await Message.find(query)
            .sort({ timestamp: 1 })
            .populate('sender', 'username role')
            .populate('receiver', 'username role');

        res.json(messages);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
