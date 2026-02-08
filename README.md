# Lotto Numbers

The "Lotto Numbers" project is a repository designed to generate a single suggested EuroJackpot ticket per click. It combines a lightweight heuristic algorithm with historical data retrieval, enabling users to generate and explore varied number combinations without implying any predictive advantage.
<br><br>

![github preview image](./public/github-preview.webp)

## Usage

To use this repository, follow these steps:

1. Clone the repository to your local machine.
2. Install the dependencies by running the command `npm install`.
3. Run the development server using `npm run dev`.
4. Open your web browser and navigate to `http://localhost:5173` to view the application.

To refresh the historical dataset used by the generator, run `python pastResults.py` to regenerate `eurojackpot_data.csv` and `eurojackpot_data.json`.

## Features

- Generates one suggested EuroJackpot ticket per click using rotating, lightweight heuristics.
- Fetches past EuroJackpot data for reference.
- Provides a user interface to view the generated numbers and star numbers.
- Includes clear probability disclaimers and a short rationale for each suggestion.
- Allows generating new suggestions on demand.

To automate testing and guarantee a consistent coding style, this repository utilizes the following tools:

- [Husky](https://www.npmjs.com/package/husky): A Git hook manager that allows running scripts before committing or pushing code changes.
- [lint-staged](https://www.npmjs.com/package/lint-staged): A tool that runs linters on staged files, allowing you to check and format code changes before they are committed.
- [Vitest](https://www.npmjs.com/package/vitest): A fast and lightweight test runner for JavaScript and TypeScript projects.
- [ESLint](https://eslint.org/): A pluggable linting utility for JavaScript and TypeScript that helps identify and enforce coding style and best practices.
- [Prettier](https://prettier.io/): An opinionated code formatter that automatically formats code according to a predefined style guide.

## Dependencies

- [million](https://www.npmjs.com/package/million)
- [preact](https://www.npmjs.com/package/preact)
- [react](https://www.npmjs.com/package/react)
- [react-dom](https://www.npmjs.com/package/react-dom)
- axios@^1.4.0
- million@^2.4.4
- preact@^10.13.2
- react@^18.2.0
- react-dom@^18.2.0

## Development Dependencies

- [@preact/preset-vite](https://www.npmjs.com/package/@preact/preset-vite) - Preact preset for Vite.
- [sass](https://www.npmjs.com/package/sass) - CSS preprocessor.
- [sass-loader](https://www.npmjs.com/package/sass-loader) - Sass loader for webpack.
- [typescript](https://www.npmjs.com/package/typescript) - Typed JavaScript at Any Scale.
- [vite](https://www.npmjs.com/package/vite) - Next Generation Frontend Tooling.
- vitest@^0.32.0
- @typescript-eslint/eslint-plugin@^5.59.11
- @typescript-eslint/parser@^5.59.11
- @vitest/coverage-v8@^0.32.0
- eslint@^8.42.0

## License

This repository is public and the code is available under an open-source license.

© 2024 Your Mom. All rights reserved.
