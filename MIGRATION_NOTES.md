DB & State consistency notes

- Change: The backend will no longer use the vehicle state "Contratado" when an offer is accepted because the database currently defines vehicle.estado ENUM('Disponible','En viaje').
- Implementation: On offer acceptance the server now sets the vehicle `estado` to "En viaje" (OfferService) — this avoids database ENUM constraint violations.
- Additionally, notifications that reference the accepted offer are removed for the accepting conductor so the offer notification no longer stays in their inbox.

Recommended follow-ups:
- If you'd rather keep the concept of "Contratado" as a distinct vehicle state, we can add a DB migration to extend the `vehicles.estado` ENUM to include 'Contratado' and 'Mantenimiento'. That may be useful if you want an intermediate 'Contratado' phase separate from 'En viaje'.
- Add API tests around the offers->accept flow (creating a trip, updating offer.trip_id, updating vehicle status, deleting conductor notifications).
Running the migration script
---------------------------------
If you are running this project against an existing database that was created before trip_id or notifications.offer_id were added, run the migration script once before starting the server:

```bash
# From project root
node scripts/ensure_schema.js
```

Or using npm helper:

```bash
npm run migrate
```

This script will safely add the missing columns if they don't exist.
