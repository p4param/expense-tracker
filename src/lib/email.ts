import nodemailer from 'nodemailer';

export async function sendGroupCreatedEmail(to: string, groupName: string, groupId: string) {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    let testAccount = await nodemailer.createTestAccount();

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || "smtp.ethereal.email",
        port: Number(process.env.EMAIL_PORT) || 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER || testAccount.user, // generated ethereal user
            pass: process.env.EMAIL_PASS || testAccount.pass, // generated ethereal password
        },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: '"TripSplit" <no-reply@tripsplit.app>', // sender address
        to: to, // list of receivers
        subject: `Welcome to ${groupName}!`, // Subject line
        text: `You created a new group: ${groupName}.\n\nYour Group ID is: ${groupId}\n\nShare this ID with others to let them join.`, // plain text body
        html: `
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
                <h1>Welcome to TripSplit!</h1>
                <p>You have successfully created the group <strong>${groupName}</strong>.</p>
                <div style="background: #f4f4f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0; color: #666; font-size: 0.9em;">GROUP ID</p>
                    <p style="margin: 5px 0 0; font-size: 1.5em; font-weight: bold; letter-spacing: 1px;">${groupId}</p>
                </div>
                <p>Share this ID with your friends so they can join and start splitting expenses.</p>
            </div>
        `, // html body
    });

    console.log("Message sent: %s", info.messageId);
    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}
