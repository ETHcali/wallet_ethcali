-- Certificates for the people who made the event happen, not only the builders.
--
-- `role` says what the certificate certifies: builder (the default, every row
-- so far), organizer, mentor, judge, volunteer, speaker. A builder's row keeps
-- its project; a contributor's has none, so project_slug/project_name become
-- nullable and the one-per-person rule becomes (event, project-or-role, email):
-- one builder certificate per project, one contributor certificate per role.
--
-- Same contract, same token type. What differs — the diploma heading, the
-- line under the name, the LinkedIn name, the Role trait in the metadata — is
-- rendered from this one column by lib/certificates/events.ts (CERT_ROLES).

alter table public.builder_certificates
  add column role text not null default 'builder',
  alter column project_slug drop not null,
  alter column project_name drop not null;

alter table public.builder_certificates
  drop constraint builder_certificates_one_per_person,
  add constraint builder_certificates_role
    check (role in ('builder', 'organizer', 'mentor', 'judge', 'volunteer', 'speaker')),
  add constraint builder_certificates_builder_has_project
    check (role <> 'builder' or (project_slug is not null and project_name is not null)),
  add constraint builder_certificates_project_pair
    check ((project_slug is null) = (project_name is null));

create unique index builder_certificates_one_per_person
  on public.builder_certificates (event, coalesce(project_slug, role), email);
