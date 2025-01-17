const express = require('express');
const app = express();
const { listMessages, sendAutoReply, addLabel, fetchThreadInfo } = require('./gmail');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  startApp();
});

app.get('/', async (req, res) => {
  try {
    const messages = await listMessages();
    for (const message of messages) {
      const messageId = message.id;
    
      if (await hasNoReplies(messageId) === false ) {
        console.log("yash");
        await sendAutoReply(messageId);
        await addLabel(messageId,'Vacation_Replies_by_Yash');
      }
    }
    res.send('Processing completed.');
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

const hasNoReplies = async(messageId)=>{
  const threadId = (await listMessages(messageId))[0].threadId;
  const thread = await fetchThreadInfo(threadId);

  // console.log("thread.messages : ", thread.messages);
  if ( Array.isArray(thread.messages) && thread.messages.length > 0) {
    if (thread.messages[0].labelIds.includes('SENT') || thread.messages[0].labelIds.includes('Vacation_Replies_by_Yash')) {
      return true;
    }
  }
  return false;
}

const startApp = async()=>{
  setInterval(async () => {
    await listMessages();
  }, 60000);
}
