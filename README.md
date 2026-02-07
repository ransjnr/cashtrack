# CashTrack

CashTrack is a personal finance app that helps users track cash on hand, bank
balances, and every transaction in one place. It keeps cash and bank activity
separate while giving a clear total balance so you know where you stand today.

## Features

- Track cash on hand and bank or digital money side by side
- Record income and expense transactions
- See total balance, daily net, and cash vs bank mix at a glance
- Connect to the CashTrack API to fetch or update your profile
- Local storage keeps your data between sessions

## Getting started

```bash
npm install
npm run dev
```

## CashTrack API

The app connects to the following endpoints using a bearer token:

- `GET https://cashtrack-01.onrender.com/api/v1/users/profile`
- `PUT https://cashtrack-01.onrender.com/api/v1/users/profile`

Paste your token in the Profile section to fetch or update your profile details.
