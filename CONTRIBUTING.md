# Contributing to Good Jobs Backend

Thank you for your interest in contributing to the Good Jobs Backend API!

## Where do I go from here?

If you've noticed a bug or have a feature request, make sure to check our [Issues](../../issues) first. If it's a new idea or bug, please open a new issue.

## Pull Request Process

1. **Fork the repo** and create your branch from `master`.
2. **Commit your changes**. Use clear and descriptive commit messages (e.g., `feat: add new endpoint for user applications` or `fix: resolve CORS issue`).
3. **Test your changes** using Postman, cURL, or by running the Good Jobs Frontend locally against your modified backend.
4. **Update the README.md** if your changes add new environment variables, endpoints, or setup dependencies.
5. **Issue a Pull Request**. Ensure the PR description clearly details the problem and your solution.

## Code Style

- **Node/Express:** Follow standard Node.js practices. Use `const` and `let`. Ensure proper error handling in all new API routes to prevent unhandled promise rejections.
- **Data Schemas:** If modifying the mock data files in `data/`, ensure the JSON structure remains consistent with the frontend types.

## Code of Conduct

Please note that this project is released with a [Contributor Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.
