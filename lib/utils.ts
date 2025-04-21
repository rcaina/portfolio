import { Dispatch, SetStateAction } from "react";
import {
  KitOrderShippingStatus,
  KitOrderStatus,
  LicenseStatus,
  OrganizationType,
  PracticeType,
  Prisma,
  RequisitionFormStatus,
  Role,
  SexType,
} from "@prisma/client";
import { ZodError, z } from "zod";
import { formatInTimeZone, toDate } from "date-fns-tz";

import JSZip from "jszip";
import { NextApiResponse } from "next";
import classnames from "classnames";
import dayOfYear from "dayjs/plugin/dayOfYear";
import dayjs from "dayjs";
import { isObject } from "lodash-es";
import md5 from "md5";
import { toast } from "react-toastify";
import { twMerge } from "tailwind-merge";

export const LOCAL = "local";
export const SEARCH_DELAY = 500;
export const MIN_ACCOUNTS = 1;
export const COST_PER_KIT = 120.5;
export const KIT_ORDER_SHIPPING_CHARGE = 50;
export const MST_TIMEZONE = "America/Denver";

dayjs.extend(dayOfYear);

export const sexTypeOptions = [
  { label: "Male", value: SexType.MALE },
  { label: "Female", value: SexType.FEMALE },
];

export function cx(...args: classnames.ArgumentArray) {
  return twMerge(classnames(args));
}

export const parseAndConvertToUTC = (dateStr: string) => {
  // Parse the date string into a date object
  const parsedDate = toDate(dateStr, { timeZone: MST_TIMEZONE });
  // Format the date in UTC
  const utcDate = formatInTimeZone(
    parsedDate,
    "UTC",
    "yyyy-MM-dd'T'HH:mm:ss'Z'"
  );
  return new Date(utcDate);
};

export const fetcher = (
  resource: RequestInfo | URL,
  init: RequestInit | undefined
) => fetch(resource, init).then((res) => res.json());

export const getGravatarURL = (email: string) => {
  const address = String(email).trim().toLowerCase();
  const hash = md5(address);
  return `https://www.gravatar.com/avatar/${hash}?d=identicon`;
};

export enum S3Bucket {
  MEDICAL_LICENSES = "medicalLicenses",
  REQUISITION_FORMS = "requistionForms",
  GOVERNMENT_IDS = "governmentIds",
  RESULTS = "results",
}

export const ChargeTypeEnum = z.enum([
  "DISCOUNT",
  "SHIPPING",
  "TAX",
  "HANDLING",
  "SERVICE",
]);

interface ReadableObject {
  [key: string]: string;
}

export function ensureArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}

export const fetchResult = async (id: string) => {
  return await fetch(`/api/integrations/wbl/results/${id}`, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "GET",
  }).then((res) => res.json().then((data) => data.url));
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const parseJsonValue = (value: any): ReadableObject | null => {
  if (isObject(value)) {
    const entries = Object.entries(value);
    const readableObject: ReadableObject = {};

    for (const [key, val] of entries) {
      if (typeof val === "string") {
        readableObject[key] = val;
      } else {
        // Handle other types if needed
        readableObject[key] = JSON.stringify(val);
      }
    }

    return readableObject;
  }

  return null;
};

export const formatPhoneNumber = (phoneNumber: string) => {
  const cleaned = ("" + phoneNumber).replace(/\D/g, "");

  if (cleaned.length === 11 && cleaned[0] === "1") {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(
      7,
      11
    )}`;
  }

  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
      6,
      10
    )}`;
  }

  return phoneNumber;
};

export const generateJulianId = (prevJulianId?: string | null): string => {
  const julianDate = dayjs().dayOfYear().toString().padStart(3, "0");
  let lastSequentialNumber = 0;
  if (prevJulianId) {
    if (julianDate === prevJulianId.split("-")[1]) {
      lastSequentialNumber = parseInt(prevJulianId.split("-").pop() ?? "0");
    }
  }
  const sequentialNumber = (lastSequentialNumber + 1)
    .toString()
    .padStart(4, "0");
  const year = dayjs().year().toString().slice(-2);
  return `${year}-${julianDate}-${sequentialNumber}`;
};

// export const upload: (
//   file: File,
//   bucket: S3Bucket
// ) => Promise<PresignedResponse> = async (file, bucket) => {
//   const filename = encodeURIComponent(file.name);
//   const getPresignedResponse = await fetch(
//     `/api/s3/presigned?file=${filename}`,
//     {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "Access-Control-Allow-Origin": "*",
//       },
//       body: JSON.stringify({ title: filename, type: file.type, bucket }),
//     }
//   );
//   const responseData: PresignedResponse = await getPresignedResponse.json();
//   const url = responseData.url;
//   const uploadResponse = await fetch(url, {
//     method: "PUT",
//     body: file,
//   });
//   if (!uploadResponse.ok) {
//     throw new Error("Error uploading file");
//   }
//   return responseData;
// };

export const addSevenHours = (timestamp: Date | string): Date => {
  const inputDate = timestamp instanceof Date ? timestamp : new Date(timestamp);
  const newDate = new Date(inputDate.getTime() + 7 * 60 * 60 * 1000);
  return newDate;
};

export const toArray = <T>(value?: T | T[]): T[] | undefined => {
  if (value === undefined) return undefined;
  if (Array.isArray(value)) return value;
  return [value];
};

export const handleError = (err: unknown, res: NextApiResponse) => {
  console.error(err);
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    return res.status(400).json({ error: err.meta });
  }
  if (err instanceof Error) {
    return res.status(400).json({
      message: "Bad Request",
      error: err.message,
    });
  }
  console.error(err);
  return res.status(500).json({
    error: "Internal Server Error",
  });
};

export const generateErrorMessage = (
  errors: ZodError,
  customMessages?: Record<string, string>
): string => {
  return errors.errors
    .map((err) => {
      const key = err.path[0].toString();

      return (
        customMessages?.[key] ||
        `${key.charAt(0).toUpperCase() + key.slice(1)} is invalid or missing.`
      );
    })
    .join(" ");
};

export const getOrderId = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const milliseconds = String(now.getMilliseconds()).padStart(3, "0");

  // Example Order ID format: ORD-20231003-153045
  return `ORD-${year}${month}${day}-${hours}${minutes}${seconds}${milliseconds}`;
};

export const capitalizeNames = (name: string | null | undefined) => {
  return name
    ? name
        .split(" ")
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" ")
    : "";
};

async function downloadFileInChunks(
  directoryHandle: FileSystemDirectoryHandle,
  fileName: string,
  url: string,
  setCurrentBytes?: Dispatch<SetStateAction<number>>,
  setTotalBytes?: Dispatch<SetStateAction<number>>,
  chunkSize: number = 1024 * 1024 * 16
): Promise<void> {
  let start = 0;
  let end = chunkSize - 1;
  let totalSize: number | undefined;

  const writable = await (
    await directoryHandle.getFileHandle(fileName, { create: true })
  ).createWritable();

  while (true) {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Range: `bytes=${start}-${end}`,
      },
    });

    if (!response.ok && response.status !== 206) {
      throw new Error(`Error fetching file chunk: ${response.statusText}`);
    }

    const contentRange = response.headers.get("Content-Range");
    if (!totalSize && contentRange) {
      totalSize = parseInt(contentRange.split("/")[1], 10);
      setTotalBytes && setTotalBytes(totalSize);
    }

    const chunk = await response.arrayBuffer();

    await writable.write(chunk);

    start += chunkSize;
    end = Math.min(start + chunkSize - 1, (totalSize ?? 0) - 1);

    setCurrentBytes && setCurrentBytes(start);

    if (start >= (totalSize ?? 0)) {
      break;
    }
  }

  await writable.close();
}

/* This function fetches S3 documents and downloads them in a zip folder to the clients computer.
 * It takes an array of sample Ids called selectedIds. It is used to download the raw data and
 * results files from either of the samples tables which are viewable based on the users role.
 */
export async function getS3Docs(
  selectedIds: string[],
  reportOnly = true,
  downloadInChunks: boolean,
  setDownloadProgress?: Dispatch<SetStateAction<number>>,
  setCurrentBytes?: Dispatch<SetStateAction<number>>,
  setTotalBytes?: Dispatch<SetStateAction<number>>
): Promise<boolean> {
  try {
    const zip = new JSZip();
    let directoryHandle: FileSystemDirectoryHandle | null = null;
    if (downloadInChunks && typeof window !== "undefined") {
      directoryHandle = await window.showDirectoryPicker();
    }
    for (const id of selectedIds) {
      await fetch(`/api/s3/zip?selectedId=${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }).then(async (response) => {
        const json = await response.json();
        if (response.ok) {
          const {
            rawDataContent,
            rawDataFileName,
            resultsContent,
            resultsFileName,
          } = json;

          if (!reportOnly) {
            if (!directoryHandle) {
              const a = document.createElement("a");
              a.href = rawDataContent;

              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            } else {
              await downloadFileInChunks(
                directoryHandle,
                rawDataFileName,
                rawDataContent,
                setCurrentBytes,
                setTotalBytes
              );
            }
          }

          await fetch(resultsContent).then(async (res) => {
            if (res.ok) {
              const blob = await res.blob();
              zip.folder("reports")?.file(resultsFileName, blob);
            }
          });
        } else {
          toast.error(json.error || "Error processing request.");
        }
      });
      if (!reportOnly && !directoryHandle) {
        const timer = (ms: number) => new Promise((res) => setTimeout(res, ms));
        await timer(1000);
      }
      setDownloadProgress && setDownloadProgress((prev) => prev + 1);
    }
    const content = await zip.generateAsync({ type: "blob" });
    if (content.size > 25) {
      if (directoryHandle) {
        const writer = await (
          await directoryHandle.getFileHandle("reports.zip", { create: true })
        ).createWritable();

        writer.write(content);
        writer.close();
      } else {
        const reports = document.createElement("a");
        reports.href = URL.createObjectURL(content);
        reports.download = "reports.zip";
        document.body.appendChild(reports);
        reports.click();
        document.body.removeChild(reports);
      }

      toast.success("Download successful");
      return true;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    toast.error(`${errorMessage}`);
    return false;
  }
  return false;
}

export const organizationRolesFilterOptions = [
  {
    label: "Practitioner",
    value: Role.PRACTITIONER,
  },
  {
    label: "Staff",
    value: Role.STAFF,
  },
  {
    label: "Billing Administrator",
    value: Role.BILLING_MANAGER,
  },
];

export const researchRolesFilterOptions = [
  {
    label: "Admin",
    value: Role.ADMIN,
  },
  {
    label: "Researcher",
    value: Role.RESEARCHER,
  },
  {
    label: "Data Analyst",
    value: Role.DATA_ANALYST,
  },
  {
    label: "Billing Administrator",
    value: Role.BILLING_MANAGER,
  },
];

export const organizationAllowedRoles: Role[] = [Role.PRACTITIONER, Role.STAFF];
export const PractitionerTypes = [
  "Select practitioner type",
  "MD - Medical Doctor",
  "DO - Doctor of Osteopathic Medicine",
  "ND - Naturopathic Doctor",
  "DC - Doctor of Chiropractic",
  "L.Ac - Licensed Acupuncturist",
  "DAOM/OMD - Doctor of Acupuncture and Oriental Medicine",
  "APRN - Advanced Practice Registered Nurse",
  "CNS - Clinical Nurse Specialist",
  "NP - Nurse Practitioner",
  "PA - Physician Assistant",
  "RN - Registered Nurse",
  "Pharmacist",
  "Dietitian",
  "DPM - Doctor of Podiatric Medicine",
  "PhD - Doctor of Philosophy",
  "Nutritionist",
  "Health Coach",
  "Dentist",
  "Optometrist",
  "Other",
];

export const mapAdminStatusToCustomerStatus = (status: string) => {
  switch (status) {
    case "DRAFT":
      return "DRAFT";
    case "COMPLETE":
      return "COMPLETED";
    default:
      return "IN_PROGRESS";
  }
};

export const mapPracticeTypeToText: Record<PracticeType, string> = {
  [PracticeType.MEDICAL_DOCTOR]: "Medical Doctor",
  [PracticeType.DOCTOR_OF_OSTEOPATHIC_MEDICINE]:
    "Doctor of Osteopathic Medicine",
  [PracticeType.NATUROPATHIC_DOCTOR]: "Naturopathic Doctor",
  [PracticeType.DOCTOR_OF_CHIROPRACTIC]: "Doctor of Chiropractic",
  [PracticeType.LICENSED_ACUPUNCTURIST]: "Licensed Acupuncturist",
  [PracticeType.DOCTOR_OF_ACUPUNCTURE_AND_ORIENTAL_MEDICINE]:
    "Doctor of Acupuncture and Oriental Medicine",
  [PracticeType.ADVANCED_PRACTICE_REGISTERED_NURSE]:
    "Advanced Practice Registered Nurse",
  [PracticeType.CLINICAL_NURSE_SPECIALIST]: "Clinical Nurse Specialist",
  [PracticeType.NURSE_PRACTITIONER]: "Nurse Practitioner",
  [PracticeType.PHYSICIAN_ASSISTANT]: "Physician Assistant",
  [PracticeType.REGISTERED_NURSE]: "Registered Nurse",
  [PracticeType.PHARMACIST]: "Pharmacist",
  [PracticeType.DIETITIAN]: "Dietitian",
  [PracticeType.DOCTOR_OF_PODIATRIC_MEDICINE]: "Doctor of Podiatric Medicine",
  [PracticeType.DOCTOR_OF_PHILOSOPHY]: "Doctor of Philosophy",
  [PracticeType.NUTRITIONIST]: "Nutritionist",
  [PracticeType.HEALTH_COACH]: "Health Coach",
  [PracticeType.DENTIST]: "Dentist",
  [PracticeType.OPTOMETRIST]: "Optometrist",
  [PracticeType.OTHER]: "Other",
};

export const mapStatusToText: Record<
  | OrganizationType
  | KitOrderStatus
  | KitOrderShippingStatus
  | LicenseStatus
  | RequisitionFormStatus
  | Role,
  string
> = {
  [OrganizationType.CLINICAL]: "Clinical",
  [OrganizationType.RESEARCH]: "Research",
  [KitOrderStatus.ORDERED]: "Ordered",
  [KitOrderShippingStatus.SHIPPED]: "Shipped",
  [KitOrderStatus.COMPLETED]: "Completed",
  [KitOrderStatus.DRAFT]: "Draft",
  [KitOrderShippingStatus.RECEIVED]: "Received",
  [LicenseStatus.PENDING_APPROVAL || RequisitionFormStatus.PENDING_APPROVAL]:
    "Pending Approval",
  [KitOrderShippingStatus.CANCELED]: "Canceled",
  [Role.PRACTITIONER]: "Practitioner",
  [Role.STAFF]: "Staff",
  [Role.BILLING_MANAGER]: "Billing Manager",
  [Role.ADMIN]: "Admin",
  [Role.RESEARCHER]: "Researcher",
  [Role.DATA_ANALYST]: "Data Analyst",
  [Role.PROJECT_MANAGER]: "Project Manager",
  [LicenseStatus.ACTIVE]: "Active",
  [LicenseStatus.REJECTED]: "Rejected",
  [LicenseStatus.EXPIRED]: "Expired",
  [KitOrderShippingStatus.LABEL_GENERATED]: "Label Generated",
  [KitOrderShippingStatus.IN_TRANSIT]: "In Transit",
  [KitOrderShippingStatus.DELIVERED]: "Delivered",
  [RequisitionFormStatus.APPROVED]: "Approved",
  [RequisitionFormStatus.DENIED]: "Rejected",
};

export const StatesInAmerica = [
  { label: "Select a state", value: "Select a state" },
  {
    label: "AL",
    value: "Alabama",
  },
  {
    label: "AK",
    value: "Alaska",
  },
  {
    label: "AZ",
    value: "Arizona",
  },
  {
    label: "AR",
    value: "Arkansas",
  },
  {
    label: "CA",
    value: "California",
  },
  {
    label: "CO",
    value: "Colorado",
  },
  {
    label: "CT",
    value: "Connecticut",
  },
  {
    label: "DE",
    value: "Delaware",
  },
  {
    label: "DC",
    value: "District Of Columbia",
  },
  {
    label: "FL",
    value: "Florida",
  },
  {
    label: "GA",
    value: "Georgia",
  },
  {
    label: "HI",
    value: "Hawaii",
  },
  {
    label: "ID",
    value: "Idaho",
  },
  {
    label: "IL",
    value: "Illinois",
  },
  {
    label: "IN",
    value: "Indiana",
  },
  {
    label: "IA",
    value: "Iowa",
  },
  {
    label: "KS",
    value: "Kansas",
  },
  {
    label: "KY",
    value: "Kentucky",
  },
  {
    label: "LA",
    value: "Louisiana",
  },
  {
    label: "ME",
    value: "Maine",
  },
  {
    label: "MD",
    value: "Maryland",
  },
  {
    label: "MA",
    value: "Massachusetts",
  },
  {
    label: "MI",
    value: "Michigan",
  },
  {
    label: "MN",
    value: "Minnesota",
  },
  {
    label: "MS",
    value: "Mississippi",
  },
  {
    label: "MO",
    value: "Missouri",
  },
  {
    label: "MT",
    value: "Montana",
  },
  {
    label: "NE",
    value: "Nebraska",
  },
  {
    label: "NV",
    value: "Nevada",
  },
  {
    label: "NH",
    value: "New Hampshire",
  },
  {
    label: "NJ",
    value: "New Jersey",
  },
  {
    label: "NM",
    value: "New Mexico",
  },
  {
    label: "NY",
    value: "New York",
  },
  {
    label: "NC",
    value: "North Carolina",
  },
  {
    label: "ND",
    value: "North Dakota",
  },
  {
    label: "OH",
    value: "Ohio",
  },
  {
    label: "OK",
    value: "Oklahoma",
  },
  {
    label: "OR",
    value: "Oregon",
  },
  {
    label: "PA",
    value: "Pennsylvania",
  },
  {
    label: "RI",
    value: "Rhode Island",
  },
  {
    label: "SC",
    value: "South Carolina",
  },
  {
    label: "SD",
    value: "South Dakota",
  },
  {
    label: "TN",
    value: "Tennessee",
  },
  {
    label: "TX",
    value: "Texas",
  },
  {
    label: "UT",
    value: "Utah",
  },
  {
    label: "VT",
    value: "Vermont",
  },
  {
    label: "VA",
    value: "Virginia",
  },
  {
    label: "WA",
    value: "Washington",
  },
  {
    label: "WV",
    value: "West Virginia",
  },
  {
    label: "WI",
    value: "Wisconsin",
  },
  {
    label: "WY",
    value: "Wyoming",
  },
];
