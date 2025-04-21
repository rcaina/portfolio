import dayjs from "dayjs";

interface Props {
  url: string;
  verified: boolean;
}

export const SignInEmailTemplate = ({ url, verified }: Props) => {
  const randomness = dayjs().toDate(); // this is needed to prevent Gmail from caching the email as a duplicate
  const message = verified ? "Sign in link" : "Account verification link";
  const buttonName = verified ? "Sign in" : "Verify";

  return `
     <div style="background-color: #3A397E; padding: 80px; border-radius: 5px;">
        <img src="" alt="Logo" style="display: block; margin: 0 auto; width: 300px; height: 125px; padding-bottom: 50px;">
        <div style="background-color: #f2f2f2; padding: 70px; border-radius: 5px;">
            <div style="padding-bottom: 30px; border-bottom: 1px solid #F3F4F6;">
                <div style="padding: 0 40px; text-align: center;">
                    <h2 style="display: inline-block; text-align: left; font-family: Inter, sans-serif; font-weight: bold; font-size: 20px; color: #11353f;">${message}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</h2>
                    <a href="${url}" class="button primary" style="display: inline-block; padding: 0.75rem 1.5rem; font-size: 1rem; font-weight: 500; line-height: 1.25; text-align: center; text-decoration: none; vertical-align: middle; cursor: pointer; border: 1px solid transparent; border-radius: 5px; transition: all 0.15s ease-in-out; color: #f2f2ed; background-color: #11353f; border-color: #11353f;">
                    ${buttonName}
                    </a>
                </div>
            </div>
            <div style="text-align: center; font-family: Inter, sans-serif; font-weight: 500; font-size: 13px; color: #11353f;">
                <p>
                    Didn't request this? You can safely ignore this email.
                </p>
            </div>
            <div style="text-align: center; font-family: Inter, sans-serif; font-weight: 500; font-size: 13px; color: #11353f;">
            </div>
        </div>
        <span style="opacity: 0">${randomness} </span>
  </div>
    `;
};
