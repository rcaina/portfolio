import { Controller, useFieldArray, useForm } from "react-hook-form";
import { PlusCircleIcon, TrashIcon } from "@heroicons/react/24/outline";

import Button from "@/components/common/Button";
import Container from "@/components/layout/Container";
import { GetServerSideProps } from "next";
import Input from "@/components/common/Input";
import PageHeader from "@/components/layout/PageHeader";
import Select from "@/components/common/Select";
import { isEmpty } from "lodash-es";
import { toast } from "react-toastify";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface Props {
  projects: {
    id: string;
    name: string;
    serviceTypes: { id: string; name: string }[];
  }[];
}

// const allowedRoles: Role[] = [Role.ADMIN, Role.RESEARCHER];

const ResearchKitIdSubmitionFormSchema = z.object({
  projectTypeId: z.string().min(1),
  kits: z.array(
    z.object({
      id: z.string().min(1),
      serviceTypeId: z.string().min(1),
      tissueType: z.string().min(1),
      volume: z.string().min(1),
      note: z.string().optional(),
    })
  ),
});

type ResearchKitIdSubmitionFormInputs = z.infer<
  typeof ResearchKitIdSubmitionFormSchema
>;

export const getServerSideProps: GetServerSideProps<Props> = async (
  {
    // req,
    // res,
  }
) => {
  return {
    redirect: {
      destination: "/404.tsx",
      permanent: false,
    },
  };
  // const cookies = new Cookies(req, res);
  // const rawCookieValue = cookies.get("currentAccount");

  // if (rawCookieValue) {
  //   const decodedValue = decodeURIComponent(rawCookieValue);
  //   const account = JSON.parse(decodedValue);
  //   if (!account?.id) {
  //     return {
  //       redirect: {
  //         destination: "/404.tsx",
  //         permanent: false,
  //       },
  //     };
  //   }

  //   const currentAccount = await prisma.employeeToClinic.findUnique({
  //     where: {
  //       id: account.id,
  //     },
  //     select: {
  //       role: true,
  //       clinic: {
  //         select: {
  //           id: true,
  //         },
  //       },
  //     },
  //   });

  //   if (!currentAccount?.clinic.id) {
  //     return {
  //       redirect: {
  //         destination: "/404.tsx",
  //         permanent: false,
  //       },
  //     };
  //   }

  //   if (!allowedRoles.includes(currentAccount.role)) {
  //     return {
  //       redirect: {
  //         destination: "/404.tsx",
  //         permanent: false,
  //       },
  //     };
  //   }

  //   const projects = await prisma.project.findMany({
  //     where: {
  //       deleted: false,
  //     },
  //     select: {
  //       id: true,
  //       name: true,
  //       serviceTypes: {
  //         select: {
  //           id: true,
  //           name: true,
  //         },
  //       },
  //     },
  //   });

  //   return {
  //     props: {
  //       projects: JSON.parse(JSON.stringify(projects)),
  //     },
  //   };
  // }

  // return {
  //   redirect: {
  //     destination: "/404.tsx",
  //     permanent: false,
  //   },
  // };
};

const defaultFormValues = {
  projectTypeId: undefined,
  kits: [{ id: "", tissueType: "", volume: "", serviceTypeId: "", note: "" }],
};

const SpecimenSubmissionPage = ({ projects = [] }: Props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProject, setSelectedProject] = useState(""); // Track the selected project
  const [filteredServiceTypes, setFilteredServiceTypes] = useState<
    { id: string; name: string }[]
  >([{ id: "", name: "" }]); // Track filtered service types

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ResearchKitIdSubmitionFormInputs>({
    defaultValues: defaultFormValues,
    resolver: zodResolver(ResearchKitIdSubmitionFormSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "kits",
  });

  const onSubmit = (data: ResearchKitIdSubmitionFormInputs) => {
    setIsSubmitting(true);
    fetch(`/api/research/specimen/assignment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then(async (response) => {
        if (response.ok) {
          toast.success("Kit ID saved successfully");
          return response.json();
        } else {
          const res = await response.json();
          toast.error(res.error ?? "An error occurred saving the kit ID");
        }
      })
      .then((data) => {
        if (data) {
          toast.success("Kit ID(s) added successfully");
        }
      })
      .catch((error) => {
        console.error("Error saving kit ID:", error);
        throw new Error("Error saving kit ID");
      })
      .finally(() => setIsSubmitting(false));
  };
  const handleProjectChange = (projectId: string) => {
    setSelectedProject(projectId); // Set the selected project ID
    const selectedProjectData = projects.find(
      (project) => project.id === projectId
    );
    // Filter service types based on the selected project
    setFilteredServiceTypes(selectedProjectData?.serviceTypes || []);
  };

  // Map project options for the dropdown
  const projectOptions = projects.map((project) => ({
    label: project.name,
    value: project.id,
  }));

  // Map service type options for the selected project
  const serviceTypeOptions = filteredServiceTypes.map((type) => ({
    label: type.name,
    value: type.id,
  }));

  return (
    <div className="flex max-h-screen flex-col overflow-y-auto pb-4">
      <div className="sticky top-0 z-20">
        <PageHeader title={`Submit Samples For Processing`} />
      </div>
      <Container>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mx-auto flex w-full flex-col items-center rounded-lg border border-highlight-600 p-6 shadow-lg shadow-highlight-600"
        >
          <div className="flex w-full flex-col gap-4">
            <Controller
              name="projectTypeId"
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <Select
                  label="Select Protocol"
                  data={projectOptions}
                  value={value}
                  onChange={(val) => {
                    onChange(val); // Update form state
                    handleProjectChange(val); // Update service types based on the selected project
                  }}
                  error={errors.projectTypeId?.message}
                  disabled={isSubmitting || isEmpty(projectOptions)}
                />
              )}
            />
            {fields.map((item, index) => (
              <div key={item.id} className="flex items-center gap-4">
                <div className="flex-grow">
                  <Input
                    {...register(`kits.${index}.id`)}
                    placeholder="Enter kit ID"
                    label={`Kit ID ${index + 1}`}
                    disabled={isSubmitting || !selectedProject}
                    error={errors.kits?.[index]?.id?.message}
                  />
                </div>
                <div className="flex-grow">
                  <Controller
                    name={`kits.${index}.serviceTypeId`}
                    control={control}
                    rules={{ required: true }}
                    render={({ field: { value, onChange } }) => (
                      <Select
                        label="Select Protocol"
                        data={serviceTypeOptions}
                        value={value}
                        onChange={onChange}
                        error={errors.kits?.[index]?.serviceTypeId?.message}
                        disabled={isSubmitting || !selectedProject}
                      />
                    )}
                  />
                </div>
                <div className="flex-grow">
                  <Input
                    {...register(`kits.${index}.tissueType`)}
                    label={`Tissue Type`}
                    disabled={isSubmitting || !selectedProject}
                    error={errors.kits?.[index]?.tissueType?.message}
                  />
                </div>
                <div className="flex-grow">
                  <Input
                    {...register(`kits.${index}.volume`)}
                    label={`Volume`}
                    disabled={isSubmitting || !selectedProject}
                    error={errors.kits?.[index]?.volume?.message}
                  />
                </div>
                <div className="flex-grow">
                  <Input
                    {...register(`kits.${index}.note`)}
                    label={`Note`}
                    disabled={isSubmitting || !selectedProject}
                    error={errors.kits?.[index]?.note?.message}
                  />
                </div>
                <div className="self-end">
                  <Button
                    Icon={<TrashIcon className="hover:text-red-500" />}
                    variant="danger"
                    type="button"
                    onClick={() => remove(index)}
                    className="bg-red-100 text-red-500 transition hover:bg-red-200"
                    disabled={isSubmitting || !selectedProject}
                  />
                </div>
              </div>
            ))}
            <div className="flex flex-row justify-between">
              <Button
                Icon={<PlusCircleIcon />}
                variant="secondary"
                type="button"
                disabled={isSubmitting || !selectedProject}
                onClick={() =>
                  append({
                    id: "",
                    tissueType: "",
                    volume: "",
                    serviceTypeId: "",
                    note: "",
                  })
                }
              >
                Add Kit
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={isSubmitting || !selectedProject}
                loading={isSubmitting}
              >
                Submit Kits
              </Button>
            </div>
          </div>
        </form>
      </Container>
    </div>
  );
};

export default SpecimenSubmissionPage;
