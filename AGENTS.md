<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Services are stored in Lovable Cloud with public read-only access and Realtime subscriptions; this lets saved edits reach visitors without code changes.
- The /admin shared-password gate uses server-verified encrypted sessions, same-origin writes, persistent login throttling, and session-checked privileged service mutations; never expose the password or allow browser database writes.
