# Database dumps

This folder contains database dumps for the eTutor project.

## Fixture (JSON) – Django dumpdata

- **`etutor_fixture_*.json`** – Full database export via `manage.py dumpdata`.
  - Use to load sample/backup data into a fresh database:  
    `python manage.py loaddata database_dumps/etutor_fixture_YYYYMMDD.json`
  - Excludes `contenttypes` and `auth.Permission` to avoid conflicts when loading.

## Creating a new dump

From the **etutor-api** directory:

```bash
# Django fixture (recommended; works with any DB backend)
python manage.py dumpdata --natural-foreign --natural-primary -e contenttypes -e auth.Permission --indent 2 -o database_dumps/etutor_fixture_$(date +%Y%m%d).json
```

Optional – raw PostgreSQL dump (requires `pg_dump` and DB running):

```bash
PGPASSWORD=postgres pg_dump -h localhost -p 5432 -U postgres -d etutor_db --no-owner --no-acl -F p -f database_dumps/etutor_db_dump_$(date +%Y%m%d).sql
```

## Restoring from fixture

```bash
cd etutor-api
python manage.py loaddata database_dumps/etutor_fixture_YYYYMMDD.json
```

Replace `YYYYMMDD` with the actual date in the filename.
