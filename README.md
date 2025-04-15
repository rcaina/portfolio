# Portal

## Getting Started

First make sure you have installed Node, [Docker](https://docs.docker.com/desktop/install/mac-install/).

Start the local database with Docker:

```bash
docker compose up -d
```

Install dependencies:

```bash
npm install
```

Apply migrations and generate Prisma client :

```bash
npx prisma migrate dev
```

Run the development server:

````bash
npm run dev

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Database

### Prisma

The database is managed by [Prisma](https://www.prisma.io/). The schema is defined in [schema.prisma](/prisma/schema.prisma). The database is hosted on [AWS RDS](https://us-west-2.console.aws.amazon.com/rds/home?region=us-west-2#databases:).

### Migrations

To create a new migration, run:

```bash
npx prisma migrate dev --name <migration-name>
````

To apply migrations to the database, run:

```bash
npx prisma migrate deploy
```

To generate the Prisma client, run:

```bash
npx prisma generate
```

To view or edit the database, use Prisma Studio:

```bash
npx prisma studio
```

To reset the database, run:

```bash
npx prisma migrate reset
```

To seed the database, run:

```bash
npx prisma db seed
```

### Database ERD

![Database ERD](/prisma/ERD.svg "Database ERD")

## Deployed on AWS Amplify

The app is deployed on [Render](https://render.com/) and can be accessed at [https://dashboard.render.com/](https://dashboard.render.com/)
