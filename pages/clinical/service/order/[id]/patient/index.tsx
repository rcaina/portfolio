import AddEditPatientModal, {
  AddPatientInputs,
} from "@/components/modals/AddEditPatientModal";
import {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import { Patient, ServiceRequest, ServiceType } from "@prisma/client";
import SelectPatientForm, {
  ServiceRequestSelectPatientFormInputs,
} from "@/components/forms/ServiceRequestForms/SelectPatientForm";

import Button from "@/components/common/Button";
import Container from "@/components/layout/Container";
import PageHeader from "@/components/layout/PageHeader";
import { SubmitHandler } from "react-hook-form";
import { addSevenHours } from "@/lib/utils";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import { isEmpty } from "lodash-es";
import prisma from "@/lib/prisma";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { useState } from "react";

interface Props {
  serviceRequest: ServiceRequest & {
    serviceType: ServiceType;
    order: { organizationId: string };
  };
  patients: Patient[];
}

export const getServerSideProps: GetServerSideProps<Props> = async ({
  req,
  res,
  query,
}) => {
  const session = await getServerSession(req, res, authOptions);
  const { id } = query;

  if (!session?.user.id) {
    return {
      redirect: {
        destination: "/sign-in",
        permanent: false,
      },
    };
  }

  const serviceRequest = await prisma.serviceRequest.findUnique({
    where: {
      id: id as string,
    },
    select: {
      serviceType: true,
      order: {
        select: {
          organizationId: true,
        },
      },
    },
  });

  if (!serviceRequest) {
    return {
      redirect: {
        destination: "/404",
        permanent: false,
      },
    };
  }

  const patients = await prisma.patient.findMany({
    where: {
      organizationId: serviceRequest.order?.organizationId,
    },
  });

  return {
    props: {
      serviceRequest: JSON.parse(JSON.stringify(serviceRequest)),
      patients: JSON.parse(JSON.stringify(patients)),
    },
  };
};

const ServiceRequestSelectPatientPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ serviceRequest, patients }) => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: ServiceRequestSelectPatientFormInputs) => {
    setIsSubmitting(true);
    fetch(`/api/clinical/service/order/${serviceRequest.id}/patient`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then(async (response) => {
        if (response.ok) {
          toast.success("Patient saved successfully");
          return response.json();
        } else {
          const res = await response.json();
          toast.error(res.error ?? "An error occurred saving the patient");
        }
      })
      .then((data) => {
        router.push(
          `/clinical/service/order/${data.id}/questions/${serviceRequest.serviceType.id}`
        );
      })
      .catch((error) => {
        console.error("Error saving patient:", error);
        throw new Error("Error saving patient");
      })
      .finally(() => setIsSubmitting(false));
  };

  const onAddNewPatient: SubmitHandler<AddPatientInputs> = async (data) => {
    await fetch("/api/patient", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...data,
        dateOfBirth: addSevenHours(data.dateOfBirth),
      }),
    })
      .then((response) => {
        if (response.ok) {
          return;
        } else {
          toast.error("An error occurred adding the patient");
          throw new Error("Error creating new patient");
        }
      })
      .then(() => {
        toast.success(`Successfully added patient`);
        setIsModalOpen(false);
        router.replace(router.asPath, undefined, { scroll: false });
      })
      .catch((err) => {
        toast.error(err.message);
      });
  };

  const continueWithoutChange = () => {
    router.push(
      `/clinical/service/order/${serviceRequest.id}/questions/${serviceRequest.serviceType.id}`
    );
  };

  return (
    <div className=" flex min-h-screen flex-col ">
      <PageHeader title={`Patient`} />
      {!isEmpty(patients) ? (
        <Container>
          <div className="flex justify-end">
            <Button onClick={() => setIsModalOpen(true)}>
              Add New Patient
            </Button>
          </div>
          <div className="flex flex-grow items-center justify-center">
            <SelectPatientForm
              onSubmit={onSubmit}
              continueWithoutChange={continueWithoutChange}
              patients={patients}
              selectedPatientId={serviceRequest.patientId ?? ""}
              isSubmitting={isSubmitting}
            />
          </div>
        </Container>
      ) : (
        <div className="flex flex-grow items-center justify-center">
          <div className="flex flex-col gap-4">
            No patients found. Please add a new patient to continue.
            <div className="rounded-md border border-primary-500 p-8">
              <Button className="w-full" onClick={() => setIsModalOpen(true)}>
                Add New Patient
              </Button>
            </div>
          </div>
        </div>
      )}
      {isModalOpen && (
        <AddEditPatientModal
          open={isModalOpen}
          setOpen={() => setIsModalOpen(false)}
          onSubmit={onAddNewPatient}
        />
      )}
    </div>
  );
};

export default ServiceRequestSelectPatientPage;
