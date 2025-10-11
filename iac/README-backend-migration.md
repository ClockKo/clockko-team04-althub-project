# Backend Infra Migration to iac/

We are migrating `backend/infra` to the new `iac/` structure.

## Plan
- Create `iac/modules/backend_service` and move resources from `backend/infra` into it (keeping the same resource names to avoid state drift).
- Create `iac/stacks/backend` that consumes the module and uses the shared S3/Dynamo remote state.
- Update CI to target `iac/stacks/backend`.
- Deprecate `backend/infra` after successful apply.

## Caution: State moves
If you have already applied `backend/infra`, you must migrate state rather than re-creating resources.

Option A: Use `terraform state mv` to move resources from the old root module addresses to module addresses (e.g., `module.backend_service`).

Option B: Use `terraform import` to import existing resources into the module’s addresses.

We will document exact addresses once the module contains all resources one-to-one from `backend/infra`.
