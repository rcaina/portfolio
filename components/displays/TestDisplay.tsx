import Button from "../common/Button";
import Image from "next/image";
import { ServiceType } from "@prisma/client";
import logo from "@/public/images/logo.png";
import { useRouter } from "next/router";

interface Props {
  serviceType: ServiceType;
  className?: string;
}

const ServiceTypeDisplay: React.FC<Props> = ({ serviceType, className }) => {
  const router = useRouter();
  return (
    <div
      className={`m-auto flex flex-col items-center justify-center gap-4 ${className}`}
    >
      <div className="flex flex-col items-center justify-center gap-12 rounded-md p-6 shadow-custom-bottom-left shadow-primary-300">
        <div className="flex w-20 items-center justify-center overflow-hidden rounded-full bg-white">
          <Image
            priority
            src={logo}
            alt="logo"
            placeholder="blur"
            width={95}
            height={36}
            className="object-cover"
          />
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-64 text-center text-xl font-bold">
            {serviceType.name}
          </div>
          <div className="w-64 text-center">{serviceType.description}</div>
          <div className="w-64 text-center">${serviceType.price}</div>
        </div>
        <Button
          variant="primary"
          className="w-48"
          onClick={() =>
            router.push(`/practitioner/order/service/${serviceType.id}`)
          }
        >
          Order
        </Button>
      </div>
    </div>
  );
};

export default ServiceTypeDisplay;
