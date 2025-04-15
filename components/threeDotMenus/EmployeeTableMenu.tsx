import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../common/DropdownMenu";

import ConfirmModal from "../modals/ConfirmModal";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import { GetEmployeesResponse } from "@/pages/api/employee";
import { KeyedMutator } from "swr";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { useState } from "react";

export const EmployeeTableMenu = ({
  employee,
  mutate,
}: {
  employee: GetEmployeesResponse["employees"][number];
  mutate: KeyedMutator<GetEmployeesResponse>;
}) => {
  const router = useRouter();
  const [deleteEmployeeModalOpen, setDeleteEmployeeModalOpen] = useState(false);
  const refreshData = async () => {
    router.replace(router.asPath, undefined, {
      scroll: false,
    });
    await mutate();
  };

  const onDelete = async () => {
    await fetch(`/api/employee/${employee.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (response.ok) {
          toast.success(`Successfully updated employee`);
          setDeleteEmployeeModalOpen(false);
          refreshData();
        } else {
          toast.error("Failed to update employee");
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
            id={employee.id}
            onClick={(e) => {
              router.push(`/settings/organization/team/${employee.id}`);
              e.stopPropagation();
            }}
          >
            Edit Employee
          </DropdownMenuItem>
          {
            <DropdownMenuItem
              id={employee.id}
              onClick={(e) => {
                setDeleteEmployeeModalOpen(true);
                e.stopPropagation();
              }}
            >
              Delete Employee
            </DropdownMenuItem>
          }
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmModal
        open={deleteEmployeeModalOpen}
        setOpen={setDeleteEmployeeModalOpen}
        title="Delete Employee"
        text={`Are you sure you want to delete ${employee.fullName}?`}
        onConfirm={onDelete}
      />
    </>
  );
};
