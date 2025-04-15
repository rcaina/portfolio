interface Props {
  url: string;
}

export default function AccountEmailVerificationTemplate({ url }: Props) {
  return `
    <div style="background-color: #3A397E; padding: 80px; border-radius: 5px;">
    <img src="http://dev.resonantdx.com/_next/image?url=%2Fwordmark.png&w=256&q=75" alt="Logo" style="display: block; margin: 0 auto; width: 300px; height: 125px; padding-bottom: 50px;">
    <div style="background-color: #f2f2f2; padding: 70px; border-radius: 5px;">
        <div style="padding-bottom: 30px; border-bottom: 1px solid #F3F4F6;">
            <div style="padding: 0 40px; text-align: center;">
                <h2 style="display: inline-block; text-align: left; font-family: Inter, sans-serif; font-weight: bold; font-size: 20px; color: #3A397E;">Account verification link&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</h2>
                <a href="${url}" class="button primary" style="display: inline-block; padding: 0.75rem 1.5rem; font-size: 1rem; font-weight: 500; line-height: 1.25; text-align: center; text-decoration: none; vertical-align: middle; cursor: pointer; border: 1px solid transparent; border-radius: 5px; transition: all 0.15s ease-in-out; color: #3A397E; background-color: #f2f2f2; border-color: #7371fc;">
                    Verify Email
                </a>
            </div>
        </div>
        <div style="text-align: center; font-family: Inter, sans-serif; font-weight: 500; font-size: 13px; color: #3A397E;">
            <p>
            Didn't request this? You can safely ignore this email.
            </p>
        </div>
        <div style="text-align: center; font-family: Inter, sans-serif; font-weight: 500; font-size: 13px; color: #3A397E;">
            <p>
            If you have any questions, please contact support@resonantdx.com
            </p>
        </div>
    </div>
  </div>
    `;
}
