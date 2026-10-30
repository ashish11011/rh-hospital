# Website course item access

`course_item.access_type` uses the PostgreSQL enum `course_item_access_type`:

- `paid` (default): requires an active course enrollment.
- `free`: can be opened by any logged-in, active user from `/courses/[slug]`, without course enrollment or membership.
- `free_for_members`: can be opened by an active user with an activated, unexpired RH membership card, or an enrolled course user.

Admins choose the access type when adding or editing a course item. The public curriculum labels free and member items; paid items have no access badge. Videos open in a dialog on the course page, and documents use the signed media proxy.

Lesson titles are clickable, with a green Free badge or a Members only badge and no separate Watch lesson or Open resource buttons. Clicking a free or member item redirects guests to sign in, with a return link to the course page. Logged-in users without membership who click a member item see a membership-required message and a link to create an RH Membership Card in their dashboard. An active course enrollment grants access to every item in that course, regardless of its access type or the user's membership status.

These website item grants do not insert or update `course_enrolment`, save course progress, award certificates, or add courses to the dashboard. The dashboard and mobile APIs continue to require course enrollment. Mobile grant callers do not enable the website item-access option.

## Database migration

`db/migrations/0008_nasty_spyke.sql` creates the enum and adds the non-null column. Existing rows default to `paid`. Apply this migration through the project's normal database migration process before deploying the schema-dependent code. Generating the migration does not apply it to a database.
