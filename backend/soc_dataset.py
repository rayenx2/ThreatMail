SOC_DATASET = []

# =========================
# PHISHING (20)
# =========================
phishing_emails = [
    "Urgent Password Reset Required. secure-microsoftverify-login.com",
    "Payroll Update Required employee-payroll-update.net",
    "Account Locked Immediate Action account-verify-security.com",
    "Package Delivery Failed delivery-reschedule.info",
    "Student Loan Verification Required student-loan-verify.net",
    "Microsoft Security Alert security-microsoft-alert.com",
    "HR Benefits Expiring hr-benefits-update.org",
    "IT Admin Alert workstation locked it-admin-security-check.com",
    "Tax Refund Available irs-tax-refund-check.net",
    "Zoom Account Suspended zoom-security-login.net",
    "Bank Verification Required bank-secure-verify.com",
    "Scholarship Approval Pending scholarship-approval.net",
    "DocuSign Document Pending docusign-secure-sign.net",
    "Shared File Access Expiring file-share-security.net",
    "Microsoft Account Suspended secure-microsoftverify-login.com",
    "Paystub Update Required payroll-update-secure.net",
    "HR Portal Login Required hr-login-verify.net",
    "Security Alert Immediate Action security-alert-center.com",
    "Payment Failed Update Required payment-update-secure.net",
    "Account Verification Needed account-verify-now.net",
]

for e in phishing_emails:
    SOC_DATASET.append({
        "email": e,
        "label": "phishing"
    })

# =========================
# LEGIT (20)
# =========================
legit_emails = [
    "Team meeting tomorrow at 10am Conference Room B",
    "Updated syllabus posted on Blackboard",
    "Project status report attached for review",
    "Reminder: faculty workshop next Thursday",
    "Monthly newsletter is available on university site",
    "Expense reimbursement has been processed",
    "Submit final project documentation by Monday",
    "Research meeting moved to 3 PM Thursday",
    "Class schedule updated for Fall semester",
    "IT maintenance scheduled Sunday 2AM–4AM",
    "Campus library hours have been updated",
    "Faculty lunch event scheduled Friday noon",
    "Parking permit renewal is complete",
    "Academic advising appointments are open",
    "Blackboard system update completed successfully",
    "Security awareness reminder email",
    "HR policy update document attached",
    "Google Drive shared document from colleague",
    "Zoom meeting invitation for project discussion",
    "Internal training session scheduled next week",
]

for e in legit_emails:
    SOC_DATASET.append({
        "email": e,
        "label": "legit"
    })