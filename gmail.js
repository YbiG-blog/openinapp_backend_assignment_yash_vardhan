// gmail.js
const { google } = require('googleapis');
const { getOAuthClient } = require('./auth');

const listMessages = async ()=>{
  const auth = await getOAuthClient();
  const gmail = google.gmail({ version: 'v1', auth });

  try {
    const response = await gmail.users.messages.list({
      userId: 'me',
      labelIds: ['INBOX'],
    });

    return response.data.messages || [];
  } catch (error) {
    throw new Error(`Error listing messages: ${error.message}`);
  }
}

const sendAutoReply= async (messageId)=>{
  const auth = await getOAuthClient();

  const gmail = google.gmail({ version: 'v1', auth });

  try {
    const message = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
    });
  console.log("message : ",message);

    const headers = message.data.payload.headers;
    const originalSenderHeader = headers.find(header => header.name === 'From');
    const originalSender = originalSenderHeader ? originalSenderHeader.value : undefined;
    const subjectHeader = headers.find(header => header.name === 'Subject');
    const subject = subjectHeader ? subjectHeader.value : undefined;

    if (!originalSender) { throw new Error('Sender email address not found in the message headers.'); }

    console.log("originalSender : ", originalSender);

    const autoReply = `Thank you for your email. I'm currently on vacation and will get back to you as soon as possible.`;

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: Buffer.from(
          `From: "Yash Vardhan" <localacc7906@gmail.com>\r\n` +
            `To: ${originalSender}\r\n` +
            `Subject: Re: ${subject}\r\n` +
            `\r\n` +
            `${autoReply}`
        ).toString('base64'),
      },
    });
  } catch (error) {
    throw new Error(`Error sending auto-reply: ${error.message}`);
  }
}

const addLabel = async (messageId, labelName)=>{
  const auth = await getOAuthClient();
  const gmail = google.gmail({ version: 'v1', auth });

  try {
    await gmail.users.messages.modify({
      userId: 'me',
      id: messageId,
      requestBody: {
        addLabelIds: [labelName],
      },
    });

    await gmail.users.messages.trash({
      userId: 'me',
      id: messageId,
    });
  } catch (error) {
    throw new Error(`Error in labeling : ${error.message}`);
  }
}

const fetchThreadInfo = async(threadId)=>{
  const auth = await getOAuthClient();
  const gmail = google.gmail({ version: 'v1', auth });

  try {
    const response = await gmail.users.threads.get({
      userId: 'me',
      id: threadId,
    });

    return response.data;
  } catch (error) {
    throw new Error(`Error fetching thread information: ${error.message}`);
  }
}

module.exports = { listMessages, sendAutoReply, addLabel, fetchThreadInfo };