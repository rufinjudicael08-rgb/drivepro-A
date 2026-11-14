# DrivePro Academy — Firestore Security Specification

## 1. Data Invariants
1. **Strict Ownership & PII Isolation**: A candidate's `registrations`, `payments`, and `quiz_attempts` contain PII (`email`, `phone`, `fullName`). Only the owning authenticated user (`userId == request.auth.uid`) or a verified Admin (`lokossoujudicael00@gmail.com` or `/admins/{uid}`) may read or list them.
2. **Locked Tunnel Enforcement**: A candidate cannot create a registration already marked `paid`, `verified`, `code_unlocked`, or `practical_ready`. Initial creation MUST start with `paymentStatus == 'pending'` and `dossierStatus == 'locked'`.
3. **Atomic Payment Unlock (`existsAfter`)**: A candidate may only transition `paymentStatus` from `'pending'` to `'paid'` and `dossierStatus` from `'locked'` to `'code_unlocked'` if a valid `payments/{latestPaymentId}` document is created atomically in the same batch.
4. **Administrative Verification Gate**: Only an Admin can set `paymentStatus == 'verified'` or `dossierStatus == 'practical_ready'`, or refund a payment.
5. **Temporal & Identity Integrity**: All `createdAt` fields must equal `request.time` on creation and remain immutable forever; all `updatedAt` fields must equal `request.time`; `userId` and `agentId` cannot be spoofed or reassigned.
6. **Verified Auth**: All writes require `request.auth != null && request.auth.token.email_verified == true`.

## 2. The "Dirty Dozen" Adversarial Payloads
1. Unauthenticated read/write to `/registrations/{id}` -> `PERMISSION_DENIED`
2. Unverified email (`email_verified: false`) attempting admin read or candidate create -> `PERMISSION_DENIED`
3. Candidate trying to create a registration with `paymentStatus: "paid"` and `dossierStatus: "practical_ready"` (bypassing payment lock) -> `PERMISSION_DENIED`
4. Candidate trying to create a registration with `userId` set to another user's UID (Identity Spoofing) -> `PERMISSION_DENIED`
5. Candidate trying to update `paymentStatus` to `"paid"` without an atomic payment document (`existsAfter`) -> `PERMISSION_DENIED`
6. Candidate trying to inject a shadow field `"isAdmin": true` or `"isVerified": true` -> `PERMISSION_DENIED`
7. Candidate trying to mutate `createdAt` or `baseFeeXof` during an update -> `PERMISSION_DENIED`
8. Candidate trying to read another candidate's registration or payment log (`get` or `list`) -> `PERMISSION_DENIED`
9. Candidate trying to escalate `dossierStatus` to `"practical_ready"` or `paymentStatus` to `"verified"` without admin privileges -> `PERMISSION_DENIED`
10. Attacker injecting a >128 char or non-alphanumeric document ID -> `PERMISSION_DENIED`
11. Attacker creating a `quiz_attempt` referencing a non-existent `registrationId` -> `PERMISSION_DENIED`
12. Non-admin trying to create or read `/social_links` belonging to another agent -> `PERMISSION_DENIED`
13. Unverified or non-owner user trying to publish a `/testimonials` story spoofing `verifiedGraduate: true` without a paid/verified registration -> `PERMISSION_DENIED`
14. Candidate trying to list `'pending'` testimonials belonging to other users -> `PERMISSION_DENIED`

