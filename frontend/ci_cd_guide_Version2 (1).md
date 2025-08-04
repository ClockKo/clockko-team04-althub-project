# How CI/CD with GitHub Actions Works in Our Project

## What happens when you push code or make a Pull Request (PR)?

1. **You create a branch for your feature (e.g. `feature/auth`).**
2. **You push your code to GitHub, or open a Pull Request to merge your branch into `main`.**
3. **GitHub Actions automatically runs our CI pipeline:**
   - **`pnpm lint`** checks for code style and formatting errors.
   - **`pnpm test`** runs all our automated tests.
   - **`pnpm build`** ensures the app builds without errors.

## What do you see on the Pull Request page?

- On your PR, you'll see a section called **"Checks"** or **"Actions"**.
- If everything passes, you'll see a green ✅ ("All checks have passed").
- If something fails, you'll see a red ❌ with details on what went wrong (for example, a test failed or there was a lint error).

## Example: PR with Passing Checks

```
✅ All checks have passed
- lint: passed
- test: passed
- build: passed
```

## Example: PR with Failing Checks

```
❌ Some checks failed
- lint: failed (e.g. unexpected console.log)
- test: passed
- build: passed
```
Click on the failed check to see details and fix your code.  
Push your changes again and the checks will re-run automatically.

## Why is this important?

- **Keeps our codebase clean and working for everyone.**
- **Prevents bugs and style issues from reaching `main`.**
- **Saves you time—no need to run everything manually!**

## What do you need to do?

1. Push your branch as usual.
2. Check your PR's status—fix any errors if checks fail.
3. Once everything passes, your code is ready to be merged.

---

**Tip:**  
If you ever see a failing check, click on it for details. Ask in the team chat if you need help!
