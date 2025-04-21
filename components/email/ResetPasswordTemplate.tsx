import { capitalizeNames } from "@/lib/utils";
interface Props {
  name: string | null;
  url: string;
}

export const ResetPasswordTemplate = ({ url, name }: Props) => {
  const message =
    "We received a request to reset the password associated with this email. You can reset your password using the button below.";
  const userName = capitalizeNames(name) || "customer";
  return `
    <div style="background-color: #3A397E; padding: 80px; border-radius: 5px;">
        <img src="" alt="Logo" style="display: block; margin: 0 auto; width: 300px; height: 125px; padding-bottom: 50px;">
        <div style="background-color: #f2f2f2; padding: 70px; border-radius: 5px;">
      <div style="background-color: #f2f2ed; padding: 70px; border-radius: 5px;">
        <h2 style="text-align: left; font-family: Inter, sans-serif; font-weight: 500; font-size: 20px; color: #3A397E;">Dear ${userName},</h2>
        <div style="padding-bottom: 30px; border-bottom: 1px solid #f2f2ed;">
            <div style="padding: 0 40px; text-align: center;">
                <h2 style="display: inline-block; text-align: left; font-family: Inter, sans-serif; font-weight: 500; font-size: 20px; color: #3A397E;">${message}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</h2>
                <a href="${url}" class="button primary" style="display: inline-block; padding: 0.75rem 1.5rem; font-size: 1rem; font-weight: 500; line-height: 1.25; text-align: center; text-decoration: none; vertical-align: middle; cursor: pointer; border: 1px solid transparent; border-radius: 5px; transition: all 0.15s ease-in-out; color: #f2f2ed; background-color: #3A397E; border-color: #3A397E;">
                    Reset password
                </a>
            </div>
        </div>
        <div style="text-align: center; font-family: Inter, sans-serif; font-weight: 500; font-size: 13px; color: #3A397E;">
            <p>
            Didn't request this? You can safely ignore this email.
            </p>
        </div>
        <div style="text-align: center; font-family: Inter, sans-serif; font-weight: 500; font-size: 13px; color: #3A397E;">
        </div>
    
      </div>
    </div>
    `;
};
