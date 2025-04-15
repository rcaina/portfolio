export default function NewUserCompanyInviteTemplate({
  name,
  companyName,
}: {
  name: string;
  companyName: string;
}) {
  return `
    <div style="background-color: #3A397E; padding: 80px; border-radius: 5px;">
      <img src="http://dev.resonantdx.com/_next/image?url=%2Fwordmark.png&w=256&q=75" alt="Logo" style="display: block; margin: 0 auto; width: 300px; height: 125px; padding-bottom: 50px;">
      <div style="background-color: #f2f2f2; padding: 50px; border-radius: 5px;">
        <div style="text-align: left; font-family: Inter, sans-serif; line-height: 24px; font-weight: 500; font-size: 14px; color: #3A397E; border-bottom: 1px solid #F3F4F6;">
          <p>
            Dear ${name},
          </p>
          <p>  
            You have been invited to join the ${companyName} team on Resonant! Please click the button below to complete registration.
          </p>
          <p>  
            Make sure you provive this email address when signing up.
          </p>
          <p>
           - The Resonant Team
          </p>
          <div style="padding-top: 20px;">
            <div style="text-align: center; font-family: Inter, sans-serif; font-weight: 500; font-size: 13px; color: #3A397E;">
              <p>
                Didn't request this? You can safely ignore this email.
              </p>
            </div>
          </div>
        </div>
        <div style="padding-top: 20px; text-align: right;">    
            <a href="https://app.resonantdx.com/sign-up" class="button primary" style="display: inline-block; padding: 0.75rem 1.5rem; font-size: 1rem; font-weight: 500; line-height: 1.25; text-align: center; text-decoration: none; vertical-align: middle; cursor: pointer; border: 1px solid transparent; border-radius: 5px; transition: all 0.15s ease-in-out; color: #3A397E; background-color: #f2f2f2; border-color: #7371fc;">
              Sign-up & Register
            </a>
          </div>
      </div>
    </div>
  `;
}
