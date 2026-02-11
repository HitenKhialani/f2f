# BSAS Supply Chain (Django + DRF)

## Overview
This repository contains a Django REST API skeleton for the BSAS supply chain workflow. It uses Django's built-in auth system for stakeholders and SQLite as the database.

## Setup
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

## Stakeholders (built-in Django modules)
Stakeholders are stored as Django `User` accounts with an attached `StakeholderProfile` and can be managed with the built-in admin panel. Use Django Groups to represent roles (farmer, transporter, distributor, retailer, consumer, admin) if you want role-based permissions.

## API endpoints
The REST API is exposed under `/api/` using Django REST Framework viewsets.

## Cursor prompt
Use this prompt in Cursor when extending the system:

```
You are working on the BSAS supply-chain backend. Keep Django + DRF, use SQLite, and use Django's built-in auth modules for stakeholders.
- Maintain the existing models and add fields/relations rather than creating parallel models.
- Prefer DRF viewsets/routers for endpoints.
- Keep the API under /api/ and follow REST conventions.
- Add minimal documentation in README.md for new features.
```
