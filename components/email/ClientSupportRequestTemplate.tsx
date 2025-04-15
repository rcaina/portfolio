export const ClientSupportRequestTemplate = ({
  name,
  email,
  contactNumber,
  company,
  message,
}: {
  name: string;
  email: string;
  contactNumber: string;
  company: string;
  message: string;
}) => {
  return `
    <div style="background-color: #3A397E; padding: 80px; border-radius: 5px;">
      <img src="http://dev.resonantdx.com/_next/image?url=%2Fwordmark.png&w=256&q=100" alt="Logo" style="display: block; margin: 0 auto; width: 300px; height: 125px; padding-bottom: 25px;">
      <div style="background-color: #f2f2f2; padding: 50px; border-radius: 5px;">    
        <div style="margin-bottom: 20px; text-align: left; line-height: 24px; font-size: 14px; font-weight: 500; padding-bottom: 10px;">
          <p style="margin: 0;">Dear ${name},</p>
        </div>

        <div style="margin-bottom: 15px; line-height: 22px; font-size: 14px;">
          <p style="margin: 0;">
            A client has submitted a support request through the portal. Below are the details of their request:
          </p>
        </div>

        <ul>
            <li>Client Name: ${name}</li>
            <li>Client Email: ${email}</li>
            <li>Client Phone: ${contactNumber || "N/A"}</li>
            <li>Client Company: ${company}</li>
            <li>Request: ${message}</li>
          </ul>

      </div>
    </div>
  `;
};
