// routes/email.js
import express from 'express';
import { ImapFlow } from 'imapflow';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();


router.get('/search-emails-bydate', async (req, res) => {
    const limit = parseInt(req.query.limit) || 2;
    const offset = parseInt(req.query.offset) || 0;
  
    if (isNaN(limit) || isNaN(offset) || limit <= 0 || offset < 0) {
      return res.status(400).json({ message: 'Invalid limit or offset values.' });
    }
  
    const client = new ImapFlow({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  
    try {
      await client.connect();
  
      let lock = await client.getMailboxLock('INBOX');
      try {
        // Set date range for October 1 to October 10
        const sinceDate = new Date('2024-10-01');
        const beforeDate = new Date('2024-10-11');  // Exclusive, so use October 11
  
        // Search emails within the date range
        const messageIds = await client.search({
          since: sinceDate,
          before: beforeDate,
        });
  
        if (messageIds.length === 0) {
          res.status(404).json({ message: 'No emails found in the specified date range.' });
          return;
        }
  
        // Implement pagination
        const paginatedMessageIds = messageIds.slice(offset, offset + limit);
  
        const emailDataList = [];
  
        for await (let message of client.fetch(paginatedMessageIds, { envelope: true, source: true })) {
          const { simpleParser } = await import('mailparser');
          const parsed = await simpleParser(message.source);
  
          const emailData = {
            uid: message.uid,
            subject: parsed.subject,
            from: parsed.from.value,
            date: parsed.date,
            to: parsed.to ? parsed.to.value : [],
            cc: parsed.cc ? parsed.cc.value : [],
            bcc: parsed.bcc ? parsed.bcc.value : [],
          };
  
          emailDataList.push(emailData);
        }
  
        res.json({
          totalResults: messageIds.length,
          emails: emailDataList,
        });
      } finally {
        lock.release();
      }
    } catch (error) {
      console.error('Error fetching emails:', error);
      res.status(500).json({ message: 'Error fetching emails', error: error.message });
    } finally {
      await client.logout();
    }
  });
  

  router.get('/search-emails', async (req, res) => {
    const searchTerm = req.query.term;
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
  
    if (!searchTerm) {
      return res.status(400).json({ message: 'Please provide a search term using the "term" query parameter.' });
    }
  
    if (isNaN(limit) || isNaN(offset) || limit <= 0 || offset < 0) {
      return res.status(400).json({ message: 'Invalid limit or offset values.' });
    }
  
    const client = new ImapFlow({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  
    try {
      await client.connect();
      let lock = await client.getMailboxLock('INBOX');
      try {
        const totalEmails = client.mailbox.exists;
        const startSeq = Math.max(1, totalEmails - 150 + 1);
  
        const messages = client.fetch(`${startSeq}:${totalEmails}`, { envelope: true, uid: true, source: true });
        const emailDataList = [];
  
        for await (let message of messages) {
          const { simpleParser } = await import('mailparser');
          const parsed = await simpleParser(message.source);
  
          // Log the parsed text body for debugging purposes
          console.log("Email Body Text:", parsed.text);
  
          // Refined regex pattern to handle potential line breaks and whitespaces
          const infoPattern = /Navn:\s*(.*?)\s*\nEpostadresse:\s*(.*?)\s*\nTelefonnummer:\s*(.*?)\s*\n.*?Startdato:\s*(.*?)\s*\nSluttdato:\s*(.*?)\s*\n/;
  
          const match = infoPattern.exec(parsed.text || '');
  
          // If match is found, extract the details
          let extractedInfo = {};
          if (match) {
            extractedInfo = {
              Navn: match[1],
              Epostadresse: match[2],
              Telefonnummer: match[3],
              Startdato: match[4],
              Sluttdato: match[5],
            };
          }
  
          if (parsed.subject && parsed.subject.toLowerCase().includes(searchTerm.toLowerCase())) {
            const emailData = {
              uid: message.uid,
              subject: parsed.subject,
              from: parsed.from.value,
              date: parsed.date,
              to: parsed.to ? parsed.to.value : [],
              cc: parsed.cc ? parsed.cc.value : [],
              bcc: parsed.bcc ? parsed.bcc.value : [],
              extractedInfo, // Include the extracted info here
            };
            emailDataList.push(emailData);
          }
        }
  
        const paginatedEmails = emailDataList.slice(offset, offset + limit);
  
        res.json({
          totalResults: emailDataList.length,
          emails: paginatedEmails,
        });
      } finally {
        lock.release();
      }
    } catch (error) {
      console.error('Error fetching emails:', error);
      res.status(500).json({ message: 'Error fetching emails', error: error.message });
    } finally {
      await client.logout();
    }
  });
  
  
  
  

router.get('/last-email', async (req, res) => {
    // Create a new ImapFlow client
    const client = new ImapFlow({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_SECURE === 'true', // Convert to boolean
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  
    try {
      // Connect to the server
      await client.connect();
  
      // Select the INBOX mailbox
      let lock = await client.getMailboxLock('INBOX');
      try {
        // Get the latest message sequence number
        let messageSeq = client.mailbox.exists;
  
        if (messageSeq === 0) {
          res.status(404).json({ message: 'No emails found in INBOX' });
          return;
        }
  
        // Fetch the last email's full source
        let message = await client.fetchOne(messageSeq, { source: true });
  
        // Parse the email using mailparser
        const { simpleParser } = await import('mailparser');
        const parsed = await simpleParser(message.source);
  
        // Prepare the response data
        const emailData = {
          subject: parsed.subject,
          from: parsed.from.value,
          date: parsed.date,
          to: parsed.to.value,
          cc: parsed.cc ? parsed.cc.value : [],
          bcc: parsed.bcc ? parsed.bcc.value : [],
          text: parsed.text,
          html: parsed.html,
        };
  
        res.json(emailData);
      } finally {
        // Release the lock
        lock.release();
      }
    } catch (error) {
      console.error('Error fetching email:', error);
      res.status(500).json({ message: 'Error fetching email', error: error.message });
    } finally {
      // Logout and close the connection
      await client.logout();
    }
  });
  
  export default router;
  