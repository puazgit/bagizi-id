-- CreateEnum
CREATE TYPE "SppgStatus" AS ENUM ('PENDING_APPROVAL', 'ACTIVE', 'SUSPENDED', 'TERMINATED', 'INACTIVE');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIAL', 'ACTIVE', 'OVERDUE', 'CANCELLED', 'PAUSED', 'UPGRADE_PENDING');

-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('BASIC', 'STANDARD', 'PRO', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "OrganizationType" AS ENUM ('PEMERINTAH', 'SWASTA', 'YAYASAN', 'KOMUNITAS', 'LAINNYA');

-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('SUPERADMIN', 'SPPG_ADMIN', 'SPPG_USER', 'DEMO_REQUEST', 'PROSPECT');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "SubscriptionChangeType" AS ENUM ('UPGRADE', 'DOWNGRADE', 'RENEWAL', 'CANCELLATION', 'REACTIVATION', 'PAUSE', 'RESUME');

-- CreateEnum
CREATE TYPE "BillingFrequency" AS ENUM ('MONTHLY', 'QUARTERLY', 'YEARLY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "PaymentMethodType" AS ENUM ('CREDIT_CARD', 'BANK_TRANSFER', 'E_WALLET', 'MANUAL', 'CRYPTO');

-- CreateEnum
CREATE TYPE "DashboardStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED', 'DISABLED');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "DunningStage" AS ENUM ('FIRST_REMINDER', 'SECOND_REMINDER', 'FINAL_NOTICE', 'SUSPENSION_WARNING', 'SUSPENDED', 'TERMINATION');

-- CreateEnum
CREATE TYPE "IndonesiaRegion" AS ENUM ('SUMATERA', 'JAWA', 'KALIMANTAN', 'SULAWESI', 'PAPUA', 'BALI_NUSRA', 'MALUKU');

-- CreateEnum
CREATE TYPE "Timezone" AS ENUM ('WIB', 'WITA', 'WIT');

-- CreateEnum
CREATE TYPE "RegencyType" AS ENUM ('REGENCY', 'CITY');

-- CreateEnum
CREATE TYPE "VillageType" AS ENUM ('URBAN_VILLAGE', 'RURAL_VILLAGE');

-- CreateEnum
CREATE TYPE "UsageResourceType" AS ENUM ('RECIPIENTS', 'STAFF', 'DISTRIBUTION_POINTS', 'API_CALLS', 'STORAGE_GB', 'REPORTS_GENERATED', 'MENUS_CREATED');

-- CreateEnum
CREATE TYPE "TrialNotificationType" AS ENUM ('WELCOME', 'DAY_7_REMINDER', 'DAY_3_REMINDER', 'DAY_1_REMINDER', 'EXPIRED', 'EXTENSION_GRANTED');

-- CreateEnum
CREATE TYPE "BillingCycleStatus" AS ENUM ('PENDING', 'INVOICED', 'PAID', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SupportTicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'WAITING_FOR_CUSTOMER', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "SupportTicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "SupportTicketCategory" AS ENUM ('TECHNICAL', 'BILLING', 'FEATURE_REQUEST', 'BUG_REPORT', 'GENERAL');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('EMAIL', 'IN_APP', 'SMS', 'PUSH');

-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT', 'IMPORT', 'NOTIFICATION_SEND', 'NOTIFICATION_TEMPLATE_CREATE', 'BULK_NOTIFICATION_PROCESS', 'NOTIFICATION_PREFERENCES_UPDATE');

-- CreateEnum
CREATE TYPE "DemoRequestStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'DEMO_ACTIVE', 'EXPIRED', 'CONVERTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DemoType" AS ENUM ('STANDARD', 'EXTENDED', 'GUIDED', 'SELF_SERVICE');

-- CreateEnum
CREATE TYPE "ProgramType" AS ENUM ('NUTRITIONAL_RECOVERY', 'NUTRITIONAL_EDUCATION', 'SUPPLEMENTARY_FEEDING', 'EMERGENCY_NUTRITION', 'STUNTING_INTERVENTION');

-- CreateEnum
CREATE TYPE "TargetGroup" AS ENUM ('TODDLER', 'PREGNANT_WOMAN', 'BREASTFEEDING_MOTHER', 'TEENAGE_GIRL', 'ELDERLY', 'SCHOOL_CHILDREN');

-- CreateEnum
CREATE TYPE "MealType" AS ENUM ('SARAPAN', 'MAKAN_SIANG', 'SNACK_PAGI', 'SNACK_SORE', 'MAKAN_MALAM');

-- CreateEnum
CREATE TYPE "NutritionStatus" AS ENUM ('WELL_NOURISHED', 'UNDERNOURISHED', 'SEVERELY_UNDERNOURISHED', 'OVER_NOURISHED', 'OBESE');

-- CreateEnum
CREATE TYPE "ProductionStatus" AS ENUM ('PLANNED', 'PREPARING', 'COOKING', 'QUALITY_CHECK', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DistributionStatus" AS ENUM ('SCHEDULED', 'PREPARING', 'IN_TRANSIT', 'DISTRIBUTING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('SCHEDULED', 'DELIVERED', 'FAILED', 'RETURNED', 'PARTIAL');

-- CreateEnum
CREATE TYPE "ProcurementStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'ORDERED', 'PARTIALLY_RECEIVED', 'FULLY_RECEIVED', 'COMPLETED', 'CANCELLED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ProcurementMethod" AS ENUM ('DIRECT', 'TENDER', 'CONTRACT', 'EMERGENCY', 'BULK');

-- CreateEnum
CREATE TYPE "SupplierType" AS ENUM ('LOCAL', 'REGIONAL', 'NATIONAL', 'INTERNATIONAL', 'COOPERATIVE', 'INDIVIDUAL');

-- CreateEnum
CREATE TYPE "QualityGrade" AS ENUM ('EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'REJECTED');

-- CreateEnum
CREATE TYPE "BeneficiaryType" AS ENUM ('CHILD', 'PREGNANT_MOTHER', 'LACTATING_MOTHER', 'ELDERLY', 'DISABILITY');

-- CreateEnum
CREATE TYPE "FeedbackType" AS ENUM ('COMPLAINT', 'SUGGESTION', 'COMPLIMENT', 'INQUIRY', 'INCIDENT_REPORT', 'QUALITY_ISSUE', 'SERVICE_ISSUE', 'SERVICE_REQUEST', 'PORTION_ISSUE', 'NUTRITION_CONCERN', 'FEATURE_REQUEST', 'BUG_REPORT', 'COMPLIANCE_CONCERN');

-- CreateEnum
CREATE TYPE "FeedbackStatus" AS ENUM ('PENDING', 'IN_REVIEW', 'RESPONDED', 'RESOLVED', 'CLOSED', 'ESCALATED');

-- CreateEnum
CREATE TYPE "FeedbackPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "StakeholderType" AS ENUM ('STUDENT', 'PARENT_GUARDIAN', 'TEACHER', 'SCHOOL_PRINCIPAL', 'COMMUNITY_LEADER', 'FOOD_SUPPLIER', 'LOGISTICS_PARTNER', 'KITCHEN_STAFF', 'DISTRIBUTION_STAFF', 'QC_STAFF', 'NUTRITIONIST', 'PROGRAM_MANAGER', 'SPPG_HEAD', 'CUSTOMER_SUCCESS', 'TECHNICAL_SUPPORT');

-- CreateEnum
CREATE TYPE "StakeholderGroup" AS ENUM ('BENEFICIARIES', 'FAMILIES', 'EDUCATION_PARTNERS', 'SUPPLIERS', 'OPERATIONAL_STAFF', 'MANAGEMENT', 'PLATFORM_TEAM');

-- CreateEnum
CREATE TYPE "FeedbackCategory" AS ENUM ('FOOD_QUALITY', 'FOOD_SAFETY', 'NUTRITION_COMPLIANCE', 'SERVICE_DELIVERY', 'STAFF_PERFORMANCE', 'LOGISTICS_EFFICIENCY', 'PROGRAM_EFFECTIVENESS', 'TECHNOLOGY_ISSUES', 'BILLING_INQUIRY', 'POLICY_FEEDBACK');

-- CreateEnum
CREATE TYPE "ResponseType" AS ENUM ('INTERNAL_NOTE', 'PUBLIC_RESPONSE', 'ESCALATION', 'AUTO_GENERATED', 'TEMPLATE_BASED', 'PERSONALIZED');

-- CreateEnum
CREATE TYPE "ResponseStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'SENT', 'DELIVERED', 'READ', 'ACKNOWLEDGED', 'REJECTED');

-- CreateEnum
CREATE TYPE "EscalationType" AS ENUM ('TIME_BASED', 'COMPLEXITY_BASED', 'VIP_STAKEHOLDER', 'COMPLIANCE_ISSUE', 'REPUTATION_RISK', 'MANUAL_OVERRIDE');

-- CreateEnum
CREATE TYPE "EscalationStatus" AS ENUM ('ACTIVE', 'RESOLVED', 'CANCELLED', 'TRANSFERRED');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('STATUS_CHANGE', 'ASSIGNMENT_CHANGE', 'RESPONSE_ADDED', 'ESCALATION_CREATED', 'PRIORITY_CHANGE', 'DEADLINE_UPDATED', 'NOTE_ADDED', 'ATTACHMENT_ADDED', 'REVIEW_COMPLETED', 'APPROVAL_GRANTED', 'CLOSURE_INITIATED');

-- CreateEnum
CREATE TYPE "AnalyticsPeriod" AS ENUM ('HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "DistributionMethod" AS ENUM ('DIRECT', 'PICKUP', 'DELIVERY', 'MOBILE_UNIT');

-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('USER', 'SPPG', 'SUBSCRIPTION', 'PAYMENT', 'MENU_PLAN', 'PRODUCTION', 'DISTRIBUTION', 'PROCUREMENT', 'BENEFICIARY', 'FEEDBACK', 'SUPPLIER', 'INVENTORY', 'RECIPE', 'DOCUMENT', 'NOTIFICATION', 'AUDIT_LOG');

-- CreateEnum
CREATE TYPE "PreparationMethod" AS ENUM ('STEAM', 'BOIL', 'FRY', 'SAUTE', 'GRILL', 'BAKE', 'RAW', 'BLEND', 'STIR_FRY', 'ROAST');

-- CreateEnum
CREATE TYPE "ComplianceStandard" AS ENUM ('HACCP', 'ISO_22000', 'HALAL_MUI', 'SNI', 'CODEX', 'BPOM', 'LOCAL_REGULATION');

-- CreateEnum
CREATE TYPE "QualityStatus" AS ENUM ('PASSED', 'FAILED', 'CONDITIONAL', 'RETESTING');

-- CreateEnum
CREATE TYPE "InspectionType" AS ENUM ('INCOMING', 'IN_PROCESS', 'FINAL', 'RANDOM', 'COMPLAINT');

-- CreateEnum
CREATE TYPE "InventoryCategory" AS ENUM ('PROTEIN', 'KARBOHIDRAT', 'SAYURAN', 'BUAH', 'SUSU_OLAHAN', 'BUMBU_REMPAH', 'MINYAK_LEMAK', 'LAINNYA');

-- CreateEnum
CREATE TYPE "MovementType" AS ENUM ('IN', 'OUT', 'ADJUSTMENT', 'EXPIRED', 'DAMAGED', 'TRANSFER');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('PERMANENT', 'CONTRACT', 'TEMPORARY', 'INTERN', 'FREELANCE');

-- CreateEnum
CREATE TYPE "EmploymentStatus" AS ENUM ('ACTIVE', 'PROBATION', 'SUSPENDED', 'TERMINATED', 'RESIGNED', 'RETIRED');

-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "AgeGroup" AS ENUM ('BALITA_6_23', 'BALITA_2_5', 'ANAK_6_12', 'REMAJA_13_18', 'DEWASA_19_59', 'LANSIA_60_PLUS');

-- CreateEnum
CREATE TYPE "ActivityLevel" AS ENUM ('SEDENTARY', 'LIGHT', 'MODERATE', 'ACTIVE', 'VERY_ACTIVE');

-- CreateEnum
CREATE TYPE "MenuPlanStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'REVIEWED', 'PENDING_APPROVAL', 'APPROVED', 'PUBLISHED', 'ACTIVE', 'COMPLETED', 'ARCHIVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('PLANNED', 'CONFIRMED', 'IN_PRODUCTION', 'PRODUCED', 'DISTRIBUTED', 'COMPLETED', 'CANCELLED', 'SUBSTITUTED');

-- CreateEnum
CREATE TYPE "LeaveType" AS ENUM ('ANNUAL', 'SICK', 'EMERGENCY', 'MATERNITY', 'PATERNITY', 'UNPAID', 'STUDY', 'PILGRIMAGE');

-- CreateEnum
CREATE TYPE "LeaveStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'LATE', 'ABSENT', 'HALF_DAY', 'OVERTIME', 'SICK_LEAVE', 'ANNUAL_LEAVE');

-- CreateEnum
CREATE TYPE "PayrollStatus" AS ENUM ('DRAFT', 'CALCULATED', 'APPROVED', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ReviewType" AS ENUM ('PROBATION', 'QUARTERLY', 'ANNUAL', 'SPECIAL', 'EXIT');

-- CreateEnum
CREATE TYPE "EmployeeLevel" AS ENUM ('STAFF', 'SUPERVISOR', 'MANAGER', 'SENIOR_MANAGER', 'DIRECTOR', 'EXECUTIVE');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('ID_CARD', 'PASSPORT', 'DRIVER_LICENSE', 'CERTIFICATE', 'DIPLOMA', 'RESUME', 'CONTRACT', 'MEDICAL_CHECKUP', 'OTHER');

-- CreateEnum
CREATE TYPE "TrainingStatus" AS ENUM ('PLANNED', 'ONGOING', 'COMPLETED', 'CANCELLED', 'POSTPONED');

-- CreateEnum
CREATE TYPE "DistributionWave" AS ENUM ('MORNING', 'MIDDAY');

-- CreateEnum
CREATE TYPE "BanperRequestStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'REVIEWED', 'APPROVED', 'DISBURSED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('DAILY_OPERATIONAL', 'FINANCIAL_BIWEEKLY', 'BENEFICIARY_RECEIPT', 'QUALITY_CONTROL', 'DISTRIBUTION_SUMMARY', 'MONTHLY_EVALUATION');

-- CreateEnum
CREATE TYPE "ReceiptStatus" AS ENUM ('PENDING', 'RECEIVED', 'LOST', 'DISPUTED');

-- CreateEnum
CREATE TYPE "SppgRole" AS ENUM ('KEPALA_SPPG', 'AHLI_GIZI', 'AKUNTAN', 'PENGAWAS_DISTRIBUSI', 'TIM_PERSIAPAN', 'TIM_PENGOLAHAN', 'TIM_PEMORSIAN', 'TIM_PACKING', 'TIM_DISTRIBUSI', 'TIM_KEBERSIHAN', 'TIM_PENCUCI');

-- CreateEnum
CREATE TYPE "BeneficiaryCategory" AS ENUM ('TODDLER', 'EARLY_CHILDHOOD', 'KINDERGARTEN', 'ELEMENTARY_GRADE_1_3', 'ELEMENTARY_GRADE_4_6', 'JUNIOR_HIGH', 'SENIOR_HIGH', 'PREGNANT_WOMAN', 'BREASTFEEDING_MOTHER');

-- CreateEnum
CREATE TYPE "EquipmentCategory" AS ENUM ('GAS_STOVE', 'ELECTRIC_STOVE', 'REFRIGERATOR', 'FREEZER', 'MIXER', 'BLENDER', 'RICE_COOKER', 'PRESSURE_COOKER', 'OVEN', 'STEAMER', 'CUTTING_BOARD', 'KNIVES_SET', 'SCALES', 'GENERATOR', 'WATER_PURIFIER', 'PACKAGING_MACHINE');

-- CreateEnum
CREATE TYPE "EquipmentCondition" AS ENUM ('EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'BROKEN');

-- CreateEnum
CREATE TYPE "EquipmentStatus" AS ENUM ('ACTIVE', 'MAINTENANCE', 'RETIRED', 'ON_LOAN');

-- CreateEnum
CREATE TYPE "MaintenanceType" AS ENUM ('ROUTINE', 'REPAIR', 'EMERGENCY', 'CALIBRATION', 'REPLACEMENT');

-- CreateEnum
CREATE TYPE "WaterQualityStatus" AS ENUM ('EXCELLENT', 'GOOD', 'NEEDS_TREATMENT', 'FAILED');

-- CreateEnum
CREATE TYPE "InternetStatus" AS ENUM ('ACTIVE', 'DOWN', 'SLOW', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "TestType" AS ENUM ('WATER_QUALITY', 'FOOD_SAMPLE', 'NUTRITION_ANALYSIS', 'MICROBIOLOGICAL', 'CHEMICAL_RESIDUE', 'HEAVY_METALS');

-- CreateEnum
CREATE TYPE "TestStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'RETESTING', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CertificationStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'SUSPENDED', 'REVOKED', 'RENEWAL_PENDING');

-- CreateEnum
CREATE TYPE "ResearchType" AS ENUM ('NUTRITION_OPTIMIZATION', 'LOCAL_INGREDIENT', 'COST_EFFICIENCY', 'TASTE_IMPROVEMENT', 'CULTURAL_ADAPTATION');

-- CreateEnum
CREATE TYPE "ResearchStatus" AS ENUM ('PLANNING', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'ON_HOLD');

-- CreateEnum
CREATE TYPE "AnalyticsType" AS ENUM ('COST_ANALYSIS', 'EFFICIENCY_ANALYSIS', 'QUALITY_TRENDS', 'NUTRITION_COMPLIANCE', 'WASTE_ANALYSIS', 'BENEFICIARY_SATISFACTION');

-- CreateEnum
CREATE TYPE "TrendDirection" AS ENUM ('INCREASING', 'DECREASING', 'STABLE', 'VOLATILE');

-- CreateEnum
CREATE TYPE "BenchmarkType" AS ENUM ('REGIONAL', 'NATIONAL', 'SIMILAR_SIZE', 'BEST_PRACTICE');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('PLATFORM_SUPERADMIN', 'PLATFORM_SUPPORT', 'PLATFORM_ANALYST', 'SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_AHLI_GIZI', 'SPPG_AKUNTAN', 'SPPG_PRODUKSI_MANAGER', 'SPPG_DISTRIBUSI_MANAGER', 'SPPG_HRD_MANAGER', 'SPPG_STAFF_DAPUR', 'SPPG_STAFF_DISTRIBUSI', 'SPPG_STAFF_ADMIN', 'SPPG_STAFF_QC', 'SPPG_VIEWER', 'DEMO_USER');

-- CreateEnum
CREATE TYPE "PermissionType" AS ENUM ('READ', 'WRITE', 'DELETE', 'APPROVE', 'USER_MANAGE', 'ROLE_ASSIGN', 'SETTINGS_MANAGE', 'MENU_MANAGE', 'PROCUREMENT_MANAGE', 'PRODUCTION_MANAGE', 'DISTRIBUTION_MANAGE', 'QUALITY_MANAGE', 'FINANCIAL_MANAGE', 'HR_MANAGE', 'REPORTS_VIEW', 'REPORTS_GENERATE', 'ANALYTICS_VIEW', 'ANALYTICS_ADVANCED', 'SYSTEM_CONFIG', 'DATA_EXPORT', 'DATA_IMPORT', 'AUDIT_LOG_VIEW', 'NOTIFICATION_SEND', 'NOTIFICATION_TEMPLATE_MANAGE', 'NOTIFICATION_BULK_PROCESS');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('DRAFT', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'ARCHIVED', 'EXPIRED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "DocumentVisibility" AS ENUM ('PRIVATE', 'INTERNAL', 'PUBLIC', 'CONFIDENTIAL');

-- CreateEnum
CREATE TYPE "VersionChangeType" AS ENUM ('MAJOR', 'MINOR', 'PATCH', 'HOTFIX');

-- CreateEnum
CREATE TYPE "ApprovalType" AS ENUM ('REVIEW', 'APPROVAL', 'SIGNATURE', 'COMPLIANCE', 'LEGAL');

-- CreateEnum
CREATE TYPE "ApprovalPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT', 'CRITICAL');

-- CreateEnum
CREATE TYPE "SignatureType" AS ENUM ('ELECTRONIC', 'DIGITAL', 'BIOMETRIC', 'HANDWRITTEN');

-- CreateEnum
CREATE TYPE "DocumentAction" AS ENUM ('CREATED', 'VIEWED', 'DOWNLOADED', 'UPDATED', 'DELETED', 'SHARED', 'APPROVED', 'REJECTED', 'SIGNED', 'COMMENTED', 'EXPORTED', 'PRINTED');

-- CreateEnum
CREATE TYPE "CommentType" AS ENUM ('GENERAL', 'SUGGESTION', 'ISSUE', 'QUESTION', 'APPROVAL');

-- CreateEnum
CREATE TYPE "ShareType" AS ENUM ('LINK', 'EMAIL', 'DIRECT', 'PUBLIC');

-- CreateEnum
CREATE TYPE "UserDemoStatus" AS ENUM ('REQUESTED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CONVERTED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AccessLevel" AS ENUM ('FULL', 'LIMITED', 'READ_ONLY', 'NO_ACCESS');

-- CreateEnum
CREATE TYPE "ABTestStatus" AS ENUM ('DRAFT', 'RUNNING', 'PAUSED', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ABTestMetric" AS ENUM ('CONVERSION_RATE', 'CLICK_THROUGH_RATE', 'BOUNCE_RATE', 'ENGAGEMENT_TIME', 'FORM_SUBMISSIONS');

-- CreateEnum
CREATE TYPE "TemplateCategory" AS ENUM ('HEALTHCARE', 'BUSINESS', 'EDUCATION', 'GOVERNMENT', 'NONPROFIT', 'ECOMMERCE', 'TECHNOLOGY', 'FINANCE', 'LEGAL', 'REAL_ESTATE');

-- CreateEnum
CREATE TYPE "LandingPageTemplate" AS ENUM ('DEFAULT', 'GOVERNMENT', 'CORPORATE', 'NGO', 'STARTUP');

-- CreateEnum
CREATE TYPE "TargetAudience" AS ENUM ('GENERAL', 'GOVERNMENT', 'CORPORATE', 'NGO', 'HEALTHCARE', 'EDUCATION');

-- CreateEnum
CREATE TYPE "BlogCategory" AS ENUM ('NEWS', 'CASE_STUDY', 'TUTORIAL', 'INDUSTRY', 'REGULATION', 'TECHNOLOGY', 'NUTRITION');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'REVIEW', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CommentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SPAM');

-- CreateEnum
CREATE TYPE "FAQCategory" AS ENUM ('GENERAL', 'PRICING', 'FEATURES', 'TECHNICAL', 'COMPLIANCE', 'INTEGRATION', 'TRAINING');

-- CreateEnum
CREATE TYPE "HelpCategory" AS ENUM ('GETTING_STARTED', 'USER_GUIDE', 'ADMIN_GUIDE', 'INTEGRATION', 'TROUBLESHOOTING', 'BEST_PRACTICES', 'API_DOCUMENTATION');

-- CreateEnum
CREATE TYPE "DifficultyLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');

-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('WEBSITE', 'GOOGLE_ADS', 'FACEBOOK_ADS', 'LINKEDIN_ADS', 'SEARCH_ORGANIC', 'REFERRAL', 'DIRECT', 'EMAIL', 'SOCIAL', 'WEBINAR', 'CONTENT', 'DEMO');

-- CreateEnum
CREATE TYPE "LeadFormType" AS ENUM ('CONTACT_FORM', 'DEMO_REQUEST', 'NEWSLETTER', 'WHITEPAPER', 'PRICING_INQUIRY', 'CONSULTATION', 'TRIAL_REQUEST');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'NURTURING', 'DEMO_SCHEDULED', 'PROPOSAL_SENT', 'NEGOTIATION', 'CONVERTED', 'LOST', 'UNQUALIFIED');

-- CreateEnum
CREATE TYPE "PageType" AS ENUM ('LANDING_PAGE', 'BLOG_POST', 'CASE_STUDY', 'FAQ_PAGE', 'PRICING_PAGE', 'FEATURES_PAGE', 'CONTACT_PAGE', 'ABOUT_PAGE');

-- CreateEnum
CREATE TYPE "CampaignType" AS ENUM ('GOOGLE_ADS', 'FACEBOOK_ADS', 'LINKEDIN_ADS', 'EMAIL_MARKETING', 'CONTENT_MARKETING', 'WEBINAR', 'REFERRAL', 'PARTNERSHIP');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CampaignGoal" AS ENUM ('BRAND_AWARENESS', 'LEAD_GENERATION', 'DEMO_REQUESTS', 'CUSTOMER_ACQUISITION', 'CONTENT_ENGAGEMENT', 'WEBINAR_REGISTRATION');

-- CreateEnum
CREATE TYPE "ConfigValueType" AS ENUM ('STRING', 'INTEGER', 'FLOAT', 'BOOLEAN', 'JSON');

-- CreateEnum
CREATE TYPE "ConfigCategory" AS ENUM ('GENERAL', 'PAYMENT', 'EMAIL', 'NOTIFICATION', 'SECURITY', 'INTEGRATION', 'FEATURE_FLAGS');

-- CreateEnum
CREATE TYPE "ConfigAccessLevel" AS ENUM ('PUBLIC', 'USER', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "Environment" AS ENUM ('DEVELOPMENT', 'STAGING', 'PRODUCTION');

-- CreateEnum
CREATE TYPE "SubscriptionChangeStatus" AS ENUM ('PENDING', 'APPROVED', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'REJECTED');

-- CreateEnum
CREATE TYPE "DunningProcessStatus" AS ENUM ('ACTIVE', 'PAUSED', 'RESOLVED', 'FAILED', 'ESCALATED');

-- CreateEnum
CREATE TYPE "AuditLogCategory" AS ENUM ('SYSTEM', 'USER_ACTION', 'SECURITY', 'BILLING', 'SUBSCRIPTION', 'DATA_CHANGE', 'ADMIN_ACTION');

-- CreateEnum
CREATE TYPE "NotificationTemplateCategory" AS ENUM ('SYSTEM', 'PAYROLL', 'BILLING', 'MARKETING', 'OPERATIONAL', 'SECURITY', 'WELCOME');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'FAILED', 'READ', 'DISMISSED');

-- CreateEnum
CREATE TYPE "NotificationCategory" AS ENUM ('SYSTEM', 'BILLING', 'MARKETING', 'OPERATIONAL', 'SECURITY', 'PERSONAL');

-- CreateEnum
CREATE TYPE "EmailTemplateCategory" AS ENUM ('BILLING', 'MARKETING', 'SUPPORT', 'SYSTEM', 'ONBOARDING', 'NOTIFICATION');

-- CreateEnum
CREATE TYPE "EmailLogStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'FAILED', 'BOUNCED', 'OPENED', 'CLICKED');

-- CreateEnum
CREATE TYPE "NotificationDeliveryStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'FAILED', 'CANCELLED', 'RETRY');

-- CreateEnum
CREATE TYPE "NotificationCampaignStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'RUNNING', 'COMPLETED', 'CANCELLED', 'PAUSED');

-- CreateEnum
CREATE TYPE "NutritionProgramStatus" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED', 'PLANNING');

-- CreateEnum
CREATE TYPE "MenuPlanCategory" AS ENUM ('WEEKLY', 'MONTHLY', 'SEASONAL', 'SPECIAL_EVENT', 'RAMADAN', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "OperationalReportStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'COMPLETED', 'ARCHIVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "TrainingCategory" AS ENUM ('TECHNICAL', 'SOFT_SKILLS', 'SAFETY', 'COMPLIANCE', 'LEADERSHIP', 'NUTRITION', 'FOOD_SAFETY');

-- CreateEnum
CREATE TYPE "DisciplinaryActionStatus" AS ENUM ('OPEN', 'UNDER_INVESTIGATION', 'RESOLVED', 'APPEALED', 'CLOSED', 'ESCALATED');

-- CreateEnum
CREATE TYPE "TransactionCategory" AS ENUM ('FOOD_PROCUREMENT', 'OPERATIONAL', 'TRANSPORT', 'UTILITY', 'STAFF', 'EQUIPMENT', 'MAINTENANCE', 'OTHER');

-- CreateEnum
CREATE TYPE "DistributionScheduleStatus" AS ENUM ('PLANNED', 'PREPARED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'DELAYED');

-- CreateEnum
CREATE TYPE "DistributionDeliveryStatus" AS ENUM ('ASSIGNED', 'DEPARTED', 'DELIVERED', 'FAILED', 'CANCELLED', 'RETURNED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255),
    "name" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "profileImage" VARCHAR(500),
    "passwordSalt" VARCHAR(255),
    "passwordHistory" JSONB,
    "saltRounds" INTEGER DEFAULT 12,
    "phoneHash" VARCHAR(255),
    "encryptedPII" JSONB,
    "encryptionKeyId" VARCHAR(50),
    "userType" "UserType" NOT NULL DEFAULT 'SPPG_USER',
    "userRole" "UserRole",
    "sppgId" TEXT,
    "emailVerified" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" TIMESTAMP(3),
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorSecret" VARCHAR(255),
    "lastPasswordChange" TIMESTAMPTZ,
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMPTZ,
    "sessionToken" VARCHAR(255),
    "lastIpAddress" VARCHAR(45),
    "lastUserAgent" TEXT,
    "securityFlags" JSONB,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "isPhoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "securityLevel" INTEGER NOT NULL DEFAULT 1,
    "riskScore" INTEGER NOT NULL DEFAULT 0,
    "firstName" VARCHAR(100),
    "lastName" VARCHAR(100),
    "jobTitle" VARCHAR(150),
    "department" VARCHAR(100),
    "location" VARCHAR(255),
    "timezone" VARCHAR(50) NOT NULL DEFAULT 'Asia/Jakarta',
    "language" VARCHAR(10) NOT NULL DEFAULT 'id',
    "nationality" VARCHAR(50),
    "residenceCountry" VARCHAR(50),
    "preferredCurrency" VARCHAR(3) NOT NULL DEFAULT 'IDR',
    "alternateEmail" VARCHAR(255),
    "workPhone" VARCHAR(20),
    "personalPhone" VARCHAR(20),
    "emergencyContact" VARCHAR(255),
    "emergencyPhone" VARCHAR(20),
    "emergencyRelationship" VARCHAR(50),
    "address" TEXT,
    "emergencyContactHash" VARCHAR(255),
    "demoStatus" "UserDemoStatus",
    "demoExpiresAt" TIMESTAMP(3),
    "demoStartedAt" TIMESTAMP(3),
    "trialExpiresAt" TIMESTAMP(3),
    "platformAccess" JSONB,
    "lastActiveModule" TEXT,
    "sessionCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sppg" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "addressDetail" VARCHAR(500) NOT NULL,
    "provinceId" VARCHAR(50) NOT NULL,
    "regencyId" VARCHAR(50) NOT NULL,
    "districtId" VARCHAR(50) NOT NULL,
    "villageId" VARCHAR(50) NOT NULL,
    "postalCode" VARCHAR(10),
    "coordinates" VARCHAR(50),
    "timezone" "Timezone" NOT NULL DEFAULT 'WIB',
    "phone" VARCHAR(20) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phoneHash" VARCHAR(255),
    "emailHash" VARCHAR(255),
    "picName" VARCHAR(255) NOT NULL,
    "picPosition" VARCHAR(150) NOT NULL,
    "picEmail" VARCHAR(255) NOT NULL,
    "picPhone" VARCHAR(20) NOT NULL,
    "picWhatsapp" VARCHAR(20),
    "picDataHash" VARCHAR(255),
    "organizationType" "OrganizationType" NOT NULL,
    "establishedYear" INTEGER,
    "targetRecipients" INTEGER NOT NULL,
    "maxRadius" DOUBLE PRECISION NOT NULL,
    "maxTravelTime" INTEGER NOT NULL,
    "operationStartDate" TIMESTAMP(3) NOT NULL,
    "operationEndDate" TIMESTAMP(3),
    "status" "SppgStatus" NOT NULL DEFAULT 'ACTIVE',
    "isDemoAccount" BOOLEAN NOT NULL DEFAULT false,
    "demoExpiresAt" TIMESTAMP(3),
    "demoStartedAt" TIMESTAMP(3),
    "demoParentId" TEXT,
    "demoMaxBeneficiaries" INTEGER,
    "demoAllowedFeatures" TEXT[],
    "monthlyBudget" DOUBLE PRECISION DEFAULT 50000000,
    "yearlyBudget" DOUBLE PRECISION,
    "budgetStartDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "budgetEndDate" TIMESTAMP(3),
    "budgetCurrency" TEXT NOT NULL DEFAULT 'IDR',
    "budgetAllocation" JSONB,
    "budgetAutoReset" BOOLEAN NOT NULL DEFAULT true,
    "budgetAlertThreshold" DOUBLE PRECISION NOT NULL DEFAULT 80,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "sppg_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "sppgId" TEXT NOT NULL,
    "tier" "SubscriptionTier" NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "billingDate" TIMESTAMP(3) NOT NULL,
    "maxRecipients" INTEGER NOT NULL,
    "maxStaff" INTEGER NOT NULL,
    "maxDistributionPoints" INTEGER NOT NULL,
    "storageGb" INTEGER NOT NULL,
    "packageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_tracking" (
    "id" TEXT NOT NULL,
    "sppgId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "allocatedBudget" DOUBLE PRECISION NOT NULL,
    "spentBudget" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "remainingBudget" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "proteinSpent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "carbsSpent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "vegetablesSpent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fruitsSpent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "otherSpent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "utilizationRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "efficiencyScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "costPerBeneficiary" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastCalculated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budget_tracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_packages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tier" "SubscriptionTier" NOT NULL,
    "monthlyPrice" DOUBLE PRECISION NOT NULL,
    "yearlyPrice" DOUBLE PRECISION,
    "setupFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maxRecipients" INTEGER NOT NULL,
    "maxStaff" INTEGER NOT NULL,
    "maxDistributionPoints" INTEGER NOT NULL,
    "maxMenusPerMonth" INTEGER NOT NULL,
    "storageGb" INTEGER NOT NULL,
    "maxReportsPerMonth" INTEGER NOT NULL,
    "hasAdvancedReporting" BOOLEAN NOT NULL DEFAULT false,
    "hasNutritionAnalysis" BOOLEAN NOT NULL DEFAULT false,
    "hasCostCalculation" BOOLEAN NOT NULL DEFAULT false,
    "hasQualityControl" BOOLEAN NOT NULL DEFAULT false,
    "hasAPIAccess" BOOLEAN NOT NULL DEFAULT false,
    "hasCustomBranding" BOOLEAN NOT NULL DEFAULT false,
    "hasPrioritySupport" BOOLEAN NOT NULL DEFAULT false,
    "hasTrainingIncluded" BOOLEAN NOT NULL DEFAULT false,
    "supportLevel" TEXT NOT NULL,
    "responseTimeSLA" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "isDemoPackage" BOOLEAN NOT NULL DEFAULT false,
    "demoDuration" INTEGER,
    "demoMaxUsers" INTEGER,
    "demoFeatureLimits" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_package_features" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "featureName" TEXT NOT NULL,
    "featureValue" TEXT NOT NULL,
    "isHighlight" BOOLEAN NOT NULL DEFAULT false,
    "category" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,

    CONSTRAINT "subscription_package_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "sppgId" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "baseAmount" DOUBLE PRECISION NOT NULL,
    "tax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "invoiceDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "paymentNumber" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "sppgId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "paymentProvider" TEXT,
    "paymentDate" TIMESTAMP(3),
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "referenceNumber" TEXT,
    "transactionId" TEXT,
    "paymentMethodId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usage_tracking" (
    "id" TEXT NOT NULL,
    "sppgId" TEXT NOT NULL,
    "resourceType" "UsageResourceType" NOT NULL,
    "period" TEXT NOT NULL,
    "currentUsage" INTEGER NOT NULL DEFAULT 0,
    "maxAllowed" INTEGER NOT NULL,
    "percentageUsed" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isOverQuota" BOOLEAN NOT NULL DEFAULT false,
    "warningAt80Sent" BOOLEAN NOT NULL DEFAULT false,
    "warningAt90Sent" BOOLEAN NOT NULL DEFAULT false,
    "warningAt100Sent" BOOLEAN NOT NULL DEFAULT false,
    "overageUnits" INTEGER NOT NULL DEFAULT 0,
    "overageRate" DOUBLE PRECISION,
    "overageAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usage_tracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_changes" (
    "id" TEXT NOT NULL,
    "sppgId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "changeType" "SubscriptionChangeType" NOT NULL,
    "fromTier" "SubscriptionTier",
    "toTier" "SubscriptionTier",
    "fromPackageId" TEXT,
    "toPackageId" TEXT,
    "oldMonthlyPrice" DOUBLE PRECISION,
    "newMonthlyPrice" DOUBLE PRECISION,
    "oldYearlyPrice" DOUBLE PRECISION,
    "newYearlyPrice" DOUBLE PRECISION,
    "proratedAmount" DOUBLE PRECISION,
    "proratedCredit" DOUBLE PRECISION,
    "requestedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "processedAt" TIMESTAMP(3),
    "requestedBy" TEXT NOT NULL,
    "approvedBy" TEXT,
    "processedBy" TEXT,
    "status" "SubscriptionChangeStatus" NOT NULL DEFAULT 'PENDING',
    "reason" TEXT,
    "notes" TEXT,
    "adminNotes" TEXT,
    "cancellationReason" TEXT,
    "retentionOffered" BOOLEAN NOT NULL DEFAULT false,
    "retentionAccepted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_changes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trial_subscriptions" (
    "id" TEXT NOT NULL,
    "sppgId" TEXT NOT NULL,
    "trialTier" "SubscriptionTier" NOT NULL DEFAULT 'STANDARD',
    "trialDays" INTEGER NOT NULL DEFAULT 14,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3) NOT NULL,
    "daysRemaining" INTEGER NOT NULL,
    "isExtended" BOOLEAN NOT NULL DEFAULT false,
    "extensionDays" INTEGER,
    "extensionReason" TEXT,
    "extendedBy" TEXT,
    "extendedAt" TIMESTAMP(3),
    "isConverted" BOOLEAN NOT NULL DEFAULT false,
    "convertedAt" TIMESTAMP(3),
    "convertedToTier" "SubscriptionTier",
    "conversionValue" DOUBLE PRECISION,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "firstMenuCreated" BOOLEAN NOT NULL DEFAULT false,
    "firstDeliveryMade" BOOLEAN NOT NULL DEFAULT false,
    "supportTicketsCount" INTEGER NOT NULL DEFAULT 0,
    "welcomeSent" BOOLEAN NOT NULL DEFAULT false,
    "reminder7DaysSent" BOOLEAN NOT NULL DEFAULT false,
    "reminder3DaysSent" BOOLEAN NOT NULL DEFAULT false,
    "reminder1DaySent" BOOLEAN NOT NULL DEFAULT false,
    "expiredNotificationSent" BOOLEAN NOT NULL DEFAULT false,
    "exitFeedback" TEXT,
    "exitReason" TEXT,
    "npsScore" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trial_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trial_notifications" (
    "id" TEXT NOT NULL,
    "trialId" TEXT NOT NULL,
    "notificationType" "TrialNotificationType" NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "channel" TEXT NOT NULL,
    "isDelivered" BOOLEAN NOT NULL DEFAULT true,
    "clickedAt" TIMESTAMP(3),

    CONSTRAINT "trial_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_cycles" (
    "id" TEXT NOT NULL,
    "sppgId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "billingPeriod" "BillingFrequency" NOT NULL DEFAULT 'MONTHLY',
    "cycleNumber" INTEGER NOT NULL,
    "cycleStartDate" TIMESTAMP(3) NOT NULL,
    "cycleEndDate" TIMESTAMP(3) NOT NULL,
    "usageStartDate" TIMESTAMP(3) NOT NULL,
    "usageEndDate" TIMESTAMP(3) NOT NULL,
    "baseAmount" DOUBLE PRECISION NOT NULL,
    "usageCharges" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "isProrated" BOOLEAN NOT NULL DEFAULT false,
    "proratedDays" INTEGER,
    "proratedAmount" DOUBLE PRECISION,
    "status" "BillingCycleStatus" NOT NULL DEFAULT 'PENDING',
    "invoiceGenerated" BOOLEAN NOT NULL DEFAULT false,
    "invoiceId" TEXT,
    "nextBillingDate" TIMESTAMP(3) NOT NULL,
    "isAutoRenewal" BOOLEAN NOT NULL DEFAULT true,
    "billingNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "billing_cycles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_methods" (
    "id" TEXT NOT NULL,
    "sppgId" VARCHAR(50) NOT NULL,
    "type" "PaymentMethodType" NOT NULL,
    "provider" VARCHAR(50) NOT NULL,
    "displayName" VARCHAR(100) NOT NULL,
    "maskedNumber" VARCHAR(30),
    "encryptedCardData" VARCHAR(500),
    "tokenizedCardData" VARCHAR(500),
    "encryptedBankData" VARCHAR(500),
    "encryptedWalletData" VARCHAR(500),
    "encryptedGatewayToken" VARCHAR(500),
    "gatewayCustomerHash" VARCHAR(255),
    "encryptionKeyVersion" INTEGER DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMPTZ,
    "securityStatus" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    "riskScore" INTEGER NOT NULL DEFAULT 0,
    "successfulPayments" INTEGER NOT NULL DEFAULT 0,
    "failedPayments" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" TIMESTAMPTZ,
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgTransactionSize" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "complianceChecked" BOOLEAN NOT NULL DEFAULT false,
    "complianceDate" TIMESTAMPTZ,
    "pciCompliant" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dunning_processes" (
    "id" TEXT NOT NULL,
    "sppgId" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "currentStage" "DunningStage" NOT NULL DEFAULT 'FIRST_REMINDER',
    "status" "DunningProcessStatus" NOT NULL DEFAULT 'ACTIVE',
    "stagesCompleted" "DunningStage"[],
    "remindersSent" INTEGER NOT NULL DEFAULT 0,
    "lastActionDate" TIMESTAMP(3),
    "nextActionDate" TIMESTAMP(3),
    "isEscalated" BOOLEAN NOT NULL DEFAULT false,
    "escalatedAt" TIMESTAMP(3),
    "escalatedTo" TEXT,
    "escalationReason" TEXT,
    "suspensionWarningDate" TIMESTAMP(3),
    "suspendedAt" TIMESTAMP(3),
    "isSuspended" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "resolutionType" TEXT,
    "resolutionNotes" TEXT,
    "resolvedBy" TEXT,
    "lastContactDate" TIMESTAMP(3),
    "customerResponse" TEXT,
    "promiseToPayDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dunning_processes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dunning_actions" (
    "id" TEXT NOT NULL,
    "dunningProcessId" TEXT NOT NULL,
    "stage" "DunningStage" NOT NULL,
    "actionType" TEXT NOT NULL,
    "actionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recipientEmail" TEXT,
    "recipientPhone" TEXT,
    "messageSubject" TEXT,
    "messageContent" TEXT,
    "isDelivered" BOOLEAN NOT NULL DEFAULT false,
    "deliveredAt" TIMESTAMP(3),
    "isOpened" BOOLEAN NOT NULL DEFAULT false,
    "openedAt" TIMESTAMP(3),
    "isClicked" BOOLEAN NOT NULL DEFAULT false,
    "clickedAt" TIMESTAMP(3),
    "customerResponded" BOOLEAN NOT NULL DEFAULT false,
    "responseDate" TIMESTAMP(3),
    "responseContent" TEXT,
    "wasEffective" BOOLEAN,
    "effectivenessNotes" TEXT,

    CONSTRAINT "dunning_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "revenue_recognition" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "invoiceId" TEXT,
    "billingCycleId" TEXT,
    "totalRevenue" DOUBLE PRECISION NOT NULL,
    "recognizedRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "deferredRevenue" DOUBLE PRECISION NOT NULL,
    "remainingRevenue" DOUBLE PRECISION NOT NULL,
    "recognitionStartDate" TIMESTAMP(3) NOT NULL,
    "recognitionEndDate" TIMESTAMP(3) NOT NULL,
    "recognitionDays" INTEGER NOT NULL,
    "monthlyAmount" DOUBLE PRECISION NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "accountingPeriod" TEXT,
    "journalEntryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "revenue_recognition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "revenue_schedule_items" (
    "id" TEXT NOT NULL,
    "revenueRecognitionId" TEXT NOT NULL,
    "scheduleDate" DATE NOT NULL,
    "scheduledAmount" DOUBLE PRECISION NOT NULL,
    "isRecognized" BOOLEAN NOT NULL DEFAULT false,
    "recognizedAt" TIMESTAMP(3),
    "accountingMonth" TEXT NOT NULL,
    "accountingQuarter" TEXT NOT NULL,

    CONSTRAINT "revenue_schedule_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_metrics" (
    "id" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "periodType" TEXT NOT NULL DEFAULT 'MONTHLY',
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalActiveSubscriptions" INTEGER NOT NULL DEFAULT 0,
    "newSubscriptions" INTEGER NOT NULL DEFAULT 0,
    "churnedSubscriptions" INTEGER NOT NULL DEFAULT 0,
    "reactivatedSubscriptions" INTEGER NOT NULL DEFAULT 0,
    "upgrades" INTEGER NOT NULL DEFAULT 0,
    "downgrades" INTEGER NOT NULL DEFAULT 0,
    "trialSignups" INTEGER NOT NULL DEFAULT 0,
    "trialConversions" INTEGER NOT NULL DEFAULT 0,
    "trialConversionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "trialExtensions" INTEGER NOT NULL DEFAULT 0,
    "monthlyRecurringRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "annualRecurringRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "averageRevenuePerUser" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "averageRevenuePerAccount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "mrrGrowthRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "customerGrowthRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "churnRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "retentionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "customerLifetimeValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paybackPeriod" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "basicTierCount" INTEGER NOT NULL DEFAULT 0,
    "standardTierCount" INTEGER NOT NULL DEFAULT 0,
    "proTierCount" INTEGER NOT NULL DEFAULT 0,
    "enterpriseTierCount" INTEGER NOT NULL DEFAULT 0,
    "successfulPaymentRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "averageDaysToPay" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "overdueInvoicesCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscription_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_health_scores" (
    "id" TEXT NOT NULL,
    "sppgId" TEXT NOT NULL,
    "healthScore" DOUBLE PRECISION NOT NULL,
    "scoreCategory" TEXT NOT NULL,
    "usageScore" DOUBLE PRECISION NOT NULL,
    "paymentScore" DOUBLE PRECISION NOT NULL,
    "supportScore" DOUBLE PRECISION NOT NULL,
    "engagementScore" DOUBLE PRECISION NOT NULL,
    "isAtRisk" BOOLEAN NOT NULL DEFAULT false,
    "riskFactors" TEXT[],
    "riskLevel" TEXT,
    "churnProbability" DOUBLE PRECISION,
    "expansionProbability" DOUBLE PRECISION,
    "recommendedActions" TEXT[],
    "calculationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nextCalculation" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_health_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_tickets" (
    "id" TEXT NOT NULL,
    "ticketNumber" TEXT NOT NULL,
    "sppgId" TEXT NOT NULL,
    "reportedBy" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" "SupportTicketPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "SupportTicketStatus" NOT NULL DEFAULT 'OPEN',
    "category" "SupportTicketCategory" NOT NULL DEFAULT 'GENERAL',
    "assignedTo" TEXT,
    "assignedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "resolution" TEXT,
    "satisfactionRating" INTEGER,
    "satisfactionFeedback" TEXT,
    "responseTime" TIMESTAMP(3),
    "resolutionTime" TIMESTAMP(3),
    "slaBreached" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_ticket_responses" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isInternal" BOOLEAN NOT NULL DEFAULT false,
    "authorId" TEXT,
    "authorName" TEXT NOT NULL,
    "authorType" TEXT NOT NULL DEFAULT 'SUPPORT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "support_ticket_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_base" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "summary" TEXT,
    "category" TEXT NOT NULL,
    "tags" TEXT[],
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "publishedBy" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "helpfulCount" INTEGER NOT NULL DEFAULT 0,
    "unhelpfulCount" INTEGER NOT NULL DEFAULT 0,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_base_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "templateCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'SYSTEM',
    "sppgId" TEXT,
    "variables" JSONB,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT false,
    "inAppEnabled" BOOLEAN NOT NULL DEFAULT true,
    "smsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "pushEnabled" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "sppgId" TEXT,
    "templateId" TEXT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "priority" "NotificationPriority" NOT NULL DEFAULT 'NORMAL',
    "channels" TEXT[],
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "isSent" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" TIMESTAMP(3),
    "category" "NotificationCategory" NOT NULL DEFAULT 'SYSTEM',
    "scheduledAt" TIMESTAMP(3),
    "entityType" TEXT,
    "entityId" TEXT,
    "actionUrl" TEXT,
    "variables" JSONB,
    "metadata" JSONB,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "htmlContent" TEXT NOT NULL,
    "textContent" TEXT,
    "category" TEXT NOT NULL,
    "variables" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_logs" (
    "id" TEXT NOT NULL,
    "templateId" TEXT,
    "toEmail" TEXT NOT NULL,
    "fromEmail" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "provider" TEXT,
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),
    "clickedAt" TIMESTAMP(3),
    "bouncedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "entityType" TEXT,
    "entityId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_deliveries" (
    "id" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "provider" TEXT,
    "recipient" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_campaigns" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sppgId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "scheduledAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "totalRecipients" INTEGER NOT NULL DEFAULT 0,
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "deliveredCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_notification_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "channelPreferences" JSONB,
    "categoryPreferences" JSONB,
    "globallyEnabled" BOOLEAN NOT NULL DEFAULT true,
    "quietHours" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "description" TEXT,
    "oldValues" JSONB,
    "newValues" JSONB,
    "userId" TEXT,
    "userName" TEXT,
    "userEmail" TEXT,
    "sppgId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "requestPath" TEXT,
    "requestMethod" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_items" (
    "id" TEXT NOT NULL,
    "sppgId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "itemCode" TEXT,
    "brand" TEXT,
    "category" "InventoryCategory" NOT NULL,
    "unit" TEXT NOT NULL,
    "currentStock" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "minStock" DOUBLE PRECISION NOT NULL,
    "maxStock" DOUBLE PRECISION NOT NULL,
    "reorderQuantity" DOUBLE PRECISION,
    "lastPrice" DOUBLE PRECISION,
    "averagePrice" DOUBLE PRECISION,
    "costPerUnit" DOUBLE PRECISION,
    "preferredSupplierId" VARCHAR(50),
    "legacySupplierName" TEXT,
    "supplierContact" TEXT,
    "leadTime" INTEGER,
    "storageLocation" TEXT NOT NULL,
    "storageCondition" TEXT,
    "hasExpiry" BOOLEAN NOT NULL DEFAULT false,
    "shelfLife" INTEGER,
    "calories" DOUBLE PRECISION,
    "protein" DOUBLE PRECISION,
    "carbohydrates" DOUBLE PRECISION,
    "fat" DOUBLE PRECISION,
    "fiber" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_movements" (
    "id" TEXT NOT NULL,
    "inventoryId" TEXT NOT NULL,
    "movementType" "MovementType" NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "stockBefore" DOUBLE PRECISION NOT NULL,
    "stockAfter" DOUBLE PRECISION NOT NULL,
    "unitCost" DOUBLE PRECISION,
    "totalCost" DOUBLE PRECISION,
    "referenceType" TEXT,
    "referenceId" TEXT,
    "referenceNumber" TEXT,
    "batchNumber" TEXT,
    "expiryDate" TIMESTAMP(3),
    "notes" TEXT,
    "documentUrl" TEXT,
    "movedBy" TEXT NOT NULL,
    "movedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),

    CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procurement_plans" (
    "id" TEXT NOT NULL,
    "sppgId" TEXT NOT NULL,
    "programId" TEXT,
    "planName" TEXT NOT NULL,
    "planMonth" TEXT NOT NULL,
    "planYear" INTEGER NOT NULL,
    "planQuarter" INTEGER,
    "totalBudget" DOUBLE PRECISION NOT NULL,
    "allocatedBudget" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "usedBudget" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "remainingBudget" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "proteinBudget" DOUBLE PRECISION,
    "carbBudget" DOUBLE PRECISION,
    "vegetableBudget" DOUBLE PRECISION,
    "fruitBudget" DOUBLE PRECISION,
    "otherBudget" DOUBLE PRECISION,
    "targetRecipients" INTEGER NOT NULL,
    "targetMeals" INTEGER NOT NULL,
    "costPerMeal" DOUBLE PRECISION,
    "approvalStatus" TEXT NOT NULL DEFAULT 'DRAFT',
    "submittedBy" TEXT,
    "submittedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "notes" TEXT,
    "emergencyBuffer" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "procurement_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procurements" (
    "id" TEXT NOT NULL,
    "sppgId" TEXT NOT NULL,
    "planId" TEXT,
    "procurementCode" TEXT NOT NULL,
    "procurementDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expectedDelivery" TIMESTAMP(3),
    "actualDelivery" TIMESTAMP(3),
    "supplierId" VARCHAR(50) NOT NULL,
    "supplierName" TEXT,
    "supplierContact" TEXT,
    "purchaseMethod" "ProcurementMethod" NOT NULL,
    "paymentTerms" TEXT,
    "subtotalAmount" DOUBLE PRECISION NOT NULL,
    "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "shippingCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "paidAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paymentStatus" TEXT NOT NULL DEFAULT 'UNPAID',
    "paymentDue" TIMESTAMP(3),
    "status" "ProcurementStatus" NOT NULL DEFAULT 'DRAFT',
    "deliveryStatus" TEXT NOT NULL DEFAULT 'ORDERED',
    "qualityGrade" "QualityGrade",
    "qualityNotes" TEXT,
    "receiptNumber" TEXT,
    "receiptPhoto" TEXT,
    "deliveryPhoto" TEXT,
    "invoiceNumber" TEXT,
    "deliveryMethod" TEXT,
    "transportCost" DOUBLE PRECISION,
    "packagingType" TEXT,
    "inspectedBy" TEXT,
    "inspectedAt" TIMESTAMP(3),
    "acceptanceStatus" TEXT,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "procurements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procurement_items" (
    "id" TEXT NOT NULL,
    "procurementId" TEXT NOT NULL,
    "inventoryItemId" TEXT,
    "itemName" TEXT NOT NULL,
    "itemCode" TEXT,
    "category" "InventoryCategory" NOT NULL,
    "brand" TEXT,
    "orderedQuantity" DOUBLE PRECISION NOT NULL,
    "receivedQuantity" DOUBLE PRECISION,
    "unit" TEXT NOT NULL,
    "pricePerUnit" DOUBLE PRECISION NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "discountPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "finalPrice" DOUBLE PRECISION NOT NULL,
    "qualityStandard" TEXT,
    "qualityReceived" TEXT,
    "gradeRequested" TEXT,
    "gradeReceived" TEXT,
    "expiryDate" TIMESTAMP(3),
    "batchNumber" TEXT,
    "productionDate" TIMESTAMP(3),
    "storageRequirement" TEXT,
    "isAccepted" BOOLEAN NOT NULL DEFAULT true,
    "rejectionReason" TEXT,
    "returnedQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "caloriesPer100g" DOUBLE PRECISION,
    "proteinPer100g" DOUBLE PRECISION,
    "fatPer100g" DOUBLE PRECISION,
    "carbsPer100g" DOUBLE PRECISION,
    "notes" TEXT,

    CONSTRAINT "procurement_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nutrition_requirements" (
    "id" TEXT NOT NULL,
    "ageGroupMin" INTEGER NOT NULL,
    "ageGroupMax" INTEGER NOT NULL,
    "gender" TEXT NOT NULL,
    "activityLevel" TEXT,
    "specialCondition" TEXT,
    "caloriesPerDay" DOUBLE PRECISION NOT NULL,
    "proteinPerDay" DOUBLE PRECISION NOT NULL,
    "fatPerDay" DOUBLE PRECISION NOT NULL,
    "carbsPerDay" DOUBLE PRECISION NOT NULL,
    "fiberPerDay" DOUBLE PRECISION NOT NULL,
    "vitaminAPerDay" DOUBLE PRECISION,
    "vitaminB1PerDay" DOUBLE PRECISION,
    "vitaminB2PerDay" DOUBLE PRECISION,
    "vitaminB3PerDay" DOUBLE PRECISION,
    "vitaminB6PerDay" DOUBLE PRECISION,
    "vitaminB12PerDay" DOUBLE PRECISION,
    "vitaminCPerDay" DOUBLE PRECISION,
    "vitaminDPerDay" DOUBLE PRECISION,
    "vitaminEPerDay" DOUBLE PRECISION,
    "vitaminKPerDay" DOUBLE PRECISION,
    "folatPerDay" DOUBLE PRECISION,
    "calciumPerDay" DOUBLE PRECISION,
    "phosphorusPerDay" DOUBLE PRECISION,
    "ironPerDay" DOUBLE PRECISION,
    "zincPerDay" DOUBLE PRECISION,
    "iodinePerDay" DOUBLE PRECISION,
    "seleniumPerDay" DOUBLE PRECISION,
    "magnesiumPerDay" DOUBLE PRECISION,
    "potassiumPerDay" DOUBLE PRECISION,
    "sodiumPerDay" DOUBLE PRECISION,
    "referenceSource" TEXT NOT NULL DEFAULT 'KEMENKES_2019',
    "applicableRegion" TEXT NOT NULL DEFAULT 'INDONESIA',
    "referenceYear" INTEGER NOT NULL DEFAULT 2019,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nutrition_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_beneficiaries" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "schoolName" TEXT NOT NULL,
    "schoolCode" TEXT,
    "schoolType" TEXT NOT NULL,
    "schoolStatus" TEXT NOT NULL,
    "principalName" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "contactEmail" TEXT,
    "schoolAddress" TEXT NOT NULL,
    "villageId" TEXT NOT NULL,
    "postalCode" TEXT,
    "coordinates" TEXT,
    "totalStudents" INTEGER NOT NULL,
    "targetStudents" INTEGER NOT NULL,
    "activeStudents" INTEGER NOT NULL DEFAULT 0,
    "students4to6Years" INTEGER NOT NULL DEFAULT 0,
    "students7to12Years" INTEGER NOT NULL DEFAULT 0,
    "students13to15Years" INTEGER NOT NULL DEFAULT 0,
    "students16to18Years" INTEGER NOT NULL DEFAULT 0,
    "feedingDays" INTEGER[],
    "mealsPerDay" INTEGER NOT NULL DEFAULT 1,
    "feedingTime" TEXT,
    "deliveryAddress" TEXT NOT NULL,
    "deliveryContact" TEXT NOT NULL,
    "deliveryInstructions" TEXT,
    "storageCapacity" TEXT,
    "servingMethod" TEXT NOT NULL DEFAULT 'CAFETERIA',
    "hasKitchen" BOOLEAN NOT NULL DEFAULT false,
    "hasStorage" BOOLEAN NOT NULL DEFAULT false,
    "hasCleanWater" BOOLEAN NOT NULL DEFAULT true,
    "hasElectricity" BOOLEAN NOT NULL DEFAULT true,
    "enrollmentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "suspendedAt" TIMESTAMP(3),
    "suspensionReason" TEXT,
    "beneficiaryType" "BeneficiaryType" NOT NULL DEFAULT 'CHILD',
    "specialDietary" TEXT[],
    "allergyAlerts" TEXT[],
    "culturalReqs" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_beneficiaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "food_productions" (
    "id" TEXT NOT NULL,
    "sppgId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "menuId" TEXT NOT NULL,
    "productionDate" TIMESTAMP(3) NOT NULL,
    "batchNumber" TEXT NOT NULL,
    "plannedPortions" INTEGER NOT NULL,
    "actualPortions" INTEGER,
    "headCook" TEXT NOT NULL,
    "assistantCooks" TEXT[],
    "supervisorId" TEXT,
    "plannedStartTime" TIMESTAMP(3) NOT NULL,
    "plannedEndTime" TIMESTAMP(3) NOT NULL,
    "actualStartTime" TIMESTAMP(3),
    "actualEndTime" TIMESTAMP(3),
    "estimatedCost" DOUBLE PRECISION NOT NULL,
    "actualCost" DOUBLE PRECISION,
    "costPerPortion" DOUBLE PRECISION,
    "targetTemperature" DOUBLE PRECISION,
    "actualTemperature" DOUBLE PRECISION,
    "hygieneScore" INTEGER,
    "tasteRating" INTEGER,
    "appearanceRating" INTEGER,
    "textureRating" INTEGER,
    "status" "ProductionStatus" NOT NULL DEFAULT 'PLANNED',
    "qualityPassed" BOOLEAN,
    "rejectionReason" TEXT,
    "wasteAmount" DOUBLE PRECISION,
    "wasteNotes" TEXT,
    "notes" TEXT,
    "photos" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "food_productions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quality_controls" (
    "id" TEXT NOT NULL,
    "productionId" TEXT NOT NULL,
    "checkType" TEXT NOT NULL,
    "checkTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkedBy" TEXT NOT NULL,
    "parameter" TEXT NOT NULL,
    "expectedValue" TEXT,
    "actualValue" TEXT NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "score" INTEGER,
    "severity" TEXT,
    "notes" TEXT,
    "recommendations" TEXT,
    "actionRequired" BOOLEAN NOT NULL DEFAULT false,
    "actionTaken" TEXT,
    "actionBy" TEXT,
    "actionDate" TIMESTAMP(3),
    "followUpRequired" BOOLEAN NOT NULL DEFAULT false,
    "followUpDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quality_controls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "food_distributions" (
    "id" TEXT NOT NULL,
    "sppgId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "productionId" TEXT,
    "distributionDate" TIMESTAMP(3) NOT NULL,
    "distributionCode" TEXT NOT NULL,
    "mealType" "MealType" NOT NULL,
    "distributionPoint" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "coordinates" TEXT,
    "plannedRecipients" INTEGER NOT NULL,
    "actualRecipients" INTEGER,
    "plannedStartTime" TIMESTAMP(3) NOT NULL,
    "plannedEndTime" TIMESTAMP(3) NOT NULL,
    "distributorId" TEXT NOT NULL,
    "driverId" TEXT,
    "volunteers" TEXT[],
    "distributionMethod" "DistributionMethod",
    "vehicleType" TEXT,
    "vehiclePlate" TEXT,
    "transportCost" DOUBLE PRECISION,
    "fuelCost" DOUBLE PRECISION,
    "otherCosts" DOUBLE PRECISION,
    "menuItems" JSONB NOT NULL,
    "totalPortions" INTEGER NOT NULL,
    "portionSize" DOUBLE PRECISION NOT NULL,
    "departureTemp" DOUBLE PRECISION,
    "arrivalTemp" DOUBLE PRECISION,
    "servingTemp" DOUBLE PRECISION,
    "status" "DistributionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "actualStartTime" TIMESTAMP(3),
    "actualEndTime" TIMESTAMP(3),
    "departureTime" TIMESTAMP(3),
    "arrivalTime" TIMESTAMP(3),
    "completionTime" TIMESTAMP(3),
    "foodQuality" "QualityGrade",
    "hygieneScore" INTEGER,
    "packagingCondition" TEXT,
    "weatherCondition" TEXT,
    "temperature" DOUBLE PRECISION,
    "humidity" DOUBLE PRECISION,
    "notes" TEXT,
    "photos" TEXT[],
    "signature" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "food_distributions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_nutrition_calculations" (
    "id" TEXT NOT NULL,
    "menuId" TEXT NOT NULL,
    "requirementId" TEXT,
    "totalCalories" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalProtein" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalCarbs" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalFat" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalFiber" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalVitaminA" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalVitaminB1" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalVitaminB2" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalVitaminB3" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalVitaminB6" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalVitaminB12" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalVitaminC" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalVitaminD" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalVitaminE" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalVitaminK" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalFolat" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalCalcium" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalPhosphorus" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalIron" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalZinc" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalIodine" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalSelenium" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalMagnesium" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalPotassium" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalSodium" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "caloriesDV" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "proteinDV" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "carbsDV" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fatDV" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fiberDV" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "meetsCalorieAKG" BOOLEAN NOT NULL DEFAULT false,
    "meetsProteinAKG" BOOLEAN NOT NULL DEFAULT false,
    "meetsAKG" BOOLEAN NOT NULL DEFAULT false,
    "excessNutrients" TEXT[],
    "deficientNutrients" TEXT[],
    "adequateNutrients" TEXT[],
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "calculatedBy" TEXT,
    "calculationMethod" TEXT NOT NULL DEFAULT 'AUTO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_nutrition_calculations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_cost_calculations" (
    "id" TEXT NOT NULL,
    "menuId" TEXT NOT NULL,
    "totalIngredientCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ingredientBreakdown" JSONB,
    "laborCostPerHour" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "preparationHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cookingHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalLaborCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "gasCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "electricityCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "waterCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalUtilityCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "packagingCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "equipmentCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cleaningCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "overheadPercentage" DOUBLE PRECISION NOT NULL DEFAULT 15,
    "overheadCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalDirectCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalIndirectCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "grandTotalCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "plannedPortions" INTEGER NOT NULL DEFAULT 1,
    "costPerPortion" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "targetProfitMargin" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "recommendedPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "marketPrice" DOUBLE PRECISION,
    "priceCompetitiveness" TEXT,
    "ingredientCostRatio" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "laborCostRatio" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "overheadCostRatio" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "costOptimizations" TEXT[],
    "alternativeIngredients" TEXT[],
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "calculatedBy" TEXT,
    "calculationMethod" TEXT NOT NULL DEFAULT 'AUTO',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_cost_calculations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "sppgId" TEXT NOT NULL,
    "departmentCode" TEXT NOT NULL,
    "departmentName" TEXT NOT NULL,
    "description" TEXT,
    "parentId" TEXT,
    "managerId" TEXT,
    "budgetAllocated" DOUBLE PRECISION,
    "maxEmployees" INTEGER,
    "currentEmployees" INTEGER NOT NULL DEFAULT 0,
    "email" TEXT,
    "phone" TEXT,
    "location" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "positions" (
    "id" TEXT NOT NULL,
    "sppgId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "positionCode" TEXT NOT NULL,
    "positionName" TEXT NOT NULL,
    "jobDescription" TEXT,
    "requirements" TEXT[],
    "responsibilities" TEXT[],
    "level" "EmployeeLevel" NOT NULL DEFAULT 'STAFF',
    "reportsTo" TEXT,
    "minSalary" DOUBLE PRECISION,
    "maxSalary" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'IDR',
    "maxOccupants" INTEGER NOT NULL DEFAULT 1,
    "currentOccupants" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" TEXT NOT NULL,
    "sppgId" TEXT NOT NULL,
    "userId" TEXT,
    "employeeId" TEXT NOT NULL,
    "employeeCode" TEXT,
    "fullName" TEXT NOT NULL,
    "nickname" TEXT,
    "nik" TEXT,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "placeOfBirth" TEXT,
    "gender" "Gender" NOT NULL,
    "religion" TEXT,
    "maritalStatus" "MaritalStatus" NOT NULL DEFAULT 'SINGLE',
    "bloodType" TEXT,
    "nationality" TEXT NOT NULL DEFAULT 'Indonesian',
    "phone" TEXT,
    "email" TEXT,
    "personalEmail" TEXT,
    "addressDetail" TEXT NOT NULL,
    "villageId" TEXT NOT NULL,
    "postalCode" TEXT,
    "emergencyContactName" TEXT,
    "emergencyContactPhone" TEXT,
    "emergencyContactRelation" TEXT,
    "departmentId" TEXT NOT NULL,
    "positionId" TEXT NOT NULL,
    "employmentType" "EmploymentType" NOT NULL DEFAULT 'PERMANENT',
    "employmentStatus" "EmploymentStatus" NOT NULL DEFAULT 'PROBATION',
    "joinDate" TIMESTAMP(3) NOT NULL,
    "probationEndDate" TIMESTAMP(3),
    "contractStartDate" TIMESTAMP(3),
    "contractEndDate" TIMESTAMP(3),
    "terminationDate" TIMESTAMP(3),
    "terminationReason" TEXT,
    "directSupervisor" TEXT,
    "workLocation" TEXT,
    "workScheduleId" TEXT,
    "basicSalary" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'IDR',
    "salaryGrade" TEXT,
    "taxId" TEXT,
    "bankAccount" TEXT,
    "bankName" TEXT,
    "bankBranch" TEXT,
    "photoUrl" TEXT,
    "biography" TEXT,
    "skills" TEXT[],
    "languages" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_schedules" (
    "id" TEXT NOT NULL,
    "sppgId" TEXT NOT NULL,
    "scheduleName" TEXT NOT NULL,
    "description" TEXT,
    "mondayStart" TEXT,
    "mondayEnd" TEXT,
    "tuesdayStart" TEXT,
    "tuesdayEnd" TEXT,
    "wednesdayStart" TEXT,
    "wednesdayEnd" TEXT,
    "thursdayStart" TEXT,
    "thursdayEnd" TEXT,
    "fridayStart" TEXT,
    "fridayEnd" TEXT,
    "saturdayStart" TEXT,
    "saturdayEnd" TEXT,
    "sundayStart" TEXT,
    "sundayEnd" TEXT,
    "breakDuration" INTEGER NOT NULL DEFAULT 60,
    "lunchBreakStart" TEXT,
    "lunchBreakEnd" TEXT,
    "hoursPerWeek" DOUBLE PRECISION NOT NULL DEFAULT 40,
    "workDaysPerWeek" INTEGER NOT NULL DEFAULT 5,
    "overtimeAllowed" BOOLEAN NOT NULL DEFAULT true,
    "maxOvertimeDaily" DOUBLE PRECISION NOT NULL DEFAULT 4,
    "flexibleHours" BOOLEAN NOT NULL DEFAULT false,
    "coreHoursStart" TEXT,
    "coreHoursEnd" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_distributions" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "menuId" TEXT NOT NULL,
    "distributionDate" TIMESTAMP(3) NOT NULL,
    "targetQuantity" INTEGER NOT NULL,
    "actualQuantity" INTEGER NOT NULL DEFAULT 0,
    "schoolName" TEXT NOT NULL,
    "targetStudents" INTEGER NOT NULL,
    "menuName" TEXT NOT NULL,
    "portionSize" DOUBLE PRECISION NOT NULL,
    "totalWeight" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "costPerPortion" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "budgetAllocated" DOUBLE PRECISION,
    "deliveryTime" TIMESTAMP(3),
    "deliveryAddress" TEXT NOT NULL,
    "deliveryContact" TEXT NOT NULL,
    "deliveryStatus" TEXT NOT NULL DEFAULT 'PLANNED',
    "temperatureCheck" BOOLEAN NOT NULL DEFAULT false,
    "foodTemperature" DOUBLE PRECISION,
    "qualityStatus" TEXT,
    "qualityNotes" TEXT,
    "receivedBy" TEXT,
    "receivedAt" TIMESTAMP(3),
    "signature" TEXT,
    "photos" TEXT[],
    "schoolFeedback" TEXT,
    "satisfactionScore" INTEGER,
    "issues" TEXT[],
    "needsFollowUp" BOOLEAN NOT NULL DEFAULT false,
    "followUpNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_distributions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_feeding_reports" (
    "id" TEXT NOT NULL,
    "distributionId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "reportDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reportType" TEXT NOT NULL DEFAULT 'DAILY',
    "totalStudentsServed" INTEGER NOT NULL,
    "totalPortionsServed" INTEGER NOT NULL,
    "totalPortionsConsumed" INTEGER NOT NULL,
    "wastePercentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "attendanceRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "participationRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "foodTemperature" DOUBLE PRECISION,
    "tasteRating" DOUBLE PRECISION,
    "presentationRating" DOUBLE PRECISION,
    "overallRating" DOUBLE PRECISION,
    "studentFeedback" TEXT[],
    "teacherFeedback" TEXT[],
    "nutritionObservations" TEXT[],
    "issuesReported" TEXT[],
    "actionsRequired" TEXT[],
    "recommendationsNext" TEXT[],
    "healthObservations" TEXT,
    "energyLevels" TEXT,
    "concentrationLevels" TEXT,
    "reportedBy" TEXT NOT NULL,
    "reviewedBy" TEXT,
    "reviewNotes" TEXT,
    "reportStatus" TEXT NOT NULL DEFAULT 'SUBMITTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_feeding_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "program_monitoring" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "monitoringMonth" TEXT NOT NULL,
    "monitoringYear" INTEGER NOT NULL,
    "reportingWeek" INTEGER,
    "reportedBy" TEXT NOT NULL,
    "reportDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "targetRecipients" INTEGER NOT NULL,
    "enrolledRecipients" INTEGER NOT NULL,
    "activeRecipients" INTEGER NOT NULL,
    "dropoutCount" INTEGER NOT NULL,
    "newEnrollments" INTEGER NOT NULL,
    "attendanceRate" DOUBLE PRECISION NOT NULL,
    "assessmentsCompleted" INTEGER NOT NULL DEFAULT 0,
    "improvedNutrition" INTEGER NOT NULL DEFAULT 0,
    "stableNutrition" INTEGER NOT NULL DEFAULT 0,
    "worsenedNutrition" INTEGER NOT NULL DEFAULT 0,
    "criticalCases" INTEGER NOT NULL DEFAULT 0,
    "feedingDaysPlanned" INTEGER NOT NULL,
    "feedingDaysCompleted" INTEGER NOT NULL,
    "menuVariety" INTEGER NOT NULL,
    "stockoutDays" INTEGER NOT NULL,
    "qualityIssues" INTEGER NOT NULL,
    "totalMealsProduced" INTEGER NOT NULL,
    "totalMealsDistributed" INTEGER NOT NULL,
    "wastePercentage" DOUBLE PRECISION NOT NULL,
    "productionEfficiency" DOUBLE PRECISION NOT NULL,
    "budgetAllocated" DOUBLE PRECISION NOT NULL,
    "budgetUtilized" DOUBLE PRECISION NOT NULL,
    "budgetUtilization" DOUBLE PRECISION NOT NULL,
    "costPerRecipient" DOUBLE PRECISION NOT NULL,
    "costPerMeal" DOUBLE PRECISION NOT NULL,
    "savings" DOUBLE PRECISION NOT NULL,
    "avgQualityScore" DOUBLE PRECISION NOT NULL,
    "customerSatisfaction" DOUBLE PRECISION NOT NULL,
    "complaintCount" INTEGER NOT NULL DEFAULT 0,
    "complimentCount" INTEGER NOT NULL DEFAULT 0,
    "foodSafetyIncidents" INTEGER NOT NULL DEFAULT 0,
    "hygieneScore" DOUBLE PRECISION,
    "temperatureCompliance" DOUBLE PRECISION,
    "staffAttendance" DOUBLE PRECISION NOT NULL,
    "trainingCompleted" INTEGER NOT NULL,
    "majorChallenges" TEXT[],
    "minorIssues" TEXT[],
    "resourceConstraints" TEXT[],
    "achievements" TEXT[],
    "bestPractices" TEXT[],
    "innovations" TEXT[],
    "recommendedActions" TEXT[],
    "priorityAreas" TEXT[],
    "resourceNeeds" TEXT[],
    "nextMonthTargets" TEXT[],
    "improvementPlans" TEXT[],
    "parentFeedback" TEXT,
    "teacherFeedback" TEXT,
    "communityFeedback" TEXT,
    "governmentFeedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "program_monitoring_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nutrition_programs" (
    "id" TEXT NOT NULL,
    "sppgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "programCode" TEXT NOT NULL,
    "programType" "ProgramType" NOT NULL,
    "targetGroup" "TargetGroup" NOT NULL,
    "calorieTarget" DOUBLE PRECISION,
    "proteinTarget" DOUBLE PRECISION,
    "carbTarget" DOUBLE PRECISION,
    "fatTarget" DOUBLE PRECISION,
    "fiberTarget" DOUBLE PRECISION,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "feedingDays" INTEGER[],
    "mealsPerDay" INTEGER NOT NULL DEFAULT 1,
    "totalBudget" DOUBLE PRECISION,
    "budgetPerMeal" DOUBLE PRECISION,
    "targetRecipients" INTEGER NOT NULL,
    "currentRecipients" INTEGER NOT NULL DEFAULT 0,
    "implementationArea" TEXT NOT NULL,
    "partnerSchools" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nutrition_programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nutrition_menus" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "menuName" TEXT NOT NULL,
    "menuCode" TEXT NOT NULL,
    "description" TEXT,
    "mealType" "MealType" NOT NULL,
    "servingSize" INTEGER NOT NULL,
    "costPerServing" DOUBLE PRECISION NOT NULL,
    "sellingPrice" DOUBLE PRECISION,
    "cookingTime" INTEGER,
    "preparationTime" INTEGER,
    "difficulty" TEXT,
    "cookingMethod" TEXT,
    "batchSize" INTEGER,
    "budgetAllocation" DOUBLE PRECISION,
    "allergens" TEXT[],
    "isHalal" BOOLEAN NOT NULL DEFAULT true,
    "isVegetarian" BOOLEAN NOT NULL DEFAULT false,
    "nutritionStandardCompliance" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nutrition_menus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_ingredients" (
    "id" TEXT NOT NULL,
    "menuId" TEXT NOT NULL,
    "inventoryItemId" TEXT,
    "ingredientName" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "costPerUnit" DOUBLE PRECISION NOT NULL,
    "totalCost" DOUBLE PRECISION NOT NULL,
    "preparationNotes" TEXT,
    "isOptional" BOOLEAN NOT NULL DEFAULT false,
    "substitutes" TEXT[],

    CONSTRAINT "menu_ingredients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipe_steps" (
    "id" TEXT NOT NULL,
    "menuId" TEXT NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "title" TEXT,
    "instruction" TEXT NOT NULL,
    "duration" INTEGER,
    "temperature" DOUBLE PRECISION,
    "equipment" TEXT[],
    "qualityCheck" TEXT,
    "imageUrl" TEXT,
    "videoUrl" TEXT,

    CONSTRAINT "recipe_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_plans" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "sppgId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "approvedBy" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "MenuPlanStatus" NOT NULL DEFAULT 'DRAFT',
    "isDraft" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "totalDays" INTEGER NOT NULL DEFAULT 0,
    "totalMenus" INTEGER NOT NULL DEFAULT 0,
    "averageCostPerDay" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalEstimatedCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "nutritionScore" DOUBLE PRECISION,
    "varietyScore" DOUBLE PRECISION,
    "costEfficiency" DOUBLE PRECISION,
    "meetsNutritionStandards" BOOLEAN NOT NULL DEFAULT false,
    "meetsbudgetConstraints" BOOLEAN NOT NULL DEFAULT false,
    "planningRules" JSONB,
    "generationMetadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_assignments" (
    "id" TEXT NOT NULL,
    "menuPlanId" TEXT NOT NULL,
    "menuId" TEXT NOT NULL,
    "assignedDate" TIMESTAMP(3) NOT NULL,
    "mealType" "MealType" NOT NULL,
    "plannedPortions" INTEGER NOT NULL DEFAULT 0,
    "estimatedCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "calories" INTEGER NOT NULL DEFAULT 0,
    "protein" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "carbohydrates" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fat" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isSubstitute" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'PLANNED',
    "isProduced" BOOLEAN NOT NULL DEFAULT false,
    "isDistributed" BOOLEAN NOT NULL DEFAULT false,
    "actualPortions" INTEGER,
    "actualCost" DOUBLE PRECISION,
    "productionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_plan_templates" (
    "id" TEXT NOT NULL,
    "menuPlanId" TEXT NOT NULL,
    "sppgId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "templatePattern" JSONB NOT NULL,
    "useCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" TIMESTAMP(3),
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_plan_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nutrition_standards" (
    "id" TEXT NOT NULL,
    "targetGroup" "TargetGroup" NOT NULL,
    "ageGroup" "AgeGroup" NOT NULL,
    "gender" "Gender",
    "activityLevel" "ActivityLevel" NOT NULL DEFAULT 'MODERATE',
    "calories" INTEGER NOT NULL,
    "protein" DOUBLE PRECISION NOT NULL,
    "carbohydrates" DOUBLE PRECISION NOT NULL,
    "fat" DOUBLE PRECISION NOT NULL,
    "fiber" DOUBLE PRECISION NOT NULL,
    "calcium" DOUBLE PRECISION,
    "iron" DOUBLE PRECISION,
    "vitaminA" DOUBLE PRECISION,
    "vitaminC" DOUBLE PRECISION,
    "vitaminD" DOUBLE PRECISION,
    "vitaminE" DOUBLE PRECISION,
    "folate" DOUBLE PRECISION,
    "zinc" DOUBLE PRECISION,
    "caloriesMin" INTEGER,
    "caloriesMax" INTEGER,
    "proteinMin" DOUBLE PRECISION,
    "proteinMax" DOUBLE PRECISION,
    "source" TEXT,
    "referenceYear" INTEGER,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nutrition_standards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_documents" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "documentType" "DocumentType" NOT NULL,
    "documentName" TEXT NOT NULL,
    "documentNumber" TEXT,
    "description" TEXT,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "issueDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "isExpired" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_certifications" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "certificationName" TEXT NOT NULL,
    "issuingOrganization" TEXT NOT NULL,
    "certificationNumber" TEXT,
    "description" TEXT,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "verificationUrl" TEXT,
    "certificateUrl" TEXT,
    "requiresRenewal" BOOLEAN NOT NULL DEFAULT false,
    "renewalDate" TIMESTAMP(3),
    "renewalReminder" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_certifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_attendances" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "attendanceDate" DATE NOT NULL,
    "dayOfWeek" TEXT NOT NULL,
    "clockIn" TIMESTAMP(3),
    "clockOut" TIMESTAMP(3),
    "breakStart" TIMESTAMP(3),
    "breakEnd" TIMESTAMP(3),
    "scheduledHours" DOUBLE PRECISION NOT NULL DEFAULT 8,
    "actualHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "breakHours" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "overtimeHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    "attendanceType" TEXT NOT NULL DEFAULT 'REGULAR',
    "clockInLocation" TEXT,
    "clockOutLocation" TEXT,
    "clockInMethod" TEXT,
    "lateMinutes" INTEGER NOT NULL DEFAULT 0,
    "earlyLeaveMinutes" INTEGER NOT NULL DEFAULT 0,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "notes" TEXT,
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_attendances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_balances" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "leaveYear" INTEGER NOT NULL,
    "annualLeaveEntitlement" INTEGER NOT NULL DEFAULT 12,
    "sickLeaveEntitlement" INTEGER NOT NULL DEFAULT 12,
    "emergencyLeaveEntitlement" INTEGER NOT NULL DEFAULT 2,
    "annualLeaveUsed" INTEGER NOT NULL DEFAULT 0,
    "sickLeaveUsed" INTEGER NOT NULL DEFAULT 0,
    "emergencyLeaveUsed" INTEGER NOT NULL DEFAULT 0,
    "annualLeaveRemaining" INTEGER NOT NULL DEFAULT 12,
    "sickLeaveRemaining" INTEGER NOT NULL DEFAULT 12,
    "emergencyLeaveRemaining" INTEGER NOT NULL DEFAULT 2,
    "carriedOverDays" INTEGER NOT NULL DEFAULT 0,
    "maxCarryOver" INTEGER NOT NULL DEFAULT 5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leave_balances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_requests" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "leaveType" "LeaveType" NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "totalDays" INTEGER NOT NULL,
    "halfDay" BOOLEAN NOT NULL DEFAULT false,
    "reason" TEXT NOT NULL,
    "emergencyContact" TEXT,
    "emergencyPhone" TEXT,
    "coveringEmployee" TEXT,
    "status" "LeaveStatus" NOT NULL DEFAULT 'PENDING',
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "supervisorId" TEXT,
    "supervisorStatus" TEXT,
    "supervisorNotes" TEXT,
    "supervisorDate" TIMESTAMP(3),
    "hrApprovedBy" TEXT,
    "hrStatus" TEXT,
    "hrNotes" TEXT,
    "hrApprovedAt" TIMESTAMP(3),
    "finalApprovedBy" TEXT,
    "rejectionReason" TEXT,
    "documents" TEXT[],
    "medicalCertificate" TEXT,
    "actualStartDate" TIMESTAMP(3),
    "actualEndDate" TIMESTAMP(3),
    "actualDays" INTEGER,
    "returnDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leave_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payrolls" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "payrollMonth" TEXT NOT NULL,
    "payrollYear" INTEGER NOT NULL,
    "payPeriodStart" DATE NOT NULL,
    "payPeriodEnd" DATE NOT NULL,
    "payDate" TIMESTAMP(3),
    "basicSalary" DOUBLE PRECISION NOT NULL,
    "dailySalary" DOUBLE PRECISION NOT NULL,
    "hourlySalary" DOUBLE PRECISION,
    "workDays" INTEGER NOT NULL,
    "actualWorkDays" INTEGER NOT NULL,
    "absentDays" INTEGER NOT NULL DEFAULT 0,
    "lateDays" INTEGER NOT NULL DEFAULT 0,
    "overtimeHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "holidayHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "transportAllowance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "mealAllowance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "housingAllowance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "familyAllowance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "performanceBonus" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "overtimePayment" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "holidayPayment" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "otherAllowances" JSONB,
    "incomeTax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "socialInsurance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "employmentInsurance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "loanDeduction" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lateDeduction" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "absentDeduction" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "otherDeductions" JSONB,
    "grossSalary" DOUBLE PRECISION NOT NULL,
    "totalDeductions" DOUBLE PRECISION NOT NULL,
    "netSalary" DOUBLE PRECISION NOT NULL,
    "taxableIncome" DOUBLE PRECISION NOT NULL,
    "ptkpAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pph21Amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "PayrollStatus" NOT NULL DEFAULT 'DRAFT',
    "calculatedAt" TIMESTAMP(3),
    "calculatedBy" TEXT,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "paymentMethod" TEXT,
    "bankAccount" TEXT,
    "transferReference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payrolls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performance_reviews" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "reviewPeriod" TEXT NOT NULL,
    "reviewType" "ReviewType" NOT NULL,
    "reviewYear" INTEGER NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "startedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "technicalSkills" DOUBLE PRECISION,
    "communication" DOUBLE PRECISION,
    "teamwork" DOUBLE PRECISION,
    "leadership" DOUBLE PRECISION,
    "problemSolving" DOUBLE PRECISION,
    "timeManagement" DOUBLE PRECISION,
    "qualityOfWork" DOUBLE PRECISION,
    "productivity" DOUBLE PRECISION,
    "innovation" DOUBLE PRECISION,
    "customerService" DOUBLE PRECISION,
    "overallScore" DOUBLE PRECISION,
    "overallRating" TEXT,
    "previousGoals" TEXT[],
    "achievedGoals" TEXT[],
    "missedGoals" TEXT[],
    "newGoals" TEXT[],
    "strengths" TEXT[],
    "areasImprovement" TEXT[],
    "trainingNeeds" TEXT[],
    "careerDevelopment" TEXT[],
    "reviewerComments" TEXT,
    "employeeComments" TEXT,
    "selfAssessment" TEXT,
    "developmentPlan" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "isEmployeeSigned" BOOLEAN NOT NULL DEFAULT false,
    "isReviewerSigned" BOOLEAN NOT NULL DEFAULT false,
    "followUpRequired" BOOLEAN NOT NULL DEFAULT false,
    "followUpDate" TIMESTAMP(3),
    "followUpNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "performance_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trainings" (
    "id" TEXT NOT NULL,
    "sppgId" TEXT NOT NULL,
    "trainingCode" TEXT NOT NULL,
    "trainingName" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerName" TEXT,
    "trainerName" TEXT,
    "trainerContact" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "location" TEXT,
    "mode" TEXT NOT NULL,
    "maxParticipants" INTEGER NOT NULL,
    "currentParticipants" INTEGER NOT NULL DEFAULT 0,
    "costPerParticipant" DOUBLE PRECISION,
    "totalBudget" DOUBLE PRECISION,
    "materials" TEXT[],
    "prerequisites" TEXT[],
    "objectives" TEXT[],
    "providesCertificate" BOOLEAN NOT NULL DEFAULT false,
    "certificateName" TEXT,
    "validityPeriod" INTEGER,
    "status" "TrainingStatus" NOT NULL DEFAULT 'PLANNED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trainings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_trainings" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "trainingId" TEXT NOT NULL,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "enrolledBy" TEXT,
    "attended" BOOLEAN NOT NULL DEFAULT false,
    "attendanceRate" DOUBLE PRECISION,
    "preTestScore" DOUBLE PRECISION,
    "postTestScore" DOUBLE PRECISION,
    "finalScore" DOUBLE PRECISION,
    "passed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "certificateUrl" TEXT,
    "certificateNumber" TEXT,
    "feedback" TEXT,
    "rating" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_trainings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disciplinary_actions" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "incidentDate" TIMESTAMP(3) NOT NULL,
    "reportedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reportedBy" TEXT NOT NULL,
    "violationType" TEXT NOT NULL,
    "violationLevel" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "evidenceUrls" TEXT[],
    "investigatedBy" TEXT,
    "investigationNotes" TEXT,
    "witnessStatements" TEXT[],
    "actionType" TEXT NOT NULL,
    "actionDetails" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "followUpRequired" BOOLEAN NOT NULL DEFAULT false,
    "followUpDate" TIMESTAMP(3),
    "followUpNotes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "appealSubmitted" BOOLEAN NOT NULL DEFAULT false,
    "appealDate" TIMESTAMP(3),
    "appealNotes" TEXT,
    "appealDecision" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "disciplinary_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sppg_virtual_accounts" (
    "id" TEXT NOT NULL,
    "sppgId" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "bankCode" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "yayasanName" TEXT NOT NULL,
    "yayasanAddress" TEXT NOT NULL,
    "yayasanPic" TEXT NOT NULL,
    "yayasanPhone" TEXT NOT NULL,
    "yayasanEmail" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "activatedAt" TIMESTAMP(3),
    "deactivatedAt" TIMESTAMP(3),
    "currentBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastUpdatedBalance" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sppg_virtual_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "banper_requests" (
    "id" TEXT NOT NULL,
    "sppgId" TEXT NOT NULL,
    "virtualAccountId" TEXT NOT NULL,
    "requestNumber" TEXT NOT NULL,
    "requestDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "operationalPeriod" TEXT NOT NULL,
    "totalBeneficiaries" INTEGER NOT NULL,
    "beneficiaryBreakdown" JSONB NOT NULL,
    "dailyBudgetPerBeneficiary" DOUBLE PRECISION NOT NULL,
    "operationalDays" INTEGER NOT NULL DEFAULT 12,
    "foodCostTotal" DOUBLE PRECISION NOT NULL,
    "operationalCost" DOUBLE PRECISION NOT NULL,
    "transportCost" DOUBLE PRECISION,
    "utilityCost" DOUBLE PRECISION,
    "staffCost" DOUBLE PRECISION,
    "otherCosts" DOUBLE PRECISION,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "status" "BanperRequestStatus" NOT NULL DEFAULT 'DRAFT',
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "disbursedAt" TIMESTAMP(3),
    "submittedBy" TEXT,
    "reviewedBy" TEXT,
    "approvedBy" TEXT,
    "supportingDocuments" TEXT[],
    "approvalDocuments" TEXT[],
    "requestNotes" TEXT,
    "reviewNotes" TEXT,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "banper_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "banper_transactions" (
    "id" TEXT NOT NULL,
    "sppgId" TEXT NOT NULL,
    "virtualAccountId" TEXT NOT NULL,
    "banperRequestId" TEXT,
    "transactionNumber" TEXT NOT NULL,
    "transactionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transactionType" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "balanceBefore" DOUBLE PRECISION NOT NULL,
    "balanceAfter" DOUBLE PRECISION NOT NULL,
    "purpose" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "referenceNumber" TEXT,
    "receiptNumber" TEXT,
    "receiptUrl" TEXT,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "banper_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sppg_team_members" (
    "id" TEXT NOT NULL,
    "sppgId" TEXT NOT NULL,
    "employeeId" TEXT,
    "fullName" TEXT NOT NULL,
    "idNumber" TEXT,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "address" TEXT NOT NULL,
    "isVolunteer" BOOLEAN NOT NULL DEFAULT true,
    "recruitmentSource" TEXT,
    "role" "SppgRole" NOT NULL,
    "roleDescription" TEXT,
    "teamSize" INTEGER,
    "workStartTime" TEXT,
    "workEndTime" TEXT,
    "workDays" TEXT[],
    "dailyWage" DOUBLE PRECISION,
    "monthlyWage" DOUBLE PRECISION,
    "transportAllowance" DOUBLE PRECISION,
    "mealAllowance" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "joinDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leaveDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sppg_team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "distribution_schedules" (
    "id" TEXT NOT NULL,
    "sppgId" TEXT NOT NULL,
    "distributionDate" TIMESTAMP(3) NOT NULL,
    "wave" "DistributionWave" NOT NULL,
    "targetCategories" "BeneficiaryCategory"[],
    "estimatedBeneficiaries" INTEGER NOT NULL,
    "menuName" TEXT NOT NULL,
    "menuDescription" TEXT,
    "portionSize" DOUBLE PRECISION NOT NULL,
    "totalPortions" INTEGER NOT NULL,
    "packagingType" TEXT NOT NULL,
    "packagingCost" DOUBLE PRECISION,
    "deliveryMethod" TEXT NOT NULL,
    "distributionTeam" TEXT[],
    "vehicleCount" INTEGER,
    "estimatedTravelTime" INTEGER,
    "fuelCost" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "distribution_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "distribution_deliveries" (
    "id" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetName" TEXT NOT NULL,
    "targetAddress" TEXT NOT NULL,
    "targetContact" TEXT,
    "estimatedArrival" TIMESTAMP(3) NOT NULL,
    "actualArrival" TIMESTAMP(3),
    "portionsDelivered" INTEGER NOT NULL,
    "driverName" TEXT NOT NULL,
    "helperNames" TEXT[],
    "vehicleInfo" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ASSIGNED',
    "deliveredBy" TEXT,
    "deliveredAt" TIMESTAMP(3),
    "recipientName" TEXT,
    "recipientSignature" TEXT,
    "deliveryPhoto" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "distribution_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beneficiary_receipts" (
    "id" TEXT NOT NULL,
    "sppgId" TEXT NOT NULL,
    "deliveryId" TEXT,
    "receiptNumber" TEXT NOT NULL,
    "receiptDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "beneficiaryName" TEXT NOT NULL,
    "beneficiaryId" TEXT,
    "beneficiaryCategory" "BeneficiaryCategory" NOT NULL,
    "schoolName" TEXT,
    "className" TEXT,
    "teacherName" TEXT,
    "mealType" TEXT NOT NULL,
    "menuName" TEXT NOT NULL,
    "portionCount" INTEGER NOT NULL,
    "status" "ReceiptStatus" NOT NULL DEFAULT 'PENDING',
    "receivedAt" TIMESTAMP(3),
    "recipientSignature" TEXT,
    "photoProof" TEXT,
    "gpsLocation" TEXT,
    "mealQuality" DOUBLE PRECISION,
    "feedback" TEXT,
    "followUpRequired" BOOLEAN NOT NULL DEFAULT false,
    "followUpNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "beneficiary_receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sppg_operational_reports" (
    "id" TEXT NOT NULL,
    "sppgId" TEXT NOT NULL,
    "reportNumber" TEXT NOT NULL,
    "reportType" "ReportType" NOT NULL,
    "reportPeriod" TEXT NOT NULL,
    "reportDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "content" JSONB NOT NULL,
    "beneficiariesServed" INTEGER,
    "mealsDistributed" INTEGER,
    "totalExpenses" DOUBLE PRECISION,
    "foodSafetyScore" DOUBLE PRECISION,
    "distributionEfficiency" DOUBLE PRECISION,
    "beneficiaryFeedback" DOUBLE PRECISION,
    "budgetAllocated" DOUBLE PRECISION,
    "budgetUtilized" DOUBLE PRECISION,
    "remainingBudget" DOUBLE PRECISION,
    "attachments" TEXT[],
    "photos" TEXT[],
    "preparedBy" TEXT NOT NULL,
    "reviewedBy" TEXT,
    "approvedBy" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "submittedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sppg_operational_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kitchen_equipment" (
    "id" TEXT NOT NULL,
    "sppgId" TEXT NOT NULL,
    "equipmentName" TEXT NOT NULL,
    "equipmentCode" TEXT NOT NULL,
    "category" "EquipmentCategory" NOT NULL,
    "brand" TEXT,
    "model" TEXT,
    "serialNumber" TEXT,
    "condition" "EquipmentCondition" NOT NULL DEFAULT 'GOOD',
    "status" "EquipmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastMaintenance" TIMESTAMP(3),
    "nextMaintenance" TIMESTAMP(3),
    "maintenanceCost" DOUBLE PRECISION,
    "purchaseDate" TIMESTAMP(3),
    "purchaseCost" DOUBLE PRECISION,
    "warranty" TIMESTAMP(3),
    "supplier" TEXT,
    "location" TEXT,
    "usageFrequency" TEXT,
    "operatingHours" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kitchen_equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_maintenance" (
    "id" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "maintenanceDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "maintenanceType" "MaintenanceType" NOT NULL,
    "description" TEXT NOT NULL,
    "cost" DOUBLE PRECISION,
    "performedBy" TEXT NOT NULL,
    "nextSchedule" TIMESTAMP(3),
    "serviceProvider" TEXT,
    "serviceContact" TEXT,
    "partsReplaced" TEXT[],
    "materialsCost" DOUBLE PRECISION,
    "laborCost" DOUBLE PRECISION,
    "conditionBefore" "EquipmentCondition",
    "conditionAfter" "EquipmentCondition",
    "photos" TEXT[],
    "receiptUrl" TEXT,
    "warrantyInfo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipment_maintenance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "utility_monitoring" (
    "id" TEXT NOT NULL,
    "sppgId" TEXT NOT NULL,
    "monitoringDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "monitoringPeriod" TEXT NOT NULL,
    "electricUsage" DOUBLE PRECISION,
    "electricCost" DOUBLE PRECISION,
    "generatorUsage" DOUBLE PRECISION,
    "generatorFuelCost" DOUBLE PRECISION,
    "powerOutages" INTEGER,
    "waterUsage" DOUBLE PRECISION,
    "waterCost" DOUBLE PRECISION,
    "waterQuality" "WaterQualityStatus" NOT NULL,
    "waterTestDate" TIMESTAMP(3),
    "internetStatus" "InternetStatus" NOT NULL,
    "internetCost" DOUBLE PRECISION,
    "downtimeHours" DOUBLE PRECISION,
    "gasUsage" DOUBLE PRECISION,
    "gasCost" DOUBLE PRECISION,
    "gasDeliveries" INTEGER,
    "totalUtilityCost" DOUBLE PRECISION,
    "issues" TEXT[],
    "maintenanceNeeds" TEXT[],
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "utility_monitoring_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "laboratory_tests" (
    "id" TEXT NOT NULL,
    "sppgId" TEXT NOT NULL,
    "testDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "testType" "TestType" NOT NULL,
    "sampleId" TEXT NOT NULL,
    "sampleSource" TEXT NOT NULL,
    "sampleDescription" TEXT,
    "testParameters" TEXT[],
    "testMethod" TEXT,
    "testResults" JSONB NOT NULL,
    "testStatus" "TestStatus" NOT NULL DEFAULT 'PENDING',
    "isCompliant" BOOLEAN,
    "bpomStandard" TEXT,
    "kemenkesStandard" TEXT,
    "complianceNotes" TEXT,
    "laboratoryName" TEXT NOT NULL,
    "labCertNumber" TEXT,
    "testerName" TEXT NOT NULL,
    "testCost" DOUBLE PRECISION,
    "requiresAction" BOOLEAN NOT NULL DEFAULT false,
    "actionTaken" TEXT,
    "retestRequired" BOOLEAN NOT NULL DEFAULT false,
    "retestDate" TIMESTAMP(3),
    "testCertificate" TEXT,
    "testPhotos" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "laboratory_tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "food_safety_certifications" (
    "id" TEXT NOT NULL,
    "sppgId" TEXT NOT NULL,
    "certificationName" TEXT NOT NULL,
    "certifyingBody" TEXT NOT NULL,
    "certificateNumber" TEXT NOT NULL,
    "certificationScope" TEXT,
    "issuedDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "status" "CertificationStatus" NOT NULL DEFAULT 'ACTIVE',
    "renewalRequired" BOOLEAN NOT NULL DEFAULT false,
    "renewalDate" TIMESTAMP(3),
    "renewalCost" DOUBLE PRECISION,
    "renewalStatus" TEXT,
    "assessmentDate" TIMESTAMP(3),
    "assessorName" TEXT,
    "assessmentScore" DOUBLE PRECISION,
    "assessmentNotes" TEXT,
    "requirements" TEXT[],
    "complianceStatus" JSONB NOT NULL,
    "certificateUrl" TEXT,
    "supportingDocs" TEXT[],
    "initialCost" DOUBLE PRECISION,
    "annualFee" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "food_safety_certifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_food_samples" (
    "id" TEXT NOT NULL,
    "sppgId" TEXT NOT NULL,
    "sampleDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "menuName" TEXT NOT NULL,
    "batchNumber" TEXT,
    "portionTested" TEXT,
    "collectedBy" TEXT NOT NULL,
    "collectionTime" TIMESTAMP(3),
    "sampleWeight" DOUBLE PRECISION,
    "storageLocation" TEXT NOT NULL,
    "storageTemp" DOUBLE PRECISION,
    "storageDuration" INTEGER NOT NULL DEFAULT 72,
    "visualCheck" TEXT,
    "smellCheck" TEXT,
    "textureCheck" TEXT,
    "colorCheck" TEXT,
    "overallQuality" DOUBLE PRECISION,
    "acceptabilityScore" DOUBLE PRECISION,
    "testedInLab" BOOLEAN NOT NULL DEFAULT false,
    "labTestId" TEXT,
    "disposalDate" TIMESTAMP(3),
    "disposalMethod" TEXT,
    "disposedBy" TEXT,
    "disposalReason" TEXT,
    "samplePhotos" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_food_samples_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_research" (
    "id" TEXT NOT NULL,
    "sppgId" TEXT NOT NULL,
    "researchTitle" TEXT NOT NULL,
    "researchCode" TEXT,
    "researchType" "ResearchType" NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "objective" TEXT NOT NULL,
    "methodology" TEXT NOT NULL,
    "hypothesis" TEXT,
    "expectedOutcome" TEXT,
    "testStartDate" TIMESTAMP(3) NOT NULL,
    "testEndDate" TIMESTAMP(3),
    "testingStatus" "ResearchStatus" NOT NULL DEFAULT 'PLANNING',
    "testGroupSize" INTEGER,
    "controlGroupSize" INTEGER,
    "targetBeneficiaries" "BeneficiaryCategory"[],
    "targetAgeGroup" TEXT,
    "researchBudget" DOUBLE PRECISION,
    "actualCost" DOUBLE PRECISION,
    "resourcesNeeded" TEXT[],
    "findings" TEXT,
    "recommendations" TEXT,
    "isSuccessful" BOOLEAN,
    "successMetrics" JSONB,
    "implementationDate" TIMESTAMP(3),
    "implementationNotes" TEXT,
    "rolloutPlan" TEXT,
    "approvedBy" TEXT,
    "approvalDate" TIMESTAMP(3),
    "reviewNotes" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_research_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_test_results" (
    "id" TEXT NOT NULL,
    "researchId" TEXT NOT NULL,
    "testDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "testSession" TEXT NOT NULL,
    "menuVariation" TEXT NOT NULL,
    "testGroup" TEXT,
    "nutritionScore" DOUBLE PRECISION,
    "calorieContent" DOUBLE PRECISION,
    "proteinContent" DOUBLE PRECISION,
    "vitaminContent" JSONB,
    "tasteScore" DOUBLE PRECISION,
    "textureScore" DOUBLE PRECISION,
    "aromaScore" DOUBLE PRECISION,
    "appearanceScore" DOUBLE PRECISION,
    "overallScore" DOUBLE PRECISION,
    "acceptanceRate" DOUBLE PRECISION,
    "participantCount" INTEGER,
    "participantFeedback" TEXT[],
    "nutritionistNotes" TEXT,
    "chefNotes" TEXT,
    "qualityControlNotes" TEXT,
    "costPerPortion" DOUBLE PRECISION,
    "ingredientCost" DOUBLE PRECISION,
    "preparationTime" INTEGER,
    "comparedToCurrentMenu" BOOLEAN NOT NULL DEFAULT false,
    "improvementPercentage" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_test_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "local_food_adaptations" (
    "id" TEXT NOT NULL,
    "sppgId" TEXT NOT NULL,
    "ingredientName" TEXT NOT NULL,
    "localName" TEXT NOT NULL,
    "scientificName" TEXT,
    "region" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "caloriesPer100g" DOUBLE PRECISION,
    "proteinPer100g" DOUBLE PRECISION,
    "fatPer100g" DOUBLE PRECISION,
    "carbsPer100g" DOUBLE PRECISION,
    "fiberPer100g" DOUBLE PRECISION,
    "vitaminContent" JSONB,
    "mineralContent" JSONB,
    "avgCostPerKg" DOUBLE PRECISION,
    "availability" TEXT NOT NULL,
    "bestSuppliers" TEXT[],
    "harvestMonths" TEXT[],
    "usageFrequency" TEXT NOT NULL,
    "compatibleMenus" TEXT[],
    "preparationMethods" "PreparationMethod"[],
    "storageRequirements" TEXT,
    "culturalSignificance" TEXT,
    "preparationTradition" TEXT,
    "nutritionalBenefits" TEXT,
    "communityAcceptance" DOUBLE PRECISION,
    "supportLocalFarmers" BOOLEAN NOT NULL DEFAULT false,
    "economicBenefit" TEXT,
    "sustainabilityNotes" TEXT,
    "qualityGrade" TEXT,
    "shelfLife" INTEGER,
    "processingRequired" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "local_food_adaptations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nutrition_consultations" (
    "id" TEXT NOT NULL,
    "sppgId" TEXT NOT NULL,
    "nutritionistId" TEXT NOT NULL,
    "consultationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "consultationType" TEXT NOT NULL,
    "sessionDuration" INTEGER,
    "consultationFee" DOUBLE PRECISION,
    "clientName" TEXT,
    "clientAge" INTEGER,
    "clientGender" TEXT,
    "clientContact" TEXT,
    "clientCondition" TEXT[],
    "currentWeight" DOUBLE PRECISION,
    "currentHeight" DOUBLE PRECISION,
    "bmiCalculation" DOUBLE PRECISION,
    "nutritionStatus" "NutritionStatus",
    "healthHistory" TEXT,
    "currentSymptoms" TEXT[],
    "medications" TEXT[],
    "allergies" TEXT[],
    "currentDiet" TEXT,
    "foodPreferences" TEXT[],
    "foodDislikes" TEXT[],
    "culturalDietaryRestrictions" TEXT[],
    "recommendations" TEXT NOT NULL,
    "dietPlan" TEXT,
    "mealPlanning" JSONB,
    "supplementRecommendations" TEXT[],
    "followUpDate" TIMESTAMP(3),
    "followUpType" TEXT,
    "followUpNotes" TEXT,
    "progressNotes" TEXT[],
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "treatmentOutcome" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nutrition_consultations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nutrition_education" (
    "id" TEXT NOT NULL,
    "sppgId" TEXT NOT NULL,
    "educatorId" TEXT NOT NULL,
    "sessionTitle" TEXT NOT NULL,
    "sessionDate" TIMESTAMP(3) NOT NULL,
    "sessionType" TEXT NOT NULL,
    "targetAudience" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "participantCount" INTEGER NOT NULL,
    "location" TEXT NOT NULL,
    "sessionMode" TEXT NOT NULL,
    "topics" TEXT[],
    "learningObjectives" TEXT[],
    "materials" TEXT[],
    "handouts" TEXT[],
    "activitiesPlanned" TEXT[],
    "cookingDemoIncluded" BOOLEAN NOT NULL DEFAULT false,
    "samplingProvided" BOOLEAN NOT NULL DEFAULT false,
    "participantFeedback" DOUBLE PRECISION,
    "knowledgePreTest" DOUBLE PRECISION,
    "knowledgePostTest" DOUBLE PRECISION,
    "skillsDemonstration" DOUBLE PRECISION,
    "messageClarity" DOUBLE PRECISION,
    "culturalRelevance" DOUBLE PRECISION,
    "practicalApplicability" DOUBLE PRECISION,
    "followUpRequired" BOOLEAN NOT NULL DEFAULT false,
    "followUpPlanned" TIMESTAMP(3),
    "behaviorChangeExpected" TEXT[],
    "impactMeasurement" TEXT,
    "budgetUsed" DOUBLE PRECISION,
    "materialsNeeded" TEXT[],
    "equipmentNeeded" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nutrition_education_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_optimizations" (
    "id" TEXT NOT NULL,
    "sppgId" TEXT NOT NULL,
    "optimizationTitle" TEXT NOT NULL,
    "optimizationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "targetMetric" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "currentCostPerPortion" DOUBLE PRECISION,
    "currentPreparationTime" INTEGER,
    "currentWastePercentage" DOUBLE PRECISION,
    "currentQualityScore" DOUBLE PRECISION,
    "currentNutritionDensity" DOUBLE PRECISION,
    "currentEnergyUsage" DOUBLE PRECISION,
    "targetCostPerPortion" DOUBLE PRECISION,
    "targetPreparationTime" INTEGER,
    "targetWastePercentage" DOUBLE PRECISION,
    "targetQualityScore" DOUBLE PRECISION,
    "targetNutritionDensity" DOUBLE PRECISION,
    "targetEnergyUsage" DOUBLE PRECISION,
    "strategyDescription" TEXT NOT NULL,
    "implementationSteps" TEXT[],
    "resourcesRequired" TEXT[],
    "estimatedInvestment" DOUBLE PRECISION,
    "expectedSavings" DOUBLE PRECISION,
    "implementationStart" TIMESTAMP(3),
    "implementationEnd" TIMESTAMP(3),
    "milestones" JSONB,
    "actualCostPerPortion" DOUBLE PRECISION,
    "actualPreparationTime" INTEGER,
    "actualWastePercentage" DOUBLE PRECISION,
    "actualQualityScore" DOUBLE PRECISION,
    "actualNutritionDensity" DOUBLE PRECISION,
    "actualEnergyUsage" DOUBLE PRECISION,
    "isSuccessful" BOOLEAN,
    "successPercentage" DOUBLE PRECISION,
    "costSavingsAchieved" DOUBLE PRECISION,
    "lessonsLearned" TEXT,
    "recommendationsForFuture" TEXT[],
    "scalabilityAssessment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "production_optimizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "waste_management" (
    "id" TEXT NOT NULL,
    "sppgId" TEXT NOT NULL,
    "wasteDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "wasteType" TEXT NOT NULL,
    "wasteCategory" TEXT,
    "wasteWeight" DOUBLE PRECISION NOT NULL,
    "wasteVolume" DOUBLE PRECISION,
    "containerCount" INTEGER,
    "wasteSource" TEXT NOT NULL,
    "sourceSpecific" TEXT,
    "wasteReason" TEXT,
    "responsibleArea" TEXT,
    "ingredientValue" DOUBLE PRECISION,
    "disposalCost" DOUBLE PRECISION,
    "laborCost" DOUBLE PRECISION,
    "disposalMethod" TEXT NOT NULL,
    "disposalLocation" TEXT,
    "disposalPartner" TEXT,
    "disposalDate" TIMESTAMP(3),
    "carbonFootprint" DOUBLE PRECISION,
    "waterImpact" DOUBLE PRECISION,
    "preventionActions" TEXT[],
    "reductionTarget" DOUBLE PRECISION,
    "alternativeUses" TEXT[],
    "processChanges" TEXT[],
    "trainingNeeds" TEXT[],
    "equipmentNeeds" TEXT[],
    "isRecurringIssue" BOOLEAN NOT NULL DEFAULT false,
    "trendAnalysis" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "waste_management_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performance_analytics" (
    "id" TEXT NOT NULL,
    "sppgId" TEXT NOT NULL,
    "analysisDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "analysisType" "AnalyticsType" NOT NULL,
    "analysisPeriod" TEXT NOT NULL,
    "dataSourceRange" TEXT NOT NULL,
    "costEfficiency" DOUBLE PRECISION,
    "timeEfficiency" DOUBLE PRECISION,
    "qualityScore" DOUBLE PRECISION,
    "wastagePercentage" DOUBLE PRECISION,
    "nutritionCompliance" DOUBLE PRECISION,
    "energyEfficiency" DOUBLE PRECISION,
    "totalCost" DOUBLE PRECISION,
    "costBreakdown" JSONB,
    "profitabilityScore" DOUBLE PRECISION,
    "budgetVariance" DOUBLE PRECISION,
    "productivityRate" DOUBLE PRECISION,
    "equipmentUtilization" DOUBLE PRECISION,
    "staffEfficiency" DOUBLE PRECISION,
    "distributionEfficiency" DOUBLE PRECISION,
    "customerSatisfaction" DOUBLE PRECISION,
    "nutritionAccuracy" DOUBLE PRECISION,
    "foodSafetyScore" DOUBLE PRECISION,
    "costTrend" "TrendDirection" NOT NULL,
    "qualityTrend" "TrendDirection" NOT NULL,
    "efficiencyTrend" "TrendDirection" NOT NULL,
    "demandTrend" "TrendDirection" NOT NULL,
    "predictedCost" DOUBLE PRECISION,
    "predictedDemand" INTEGER,
    "predictedChallenges" TEXT[],
    "riskFactors" TEXT[],
    "opportunityAreas" TEXT[],
    "industryBenchmark" DOUBLE PRECISION,
    "regionalAverage" DOUBLE PRECISION,
    "performanceGap" DOUBLE PRECISION,
    "recommendations" TEXT[],
    "actionItems" TEXT[],
    "priorityActions" TEXT[],
    "quickWins" TEXT[],
    "dataCompleteness" DOUBLE PRECISION,
    "confidenceLevel" DOUBLE PRECISION,
    "dataQualityNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "performance_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sppg_benchmarking" (
    "id" TEXT NOT NULL,
    "sppgId" TEXT NOT NULL,
    "benchmarkDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "compareType" "BenchmarkType" NOT NULL,
    "benchmarkScope" TEXT,
    "comparisonGroup" TEXT,
    "comparisonSppgCount" INTEGER,
    "dataValidityPeriod" TEXT NOT NULL,
    "ourCostPerPortion" DOUBLE PRECISION NOT NULL,
    "benchmarkCostPerPortion" DOUBLE PRECISION NOT NULL,
    "costPerformanceRatio" DOUBLE PRECISION,
    "ourQualityScore" DOUBLE PRECISION NOT NULL,
    "benchmarkQualityScore" DOUBLE PRECISION NOT NULL,
    "qualityPerformanceRatio" DOUBLE PRECISION,
    "ourEfficiencyScore" DOUBLE PRECISION NOT NULL,
    "benchmarkEfficiencyScore" DOUBLE PRECISION NOT NULL,
    "efficiencyPerformanceRatio" DOUBLE PRECISION,
    "ourBeneficiaryCount" INTEGER,
    "benchmarkBeneficiaryCount" INTEGER,
    "ourNutritionCompliance" DOUBLE PRECISION,
    "benchmarkNutritionCompliance" DOUBLE PRECISION,
    "ourWastePercentage" DOUBLE PRECISION,
    "benchmarkWastePercentage" DOUBLE PRECISION,
    "regionalRanking" INTEGER,
    "nationalRanking" INTEGER,
    "categoryRanking" INTEGER,
    "overallScore" DOUBLE PRECISION,
    "costPercentile" DOUBLE PRECISION,
    "qualityPercentile" DOUBLE PRECISION,
    "efficiencyPercentile" DOUBLE PRECISION,
    "strengthAreas" TEXT[],
    "improvementAreas" TEXT[],
    "criticalGaps" TEXT[],
    "opportunityAreas" TEXT[],
    "topPerformerPractices" TEXT[],
    "applicablePractices" TEXT[],
    "innovativeSolutions" TEXT[],
    "actionPlan" TEXT[],
    "priorityImprovements" TEXT[],
    "resourceRequirements" TEXT[],
    "timelineEstimate" TEXT,
    "nextBenchmarkDate" TIMESTAMP(3),
    "improvementTargets" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sppg_benchmarking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_permissions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "permission" "PermissionType" NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT,
    "accessLevel" "AccessLevel" NOT NULL DEFAULT 'READ_ONLY',
    "sppgId" TEXT,
    "moduleAccess" TEXT[],
    "grantedBy" TEXT NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "conditions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT,
    "deviceInfo" JSONB,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3),
    "sessionType" TEXT NOT NULL DEFAULT 'WEB',
    "isValid" BOOLEAN NOT NULL DEFAULT true,
    "terminatedBy" TEXT,
    "terminationReason" TEXT,
    "pagesVisited" TEXT[],
    "actionsPerformed" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_activities" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "activityType" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resourceType" "EntityType",
    "resourceId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "sessionId" TEXT,
    "beforeData" JSONB,
    "afterData" JSONB,
    "searchQuery" TEXT,
    "filters" JSONB,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "errorMessage" TEXT,
    "responseTime" INTEGER,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_audit_logs" (
    "id" TEXT NOT NULL,
    "userId" VARCHAR(50),
    "sppgId" VARCHAR(50),
    "action" "AuditAction" NOT NULL,
    "entityType" "EntityType" NOT NULL,
    "entityId" VARCHAR(50) NOT NULL,
    "resourcePath" VARCHAR(500),
    "oldValues" JSONB,
    "newValues" JSONB,
    "changes" JSONB,
    "metadata" JSONB,
    "ipAddress" INET,
    "userAgent" TEXT,
    "sessionId" VARCHAR(255),
    "requestId" VARCHAR(100),
    "geoLocation" JSONB,
    "deviceId" VARCHAR(255),
    "browserFingerprint" VARCHAR(255),
    "authMethod" VARCHAR(50),
    "authProvider" VARCHAR(50),
    "tokenUsed" VARCHAR(100),
    "riskLevel" VARCHAR(10) NOT NULL DEFAULT 'LOW',
    "riskScore" INTEGER NOT NULL DEFAULT 0,
    "threatIndicators" TEXT[],
    "flagged" BOOLEAN NOT NULL DEFAULT false,
    "reviewRequired" BOOLEAN NOT NULL DEFAULT false,
    "autoBlocked" BOOLEAN NOT NULL DEFAULT false,
    "retentionPolicy" VARCHAR(50),
    "isPersonalData" BOOLEAN NOT NULL DEFAULT false,
    "dataClassification" VARCHAR(20) NOT NULL DEFAULT 'INTERNAL',
    "processingTime" INTEGER DEFAULT 0,
    "responseCode" VARCHAR(10),
    "errorMessage" TEXT,
    "timestamp" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permission_matrix" (
    "id" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "permission" "PermissionType" NOT NULL,
    "accessLevel" "AccessLevel" NOT NULL,
    "moduleScope" TEXT[],
    "conditions" JSONB,
    "description" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "lastModifiedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "role_permission_matrix_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_demo_requests" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "company" TEXT,
    "position" TEXT,
    "demoType" TEXT NOT NULL DEFAULT 'STANDARD',
    "requestMessage" TEXT,
    "interestedFeatures" TEXT[],
    "preferredDate" TIMESTAMP(3),
    "preferredTime" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Jakarta',
    "demoDuration" INTEGER NOT NULL DEFAULT 60,
    "demoMode" TEXT NOT NULL DEFAULT 'ONLINE',
    "status" "UserDemoStatus" NOT NULL DEFAULT 'REQUESTED',
    "scheduledDate" TIMESTAMP(3),
    "actualDate" TIMESTAMP(3),
    "assignedTo" TEXT,
    "assignedAt" TIMESTAMP(3),
    "followUpRequired" BOOLEAN NOT NULL DEFAULT true,
    "followUpDate" TIMESTAMP(3),
    "conversionProbability" DOUBLE PRECISION,
    "attendanceStatus" TEXT,
    "feedbackScore" DOUBLE PRECISION,
    "feedback" TEXT,
    "nextSteps" TEXT[],
    "isConverted" BOOLEAN NOT NULL DEFAULT false,
    "convertedAt" TIMESTAMP(3),
    "sppgId" TEXT,
    "emailsSent" INTEGER NOT NULL DEFAULT 0,
    "callsMade" INTEGER NOT NULL DEFAULT 0,
    "lastContactDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_demo_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_onboarding" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentStep" TEXT NOT NULL DEFAULT 'PROFILE_SETUP',
    "completedSteps" TEXT[],
    "totalSteps" INTEGER NOT NULL DEFAULT 10,
    "progressPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "trainingModules" JSONB,
    "trainingScore" DOUBLE PRECISION,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "estimatedCompletion" TIMESTAMP(3),
    "assignedMentor" TEXT,
    "helpRequests" INTEGER NOT NULL DEFAULT 0,
    "supportTickets" TEXT[],
    "satisfactionScore" DOUBLE PRECISION,
    "feedback" TEXT,
    "improvementSuggestions" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_onboarding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provinces" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(2) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "region" "IndonesiaRegion" NOT NULL,
    "timezone" "Timezone" NOT NULL,

    CONSTRAINT "provinces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regencies" (
    "id" TEXT NOT NULL,
    "provinceId" VARCHAR(50) NOT NULL,
    "code" VARCHAR(4) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "type" "RegencyType" NOT NULL,

    CONSTRAINT "regencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "districts" (
    "id" TEXT NOT NULL,
    "regencyId" VARCHAR(50) NOT NULL,
    "code" VARCHAR(6) NOT NULL,
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "districts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "villages" (
    "id" TEXT NOT NULL,
    "districtId" VARCHAR(50) NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "type" "VillageType" NOT NULL,
    "postalCode" VARCHAR(5),

    CONSTRAINT "villages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "landing_pages" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "heroSection" JSONB NOT NULL,
    "featuresSection" JSONB NOT NULL,
    "pricingSection" JSONB NOT NULL,
    "testimonialSection" JSONB NOT NULL,
    "faqSection" JSONB NOT NULL,
    "keywords" TEXT[],
    "ogImage" TEXT,
    "canonicalUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "template" "LandingPageTemplate" NOT NULL DEFAULT 'DEFAULT',
    "targetAudience" "TargetAudience" NOT NULL DEFAULT 'GENERAL',
    "variantOf" TEXT,
    "variantWeight" INTEGER NOT NULL DEFAULT 100,
    "views" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "conversionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "landing_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ab_tests" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "hypothesis" TEXT,
    "landingPageId" TEXT NOT NULL,
    "targetMetric" "ABTestMetric" NOT NULL DEFAULT 'CONVERSION_RATE',
    "confidenceLevel" DOUBLE PRECISION NOT NULL DEFAULT 0.95,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "duration" INTEGER,
    "status" "ABTestStatus" NOT NULL DEFAULT 'DRAFT',
    "winner" TEXT,
    "statisticalPower" DOUBLE PRECISION,
    "pValue" DOUBLE PRECISION,
    "conversionLift" DOUBLE PRECISION,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ab_tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ab_test_variants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "trafficPercentage" INTEGER NOT NULL DEFAULT 50,
    "isControl" BOOLEAN NOT NULL DEFAULT false,
    "content" JSONB NOT NULL,
    "testId" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "bounces" INTEGER NOT NULL DEFAULT 0,
    "conversionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "bounceRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "engagementRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ab_test_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_posts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "featuredImage" TEXT,
    "gallery" TEXT[],
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "keywords" TEXT[],
    "category" "BlogCategory" NOT NULL,
    "tags" TEXT[],
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "scheduledAt" TIMESTAMP(3),
    "views" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_comments" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "website" TEXT,
    "status" "CommentStatus" NOT NULL DEFAULT 'PENDING',
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "blogPostId" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blog_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "testimonials" (
    "id" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerTitle" TEXT,
    "organizationName" TEXT NOT NULL,
    "organizationType" "OrganizationType" NOT NULL,
    "content" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "customerPhoto" TEXT,
    "organizationLogo" TEXT,
    "videoUrl" TEXT,
    "isCaseStudy" BOOLEAN NOT NULL DEFAULT false,
    "metricsImproved" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "displayLocation" TEXT[],
    "sppgId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "testimonials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_studies" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "organizationName" TEXT NOT NULL,
    "organizationType" "OrganizationType" NOT NULL,
    "location" TEXT,
    "challenge" TEXT NOT NULL,
    "solution" TEXT NOT NULL,
    "implementation" TEXT NOT NULL,
    "results" TEXT NOT NULL,
    "keyMetrics" JSONB NOT NULL,
    "beforeAfter" JSONB NOT NULL,
    "featuredImage" TEXT,
    "gallery" TEXT[],
    "videoUrl" TEXT,
    "metaDescription" TEXT,
    "keywords" TEXT[],
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "sppgId" TEXT,
    "testimonialId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "case_studies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faqs" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "category" "FAQCategory" NOT NULL,
    "tags" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "helpful" INTEGER NOT NULL DEFAULT 0,
    "notHelpful" INTEGER NOT NULL DEFAULT 0,
    "relatedFAQs" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "help_articles" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "category" "HelpCategory" NOT NULL,
    "difficulty" "DifficultyLevel" NOT NULL DEFAULT 'BEGINNER',
    "tags" TEXT[],
    "metaDescription" TEXT,
    "keywords" TEXT[],
    "searchKeywords" TEXT[],
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "views" INTEGER NOT NULL DEFAULT 0,
    "helpful" INTEGER NOT NULL DEFAULT 0,
    "notHelpful" INTEGER NOT NULL DEFAULT 0,
    "avgReadTime" INTEGER,
    "relatedArticles" TEXT[],
    "faqs" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "help_articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_captures" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "organizationName" TEXT,
    "position" TEXT,
    "source" "LeadSource" NOT NULL,
    "medium" TEXT,
    "campaign" TEXT,
    "content" TEXT,
    "term" TEXT,
    "formType" "LeadFormType" NOT NULL,
    "formLocation" TEXT NOT NULL,
    "leadMagnet" TEXT,
    "organizationType" "OrganizationType",
    "estimatedUsers" INTEGER,
    "estimatedBudget" DOUBLE PRECISION,
    "timeline" TEXT,
    "specificNeeds" TEXT[],
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "score" INTEGER NOT NULL DEFAULT 0,
    "isQualified" BOOLEAN NOT NULL DEFAULT false,
    "assignedTo" TEXT,
    "lastContactedAt" TIMESTAMP(3),
    "nextFollowUpAt" TIMESTAMP(3),
    "notes" TEXT,
    "convertedAt" TIMESTAMP(3),
    "convertedToDemo" BOOLEAN NOT NULL DEFAULT false,
    "demoRequestId" TEXT,
    "convertedToCustomer" BOOLEAN NOT NULL DEFAULT false,
    "sppgId" TEXT,
    "landingPageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lead_captures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "image_folders" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "parentId" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "image_folders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "image_files" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "alt" TEXT,
    "description" TEXT,
    "size" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "tags" TEXT[],
    "folderId" TEXT,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" TIMESTAMP(3),
    "uploadedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "image_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "TemplateCategory" NOT NULL DEFAULT 'HEALTHCARE',
    "content" JSONB NOT NULL,
    "settings" JSONB NOT NULL,
    "preview" TEXT,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "features" TEXT[],
    "sections" TEXT[],
    "tags" TEXT[],
    "keywords" TEXT[],
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_analytics" (
    "id" TEXT NOT NULL,
    "pageType" "PageType" NOT NULL,
    "pageId" TEXT,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "date" DATE NOT NULL,
    "sessions" INTEGER NOT NULL DEFAULT 0,
    "pageviews" INTEGER NOT NULL DEFAULT 0,
    "uniqueVisitors" INTEGER NOT NULL DEFAULT 0,
    "bounceRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgSessionTime" INTEGER NOT NULL DEFAULT 0,
    "organicTraffic" INTEGER NOT NULL DEFAULT 0,
    "directTraffic" INTEGER NOT NULL DEFAULT 0,
    "referralTraffic" INTEGER NOT NULL DEFAULT 0,
    "socialTraffic" INTEGER NOT NULL DEFAULT 0,
    "paidTraffic" INTEGER NOT NULL DEFAULT 0,
    "leadCaptures" INTEGER NOT NULL DEFAULT 0,
    "demoRequests" INTEGER NOT NULL DEFAULT 0,
    "conversionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "timeOnPage" INTEGER NOT NULL DEFAULT 0,
    "scrollDepth" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "exitRate" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "page_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketing_campaigns" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "CampaignType" NOT NULL,
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "budget" DOUBLE PRECISION,
    "targetAudience" JSONB NOT NULL,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT NOT NULL,
    "utmContent" TEXT,
    "utmTerm" TEXT,
    "primaryGoal" "CampaignGoal" NOT NULL,
    "targetLeads" INTEGER,
    "targetConversions" INTEGER,
    "targetRevenue" DOUBLE PRECISION,
    "totalSpend" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalLeads" INTEGER NOT NULL DEFAULT 0,
    "totalConversions" INTEGER NOT NULL DEFAULT 0,
    "totalRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "costPerLead" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "costPerAcquisition" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "returnOnInvestment" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketing_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "demo_requests" (
    "id" TEXT NOT NULL,
    "organizationName" TEXT NOT NULL,
    "picName" TEXT NOT NULL,
    "picEmail" TEXT NOT NULL,
    "picPhone" TEXT NOT NULL,
    "picWhatsapp" TEXT,
    "picPosition" TEXT,
    "organizationType" "OrganizationType" NOT NULL DEFAULT 'YAYASAN',
    "targetBeneficiaries" INTEGER,
    "operationalArea" TEXT,
    "currentSystem" TEXT,
    "currentChallenges" TEXT[],
    "expectedGoals" TEXT[],
    "demoType" "DemoType" NOT NULL DEFAULT 'STANDARD',
    "requestedFeatures" TEXT[],
    "specialRequirements" TEXT,
    "preferredStartDate" TIMESTAMP(3),
    "estimatedDuration" INTEGER NOT NULL DEFAULT 14,
    "status" "DemoRequestStatus" NOT NULL DEFAULT 'SUBMITTED',
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "demoSppgId" TEXT,
    "demoCreatedAt" TIMESTAMP(3),
    "demoExpiresAt" TIMESTAMP(3),
    "isConverted" BOOLEAN NOT NULL DEFAULT false,
    "convertedAt" TIMESTAMP(3),
    "convertedSppgId" TEXT,
    "lastContactAt" TIMESTAMP(3),
    "followUpRequired" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "demo_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "demo_analytics" (
    "id" TEXT NOT NULL,
    "sppgId" TEXT NOT NULL,
    "loginCount" INTEGER NOT NULL DEFAULT 0,
    "featuresUsed" TEXT[],
    "beneficiariesAdded" INTEGER NOT NULL DEFAULT 0,
    "menusCreated" INTEGER NOT NULL DEFAULT 0,
    "procurementsCreated" INTEGER NOT NULL DEFAULT 0,
    "distributionsCreated" INTEGER NOT NULL DEFAULT 0,
    "sessionDuration" INTEGER[],
    "lastActiveDate" TIMESTAMP(3),
    "totalActiveTime" INTEGER NOT NULL DEFAULT 0,
    "averageSessionDuration" DOUBLE PRECISION,
    "menuPlanningUsage" JSONB,
    "procurementUsage" JSONB,
    "distributionUsage" JSONB,
    "reportingUsage" JSONB,
    "upgradePromptShown" INTEGER NOT NULL DEFAULT 0,
    "pricingPageViews" INTEGER NOT NULL DEFAULT 0,
    "helpDocumentsViewed" TEXT[],
    "supportTicketsCreated" INTEGER NOT NULL DEFAULT 0,
    "engagementScore" DOUBLE PRECISION,
    "conversionProbability" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "demo_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_analytics" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "totalUsers" INTEGER NOT NULL DEFAULT 0,
    "activeUsers" INTEGER NOT NULL DEFAULT 0,
    "newSignups" INTEGER NOT NULL DEFAULT 0,
    "churnedUsers" INTEGER NOT NULL DEFAULT 0,
    "totalSppg" INTEGER NOT NULL DEFAULT 0,
    "activeSppg" INTEGER NOT NULL DEFAULT 0,
    "newSppg" INTEGER NOT NULL DEFAULT 0,
    "totalRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "newRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "churnedRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalSessions" INTEGER NOT NULL DEFAULT 0,
    "avgSessionTime" INTEGER NOT NULL DEFAULT 0,
    "totalApiCalls" INTEGER NOT NULL DEFAULT 0,
    "ticketsCreated" INTEGER NOT NULL DEFAULT 0,
    "ticketsResolved" INTEGER NOT NULL DEFAULT 0,
    "avgResolutionTime" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "platform_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_configurations" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "valueType" "ConfigValueType" NOT NULL DEFAULT 'STRING',
    "category" "ConfigCategory" NOT NULL,
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "validationRule" TEXT,
    "defaultValue" TEXT,
    "accessLevel" "ConfigAccessLevel" NOT NULL DEFAULT 'ADMIN',
    "lastModifiedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature_flags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "rolloutPercent" INTEGER NOT NULL DEFAULT 0,
    "targetTiers" "SubscriptionTier"[],
    "targetSppgIds" TEXT[],
    "environment" "Environment" NOT NULL DEFAULT 'PRODUCTION',
    "createdBy" TEXT NOT NULL,
    "enabledAt" TIMESTAMP(3),
    "disabledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature_usages" (
    "id" TEXT NOT NULL,
    "featureFlagId" TEXT NOT NULL,
    "sppgId" TEXT,
    "userId" TEXT,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "context" JSONB,

    CONSTRAINT "feature_usages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "demo_features" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "demo_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "demo_challenges" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "severity" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "demo_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "demo_goals" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "impact" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "demo_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback_stakeholders" (
    "id" TEXT NOT NULL,
    "sppgId" TEXT NOT NULL,
    "stakeholderType" "StakeholderType" NOT NULL,
    "stakeholderGroup" "StakeholderGroup" NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "anonymousId" TEXT,
    "schoolId" TEXT,
    "programId" TEXT,
    "beneficiaryId" TEXT,
    "preferredLanguage" TEXT NOT NULL DEFAULT 'id',
    "communicationChannel" TEXT NOT NULL DEFAULT 'web',
    "consentGiven" BOOLEAN NOT NULL DEFAULT false,
    "dataRetentionConsent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feedback_stakeholders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback" (
    "id" TEXT NOT NULL,
    "sppgId" TEXT NOT NULL,
    "stakeholderId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "feedbackType" "FeedbackType" NOT NULL,
    "category" "FeedbackCategory" NOT NULL,
    "subcategory" TEXT,
    "programId" TEXT,
    "menuId" TEXT,
    "distributionId" TEXT,
    "eventId" TEXT,
    "overallRating" INTEGER,
    "specificRatings" JSONB,
    "satisfactionScore" INTEGER,
    "recommendationLikelihood" INTEGER,
    "attachments" TEXT[],
    "photos" TEXT[],
    "videos" TEXT[],
    "audioRecording" TEXT,
    "aiAnalysis" JSONB,
    "sentimentScore" DOUBLE PRECISION,
    "emotionProfile" JSONB,
    "keyTopics" TEXT[],
    "urgencyScore" INTEGER NOT NULL DEFAULT 5,
    "complexityScore" INTEGER NOT NULL DEFAULT 5,
    "status" "FeedbackStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "FeedbackPriority" NOT NULL DEFAULT 'MEDIUM',
    "assignedTo" TEXT,
    "assignedDepartment" TEXT,
    "slaDeadline" TIMESTAMP(3),
    "escalationLevel" INTEGER NOT NULL DEFAULT 0,
    "responseRequired" BOOLEAN NOT NULL DEFAULT true,
    "acknowledgedAt" TIMESTAMP(3),
    "firstResponseAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "internalNotes" TEXT,
    "publicResponse" TEXT,
    "responseTemplate" TEXT,
    "resolutionSummary" TEXT,
    "actionItems" JSONB,
    "qualityScore" DOUBLE PRECISION,
    "complianceFlags" TEXT[],
    "reviewRequired" BOOLEAN NOT NULL DEFAULT false,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "approvalStatus" "ResponseStatus" NOT NULL DEFAULT 'DRAFT',
    "followUpScheduled" TIMESTAMP(3),
    "followUpCompleted" BOOLEAN NOT NULL DEFAULT false,
    "satisfactionAfter" INTEGER,
    "closureConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "reopenCount" INTEGER NOT NULL DEFAULT 0,
    "sourceChannel" TEXT NOT NULL DEFAULT 'web',
    "sourceLocation" TEXT,
    "deviceInfo" JSONB,
    "referenceNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback_responses" (
    "id" TEXT NOT NULL,
    "feedbackId" TEXT NOT NULL,
    "responseType" "ResponseType" NOT NULL,
    "content" TEXT NOT NULL,
    "responseMethod" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "authorId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorRole" TEXT NOT NULL,
    "departmentId" TEXT,
    "status" "ResponseStatus" NOT NULL DEFAULT 'DRAFT',
    "reviewRequired" BOOLEAN NOT NULL DEFAULT false,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectedReason" TEXT,
    "sentAt" TIMESTAMP(3),
    "deliveryStatus" "DeliveryStatus" NOT NULL DEFAULT 'SCHEDULED',
    "readAt" TIMESTAMP(3),
    "acknowledgedAt" TIMESTAMP(3),
    "bounced" BOOLEAN NOT NULL DEFAULT false,
    "qualityScore" DOUBLE PRECISION,
    "effectiveness" INTEGER,
    "tone" TEXT,
    "customerRating" INTEGER,
    "templateId" TEXT,
    "isAutomated" BOOLEAN NOT NULL DEFAULT false,
    "aiAssisted" BOOLEAN NOT NULL DEFAULT false,
    "aiConfidence" DOUBLE PRECISION,
    "attachments" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feedback_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback_escalations" (
    "id" TEXT NOT NULL,
    "feedbackId" TEXT NOT NULL,
    "escalationLevel" INTEGER NOT NULL,
    "escalationReason" TEXT NOT NULL,
    "escalationType" "EscalationType" NOT NULL,
    "isAutomatic" BOOLEAN NOT NULL DEFAULT false,
    "fromUserId" TEXT,
    "fromUserName" TEXT,
    "fromDepartment" TEXT,
    "toUserId" TEXT NOT NULL,
    "toUserName" TEXT NOT NULL,
    "toDepartment" TEXT,
    "managerNotified" BOOLEAN NOT NULL DEFAULT false,
    "escalatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expectedResolution" TIMESTAMP(3),
    "actualResolution" TIMESTAMP(3),
    "slaBreached" BOOLEAN NOT NULL DEFAULT false,
    "breachDuration" INTEGER,
    "escalationNotes" TEXT NOT NULL,
    "urgencyJustification" TEXT,
    "businessImpact" TEXT,
    "customerImpact" TEXT,
    "status" "EscalationStatus" NOT NULL DEFAULT 'ACTIVE',
    "resolvedBy" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "resolutionNotes" TEXT,
    "satisfactory" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feedback_escalations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback_activities" (
    "id" TEXT NOT NULL,
    "feedbackId" TEXT NOT NULL,
    "activityType" "ActivityType" NOT NULL,
    "description" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "fieldChanged" TEXT,
    "performedBy" TEXT,
    "performedByName" TEXT,
    "performedByRole" TEXT,
    "systemGenerated" BOOLEAN NOT NULL DEFAULT false,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "sessionId" TEXT,
    "additionalData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedback_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback_analytics" (
    "id" TEXT NOT NULL,
    "sppgId" TEXT NOT NULL,
    "period" "AnalyticsPeriod" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "stakeholderType" "StakeholderType",
    "department" TEXT,
    "programId" TEXT,
    "category" "FeedbackCategory",
    "totalFeedback" INTEGER NOT NULL DEFAULT 0,
    "newFeedback" INTEGER NOT NULL DEFAULT 0,
    "inProgressFeedback" INTEGER NOT NULL DEFAULT 0,
    "resolvedFeedback" INTEGER NOT NULL DEFAULT 0,
    "escalatedFeedback" INTEGER NOT NULL DEFAULT 0,
    "closedFeedback" INTEGER NOT NULL DEFAULT 0,
    "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "satisfactionScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sentimentScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "qualityScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "averageResponseTime" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "averageResolutionTime" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "slaComplianceRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "firstContactResolution" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "escalationRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reopenRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "categoryDistribution" JSONB NOT NULL,
    "priorityDistribution" JSONB NOT NULL,
    "channelDistribution" JSONB NOT NULL,
    "sourceDistribution" JSONB NOT NULL,
    "trendDirection" "TrendDirection",
    "trendMagnitude" DOUBLE PRECISION,
    "seasonalityFactors" JSONB,
    "volatilityIndex" DOUBLE PRECISION,
    "forecastNextPeriod" JSONB,
    "riskIndicators" TEXT[],
    "recommendations" JSONB,
    "confidenceLevel" DOUBLE PRECISION,
    "benchmarkComparison" JSONB,
    "historicalComparison" JSONB,
    "targetAchievement" JSONB,
    "industryPosition" TEXT,
    "avgStaffResponseTime" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "staffProductivity" JSONB,
    "trainingNeeds" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feedback_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback_slas" (
    "id" TEXT NOT NULL,
    "sppgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "feedbackType" "FeedbackType",
    "priorityLevel" "FeedbackPriority",
    "stakeholderType" "StakeholderType",
    "category" "FeedbackCategory",
    "urgencyThreshold" INTEGER,
    "acknowledgmentTime" INTEGER NOT NULL,
    "responseTime" INTEGER NOT NULL,
    "resolutionTime" INTEGER NOT NULL,
    "closureTime" INTEGER,
    "autoEscalationEnabled" BOOLEAN NOT NULL DEFAULT false,
    "escalationTriggers" JSONB NOT NULL,
    "escalationMatrix" JSONB NOT NULL,
    "minimumQualityScore" DOUBLE PRECISION,
    "reviewRequiredAbove" INTEGER,
    "managerApprovalNeeded" BOOLEAN NOT NULL DEFAULT false,
    "businessHoursOnly" BOOLEAN NOT NULL DEFAULT true,
    "businessStartHour" INTEGER NOT NULL DEFAULT 8,
    "businessEndHour" INTEGER NOT NULL DEFAULT 17,
    "excludeWeekends" BOOLEAN NOT NULL DEFAULT true,
    "holidayExclusions" TEXT[],
    "reminderIntervals" INTEGER[],
    "notifyManagement" BOOLEAN NOT NULL DEFAULT false,
    "criticalAlertThreshold" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feedback_slas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback_templates" (
    "id" TEXT NOT NULL,
    "sppgId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isGlobal" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "subject" TEXT,
    "content" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'id',
    "feedbackType" "FeedbackType",
    "category" "FeedbackCategory",
    "stakeholderType" "StakeholderType",
    "tags" TEXT[],
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "successRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastUsed" TIMESTAMP(3),
    "version" TEXT NOT NULL DEFAULT '1.0',
    "parentTemplateId" TEXT,
    "isDeprecated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feedback_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beneficiary_feedback_legacy" (
    "id" TEXT NOT NULL,
    "sppgId" TEXT NOT NULL,
    "programId" TEXT,
    "beneficiaryId" TEXT,
    "beneficiaryName" TEXT NOT NULL,
    "beneficiaryType" "BeneficiaryType" NOT NULL,
    "feedbackType" "FeedbackType" NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "rating" INTEGER,
    "status" "FeedbackStatus" NOT NULL DEFAULT 'PENDING',
    "menuId" TEXT,
    "distributionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "beneficiary_feedback_legacy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "parentId" TEXT,
    "sppgId" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_type_configs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "allowedMimeTypes" TEXT[],
    "maxFileSize" INTEGER NOT NULL,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
    "requiresSignature" BOOLEAN NOT NULL DEFAULT false,
    "defaultRetentionMonths" INTEGER,
    "complianceRequired" BOOLEAN NOT NULL DEFAULT false,
    "sppgId" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_type_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "checksum" TEXT,
    "documentTypeId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "majorVersion" INTEGER NOT NULL DEFAULT 1,
    "minorVersion" INTEGER NOT NULL DEFAULT 0,
    "currentVersion" BOOLEAN NOT NULL DEFAULT true,
    "status" "DocumentStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "tags" TEXT[],
    "metadata" JSONB,
    "content" TEXT,
    "visibility" "DocumentVisibility" NOT NULL DEFAULT 'PRIVATE',
    "permissions" JSONB,
    "complianceCategory" TEXT,
    "retentionDate" TIMESTAMP(3),
    "legalHold" BOOLEAN NOT NULL DEFAULT false,
    "confidential" BOOLEAN NOT NULL DEFAULT false,
    "reviewRequired" BOOLEAN NOT NULL DEFAULT false,
    "reviewInterval" INTEGER,
    "nextReviewDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "externalReferences" JSONB,
    "relatedDocuments" JSONB,
    "sppgId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "shareCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_versions" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "majorVersion" INTEGER NOT NULL,
    "minorVersion" INTEGER NOT NULL,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "checksum" TEXT,
    "changes" TEXT,
    "changeType" "VersionChangeType" NOT NULL DEFAULT 'MINOR',
    "previousId" TEXT,
    "sppgId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_approvals" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "approvalType" "ApprovalType" NOT NULL DEFAULT 'REVIEW',
    "status" "ResponseStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "priority" "ApprovalPriority" NOT NULL DEFAULT 'MEDIUM',
    "workflowStep" INTEGER NOT NULL DEFAULT 1,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "comments" TEXT,
    "conditions" TEXT,
    "deadline" TIMESTAMP(3),
    "approverId" TEXT NOT NULL,
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "reason" TEXT,
    "sppgId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "digital_signatures" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "approvalId" TEXT,
    "signatureType" "SignatureType" NOT NULL DEFAULT 'ELECTRONIC',
    "signatureData" TEXT NOT NULL,
    "certificateInfo" JSONB,
    "signerName" TEXT NOT NULL,
    "signerTitle" TEXT,
    "signerEmail" TEXT NOT NULL,
    "signerIP" TEXT,
    "isValid" BOOLEAN NOT NULL DEFAULT true,
    "validatedAt" TIMESTAMP(3),
    "invalidatedAt" TIMESTAMP(3),
    "invalidationReason" TEXT,
    "signerId" TEXT NOT NULL,
    "sppgId" TEXT NOT NULL,
    "signedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "digital_signatures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_permissions" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "userId" TEXT,
    "roleType" "UserRole",
    "canRead" BOOLEAN NOT NULL DEFAULT false,
    "canWrite" BOOLEAN NOT NULL DEFAULT false,
    "canDelete" BOOLEAN NOT NULL DEFAULT false,
    "canShare" BOOLEAN NOT NULL DEFAULT false,
    "canApprove" BOOLEAN NOT NULL DEFAULT false,
    "canSign" BOOLEAN NOT NULL DEFAULT false,
    "canDownload" BOOLEAN NOT NULL DEFAULT false,
    "canPrint" BOOLEAN NOT NULL DEFAULT false,
    "canExport" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3),
    "sppgId" TEXT NOT NULL,
    "grantedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_activities" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "action" "DocumentAction" NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "userId" TEXT NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "sppgId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_comments" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "commentType" "CommentType" NOT NULL DEFAULT 'GENERAL',
    "parentId" TEXT,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedBy" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "authorId" TEXT NOT NULL,
    "sppgId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_shares" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "shareToken" TEXT NOT NULL,
    "shareType" "ShareType" NOT NULL DEFAULT 'LINK',
    "password" TEXT,
    "expiresAt" TIMESTAMP(3),
    "maxDownloads" INTEGER,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "canDownload" BOOLEAN NOT NULL DEFAULT true,
    "canView" BOOLEAN NOT NULL DEFAULT true,
    "canComment" BOOLEAN NOT NULL DEFAULT false,
    "recipientEmail" TEXT,
    "recipientName" TEXT,
    "message" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sharedBy" TEXT NOT NULL,
    "sppgId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastAccessedAt" TIMESTAMP(3),

    CONSTRAINT "document_shares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "templateUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "documentTypeId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "fields" JSONB,
    "defaultValues" JSONB,
    "validation" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isOfficial" BOOLEAN NOT NULL DEFAULT false,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "sppgId" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_retention_policies" (
    "id" TEXT NOT NULL,
    "policyName" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "dataType" VARCHAR(50) NOT NULL,
    "retentionDays" INTEGER NOT NULL,
    "autoDelete" BOOLEAN NOT NULL DEFAULT false,
    "archiveBefore" BOOLEAN NOT NULL DEFAULT true,
    "regulationBasis" VARCHAR(50)[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "data_retention_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_consents" (
    "id" TEXT NOT NULL,
    "userId" VARCHAR(50) NOT NULL,
    "consentType" VARCHAR(50) NOT NULL,
    "consentGiven" BOOLEAN NOT NULL,
    "consentVersion" VARCHAR(20) NOT NULL,
    "ipAddress" INET,
    "userAgent" TEXT,
    "geoLocation" JSONB,
    "consentDate" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "withdrawalDate" TIMESTAMPTZ,
    "expiryDate" TIMESTAMPTZ,
    "legalBasis" VARCHAR(100),

    CONSTRAINT "user_consents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_health_metrics" (
    "id" TEXT NOT NULL,
    "metricName" VARCHAR(100) NOT NULL,
    "metricValue" DOUBLE PRECISION NOT NULL,
    "metricUnit" VARCHAR(20) NOT NULL,
    "warningThreshold" DOUBLE PRECISION,
    "criticalThreshold" DOUBLE PRECISION,
    "instanceId" VARCHAR(50),
    "region" VARCHAR(20),
    "timestamp" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_health_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "encryption_keys" (
    "id" TEXT NOT NULL,
    "keyVersion" INTEGER NOT NULL,
    "keyAlgorithm" VARCHAR(50) NOT NULL,
    "keyPurpose" VARCHAR(50) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rotatedAt" TIMESTAMPTZ,
    "expiresAt" TIMESTAMPTZ,
    "keyHash" VARCHAR(255) NOT NULL,
    "rotationDue" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "encryption_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "security_incidents" (
    "id" TEXT NOT NULL,
    "incidentType" VARCHAR(50) NOT NULL,
    "severity" VARCHAR(20) NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "affectedSystems" VARCHAR(50)[],
    "affectedUsers" VARCHAR(50)[],
    "dataCompromised" BOOLEAN NOT NULL DEFAULT false,
    "serviceImpacted" BOOLEAN NOT NULL DEFAULT false,
    "customerImpact" INTEGER NOT NULL DEFAULT 0,
    "responseActions" JSONB,
    "mitigationSteps" JSONB,
    "detectedAt" TIMESTAMPTZ NOT NULL,
    "reportedAt" TIMESTAMPTZ,
    "resolvedAt" TIMESTAMPTZ,
    "assignedTo" VARCHAR(50),
    "reportedBy" VARCHAR(50),

    CONSTRAINT "security_incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performance_baselines" (
    "id" TEXT NOT NULL,
    "metricName" VARCHAR(100) NOT NULL,
    "baselineValue" DOUBLE PRECISION NOT NULL,
    "measurementUnit" VARCHAR(20) NOT NULL,
    "environment" VARCHAR(20) NOT NULL,
    "timeWindow" VARCHAR(20) NOT NULL,
    "warningThreshold" DOUBLE PRECISION NOT NULL DEFAULT 20,
    "criticalThreshold" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "validFrom" TIMESTAMPTZ NOT NULL,
    "validUntil" TIMESTAMPTZ,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "performance_baselines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" TEXT NOT NULL,
    "sppgId" VARCHAR(50) NOT NULL,
    "supplierCode" VARCHAR(20) NOT NULL,
    "supplierName" VARCHAR(255) NOT NULL,
    "businessName" VARCHAR(255),
    "supplierType" "SupplierType" NOT NULL,
    "category" VARCHAR(100) NOT NULL,
    "primaryContact" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "email" VARCHAR(255),
    "whatsapp" VARCHAR(20),
    "website" VARCHAR(255),
    "address" TEXT NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "province" VARCHAR(100) NOT NULL,
    "postalCode" VARCHAR(10),
    "coordinates" VARCHAR(50),
    "deliveryRadius" DOUBLE PRECISION,
    "businessLicense" VARCHAR(255),
    "taxId" VARCHAR(50),
    "hallaLicense" VARCHAR(255),
    "foodSafetyLicense" VARCHAR(255),
    "paymentTerms" VARCHAR(50) NOT NULL DEFAULT 'CASH_ON_DELIVERY',
    "creditLimit" DOUBLE PRECISION DEFAULT 0,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'IDR',
    "bankAccount" VARCHAR(50),
    "bankName" VARCHAR(100),
    "overallRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "qualityRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "deliveryRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "priceCompetitiveness" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "serviceRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalOrders" INTEGER NOT NULL DEFAULT 0,
    "successfulDeliveries" INTEGER NOT NULL DEFAULT 0,
    "failedDeliveries" INTEGER NOT NULL DEFAULT 0,
    "averageDeliveryTime" INTEGER,
    "onTimeDeliveryRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalPurchaseValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "minOrderValue" DOUBLE PRECISION DEFAULT 0,
    "maxOrderCapacity" DOUBLE PRECISION,
    "leadTimeHours" INTEGER DEFAULT 24,
    "deliveryDays" VARCHAR(10)[],
    "specialties" VARCHAR(100)[],
    "certifications" VARCHAR(100)[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPreferred" BOOLEAN NOT NULL DEFAULT false,
    "isBlacklisted" BOOLEAN NOT NULL DEFAULT false,
    "blacklistReason" TEXT,
    "lastAuditDate" TIMESTAMPTZ,
    "nextAuditDue" TIMESTAMPTZ,
    "isHalalCertified" BOOLEAN NOT NULL DEFAULT false,
    "isFoodSafetyCertified" BOOLEAN NOT NULL DEFAULT false,
    "isISOCertified" BOOLEAN NOT NULL DEFAULT false,
    "complianceStatus" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    "lastInspectionDate" TIMESTAMPTZ,
    "partnershipLevel" VARCHAR(20) NOT NULL DEFAULT 'STANDARD',
    "contractStartDate" TIMESTAMPTZ,
    "contractEndDate" TIMESTAMPTZ,
    "relationshipManager" VARCHAR(255),
    "hasAPIIntegration" BOOLEAN NOT NULL DEFAULT false,
    "apiEndpoint" VARCHAR(255),
    "supportsEDI" BOOLEAN NOT NULL DEFAULT false,
    "preferredOrderMethod" VARCHAR(20) NOT NULL DEFAULT 'PHONE',
    "encryptedBankDetails" VARCHAR(500),
    "encryptedContracts" VARCHAR(500),
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "lastContactDate" TIMESTAMPTZ,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_evaluations" (
    "id" TEXT NOT NULL,
    "supplierId" VARCHAR(50) NOT NULL,
    "sppgId" VARCHAR(50) NOT NULL,
    "evaluationType" VARCHAR(50) NOT NULL,
    "evaluationPeriod" VARCHAR(20) NOT NULL,
    "qualityScore" DOUBLE PRECISION NOT NULL,
    "deliveryScore" DOUBLE PRECISION NOT NULL,
    "serviceScore" DOUBLE PRECISION NOT NULL,
    "priceScore" DOUBLE PRECISION NOT NULL,
    "complianceScore" DOUBLE PRECISION NOT NULL,
    "overallScore" DOUBLE PRECISION NOT NULL,
    "strengths" TEXT,
    "weaknesses" TEXT,
    "recommendations" TEXT,
    "actionItems" JSONB,
    "orderVolume" DOUBLE PRECISION,
    "orderValue" DOUBLE PRECISION,
    "deliveryCount" INTEGER NOT NULL DEFAULT 0,
    "complaintCount" INTEGER NOT NULL DEFAULT 0,
    "status" VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    "evaluatedBy" VARCHAR(50) NOT NULL,
    "approvedBy" VARCHAR(50),
    "evaluationDate" TIMESTAMPTZ NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "supplier_evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_contracts" (
    "id" TEXT NOT NULL,
    "supplierId" VARCHAR(50) NOT NULL,
    "sppgId" VARCHAR(50) NOT NULL,
    "contractNumber" VARCHAR(50) NOT NULL,
    "contractType" VARCHAR(50) NOT NULL,
    "contractStatus" VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    "startDate" TIMESTAMPTZ NOT NULL,
    "endDate" TIMESTAMPTZ NOT NULL,
    "autoRenew" BOOLEAN NOT NULL DEFAULT false,
    "renewalPeriod" INTEGER,
    "contractValue" DOUBLE PRECISION,
    "paymentTerms" VARCHAR(100) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'IDR',
    "priceAdjustment" VARCHAR(100),
    "deliveryTimeframe" VARCHAR(100) NOT NULL,
    "qualityStandards" TEXT,
    "penaltyTerms" TEXT,
    "bonusTerms" TEXT,
    "governingLaw" VARCHAR(100),
    "disputeResolution" VARCHAR(100),
    "confidentiality" BOOLEAN NOT NULL DEFAULT true,
    "contractDocument" VARCHAR(255),
    "signedBy" VARCHAR(255),
    "witnessedBy" VARCHAR(255),
    "signedDate" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "supplier_contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_products" (
    "id" TEXT NOT NULL,
    "supplierId" VARCHAR(50) NOT NULL,
    "sppgId" VARCHAR(50) NOT NULL,
    "productCode" VARCHAR(50) NOT NULL,
    "productName" VARCHAR(255) NOT NULL,
    "category" VARCHAR(100) NOT NULL,
    "subcategory" VARCHAR(100),
    "description" TEXT,
    "unit" VARCHAR(20) NOT NULL,
    "packagingType" VARCHAR(50),
    "shelfLife" INTEGER,
    "storageCondition" VARCHAR(100),
    "basePrice" DOUBLE PRECISION NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'IDR',
    "pricePerUnit" DOUBLE PRECISION NOT NULL,
    "minimumOrder" DOUBLE PRECISION DEFAULT 0,
    "maximumOrder" DOUBLE PRECISION,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "leadTimeHours" INTEGER NOT NULL DEFAULT 24,
    "stockLevel" VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    "hasHalalCert" BOOLEAN NOT NULL DEFAULT false,
    "hasOrganicCert" BOOLEAN NOT NULL DEFAULT false,
    "qualityGrade" "QualityGrade",
    "certifications" VARCHAR(100)[],
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "lastPriceUpdate" TIMESTAMPTZ,

    CONSTRAINT "supplier_products_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_isActive_idx" ON "users"("email", "isActive");

-- CreateIndex
CREATE INDEX "users_userType_userRole_isActive_idx" ON "users"("userType", "userRole", "isActive");

-- CreateIndex
CREATE INDEX "users_sppgId_isActive_lastLogin_idx" ON "users"("sppgId", "isActive", "lastLogin");

-- CreateIndex
CREATE INDEX "users_sppgId_userRole_idx" ON "users"("sppgId", "userRole");

-- CreateIndex
CREATE INDEX "users_demoStatus_demoExpiresAt_idx" ON "users"("demoStatus", "demoExpiresAt");

-- CreateIndex
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt");

-- CreateIndex
CREATE INDEX "users_lastLogin_idx" ON "users"("lastLogin");

-- CreateIndex
CREATE INDEX "users_failedLoginAttempts_lockedUntil_idx" ON "users"("failedLoginAttempts", "lockedUntil");

-- CreateIndex
CREATE INDEX "users_emailVerified_isActive_idx" ON "users"("emailVerified", "isActive");

-- CreateIndex
CREATE INDEX "users_securityLevel_riskScore_idx" ON "users"("securityLevel", "riskScore");

-- CreateIndex
CREATE UNIQUE INDEX "sppg_code_key" ON "sppg"("code");

-- CreateIndex
CREATE INDEX "sppg_status_organizationType_idx" ON "sppg"("status", "organizationType");

-- CreateIndex
CREATE INDEX "sppg_provinceId_regencyId_status_idx" ON "sppg"("provinceId", "regencyId", "status");

-- CreateIndex
CREATE INDEX "sppg_createdAt_status_idx" ON "sppg"("createdAt", "status");

-- CreateIndex
CREATE INDEX "sppg_isDemoAccount_demoExpiresAt_idx" ON "sppg"("isDemoAccount", "demoExpiresAt");

-- CreateIndex
CREATE INDEX "sppg_code_status_idx" ON "sppg"("code", "status");

-- CreateIndex
CREATE INDEX "sppg_email_phone_idx" ON "sppg"("email", "phone");

-- CreateIndex
CREATE INDEX "sppg_establishedYear_organizationType_idx" ON "sppg"("establishedYear", "organizationType");

-- CreateIndex
CREATE INDEX "sppg_targetRecipients_status_idx" ON "sppg"("targetRecipients", "status");

-- CreateIndex
CREATE INDEX "sppg_operationStartDate_operationEndDate_idx" ON "sppg"("operationStartDate", "operationEndDate");

-- CreateIndex
CREATE INDEX "sppg_monthlyBudget_budgetCurrency_idx" ON "sppg"("monthlyBudget", "budgetCurrency");

-- CreateIndex
CREATE UNIQUE INDEX "budget_tracking_sppgId_month_year_key" ON "budget_tracking"("sppgId", "month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_packages_name_key" ON "subscription_packages"("name");

-- CreateIndex
CREATE INDEX "subscription_packages_tier_isActive_idx" ON "subscription_packages"("tier", "isActive");

-- CreateIndex
CREATE INDEX "subscription_package_features_packageId_displayOrder_idx" ON "subscription_package_features"("packageId", "displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoiceNumber_key" ON "invoices"("invoiceNumber");

-- CreateIndex
CREATE INDEX "invoices_sppgId_period_idx" ON "invoices"("sppgId", "period");

-- CreateIndex
CREATE INDEX "invoices_status_dueDate_idx" ON "invoices"("status", "dueDate");

-- CreateIndex
CREATE UNIQUE INDEX "payments_paymentNumber_key" ON "payments"("paymentNumber");

-- CreateIndex
CREATE INDEX "payments_sppgId_status_idx" ON "payments"("sppgId", "status");

-- CreateIndex
CREATE INDEX "payments_invoiceId_idx" ON "payments"("invoiceId");

-- CreateIndex
CREATE INDEX "payments_paymentDate_idx" ON "payments"("paymentDate");

-- CreateIndex
CREATE INDEX "usage_tracking_sppgId_period_idx" ON "usage_tracking"("sppgId", "period");

-- CreateIndex
CREATE INDEX "usage_tracking_resourceType_isOverQuota_idx" ON "usage_tracking"("resourceType", "isOverQuota");

-- CreateIndex
CREATE UNIQUE INDEX "usage_tracking_sppgId_resourceType_period_key" ON "usage_tracking"("sppgId", "resourceType", "period");

-- CreateIndex
CREATE INDEX "subscription_changes_sppgId_status_idx" ON "subscription_changes"("sppgId", "status");

-- CreateIndex
CREATE INDEX "subscription_changes_changeType_status_idx" ON "subscription_changes"("changeType", "status");

-- CreateIndex
CREATE INDEX "subscription_changes_effectiveDate_idx" ON "subscription_changes"("effectiveDate");

-- CreateIndex
CREATE UNIQUE INDEX "trial_subscriptions_sppgId_key" ON "trial_subscriptions"("sppgId");

-- CreateIndex
CREATE INDEX "trial_subscriptions_endDate_isConverted_idx" ON "trial_subscriptions"("endDate", "isConverted");

-- CreateIndex
CREATE INDEX "trial_subscriptions_trialTier_isConverted_idx" ON "trial_subscriptions"("trialTier", "isConverted");

-- CreateIndex
CREATE INDEX "trial_notifications_trialId_notificationType_idx" ON "trial_notifications"("trialId", "notificationType");

-- CreateIndex
CREATE INDEX "billing_cycles_status_nextBillingDate_idx" ON "billing_cycles"("status", "nextBillingDate");

-- CreateIndex
CREATE INDEX "billing_cycles_sppgId_billingPeriod_idx" ON "billing_cycles"("sppgId", "billingPeriod");

-- CreateIndex
CREATE UNIQUE INDEX "billing_cycles_sppgId_cycleNumber_key" ON "billing_cycles"("sppgId", "cycleNumber");

-- CreateIndex
CREATE INDEX "payment_methods_sppgId_isActive_isDefault_idx" ON "payment_methods"("sppgId", "isActive", "isDefault");

-- CreateIndex
CREATE INDEX "payment_methods_provider_type_isActive_idx" ON "payment_methods"("provider", "type", "isActive");

-- CreateIndex
CREATE INDEX "payment_methods_verifiedAt_securityStatus_idx" ON "payment_methods"("verifiedAt", "securityStatus");

-- CreateIndex
CREATE INDEX "payment_methods_isDefault_isVerified_isActive_idx" ON "payment_methods"("isDefault", "isVerified", "isActive");

-- CreateIndex
CREATE INDEX "payment_methods_riskScore_securityStatus_idx" ON "payment_methods"("riskScore", "securityStatus");

-- CreateIndex
CREATE INDEX "payment_methods_createdAt_sppgId_idx" ON "payment_methods"("createdAt", "sppgId");

-- CreateIndex
CREATE INDEX "dunning_processes_sppgId_status_idx" ON "dunning_processes"("sppgId", "status");

-- CreateIndex
CREATE INDEX "dunning_processes_currentStage_nextActionDate_idx" ON "dunning_processes"("currentStage", "nextActionDate");

-- CreateIndex
CREATE INDEX "dunning_processes_isSuspended_idx" ON "dunning_processes"("isSuspended");

-- CreateIndex
CREATE INDEX "dunning_actions_dunningProcessId_actionDate_idx" ON "dunning_actions"("dunningProcessId", "actionDate");

-- CreateIndex
CREATE INDEX "dunning_actions_stage_actionType_idx" ON "dunning_actions"("stage", "actionType");

-- CreateIndex
CREATE INDEX "revenue_recognition_subscriptionId_recognitionStartDate_idx" ON "revenue_recognition"("subscriptionId", "recognitionStartDate");

-- CreateIndex
CREATE INDEX "revenue_recognition_accountingPeriod_idx" ON "revenue_recognition"("accountingPeriod");

-- CreateIndex
CREATE INDEX "revenue_schedule_items_revenueRecognitionId_scheduleDate_idx" ON "revenue_schedule_items"("revenueRecognitionId", "scheduleDate");

-- CreateIndex
CREATE INDEX "revenue_schedule_items_accountingMonth_idx" ON "revenue_schedule_items"("accountingMonth");

-- CreateIndex
CREATE INDEX "subscription_metrics_period_idx" ON "subscription_metrics"("period");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_metrics_period_periodType_key" ON "subscription_metrics"("period", "periodType");

-- CreateIndex
CREATE INDEX "customer_health_scores_healthScore_scoreCategory_idx" ON "customer_health_scores"("healthScore", "scoreCategory");

-- CreateIndex
CREATE INDEX "customer_health_scores_isAtRisk_riskLevel_idx" ON "customer_health_scores"("isAtRisk", "riskLevel");

-- CreateIndex
CREATE UNIQUE INDEX "customer_health_scores_sppgId_key" ON "customer_health_scores"("sppgId");

-- CreateIndex
CREATE UNIQUE INDEX "support_tickets_ticketNumber_key" ON "support_tickets"("ticketNumber");

-- CreateIndex
CREATE INDEX "support_tickets_sppgId_status_idx" ON "support_tickets"("sppgId", "status");

-- CreateIndex
CREATE INDEX "support_tickets_status_priority_idx" ON "support_tickets"("status", "priority");

-- CreateIndex
CREATE INDEX "support_tickets_category_status_idx" ON "support_tickets"("category", "status");

-- CreateIndex
CREATE INDEX "support_ticket_responses_ticketId_createdAt_idx" ON "support_ticket_responses"("ticketId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_base_slug_key" ON "knowledge_base"("slug");

-- CreateIndex
CREATE INDEX "knowledge_base_isPublished_category_idx" ON "knowledge_base"("isPublished", "category");

-- CreateIndex
CREATE INDEX "knowledge_base_tags_idx" ON "knowledge_base"("tags");

-- CreateIndex
CREATE UNIQUE INDEX "notification_templates_name_key" ON "notification_templates"("name");

-- CreateIndex
CREATE UNIQUE INDEX "notification_templates_templateCode_key" ON "notification_templates"("templateCode");

-- CreateIndex
CREATE INDEX "notification_templates_type_isActive_idx" ON "notification_templates"("type", "isActive");

-- CreateIndex
CREATE INDEX "notifications_userId_isRead_idx" ON "notifications"("userId", "isRead");

-- CreateIndex
CREATE INDEX "notifications_sppgId_isRead_idx" ON "notifications"("sppgId", "isRead");

-- CreateIndex
CREATE INDEX "notifications_type_priority_idx" ON "notifications"("type", "priority");

-- CreateIndex
CREATE UNIQUE INDEX "email_templates_name_key" ON "email_templates"("name");

-- CreateIndex
CREATE INDEX "email_templates_category_isActive_idx" ON "email_templates"("category", "isActive");

-- CreateIndex
CREATE INDEX "email_logs_toEmail_status_idx" ON "email_logs"("toEmail", "status");

-- CreateIndex
CREATE INDEX "email_logs_status_sentAt_idx" ON "email_logs"("status", "sentAt");

-- CreateIndex
CREATE INDEX "notification_deliveries_notificationId_channel_idx" ON "notification_deliveries"("notificationId", "channel");

-- CreateIndex
CREATE INDEX "notification_deliveries_status_sentAt_idx" ON "notification_deliveries"("status", "sentAt");

-- CreateIndex
CREATE INDEX "notification_campaigns_sppgId_status_idx" ON "notification_campaigns"("sppgId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "user_notification_preferences_userId_key" ON "user_notification_preferences"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_entityId_idx" ON "audit_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_userId_createdAt_idx" ON "audit_logs"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_sppgId_createdAt_idx" ON "audit_logs"("sppgId", "createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_action_createdAt_idx" ON "audit_logs"("action", "createdAt");

-- CreateIndex
CREATE INDEX "inventory_items_sppgId_category_idx" ON "inventory_items"("sppgId", "category");

-- CreateIndex
CREATE INDEX "inventory_items_category_isActive_idx" ON "inventory_items"("category", "isActive");

-- CreateIndex
CREATE INDEX "inventory_items_currentStock_idx" ON "inventory_items"("currentStock");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_items_sppgId_itemCode_key" ON "inventory_items"("sppgId", "itemCode");

-- CreateIndex
CREATE INDEX "stock_movements_inventoryId_movedAt_idx" ON "stock_movements"("inventoryId", "movedAt");

-- CreateIndex
CREATE INDEX "stock_movements_movementType_movedAt_idx" ON "stock_movements"("movementType", "movedAt");

-- CreateIndex
CREATE INDEX "stock_movements_referenceType_referenceId_idx" ON "stock_movements"("referenceType", "referenceId");

-- CreateIndex
CREATE INDEX "procurement_plans_sppgId_planMonth_idx" ON "procurement_plans"("sppgId", "planMonth");

-- CreateIndex
CREATE INDEX "procurement_plans_approvalStatus_idx" ON "procurement_plans"("approvalStatus");

-- CreateIndex
CREATE UNIQUE INDEX "procurements_procurementCode_key" ON "procurements"("procurementCode");

-- CreateIndex
CREATE INDEX "procurements_sppgId_procurementDate_idx" ON "procurements"("sppgId", "procurementDate");

-- CreateIndex
CREATE INDEX "procurements_paymentStatus_paymentDue_idx" ON "procurements"("paymentStatus", "paymentDue");

-- CreateIndex
CREATE INDEX "procurements_deliveryStatus_idx" ON "procurements"("deliveryStatus");

-- CreateIndex
CREATE INDEX "procurement_items_procurementId_idx" ON "procurement_items"("procurementId");

-- CreateIndex
CREATE INDEX "procurement_items_category_idx" ON "procurement_items"("category");

-- CreateIndex
CREATE INDEX "nutrition_requirements_ageGroupMin_ageGroupMax_gender_idx" ON "nutrition_requirements"("ageGroupMin", "ageGroupMax", "gender");

-- CreateIndex
CREATE INDEX "nutrition_requirements_isActive_idx" ON "nutrition_requirements"("isActive");

-- CreateIndex
CREATE INDEX "school_beneficiaries_programId_isActive_idx" ON "school_beneficiaries"("programId", "isActive");

-- CreateIndex
CREATE INDEX "school_beneficiaries_schoolType_isActive_idx" ON "school_beneficiaries"("schoolType", "isActive");

-- CreateIndex
CREATE INDEX "school_beneficiaries_villageId_idx" ON "school_beneficiaries"("villageId");

-- CreateIndex
CREATE INDEX "school_beneficiaries_targetStudents_idx" ON "school_beneficiaries"("targetStudents");

-- CreateIndex
CREATE UNIQUE INDEX "food_productions_batchNumber_key" ON "food_productions"("batchNumber");

-- CreateIndex
CREATE INDEX "food_productions_sppgId_productionDate_idx" ON "food_productions"("sppgId", "productionDate");

-- CreateIndex
CREATE INDEX "food_productions_programId_status_idx" ON "food_productions"("programId", "status");

-- CreateIndex
CREATE INDEX "food_productions_status_productionDate_idx" ON "food_productions"("status", "productionDate");

-- CreateIndex
CREATE INDEX "quality_controls_productionId_checkType_idx" ON "quality_controls"("productionId", "checkType");

-- CreateIndex
CREATE INDEX "quality_controls_checkType_passed_idx" ON "quality_controls"("checkType", "passed");

-- CreateIndex
CREATE UNIQUE INDEX "food_distributions_distributionCode_key" ON "food_distributions"("distributionCode");

-- CreateIndex
CREATE INDEX "food_distributions_sppgId_distributionDate_idx" ON "food_distributions"("sppgId", "distributionDate");

-- CreateIndex
CREATE INDEX "food_distributions_programId_status_idx" ON "food_distributions"("programId", "status");

-- CreateIndex
CREATE INDEX "food_distributions_status_distributionDate_idx" ON "food_distributions"("status", "distributionDate");

-- CreateIndex
CREATE INDEX "food_distributions_distributionPoint_idx" ON "food_distributions"("distributionPoint");

-- CreateIndex
CREATE UNIQUE INDEX "menu_nutrition_calculations_menuId_key" ON "menu_nutrition_calculations"("menuId");

-- CreateIndex
CREATE INDEX "menu_nutrition_calculations_menuId_idx" ON "menu_nutrition_calculations"("menuId");

-- CreateIndex
CREATE INDEX "menu_nutrition_calculations_meetsAKG_idx" ON "menu_nutrition_calculations"("meetsAKG");

-- CreateIndex
CREATE INDEX "menu_nutrition_calculations_calculatedAt_idx" ON "menu_nutrition_calculations"("calculatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "menu_cost_calculations_menuId_key" ON "menu_cost_calculations"("menuId");

-- CreateIndex
CREATE INDEX "menu_cost_calculations_menuId_idx" ON "menu_cost_calculations"("menuId");

-- CreateIndex
CREATE INDEX "menu_cost_calculations_costPerPortion_idx" ON "menu_cost_calculations"("costPerPortion");

-- CreateIndex
CREATE INDEX "menu_cost_calculations_calculatedAt_idx" ON "menu_cost_calculations"("calculatedAt");

-- CreateIndex
CREATE INDEX "departments_sppgId_isActive_idx" ON "departments"("sppgId", "isActive");

-- CreateIndex
CREATE INDEX "departments_parentId_idx" ON "departments"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "departments_sppgId_departmentCode_key" ON "departments"("sppgId", "departmentCode");

-- CreateIndex
CREATE INDEX "positions_sppgId_departmentId_idx" ON "positions"("sppgId", "departmentId");

-- CreateIndex
CREATE INDEX "positions_level_isActive_idx" ON "positions"("level", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "positions_sppgId_positionCode_key" ON "positions"("sppgId", "positionCode");

-- CreateIndex
CREATE UNIQUE INDEX "employees_userId_key" ON "employees"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "employees_employeeId_key" ON "employees"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "employees_nik_key" ON "employees"("nik");

-- CreateIndex
CREATE INDEX "employees_sppgId_employmentStatus_idx" ON "employees"("sppgId", "employmentStatus");

-- CreateIndex
CREATE INDEX "employees_departmentId_positionId_idx" ON "employees"("departmentId", "positionId");

-- CreateIndex
CREATE INDEX "employees_employmentStatus_isActive_idx" ON "employees"("employmentStatus", "isActive");

-- CreateIndex
CREATE INDEX "employees_joinDate_idx" ON "employees"("joinDate");

-- CreateIndex
CREATE INDEX "work_schedules_sppgId_isActive_idx" ON "work_schedules"("sppgId", "isActive");

-- CreateIndex
CREATE INDEX "school_distributions_programId_distributionDate_idx" ON "school_distributions"("programId", "distributionDate");

-- CreateIndex
CREATE INDEX "school_distributions_schoolId_distributionDate_idx" ON "school_distributions"("schoolId", "distributionDate");

-- CreateIndex
CREATE INDEX "school_distributions_deliveryStatus_idx" ON "school_distributions"("deliveryStatus");

-- CreateIndex
CREATE INDEX "school_feeding_reports_schoolId_reportDate_idx" ON "school_feeding_reports"("schoolId", "reportDate");

-- CreateIndex
CREATE INDEX "school_feeding_reports_distributionId_idx" ON "school_feeding_reports"("distributionId");

-- CreateIndex
CREATE INDEX "school_feeding_reports_reportType_reportDate_idx" ON "school_feeding_reports"("reportType", "reportDate");

-- CreateIndex
CREATE INDEX "program_monitoring_programId_monitoringMonth_idx" ON "program_monitoring"("programId", "monitoringMonth");

-- CreateIndex
CREATE INDEX "program_monitoring_monitoringMonth_monitoringYear_idx" ON "program_monitoring"("monitoringMonth", "monitoringYear");

-- CreateIndex
CREATE UNIQUE INDEX "nutrition_programs_programCode_key" ON "nutrition_programs"("programCode");

-- CreateIndex
CREATE INDEX "nutrition_programs_sppgId_status_idx" ON "nutrition_programs"("sppgId", "status");

-- CreateIndex
CREATE INDEX "nutrition_programs_programType_status_idx" ON "nutrition_programs"("programType", "status");

-- CreateIndex
CREATE INDEX "nutrition_programs_startDate_endDate_idx" ON "nutrition_programs"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "nutrition_menus_programId_isActive_idx" ON "nutrition_menus"("programId", "isActive");

-- CreateIndex
CREATE INDEX "nutrition_menus_mealType_isActive_idx" ON "nutrition_menus"("mealType", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "nutrition_menus_programId_menuCode_key" ON "nutrition_menus"("programId", "menuCode");

-- CreateIndex
CREATE INDEX "menu_ingredients_menuId_idx" ON "menu_ingredients"("menuId");

-- CreateIndex
CREATE INDEX "menu_ingredients_inventoryItemId_idx" ON "menu_ingredients"("inventoryItemId");

-- CreateIndex
CREATE INDEX "recipe_steps_menuId_stepNumber_idx" ON "recipe_steps"("menuId", "stepNumber");

-- CreateIndex
CREATE UNIQUE INDEX "recipe_steps_menuId_stepNumber_key" ON "recipe_steps"("menuId", "stepNumber");

-- CreateIndex
CREATE INDEX "menu_plans_programId_startDate_endDate_idx" ON "menu_plans"("programId", "startDate", "endDate");

-- CreateIndex
CREATE INDEX "menu_plans_sppgId_idx" ON "menu_plans"("sppgId");

-- CreateIndex
CREATE INDEX "menu_plans_createdBy_idx" ON "menu_plans"("createdBy");

-- CreateIndex
CREATE INDEX "menu_assignments_menuPlanId_assignedDate_idx" ON "menu_assignments"("menuPlanId", "assignedDate");

-- CreateIndex
CREATE INDEX "menu_assignments_menuId_idx" ON "menu_assignments"("menuId");

-- CreateIndex
CREATE INDEX "menu_assignments_assignedDate_idx" ON "menu_assignments"("assignedDate");

-- CreateIndex
CREATE UNIQUE INDEX "menu_assignments_menuPlanId_assignedDate_mealType_key" ON "menu_assignments"("menuPlanId", "assignedDate", "mealType");

-- CreateIndex
CREATE INDEX "menu_plan_templates_sppgId_category_idx" ON "menu_plan_templates"("sppgId", "category");

-- CreateIndex
CREATE INDEX "menu_plan_templates_createdBy_idx" ON "menu_plan_templates"("createdBy");

-- CreateIndex
CREATE INDEX "nutrition_standards_targetGroup_ageGroup_idx" ON "nutrition_standards"("targetGroup", "ageGroup");

-- CreateIndex
CREATE UNIQUE INDEX "nutrition_standards_targetGroup_ageGroup_gender_activityLev_key" ON "nutrition_standards"("targetGroup", "ageGroup", "gender", "activityLevel");

-- CreateIndex
CREATE INDEX "employee_documents_employeeId_idx" ON "employee_documents"("employeeId");

-- CreateIndex
CREATE INDEX "employee_documents_expiryDate_isExpired_idx" ON "employee_documents"("expiryDate", "isExpired");

-- CreateIndex
CREATE INDEX "employee_certifications_employeeId_isActive_idx" ON "employee_certifications"("employeeId", "isActive");

-- CreateIndex
CREATE INDEX "employee_certifications_expiryDate_isActive_idx" ON "employee_certifications"("expiryDate", "isActive");

-- CreateIndex
CREATE INDEX "employee_attendances_attendanceDate_status_idx" ON "employee_attendances"("attendanceDate", "status");

-- CreateIndex
CREATE INDEX "employee_attendances_employeeId_attendanceDate_idx" ON "employee_attendances"("employeeId", "attendanceDate");

-- CreateIndex
CREATE UNIQUE INDEX "employee_attendances_employeeId_attendanceDate_key" ON "employee_attendances"("employeeId", "attendanceDate");

-- CreateIndex
CREATE INDEX "leave_balances_leaveYear_idx" ON "leave_balances"("leaveYear");

-- CreateIndex
CREATE UNIQUE INDEX "leave_balances_employeeId_leaveYear_key" ON "leave_balances"("employeeId", "leaveYear");

-- CreateIndex
CREATE INDEX "leave_requests_employeeId_status_idx" ON "leave_requests"("employeeId", "status");

-- CreateIndex
CREATE INDEX "leave_requests_startDate_endDate_idx" ON "leave_requests"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "leave_requests_leaveType_status_idx" ON "leave_requests"("leaveType", "status");

-- CreateIndex
CREATE INDEX "payrolls_payrollMonth_payrollYear_idx" ON "payrolls"("payrollMonth", "payrollYear");

-- CreateIndex
CREATE INDEX "payrolls_status_payDate_idx" ON "payrolls"("status", "payDate");

-- CreateIndex
CREATE UNIQUE INDEX "payrolls_employeeId_payrollMonth_payrollYear_key" ON "payrolls"("employeeId", "payrollMonth", "payrollYear");

-- CreateIndex
CREATE INDEX "performance_reviews_employeeId_reviewPeriod_idx" ON "performance_reviews"("employeeId", "reviewPeriod");

-- CreateIndex
CREATE INDEX "performance_reviews_reviewType_reviewYear_idx" ON "performance_reviews"("reviewType", "reviewYear");

-- CreateIndex
CREATE INDEX "performance_reviews_status_dueDate_idx" ON "performance_reviews"("status", "dueDate");

-- CreateIndex
CREATE INDEX "trainings_sppgId_status_idx" ON "trainings"("sppgId", "status");

-- CreateIndex
CREATE INDEX "trainings_startDate_endDate_idx" ON "trainings"("startDate", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "trainings_sppgId_trainingCode_key" ON "trainings"("sppgId", "trainingCode");

-- CreateIndex
CREATE INDEX "employee_trainings_trainingId_attended_idx" ON "employee_trainings"("trainingId", "attended");

-- CreateIndex
CREATE UNIQUE INDEX "employee_trainings_employeeId_trainingId_key" ON "employee_trainings"("employeeId", "trainingId");

-- CreateIndex
CREATE INDEX "disciplinary_actions_employeeId_status_idx" ON "disciplinary_actions"("employeeId", "status");

-- CreateIndex
CREATE INDEX "disciplinary_actions_violationType_violationLevel_idx" ON "disciplinary_actions"("violationType", "violationLevel");

-- CreateIndex
CREATE INDEX "disciplinary_actions_incidentDate_idx" ON "disciplinary_actions"("incidentDate");

-- CreateIndex
CREATE UNIQUE INDEX "sppg_virtual_accounts_sppgId_key" ON "sppg_virtual_accounts"("sppgId");

-- CreateIndex
CREATE UNIQUE INDEX "sppg_virtual_accounts_accountNumber_key" ON "sppg_virtual_accounts"("accountNumber");

-- CreateIndex
CREATE UNIQUE INDEX "banper_requests_requestNumber_key" ON "banper_requests"("requestNumber");

-- CreateIndex
CREATE INDEX "banper_requests_sppgId_status_idx" ON "banper_requests"("sppgId", "status");

-- CreateIndex
CREATE INDEX "banper_requests_requestDate_operationalPeriod_idx" ON "banper_requests"("requestDate", "operationalPeriod");

-- CreateIndex
CREATE UNIQUE INDEX "banper_transactions_transactionNumber_key" ON "banper_transactions"("transactionNumber");

-- CreateIndex
CREATE INDEX "banper_transactions_sppgId_transactionDate_idx" ON "banper_transactions"("sppgId", "transactionDate");

-- CreateIndex
CREATE INDEX "banper_transactions_transactionType_category_idx" ON "banper_transactions"("transactionType", "category");

-- CreateIndex
CREATE INDEX "sppg_team_members_sppgId_role_idx" ON "sppg_team_members"("sppgId", "role");

-- CreateIndex
CREATE INDEX "sppg_team_members_isActive_role_idx" ON "sppg_team_members"("isActive", "role");

-- CreateIndex
CREATE INDEX "distribution_schedules_sppgId_distributionDate_wave_idx" ON "distribution_schedules"("sppgId", "distributionDate", "wave");

-- CreateIndex
CREATE INDEX "distribution_schedules_status_idx" ON "distribution_schedules"("status");

-- CreateIndex
CREATE INDEX "distribution_deliveries_scheduleId_status_idx" ON "distribution_deliveries"("scheduleId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "beneficiary_receipts_receiptNumber_key" ON "beneficiary_receipts"("receiptNumber");

-- CreateIndex
CREATE INDEX "beneficiary_receipts_sppgId_receiptDate_idx" ON "beneficiary_receipts"("sppgId", "receiptDate");

-- CreateIndex
CREATE INDEX "beneficiary_receipts_status_beneficiaryCategory_idx" ON "beneficiary_receipts"("status", "beneficiaryCategory");

-- CreateIndex
CREATE UNIQUE INDEX "sppg_operational_reports_reportNumber_key" ON "sppg_operational_reports"("reportNumber");

-- CreateIndex
CREATE INDEX "sppg_operational_reports_sppgId_reportType_reportPeriod_idx" ON "sppg_operational_reports"("sppgId", "reportType", "reportPeriod");

-- CreateIndex
CREATE INDEX "sppg_operational_reports_status_reportDate_idx" ON "sppg_operational_reports"("status", "reportDate");

-- CreateIndex
CREATE UNIQUE INDEX "kitchen_equipment_equipmentCode_key" ON "kitchen_equipment"("equipmentCode");

-- CreateIndex
CREATE INDEX "kitchen_equipment_sppgId_category_idx" ON "kitchen_equipment"("sppgId", "category");

-- CreateIndex
CREATE INDEX "kitchen_equipment_status_condition_idx" ON "kitchen_equipment"("status", "condition");

-- CreateIndex
CREATE INDEX "equipment_maintenance_equipmentId_maintenanceDate_idx" ON "equipment_maintenance"("equipmentId", "maintenanceDate");

-- CreateIndex
CREATE INDEX "equipment_maintenance_maintenanceType_idx" ON "equipment_maintenance"("maintenanceType");

-- CreateIndex
CREATE INDEX "utility_monitoring_sppgId_monitoringDate_idx" ON "utility_monitoring"("sppgId", "monitoringDate");

-- CreateIndex
CREATE INDEX "utility_monitoring_waterQuality_internetStatus_idx" ON "utility_monitoring"("waterQuality", "internetStatus");

-- CreateIndex
CREATE INDEX "laboratory_tests_sppgId_testType_testDate_idx" ON "laboratory_tests"("sppgId", "testType", "testDate");

-- CreateIndex
CREATE INDEX "laboratory_tests_testStatus_isCompliant_idx" ON "laboratory_tests"("testStatus", "isCompliant");

-- CreateIndex
CREATE UNIQUE INDEX "food_safety_certifications_certificateNumber_key" ON "food_safety_certifications"("certificateNumber");

-- CreateIndex
CREATE INDEX "food_safety_certifications_sppgId_status_idx" ON "food_safety_certifications"("sppgId", "status");

-- CreateIndex
CREATE INDEX "food_safety_certifications_expiryDate_renewalRequired_idx" ON "food_safety_certifications"("expiryDate", "renewalRequired");

-- CreateIndex
CREATE INDEX "daily_food_samples_sppgId_sampleDate_idx" ON "daily_food_samples"("sppgId", "sampleDate");

-- CreateIndex
CREATE INDEX "daily_food_samples_menuName_batchNumber_idx" ON "daily_food_samples"("menuName", "batchNumber");

-- CreateIndex
CREATE INDEX "menu_research_sppgId_researchType_idx" ON "menu_research"("sppgId", "researchType");

-- CreateIndex
CREATE INDEX "menu_research_testingStatus_priority_idx" ON "menu_research"("testingStatus", "priority");

-- CreateIndex
CREATE INDEX "menu_test_results_researchId_testDate_idx" ON "menu_test_results"("researchId", "testDate");

-- CreateIndex
CREATE INDEX "menu_test_results_overallScore_acceptanceRate_idx" ON "menu_test_results"("overallScore", "acceptanceRate");

-- CreateIndex
CREATE INDEX "local_food_adaptations_sppgId_region_season_idx" ON "local_food_adaptations"("sppgId", "region", "season");

-- CreateIndex
CREATE INDEX "local_food_adaptations_availability_usageFrequency_idx" ON "local_food_adaptations"("availability", "usageFrequency");

-- CreateIndex
CREATE INDEX "nutrition_consultations_sppgId_nutritionistId_idx" ON "nutrition_consultations"("sppgId", "nutritionistId");

-- CreateIndex
CREATE INDEX "nutrition_consultations_consultationType_nutritionStatus_idx" ON "nutrition_consultations"("consultationType", "nutritionStatus");

-- CreateIndex
CREATE INDEX "nutrition_education_sppgId_educatorId_idx" ON "nutrition_education"("sppgId", "educatorId");

-- CreateIndex
CREATE INDEX "nutrition_education_targetAudience_sessionDate_idx" ON "nutrition_education"("targetAudience", "sessionDate");

-- CreateIndex
CREATE INDEX "production_optimizations_sppgId_targetMetric_idx" ON "production_optimizations"("sppgId", "targetMetric");

-- CreateIndex
CREATE INDEX "production_optimizations_priority_isSuccessful_idx" ON "production_optimizations"("priority", "isSuccessful");

-- CreateIndex
CREATE INDEX "waste_management_sppgId_wasteDate_wasteType_idx" ON "waste_management"("sppgId", "wasteDate", "wasteType");

-- CreateIndex
CREATE INDEX "waste_management_wasteSource_disposalMethod_idx" ON "waste_management"("wasteSource", "disposalMethod");

-- CreateIndex
CREATE INDEX "performance_analytics_sppgId_analysisType_analysisPeriod_idx" ON "performance_analytics"("sppgId", "analysisType", "analysisPeriod");

-- CreateIndex
CREATE INDEX "performance_analytics_costEfficiency_qualityScore_idx" ON "performance_analytics"("costEfficiency", "qualityScore");

-- CreateIndex
CREATE INDEX "sppg_benchmarking_sppgId_benchmarkDate_compareType_idx" ON "sppg_benchmarking"("sppgId", "benchmarkDate", "compareType");

-- CreateIndex
CREATE INDEX "sppg_benchmarking_regionalRanking_overallScore_idx" ON "sppg_benchmarking"("regionalRanking", "overallScore");

-- CreateIndex
CREATE INDEX "user_permissions_userId_isActive_idx" ON "user_permissions"("userId", "isActive");

-- CreateIndex
CREATE INDEX "user_permissions_permission_accessLevel_idx" ON "user_permissions"("permission", "accessLevel");

-- CreateIndex
CREATE UNIQUE INDEX "user_permissions_userId_permission_resourceType_resourceId_key" ON "user_permissions"("userId", "permission", "resourceType", "resourceId");

-- CreateIndex
CREATE UNIQUE INDEX "user_sessions_sessionId_key" ON "user_sessions"("sessionId");

-- CreateIndex
CREATE INDEX "user_sessions_userId_isValid_idx" ON "user_sessions"("userId", "isValid");

-- CreateIndex
CREATE INDEX "user_sessions_sessionId_idx" ON "user_sessions"("sessionId");

-- CreateIndex
CREATE INDEX "user_activities_userId_activityType_timestamp_idx" ON "user_activities"("userId", "activityType", "timestamp");

-- CreateIndex
CREATE INDEX "user_activities_module_action_idx" ON "user_activities"("module", "action");

-- CreateIndex
CREATE INDEX "user_audit_logs_userId_timestamp_idx" ON "user_audit_logs"("userId", "timestamp");

-- CreateIndex
CREATE INDEX "user_audit_logs_sppgId_timestamp_idx" ON "user_audit_logs"("sppgId", "timestamp");

-- CreateIndex
CREATE INDEX "user_audit_logs_action_timestamp_idx" ON "user_audit_logs"("action", "timestamp");

-- CreateIndex
CREATE INDEX "user_audit_logs_entityType_entityId_timestamp_idx" ON "user_audit_logs"("entityType", "entityId", "timestamp");

-- CreateIndex
CREATE INDEX "user_audit_logs_riskLevel_riskScore_flagged_idx" ON "user_audit_logs"("riskLevel", "riskScore", "flagged");

-- CreateIndex
CREATE INDEX "user_audit_logs_ipAddress_timestamp_idx" ON "user_audit_logs"("ipAddress", "timestamp");

-- CreateIndex
CREATE INDEX "user_audit_logs_sessionId_timestamp_idx" ON "user_audit_logs"("sessionId", "timestamp");

-- CreateIndex
CREATE INDEX "user_audit_logs_resourcePath_action_idx" ON "user_audit_logs"("resourcePath", "action");

-- CreateIndex
CREATE INDEX "user_audit_logs_timestamp_idx" ON "user_audit_logs"("timestamp");

-- CreateIndex
CREATE INDEX "user_audit_logs_isPersonalData_retentionPolicy_idx" ON "user_audit_logs"("isPersonalData", "retentionPolicy");

-- CreateIndex
CREATE INDEX "user_audit_logs_threatIndicators_idx" ON "user_audit_logs"("threatIndicators");

-- CreateIndex
CREATE INDEX "user_audit_logs_autoBlocked_reviewRequired_idx" ON "user_audit_logs"("autoBlocked", "reviewRequired");

-- CreateIndex
CREATE INDEX "role_permission_matrix_role_isActive_idx" ON "role_permission_matrix"("role", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "role_permission_matrix_role_permission_moduleScope_key" ON "role_permission_matrix"("role", "permission", "moduleScope");

-- CreateIndex
CREATE INDEX "platform_demo_requests_email_status_idx" ON "platform_demo_requests"("email", "status");

-- CreateIndex
CREATE INDEX "platform_demo_requests_assignedTo_scheduledDate_idx" ON "platform_demo_requests"("assignedTo", "scheduledDate");

-- CreateIndex
CREATE INDEX "platform_demo_requests_status_createdAt_idx" ON "platform_demo_requests"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_onboarding_userId_key" ON "user_onboarding"("userId");

-- CreateIndex
CREATE INDEX "user_onboarding_currentStep_progressPercent_idx" ON "user_onboarding"("currentStep", "progressPercent");

-- CreateIndex
CREATE UNIQUE INDEX "provinces_code_key" ON "provinces"("code");

-- CreateIndex
CREATE INDEX "provinces_region_idx" ON "provinces"("region");

-- CreateIndex
CREATE INDEX "regencies_provinceId_type_idx" ON "regencies"("provinceId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "regencies_provinceId_code_key" ON "regencies"("provinceId", "code");

-- CreateIndex
CREATE INDEX "districts_regencyId_idx" ON "districts"("regencyId");

-- CreateIndex
CREATE UNIQUE INDEX "districts_regencyId_code_key" ON "districts"("regencyId", "code");

-- CreateIndex
CREATE INDEX "villages_districtId_type_idx" ON "villages"("districtId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "villages_districtId_code_key" ON "villages"("districtId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "landing_pages_slug_key" ON "landing_pages"("slug");

-- CreateIndex
CREATE INDEX "landing_pages_slug_isActive_idx" ON "landing_pages"("slug", "isActive");

-- CreateIndex
CREATE INDEX "landing_pages_targetAudience_isActive_idx" ON "landing_pages"("targetAudience", "isActive");

-- CreateIndex
CREATE INDEX "ab_tests_landingPageId_status_idx" ON "ab_tests"("landingPageId", "status");

-- CreateIndex
CREATE INDEX "ab_test_variants_testId_idx" ON "ab_test_variants"("testId");

-- CreateIndex
CREATE UNIQUE INDEX "blog_posts_slug_key" ON "blog_posts"("slug");

-- CreateIndex
CREATE INDEX "blog_posts_category_status_idx" ON "blog_posts"("category", "status");

-- CreateIndex
CREATE INDEX "blog_posts_publishedAt_status_idx" ON "blog_posts"("publishedAt", "status");

-- CreateIndex
CREATE INDEX "blog_comments_blogPostId_status_idx" ON "blog_comments"("blogPostId", "status");

-- CreateIndex
CREATE INDEX "testimonials_isActive_isFeatured_idx" ON "testimonials"("isActive", "isFeatured");

-- CreateIndex
CREATE INDEX "testimonials_organizationType_isActive_idx" ON "testimonials"("organizationType", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "case_studies_slug_key" ON "case_studies"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "case_studies_testimonialId_key" ON "case_studies"("testimonialId");

-- CreateIndex
CREATE INDEX "case_studies_slug_status_idx" ON "case_studies"("slug", "status");

-- CreateIndex
CREATE INDEX "case_studies_organizationType_status_idx" ON "case_studies"("organizationType", "status");

-- CreateIndex
CREATE INDEX "faqs_category_isActive_idx" ON "faqs"("category", "isActive");

-- CreateIndex
CREATE INDEX "faqs_isPinned_order_idx" ON "faqs"("isPinned", "order");

-- CreateIndex
CREATE UNIQUE INDEX "help_articles_slug_key" ON "help_articles"("slug");

-- CreateIndex
CREATE INDEX "help_articles_category_status_idx" ON "help_articles"("category", "status");

-- CreateIndex
CREATE INDEX "help_articles_slug_status_idx" ON "help_articles"("slug", "status");

-- CreateIndex
CREATE INDEX "lead_captures_status_score_idx" ON "lead_captures"("status", "score");

-- CreateIndex
CREATE INDEX "lead_captures_source_createdAt_idx" ON "lead_captures"("source", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "lead_captures_email_key" ON "lead_captures"("email");

-- CreateIndex
CREATE INDEX "image_folders_parentId_idx" ON "image_folders"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "image_files_filename_key" ON "image_files"("filename");

-- CreateIndex
CREATE UNIQUE INDEX "image_files_path_key" ON "image_files"("path");

-- CreateIndex
CREATE INDEX "image_files_folderId_idx" ON "image_files"("folderId");

-- CreateIndex
CREATE INDEX "image_files_uploadedBy_idx" ON "image_files"("uploadedBy");

-- CreateIndex
CREATE INDEX "image_files_mimeType_idx" ON "image_files"("mimeType");

-- CreateIndex
CREATE INDEX "templates_category_isActive_idx" ON "templates"("category", "isActive");

-- CreateIndex
CREATE INDEX "templates_isPopular_isActive_idx" ON "templates"("isPopular", "isActive");

-- CreateIndex
CREATE INDEX "page_analytics_date_pageType_idx" ON "page_analytics"("date", "pageType");

-- CreateIndex
CREATE UNIQUE INDEX "page_analytics_pageType_pageId_date_key" ON "page_analytics"("pageType", "pageId", "date");

-- CreateIndex
CREATE INDEX "marketing_campaigns_status_startDate_idx" ON "marketing_campaigns"("status", "startDate");

-- CreateIndex
CREATE INDEX "marketing_campaigns_type_status_idx" ON "marketing_campaigns"("type", "status");

-- CreateIndex
CREATE UNIQUE INDEX "demo_requests_picEmail_key" ON "demo_requests"("picEmail");

-- CreateIndex
CREATE INDEX "demo_requests_picEmail_status_idx" ON "demo_requests"("picEmail", "status");

-- CreateIndex
CREATE INDEX "demo_requests_status_demoExpiresAt_idx" ON "demo_requests"("status", "demoExpiresAt");

-- CreateIndex
CREATE INDEX "demo_requests_organizationName_idx" ON "demo_requests"("organizationName");

-- CreateIndex
CREATE UNIQUE INDEX "demo_analytics_sppgId_key" ON "demo_analytics"("sppgId");

-- CreateIndex
CREATE UNIQUE INDEX "platform_analytics_date_key" ON "platform_analytics"("date");

-- CreateIndex
CREATE UNIQUE INDEX "system_configurations_key_key" ON "system_configurations"("key");

-- CreateIndex
CREATE INDEX "system_configurations_category_isPublic_idx" ON "system_configurations"("category", "isPublic");

-- CreateIndex
CREATE UNIQUE INDEX "feature_flags_name_key" ON "feature_flags"("name");

-- CreateIndex
CREATE INDEX "feature_flags_isEnabled_environment_idx" ON "feature_flags"("isEnabled", "environment");

-- CreateIndex
CREATE INDEX "feature_usages_featureFlagId_usedAt_idx" ON "feature_usages"("featureFlagId", "usedAt");

-- CreateIndex
CREATE UNIQUE INDEX "demo_features_name_key" ON "demo_features"("name");

-- CreateIndex
CREATE UNIQUE INDEX "demo_challenges_name_key" ON "demo_challenges"("name");

-- CreateIndex
CREATE UNIQUE INDEX "demo_goals_name_key" ON "demo_goals"("name");

-- CreateIndex
CREATE INDEX "feedback_stakeholders_sppgId_stakeholderType_idx" ON "feedback_stakeholders"("sppgId", "stakeholderType");

-- CreateIndex
CREATE INDEX "feedback_stakeholders_email_idx" ON "feedback_stakeholders"("email");

-- CreateIndex
CREATE INDEX "feedback_sppgId_status_priority_idx" ON "feedback"("sppgId", "status", "priority");

-- CreateIndex
CREATE INDEX "feedback_assignedTo_status_idx" ON "feedback"("assignedTo", "status");

-- CreateIndex
CREATE INDEX "feedback_createdAt_urgencyScore_idx" ON "feedback"("createdAt", "urgencyScore");

-- CreateIndex
CREATE INDEX "feedback_category_subcategory_idx" ON "feedback"("category", "subcategory");

-- CreateIndex
CREATE INDEX "feedback_stakeholderId_idx" ON "feedback"("stakeholderId");

-- CreateIndex
CREATE INDEX "feedback_slaDeadline_idx" ON "feedback"("slaDeadline");

-- CreateIndex
CREATE INDEX "feedback_responses_feedbackId_responseType_idx" ON "feedback_responses"("feedbackId", "responseType");

-- CreateIndex
CREATE INDEX "feedback_responses_authorId_status_idx" ON "feedback_responses"("authorId", "status");

-- CreateIndex
CREATE INDEX "feedback_responses_sentAt_idx" ON "feedback_responses"("sentAt");

-- CreateIndex
CREATE INDEX "feedback_escalations_feedbackId_escalationLevel_idx" ON "feedback_escalations"("feedbackId", "escalationLevel");

-- CreateIndex
CREATE INDEX "feedback_escalations_toUserId_status_idx" ON "feedback_escalations"("toUserId", "status");

-- CreateIndex
CREATE INDEX "feedback_escalations_escalatedAt_idx" ON "feedback_escalations"("escalatedAt");

-- CreateIndex
CREATE INDEX "feedback_activities_feedbackId_createdAt_idx" ON "feedback_activities"("feedbackId", "createdAt");

-- CreateIndex
CREATE INDEX "feedback_activities_performedBy_idx" ON "feedback_activities"("performedBy");

-- CreateIndex
CREATE INDEX "feedback_analytics_sppgId_period_startDate_idx" ON "feedback_analytics"("sppgId", "period", "startDate");

-- CreateIndex
CREATE INDEX "feedback_analytics_startDate_endDate_idx" ON "feedback_analytics"("startDate", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "feedback_analytics_sppgId_period_startDate_stakeholderType__key" ON "feedback_analytics"("sppgId", "period", "startDate", "stakeholderType", "category");

-- CreateIndex
CREATE INDEX "feedback_slas_sppgId_isActive_priority_idx" ON "feedback_slas"("sppgId", "isActive", "priority");

-- CreateIndex
CREATE INDEX "feedback_templates_sppgId_isActive_idx" ON "feedback_templates"("sppgId", "isActive");

-- CreateIndex
CREATE INDEX "feedback_templates_feedbackType_category_idx" ON "feedback_templates"("feedbackType", "category");

-- CreateIndex
CREATE INDEX "beneficiary_feedback_legacy_sppgId_status_idx" ON "beneficiary_feedback_legacy"("sppgId", "status");

-- CreateIndex
CREATE INDEX "document_categories_sppgId_isActive_idx" ON "document_categories"("sppgId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "document_categories_name_sppgId_key" ON "document_categories"("name", "sppgId");

-- CreateIndex
CREATE INDEX "document_type_configs_sppgId_isActive_idx" ON "document_type_configs"("sppgId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "document_type_configs_name_sppgId_key" ON "document_type_configs"("name", "sppgId");

-- CreateIndex
CREATE INDEX "documents_sppgId_idx" ON "documents"("sppgId");

-- CreateIndex
CREATE INDEX "documents_categoryId_idx" ON "documents"("categoryId");

-- CreateIndex
CREATE INDEX "documents_documentTypeId_idx" ON "documents"("documentTypeId");

-- CreateIndex
CREATE INDEX "documents_createdBy_idx" ON "documents"("createdBy");

-- CreateIndex
CREATE INDEX "documents_title_idx" ON "documents"("title");

-- CreateIndex
CREATE INDEX "document_versions_documentId_version_idx" ON "document_versions"("documentId", "version");

-- CreateIndex
CREATE INDEX "document_versions_sppgId_idx" ON "document_versions"("sppgId");

-- CreateIndex
CREATE INDEX "document_approvals_documentId_status_idx" ON "document_approvals"("documentId", "status");

-- CreateIndex
CREATE INDEX "document_approvals_approverId_status_idx" ON "document_approvals"("approverId", "status");

-- CreateIndex
CREATE INDEX "document_approvals_sppgId_idx" ON "document_approvals"("sppgId");

-- CreateIndex
CREATE INDEX "digital_signatures_documentId_idx" ON "digital_signatures"("documentId");

-- CreateIndex
CREATE INDEX "digital_signatures_signerId_idx" ON "digital_signatures"("signerId");

-- CreateIndex
CREATE INDEX "digital_signatures_sppgId_idx" ON "digital_signatures"("sppgId");

-- CreateIndex
CREATE INDEX "document_permissions_userId_idx" ON "document_permissions"("userId");

-- CreateIndex
CREATE INDEX "document_permissions_sppgId_idx" ON "document_permissions"("sppgId");

-- CreateIndex
CREATE UNIQUE INDEX "document_permissions_documentId_userId_key" ON "document_permissions"("documentId", "userId");

-- CreateIndex
CREATE INDEX "document_activities_documentId_action_idx" ON "document_activities"("documentId", "action");

-- CreateIndex
CREATE INDEX "document_activities_userId_idx" ON "document_activities"("userId");

-- CreateIndex
CREATE INDEX "document_activities_sppgId_idx" ON "document_activities"("sppgId");

-- CreateIndex
CREATE INDEX "document_activities_createdAt_idx" ON "document_activities"("createdAt");

-- CreateIndex
CREATE INDEX "document_comments_documentId_idx" ON "document_comments"("documentId");

-- CreateIndex
CREATE INDEX "document_comments_authorId_idx" ON "document_comments"("authorId");

-- CreateIndex
CREATE INDEX "document_comments_sppgId_idx" ON "document_comments"("sppgId");

-- CreateIndex
CREATE UNIQUE INDEX "document_shares_shareToken_key" ON "document_shares"("shareToken");

-- CreateIndex
CREATE INDEX "document_shares_shareToken_idx" ON "document_shares"("shareToken");

-- CreateIndex
CREATE INDEX "document_shares_documentId_idx" ON "document_shares"("documentId");

-- CreateIndex
CREATE INDEX "document_shares_sppgId_idx" ON "document_shares"("sppgId");

-- CreateIndex
CREATE INDEX "document_templates_categoryId_idx" ON "document_templates"("categoryId");

-- CreateIndex
CREATE INDEX "document_templates_documentTypeId_idx" ON "document_templates"("documentTypeId");

-- CreateIndex
CREATE INDEX "document_templates_sppgId_idx" ON "document_templates"("sppgId");

-- CreateIndex
CREATE UNIQUE INDEX "data_retention_policies_policyName_key" ON "data_retention_policies"("policyName");

-- CreateIndex
CREATE INDEX "data_retention_policies_dataType_isActive_idx" ON "data_retention_policies"("dataType", "isActive");

-- CreateIndex
CREATE INDEX "user_consents_userId_consentType_idx" ON "user_consents"("userId", "consentType");

-- CreateIndex
CREATE INDEX "user_consents_consentDate_consentType_idx" ON "user_consents"("consentDate", "consentType");

-- CreateIndex
CREATE INDEX "user_consents_expiryDate_consentGiven_idx" ON "user_consents"("expiryDate", "consentGiven");

-- CreateIndex
CREATE INDEX "system_health_metrics_metricName_timestamp_idx" ON "system_health_metrics"("metricName", "timestamp");

-- CreateIndex
CREATE INDEX "system_health_metrics_timestamp_idx" ON "system_health_metrics"("timestamp");

-- CreateIndex
CREATE INDEX "system_health_metrics_instanceId_metricName_idx" ON "system_health_metrics"("instanceId", "metricName");

-- CreateIndex
CREATE UNIQUE INDEX "encryption_keys_keyVersion_key" ON "encryption_keys"("keyVersion");

-- CreateIndex
CREATE INDEX "encryption_keys_keyVersion_isActive_idx" ON "encryption_keys"("keyVersion", "isActive");

-- CreateIndex
CREATE INDEX "encryption_keys_keyPurpose_isActive_idx" ON "encryption_keys"("keyPurpose", "isActive");

-- CreateIndex
CREATE INDEX "encryption_keys_expiresAt_rotationDue_idx" ON "encryption_keys"("expiresAt", "rotationDue");

-- CreateIndex
CREATE INDEX "security_incidents_incidentType_severity_idx" ON "security_incidents"("incidentType", "severity");

-- CreateIndex
CREATE INDEX "security_incidents_status_severity_idx" ON "security_incidents"("status", "severity");

-- CreateIndex
CREATE INDEX "security_incidents_detectedAt_severity_idx" ON "security_incidents"("detectedAt", "severity");

-- CreateIndex
CREATE INDEX "performance_baselines_metricName_environment_idx" ON "performance_baselines"("metricName", "environment");

-- CreateIndex
CREATE INDEX "performance_baselines_validFrom_validUntil_idx" ON "performance_baselines"("validFrom", "validUntil");

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_supplierCode_key" ON "suppliers"("supplierCode");

-- CreateIndex
CREATE INDEX "suppliers_sppgId_isActive_idx" ON "suppliers"("sppgId", "isActive");

-- CreateIndex
CREATE INDEX "suppliers_supplierCode_sppgId_idx" ON "suppliers"("supplierCode", "sppgId");

-- CreateIndex
CREATE INDEX "suppliers_supplierType_category_isActive_idx" ON "suppliers"("supplierType", "category", "isActive");

-- CreateIndex
CREATE INDEX "suppliers_isPreferred_overallRating_idx" ON "suppliers"("isPreferred", "overallRating");

-- CreateIndex
CREATE INDEX "suppliers_complianceStatus_lastInspectionDate_idx" ON "suppliers"("complianceStatus", "lastInspectionDate");

-- CreateIndex
CREATE INDEX "suppliers_partnershipLevel_contractEndDate_idx" ON "suppliers"("partnershipLevel", "contractEndDate");

-- CreateIndex
CREATE INDEX "suppliers_deliveryRating_onTimeDeliveryRate_idx" ON "suppliers"("deliveryRating", "onTimeDeliveryRate");

-- CreateIndex
CREATE INDEX "suppliers_isActive_isBlacklisted_idx" ON "suppliers"("isActive", "isBlacklisted");

-- CreateIndex
CREATE INDEX "suppliers_city_province_deliveryRadius_idx" ON "suppliers"("city", "province", "deliveryRadius");

-- CreateIndex
CREATE INDEX "suppliers_minOrderValue_maxOrderCapacity_idx" ON "suppliers"("minOrderValue", "maxOrderCapacity");

-- CreateIndex
CREATE INDEX "suppliers_nextAuditDue_complianceStatus_idx" ON "suppliers"("nextAuditDue", "complianceStatus");

-- CreateIndex
CREATE INDEX "suppliers_createdAt_sppgId_idx" ON "suppliers"("createdAt", "sppgId");

-- CreateIndex
CREATE INDEX "supplier_evaluations_supplierId_evaluationPeriod_idx" ON "supplier_evaluations"("supplierId", "evaluationPeriod");

-- CreateIndex
CREATE INDEX "supplier_evaluations_sppgId_evaluationType_idx" ON "supplier_evaluations"("sppgId", "evaluationType");

-- CreateIndex
CREATE INDEX "supplier_evaluations_overallScore_evaluationDate_idx" ON "supplier_evaluations"("overallScore", "evaluationDate");

-- CreateIndex
CREATE UNIQUE INDEX "supplier_contracts_contractNumber_key" ON "supplier_contracts"("contractNumber");

-- CreateIndex
CREATE INDEX "supplier_contracts_supplierId_contractStatus_idx" ON "supplier_contracts"("supplierId", "contractStatus");

-- CreateIndex
CREATE INDEX "supplier_contracts_sppgId_contractType_idx" ON "supplier_contracts"("sppgId", "contractType");

-- CreateIndex
CREATE INDEX "supplier_contracts_endDate_autoRenew_idx" ON "supplier_contracts"("endDate", "autoRenew");

-- CreateIndex
CREATE INDEX "supplier_products_supplierId_category_idx" ON "supplier_products"("supplierId", "category");

-- CreateIndex
CREATE INDEX "supplier_products_sppgId_isAvailable_idx" ON "supplier_products"("sppgId", "isAvailable");

-- CreateIndex
CREATE INDEX "supplier_products_category_isAvailable_idx" ON "supplier_products"("category", "isAvailable");

-- CreateIndex
CREATE UNIQUE INDEX "supplier_products_supplierId_productCode_key" ON "supplier_products"("supplierId", "productCode");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sppg" ADD CONSTRAINT "sppg_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES "provinces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sppg" ADD CONSTRAINT "sppg_regencyId_fkey" FOREIGN KEY ("regencyId") REFERENCES "regencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sppg" ADD CONSTRAINT "sppg_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "districts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sppg" ADD CONSTRAINT "sppg_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES "villages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "subscription_packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_tracking" ADD CONSTRAINT "budget_tracking_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_package_features" ADD CONSTRAINT "subscription_package_features_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "subscription_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "payment_methods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_tracking" ADD CONSTRAINT "usage_tracking_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_changes" ADD CONSTRAINT "subscription_changes_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_changes" ADD CONSTRAINT "subscription_changes_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_changes" ADD CONSTRAINT "subscription_changes_fromPackageId_fkey" FOREIGN KEY ("fromPackageId") REFERENCES "subscription_packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_changes" ADD CONSTRAINT "subscription_changes_toPackageId_fkey" FOREIGN KEY ("toPackageId") REFERENCES "subscription_packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trial_subscriptions" ADD CONSTRAINT "trial_subscriptions_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trial_notifications" ADD CONSTRAINT "trial_notifications_trialId_fkey" FOREIGN KEY ("trialId") REFERENCES "trial_subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_cycles" ADD CONSTRAINT "billing_cycles_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_cycles" ADD CONSTRAINT "billing_cycles_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_cycles" ADD CONSTRAINT "billing_cycles_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dunning_processes" ADD CONSTRAINT "dunning_processes_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dunning_processes" ADD CONSTRAINT "dunning_processes_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dunning_actions" ADD CONSTRAINT "dunning_actions_dunningProcessId_fkey" FOREIGN KEY ("dunningProcessId") REFERENCES "dunning_processes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revenue_recognition" ADD CONSTRAINT "revenue_recognition_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revenue_recognition" ADD CONSTRAINT "revenue_recognition_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revenue_recognition" ADD CONSTRAINT "revenue_recognition_billingCycleId_fkey" FOREIGN KEY ("billingCycleId") REFERENCES "billing_cycles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revenue_schedule_items" ADD CONSTRAINT "revenue_schedule_items_revenueRecognitionId_fkey" FOREIGN KEY ("revenueRecognitionId") REFERENCES "revenue_recognition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_health_scores" ADD CONSTRAINT "customer_health_scores_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_ticket_responses" ADD CONSTRAINT "support_ticket_responses_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "support_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_templates" ADD CONSTRAINT "notification_templates_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "notification_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_logs" ADD CONSTRAINT "email_logs_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "email_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_deliveries" ADD CONSTRAINT "notification_deliveries_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "notifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_campaigns" ADD CONSTRAINT "notification_campaigns_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_notification_preferences" ADD CONSTRAINT "user_notification_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_preferredSupplierId_fkey" FOREIGN KEY ("preferredSupplierId") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "inventory_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procurement_plans" ADD CONSTRAINT "procurement_plans_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procurement_plans" ADD CONSTRAINT "procurement_plans_programId_fkey" FOREIGN KEY ("programId") REFERENCES "nutrition_programs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procurements" ADD CONSTRAINT "procurements_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procurements" ADD CONSTRAINT "procurements_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procurements" ADD CONSTRAINT "procurements_planId_fkey" FOREIGN KEY ("planId") REFERENCES "procurement_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procurement_items" ADD CONSTRAINT "procurement_items_procurementId_fkey" FOREIGN KEY ("procurementId") REFERENCES "procurements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procurement_items" ADD CONSTRAINT "procurement_items_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "inventory_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_beneficiaries" ADD CONSTRAINT "school_beneficiaries_programId_fkey" FOREIGN KEY ("programId") REFERENCES "nutrition_programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_beneficiaries" ADD CONSTRAINT "school_beneficiaries_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES "villages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_productions" ADD CONSTRAINT "food_productions_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_productions" ADD CONSTRAINT "food_productions_programId_fkey" FOREIGN KEY ("programId") REFERENCES "nutrition_programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_productions" ADD CONSTRAINT "food_productions_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "nutrition_menus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quality_controls" ADD CONSTRAINT "quality_controls_productionId_fkey" FOREIGN KEY ("productionId") REFERENCES "food_productions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_distributions" ADD CONSTRAINT "food_distributions_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_distributions" ADD CONSTRAINT "food_distributions_programId_fkey" FOREIGN KEY ("programId") REFERENCES "nutrition_programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_distributions" ADD CONSTRAINT "food_distributions_productionId_fkey" FOREIGN KEY ("productionId") REFERENCES "food_productions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_nutrition_calculations" ADD CONSTRAINT "menu_nutrition_calculations_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "nutrition_menus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_nutrition_calculations" ADD CONSTRAINT "menu_nutrition_calculations_requirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "nutrition_requirements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_cost_calculations" ADD CONSTRAINT "menu_cost_calculations_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "nutrition_menus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "positions" ADD CONSTRAINT "positions_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "positions" ADD CONSTRAINT "positions_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "positions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_workScheduleId_fkey" FOREIGN KEY ("workScheduleId") REFERENCES "work_schedules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES "villages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_schedules" ADD CONSTRAINT "work_schedules_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_distributions" ADD CONSTRAINT "school_distributions_programId_fkey" FOREIGN KEY ("programId") REFERENCES "nutrition_programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_distributions" ADD CONSTRAINT "school_distributions_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "school_beneficiaries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_distributions" ADD CONSTRAINT "school_distributions_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "nutrition_menus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_feeding_reports" ADD CONSTRAINT "school_feeding_reports_distributionId_fkey" FOREIGN KEY ("distributionId") REFERENCES "school_distributions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_feeding_reports" ADD CONSTRAINT "school_feeding_reports_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "school_beneficiaries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_monitoring" ADD CONSTRAINT "program_monitoring_programId_fkey" FOREIGN KEY ("programId") REFERENCES "nutrition_programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nutrition_programs" ADD CONSTRAINT "nutrition_programs_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nutrition_menus" ADD CONSTRAINT "nutrition_menus_programId_fkey" FOREIGN KEY ("programId") REFERENCES "nutrition_programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_ingredients" ADD CONSTRAINT "menu_ingredients_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "nutrition_menus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_ingredients" ADD CONSTRAINT "menu_ingredients_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "inventory_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_steps" ADD CONSTRAINT "recipe_steps_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "nutrition_menus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_plans" ADD CONSTRAINT "menu_plans_programId_fkey" FOREIGN KEY ("programId") REFERENCES "nutrition_programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_plans" ADD CONSTRAINT "menu_plans_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_plans" ADD CONSTRAINT "menu_plans_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_plans" ADD CONSTRAINT "menu_plans_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_assignments" ADD CONSTRAINT "menu_assignments_menuPlanId_fkey" FOREIGN KEY ("menuPlanId") REFERENCES "menu_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_assignments" ADD CONSTRAINT "menu_assignments_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "nutrition_menus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_assignments" ADD CONSTRAINT "menu_assignments_productionId_fkey" FOREIGN KEY ("productionId") REFERENCES "food_productions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_plan_templates" ADD CONSTRAINT "menu_plan_templates_menuPlanId_fkey" FOREIGN KEY ("menuPlanId") REFERENCES "menu_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_plan_templates" ADD CONSTRAINT "menu_plan_templates_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_plan_templates" ADD CONSTRAINT "menu_plan_templates_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_documents" ADD CONSTRAINT "employee_documents_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_certifications" ADD CONSTRAINT "employee_certifications_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_attendances" ADD CONSTRAINT "employee_attendances_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_balances" ADD CONSTRAINT "leave_balances_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payrolls" ADD CONSTRAINT "payrolls_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_reviews" ADD CONSTRAINT "performance_reviews_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trainings" ADD CONSTRAINT "trainings_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_trainings" ADD CONSTRAINT "employee_trainings_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_trainings" ADD CONSTRAINT "employee_trainings_trainingId_fkey" FOREIGN KEY ("trainingId") REFERENCES "trainings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disciplinary_actions" ADD CONSTRAINT "disciplinary_actions_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sppg_virtual_accounts" ADD CONSTRAINT "sppg_virtual_accounts_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banper_requests" ADD CONSTRAINT "banper_requests_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banper_requests" ADD CONSTRAINT "banper_requests_virtualAccountId_fkey" FOREIGN KEY ("virtualAccountId") REFERENCES "sppg_virtual_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banper_transactions" ADD CONSTRAINT "banper_transactions_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banper_transactions" ADD CONSTRAINT "banper_transactions_virtualAccountId_fkey" FOREIGN KEY ("virtualAccountId") REFERENCES "sppg_virtual_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banper_transactions" ADD CONSTRAINT "banper_transactions_banperRequestId_fkey" FOREIGN KEY ("banperRequestId") REFERENCES "banper_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sppg_team_members" ADD CONSTRAINT "sppg_team_members_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sppg_team_members" ADD CONSTRAINT "sppg_team_members_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distribution_schedules" ADD CONSTRAINT "distribution_schedules_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distribution_deliveries" ADD CONSTRAINT "distribution_deliveries_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "distribution_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beneficiary_receipts" ADD CONSTRAINT "beneficiary_receipts_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beneficiary_receipts" ADD CONSTRAINT "beneficiary_receipts_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "distribution_deliveries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sppg_operational_reports" ADD CONSTRAINT "sppg_operational_reports_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kitchen_equipment" ADD CONSTRAINT "kitchen_equipment_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_maintenance" ADD CONSTRAINT "equipment_maintenance_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "kitchen_equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "utility_monitoring" ADD CONSTRAINT "utility_monitoring_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "laboratory_tests" ADD CONSTRAINT "laboratory_tests_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_safety_certifications" ADD CONSTRAINT "food_safety_certifications_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_food_samples" ADD CONSTRAINT "daily_food_samples_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_research" ADD CONSTRAINT "menu_research_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_test_results" ADD CONSTRAINT "menu_test_results_researchId_fkey" FOREIGN KEY ("researchId") REFERENCES "menu_research"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "local_food_adaptations" ADD CONSTRAINT "local_food_adaptations_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nutrition_consultations" ADD CONSTRAINT "nutrition_consultations_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nutrition_education" ADD CONSTRAINT "nutrition_education_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_optimizations" ADD CONSTRAINT "production_optimizations_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "waste_management" ADD CONSTRAINT "waste_management_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_analytics" ADD CONSTRAINT "performance_analytics_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sppg_benchmarking" ADD CONSTRAINT "sppg_benchmarking_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_activities" ADD CONSTRAINT "user_activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_audit_logs" ADD CONSTRAINT "user_audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_audit_logs" ADD CONSTRAINT "user_audit_logs_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_onboarding" ADD CONSTRAINT "user_onboarding_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "regencies" ADD CONSTRAINT "regencies_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES "provinces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "districts" ADD CONSTRAINT "districts_regencyId_fkey" FOREIGN KEY ("regencyId") REFERENCES "regencies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "villages" ADD CONSTRAINT "villages_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "districts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ab_tests" ADD CONSTRAINT "ab_tests_landingPageId_fkey" FOREIGN KEY ("landingPageId") REFERENCES "landing_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ab_test_variants" ADD CONSTRAINT "ab_test_variants_testId_fkey" FOREIGN KEY ("testId") REFERENCES "ab_tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_comments" ADD CONSTRAINT "blog_comments_blogPostId_fkey" FOREIGN KEY ("blogPostId") REFERENCES "blog_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_comments" ADD CONSTRAINT "blog_comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "blog_comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_studies" ADD CONSTRAINT "case_studies_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_studies" ADD CONSTRAINT "case_studies_testimonialId_fkey" FOREIGN KEY ("testimonialId") REFERENCES "testimonials"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_captures" ADD CONSTRAINT "lead_captures_landingPageId_fkey" FOREIGN KEY ("landingPageId") REFERENCES "landing_pages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_captures" ADD CONSTRAINT "lead_captures_demoRequestId_fkey" FOREIGN KEY ("demoRequestId") REFERENCES "demo_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_captures" ADD CONSTRAINT "lead_captures_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "image_folders" ADD CONSTRAINT "image_folders_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "image_folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "image_files" ADD CONSTRAINT "image_files_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "image_folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_analytics" ADD CONSTRAINT "page_analytics_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "landing_pages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demo_requests" ADD CONSTRAINT "demo_requests_demoSppgId_fkey" FOREIGN KEY ("demoSppgId") REFERENCES "sppg"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demo_requests" ADD CONSTRAINT "demo_requests_convertedSppgId_fkey" FOREIGN KEY ("convertedSppgId") REFERENCES "sppg"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demo_analytics" ADD CONSTRAINT "demo_analytics_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feature_usages" ADD CONSTRAINT "feature_usages_featureFlagId_fkey" FOREIGN KEY ("featureFlagId") REFERENCES "feature_flags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feature_usages" ADD CONSTRAINT "feature_usages_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feature_usages" ADD CONSTRAINT "feature_usages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_stakeholders" ADD CONSTRAINT "feedback_stakeholders_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_stakeholderId_fkey" FOREIGN KEY ("stakeholderId") REFERENCES "feedback_stakeholders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_programId_fkey" FOREIGN KEY ("programId") REFERENCES "nutrition_programs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "nutrition_menus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_distributionId_fkey" FOREIGN KEY ("distributionId") REFERENCES "food_distributions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_responses" ADD CONSTRAINT "feedback_responses_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "feedback"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_escalations" ADD CONSTRAINT "feedback_escalations_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "feedback"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_activities" ADD CONSTRAINT "feedback_activities_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "feedback"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_analytics" ADD CONSTRAINT "feedback_analytics_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_slas" ADD CONSTRAINT "feedback_slas_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_templates" ADD CONSTRAINT "feedback_templates_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beneficiary_feedback_legacy" ADD CONSTRAINT "beneficiary_feedback_legacy_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beneficiary_feedback_legacy" ADD CONSTRAINT "beneficiary_feedback_legacy_programId_fkey" FOREIGN KEY ("programId") REFERENCES "nutrition_programs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beneficiary_feedback_legacy" ADD CONSTRAINT "beneficiary_feedback_legacy_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "nutrition_menus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beneficiary_feedback_legacy" ADD CONSTRAINT "beneficiary_feedback_legacy_distributionId_fkey" FOREIGN KEY ("distributionId") REFERENCES "food_distributions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beneficiary_feedback_legacy" ADD CONSTRAINT "beneficiary_feedback_legacy_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "school_beneficiaries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_categories" ADD CONSTRAINT "document_categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "document_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_categories" ADD CONSTRAINT "document_categories_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_type_configs" ADD CONSTRAINT "document_type_configs_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_documentTypeId_fkey" FOREIGN KEY ("documentTypeId") REFERENCES "document_type_configs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "document_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_versions" ADD CONSTRAINT "document_versions_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_versions" ADD CONSTRAINT "document_versions_previousId_fkey" FOREIGN KEY ("previousId") REFERENCES "document_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_versions" ADD CONSTRAINT "document_versions_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_versions" ADD CONSTRAINT "document_versions_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_approvals" ADD CONSTRAINT "document_approvals_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_approvals" ADD CONSTRAINT "document_approvals_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_approvals" ADD CONSTRAINT "document_approvals_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "digital_signatures" ADD CONSTRAINT "digital_signatures_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "digital_signatures" ADD CONSTRAINT "digital_signatures_approvalId_fkey" FOREIGN KEY ("approvalId") REFERENCES "document_approvals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "digital_signatures" ADD CONSTRAINT "digital_signatures_signerId_fkey" FOREIGN KEY ("signerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "digital_signatures" ADD CONSTRAINT "digital_signatures_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_permissions" ADD CONSTRAINT "document_permissions_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_permissions" ADD CONSTRAINT "document_permissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_permissions" ADD CONSTRAINT "document_permissions_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_permissions" ADD CONSTRAINT "document_permissions_grantedBy_fkey" FOREIGN KEY ("grantedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_activities" ADD CONSTRAINT "document_activities_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_activities" ADD CONSTRAINT "document_activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_activities" ADD CONSTRAINT "document_activities_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_comments" ADD CONSTRAINT "document_comments_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_comments" ADD CONSTRAINT "document_comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "document_comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_comments" ADD CONSTRAINT "document_comments_resolvedBy_fkey" FOREIGN KEY ("resolvedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_comments" ADD CONSTRAINT "document_comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_comments" ADD CONSTRAINT "document_comments_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_shares" ADD CONSTRAINT "document_shares_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_shares" ADD CONSTRAINT "document_shares_sharedBy_fkey" FOREIGN KEY ("sharedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_shares" ADD CONSTRAINT "document_shares_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_templates" ADD CONSTRAINT "document_templates_documentTypeId_fkey" FOREIGN KEY ("documentTypeId") REFERENCES "document_type_configs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_templates" ADD CONSTRAINT "document_templates_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "document_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_templates" ADD CONSTRAINT "document_templates_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_templates" ADD CONSTRAINT "document_templates_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_consents" ADD CONSTRAINT "user_consents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_evaluations" ADD CONSTRAINT "supplier_evaluations_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_evaluations" ADD CONSTRAINT "supplier_evaluations_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_contracts" ADD CONSTRAINT "supplier_contracts_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_contracts" ADD CONSTRAINT "supplier_contracts_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_products" ADD CONSTRAINT "supplier_products_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_products" ADD CONSTRAINT "supplier_products_sppgId_fkey" FOREIGN KEY ("sppgId") REFERENCES "sppg"("id") ON DELETE CASCADE ON UPDATE CASCADE;
