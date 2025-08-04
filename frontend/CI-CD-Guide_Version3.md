# Guide: How CI/CD with GitHub Actions Works in Our Project

## What is CI/CD?

**CI/CD** means every code change we push or propose goes through automatic checks for quality and correctness before it is merged into `main`.  
This keeps our app stable and saves everyone manual work!

---

## Our Team Workflow

1. **Create a branch for your feature**  
   Example: `feature/auth`, `feature/tasks`, etc.

2. **Push your code to GitHub**  
   When you push, GitHub Actions starts running automated checks.

3. **Open a Pull Request (PR) to merge your branch into `main`**  
   Checks run again.

---

## What Checks Run?

- **Lint** (`pnpm lint`): Checks code style and formatting
- **Test** (`pnpm test`): Runs automated tests
- **Build** (`pnpm build`): Makes sure the app builds without errors

---

## How to See Checks on Your Pull Request

### When you open a PR, you’ll see a section like this at the bottom:
- Green ✅ means all checks passed and your code is ready to merge.

---

### If something fails, you’ll see a red ❌:
- Click **Details** to see what went wrong (for example, a failed test or lint error).

---

## Example: Checks Section in a Pull Request

```
✅ All checks have passed
- lint: passed
- test: passed
- build: passed
```

```
❌ Some checks failed
- lint: failed (e.g., missing semicolon)
- test: passed
- build: passed
```

---

## What Should You Do If Checks Fail?

1. Click **Details** next to the failed check.
2. Read the error message (for example, “Unexpected console.log” or “Test failed”).
3. Fix the issue in your code.
4. Push your changes again. The checks will run automatically!

---

## Why Is This Important?

- Keeps our codebase clean and working for everyone
- Prevents bugs and style issues from reaching `main`
- Saves time—no need to run everything manually

---

## What Do You Need to Do?

1. Push your branch as usual.
2. Check your PR’s status—fix any errors if checks fail.
3. Once everything passes, your code is ready to be merged (by the team lead).

---

**Tip:**  
If you ever see a failing check, click on it for details.  
Ask in the team chat if you need help!

---

## More Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Understanding Pull Request Checks](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-status-checks)
