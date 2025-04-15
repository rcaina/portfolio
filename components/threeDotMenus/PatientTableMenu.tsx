import { Patient } from "@prisma/client";
import { useRouter } from "next/router";
import { useState } from "react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../common/DropdownMenu";
import AddEditPatientModal, {
  AddPatientInputs,
} from "../modals/AddEditPatientModal";
import { addSevenHours } from "@/lib/utils";

export const PatientTableMenu = ({
  patient,
  mutate,
}: {
  patient: Patient;
  mutate: () => Promise<void>;
}) => {
  const router = useRouter();
  const [editPatientModalOpen, setEditPatientModalOpen] = useState(false);
  const refreshData = async () => {
    router.replace(router.asPath, undefined, {
      scroll: false,
    });
    await mutate();
  };

  const onSubmit = async (data: AddPatientInputs) => {
    await fetch(`/api/patient/${patient.id}`, {
      method: "PATCH",
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
          toast.success(`Successfully updated patient`);
          refreshData();
          setEditPatientModalOpen(false);
        } else {
          toast.error("Failed to update patient");
        }
      })
      .catch((err) => {
        toast.error(err.message);
      });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <EllipsisVerticalIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            id={patient.id}
            onClick={(e) => {
              e.stopPropagation();
              setEditPatientModalOpen(true);
            }}
          >
            Edit Patient
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {editPatientModalOpen && (
        <AddEditPatientModal
          open={editPatientModalOpen}
          setOpen={setEditPatientModalOpen}
          selectedPatient={patient}
          onSubmit={onSubmit}
        />
      )}
    </>
  );
};
