# Notice PDF Generator

A local Next.js application for creating structured PDF case-document drafts.

## Manual fields

The main generator intentionally keeps the operator input limited to:

- Full name
- Phone number
- Email address
- Transaction amount
- Transaction date
- Transaction ID / UTR
- UPI ID
- Bank name
- Bank account number
- IFSC code

The following are fixed by the application and are not editable from the main form:

- Document subject
- Notice body
- Case classification wording
- Document identity/unit wording
- Public-reference information
- Draft/internal disclaimer
- Reference number format and current date (generated automatically)

The account number is masked in the A4 preview by default and can be revealed only in the input form.

## Run on Windows

1. Install Node.js 20+.
2. Open Command Prompt in this folder.
3. Run:

```cmd
npm install
npm run dev
```

4. Open http://localhost:3000

## Build for production

```cmd
npm run build
npm start
```

## Important

This application is a document drafting tool. It does not verify identity, allegations, legal applicability, or authority to issue a notice. The generated document is explicitly marked as an internal draft/non-official document unless separately authorized and issued through a competent process.
