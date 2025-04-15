import AddEditPatientModal, {
  AddPatientInputs,
} from "@/components/modals/AddEditPatientModal";
import { useEffect, useState } from "react";

import Button from "@/components/common/Button";
import { GetPatientsResponse } from "@/pages/api/patient";
import Input from "@/components/common/Input";
import { KeyedMutator } from "swr";
import MagnifyingGlassIcon from "@heroicons/react/20/solid/MagnifyingGlassIcon";
import Pagination from "@/components/common/Pagination";
import { PatientTableMenu } from "../../threeDotMenus/PatientTableMenu";
import { Section } from "@/components/common/Section";
import { SubmitHandler } from "react-hook-form";
import { Table } from "@/components/common/Table";
import { UsersIcon } from "@heroicons/react/24/outline";
import { addSevenHours } from "@/lib/utils";
import { createColumnHelper } from "@tanstack/react-table";
import { toast } from "react-toastify";
import useDebouncedSearch from "@/lib/hooks/useDebounceSearch";
import { usePatients } from "@/lib/hooks/employees/usePatients";

type Props = Record<string, never>;

const columnHelper =
  createColumnHelper<GetPatientsResponse["patients"][number]>();

const createColumns = (mutate: KeyedMutator<GetPatientsResponse>) => [
  columnHelper.accessor("fullName", {
    header: () => "Name",
    cell: (info) => <strong>{info.renderValue()}</strong>,
  }),
  columnHelper.accessor("email", {
    header: () => "Email",
  }),
  columnHelper.accessor("phoneNumber", {
    header: () => "Phone Number",
    cell: (info) => info.row.original.phoneNumber || "--",
  }),
  columnHelper.accessor("sex", {
    header: () => "Sex",
  }),
  columnHelper.display({
    id: "actions",
    header: "",
    cell: (info) =>
      info.row.original && (
        <PatientTableMenu
          patient={info.row.original}
          mutate={async () => {
            await mutate();
          }}
        />
      ),
  }),
];

export default function PatientTable({}: Props) {
  const { searchValue, setSearchValue, debouncedValue } =
    useDebouncedSearch("");
  const [isOpen, setIsOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);

  useEffect(() => {
    setPage(0);
  }, [debouncedValue]);

  const { patients, totalPatients, mutate } = usePatients({
    search: debouncedValue,
    page,
    pageSize,
  });
  const totalPages = Math.ceil(totalPatients / pageSize);

  const columns = createColumns(mutate);

  const onSubmit: SubmitHandler<AddPatientInputs> = async (data) => {
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
          toast.success(`Successfully added patient`);
          mutate();
          setIsOpen(false);
        } else {
          toast.error("Failed to add patient");
        }
      })
      .catch((err) => {
        toast.error(err.message);
      });
  };

  return (
    <div className="flex min-h-screen flex-col gap-8">
      <div className="mb-4 flex justify-end">
        <Button variant="primary" onClick={() => setIsOpen(true)}>
          Add Patient
        </Button>
      </div>
      <div className="flex flex-row items-center gap-4">
        <div className="w-full">
          <Input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            name="search"
            type="text"
            placeholder="Search"
            Icon={MagnifyingGlassIcon}
          />
        </div>
        <div className="hidden sm:flex sm:items-baseline sm:space-x-8"></div>
      </div>
      {patients.length > 0 ? (
        <Table
          className="mt-6"
          data={patients || []}
          columns={columns}
          rowLinkBase={"/clinical/patient"}
        />
      ) : (
        <Section>
          <div className="flex w-full flex-col items-center gap-4">
            <UsersIcon className="h-8 w-8 fill-secondary-400" />
            <p>No patients found</p>
          </div>
        </Section>
      )}
      {patients.length > pageSize && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={(newPage) => setPage(newPage)}
        />
      )}
      {isOpen && (
        <AddEditPatientModal
          open={isOpen}
          setOpen={setIsOpen}
          onSubmit={onSubmit}
        />
      )}
    </div>
  );
}
