The Goal
Build a minimal internal tool for managing startup acceleration programs.
You need to create a system where admins can review application submitted by founders.

## Tech Requirements:
To align with our stack, you must use:

1. SvelteKit (svelte 5, svelte 5 synthax is required)
2. Any SQL database of you preference (we use MySQL) and Kysely as ORM (required)
3. Typescript for end to end type safety
4. Styling: we use tailwinnd css and shadcn-svelte, but you can pick any UI technology you choose
5. You can use docker, but this is not required 

## Database 
Your database must have following entities (note, you can add any additional columns you think are needed):

```prisma
Program {
  name
  isActive
}

Application {
  founderName
  email
  startupName
  createdAt
  status: "new" | "reviewed" | "accepted" | "rejected"
}
```

note: for simplification you don't need to add any authorization and users table

## Tasks you need to complete:

1. Setup database, there must be migrations and seeds needed, you are advised to populate `applications` with some values.

2. Create `/applications` page.
   This page must have a `select` with all the program `options` admins can choose from.
   This page must show applications for a selected program. Admins must be able to view each applications and change their status.

3. Each application must be sharable via a link. 

## Documentation.

Provide a README.md including:

1. Setup instructions (how to run locally).
2. A brief description of your architectural choices.
3. Your thoughts on what can be improved.
