import cron from 'node-cron';
import { ConnectionRequest } from '../models/connectionRequest.model.js';
import { endOfDay, startOfDay, subDays } from 'date-fns';
import sendEmail from './sendEmail.js';

//this cron job will run at 8am in morning everyday
cron.schedule("0 8 * * *", async () => {
    //send email to all people who got requests the prevoius day 
    console.log("Hello World" + new Date());

    try {

        const yesterday = subDays(new Date(), 1);
        const yesterdayStart = startOfDay(yesterday);
        const yesterdayEnd = endOfDay(yesterday)

        console.log(yesterday);
        const pendingRequestsOfYesterday = await ConnectionRequest.find({
            status: "interested",
            createdAt: {
                $gte: yesterdayStart,
                $lt: yesterdayEnd
            }
        }).populate('fromUserId toUserId');

        const listOfEmails = [...new Set(pendingRequestsOfYesterday.map(req => req.toUserId.emailId))]
        console.log(listOfEmails);
        for (const email of listOfEmails) {

            //send email
            try {
                const res = await sendEmail.run(
                    "New friend request pending for " 
                    + email, 
                    " there are so many request pending, please login to devconnect.info and accept or reject the request");
                console.log(res);
            } catch (error) {
                console.log(error);
            }
        }

    } catch (error) {
        console.log(error)
    }
})