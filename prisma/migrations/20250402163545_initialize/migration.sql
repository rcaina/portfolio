-- CreateEnum
CREATE TYPE "OrganizationType" AS ENUM ('RESEARCH', 'CLINICAL');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('BILLING_MANAGER', 'PRACTITIONER', 'STAFF', 'ADMIN', 'RESEARCHER', 'DATA_ANALYST', 'PROJECT_MANAGER');

-- CreateEnum
CREATE TYPE "PracticeType" AS ENUM ('MEDICAL_DOCTOR', 'DOCTOR_OF_OSTEOPATHIC_MEDICINE', 'NATUROPATHIC_DOCTOR', 'DOCTOR_OF_CHIROPRACTIC', 'LICENSED_ACUPUNCTURIST', 'DOCTOR_OF_ACUPUNCTURE_AND_ORIENTAL_MEDICINE', 'ADVANCED_PRACTICE_REGISTERED_NURSE', 'CLINICAL_NURSE_SPECIALIST', 'NURSE_PRACTITIONER', 'PHYSICIAN_ASSISTANT', 'REGISTERED_NURSE', 'PHARMACIST', 'DIETITIAN', 'DOCTOR_OF_PODIATRIC_MEDICINE', 'DOCTOR_OF_PHILOSOPHY', 'NUTRITIONIST', 'HEALTH_COACH', 'DENTIST', 'OPTOMETRIST', 'OTHER');

-- CreateEnum
CREATE TYPE "ProcessStatus" AS ENUM ('DRAFT', 'ASSIGNED', 'PROCESSING', 'COMPLETED', 'CANCELED', 'PENDING_APPROVAL');

-- CreateEnum
CREATE TYPE "RequisitionFormStatus" AS ENUM ('PENDING_APPROVAL', 'DENIED', 'APPROVED');

-- CreateEnum
CREATE TYPE "KitOrderStatus" AS ENUM ('DRAFT', 'ORDERED', 'COMPLETED', 'CANCELED');

-- CreateEnum
CREATE TYPE "KitOrderShippingStatus" AS ENUM ('LABEL_GENERATED', 'SHIPPED', 'RECEIVED', 'IN_TRANSIT', 'DELIVERED', 'CANCELED');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('PAYMENT_FAILED', 'CANCELED', 'VOID', 'AWAITING_BILLING', 'BILLED', 'PARTIALLY_FAILED', 'PARTIALLY_PAID', 'PAID_IN_FULL');

-- CreateEnum
CREATE TYPE "LicenseStatus" AS ENUM ('ACTIVE', 'PENDING_APPROVAL', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ChargeType" AS ENUM ('DISCOUNT', 'TAX', 'SHIPPING', 'HANDLING', 'SERVICE');

-- CreateEnum
CREATE TYPE "TissueType" AS ENUM ('WHOLE_BLOOD', 'PLASMA');

-- CreateEnum
CREATE TYPE "SexType" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('EMAIL_SENT', 'LICENSE_APPROVED', 'LICENSE_DENIED', 'LICENSE_EXPIRED');

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "stripeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "OrganizationType" NOT NULL DEFAULT 'CLINICAL',
    "billingEmails" TEXT[],
    "deactivated" BOOLEAN NOT NULL DEFAULT false,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "medicalRecordNumber" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "sex" "SexType" NOT NULL,
    "image" TEXT,
    "stripeId" TEXT,
    "practitionerId" TEXT,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "organizationId" TEXT NOT NULL,
    "addressId" TEXT,
    "billingAddressId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "emailVerified" TIMESTAMP(3),
    "password" TEXT,
    "reportsToId" TEXT,
    "practiceType" "PracticeType",
    "nationalProviderId" TEXT,
    "image" TEXT,
    "governmentIdS3Key" TEXT,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "accountOwner" BOOLEAN NOT NULL DEFAULT false,
    "employeeId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "License" (
    "id" TEXT NOT NULL,
    "status" "LicenseStatus" NOT NULL DEFAULT 'PENDING_APPROVAL',
    "number" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "expirationDate" TIMESTAMP(3) NOT NULL,
    "practitionerId" TEXT NOT NULL,
    "medicalLicenseS3Key" TEXT,
    "verificationEventId" TEXT,
    "expiredEventId" TEXT,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "License_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "passwordResetToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiration" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resetAt" TIMESTAMP(3),
    "employeeId" TEXT NOT NULL,

    CONSTRAINT "passwordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "default" BOOLEAN NOT NULL DEFAULT false,
    "isBilling" BOOLEAN NOT NULL DEFAULT false,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KitOrder" (
    "id" TEXT NOT NULL,
    "status" "KitOrderStatus" NOT NULL DEFAULT 'ORDERED',
    "shippingStatus" "KitOrderShippingStatus" NOT NULL DEFAULT 'LABEL_GENERATED',
    "quantity" INTEGER NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "organizationId" TEXT NOT NULL,
    "shipToId" TEXT NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KitOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "invoiceNumber" TEXT,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'AWAITING_BILLING',
    "amount" DOUBLE PRECISION NOT NULL,
    "stripeUrl" TEXT,
    "paymentLink" TEXT,
    "kitOrderId" TEXT,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "dueAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "leadName" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "organizationId" TEXT NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "labOrderId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "submittedToLab" BOOLEAN NOT NULL DEFAULT false,
    "invoiceId" TEXT,
    "organizationId" TEXT NOT NULL,
    "reqFormStatus" "RequisitionFormStatus" NOT NULL DEFAULT 'PENDING_APPROVAL',
    "reqFormS3Key" TEXT,
    "shipToId" TEXT,
    "price" DOUBLE PRECISION,
    "total" DOUBLE PRECISION,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceRequest" (
    "id" TEXT NOT NULL,
    "serviceTypeId" TEXT NOT NULL,
    "price" DOUBLE PRECISION,
    "patientId" TEXT,
    "practitionerId" TEXT,
    "orderId" TEXT,
    "projectId" TEXT,
    "s3FileId" TEXT,
    "questionnaire" JSONB,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectServicePricing" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "serviceTypeId" TEXT NOT NULL,
    "finalPrice" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectServicePricing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "current" BOOLEAN NOT NULL DEFAULT true,
    "labTestId" TEXT NOT NULL,
    "image" TEXT,
    "questionnaireIds" TEXT[],
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Specimen" (
    "id" TEXT NOT NULL,
    "kitId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "tissueType" "TissueType",
    "volume" DOUBLE PRECISION,
    "resultS3Key" TEXT,
    "serviceRequestId" TEXT NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Specimen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceAdjustment" (
    "id" TEXT NOT NULL,
    "type" "ChargeType" NOT NULL,
    "description" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "orderId" TEXT,
    "kitOrderId" TEXT,
    "projectServicePricingId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PriceAdjustment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "S3File" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "s3Key" TEXT NOT NULL,
    "practitionerId" TEXT,
    "projectId" TEXT,
    "orderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "S3File_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "body" TEXT NOT NULL,
    "orderId" TEXT,
    "serviceRequestId" TEXT,
    "projectId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "type" "EventType" NOT NULL,
    "event" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "licenseId" TEXT,
    "licenseExpirationId" TEXT,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "userId" TEXT,
    "retoolUserEmail" TEXT,
    "originalEvent" JSONB,
    "eventChanges" JSONB NOT NULL,
    "duration" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_organizationAddress" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_organizationBillingAddress" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_stripeId_key" ON "Organization"("stripeId");

-- CreateIndex
CREATE INDEX "Organization_name_idx" ON "Organization"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_medicalRecordNumber_key" ON "Patient"("medicalRecordNumber");

-- CreateIndex
CREATE INDEX "Patient_fullName_idx" ON "Patient"("fullName");

-- CreateIndex
CREATE INDEX "Patient_email_idx" ON "Patient"("email");

-- CreateIndex
CREATE INDEX "Patient_firstName_idx" ON "Patient"("firstName");

-- CreateIndex
CREATE INDEX "Patient_lastName_idx" ON "Patient"("lastName");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_email_key" ON "Employee"("email");

-- CreateIndex
CREATE INDEX "Employee_email_idx" ON "Employee"("email");

-- CreateIndex
CREATE INDEX "Employee_fullName_idx" ON "Employee"("fullName");

-- CreateIndex
CREATE INDEX "Employee_firstName_idx" ON "Employee"("firstName");

-- CreateIndex
CREATE INDEX "Employee_lastName_idx" ON "Employee"("lastName");

-- CreateIndex
CREATE INDEX "Employee_practiceType_idx" ON "Employee"("practiceType");

-- CreateIndex
CREATE INDEX "Employee_nationalProviderId_idx" ON "Employee"("nationalProviderId");

-- CreateIndex
CREATE INDEX "Employee_deleted_idx" ON "Employee"("deleted");

-- CreateIndex
CREATE INDEX "Account_role_idx" ON "Account"("role");

-- CreateIndex
CREATE INDEX "Account_accountOwner_idx" ON "Account"("accountOwner");

-- CreateIndex
CREATE UNIQUE INDEX "Account_employeeId_organizationId_key" ON "Account"("employeeId", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "License_verificationEventId_key" ON "License"("verificationEventId");

-- CreateIndex
CREATE UNIQUE INDEX "License_expiredEventId_key" ON "License"("expiredEventId");

-- CreateIndex
CREATE INDEX "License_number_idx" ON "License"("number");

-- CreateIndex
CREATE INDEX "License_state_idx" ON "License"("state");

-- CreateIndex
CREATE INDEX "License_effectiveDate_idx" ON "License"("effectiveDate");

-- CreateIndex
CREATE INDEX "License_expirationDate_idx" ON "License"("expirationDate");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "passwordResetToken_token_key" ON "passwordResetToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "passwordResetToken_id_token_key" ON "passwordResetToken"("id", "token");

-- CreateIndex
CREATE INDEX "Address_label_idx" ON "Address"("label");

-- CreateIndex
CREATE INDEX "Address_default_idx" ON "Address"("default");

-- CreateIndex
CREATE INDEX "KitOrder_status_idx" ON "KitOrder"("status");

-- CreateIndex
CREATE INDEX "KitOrder_quantity_idx" ON "KitOrder"("quantity");

-- CreateIndex
CREATE INDEX "KitOrder_subtotal_idx" ON "KitOrder"("subtotal");

-- CreateIndex
CREATE INDEX "KitOrder_total_idx" ON "KitOrder"("total");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_kitOrderId_key" ON "Invoice"("kitOrderId");

-- CreateIndex
CREATE INDEX "Invoice_invoiceNumber_idx" ON "Invoice"("invoiceNumber");

-- CreateIndex
CREATE INDEX "Invoice_status_idx" ON "Invoice"("status");

-- CreateIndex
CREATE INDEX "Invoice_amount_idx" ON "Invoice"("amount");

-- CreateIndex
CREATE INDEX "Invoice_deleted_idx" ON "Invoice"("deleted");

-- CreateIndex
CREATE INDEX "Project_name_idx" ON "Project"("name");

-- CreateIndex
CREATE INDEX "Project_organizationId_idx" ON "Project"("organizationId");

-- CreateIndex
CREATE INDEX "Project_leadName_idx" ON "Project"("leadName");

-- CreateIndex
CREATE INDEX "Project_deleted_idx" ON "Project"("deleted");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderId_key" ON "Order"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_reqFormS3Key_key" ON "Order"("reqFormS3Key");

-- CreateIndex
CREATE INDEX "Order_organizationId_idx" ON "Order"("organizationId");

-- CreateIndex
CREATE INDEX "Order_orderId_idx" ON "Order"("orderId");

-- CreateIndex
CREATE INDEX "Order_labOrderId_idx" ON "Order"("labOrderId");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Order_submittedToLab_idx" ON "Order"("submittedToLab");

-- CreateIndex
CREATE INDEX "Order_reqFormStatus_idx" ON "Order"("reqFormStatus");

-- CreateIndex
CREATE INDEX "Order_price_idx" ON "Order"("price");

-- CreateIndex
CREATE INDEX "Order_total_idx" ON "Order"("total");

-- CreateIndex
CREATE INDEX "Order_deleted_idx" ON "Order"("deleted");

-- CreateIndex
CREATE INDEX "ServiceRequest_price_idx" ON "ServiceRequest"("price");

-- CreateIndex
CREATE INDEX "ServiceRequest_patientId_idx" ON "ServiceRequest"("patientId");

-- CreateIndex
CREATE INDEX "ServiceRequest_practitionerId_idx" ON "ServiceRequest"("practitionerId");

-- CreateIndex
CREATE INDEX "ServiceRequest_projectId_idx" ON "ServiceRequest"("projectId");

-- CreateIndex
CREATE INDEX "ServiceRequest_serviceTypeId_idx" ON "ServiceRequest"("serviceTypeId");

-- CreateIndex
CREATE INDEX "ServiceRequest_s3FileId_idx" ON "ServiceRequest"("s3FileId");

-- CreateIndex
CREATE INDEX "ServiceRequest_orderId_idx" ON "ServiceRequest"("orderId");

-- CreateIndex
CREATE INDEX "ServiceRequest_deleted_idx" ON "ServiceRequest"("deleted");

-- CreateIndex
CREATE INDEX "ProjectServicePricing_finalPrice_idx" ON "ProjectServicePricing"("finalPrice");

-- CreateIndex
CREATE INDEX "ProjectServicePricing_projectId_idx" ON "ProjectServicePricing"("projectId");

-- CreateIndex
CREATE INDEX "ProjectServicePricing_serviceTypeId_idx" ON "ProjectServicePricing"("serviceTypeId");

-- CreateIndex
CREATE INDEX "ProjectServicePricing_projectId_serviceTypeId_idx" ON "ProjectServicePricing"("projectId", "serviceTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceType_labTestId_key" ON "ServiceType"("labTestId");

-- CreateIndex
CREATE INDEX "ServiceType_name_idx" ON "ServiceType"("name");

-- CreateIndex
CREATE INDEX "ServiceType_price_idx" ON "ServiceType"("price");

-- CreateIndex
CREATE INDEX "ServiceType_current_idx" ON "ServiceType"("current");

-- CreateIndex
CREATE INDEX "ServiceType_labTestId_idx" ON "ServiceType"("labTestId");

-- CreateIndex
CREATE INDEX "ServiceType_deleted_idx" ON "ServiceType"("deleted");

-- CreateIndex
CREATE UNIQUE INDEX "Specimen_kitId_key" ON "Specimen"("kitId");

-- CreateIndex
CREATE UNIQUE INDEX "Specimen_serviceRequestId_key" ON "Specimen"("serviceRequestId");

-- CreateIndex
CREATE INDEX "Specimen_kitId_idx" ON "Specimen"("kitId");

-- CreateIndex
CREATE INDEX "Specimen_status_idx" ON "Specimen"("status");

-- CreateIndex
CREATE INDEX "Specimen_tissueType_idx" ON "Specimen"("tissueType");

-- CreateIndex
CREATE INDEX "Specimen_deleted_idx" ON "Specimen"("deleted");

-- CreateIndex
CREATE INDEX "PriceAdjustment_type_idx" ON "PriceAdjustment"("type");

-- CreateIndex
CREATE INDEX "PriceAdjustment_amount_idx" ON "PriceAdjustment"("amount");

-- CreateIndex
CREATE UNIQUE INDEX "S3File_s3Key_key" ON "S3File"("s3Key");

-- CreateIndex
CREATE INDEX "S3File_fileName_idx" ON "S3File"("fileName");

-- CreateIndex
CREATE INDEX "S3File_s3Key_idx" ON "S3File"("s3Key");

-- CreateIndex
CREATE UNIQUE INDEX "_organizationAddress_AB_unique" ON "_organizationAddress"("A", "B");

-- CreateIndex
CREATE INDEX "_organizationAddress_B_index" ON "_organizationAddress"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_organizationBillingAddress_AB_unique" ON "_organizationBillingAddress"("A", "B");

-- CreateIndex
CREATE INDEX "_organizationBillingAddress_B_index" ON "_organizationBillingAddress"("B");

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_practitionerId_fkey" FOREIGN KEY ("practitionerId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_billingAddressId_fkey" FOREIGN KEY ("billingAddressId") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_reportsToId_fkey" FOREIGN KEY ("reportsToId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "License" ADD CONSTRAINT "License_practitionerId_fkey" FOREIGN KEY ("practitionerId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "License" ADD CONSTRAINT "License_verificationEventId_fkey" FOREIGN KEY ("verificationEventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "License" ADD CONSTRAINT "License_expiredEventId_fkey" FOREIGN KEY ("expiredEventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passwordResetToken" ADD CONSTRAINT "passwordResetToken_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KitOrder" ADD CONSTRAINT "KitOrder_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KitOrder" ADD CONSTRAINT "KitOrder_shipToId_fkey" FOREIGN KEY ("shipToId") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_kitOrderId_fkey" FOREIGN KEY ("kitOrderId") REFERENCES "KitOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_reqFormS3Key_fkey" FOREIGN KEY ("reqFormS3Key") REFERENCES "S3File"("s3Key") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_shipToId_fkey" FOREIGN KEY ("shipToId") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_serviceTypeId_fkey" FOREIGN KEY ("serviceTypeId") REFERENCES "ServiceType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_practitionerId_fkey" FOREIGN KEY ("practitionerId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_s3FileId_fkey" FOREIGN KEY ("s3FileId") REFERENCES "S3File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectServicePricing" ADD CONSTRAINT "ProjectServicePricing_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectServicePricing" ADD CONSTRAINT "ProjectServicePricing_serviceTypeId_fkey" FOREIGN KEY ("serviceTypeId") REFERENCES "ServiceType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Specimen" ADD CONSTRAINT "Specimen_resultS3Key_fkey" FOREIGN KEY ("resultS3Key") REFERENCES "S3File"("s3Key") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Specimen" ADD CONSTRAINT "Specimen_serviceRequestId_fkey" FOREIGN KEY ("serviceRequestId") REFERENCES "ServiceRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceAdjustment" ADD CONSTRAINT "PriceAdjustment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceAdjustment" ADD CONSTRAINT "PriceAdjustment_kitOrderId_fkey" FOREIGN KEY ("kitOrderId") REFERENCES "KitOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceAdjustment" ADD CONSTRAINT "PriceAdjustment_projectServicePricingId_fkey" FOREIGN KEY ("projectServicePricingId") REFERENCES "ProjectServicePricing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "S3File" ADD CONSTRAINT "S3File_practitionerId_fkey" FOREIGN KEY ("practitionerId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "S3File" ADD CONSTRAINT "S3File_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_serviceRequestId_fkey" FOREIGN KEY ("serviceRequestId") REFERENCES "ServiceRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_organizationAddress" ADD CONSTRAINT "_organizationAddress_A_fkey" FOREIGN KEY ("A") REFERENCES "Address"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_organizationAddress" ADD CONSTRAINT "_organizationAddress_B_fkey" FOREIGN KEY ("B") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_organizationBillingAddress" ADD CONSTRAINT "_organizationBillingAddress_A_fkey" FOREIGN KEY ("A") REFERENCES "Address"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_organizationBillingAddress" ADD CONSTRAINT "_organizationBillingAddress_B_fkey" FOREIGN KEY ("B") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
